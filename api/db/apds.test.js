const sinon = require('sinon');
const tap = require('tap');

const {
  createAPD,
  deleteAPDByID,
  getAllAPDsByState,
  getAllSubmittedAPDs,
  updateAPDReviewStatus,
  getAPDByID,
  getAPDByIDAndState,
  updateAPDDocument
} = require('./apds');
const { setup, teardown } = require('./mongodb');
const { APD, Budget } = require('../models/index');
const { apd } = require('../seeds/development/apds');

const nowDate = Date.UTC(1904, 9, 3, 0, 0, 0, 0);
let clock;
let clockStub;
let id;

const deleteAPD = async apdId => {
  const { budget = null } =
    (await APD.findOne({ _id: apdId }, 'budget').lean()) || {};
  await APD.findOneAndDelete({ _id: apdId });
  if (budget) {
    await Budget.findOneAndDelete({ _id: budget });
  }
};

tap.test('database wrappers / apds', async apdsTests => {
  apdsTests.before(async () => {
    // Trisha Elric, Edward and Alfonse's mother, dies of complications from
    // a plague, kicking off the Elric brothers' quest for human transmutation.
    clockStub = sinon.stub(Date, 'now').returns(nowDate);
    await setup();
  });

  apdsTests.beforeEach(async () => {
    if (id) {
      await deleteAPD(id);
      id = null;
    }
    id = await createAPD({
      stateId: 'co',
      status: 'draft',
      ...apd
    });
  });

  apdsTests.afterEach(async () => {
    await deleteAPD(id);
  });

  apdsTests.test('creating an APD', async test => {
    const newId = await createAPD({
      stateId: 'md',
      status: 'draft',
      ...apd
    });
    test.ok(newId, 'APD was created');
    await deleteAPD(newId);
  });

  apdsTests.test('deleting an APD', async test => {
    const result = await deleteAPDByID(id);
    test.equal(result.n, 1, 'one APD was found');
    test.equal(result.nModified, 1, 'one APD was updated');
  });

  apdsTests.test('getting all APDs for a state', async test => {
    const approvedId = await createAPD({
      stateId: 'co',
      status: 'approved',
      ...apd
    });
    const mnId = await createAPD({
      stateId: 'mn',
      status: 'approved',
      ...apd
    });

    const apds = await getAllAPDsByState('co');

    test.ok(apds.length === 1, '1 APD was found');
    test.equal(apds[0]._id.toString(), id, 'the APD was found'); // eslint-disable-line no-underscore-dangle
    await deleteAPD(approvedId);
    await deleteAPD(mnId);
  });

  apdsTests.test('getting all submitted APDs for a state', async test => {
    const coSubmittedId = await createAPD({
      stateId: 'co',
      status: 'submitted',
      ...apd
    });
    const mnSubmittedId = await createAPD({
      stateId: 'mn',
      status: 'submitted',
      ...apd
    });
    const mnDraftId = await createAPD({
      stateId: 'mn',
      status: 'draft',
      ...apd
    });

    const apds = await getAllSubmittedAPDs();

    test.ok(apds.length === 2, '2 APD was found');
    test.ok(
      // eslint-disable-next-line no-underscore-dangle
      apds.findIndex(item => item._id.toString() === coSubmittedId) > -1,
      'the APD was found'
    );
    test.ok(
      // eslint-disable-next-line no-underscore-dangle
      apds.findIndex(item => item._id.toString() === mnSubmittedId) > -1,
      'the APD was found'
    );
    await deleteAPD(coSubmittedId);
    await deleteAPD(mnSubmittedId);
    await deleteAPD(mnDraftId);
  });

  apdsTests.test('empty status update', async test => {
    const coSubmittedId = await createAPD({
      stateId: 'co',
      status: 'submitted',
      ...apd
    });
    const mnSubmittedId = await createAPD({
      stateId: 'mn',
      status: 'submitted',
      ...apd
    });

    const status = await updateAPDReviewStatus();
    test.equal(status.length, 0, 'the empty update was handled');
    await deleteAPD(coSubmittedId);
    await deleteAPD(mnSubmittedId);
  });

  apdsTests.test('updating the status of an APD', async test => {
    const coSubmittedId = await createAPD({
      stateId: 'co',
      status: 'submitted',
      ...apd
    });
    const mnSubmittedId = await createAPD({
      stateId: 'mn',
      status: 'submitted',
      ...apd
    });

    const status = await updateAPDReviewStatus([
      { apdId: coSubmittedId, newStatus: 'approved' }
    ]);
    test.equal(status.length, 1, 'the APD was updated');
    test.equal(status[0].status, 'approved');
    await deleteAPD(coSubmittedId);
    await deleteAPD(mnSubmittedId);
  });

  apdsTests.test('updating the status of two APDs', async test => {
    const coSubmittedId = await createAPD({
      stateId: 'co',
      status: 'submitted',
      ...apd
    });
    const mnSubmittedId = await createAPD({
      stateId: 'mn',
      status: 'submitted',
      ...apd
    });

    const status = await updateAPDReviewStatus([
      { apdId: coSubmittedId, newStatus: 'approved' },
      { apdId: mnSubmittedId, newStatus: 'approved' }
    ]);
    test.equal(status.length, 2, 'the APDs were updated');
    test.equal(status[0].status, 'approved');
    test.equal(status[1].status, 'approved');
    await deleteAPD(coSubmittedId);
    await deleteAPD(mnSubmittedId);
  });

  apdsTests.test('invalid status update', async test => {
    const coSubmittedId = await createAPD({
      stateId: 'co',
      status: 'submitted',
      ...apd
    });
    const mnSubmittedId = await createAPD({
      stateId: 'mn',
      status: 'submitted',
      ...apd
    });

    const status = await updateAPDReviewStatus([
      { apdId: 'bad id', newStatus: 'approved' },
      { apdId: mnSubmittedId, newStatus: 'approved' }
    ]);
    test.equal(status.length, 2, 'the APDs were updated');
    test.equal(status[0].error, 'update failed');
    test.equal(status[1].status, 'approved');
    await deleteAPD(coSubmittedId);
    await deleteAPD(mnSubmittedId);
  });

  apdsTests.test('getting a single APD by ID', async test => {
    const found = await getAPDByID(id);

    test.equal(found._id.toString(), id); // eslint-disable-line no-underscore-dangle
    test.ok(!!found.budget, 'Budget was populated');
  });

  apdsTests.test('getting a single APD by ID for a state', async test => {
    const found = await getAPDByIDAndState(id, 'co');

    test.equal(found._id.toString(), id); // eslint-disable-line no-underscore-dangle
    test.ok(!!found.budget, 'Budget was populated');
  });

  apdsTests.test('updating an APD', async updateAPDDocumentTests => {
    updateAPDDocumentTests.beforeEach(() => {
      clock = sinon.useFakeTimers(nowDate);
    });

    updateAPDDocumentTests.test('with only patch errors', async test => {
      const {
        errors,
        apd: { updatedAt, activities }
      } = await updateAPDDocument(id, 'co', [
        {
          op: 'replace',
          path: '/activities/0/schedule/0/endDate',
          value: '2021-01-36'
        },
        {
          op: 'replace',
          path: '/activities/0/schedule/1/endDate',
          value: '2022-15-31'
        }
      ]);

      test.ok(
        errors['/activities/0/schedule/0/endDate'],
        'found endDate validation error'
      );
      test.ok(
        errors['/activities/0/schedule/1/endDate'],
        'found endDate validation error'
      );
      test.equal(
        activities[0].schedule[0].endDate,
        null,
        'Error in Activity 1, Milestone 1, endDate; it has been set to null'
      );
      test.equal(
        activities[0].schedule[1].endDate,
        null,
        'Error in Activity 1 Milestone 2 endDate; it has been set to null'
      );
      test.equal(
        updatedAt.toJSON(),
        '1904-10-03T00:00:00.000Z',
        'updatedAt was updated'
      );
    });

    updateAPDDocumentTests.test(
      'with patch error and valid patch',
      async test => {
        const {
          errors,
          apd: { updatedAt, activities }
        } = await updateAPDDocument(id, 'co', [
          {
            op: 'replace',
            path: '/activities/0/schedule/0/endDate',
            value: '2021-01-36'
          },
          {
            op: 'replace',
            path: '/activities/0/schedule/0/milestone',
            value: 'Updated milestone'
          }
        ]);

        test.ok(
          errors['/activities/0/schedule/0/endDate'],
          'found endDate validation error'
        );
        test.equal(
          activities[0].schedule[0].endDate,
          null,
          'Error in Activity 1, Milestone 1, endDate; it has been set to null'
        );
        test.equal(
          activities[0].schedule[0].milestone,
          'Updated milestone',
          'Activity 1, Milestone 1, milestone was updated'
        );
        test.equal(
          updatedAt.toJSON(),
          '1904-10-03T00:00:00.000Z',
          'updatedAt was updated'
        );
      }
    );

    updateAPDDocumentTests.test('with a valid patch', async test => {
      const {
        errors,
        apd: {
          updatedAt,
          apdOverview: { programOverview }
        }
      } = await updateAPDDocument(id, 'co', [
        {
          op: 'replace',
          path: `/apdOverview/programOverview`,
          value: 'This is the test of a <a>program overview</a>'
        }
      ]);

      test.equal(Object.keys(errors).length, 0, 'no errors');
      test.equal(updatedAt.toJSON(), '1904-10-03T00:00:00.000Z');
      test.equal(
        programOverview,
        'This is the test of a <a>program overview</a>',
        'programOverview was updated'
      );
    });

    updateAPDDocumentTests.test('without a state profile', async test => {
      const {
        errors,
        apd: { updatedAt },
        stateUpdated
      } = await updateAPDDocument(id, 'co', [
        {
          op: 'replace',
          path: '/activities/0/schedule/1/endDate',
          value: '2022-12-31'
        }
      ]);

      test.equal(Object.keys(errors).length, 0, 'no errors');
      test.equal(updatedAt.toJSON(), '1904-10-03T00:00:00.000Z');
      test.notOk(stateUpdated, 'state was not updated');
    });

    updateAPDDocumentTests.test('with a state profile', async test => {
      const updateProfile = sinon.stub();
      updateProfile
        .withArgs('co', {
          medicaidDirector: {
            name: 'Cornelius Fudge',
            email: 'c.fudge@ministry.magic',
            phone: '5551234567'
          },
          medicaidOffice: {
            address1: '132 Green St',
            address2: '',
            city: 'Cityville',
            state: 'AK',
            zip: '12345'
          },
          years: ['2021', '2022']
        })
        .resolves();

      const {
        errors,
        apd: { updatedAt },
        stateUpdated
      } = await updateAPDDocument(
        id,
        'co',
        [
          {
            op: 'replace',
            path: '/keyStatePersonnel/medicaidOffice/address1',
            value: '132 Green St'
          }
        ],
        { updateProfile }
      );

      test.equal(Object.keys(errors).length, 0, 'no errors');
      test.equal(updatedAt.toJSON(), '1904-10-03T00:00:00.000Z');
      test.ok(stateUpdated, 'state was updated');
    });

    updateAPDDocumentTests.afterEach(async () => {
      clock.restore();
    });
  });

  apdsTests.teardown(async () => {
    if (id) {
      await deleteAPD(id);
      id = null;
    }
    await teardown();
    clockStub.restore();
  });
});
