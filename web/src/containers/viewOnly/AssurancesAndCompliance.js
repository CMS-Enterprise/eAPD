import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import regLinks from '../../data/assurancesAndCompliance.yaml';
import { selectFederalCitations } from '../../reducers/apd.selectors';
import { t } from '../../i18n';
import {LinkOrText} from '../AssurancesAndCompliance'

const AssurancesAndCompliance = ({ citations }) => {
  return (
    <div>
      <h2>Assurances and Compliance</h2>
      {Object.entries(regLinks).map(([name, regulations]) => (
        <div key={name} className="ds-u-margin-bottom--3">
          <h4 className="ds-h4">
            {t(`assurancesAndCompliance.headings.${name}`)}
          </h4>
          <ul className="ds-c-list--bare">
            {citations[name].map(({ title, checked, explanation }) => (
              <li key={title} className="ds-u-margin--0">
                <div className="ds-u-padding-bottom--1">
                  Does this APD comply with <LinkOrText link={regulations[title]} title={title} />?
                </div>
                {checked && <div><strong>Yes </strong></div> }

                {checked === false &&
                  <div className="ds-l-container ds-u-margin-left--0 ds-u-padding-left--0">
                    <div className="ds-l-row">
                      <div className="ds-l-col--1">
                        <strong>No</strong>
                      </div>
                      <div className="ds-l-col--11" style={{ borderLeft:"3px solid #0071BC", whiteSpace: 'pre-wrap' }}>
                        {explanation || <em>No response was provided</em>}
                      </div>
                    </div>
                  </div>
                }
                {checked === '' && <div><strong>No response was provided</strong></div>}
                <br/>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

AssurancesAndCompliance.propTypes = {
  citations: PropTypes.object.isRequired
};

const mapStateToProps = state => ({ citations: selectFederalCitations(state) });

export default connect(mapStateToProps, null)(AssurancesAndCompliance);
export { AssurancesAndCompliance as plain, mapStateToProps };
