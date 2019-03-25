import React from 'react';

import { Section, Subsection } from './Section';
import BudgetSummary from '../containers/BudgetSummary';
import IncentivePayments from '../containers/IncentivePayments';
import QuarterlyBudgetSummary from '../containers/QuarterlyBudgetSummary';

const ProposedBudget = () => (
  <Section
    isNumbered
    id="budget"
    resource="proposedBudget"
  >
    <Subsection
      id="budget-summary-table"
      resource="proposedBudget.summaryBudget"
    >
      <BudgetSummary />
    </Subsection>
    <Subsection
      id="budget-federal-by-quarter"
      resource="proposedBudget.quarterlyBudget"
    >
      <QuarterlyBudgetSummary />
    </Subsection>
    <Subsection
      id="budget-incentive-by-quarter"
      resource="proposedBudget.paymentsByFFYQuarter"
    >
      <IncentivePayments />
    </Subsection>
  </Section>
);

export default ProposedBudget;
