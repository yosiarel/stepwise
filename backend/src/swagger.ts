import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StepWise API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi API untuk platform StepWise',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development Server',
      },
    ],
  },
  apis: [
    path.join(__dirname, 'index.ts'),
    path.join(__dirname, 'routes', '*.ts')
  ], 
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: express.Express) {
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  const port = process.env.PORT || 5000;
  console.log(`Swagger Docs available at http://localhost:${port}/swagger-ui`);
}