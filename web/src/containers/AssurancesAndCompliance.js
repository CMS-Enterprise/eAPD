import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
  setComplyingWithProcurement,
  setComplyingWithRecordsAccess,
  setComplyingWithSecurity,
  setComplyingWithSoftwareRights,
  setJustificationForProcurement,
  setJustificationForRecordsAccess,
  setJustificationForSecurity,
  setJustificationForSoftwareRights
} from '../actions/editApd';
import Choice from '../components/Choice';
import { Section, Subsection } from '../components/Section';
import TextArea from '../components/TextArea';
import regLinks from '../data/assurancesAndCompliance.yaml';
import { t } from '../i18n';
import { selectFederalCitations } from '../reducers/apd.selectors';
import AlertMissingFFY from '../components/AlertMissingFFY';
import { titleCase } from "title-case";

const namify = (name, title) =>
  `explanation-${name}-${title}`.replace(/\s/g, '_');

const LinkOrText = ({ link, title }) => {
  if (!link) return title;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {title}
    </a>
  );
};

LinkOrText.propTypes = {
  link: PropTypes.string,
  title: PropTypes.string.isRequired
};

LinkOrText.defaultProps = {
  link: null
};

const AssurancesAndCompliance = ({
  citations,
  complyingWithProcurement,
  complyingWithRecordsAccess,
  complyingWithSecurity,
  complyingWithSoftwareRights,
  justificationForProcurement,
  justificationForRecordsAccess,
  justificationForSecurity,
  justificationForSoftwareRights
}) => {
  const handleCheckChange = (section, index, newValue) => () => {
    switch (section) {
      case 'procurement':
        return complyingWithProcurement(index, newValue);
      case 'recordsAccess':
        return complyingWithRecordsAccess(index, newValue);
      case 'security':
        return complyingWithSecurity(index, newValue);
      case 'softwareRights':
        return complyingWithSoftwareRights(index, newValue);
      default:
        return null;
    }
  };

  const handleExplanationChange = (section, index) => ({
    target: { value }
  }) => {
    switch (section) {
      case 'procurement':
        return justificationForProcurement(index, value);
      case 'recordsAccess':
        return justificationForRecordsAccess(index, value);
      case 'security':
        return justificationForSecurity(index, value);
      case 'softwareRights':
        return justificationForSoftwareRights(index, value);
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
    <AlertMissingFFY/>
      <Section id="assurances-compliance" resource="assurancesAndCompliance">
        <Subsection
          id="assurances-compliance-fed-citations"
          resource="assurancesAndCompliance.citations"
        >
          {Object.entries(regLinks).map(([name, regulations]) => (
            <div key={name} className="ds-u-margin-bottom--3">
              <h4 className="ds-h4">
                {titleCase(t(`assurancesAndCompliance.headings.${name}`))}
              </h4>
              {citations[name].map(({ title, checked, explanation }, index) => (
                <fieldset key={title} className="ds-u-margin-top--2">
                  <legend className="ds-c-label">
                    Are you complying with{' '}
                    <strong>
                      <LinkOrText link={regulations[title]} title={title} />
                    </strong>
                    ?
                  </legend>
                  <Choice
                    checked={checked === true}
                    label="Yes"
                    name={`apd-assurances-yes-${namify(name, title)}`}
                    onChange={handleCheckChange(name, index, true)}
                    size="small"
                    type="radio"
                    value="yes"
                  />
                  <Choice
                    checked={checked === false}
                    label="No"
                    name={`apd-assurances-no-${namify(name, title)}`}
                    onChange={handleCheckChange(name, index, false)}
                    size="small"
                    type="radio"
                    value="no"
                    checkedChildren={
                      <div className="ds-c-choice__checkedChild">
                        <TextArea
                          label="Please explain"
                          name={namify(name, title)}
                          value={explanation}
                          onChange={handleExplanationChange(name, index)}
                          rows={5}
                        />
                      </div>
                    }
                  />
                </fieldset>
              ))}
            </div>
          ))}
        </Subsection>
      </Section>
    </React.Fragment>
  );
};

AssurancesAndCompliance.propTypes = {
  citations: PropTypes.object.isRequired,
  complyingWithProcurement: PropTypes.func.isRequired,
  complyingWithRecordsAccess: PropTypes.func.isRequired,
  complyingWithSecurity: PropTypes.func.isRequired,
  complyingWithSoftwareRights: PropTypes.func.isRequired,
  justificationForProcurement: PropTypes.func.isRequired,
  justificationForRecordsAccess: PropTypes.func.isRequired,
  justificationForSecurity: PropTypes.func.isRequired,
  justificationForSoftwareRights: PropTypes.func.isRequired
};

const mapStateToProps = state => ({ citations: selectFederalCitations(state) });

const mapDispatchToProps = {
  complyingWithProcurement: setComplyingWithProcurement,
  complyingWithRecordsAccess: setComplyingWithRecordsAccess,
  complyingWithSecurity: setComplyingWithSecurity,
  complyingWithSoftwareRights: setComplyingWithSoftwareRights,
  justificationForProcurement: setJustificationForProcurement,
  justificationForRecordsAccess: setJustificationForRecordsAccess,
  justificationForSecurity: setJustificationForSecurity,
  justificationForSoftwareRights: setJustificationForSoftwareRights
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AssurancesAndCompliance);
export {
  AssurancesAndCompliance as plain,
  mapStateToProps,
  mapDispatchToProps,
  LinkOrText
};
