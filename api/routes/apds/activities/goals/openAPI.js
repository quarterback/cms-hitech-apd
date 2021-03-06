const {
  requiresAuth,
  schema: { arrayOf, errorToken, jsonResponse }
} = require('../../../openAPI/helpers');

const openAPI = {
  '/activities/{id}/goals': {
    put: {
      description: 'Set the goals for a specific activity',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the activity to set the goals for',
          required: true
        }
      ],
      requestBody: {
        description: 'The new goals',
        required: true,
        content: jsonResponse(
          arrayOf({
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description:
                  'The description of this goal. Goal is not added if description is missing.'
              },
              objectives: arrayOf({
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description:
                      'The description of the objective associated with this goal'
                  }
                }
              })
            }
          })
        )
      },
      responses: {
        200: {
          description: 'The updated activity',
          content: jsonResponse({ $ref: '#/components/schemas/activity' })
        },
        400: {
          description: 'The goals are invalid (e.g., not an array)',
          content: errorToken
        },
        404: {
          description:
            'The specified activity was not found, or the user does not have access to it'
        }
      }
    }
  }
};

module.exports = requiresAuth(openAPI);
