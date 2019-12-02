import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Dollars from '../components/Dollars';
import { TABLE_HEADERS } from '../constants';
import { selectPreviousActivityExpensesTotals } from '../reducers/apd.selectors';

const ApdPreviousActivityTableMMIS = ({ totals, isViewOnly }) => {
  const years = Object.keys(totals);

  return (
    <table className="budget-table budget-table--totals">
      <caption className="ds-h4">
        Grand totals: Federal HIT, HIE, MMIS
      </caption>
      <thead>
        <tr>
          <th id="prev_act_totals_ffy">
            <span className="ds-u-visibility--screen-reader">
                Year
            </span>
          </th>
          <th id="prev_act_total_approved" className="ds-u-text-align--right">FFP Approved</th>

          <th id="prev_act_total_actual" className="ds-u-text-align--right">FFP Actual</th>
        </tr>
      </thead>
      <tbody>
        {years.map(year => {
          const expenses = totals[year];

          return (
            <tr key={year}>
              <th id={`prev_act_total_row_${year}`}>
                {TABLE_HEADERS.ffy(year)}
              </th>
              <td
                headers={`prev_act_total_row_${year} prev_act_total_approved`}
                className="budget-table--number"
              >
                <Dollars long={isViewOnly}>{expenses.approved}</Dollars>
              </td>

              <td
                headers={`prev_act_total_row_${year} prev_act_total_actual`}
                className="budget-table--number"
              >
                <Dollars long={isViewOnly}>{expenses.actual}</Dollars>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

ApdPreviousActivityTableMMIS.propTypes = {
  isViewOnly: PropTypes.bool,
  totals: PropTypes.object.isRequired
};

ApdPreviousActivityTableMMIS.defaultProps = {
  isViewOnly: false
};

const mapStateToProps = state => ({
  totals: selectPreviousActivityExpensesTotals(state)
});

export default connect(
  mapStateToProps,
  null
)(ApdPreviousActivityTableMMIS);

export { ApdPreviousActivityTableMMIS as plain, mapStateToProps };
