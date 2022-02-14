import { DateField as DSDateField } from '@cmsgov/design-system';
import moment from 'moment';
import formatISO from 'date-fns/formatISO';
import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';

const DateField = ({ value, onChange, ...rest }) => {
  const [errorInfo, setErrorInfo] = useState({
    errorMessage: [],
    dayInvalid: false,
    monthInvalid: false,
    yearInvalid: false
  });

  const dateParts = () => {
    if (!value) {
      return {
        day: '',
        month: '',
        year: ''
      };
    }
    const [year, month, day] = value.slice(0, 10).split('-');
    return { day: day || '', month: month || '', year: +year || '' };
  }

  const dateStr = (dateObject) => {
    const date = formatISO(new Date(dateObject.year, dateObject.month - 1, dateObject.day), { representation: 'date' })
    return date;
  }

  const getErrorMsg = () => {
    const date = moment(value, 'YYYY-M-D', true);
    if (value === null || value === undefined || value.length === 0) {
      return;
    }

    if (date.isValid()) {
      setErrorInfo({
        errorMessage: [],
        dayInvalid: false,
        monthInvalid: false,
        yearInvalid: false
      });
      return;
    }

    const message = [];
    let dayInvalid = false;
    let monthInvalid = false;
    let yearInvalid = false;

    if (!value.month) {
      message.push('Month is required.');
      monthInvalid = true;
    }
    if (value.month > 12) {
      message.push('Month must be between 1 and 12.');
      monthInvalid = true;
    }

    if (!value.day) {
      message.push('Day is required.');
      dayInvalid = true;
    }
    if (value.day > 31) {
      message.push('Day must be less than 31.');
      dayInvalid = true;
    }

    if (`${value.year}`.length !== 4) {
      message.push('Year must be 4 digits.');
      yearInvalid = true;
    }

    if (message.length === 0) {
      message.push(
        'Invalid date - is the day number too high for the provided month and year?'
      );
    }

    setErrorInfo({
      errorMessage: message.join(' '),
      dayInvalid,
      monthInvalid,
      yearInvalid
    });
  };

  return (
    <DSDateField
      {...rest}
      {...errorInfo}
      dayValue={dateParts.day}
      monthValue={dateParts.month}
      yearValue={dateParts.year}
      onChange={(_, dateObject) => {
        onChange(_, dateStr(dateObject))
      }}
      onComponentBlur={getErrorMsg}
      errorPlacement='bottom'
    />
  );
};

DateField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default DateField;
