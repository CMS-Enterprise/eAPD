const {
  requiresAuth,
  schema: { arrayOf, jsonResponse, errorToken }
} = require('../openAPI/helpers');

const userObj = jsonResponse({
  type: 'object',
  properties: {
    activities: arrayOf({
      type: 'string',
      description: 'Names of system activities this user can perform'
    }),
    id: {
      type: 'number',
      description: `User's unique ID, used internally and for identifying the user when interacting with the API`
    },
    name: {
      type: 'string',
      description: `The user's name, if defined`
    },
    phone: {
      type: 'string',
      description: `The user's phone number, if defined`
    },
    position: {
      type: 'string',
      description: `The user's position, if defined`
    },
    role: {
      type: 'string',
      description: 'Names of system authorization role this user belongs to'
    },
    state: {
      type: 'object',
      description: 'The state/territory/district that this user is assigned to',
      properties: {
        id: {
          type: 'string',
          description: 'Lowercase 2-letter code'
        },
        name: {
          type: 'string',
          description: 'State/territory/district full name'
        }
      }
    },
    username: {
      type: 'string',
      description: `User's unique username (email address)`
    }
  }
});

const openAPI = {
  '/me': {
    get: {
      tags: ['Users'],
      summary: `Gets the current user's information`,
      description: `Get information about the current user`,
      responses: {
        200: {
          description: 'The current user',
          content: userObj
        }
      }
    },
    put: {
      tags: ['Users'],
      summary: `Updates the current user's information`,
      description: `Update information about the current user.  Only the email, name, password, phone, and position fields can be updated.`,
      responses: {
        200: {
          description: 'The current user',
          content: userObj
        },
        400: {
          description: 'Updated information is invalid',
          content: errorToken
        }
      }
    }
  }
};

module.exports = requiresAuth(openAPI, { has401: false });
