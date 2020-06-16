import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import Instruction from '../components/Instruction';
import SummaryActivityBreakdownTable from './SummaryActivityBreakdown';
import Dollars from '../components/Dollars';

const categoryLookup = {
  statePersonnel: { title: 'State Staff Total', sortOrder: 0 },
  expenses: { title: 'Other State Expenses Total', sortOrder: 1 },
  contractors: { title: 'Private Contractor Total', sortOrder: 2 },
  combined: { title: 'Total', sortOrder: 3 }
};

const categorySort = (key1, key2) =>
  categoryLookup[key1].sortOrder - categoryLookup[key2].sortOrder;

const DataRow = ({ data, title, groupTitle }) => (
  <tr
    className={
      title === categoryLookup.combined.title
        ? 'budget-table--subtotal budget-table--row__highlight'
        : ''
    }
  >
    <th scope="row" className="title indent-title">
      {title === categoryLookup.combined.title
        ? `${groupTitle} ${title}`
        : title}
    </th>
    <td className="budget-table--number">
      <Dollars>{data.medicaid}</Dollars>
    </td>
  </tr>
);

DataRow.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  groupTitle: PropTypes.string.isRequired
};

const DataRowGroup = ({ data, year, groupTitle }) => (
  <tbody>
    {Object.keys(data)
      .sort(categorySort)
      .map(key => (
        <DataRow
          key={key}
          category={key}
          data={data[key][year]}
          title={categoryLookup[key].title}
          groupTitle={groupTitle}
          year={year}
        />
      ))}
  </tbody>
);

DataRowGroup.propTypes = {
  data: PropTypes.object.isRequired,
  year: PropTypes.string.isRequired,
  groupTitle: PropTypes.string.isRequired
};

const SummaryBudgetByActivityTotals = ({ data, ffy }) => {
  return (
    <table className="budget-table">
      <caption className="ds-u-visibility--screen-reader">
        Combined Activity Costs FFY {ffy} (Total Computable Medicaid Cost)
      </caption>
      <thead>
        <tr className="budget-table--row__primary-header">
          <th scope="col">
            Combined Activity Costs FFY {ffy} (Total Computable Medicaid Cost)
          </th>
          <th scope="col" className="ds-u-text-align--right">
            Total
          </th>
        </tr>
      </thead>
      <thead>
        <tr className="budget-table--row__header">
          <th scope="row" colSpan="2">
            HIT
          </th>
        </tr>
      </thead>
      <DataRowGroup data={data.hit} year={ffy} groupTitle="HIT" />
      <thead>
        <tr className="budget-table--row__header">
          <th scope="row" colSpan="2">
            HIE
          </th>
        </tr>
      </thead>
      <DataRowGroup data={data.hie} year={ffy} groupTitle="HIE" />
      <thead>
        <tr className="budget-table--row__header">
          <th scope="row" colSpan="2">
            MMIS
          </th>
        </tr>
      </thead>
      <DataRowGroup data={data.mmis} year={ffy} groupTitle="MMIS" />
      <thead>
        <tr key={ffy} className="budget-table--row__header">
          <th scope="row">FFY {ffy} Total Computable Medicaid Cost</th>
          <td className="budget-table--number budget-table--total">
            <Dollars>{data.combined[ffy].medicaid}</Dollars>
          </td>
        </tr>
      </thead>
    </table>
  );
};

SummaryBudgetByActivityTotals.propTypes = {
  data: PropTypes.object.isRequired,
  ffy: PropTypes.string.isRequired
};

const SummaryBudgetByActivityBreakdown = ({ data, ffy }) => {
  return data.activityTotals.map((item, index) => (
    <SummaryActivityBreakdownTable
      ffy={ffy}
      activityIndex={index}
      otherFunding={item.data.otherFunding}
    />
  ));
};

SummaryBudgetByActivityBreakdown.propTypes = {
  data: PropTypes.object.isRequired,
  ffy: PropTypes.string.isRequired
};

const SummaryBudgetByActivity = ({ data, years, isViewOnly }) => {
  return years.map(ffy => (
    <Fragment key={ffy}>
      <h4 className="ds-h4" aria-hidden="true">
        FFY {ffy}
      </h4>
      {!isViewOnly && (
        <Instruction source="proposedBudget.summaryBudgetByActivity.totalMedicaidCost" />
      )}
      <SummaryBudgetByActivityTotals data={data} ffy={ffy} />

      <h4 className="ds-h4" aria-hidden="true">
        Activity Breakdown
      </h4>
      {!isViewOnly && (
        <Instruction source="proposedBudget.summaryBudgetByActivity.activityBreakdown" />
      )}
      <SummaryBudgetByActivityBreakdown data={data} ffy={ffy} />
    </Fragment>
  ));
};

SummaryBudgetByActivity.propTypes = {
  data: PropTypes.object.isRequired,
  years: PropTypes.array.isRequired,
  isViewOnly: PropTypes.bool
};

SummaryBudgetByActivity.defaultProps = {
  isViewOnly: false
};

const mapStateToProps = state => ({
  data: state.budget,
  years: state.apd.data.years
});

export default connect(mapStateToProps)(SummaryBudgetByActivity);

export {
  SummaryBudgetByActivity as plain,
  mapStateToProps,
  DataRow,
  DataRowGroup,
  SummaryBudgetByActivityTotals,
  SummaryBudgetByActivityBreakdown
};
