import { createSelector } from 'reselect';
import { selectApdData, selectApdYears } from './apd.selectors';
import { stateDateRangeToDisplay, stateDateToDisplay } from '../util';

export const selectActivityByIndex = (
  {
    apd: {
      data: { activities }
    }
  },
  { activityIndex }
) => {
  if (+activityIndex >= 0 && +activityIndex < activities.length) {
    return activities[activityIndex];
  }
  return null;
};

export const selectActivityKeyByIndex = createSelector(
  [selectActivityByIndex],
  ({ key }) => key
);

export const selectAllActivities = ({
  apd: {
    data: { activities }
  }
}) => activities;

const selectBudgetForActivity = ({ budget }, { aKey }) =>
  budget.activities[aKey];

export const selectCostAllocationForActivityByIndex = createSelector(
  selectActivityByIndex,
  ({ costAllocation }) => costAllocation
);

export const selectActivityCostSummary = createSelector(
  selectApdYears,
  selectActivityByIndex,
  (
    // This intermediate selector gets the budget for an activity by index
    // rather than by key.
    {
      apd: {
        data: { activities }
      },
      budget
    },
    { activityIndex }
  ) => budget.activities[activities[activityIndex].key],
  (
    // This intermediate selector maps key personnel into the same data
    // structure as activity state personnel IF AND ONLY IF we are working
    // on the first activity. Key personnel get rolled into the first activity,
    // Program Administration. For other activities, just returns empty arrays.
    {
      apd: {
        data: { keyPersonnel, years }
      }
    },
    { activityIndex }
  ) =>
    years.reduce(
      (o, ffy) => ({
        ...o,
        [ffy]:
          activityIndex === 0
            ? keyPersonnel.map(kp => ({
                description: `${kp.name} (APD Key Personnel)`,
                totalCost: kp.hasCosts ? kp.costs[ffy] : 0,
                unitCost: null,
                units: `${kp.percentTime}% time`
              }))
            : []
      }),
      []
    ),
  (years, activity, budget, keyPersonnel) => {
    const total = {
      federalShare: 0,
      medicaidShare: 0,
      otherFunding: 0,
      stateShare: 0,
      totalCost: 0
    };

    const summary = years.reduce(
      (o, year) => ({
        ...o,
        [year]: {
          contractorResources: activity.contractorResources.map(c => ({
            description: c.name,
            totalCost: c.years[year],
            unitCost: c.hourly.useHourly ? c.hourly.data[year].rate : null,
            units: c.hourly.useHourly
              ? `${c.hourly.data[year].hours} hours`
              : null
          })),
          contractorResourcesTotal: activity.contractorResources.reduce(
            (sum, contractor) => sum + contractor.years[year],
            0
          ),
          federalPercent: 0,
          federalShare: budget.costsByFFY[year].federal,
          keyPersonnel: keyPersonnel[year],
          medicaidShare: budget.costsByFFY[year].medicaidShare,
          nonPersonnel: activity.expenses.map(e => ({
            description: e.category,
            totalCost: e.years[year],
            unitCost: null,
            units: null
          })),
          nonPersonnelTotal: activity.expenses.reduce(
            (sum, expense) => sum + expense.years[year],
            0
          ),
          otherFunding: activity.costAllocation[year].other,
          statePercent: 0,
          statePersonnel: activity.statePersonnel.map(p => ({
            description: p.title,
            totalCost: p.years[year].amt * p.years[year].perc,
            unitCost: p.years[year].amt,
            units: `${p.years[year].perc} FTE`
          })),
          statePersonnelTotal:
            activity.statePersonnel.reduce(
              (sum, personnel) =>
                sum + personnel.years[year].amt * personnel.years[year].perc,
              0
            ) + keyPersonnel[year].reduce((sum, kp) => sum + kp.totalCost, 0),
          stateShare: budget.costsByFFY[year].state,
          totalCost: budget.costsByFFY[year].total
        }
      }),
      {}
    );

    Object.values(summary).forEach(
      ({
        federalShare,
        medicaidShare,
        otherFunding,
        stateShare,
        totalCost
      }) => {
        total.federalShare += federalShare;
        total.medicaidShare += medicaidShare;
        total.otherFunding += otherFunding;
        total.stateShare += stateShare;
        total.totalCost += totalCost;
      }
    );

    return { years: summary, total };
  }
);

export const makeSelectCostAllocateFFPBudget = () =>
  createSelector([selectApdData, selectBudgetForActivity], (apd, budget) => ({
    quarterlyFFP: budget ? budget.quarterlyFFP : null,
    years: apd.years
  }));

export const selectActivitySchedule = createSelector(
  [selectAllActivities],
  apdActivities => {
    const activities = [];

    apdActivities.forEach(
      ({ name, plannedEndDate, plannedStartDate, schedule }) => {
        const milestones = [];
        activities.push({
          dateRange: stateDateRangeToDisplay(plannedStartDate, plannedEndDate),
          end: stateDateToDisplay(plannedEndDate),
          name,
          milestones,
          start: stateDateToDisplay(plannedStartDate)
        });

        schedule.forEach(({ milestone, endDate }) => {
          milestones.push({
            end: stateDateToDisplay(endDate),
            name: milestone,
            start: stateDateToDisplay(plannedStartDate)
          });
        });

        milestones.sort(({ end: endA }, { end: endB }) => {
          const [monthA, dayA, yearA] = endA.split('/');
          const [monthB, dayB, yearB] = endB.split('/');

          if (+yearA > +yearB) {
            return 1;
          }
          if (+yearA < +yearB) {
            return -1;
          }

          if (+monthA > +monthB) {
            return 1;
          }
          if (+monthA < +monthB) {
            return -1;
          }

          if (+dayA > +dayB) {
            return 1;
          }
          if (+dayA < +dayB) {
            return -1;
          }

          return 0;
        });
      }
    );

    return activities;
  }
);

export const selectActivityNonPersonnelCosts = (state, activityIndex) =>
  selectActivityByIndex(state, { activityIndex }).expenses;

export const selectActivityStatePersonnel = (state, { activityIndex }) =>
  selectActivityByIndex(state, { activityIndex }).statePersonnel;

export const selectActivitiesSidebar = createSelector(
  [selectAllActivities],
  activities =>
    activities.map(({ key, name }) => ({
      key,
      anchor: `activity-${key}`,
      name
    }))
);

export const selectContractorsByActivityIndex = (state, { activityIndex }) => {
  const activity = selectActivityByIndex(state, { activityIndex });
  if (activity) {
    return activity.contractorResources;
  }
  return null;
};

export const selectOKRsByActivityIndex = (state, { activityIndex }) => {
  const activity = selectActivityByIndex(state, { activityIndex });
  if (activity) {
    return activity.objectives;
  }
  return null;
};

export const selectGoalsByActivityIndex = (state, { activityIndex }) => {
  const activity = selectActivityByIndex(state, { activityIndex });
  if (activity) {
    return activity.goals;
  }
  return null;
};
