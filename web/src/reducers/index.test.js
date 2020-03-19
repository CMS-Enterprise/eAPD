import rootReducer from './index';

describe('root reducer', () => {
  test('should have proper state slices', () => {
    const stateKeys = Object.keys(rootReducer({ location: {} })(undefined, {}));
    expect(stateKeys).toEqual([
      'admin',
      'aria',
      'apd',
      'auth',
      'budget',
      'errors',
      'navigation',
      'patch',
      'saving',
      'user',
      'working',
      'router'
    ]);
  });
});
