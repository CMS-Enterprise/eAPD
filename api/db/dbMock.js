const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const db = sinon.stub();

const reset = () => {
  sandbox.resetBehavior();
  sandbox.resetHistory();
};

const getQueryBuilder = () => ({
  andWhere: sandbox.stub(),
  delete: sandbox.stub(),
  first: sandbox.stub(),
  insert: sandbox.stub(),
  returning: sandbox.stub(),
  select: sandbox.stub(),
  update: sandbox.stub(),
  where: sandbox.stub(),
  whereIn: sandbox.stub(),
  whereRaw: sandbox.stub()
});

const creator = table => {
  const queryBuilder = getQueryBuilder();
  db.withArgs(table).returns(queryBuilder);

  const fn = (...args) => db(...args);
  Object.keys(queryBuilder).forEach(prop => {
    fn[prop] = queryBuilder[prop];
  });

  fn.transaction = async () => {
    fn.commit = async () => {};
    return fn;
  };

  return fn;
};

creator.reset = reset;

module.exports = creator;
