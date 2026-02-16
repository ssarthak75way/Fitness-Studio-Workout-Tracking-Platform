import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fitness Studio & Workout Tracking Platform API',
            version: '1.0.0',
            description:
                'A full-stack application for fitness studios to publish class schedules, manage member enrollments, and allow users to log workouts.',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'Sarthak Singh',
                url: 'https://github.com/ssarthak75way',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.schema.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
