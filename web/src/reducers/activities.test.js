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
      totalCost: null,
      years: { 1991: null, 1992: null },
      useHourly: null,
      hourly: {
        1991: { hours: null, rate: null },
        1992: { hours: null, rate: null }
      }
    });
  });

  it('can create a new non-personnel expense', () => {
    expect(newExpense(['1472'])).toEqual({
      key: '--- key ---',
      category: '',
      description: '',
      years: { 1472: 0 }
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
      metrics: []
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
      years: { 8732: { amt: 0, perc: 0 }, bob: { amt: 0, perc: 0 } }
    });
  });

  it('can create a new activity', () => {
    expect(newActivity({ years: ['2020'] })).toEqual({
      alternatives: '',
      contractorResources: [],
      costAllocation: { 2020: { other: 0, ffp: { federal: 0, state: 100 } } },
      costAllocationNarrative: {
        years: {
          2020: { otherSources: '' }
        },
        methodology: ''
      },
      description: '',
      expenses: [],
      fundingSource: null,
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
        2020: {
          1: { inHouse: 25, contractors: 25, combined: 25 },
          2: { inHouse: 25, contractors: 25, combined: 25 },
          3: { inHouse: 25, contractors: 25, combined: 25 },
          4: { inHouse: 25, contractors: 25, combined: 25 }
        }
      },
      years: ['2020'],
      meta: {
        expanded: false
      }
    });
  });
});
