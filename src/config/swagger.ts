import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'API documentation for the URL Shortener service',
    },
    servers: [
      {
        url: 'https://alter-n40w.onrender.com/', 
      },
    ],
  },
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpecs = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerSpecs };
