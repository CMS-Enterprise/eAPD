const tap = require('tap');
const sinon = require('sinon');
const moment = require('moment');

const {
  apdActivityContractorResource: contractor,
  apdActivityContractorResourceCost: cost,
  apdActivityContractorResourceHourly: hourly
} = require('./contractorResource');

tap.test(
  'contractor resource data model',
  async contractorResourceModelTests => {
    contractorResourceModelTests.test('setup', async setupTests => {
      setupTests.match(
        contractor,
        {
          tableName: 'activity_contractor_resources',
          activity: Function,
          files: Function,
          hourlyData: Function,
          years: Function,
          static: {
            updateableFields: [
              'name',
              'description',
              'end',
              'start',
              'totalCost',
              'useHourly'
            ],
            owns: {
              hourlyData: 'apdActivityContractorResourceHourly',
              years: 'apdActivityContractorResourceCost'
            },
            foreignKey: 'contractor_resource_id'
          }
        },
        'get the expected model definitions'
      );
    });

    contractorResourceModelTests.test(
      'contractor model sets up activity relationship',
      async relationTest => {
        const self = {
          belongsTo: sinon.stub().returns('baz')
        };

        const output = contractor.activity.bind(self)();

        relationTest.ok(
          self.belongsTo.calledWith('apdActivity'),
          'sets up the relationship mapping to an activity'
        );
        relationTest.equal(output, 'baz', 'returns the expected value');
      }
    );

    contractorResourceModelTests.test(
      'contractor model sets up files relationship',
      async test => {
        const self = {
          belongsToMany: sinon.stub().returns('foo')
        };

        const output = contractor.files.bind(self)();

        test.ok(
          self.belongsToMany.calledWith(
            'file',
            'activity_contractor_files',
            'activity_contractor_resource_id',
            'file_id'
          ),
          'sets up the relationship mapping to files'
        );
        test.equal(output, 'foo', 'retuns the expected value');
      }
    );

    contractorResourceModelTests.test(
      'contractor model sets up resource hourly data relationship',
      async relationTest => {
        const self = {
          hasMany: sinon.stub().returns('baz')
        };

        const output = contractor.hourlyData.bind(self)();

        relationTest.ok(
          self.hasMany.calledWith(
            'apdActivityContractorResourceHourly',
            'contractor_resource_id'
          ),
          'sets up the relationship mapping to hourly data'
        );
        relationTest.equal(output, 'baz', 'returns the expected value');
      }
    );

    contractorResourceModelTests.test(
      'contractor model sets up resource cost relationship',
      async relationTest => {
        const self = {
          hasMany: sinon.stub().returns('baz')
        };

        const output = contractor.years.bind(self)();

        relationTest.ok(
          self.hasMany.calledWith(
            'apdActivityContractorResourceCost',
            'contractor_resource_id'
          ),
          'sets up the relationship mapping to years'
        );
        relationTest.equal(output, 'baz', 'returns the expected value');
      }
    );

    contractorResourceModelTests.test('validation', async test => {
      await Promise.all(
        ['end', 'start'].map(async attr => {
          await Promise.all(
            [7, 'bob', 'January 3, 1947', '14 October 1066'].map(
              async invalidValue => {
                try {
                  const self = { attributes: { [attr]: invalidValue } };
                  await contractor.validate.bind(self)();
                  test.fail(`rejects if ${attr} is "${invalidValue}"`);
                } catch (e) {
                  test.pass(`rejects if ${attr} is "${invalidValue}"`);
                }
              }
            )
          );
        })
      );

      const self = {
        attributes: {
          end: '2000-01-01',
          start: '2000-1-1'
        }
      };

      try {
        await contractor.validate.bind(self)();
        test.pass('resolves if all values are valid');
      } catch (e) {
        test.fail('resolves if all values are valid');
      }
    });

    contractorResourceModelTests.test(
      'overrides toJSON method',
      async jsonTests => {
        const self = { get: sinon.stub(), related: sinon.stub() };
        self.get.returns('--- unknown field ---');
        self.get.withArgs('id').returns('id field');
        self.get.withArgs('description').returns('description field');
        self.get.withArgs('end').returns(moment('2002-02-02').toDate());
        self.get.withArgs('name').returns('name field');
        self.get.withArgs('start').returns(moment('2001-01-01').toDate());
        self.get.withArgs('totalCost').returns('total cost');
        self.get.withArgs('useHourly').returns('hooooouuuuurly');
        self.related.withArgs('files').returns('on the floppy disk');
        self.related
          .withArgs('hourlyData')
          .returns('but the actual hourly data is here');
        self.related.withArgs('years').returns('some times');

        const output = contractor.toJSON.bind(self)();

        jsonTests.same(output, {
          description: 'description field',
          end: '2002-02-02',
          files: 'on the floppy disk',
          hourlyData: 'but the actual hourly data is here',
          id: 'id field',
          name: 'name field',
          start: '2001-01-01',
          totalCost: 'total cost',
          useHourly: 'hooooouuuuurly',
          years: 'some times'
        });
      }
    );
  }
);

