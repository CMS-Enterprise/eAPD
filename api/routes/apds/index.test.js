const tap = require('tap');
const sinon = require('sinon');

const apdsIndex = require('./index');

tap.test('apds endpoint setup', async endpointTest => {
  const app = {};
  const deleteEndpoint = sinon.spy();
  const filesEndpoints = sinon.spy();
  const getEndpoint = sinon.spy();
  const patchEndpoint = sinon.spy();
  const postEndpoint = sinon.spy();

  apdsIndex(app, {
    deleteEndpoint,
    filesEndpoints,
    getEndpoint,
    patchEndpoint,
    postEndpoint
  });

  endpointTest.ok(
    deleteEndpoint.calledWith(app),
    'apds DELETE endpoint is setup with the app'
  );
  endpointTest.ok(
    getEndpoint.calledWith(app),
    'apds GET endpoint is setup with the app'
  );
  endpointTest.ok(
    patchEndpoint.calledWith(app),
    'apds PATCH endpoint is setup with the app'
  );
  endpointTest.ok(
    postEndpoint.calledWith(app),
    'apds POST endpoint is setup with the app'
  );
  endpointTest.ok(
    filesEndpoints.calledWith(app),
    'apds files endpoints are setup with the app'
  );
});
