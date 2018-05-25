const tap = require('tap');

tap.beforeEach(done => {
  delete require.cache[require.resolve('./env')];
  process.env = {};
  done();
});

tap.test('environment setup', async envTest => {
  const knownEnvironmentVariables = [
    { name: 'PORT', type: 'number' },
    { name: 'SESSION_SECRET', type: 'string' },
    { name: 'NODE_ENV', type: 'string' },
    { name: 'LOG_LEVEL', type: 'string' },
    { name: 'LOG_FILE', type: 'string' },
    { name: 'LOG_CONSOLE', type: 'string' }
  ];

  envTest.test(
    'sets default values for known environment variables',
    async test => {
      require('./env'); // eslint-disable-line global-require
      knownEnvironmentVariables.forEach(envVar => {
        test.type(
          process.env[envVar.name],
          envVar.type,
          `sets the ${envVar.name} to a ${envVar.type}`
        );
      });
    }
  );

  envTest.test(
    'reads environment variables from CF user-provided services',
    async test => {
      process.env.VCAP_SERVICES = JSON.stringify({
        'user-provided': [
          {
            credentials: {
              VCAP_VAR1: 'var1',
              VCAP_VAR2: 'var2'
            }
          }
        ]
      });
      require('./env'); // eslint-disable-line global-require
      test.match(
        process.env,
        { VCAP_VAR1: 'var1', VCAP_VAR2: 'var2' },
        'sets variables from CF user-provided service'
      );
    }
  );

  envTest.test(
    'does not override environment variables that have been set externally',
    async test => {
      knownEnvironmentVariables.forEach(envVar => {
        process.env[envVar.name] = 'test-value';
      });

      process.env.VCAP_SERVICES = JSON.stringify({
        'user-provided': [
          {
            credentials: knownEnvironmentVariables.reduce(
              (obj, env) => ({ ...obj, [env.name]: 'from cf ' }),
              {}
            )
          }
        ]
      });

      require('./env'); // eslint-disable-line global-require
      knownEnvironmentVariables.forEach(envVar => {
        test.same(
          process.env[envVar.name],
          'test-value',
          `does not override the ${envVar.name} variable`
        );
      });
    }
  );
});
