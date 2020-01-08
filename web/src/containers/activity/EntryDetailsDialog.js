import { Button, Dialog, Tabs, TabPanel } from '@cmsgov/design-system-core';

import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import ContractorResources from './ContractorResources';
import CostAllocate from './CostAllocate';
import Costs from './Costs';
import Overview from './Overview';
import Goals from './Goals';
import Schedule from './Schedule';
import StandardsAndConditions from './StandardsAndConditions';

const ActivityDialog = props => {
  const { title, activityIndex } = props;
  const [showModal, setShowModal] = useState(true);

  return (
    showModal && (
      <Dialog
        actions={[
          <Button variation="primary" onClick={() => setShowModal(false)}>
            Done
          </Button>
        ]}
        ariaCloseLabel={`Close modal for ${title}`}
        className="ds-c-dialog--full"
        closeButtonVariation="transparent"
        onExit={() => setShowModal(false)}
        title={title}
      >
        <Tabs>
          <TabPanel
            id={`#activity-overview-${activityIndex}`}
            tab="Activity overview"
          >
            <Overview activityIndex={activityIndex} />
            <StandardsAndConditions activityIndex={activityIndex} />
          </TabPanel>
          <TabPanel id={`#activity-goals-${activityIndex}`} tab="Goals">
            <Goals activityIndex={activityIndex} />
            <Schedule activityIndex={activityIndex} />
          </TabPanel>
          <TabPanel
            id={`#activity-cost-categories-${activityIndex}`}
            tab="In-house cost categories"
          >
            <Costs activityIndex={activityIndex} />
          </TabPanel>
          <TabPanel
            id={`#activity-contractor-costs-${activityIndex}`}
            tab="Private contractor costs"
          >
            <ContractorResources activityIndex={activityIndex} />
          </TabPanel>
          <TabPanel
            id={`#activity-cost-allocation-${activityIndex}`}
            tab="Cost allocation"
          >
            <CostAllocate activityIndex={activityIndex} />
          </TabPanel>
        </Tabs>
      </Dialog>
    )
  );
};

ActivityDialog.propTypes = {
  title: PropTypes.string.isRequired,
  activityIndex: PropTypes.number.isRequired
};

export default ActivityDialog;
