import { Button, Review } from '@cmsgov/design-system-core';
import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { selectActivityByIndex } from '../../reducers/activities.selectors';
import { removeActivity } from '../../actions/editActivity';
import ActivityDialog from './EntryDetailsDialog';

import { t } from '../../i18n';

const makeTitle = ({ name, fundingSource }, i) => {
  let title = `${t('activities.namePrefix')} ${i}`;
  if (name) {
    title += `: ${name}`;
  } else {
    title += `: New Activity`;
  }
  if (fundingSource) {
    title += ` (${fundingSource})`;
  }
  return title;
};

const EntryDetails = ({
  activityIndex,
  fundingSource,
  activityKey,
  name,
  remove
}) => {
  const container = useRef();

  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const onRemove = () => {
    remove(activityIndex);
  };

  const title = useMemo(
    () => makeTitle({ name, fundingSource }, activityIndex + 1),
    [fundingSource, name, activityIndex]
  );

  const editContent = (
    <div className="nowrap visibility--screen">
      <Button size="small" variation="transparent" onClick={onRemove}>
        Delete
      </Button>
      <Button
        size="small"
        variation="transparent"
        onClick={() => setShowModal(true)}
      >
        Edit
      </Button>
    </div>
  );

  return (
    <div
      id={`activity-${activityKey}`}
      className={`activity--body activity--body__${
        activityIndex === 0 ? 'first' : 'notfirst'
      }`}
      ref={container}
    >
      <Review heading={title} headingLevel={4} editContent={editContent}>
        {[
          /* children are required, so send an empty array to suppress errors */
        ]}
      </Review>
      {showModal && (
        <ActivityDialog
          title={title}
          activityIndex={activityIndex}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

EntryDetails.propTypes = {
  activityIndex: PropTypes.number.isRequired,
  activityKey: PropTypes.string.isRequired,
  fundingSource: PropTypes.string.isRequired,
  name: PropTypes.string,
  remove: PropTypes.func.isRequired
};

EntryDetails.defaultProps = {
  name: ''
};

const mapStateToProps = (state, { activityIndex }) => {
  const { fundingSource, key, name } = selectActivityByIndex(state, {
    activityIndex
  });
  return { activityKey: key, fundingSource, name };
};

const mapDispatchToProps = {
  remove: removeActivity
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EntryDetails);

export { EntryDetails as plain, mapStateToProps, mapDispatchToProps };
