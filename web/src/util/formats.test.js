import { fmt, formatNum, formatDec, formatMoney, formatPerc } from './formats';

describe('formatting util', () => {
  test('supports generic number formatting', () => {
    expect(fmt(30000, '.4f')).toEqual('30000.0000');
    expect(fmt(30000)).toEqual('30,000.00');
    expect(fmt(NaN)).toEqual('--');
  });

  test('formats integers', () => {
    expect(formatNum(30)).toEqual('30');
    expect(formatNum(30.112)).toEqual('30');
  });

  test('formats decimal numbers', () => {
    expect(formatDec(3000.1234)).toEqual('3,000.12');
    expect(formatDec(3000.1234, 3)).toEqual('3,000.123');
  });

  test('formats money as US dollars', () => {
    expect(formatMoney(3000.1234)).toEqual('$3,000');
    expect(formatMoney(3000.1234, 2)).toEqual('$3,000.12');
    expect(formatMoney(999999)).toEqual('$999,999');
    expect(formatMoney(1234567)).toEqual('$1.23M');
    expect(formatMoney(1200000)).toEqual('$1.2M');

    // Make sure we convert from SI prefixes to currency initialisms
    expect(formatMoney(1230000000)).toEqual('$1.23B');
    expect(formatMoney(1230000000000)).toEqual('$1.23T');
    expect(formatMoney(1230000000000000)).toEqual('$1.23Q');

    expect(formatMoney('hello')).toEqual('--');
  });

  test('formats percents', () => {
    expect(formatPerc(0.2575)).toEqual('+26%');
    expect(formatPerc(-0.35)).toEqual('-35%');
    expect(formatPerc(0.1234, 1)).toEqual('+12.3%');
  });
});
