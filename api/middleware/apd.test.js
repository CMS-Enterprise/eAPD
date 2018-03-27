const tap = require('tap');
const sandbox = require('sinon').createSandbox();

const middleware = require('./apd');

const OtherModel = {
  where: sandbox.stub(),
  fetch: sandbox.stub()
};

const res = {
  status: sandbox.stub(),
  send: sandbox.stub(),
  end: sandbox.stub()
};
const next = sandbox.spy();

tap.test('APD-related middleware', async middlewareTests => {
  middlewareTests.beforeEach(done => {
    sandbox.resetBehavior();
    sandbox.resetHistory();

    res.status.returns(res);
    res.send.returns(res);
    res.end.returns(res);

    done();
  });

  middlewareTests.test('load apd', async loadApdTests => {
    loadApdTests.test('from an APD model', async apdModelTest => {
      const apd = { hello: 'world' };
      OtherModel.where.withArgs({ id: 9 }).returns(OtherModel);
      OtherModel.fetch.resolves(apd);

      const req = { meta: {}, params: { 'apd-id': 9 } };
      await middleware.loadApd(OtherModel, 'apd-id', OtherModel)(
        req,
        res,
        next
      );

      apdModelTest.ok(res.status.notCalled, 'HTTP status is not set');
      apdModelTest.ok(res.end.notCalled, 'response is not closed');
      apdModelTest.ok(next.calledOnce, 'next is called');
      apdModelTest.equal(
        req.meta.apd,
        apd,
        'sets the APD on the request object'
      );
    });

    loadApdTests.test('from a non-APD model', async apdModelTest => {
      const apd = { hello: 'world' };
      OtherModel.where.withArgs({ id: 9 }).returns(OtherModel);
      OtherModel.fetch.resolves({
        related: sandbox
          .stub()
          .withArgs('apd')
          .returns(apd)
      });

      const req = { meta: {}, params: { 'apd-id': 9 } };
      await middleware.loadApd(OtherModel, 'apd-id')(req, res, next);

      apdModelTest.ok(res.status.notCalled, 'HTTP status is not set');
      apdModelTest.ok(res.end.notCalled, 'response is not closed');
      apdModelTest.ok(next.calledOnce, 'next is called');
      apdModelTest.equal(
        req.meta.apd,
        apd,
        'sets the APD on the request object'
      );
    });

    loadApdTests.test('fails gracefully', async invalidTest => {
      const req = { meta: {}, params: { 'apd-id': 'bloop' } };
      await middleware.loadApd(null, 'apd-id')(req, res, next);

      invalidTest.ok(res.status.notCalled, 'HTTP status is not set');
      invalidTest.ok(res.end.notCalled, 'response is not closed');
      invalidTest.ok(next.calledOnce, 'next is called');
      invalidTest.notOk(
        req.meta.apd,
        'does not set the APD on the request object'
      );
    });
  });

  middlewareTests.test('require apd', async requireApdTests => {
    requireApdTests.test(
      'sends a 404 if the APD does not load',
      async invalidTest => {
        const req = { meta: {}, params: { 'apd-id': 'florp' } };
        await middleware.requireApd(OtherModel, 'apd-id')(req, res, next);

        invalidTest.ok(res.status.calledWith(404), 'HTTP status is set to 404');
        invalidTest.ok(res.end.calledOnce, 'response is closed');
        invalidTest.ok(next.notCalled, 'next is not called');
      }
    );

    requireApdTests.test('passes if the APD loads', async validTest => {
      OtherModel.where.returns(OtherModel);
      OtherModel.fetch.resolves({ related: sandbox.stub().returns(true) });

      const req = { meta: {}, params: { 'apd-id': 'florp' } };
      await middleware.requireApd(OtherModel, 'apd-id')(req, res, next);

      validTest.ok(res.status.notCalled, 'HTTP status is not set');
      validTest.ok(res.end.notCalled, 'response is not closed');
      validTest.ok(next.calledOnce, 'next is called');
    });
  });

  middlewareTests.test('user can edit apd', async editApdTests => {
    editApdTests.beforeEach(async () => {
      OtherModel.where.returns(OtherModel);
      OtherModel.fetch.resolves({
        related: sandbox.stub().returns({
          get: sandbox
            .stub()
            .withArgs('id')
            .returns('florp')
        })
      });
    });

    editApdTests.test(
      'sends a 404 if the user does not have access to the APD',
      async invalidTest => {
        const req = {
          user: { model: { apds: sandbox.stub().resolves([1, 2, 3]) } },
          meta: {},
          params: { 'apd-id': 'florp' }
        };
        await middleware.userCanEditAPD(OtherModel, 'apd-id')(req, res, next);

        invalidTest.ok(res.status.calledWith(404), 'HTTP status is set to 404');
        invalidTest.ok(res.end.calledOnce, 'response is closed');
        invalidTest.ok(next.notCalled, 'next is not called');
      }
    );

    editApdTests.test(
      'passes if the user has access to the APD',
      async validTest => {
        const req = {
          user: { model: { apds: sandbox.stub().resolves(['florp', 2, 3]) } },
          meta: {},
          params: { 'apd-id': 'florp' }
        };
        await middleware.userCanEditAPD(OtherModel, 'apd-id')(req, res, next);

        validTest.ok(res.status.notCalled, 'HTTP status is not set');
        validTest.ok(res.end.notCalled, 'response is not closed');
        validTest.ok(next.calledOnce, 'next is called');
      }
    );
  });

  middlewareTests.test('load activity', async loadActivityTests => {
    loadActivityTests.test(
      'when there is an error loading the activity',
      async invalidTest => {
        OtherModel.where.withArgs({ id: 7 }).returns(OtherModel);
        OtherModel.fetch.rejects();
        const req = { meta: {}, params: { 'activity-id': 7 } };

        await middleware.loadActivity(OtherModel, 'activity-id')(
          req,
          res,
          next
        );

        invalidTest.ok(res.status.calledWith(500), 'HTTP status is set to 500');
        invalidTest.ok(res.end.calledOnce, 'response is not closed');
        invalidTest.ok(next.notCalled, 'next is called');
      }
    );

    loadActivityTests.test(
      'when the activity does not exist',
      async invalidTest => {
        OtherModel.where.withArgs({ id: 7 }).returns(OtherModel);
        OtherModel.fetch.resolves(false);
        const req = { meta: {}, params: { 'activity-id': 7 } };

        await middleware.loadActivity('activity-id', OtherModel)(
          req,
          res,
          next
        );

        invalidTest.ok(res.status.calledWith(404), 'HTTP status is set to 404');
        invalidTest.ok(res.end.calledOnce, 'response is not closed');
        invalidTest.ok(next.notCalled, 'next is called');
      }
    );

    loadActivityTests.test('when the activity does exist', async validTest => {
      const activity = { hello: 'world' };
      OtherModel.where.withArgs({ id: 7 }).returns(OtherModel);
      OtherModel.fetch.resolves(activity);
      const req = { meta: {}, params: { 'activity-id': 7 } };

      await middleware.loadActivity('activity-id', OtherModel)(req, res, next);

      validTest.ok(res.status.notCalled, 'HTTP status is not set');
      validTest.ok(res.end.notCalled, 'response is not closed');
      validTest.ok(next.calledOnce, 'next is called');
      validTest.equal(
        req.meta.activity,
        activity,
        'sets the activity on the request'
      );
    });
  });
});
