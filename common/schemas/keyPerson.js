import Joi from 'joi';

const schemas = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'Provide a name for the point of contact.',
    'string.empty': 'Provide a name for the point of contact.'
  }),
  email: Joi.string().required().messages({
    'string.base': 'Provide an email address for the point of contact.',
    'string.empty': 'Provide an email address for the point of contact.'
  }),
  position: Joi.string().required().messages({
    'string.base': 'Provide a role for the point of contact.',
    'string.empty': 'Provide a role for the point of contact.'
  }),
  hasCosts: Joi.string().required().messages({
    'string.base': 'Indicate whether or not this person has costs.',
    'string.empty': 'Indicate whether or not this person has costs.'
  }),
  costs: Joi.alternatives().conditional('hasCosts', {
    is: 'yes',
    then: Joi.object().pattern(
      /\d{4}/,
      Joi.number().positive().allow(0).required().messages({
        'number.base': 'Provide a cost with benefits.',
        'number.empty': 'Provide a cost with benefits.',
        'number.format': 'Provide a cost greater than or equal to $0.',
        'number.positive': 'Provide a cost greater than or equal to $0.'
      })
    ),
    otherwise: Joi.any()
  }),
  fte: Joi.alternatives().conditional('hasCosts', {
    is: 'yes',
    then: Joi.object().pattern(
      /\d{4}/,
      Joi.number().positive().required().messages({
        'number.base': 'Provide an FTE.',
        'number.empty': 'Provide an FTE.',
        'number.format': 'Provide a number less than or equal to 1. Provide a number greater than or equal to 0.0001',
        'number.positive': 'Provide a number less than or equal to 1. Provide a number greater than or equal to 0.0001'
      })
    ),
    otherwise: Joi.any()
  })
});

export default schemas;
