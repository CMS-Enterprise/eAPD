const {
  requiresAuth,
  schema: { arrayOf, jsonResponse }
} = require('../openAPI/helpers');

const openAPI = {
  '/activities': {
    get: {
      description: 'Get a list of all activities in the system',
      responses: {
        200: {
          description: 'The list of activities known to the system',
          content: jsonResponse(
            arrayOf({
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Activity ID'
                },
                name: {
                  type: 'string',
                  description: 'Activity name'
                }
              }
            })
          )
        }
      }
    }
  }
};

module.exports = requiresAuth(openAPI);
