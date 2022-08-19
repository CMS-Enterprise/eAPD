import {
  getDefaultFundingSourceObject,
  getDefaultFundingSourceByCategoryObject,
  defaultFederalShareByFFYQuarterObject,
  defaultBudgetObject,
  defaultQuarterlyFFPObject,
  defaultActivityTotalsDataObject
} from './budget';

describe('budget getDefault methods', () => {
  describe('getDefaultFundingSourceObject', () => {
    test('with no years', () => {
      const expected = {
        years: {},
        total: { total: 0, federal: 0, medicaid: 0, state: 0 }
      };
      const actual = getDefaultFundingSourceObject();
      expect(actual).toEqual(expected);
    });

    test('with years', () => {
      const expected = {
        years: {
          2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
          2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        total: { total: 0, federal: 0, medicaid: 0, state: 0 }
      };
      const actual = getDefaultFundingSourceObject(['2017', '2018']);
      expect(actual).toEqual(expected);
    });
  });

  describe('getDefaultFundingSourceByCategoryObject', () => {
    test('with no years, no names', () => {
      const expected = {
        statePersonnel: {
          years: {},
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        contractors: {
          years: {},
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        expenses: {
          years: {},
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        combined: {
          years: {},
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        }
      };
      const actual = getDefaultFundingSourceByCategoryObject();
      expect(actual).toEqual(expected);
    });

    test('with years, no names', () => {
      const expected = {
        statePersonnel: {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        contractors: {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        expenses: {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        combined: {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        }
      };
      const actual = getDefaultFundingSourceByCategoryObject([2017, 2018]);
      expect(actual).toEqual(expected);
    });

    test('with years and names', () => {
      const expected = {
        '90-10': {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        '75-25': {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        '50-50': {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        combined: {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        }
      };
      const actual = getDefaultFundingSourceByCategoryObject(
        [2017, 2018],
        ['90-10', '75-25', '50-50', 'combined']
      );
      expect(actual).toEqual(expected);
    });
  });

  describe('defaultFederalShareByFFYQuarterObject', () => {
    test('with no years', () => {
      const expected = {
        years: {},
        total: { inHouse: 0, contractors: 0, combined: 0 }
      };
      const actual = defaultFederalShareByFFYQuarterObject();
      expect(actual).toEqual(expected);
    });

    test('with years', () => {
      const expected = {
        years: {
          2017: {
            1: { inHouse: 0, contractors: 0, combined: 0 },
            2: { inHouse: 0, contractors: 0, combined: 0 },
            3: { inHouse: 0, contractors: 0, combined: 0 },
            4: { inHouse: 0, contractors: 0, combined: 0 },
            subtotal: { inHouse: 0, contractors: 0, combined: 0 }
          },
          2018: {
            1: { inHouse: 0, contractors: 0, combined: 0 },
            2: { inHouse: 0, contractors: 0, combined: 0 },
            3: { inHouse: 0, contractors: 0, combined: 0 },
            4: { inHouse: 0, contractors: 0, combined: 0 },
            subtotal: { inHouse: 0, contractors: 0, combined: 0 }
          }
        },
        total: { inHouse: 0, contractors: 0, combined: 0 }
      };
      const actual = defaultFederalShareByFFYQuarterObject(['2017', '2018']);
      expect(actual).toEqual(expected);
    });
  });

  describe('defaultBudgetObject', () => {
    test('with no years', () => {
      const expected = {
        federalShareByFFYQuarter: {
          hitAndHie: {
            years: {},
            total: { inHouse: 0, contractors: 0, combined: 0 }
          },
          mmis: {
            years: {},
            total: { inHouse: 0, contractors: 0, combined: 0 }
          }
        },
        hie: {
          statePersonnel: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        hit: {
          statePersonnel: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        mmis: {
          statePersonnel: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        hitAndHie: {
          statePersonnel: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        mmisByFFP: {
          '90-10': {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          '75-25': {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          '50-50': {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          '0-100': {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {},
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        combined: {
          years: {},
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        activityTotals: [],
        activities: {},
        years: []
      };
      const actual = defaultBudgetObject();
      expect(actual).toEqual(expected);
    });

    test('with years', () => {
      const expected = {
        federalShareByFFYQuarter: {
          hitAndHie: {
            years: {
              2017: {
                1: { inHouse: 0, contractors: 0, combined: 0 },
                2: { inHouse: 0, contractors: 0, combined: 0 },
                3: { inHouse: 0, contractors: 0, combined: 0 },
                4: { inHouse: 0, contractors: 0, combined: 0 },
                subtotal: { inHouse: 0, contractors: 0, combined: 0 }
              },
              2018: {
                1: { inHouse: 0, contractors: 0, combined: 0 },
                2: { inHouse: 0, contractors: 0, combined: 0 },
                3: { inHouse: 0, contractors: 0, combined: 0 },
                4: { inHouse: 0, contractors: 0, combined: 0 },
                subtotal: { inHouse: 0, contractors: 0, combined: 0 }
              }
            },
            total: { inHouse: 0, contractors: 0, combined: 0 }
          },
          mmis: {
            years: {
              2017: {
                1: { inHouse: 0, contractors: 0, combined: 0 },
                2: { inHouse: 0, contractors: 0, combined: 0 },
                3: { inHouse: 0, contractors: 0, combined: 0 },
                4: { inHouse: 0, contractors: 0, combined: 0 },
                subtotal: { inHouse: 0, contractors: 0, combined: 0 }
              },
              2018: {
                1: { inHouse: 0, contractors: 0, combined: 0 },
                2: { inHouse: 0, contractors: 0, combined: 0 },
                3: { inHouse: 0, contractors: 0, combined: 0 },
                4: { inHouse: 0, contractors: 0, combined: 0 },
                subtotal: { inHouse: 0, contractors: 0, combined: 0 }
              }
            },
            total: { inHouse: 0, contractors: 0, combined: 0 }
          }
        },
        hie: {
          statePersonnel: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        hit: {
          statePersonnel: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        mmis: {
          statePersonnel: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        hitAndHie: {
          statePersonnel: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          contractors: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          expenses: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        mmisByFFP: {
          '90-10': {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          '75-25': {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          '50-50': {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          '0-100': {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          combined: {
            years: {
              2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
              2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
            },
            total: { total: 0, federal: 0, medicaid: 0, state: 0 }
          }
        },
        combined: {
          years: {
            2017: { total: 0, federal: 0, medicaid: 0, state: 0 },
            2018: { total: 0, federal: 0, medicaid: 0, state: 0 }
          },
          total: { total: 0, federal: 0, medicaid: 0, state: 0 }
        },
        activityTotals: [],
        activities: {},
        years: [2017, 2018]
      };
      const actual = defaultBudgetObject([2017, 2018]);
      expect(actual).toEqual(expected);
    });
  });

  describe('defaultQuarterlyFFPObject', () => {
    test('with no years', () => {
      const expected = {
        costsByFFY: {
          years: {},
          total: { federal: 0, medicaid: 0, state: 0, total: 0 }
        },
        quarterlyFFP: {
          years: {},
          total: { combined: 0, contractors: 0, inHouse: 0 }
        }
      };
      const actual = defaultQuarterlyFFPObject();
      expect(actual).toEqual(expected);
    });

    test('with years', () => {
      const expected = {
        costsByFFY: {
          years: {
            2017: { federal: 0, medicaid: 0, state: 0, total: 0 },
            2018: { federal: 0, medicaid: 0, state: 0, total: 0 }
          },
          total: { federal: 0, medicaid: 0, state: 0, total: 0 }
        },
        quarterlyFFP: {
          years: {
            2017: {
              1: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              2: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              3: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              4: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              subtotal: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              }
            },
            2018: {
              1: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              2: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              3: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              4: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              },
              subtotal: {
                combined: { dollars: 0, percent: 0 },
                contractors: { dollars: 0, percent: 0 },
                inHouse: { dollars: 0, percent: 0 }
              }
            }
          },
          total: { combined: 0, contractors: 0, inHouse: 0 }
        }
      };
      const actual = defaultQuarterlyFFPObject([2017, 2018]);
      expect(actual).toEqual(expected);
    });
  });

  describe('defaultActivityTotalsDataObject', () => {
    test('with no years', () => {
      const expected = {
        combined: { years: {}, total: 0 },
        contractors: { years: {}, total: 0 },
        expenses: { years: {}, total: 0 },
        otherFunding: {},
        statePersonnel: { years: {}, total: 0 }
      };
      const actual = defaultActivityTotalsDataObject();
      expect(actual).toEqual(expected);
    });

    test('with years', () => {
      const expected = {
        combined: { years: { 2017: 0, 2018: 0 }, total: 0 },
        contractors: { years: { 2017: 0, 2018: 0 }, total: 0 },
        expenses: { years: { 2017: 0, 2018: 0 }, total: 0 },
        otherFunding: {
          2017: { contractors: 0, expenses: 0, statePersonnel: 0, total: 0 },
          2018: { contractors: 0, expenses: 0, statePersonnel: 0, total: 0 }
        },
        statePersonnel: { years: { 2017: 0, 2018: 0 }, total: 0 }
      };
      const actual = defaultActivityTotalsDataObject([2017, 2018]);
      expect(actual).toEqual(expected);
    });
  });
});
