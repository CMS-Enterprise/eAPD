import PropTypes from 'prop-types';
import { Button } from '@cmsgov/design-system';
import React from 'react';
import { connect } from 'react-redux';
import EditableLabel from 'react-inline-editing';

import { getAPDCreation, getAPDName, getAPDYearRange } from '../reducers/apd';

<<<<<<< HEAD
import Icon, { faEdit } from '../components/Icons';

const ApdHeader = ({ apdName, setName, year }) => {

  return (
    <div>
      <div id='apd-title-container' className='flex-align-row'>
        <div id='editable-label'>
          <EditableLabel
            text={apdName}
            value={apdName}
            labelClassName='ds-h1 apd--title'
            labelWidth='250px'
            inputClassName='ds-h1 apd--title'
            inputWidth='250px'
            inputHeight='46px'
            onFocusOut={text => setName(text)}
          />
        </div>
        <Button id='title-edit-link' class='ds-c-button ds-c-button--transparent' onClick={() => {
          const elements = document.getElementsByClassName('apd--title')
          const first = elements[0]

          first.click();
        }}>
          <Icon icon={faEdit} style={{ width: '14px' }} /> Edit
        </Button>
      </div>
      <h1 className="ds-h5 ds-u-margin-top--1 ds-u-margin-bottom--3">
        HITECH IAPD | FFY {year}
      </h1>
    </div>
  );
};
=======
const ApdHeader = ({ apdName, year }) => (
  <div>
    <EditableLabel 
      text={apdName}
      labelClassName='ds-h1 apd--title'
      inputClassName='ds-h1 apd--title'
      inputWidth='250px'
      inputHeight='46px'
      inputMaxLength='50'
    />
    <h1 className="ds-h4">
      HITECH IAPD | FFY {year}
    </h1>
  </div>
);
>>>>>>> parent of 83033e67 (Editable update state + update front end)

ApdHeader.propTypes = {
  // apdCreated: PropTypes.string.isRequired,
  apdName: PropTypes.string,
  year: PropTypes.string.isRequired
};

ApdHeader.defaultProps = { apdName: '' };

const mapStateToProps = state => ({
  apdCreated: getAPDCreation(state),
  apdName: getAPDName(state),
  year: getAPDYearRange(state)
});

export default connect(mapStateToProps)(ApdHeader);

export { ApdHeader as plain, mapStateToProps };
