const Joi = require('joi').extend(require('@joi/date'));

const scheduleSchema = Joi.object({
  start: Joi.date().format('YYYY-MM-DD').iso().required().messages({
      'date.required': 'Provide a start date.',
      'date.base': 'Provide a start date.',
      'date.empty': 'Provide a start date.',
      'date.format': 'Provide a start date.'
    }),
  end: Joi.date()
    .format('YYYY-MM-DD')
    .iso()
    .min(Joi.ref('start'))
    .required()
    .messages({
      'date.required': 'Provide an end date.',
      'date.base': 'Provide an end date.',
      'date.empty': 'Provide an end date.',
      'date.format': 'Provide an end date.',
      'date.min': 'Provide an end date that is after the start date.',
      'any.ref': 'Provide an end date that is after the start date.'
    })
});

export default scheduleSchema;
