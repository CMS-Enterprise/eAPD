import {
  newActivity,
  newContractor,
  newExpense,
  newMilestone,
  newOutcome,
  newOutcomeMetric,
  newStatePerson,
  setKeyGenerator
} from './activities';

describe('activities reducer helpers', () => {
  const generateKey = () => '--- key ---';
  setKeyGenerator(generateKey);

  it('can create a new contractor resource', () => {
    expect(newContractor(['1991', '1992'])).toEqual({
      key: '--- key ---',
      name: '',
      description: '',
      start: '',
      end: '',
      files: [],
      totalCost: 0,
      years: { '1991': 0, '1992': 0 },
      hourly: {
        useHourly: false,
        data: {
          '1991': { hours: '', rate: '' },
          '1992': { hours: '', rate: '' }
        }
      }
    });
  });

  it('can create a new non-personnel expense', () => {
    expect(newExpense(['1472'])).toEqual({
      key: '--- key ---',
      category: 'Hardware, software, and licensing',
      description: '',
      years: { '1472': 0 }
    });
  });

  it('can create a new activity milestone', () => {
    expect(newMilestone()).toEqual({
      key: '--- key ---',
      milestone: '',
      endDate: ''
    });
  });

  it('can create a new activity outcome', () => {
    expect(newOutcome()).toEqual({
      key: '--- key ---',
      outcome: '',
      metrics: [{ key: '--- key ---', metric: '' }]
    });
  });

  it('can create a new activity metric', () => {
    expect(newOutcomeMetric()).toEqual({
      key: '--- key ---',
      metric: ''
    });
  });

  it('can create a new state personnel expense', () => {
    expect(newStatePerson(['8732', 'bob'])).toEqual({
      key: '--- key ---',
      title: '',
      description: '',
      years: { '8732': { amt: '', perc: '' }, bob: { amt: '', perc: '' } }
    });
  });

  it('can create a new activity', () => {
    expect(newActivity({ years: ['2020'] })).toEqual({
      alternatives: '',
      contractorResources: [],
      costAllocation: { '2020': { other: 0, ffp: { federal: 90, state: 10 } } },
      costAllocationNarrative: {
        2020: { otherSources: '' },
        methodology: ''
      },
      description: '',
      expenses: [],
      fundingSource: false,
      key: '--- key ---',
      name: '',
      plannedEndDate: '',
      plannedStartDate: '',
      outcomes: [],
      schedule: [],
      statePersonnel: [],
      summary: '',
      standardsAndConditions: {
        doesNotSupport: '',
        supports: ''
      },
      quarterlyFFP: {
        '2020': {
          '1': { inHouse: 25, contractors: 25, combined: 25 },
          '2': { inHouse: 25, contractors: 25, combined: 25 },
          '3': { inHouse: 25, contractors: 25, combined: 25 },
          '4': { inHouse: 25, contractors: 25, combined: 25 }
        }
      },
      years: ['2020'],
      meta: {
        expanded: false
      }
    });
  });
});
