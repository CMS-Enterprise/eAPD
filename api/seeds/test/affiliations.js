const { roles } = require('./roles');
const { states } = require('../../util/states');

// affiliate 'all-permissions' user with all states
const { id: adminRoleId } = roles.find(role => role.name === 'eAPD Admin');
const { id: fedAdminRoleId } = roles.find(role => role.name === 'eAPD Federal Admin');
const adminAffiliations = states
  .filter(state => state.id !== 'ak')
  .map(state => ({
    user_id: 'all-permissions',
    state_id: state.id,
    role_id: adminRoleId,
    status: 'approved'
  }));

exports.seed = async knex => {
  await knex('auth_affiliations').insert(adminAffiliations);
  await knex('auth_affiliations').insert([
    {
      id: 4000,
      user_id: 2010,
      state_id: 'ak',
      status: 'requested'
    },
    {
      id: 4001,
      user_id: 2020,
      state_id: 'md',
      role_id: '1107',
      status: 'approved'
    },
    {
      id: 4002,
      user_id: 'all-permissions',
      state_id: 'ak',
      role_id: adminRoleId,
      status: 'approved'
    },
    {
      id: 4003,
      user_id: 'fed-admin',
      state_id: 'fd',
      role_id: fedAdminRoleId,
      status: 'approved'
    }
  ]);
  await knex('okta_users').del();
  await knex('okta_users').insert([
    {
      user_id: 2010,
      email: '2010@email.com',
      metadata: '{}'
    },
    {
      user_id: 2020,
      email: '2020@email.com',
      metadata: '{}'
    },
    {
      user_id: 'all-permissions',
      email: 'all-permissions@email.com',
      metadata: '{}'
    },
    {
      user_id: 'no-permissions',
      email: 'no-permissions@email.com',
      metadata: '{}'
    },
    {
      user_id: 'fed-admin',
      email: 'fedadmin@email.com',
      metadata: '{}'
    },

  ]);

};
