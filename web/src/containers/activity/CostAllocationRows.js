import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import Dollars from '../../components/Dollars';

export const CostSummaryRows = ({ items }) =>
  items.map(({ description, totalCost, unitCost, units }) => (
    <tr key={description}>
      <td className="title">{description}</td>
      <td className="budget-table--number">
        {unitCost !== null && <Dollars>{unitCost}</Dollars>}
      </td>
      <td className="budget-table--number ds-u-padding--0">
        {unitCost !== null && '×'}
      </td>
      <td className="budget-table--number ds-u-text-align--left">{units}</td>
      <td className="budget-table--number">{unitCost !== null && '='}</td>
      <td className="budget-table--number">
        <Dollars>{totalCost}</Dollars>
      </td>
    </tr>
  ));

CostSummaryRows.propTypes = {
  items: PropTypes.array.isRequired
};

const CostAllocationRows = ({ years, ffy, otherFunding }) => (
  <Fragment>
    {otherFunding && (
      <tr className="budget-table--row__header">
        <th scope="row" colSpan="6">
          State Staff
        </th>
      </tr>
    )}
    {!otherFunding && (
      <tr className="budget-table--row__header">
        <th scope="col">State Staff</th>
        <th scope="col" colSpan="2">
          <span className="sr-only">unit cost</span>
        </th>
        <th scope="col" colSpan="2">
          <span className="sr-only">units</span>
        </th>
        <th scope="col">Total cost</th>
      </tr>
    )}
    <CostSummaryRows items={years[ffy].keyPersonnel} />
    <CostSummaryRows items={years[ffy].statePersonnel} />
    {otherFunding && (
      <tr>
        <td className="title">Other Funding Amount</td>
        <td className="budget-table--number" colSpan="4"></td>
        <td className="budget-table--number">
          <Dollars>{otherFunding[ffy].statePersonnel}</Dollars>
        </td>
      </tr>
    )}
    <tr className="budget-table--subtotal budget-table--row__highlight">
      <td className="title" colSpan="5">
        State Staff Subtotal
      </td>
      <td className="budget-table--number">
        <Dollars>
          {otherFunding
            ? years[ffy].statePersonnelTotal - otherFunding[ffy].statePersonnel
            : years[ffy].statePersonnelTotal}
        </Dollars>
      </td>
    </tr>
    <tr className="budget-table--row__header">
      <th scope="col" colSpan="6">
        Other State Expenses
      </th>
    </tr>
    <CostSummaryRows items={years[ffy].nonPersonnel} />
    {otherFunding && (
      <tr>
        <td className="title">Other Funding Amount</td>
        <td className="budget-table--number" colSpan="4"></td>
        <td className="budget-table--number">
          <Dollars>{otherFunding[ffy].expenses}</Dollars>
        </td>
      </tr>
    )}
    <tr className="budget-table--subtotal budget-table--row__highlight">
      <td className="title" colSpan="5">
        Other State Expenses Subtotal
      </td>
      <td className="budget-table--number">
        <Dollars>
          {otherFunding
            ? years[ffy].nonPersonnelTotal - otherFunding[ffy].expenses
            : years[ffy].nonPersonnelTotal}
        </Dollars>
      </td>
    </tr>
    <tr className="budget-table--row__header">
      <th scope="col" colSpan="6">
        Private Contractor
      </th>
    </tr>
    <CostSummaryRows items={years[ffy].contractorResources} />
    {otherFunding && (
      <tr>
        <td className="title">Other Funding Amount</td>
        <td className="budget-table--number" colSpan="4"></td>
        <td className="budget-table--number">
          <Dollars>{otherFunding[ffy].contractors}</Dollars>
        </td>
      </tr>
    )}
    <tr className="budget-table--subtotal budget-table--row__highlight">
      <td className="title" colSpan="5">
        Private Contractor Subtotal
      </td>
      <td className="budget-table--number">
        <Dollars>
          {otherFunding
            ? years[ffy].contractorResourcesTotal -
              otherFunding[ffy].contractors
            : years[ffy].contractorResourcesTotal}
        </Dollars>
      </td>
    </tr>
    <tr className="budget-table--subtotal">
      <td colSpan="5">Activity Total Cost</td>
      <td className="budget-table--number">
        <Dollars>
          {otherFunding
            ? years[ffy].totalCost - otherFunding[ffy].total
            : years[ffy].totalCost}
        </Dollars>
      </td>
    </tr>{' '}
  </Fragment>
);

CostAllocationRows.propTypes = {
  years: PropTypes.object.isRequired,
  ffy: PropTypes.string.isRequired
};

export default CostAllocationRows;
