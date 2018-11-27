import activities from './activities';
import apd from './apd';
import assurancesAndCompliance from './assurancesAndCompliance.yaml';
import base from './app.yaml';
import certifyAndSubmit from './certifyAndSubmit.yaml';
import executiveSummary from './executiveSummary.yaml';
import previousActivities from './previousActivities.yaml';
import proposedBudget from './proposedBudget.yaml';
import scheduleSummary from './scheduleSummary.yaml';
import sidebar from './sidebar.yaml';
import stateDashboard from './stateDashboard.yaml';
import storybook from './storybook.yaml';
import table from './table.yaml';

export default {
  ...base,
  activities,
  apd,
  assurancesAndCompliance,
  certifyAndSubmit,
  executiveSummary,
  previousActivities,
  proposedBudget,
  scheduleSummary,
  sidebar,
  stateDashboard,
  storybook,
  table
};
