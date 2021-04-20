import PropTypes from 'prop-types';
import React from 'react';
import {
  Switch,
  Route,
  useRouteMatch as actualUseRouteMatch
} from 'react-router-dom';

import AlternativeConsiderations from './AlternativeConsiderations';
import ContractorResources from './ContractorResources';
import CostAllocation from './CostAllocation';
import FFP from './CostAllocateFFP';
import Costs from './Costs';
import Milestones from './Milestones';
import Overview from './Overview';
import Schedule from './Schedule';
import StandardsAndConditions from './StandardsAndConditions';

import { Section } from '../../components/Section';

const ActivityRoutes = ({ activityIndex, useRouteMatch }) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      {/* <Route path={`${path}/oms`}>
        <Section>
          <Outcomes activityIndex={activityIndex} />
          <Milestones activityIndex={activityIndex} />
        </Section>
      </Route> */}
      <Route path={`${path}/alternative-considerations`}>
        <Section>
          <AlternativeConsiderations activityIndex={activityIndex} />
        </Section>
      </Route>
      <Route path={`${path}/schedule-milestones`}>
        <Section>
          <Schedule activityIndex={activityIndex} />
          <Milestones activityIndex={activityIndex} />
        </Section>
      </Route>
      <Route path={`${path}/standards-conditions`}>
        <Section>
          <StandardsAndConditions activityIndex={activityIndex} />
        </Section>
      </Route>
      <Route path={`${path}/state-costs`}>
        <Section>
          <Costs activityIndex={activityIndex} />
        </Section>
      </Route>
      <Route path={`${path}/contractor-costs`}>
        <Section>
          <ContractorResources activityIndex={activityIndex} />
        </Section>
      </Route>
      <Route path={`${path}/cost-allocation`}>
        <Section>
          <CostAllocation activityIndex={activityIndex} />
        </Section>
      </Route>
      <Route path={`${path}/ffp`}>
        <Section>
          <FFP activityIndex={activityIndex} />
        </Section>
      </Route>
      <Route>
        <Section>
          <Overview activityIndex={activityIndex} />
        </Section>
      </Route>
    </Switch>
  );
};

ActivityRoutes.defaultProps = {
  useRouteMatch: actualUseRouteMatch
};

ActivityRoutes.propTypes = {
  activityIndex: PropTypes.number.isRequired,
  useRouteMatch: PropTypes.func
};

export default ActivityRoutes;
