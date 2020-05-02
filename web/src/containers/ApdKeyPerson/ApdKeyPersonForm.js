import { TextField } from '@cmsgov/design-system-core';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import { t } from '../../i18n';
import Choice from '../../components/Choice';
import PersonCostForm from '../../components/PersonCostForm';

import {
  setKeyPersonCost,
  setKeyPersonEmail,
  setKeyPersonHasCosts,
  setKeyPersonName,
  setKeyPersonFTE,
  setKeyPersonRole
} from '../../actions/editApd';

const tRoot = 'apd.stateProfile.keyPersonnel';

const PersonForm = ({
  index,
  item: { costs, email, hasCosts, name, fte, position },
  setCost,
  setEmail,
  setHasCosts,
  setName,
  setRole,
  setTime,
  years
}) => {
  const handleChange = action => ({ target: { value } }) => {
    action(index, value);
  };

  const setPersonHasCosts = newHasCosts => () => {
    setHasCosts(index, newHasCosts);
  };

  const setCostForYear = (year, value) => {
    setCost(index, year, value);
  };

  const setFTEForYear = (year, value) => {
    setTime(index, year, +value);
  };

  const primary = index === 0;

  return (
    <Fragment>
      <h4 className="ds-h4">
        {primary ? 'Primary' : 'Additional'} APD Point of Contact
      </h4>
      <TextField
        autoFocus
        name={`apd-state-profile-pocname${index}`}
        label={t(`${tRoot}.labels.name`)}
        value={name}
        onChange={handleChange(setName)}
      />
      <TextField
        name={`apd-state-profile-pocemail${index}`}
        label={t(`${tRoot}.labels.email`)}
        value={email}
        onChange={handleChange(setEmail)}
      />
      <TextField
        name={`apd-state-profile-pocposition${index}`}
        label={t(`${tRoot}.labels.position`)}
        value={position}
        onChange={handleChange(setRole)}
      />

      <fieldset className="ds-c-fieldset">
        <legend className="ds-c-label">{t(`${tRoot}.labels.hasCosts`)}</legend>
        <Choice
          type="radio"
          name={`apd-state-profile-hascosts-no${index}`}
          value="no"
          checked={!hasCosts}
          onChange={setPersonHasCosts(false)}
        >
          No
        </Choice>
        <Choice
          type="radio"
          name={`apd-state-profile-hascosts-yes${index}`}
          value="yes"
          checked={hasCosts}
          onChange={setPersonHasCosts(true)}
          checkedChildren={
            <PersonCostForm
              items={years.reduce(
                (o, year) => ({
                  ...o,
                  [year]: {
                    amt: costs[year],
                    perc: fte[year]
                  }
                }),
                {}
              )}
              setCost={setCostForYear}
              setFTE={setFTEForYear}
            />
          }
        >
          Yes
        </Choice>
      </fieldset>
    </Fragment>
  );
};
PersonForm.propTypes = {
  index: PropTypes.number.isRequired,
  item: PropTypes.shape({
    costs: PropTypes.object.isRequired,
    email: PropTypes.string.isRequired,
    hasCosts: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    fte: PropTypes.object.isRequired,
    position: PropTypes.string.isRequired
  }).isRequired,
  setCost: PropTypes.func.isRequired,
  setEmail: PropTypes.func.isRequired,
  setHasCosts: PropTypes.func.isRequired,
  setName: PropTypes.func.isRequired,
  setRole: PropTypes.func.isRequired,
  setTime: PropTypes.func.isRequired,
  years: PropTypes.array.isRequired
};

const mapDispatchToProps = {
  setCost: setKeyPersonCost,
  setEmail: setKeyPersonEmail,
  setHasCosts: setKeyPersonHasCosts,
  setName: setKeyPersonName,
  setRole: setKeyPersonRole,
  setTime: setKeyPersonFTE
};

export default connect(null, mapDispatchToProps)(PersonForm);

export { PersonForm as plain, mapDispatchToProps };
