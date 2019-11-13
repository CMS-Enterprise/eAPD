import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DollarField from '../components/DollarField';
import Dollars from '../components/Dollars';
import {
  setPreviousActivityApprovedExpenseForHITandHIE,
  setPreviousActivityFederalActualExpenseForHITandHIE
} from '../actions/editApd';
import { TABLE_HEADERS } from '../constants';

import { selectPreviousHITHIEActivities } from '../reducers/apd.selectors';
import ApdStateProfile from '../components/ApdStateProfilePrint';

const ApdPreviousActivityTable = ({
  isViewOnly,
  previousActivityExpenses,
  setActual,
  setApproved
}) => {
  const years = Object.keys(previousActivityExpenses);

  const getActualsHandler = year => ({ target: { value } }) => {
    setActual(year, value);
  };

  const getApprovedHandler = year => ({ target: { value } }) => {
    setApproved(year, value);
  };

  return (
    <table className="budget-table">
      <caption className="ds-h4">HIT + HIE</caption>
      <thead>
        <tr>
          <th id="prev_act_hit_header_ffy">
            <span className="ds-u-visibility--screen-reader">Year</span>
          </th>
          <th id="prev_act_hithie_total">{TABLE_HEADERS.total}</th>
          <th colSpan="2" id="prev_act_hithie_federal">
            {TABLE_HEADERS.federal()}
          </th>
        </tr>
        <tr>
          <th aria-hidden="true" />
          <th
            id="prev_act_hithie_total_approved"
            className="ds-u-text-align--right"
          >
            {TABLE_HEADERS.approved}
          </th>
          <th
            id="prev_act_hithie_federal_approved"
            className="ds-u-text-align--right"
          >
            {TABLE_HEADERS.approved}
          </th>
          <th
            id="prev_act_hithie_federal_actual"
            className="ds-u-text-align--right"
          >
            {TABLE_HEADERS.actual}
          </th>
        </tr>
      </thead>
      <tbody>
        {years.map(year => {
          const federalApproved =
            previousActivityExpenses[year].totalApproved * 0.9;

          return (
            <tr key={year}>
              <th
                id={`prev_act_hithie_row_${year}`}
                headers="prev_act_hit_header_ffy"
              >
                {TABLE_HEADERS.ffy(year)}
              </th>

              <td
                headers={`prev_act_hithie_row_${year} prev_act_hithie_total prev_act_hithie_total_approved`}
                className={isViewOnly ? 'budget-table--number' : ''}
              >
                {isViewOnly ?
                  <Dollars long>
                    {previousActivityExpenses[year].totalApproved}
                  </Dollars>
                : 
                  <DollarField
                  className="budget-table--input-holder"
                  fieldClassName="budget-table--input__number"
                  label={`total approved funding for HIT and HIE for FFY ${year}, state plus federal`}
                  labelClassName="ds-u-visibility--screen-reader"
                  name={`hithie-approved-total-${year}`}
                  value={previousActivityExpenses[year].totalApproved}
                  onChange={getApprovedHandler(year)}
                  />
                }
              </td>

              <td
                headers={`prev_act_hithie_row_${year} prev_act_hithie_federal prev_act_hithie_federal_approved`}
                className="budget-table--number"
              >
                <Dollars long={isViewOnly}>{federalApproved}</Dollars>
              </td>

              <td
                headers={`prev_act_hithie_row_${year} prev_act_hithie_federal prev_act_hithie_federal_actual`}
                className={isViewOnly ? 'budget-table--number' : ''}
              >
                {isViewOnly ?
                  <Dollars long>
                    {previousActivityExpenses[year].federalActual}
                  </Dollars>
                : 
                  <DollarField
                  className="budget-table--input-holder"
                  fieldClassName="budget-table--input__number"
                  label={`actual federal share for HIT and HIE for FFY ${year}`}
                  labelClassName="ds-u-visibility--screen-reader"
                  name={`hithie-actual-federal-${year}`}
                  value={previousActivityExpenses[year].federalActual}
                  onChange={getActualsHandler(year)}
                  />
                }
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

ApdPreviousActivityTable.propTypes = {
  isViewOnly: PropTypes.bool,
  previousActivityExpenses: PropTypes.object.isRequired,
  setActual: PropTypes.func.isRequired,
  setApproved: PropTypes.func.isRequired
};

ApdPreviousActivityTable.defaultProps = {
  isViewOnly: false
};

const mapStateToProps = state => ({
  previousActivityExpenses: selectPreviousHITHIEActivities(state)
});

const mapDispatchToProps = {
  setActual: setPreviousActivityFederalActualExpenseForHITandHIE,
  setApproved: setPreviousActivityApprovedExpenseForHITandHIE
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApdPreviousActivityTable);

export {
  ApdPreviousActivityTable as plain,
  mapStateToProps,
  mapDispatchToProps
};
