import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ChoiceList } from '@cmsgov/design-system';
import { connect } from 'react-redux';
import DeleteModal from '../components/DeleteModal';

import {
  addYear,
  removeYear,
  setNarrativeForHIE,
  setNarrativeForHIT,
  setNarrativeForMMIS,
  setProgramOverview
} from '../actions/editApd';
import RichText from '../components/RichText';
import Instruction from '../components/Instruction';
import { Section } from '../components/Section';
import { t } from '../i18n';
import { selectSummary } from '../reducers/apd.selectors';

const ApdSummary = ({
  addApdYear,
  narrativeHIE,
  narrativeHIT,
  narrativeMMIS,
  programOverview,
  removeApdYear,
  setHIE,
  setHIT,
  setMMIS,
  setOverview,
  years,
  yearOptions
}) => {
  const [elementDeleteFFY, setElementDeleteFFY] = useState(null);

  const onRemove = () => {
    removeApdYear(elementDeleteFFY.value);
    setElementDeleteFFY(null);
  };

  const onCancel = () => {
    setElementDeleteFFY(null);
    elementDeleteFFY.checked = true;
  }

  const handleYears = e => {
    const year = e.target.value;

    if (e.target.checked === false) {
      setElementDeleteFFY(e.target);
    } else {
      addApdYear(year);
      e.target.checked = true;
    }
  };

  const syncRichText = action => html => {
    action(html);
  };

  const yearChoices = yearOptions.map(year => ({
    defaultChecked: years.includes(year),
    label: year,
    value: year
  }));

  return (
    <Section resource="apd">
      <hr className="custom-hr" />
      <ChoiceList
        choices={yearChoices}
        label={t('apd.overview.instruction.short')}
        labelClassName="ds-u-margin-bottom--1"
        name="apd-years"
        onChange={handleYears}
        type="checkbox"
      />
      <div className="ds-u-margin-y--3">
        <Instruction
          labelFor="program-introduction-field"
          source="apd.introduction.instruction"
        />
        <RichText
          id="program-introduction-field"
          content={programOverview}
          onSync={syncRichText(setOverview)}
          editorClassName="rte-textarea-l"
        />
      </div>
      <div className="ds-u-margin-bottom--3">
        <Instruction
          labelFor="hit-overview-field"
          source="apd.hit.instruction"
        />
        <RichText
          id="hit-overview-field"
          content={narrativeHIT}
          onSync={syncRichText(setHIT)}
          editorClassName="rte-textarea-l"
        />
      </div>
      <div className="ds-u-margin-bottom--3">
        <Instruction
          labelFor="hie-overview-field"
          source="apd.hie.instruction"
        />
        <RichText
          id="hie-overview-field"
          content={narrativeHIE}
          onSync={syncRichText(setHIE)}
          editorClassName="rte-textarea-l"
        />
      </div>
      <div>
        <Instruction
          labelFor="mmis-overview-field"
          source="apd.mmis.instruction"
        />
        <RichText
          id="mmis-overview-field"
          content={narrativeMMIS}
          onSync={syncRichText(setMMIS)}
          editorClassName="rte-textarea-l"
        />
      </div>
      {elementDeleteFFY && (
        <DeleteModal
          objType="FFY"
          onCancel={onCancel}
          onDelete={onRemove}
        />
      )}
    </Section>
  );
};

ApdSummary.propTypes = {
  addApdYear: PropTypes.func.isRequired,
  removeApdYear: PropTypes.func.isRequired,
  narrativeHIE: PropTypes.string.isRequired,
  narrativeHIT: PropTypes.string.isRequired,
  narrativeMMIS: PropTypes.string.isRequired,
  programOverview: PropTypes.string.isRequired,
  setHIE: PropTypes.func.isRequired,
  setHIT: PropTypes.func.isRequired,
  setMMIS: PropTypes.func.isRequired,
  setOverview: PropTypes.func.isRequired,
  years: PropTypes.arrayOf(PropTypes.string).isRequired,
  yearOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};

const mapStateToProps = selectSummary;

const mapDispatchToProps = {
  addApdYear: addYear,
  removeApdYear: removeYear,
  setHIE: setNarrativeForHIE,
  setHIT: setNarrativeForHIT,
  setMMIS: setNarrativeForMMIS,
  setOverview: setProgramOverview
};

export default connect(mapStateToProps, mapDispatchToProps)(ApdSummary);

export { ApdSummary as plain, mapStateToProps, mapDispatchToProps };
