const crypto = require('crypto');
const dotenv = require('dotenv');

const defaults = {
  PORT: 8000,
  SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  LOG_FILE: 'false',
  LOG_CONSOLE: 'true'
};

// Check if there are any CloudFoundry user-provided services
// offering up environment variables.  If there are, extract
// them and merge them into our environment.
const upsEnv = {};
if (process.env.VCAP_SERVICES) {
  try {
    const vcap = JSON.parse(process.env.VCAP_SERVICES);
    if (Array.isArray(vcap['user-provided'])) {
      vcap['user-provided'].forEach(ups => {
        Object.keys(ups.credentials).forEach(name => {
          upsEnv[name] = ups.credentials[name];
        });
      });
    }
  } catch (e) {} // eslint-disable-line no-empty
}

dotenv.config();
process.env = Object.assign({}, defaults, upsEnv, process.env);
