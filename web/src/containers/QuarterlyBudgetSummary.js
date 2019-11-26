import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Dollars from '../components/Dollars';
import { t } from '../i18n';

const FUNDING_SOURCES = [['hitAndHie', 'HIT and HIE'], ['mmis', 'MMIS']];
const QUARTERS = [1, 2, 3, 4];
const EXPENSE_NAME_DISPLAY = {
  state: t('proposedBudget.quarterlyBudget.expenseNames.state'),
  contractors: t('proposedBudget.quarterlyBudget.expenseNames.contractor'),
  combined: t('proposedBudget.quarterlyBudget.expenseNames.combined')
};

const QuarterlyBudgetSummary = ({ budget, isViewOnly, years }) => {
  // wait until budget is loaded
  if (!years.length) return null;

  return (
    <Fragment>
      {FUNDING_SOURCES.map(([source, sourceDisplay]) => {
        const data = budget[source];
        return (
          <Fragment key={source}>
            <h4 className="ds-h4">{sourceDisplay}</h4>
            {years.map(year => (
              <table className="budget-table" key={year}>
                <caption className="ds-u-visibility--screen-reader">
                  {t('ffy', { year })} {sourceDisplay}
                </caption>
                <colgroup>
                  <col className="budget-table--col-header__fixed-width" />
                  <col span="5" />
                </colgroup>
                <thead>
                  <tr>
                    <th>
                      <span aria-hidden="true">{t('ffy', { year })}</span>
                    </th>
                    {QUARTERS.map(q => (
                      <th
                        key={q}
                        className="ds-u-text-align--right"
                        scope="col"
                      >
                        {t('table.quarter', { q })}
                      </th>
                    ))}
                    <th
                      className="ds-u-text-align--right budget-table--subtotal"
                      scope="col"
                    >
                      {t('table.subtotal')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(EXPENSE_NAME_DISPLAY).map(name => (
                    <tr
                      key={name}
                      className={
                        name === 'combined'
                          ? 'budget-table--row__highlight budget-table--total'
                          : ''
                      }
                    >
                      <th scope="row">{EXPENSE_NAME_DISPLAY[name]}</th>
                      {QUARTERS.map(q => (
                        <td className="budget-table--number" key={q}>
                          <Dollars long={isViewOnly}>
                            {data[year][q][name]}
                          </Dollars>
                        </td>
                      ))}
                      <td className="budget-table--number budget-table--subtotal">
                        <Dollars long={isViewOnly}>
                          {data[year].subtotal[name]}
                        </Dollars>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
            <table className="budget-table budget-table--totals">
              <colgroup>
                <col className="budget-table--col-header__fixed-width" />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th colSpan={2}>Total {sourceDisplay}</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(EXPENSE_NAME_DISPLAY).map(name => (
                  <tr
                    className={
                      name === 'combined'
                        ? 'budget-table--row__highlight budget-table--total'
                        : ''
                    }
                    key={name}
                  >
                    <th scope="row">{EXPENSE_NAME_DISPLAY[name]}</th>
                    <td className="budget-table--total budget-table--number">
                      <Dollars long={isViewOnly}>{data.total[name]}</Dollars>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Fragment>
        );
      })}
    </Fragment>
  );
};

QuarterlyBudgetSummary.propTypes = {
  budget: PropTypes.object.isRequired,
  isViewOnly: PropTypes.bool,
  years: PropTypes.array.isRequired
};

QuarterlyBudgetSummary.defaultProps = { isViewOnly: false };

const mapStateToProps = ({ budget, apd }) => ({
  budget: budget.federalShareByFFYQuarter,
  years: apd.data.years
});

export default connect(mapStateToProps)(QuarterlyBudgetSummary);

export { QuarterlyBudgetSummary as plain, mapStateToProps };
