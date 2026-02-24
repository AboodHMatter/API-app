const swaggerJSDoc = require('swagger-jsdoc');
const env = require('../config/env');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Learning App API',
            version: '1.0.0',
            description: 'Enterprise-level API for managing online courses and users.',
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Local development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'refreshToken'
                }
            }
        }
    },
    apis: ['./controllers/*.js'] // Path to the API controllers for docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
