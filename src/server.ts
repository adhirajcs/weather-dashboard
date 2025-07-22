import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import fetch from 'node-fetch';
import { environment } from './environments/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Weather API endpoint
 * Forwards requests to the OpenWeather API after adding the API key from the environment variables.
 */
app.get('/api/weather', (req, res) => {
  const location = req.query['location'];
  const apiKey = process.env['WEATHER_API_KEY'] || environment.WEATHER_API_KEY;
  const baseUrl = process.env['WEATHER_API_BASE_URL'] || environment.WEATHER_API_BASE_URL;

  // Forward request to OpenWeather without exposing the API key to clients
  fetch(
    `${baseUrl}?q=${location}&units=metric&appid=${apiKey}`,
  )
    .then( async (response) => {
      // Store the status code before parsing JSON
      const status = response.status;
      return response.json().then((data) => {
        // Return both the data and the status
        return { data, status };
      });
    })
    .then((result) => {
      // Check if the response indicates an error
      if (result.status !== 200) {
        // Forward the same status code and error message
        return res.status(result.status).json({
          message: (result.data as any)?.message || 'Location not found. Please try again.',
        });
      }
      // Success response
      return res.json(result.data);
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    });
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
