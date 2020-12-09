const {
  requiresAuth,
  schema: { arrayOf, jsonResponse }
} = require('../openAPI/helpers');

const id = {
  type: 'integer',
  description: 'Integer ID for a role'
};

const name = {
  type: 'string',
  description: 'Full name of the Role'
};

const roleSchema = {
  type: 'object',
  properties: {
    id,
    name
  }
};

const getRoles = {
  '/roles': {
    get: {
      tags: ['Roles'],
      description: 'Get a list of all of the active roles',
      responses: {
        200: {
          description: 'List of Active Roles',
          content: jsonResponse(arrayOf(roleSchema))
        }
      }
    }
  }
};

module.exports = {
  ...requiresAuth(getRoles, { has403: false })
};
