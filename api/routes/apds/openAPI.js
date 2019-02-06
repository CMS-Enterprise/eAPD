const {
  requiresAuth,
  schema: { arrayOf, errorToken, jsonResponse }
} = require('../openAPI/helpers');

const openAPI = {
  '/apds': {
    get: {
      tags: ['APDs'],
      summary: 'Get all of the APDs available to the user',
      description: 'Get a list of all apds associated with requesting user',
      responses: {
        200: {
          description: 'The list of a user’s apds',
          content: jsonResponse(
            arrayOf({
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'APD ID'
                },
                years: arrayOf({
                  type: 'number'
                })
              }
            })
          )
        }
      }
    },
    post: {
      tags: ['APDs'],
      summary: `Create a new draft APD associated with the user's state`,
      description: `Create a new draft APD for the current user's state`,
      responses: {
        200: {
          description: 'The new APD',
          content: jsonResponse({ $ref: '#/components/schemas/apd' })
        }
      }
    }
  },

  '/apds/{id}': {
    get: {
      tags: ['APDs'],
      summary: 'Get a single, complete APD',
      description:
        'Where the /apds GET method only returns a small portion of all APDs, this method returns all of one',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the apd to get',
          required: true,
          schema: {
            type: 'number'
          }
        }
      ],
      responses: {
        200: {
          description: 'The APD',
          content: jsonResponse({ $ref: '#/components/schemas/apd' })
        },
        404: {
          description: 'The apd ID does not match any known apds for the user'
        }
      }
    },
    put: {
      tags: ['APDs'],
      summary: 'Update a specific APD',
      description: `Update an APD in the system.  If state profile information is included, the profile information is also updated for the user's state.`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the apd to update',
          required: true,
          schema: {
            type: 'number'
          }
        }
      ],
      requestBody: {
        description: 'The new values for the apd.  All fields are optional.',
        required: true,
        content: jsonResponse({ $ref: '#/components/schemas/apd' })
      },
      responses: {
        200: {
          description: 'The update was successful',
          content: jsonResponse({ $ref: '#/components/schemas/apd' })
        },
        404: {
          description: 'The apd ID does not match any known apds for the user'
        }
      }
    }
  },

  '/apds/{id}/status': {
    put: {
      tags: ['APDs'],
      summary: 'Set an APD status',
      description:
        'An endpoint for CMS analysts to change an APD status after it has been submitted.  The APD cannot currently be in draft status, or else this method will fail with an HTTP 400 error.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the APD to update',
          required: true,
          schema: { type: 'number' }
        }
      ],
      requestBody: {
        description: 'The status value to set',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  description: 'New status to set'
                }
              }
            }
          }
        }
      },
      responses: {
        204: {
          description: 'The APD status was successfully set'
        },
        400: {
          description:
            'The APD is currently in draft, or the selected status is invalid',
          content: errorToken
        },
        404: {
          description: 'The apd ID does not match any known apds'
        }
      }
    }
  },

  '/apds/submitted': {
    get: {
      tags: ['APDs'],
      summary: 'Get all of the submitted APDs (i.e., not draft)',
      description: 'Get a list of all submitted APDs known to the system',
      responses: {
        200: {
          description: 'The list of submitted APDs',
          content: jsonResponse(arrayOf({ $ref: '#/components/schemas/apd' }))
        }
      }
    }
  },

  '/apds/{id}/versions': {
    delete: {
      tags: ['APDs'],
      summary: 'Withdraw a submitted APD',
      description:
        'Withdraws a previous submitted APD and makes it editable again',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the APD to update',
          required: true,
          schema: { type: 'number' }
        }
      ],
      responses: {
        204: {
          description: 'The withdrawal was successful'
        }
      }
    },
    post: {
      tags: ['APDs'],
      summary: 'Save a submitted version of a specific APD',
      description:
        'Create a new saved version of an APD and makes the APD non-draft so it cannot be edited',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the APD to update',
          required: true,
          schema: { type: 'number' }
        }
      ],
      requestBody: {
        description:
          'Additional data to save with the APD.  For example, computed values that the state has certified.',
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                tables: {
                  type: 'object',
                  description: 'Computed data tables'
                }
              }
            }
          }
        }
      },
      responses: {
        204: {
          description: 'The save was successful'
        },
        400: {
          description:
            'The APD is not currently in draft status, so it cannot be saved. Error is { error: "apd-not-editable" }',
          content: errorToken
        }
      }
    }
  }
};

module.exports = requiresAuth(openAPI);
