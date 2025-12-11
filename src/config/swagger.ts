import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Habit Tracker API',
      version: '1.0.0',
      description: 'Personal Habit Tracking & Streak Management REST API',
    },
    servers: [
      {
        url: 'http://localhost:5000',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            token: { type: 'string' },
          },
        },
        Habit: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            frequency: { type: 'string', enum: ['daily', 'weekly'] },
            streak: { type: 'number' },
            longestStreak: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            reminderTime: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        TrackingLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            habit: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            completed: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            400: { description: 'User already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: { description: 'Invalid email or password' },
          },
        },
      },
      '/api/habits': {
        get: {
          tags: ['Habits'],
          summary: 'Get all habits for logged-in user',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Page number' },
            { name: 'tag', in: 'query', schema: { type: 'string' }, description: 'Filter by tag' },
          ],
          responses: {
            200: {
              description: 'List of habits',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      habits: { type: 'array', items: { $ref: '#/components/schemas/Habit' } },
                      page: { type: 'number' },
                      pages: { type: 'number' },
                    },
                  },
                },
              },
            },
            401: { description: 'Not authorized' },
          },
        },
        post: {
          tags: ['Habits'],
          summary: 'Create a new habit',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'frequency'],
                  properties: {
                    title: { type: 'string', example: 'Exercise' },
                    description: { type: 'string', example: 'Daily workout' },
                    frequency: { type: 'string', enum: ['daily', 'weekly'], example: 'daily' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['health'] },
                    reminderTime: { type: 'string', example: '07:00' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Habit created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Habit' },
                },
              },
            },
            401: { description: 'Not authorized' },
          },
        },
      },
      '/api/habits/{id}': {
        get: {
          tags: ['Habits'],
          summary: 'Get a specific habit',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Habit details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Habit' } } } },
            404: { description: 'Habit not found' },
          },
        },
        put: {
          tags: ['Habits'],
          summary: 'Update a habit',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    frequency: { type: 'string', enum: ['daily', 'weekly'] },
                    tags: { type: 'array', items: { type: 'string' } },
                    reminderTime: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Habit updated' },
            404: { description: 'Habit not found' },
          },
        },
        delete: {
          tags: ['Habits'],
          summary: 'Delete a habit',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Habit removed' },
            404: { description: 'Habit not found' },
          },
        },
      },
      '/api/habits/{id}/track': {
        post: {
          tags: ['Tracking'],
          summary: 'Mark habit as completed for today',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            201: {
              description: 'Habit tracked',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      log: { $ref: '#/components/schemas/TrackingLog' },
                      streak: { type: 'number' },
                      longestStreak: { type: 'number' },
                    },
                  },
                },
              },
            },
            400: { description: 'Habit already tracked for today' },
          },
        },
      },
      '/api/habits/{id}/history': {
        get: {
          tags: ['Tracking'],
          summary: 'Get last 7 days of tracking history',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Tracking history',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/TrackingLog' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
