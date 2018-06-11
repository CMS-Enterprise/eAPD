import fr from './locales/fr.json';

describe('i18n translations', () => {
  let container;

  const load = () => {
    jest.resetModules();
    container = require('./index'); // eslint-disable-line global-require
    container.I18n = container.default;
    container.I18n.locale = 'en';
  };

  beforeEach(() => load());

  test('t function', () => {
    expect(container.t('title', { place: 'Tortuga', year: 2018 })).toBe(
      '2018 Tortuga HITECH APD'
    );

    expect(container.t('nonsense')).toBe('[missing "en.nonsense" translation]');
  });

  test('t function, debug mode', () => {
    const env = process.env.NODE_ENV;
    const { hash } = window.location;

    process.env.NODE_ENV = 'dev';
    window.location.hash = 'i18n';
    load();

    expect(
      container.t(['i18n', 'resource', 'path'], {
        place: 'Tortuga',
        year: 2018
      })
    ).toBe('[i18n.resource.path]');

    process.env.NODE_ENV = env;
    window.location.hash = hash;
  });

  test('changing locale to one that is supported', () => {
    container.I18n.locale = 'fr';
    expect(container.t('test')).toBe(fr.test);
  });

  test('changing locale to one that is not supported', () => {
    container.I18n.locale = 'pig-latin';
    expect(container.t('test')).toBe('[missing "pig-latin.test" translation]');
  });

  test('sets the default locale', () => {
    const locales = [...container.SUPPORTED_LOCALES];
    container.SUPPORTED_LOCALES.splice(0, container.SUPPORTED_LOCALES.length);
    container.initI18n();
    expect(container.I18n.locale).toBe('en');
    container.SUPPORTED_LOCALES.push(...locales);
  });
});