tap.test(
  'contractor resource cost data model',
  async contractorResourceCostModelTests => {
    contractorResourceCostModelTests.test('setup', async setupTests => {
      setupTests.match(
        cost,
        {
          tableName: 'activity_contractor_resources_yearly',
          contractorResource: Function,
          static: {
            updateableFields: ['year', 'cost']
          }
        },
        'get the expected model definitions'
      );
    });

    contractorResourceCostModelTests.test(
      'expense model sets up contractor resource relationship',
      async relationTest => {
        const self = {
          belongsTo: sinon.stub().returns('baz')
        };

        const output = cost.contractorResource.bind(self)();

        relationTest.ok(
          self.belongsTo.calledWith('apdActivityContractorResource'),
          'sets up the relationship mapping to a contractor resource'
        );
        relationTest.equal(output, 'baz', 'returns the expected value');
      }
    );

    contractorResourceCostModelTests.test(
      'overrides toJSON method',
      async jsonTests => {
        const self = { get: sinon.stub() };
        self.get.returns('--- unknown field ---');
        self.get.withArgs('id').returns('id field');
        self.get.withArgs('cost').returns('cost field');
        self.get.withArgs('year').returns('year field');

        const output = cost.toJSON.bind(self)();

        jsonTests.same(output, {
          id: 'id field',
          cost: 'cost field',
          year: 'year field'
        });
      }
    );
  }
);

tap.test('contractor resource hourly data model', async tests => {
  tests.test('setup', async test => {
    test.match(
      hourly,
      {
        tableName: 'activity_contractor_resources_hourly',
        contractorResource: Function,
        static: {
          updateableFields: ['year', 'hours', 'rate']
        }
      },
      'get the expected model definitions'
    );
  });

  tests.test(
    'expense model sets up contractor resource relationship',
    async test => {
      const self = {
        belongsTo: sinon.stub().returns('baz')
      };

      const output = hourly.contractorResource.bind(self)();

      test.ok(
        self.belongsTo.calledWith('apdActivityContractorResource'),
        'sets up the relationship mapping to a contractor resource'
      );
      test.equal(output, 'baz', 'returns the expected value');
    }
  );

  tests.test('overrides toJSON method', async test => {
    const self = { get: sinon.stub() };
    self.get.returns('--- unknown field ---');
    self.get.withArgs('id').returns('id field');
    self.get.withArgs('hours').returns(123.45);
    self.get.withArgs('rate').returns('54.321');
    self.get.withArgs('year').returns('year field');

    const output = hourly.toJSON.bind(self)();

    test.same(output, {
      id: 'id field',
      hours: 123.45,
      rate: 54.321,
      year: 'year field'
    });
  });
});
