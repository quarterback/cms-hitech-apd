const {
  requiresAuth,
  schema: { arrayOf, jsonResponse, errorToken }
} = require('../openAPI/helpers');

const userObjectSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      description: "User's unique ID"
    },
    email: {
      type: 'string',
      format: 'email',
      description: "User's email address"
    }
  }
};

const openAPI = {
  '/users': {
    get: {
      description: 'Get a list of all users in the system',
      responses: {
        200: {
          description: 'The list of users known to the system',
          content: jsonResponse(arrayOf(userObjectSchema))
        }
      }
    },
    post: {
      description: 'Add a new user to the system',
      parameters: [
        {
          name: 'email',
          in: 'body',
          type: 'string',
          format: 'email',
          description: "The new user's email address",
          required: true
        },
        {
          name: 'password',
          in: 'body',
          type: 'string',
          description: "The new user's password",
          required: true
        }
      ],
      responses: {
        200: {
          description: 'The user was successfully added'
        },
        400: {
          description:
            'Invalid user submitted, such as email address already exists or password is weak',
          content: errorToken
        }
      }
    }
  },
  '/users/{id}': {
    delete: {
      description: 'Delete a user from the system',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the user to delete',
          required: true
        }
      ],
      responses: {
        204: {
          description: 'The user was successfully deleted'
        },
        400: {
          description: 'The provided user ID was invalid'
        },
        404: {
          description: 'The user ID does not match any known users'
        }
      }
    },
    get: {
      description: 'Get a specific user in the system',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the user to fetch',
          required: true
        }
      ],
      responses: {
        200: {
          description: 'The matching user',
          content: jsonResponse(userObjectSchema)
        },
        404: {
          description: 'The user ID does not match any known users',
          content: errorToken
        }
      }
    }
  }
};

module.exports = requiresAuth(openAPI);
