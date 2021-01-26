const tap = require('tap');
const sinon = require('sinon');
const endpointIndex = require('./index');

tap.test('endpoint setup', async endpointTest => {
  const app = {
    get: sinon.spy()
  };
  const res = {
    send: sinon.spy()
  };

  const affiliationsEndpoint = sinon.spy();
  const apdsEndpoint = sinon.spy();
  const authEndpoint = sinon.spy();
  const docsEndpoint = sinon.spy();
  const meEndpoint = sinon.spy();
  const rolesEndpoint = sinon.spy();
  const statesEndpoint = sinon.spy();
  const usersEndpoint = sinon.spy();
  const openAPI = {};

  endpointIndex(
    app,
    affiliationsEndpoint,
    apdsEndpoint,
    authEndpoint,
    docsEndpoint,
    meEndpoint,
    rolesEndpoint,
    statesEndpoint,
    usersEndpoint,
    {}
  );

  endpointTest.ok(
    affiliationsEndpoint.calledWith(app),
    'affiliations endpoint is set up with the app'
  );
  endpointTest.ok(
    apdsEndpoint.calledWith(app),
    'apds endpoint is setup with the app'
  );
  endpointTest.ok(
    authEndpoint.calledWith(app),
    'auth endpoint is setup with the app'
  );
  endpointTest.ok(
    docsEndpoint.calledWith(app),
    'docs endpoint is set up with the app'
  );
  endpointTest.ok(
    meEndpoint.calledWith(app),
    'me endpoint is setup with the app'
  );
  endpointTest.ok(
    rolesEndpoint.calledWith(app),
    'roles endpoint is set up with the app'
  );
  endpointTest.ok(
    statesEndpoint.calledWith(app),
    'states endpoint is set up with the app'
  );
  endpointTest.ok(
    usersEndpoint.calledWith(app),
    'users endpoint is setup with the app'
  );

  endpointTest.ok(
    app.get.calledWith('/open-api', sinon.match.func),
    'sets up an endpoint to fetch OpenAPI spec'
  );

  endpointTest.test(
    'OpenAPI handler returns expected documentation',
    async openAPItest => {
      const openAPIHandler = app.get.args.filter(
        arg => arg[0] === '/open-api'
      )[0][1];

      openAPIHandler({}, res);

      openAPItest.ok(
        res.send.calledWith(openAPI),
        'sends back OpenAPI documentation'
      );
    }
  );
});
