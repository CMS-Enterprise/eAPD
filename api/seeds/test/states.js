exports.seed = async knex => {
  await knex
    .table('states')
    .where({ id: 'mn' })
    .update({
      medicaid_office: JSON.stringify({
        address1: '100 Round Sq',
        city: 'Cityville',
        zip: '12345',
        state: 'Minnesota',
        director: {
          name: 'Cornelius Fudge',
          email: 'c.fudge@ministry.magic',
          phone: '5551234567'
        }
      }),
      state_pocs: JSON.stringify([
        {
          name: 'Corinne Johnson',
          email: 'corinne@thatplace',
          position: 'Head of Muggle Studies'
        }
      ])
    });
};
