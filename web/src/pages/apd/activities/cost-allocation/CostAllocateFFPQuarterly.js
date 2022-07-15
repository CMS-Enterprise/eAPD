import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

import { titleCase } from 'title-case';
import {
  setFFPForContractorCostsForFiscalQuarter,
  setFFPForInHouseCostsForFiscalQuarter
} from '../../../../redux/actions/editActivity';
import { ariaAnnounceFFPQuarterly } from '../../../../redux/actions/aria';
import Dollars from '../../../../components/Dollars';
import PercentField from '../../../../components/PercentField';
import { t } from '../../../../i18n';
import { makeSelectCostAllocateFFPBudget } from '../../../../redux/selectors/activities.selectors';
import { formatPerc } from '../../../../util/formats';

import costAllocateFFPQuarterlySchema from '@cms-eapd/common/schemas/costAllocateFFPQuarterly';

const QUARTERS = [1, 2, 3, 4];
const EXPENSE_NAME_DISPLAY = {
  state: t('activities.costAllocate.quarterly.expenseNames.state'),
  contractors: t('activities.costAllocate.quarterly.expenseNames.contractor'),
  combined: t('activities.costAllocate.quarterly.expenseNames.combined')
};

const CostAllocateFFPQuarterly = ({
  activityIndex,
  aKey,
  announce,
  isViewOnly,
  quarterlyFFP,
  setContractorFFP,
  setInHouseFFP,
  year
}) => {
  // const formData = { ...quarterlyFFP[year] };
  const {
    control,
    formState: { errors, isValid, touchedFields },
    setValue,
    getValues,
    watch,
    getFieldState,
    trigger
  } = useForm({
    defaultValues: {
      formData: { ...quarterlyFFP[year] }
    },
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: joiResolver(costAllocateFFPQuarterlySchema)
    // resolver: async (data, context, options) => {
    //   // you can debug your validation schema here
    //   console.log('formData', data);
    //   console.log(
    //     'validation result',
    //     await joiResolver(costAllocateFFPQuarterlySchema)(
    //       data,
    //       context,
    //       options
    //     )
    //   );
    //   return joiResolver(costAllocateFFPQuarterlySchema)(
    //     data,
    //     context,
    //     options
    //   );
    // }
  });
  const allQuarterFieldsTouched = (touchedFields, rowName) => {
    if (touchedFields?.formData?.length > 0) {
      const countFields = touchedFields.formData.filter(
        item => item[`${rowName}`]
      ).length;
      if (countFields === 4) {
        return true;
      }
      return false;
    }
    return false;
  };

  //   const [validationResults, setValidationResults] = useState();
  //
  //   const customValidation = async () => {
  //     const { error } = await costAllocateFFPQuarterlySchema.validate(
  //       quarterlyFFP[year],
  //       { abortEarly: false }
  //     );
  //     if (error) {
  //       const errorList = error.details.reduce((obj, error) => {
  //         obj[error.path[1]] = error.message;
  //         return obj;
  //       }, {});
  //       setValidationResults(errorList);
  //     }
  //     if (!error) {
  //       setValidationResults({});
  //     }
  //   };

  useEffect(() => {
    setValue('formData.subtotal.inHouse', quarterlyFFP[year].subtotal.inHouse);
    if (allQuarterFieldsTouched(touchedFields, 'inHouse')) {
      trigger('formData.subtotal.inHouse');
    }
  }, [quarterlyFFP[year].subtotal.inHouse]);

  useEffect(() => {
    setValue(
      'formData.subtotal.contractors',
      quarterlyFFP[year].subtotal.contractors
    );
    if (allQuarterFieldsTouched(touchedFields, 'contractors')) {
      trigger('formData.subtotal.contractors');
    }
  }, [quarterlyFFP[year].subtotal.contractors]);

  const setInHouse =
    quarter =>
    ({ target: { value } }) => {
      setValue(`formData[${quarter}].inHouse.percent`, value / 100);
      setInHouseFFP(activityIndex, year, quarter, value);
      announce(aKey, year, quarter, 'inHouse');
    };

  const setContractor =
    quarter =>
    ({ target: { value } }) => {
      setValue(`formData[${quarter}].contractors.percent`, value / 100);
      setContractorFFP(activityIndex, year, quarter, value);
      announce(aKey, year, quarter, 'contractors');
    };

  // Wait until the budget is ready
  if (!quarterlyFFP) {
    return null;
  }

  return (
    <Fragment>
      <table
        className="budget-table"
        key={year}
        data-cy="FFPQuarterBudgetTable"
      >
        <caption className="ds-u-visibility--screen-reader">
          Enter the federal fiscal year {year} quarterly breakdown by
          percentage.
        </caption>
        <thead>
          <tr>
            <th>{titleCase(t('ffy', { year }))}</th>
            <Fragment key={year}>
              {QUARTERS.map(q => (
                <th key={q} scope="col" className="ds-u-text-align--right">
                  {titleCase(t('table.quarter', { q }))}
                </th>
              ))}
              <th
                scope="col"
                className="budget-table--subtotal ds-u-text-align--right"
              >
                {titleCase(t('table.subtotal'))}
              </th>
            </Fragment>
          </tr>
        </thead>
        <tbody>
          <tr
            className={`${
              errors?.formData?.subtotal?.inHouse?.percent
                ? 'table-error-border-no-bottom'
                : ''
            }`}
          >
            <th rowSpan="2" scope="row">
              {titleCase(
                t('activities.costAllocate.quarterly.expenseNames.state')
              )}
            </th>
            {QUARTERS.map(q => (
              <td key={q}>
                {isViewOnly ? (
                  <p className="budget-table--number">
                    {quarterlyFFP[year][q].inHouse.percent * 100} %
                  </p>
                ) : (
                  <Controller
                    control={control}
                    name={`formData[${q}].inHouse.percent`}
                    render={({ field: { onBlur, onChange, ...props } }) => (
                      <PercentField
                        {...props}
                        className="budget-table--input-holder"
                        fieldClassName="budget-table--input__number"
                        label={`federal share for ffy ${year}, quarter ${q}, state`}
                        labelClassName="sr-only"
                        onChange={setInHouse(q)}
                        onBlur={onBlur}
                        round
                        value={quarterlyFFP[year][q].inHouse.percent * 100}
                      />
                    )}
                  />
                )}
              </td>
            ))}
            <td className={`budget-table--number budget-table--subtotal`}>
              {formatPerc(quarterlyFFP[year].subtotal.inHouse.percent)}
            </td>
          </tr>
          <tr
            className={`${
              errors?.formData?.subtotal?.inHouse?.percent
                ? 'table-error-border-no-top'
                : ''
            }`}
          >
            <Fragment key={year}>
              {QUARTERS.map(q => (
                <td className="budget-table--number" key={q} data-cy="subtotal">
                  <Dollars>{quarterlyFFP[year][q].inHouse.dollars}</Dollars>
                </td>
              ))}
              <td className="budget-table--number budget-table--subtotal">
                <Dollars>{quarterlyFFP[year].subtotal.inHouse.dollars}</Dollars>
              </td>
            </Fragment>
          </tr>

          <tr
            className={`${
              errors?.formData?.subtotal?.contractors?.percent
                ? 'table-error-border-no-bottom'
                : ''
            }`}
          >
            <th rowSpan="2" scope="row">
              {titleCase(
                t('activities.costAllocate.quarterly.expenseNames.contractor')
              )}
            </th>
            {QUARTERS.map(q => (
              <td key={q}>
                {isViewOnly ? (
                  <p className="budget-table--number">
                    {quarterlyFFP[year][q].contractors.percent * 100} %
                  </p>
                ) : (
                  <Controller
                    control={control}
                    name={`formData[${q}].contractors.percent`}
                    render={({ field: { onBlur, ...props } }) => (
                      <PercentField
                        {...props}
                        className="budget-table--input-holder"
                        fieldClassName="budget-table--input__number"
                        label={`federal share for ffy ${year}, quarter ${q}, contractors`}
                        labelClassName="sr-only"
                        onChange={setContractor(q)}
                        onBlur={onBlur}
                        round
                        value={quarterlyFFP[year][q].contractors.percent * 100}
                      />
                    )}
                  />
                )}
              </td>
            ))}
            <td className={`budget-table--number budget-table--subtotal`}>
              {formatPerc(quarterlyFFP[year].subtotal.contractors.percent)}
            </td>
          </tr>
          <tr
            className={`${
              errors?.formData?.subtotal?.contractors?.percent
                ? 'table-error-border-no-top'
                : ''
            }`}
          >
            <Fragment key={year}>
              {QUARTERS.map(q => (
                <td className="budget-table--number" key={q} data-cy="subtotal">
                  <Dollars>{quarterlyFFP[year][q].contractors.dollars}</Dollars>
                </td>
              ))}
              <td className="budget-table--number budget-table--subtotal">
                <Dollars>
                  {quarterlyFFP[year].subtotal.contractors.dollars}
                </Dollars>
              </td>
            </Fragment>
          </tr>

          <tr className="budget-table--row__highlight">
            <th scope="row" className="budget-table--total">
              {EXPENSE_NAME_DISPLAY.combined}
            </th>
            <Fragment key={year}>
              {QUARTERS.map(q => (
                <td
                  className="budget-table--number budget-table--total"
                  key={q}
                  data-cy="subtotal"
                >
                  <Dollars>{quarterlyFFP[year][q].combined.dollars}</Dollars>
                </td>
              ))}
              <td className="budget-table--number budget-table--subtotal">
                <Dollars>
                  {quarterlyFFP[year].subtotal.combined.dollars}
                </Dollars>
              </td>
            </Fragment>
          </tr>
        </tbody>
      </table>
      <div>
        {errors && (
          <span
            className="ds-c-inline-error ds-c-field__error-message ds-u-fill--white ds-u-padding-top--1"
            role="alert"
          >
            <div>
              <p className="ds-u-margin--0">
                {errors?.formData?.subtotal?.inHouse?.percent?.message}
              </p>
              <p className="ds-u-margin--0">
                {errors?.formData?.subtotal?.contractors?.percent?.message}
              </p>
            </div>
          </span>
        )}
      </div>
    </Fragment>
  );
};

CostAllocateFFPQuarterly.propTypes = {
  activityIndex: PropTypes.number.isRequired,
  aKey: PropTypes.string.isRequired,
  announce: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool.isRequired,
  quarterlyFFP: PropTypes.object,
  setContractorFFP: PropTypes.func.isRequired,
  setInHouseFFP: PropTypes.func.isRequired,
  year: PropTypes.string.isRequired
};

CostAllocateFFPQuarterly.defaultProps = {
  quarterlyFFP: null
};

const makeMapStateToProps = () => {
  const selectCostAllocateFFPBudget = makeSelectCostAllocateFFPBudget();
  const mapStateToProps = (state, props) =>
    selectCostAllocateFFPBudget(state, props);
  return mapStateToProps;
};

const mapDispatchToProps = {
  announce: ariaAnnounceFFPQuarterly,
  setContractorFFP: setFFPForContractorCostsForFiscalQuarter,
  setInHouseFFP: setFFPForInHouseCostsForFiscalQuarter
};

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(CostAllocateFFPQuarterly);

export {
  CostAllocateFFPQuarterly as plain,
  makeMapStateToProps,
  mapDispatchToProps
};
