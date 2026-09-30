import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PathConnect API',
      version: '1.0.0',
      description: 'Mentorship platform API — connects mentees with mentors using AI-powered matching, session management, and career advisory.',
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            data: { type: 'null' },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firebaseUid: { type: 'string' },
            email: { type: 'string', format: 'email' },
            displayName: { type: 'string' },
            photoUrl: { type: 'string', format: 'uri' },
            role: { type: 'string', enum: ['MENTOR', 'MENTEE', 'ADMIN'] },
            currentPosition: { type: 'string' },
            targetRole: { type: 'string' },
            bio: { type: 'string' },
            weekStreak: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            mentorProfile: { $ref: '#/components/schemas/MentorProfile' },
          },
        },
        MentorProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            expertise: { type: 'array', items: { type: 'string' } },
            industry: { type: 'string' },
            yearsExperience: { type: 'integer' },
            availability: { type: 'array', items: { type: 'string' } },
            bio: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MentorWithUser: {
          allOf: [
            { $ref: '#/components/schemas/MentorProfile' },
            {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
              },
            },
          ],
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            menteeId: { type: 'string', format: 'uuid' },
            mentorId: { type: 'string', format: 'uuid' },
            score: { type: 'number', minimum: 0, maximum: 100 },
            reason: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            mentee: { $ref: '#/components/schemas/User' },
            mentor: { $ref: '#/components/schemas/User' },
          },
        },
        Session: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            menteeId: { type: 'string', format: 'uuid' },
            mentorId: { type: 'string', format: 'uuid' },
            matchId: { type: 'string', format: 'uuid' },
            scheduledAt: { type: 'string', format: 'date-time' },
            duration: { type: 'integer', minimum: 15, maximum: 180, description: 'Duration in minutes' },
            type: { type: 'string', enum: ['VIDEO', 'AUDIO', 'IN_PERSON'] },
            status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
            meetingLink: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SessionDetail: {
          allOf: [
            { $ref: '#/components/schemas/Session' },
            {
              type: 'object',
              properties: {
                mentee: { $ref: '#/components/schemas/User' },
                mentor: { $ref: '#/components/schemas/User' },
                summary: { $ref: '#/components/schemas/SessionSummary' },
                actionItems: { type: 'array', items: { $ref: '#/components/schemas/ActionItem' } },
                notes: { type: 'array', items: { $ref: '#/components/schemas/SessionNote' } },
              },
            },
          ],
        },
        SessionSummary: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sessionId: { type: 'string', format: 'uuid' },
            conversationSummary: { type: 'string' },
            keyTopics: { type: 'array', items: { type: 'string' } },
            keyInsights: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ActionItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sessionId: { type: 'string', format: 'uuid' },
            assigneeId: { type: 'string', format: 'uuid' },
            description: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['PENDING', 'COMPLETED'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SessionNote: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sessionId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            content: { type: 'string', maxLength: 10000 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Goal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            planId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            title: { type: 'string', maxLength: 500 },
            description: { type: 'string', maxLength: 2000 },
            period: { type: 'string', enum: ['THIRTY_DAY', 'SIXTY_DAY', 'NINETY_DAY'] },
            status: { type: 'string', enum: ['PENDING', 'ON_TRACK', 'ACHIEVED', 'NEEDS_UPDATE'] },
            isAiSuggested: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
