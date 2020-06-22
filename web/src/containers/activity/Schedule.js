import PropTypes from 'prop-types';
import React, { Fragment, useCallback } from 'react';
import { connect } from 'react-redux';

import {
  setActivityEndDate,
  setActivityStartDate
} from '../../actions/editActivity';
import { Subsection } from '../../components/Section';
import DateField from '../../components/DateField';
import { selectActivityByIndex } from '../../reducers/activities.selectors';
import { stateDateToDisplay } from '../../util';

const Schedule = ({ activity, activityIndex, setEndDate, setStartDate }) => {
  const handleActivityStartChange = useCallback((_, dateStr) => {
    setStartDate(activityIndex, dateStr);
  });

  const handleActivityEndChange = useCallback((_, dateStr) => {
    setEndDate(activityIndex, dateStr);
  });

  return (
    <Subsection resource="activities.schedule">
      <Fragment>
        <div className="ds-u-padding-y--0 visibility--screen">
          <DateField
            label="Start date"
            value={activity.plannedStartDate}
            onChange={handleActivityStartChange}
          />
          <DateField
            label="End date"
            value={activity.plannedEndDate}
            onChange={handleActivityEndChange}
          />
        </div>
        <div className="visibility--print">
          <p>
            <strong>Start date:</strong>{' '}
            {stateDateToDisplay(activity.plannedStartDate)}
          </p>
          <p>
            <strong>End date:</strong>{' '}
            {stateDateToDisplay(activity.plannedEndDate)}
          </p>
          <hr />
        </div>
      </Fragment>
    </Subsection>
  );
};

Schedule.propTypes = {
  activity: PropTypes.object.isRequired,
  activityIndex: PropTypes.number.isRequired,
  setEndDate: PropTypes.func.isRequired,
  setStartDate: PropTypes.func.isRequired
};

const mapStateToProps = (state, { activityIndex }) => ({
  activity: selectActivityByIndex(state, { activityIndex })
});

const mapDispatchToProps = {
  setEndDate: setActivityEndDate,
  setStartDate: setActivityStartDate
};

export default connect(mapStateToProps, mapDispatchToProps)(Schedule);

export { Schedule as plain, mapStateToProps, mapDispatchToProps };
