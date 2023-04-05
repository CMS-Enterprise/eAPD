import PropTypes from 'prop-types';
import React, { forwardRef, Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

import DollarField from '../../../components/DollarField';
import Dollars from '../../../components/Dollars';
import {
  setPreviousActivityApprovedExpenseForHITandHIE,
  setPreviousActivityFederalActualExpenseForHITandHIE,
  setPreviousActivityFederalActualExpense,
  setPreviousActivityApprovedExpense
} from '../../../redux/actions/editApd';
import { TABLE_HEADERS } from '../../../constants';
import { selectPreviousActivities } from '../../../redux/selectors/apd.selectors';

const schemaRequirements = Joi.number()
  .positive()
  .allow(0)
  .required()
  .messages({
    'number.base': 'Provide a dollar amount greater than or equal to $0',
    'number.empty': 'Provide a dollar amount greater than or equal to $0',
    'number.format': 'Provide a dollar amount greater than or equal to $0',
    'number.positive': 'Provide a dollar amount greater than or equal to $0',
    'number.allow': 'Provide a dollar amount greater than or equal to $0'
  });

const schema = Joi.object().pattern(
  /\d{4}/,
  Joi.object({
    hithie: Joi.object({
      totalApproved: schemaRequirements,
      federalActual: schemaRequirements
    }),
    mmis: Joi.object()
  })
);

const HitechApdPreviousActivityTables = forwardRef(
  (
    {
      isViewOnly,
      previousActivityExpenses,
      setActualMmis,
      setApprovedMmis,
      setActualHitech,
      setApprovedHitech
    },
    ref
  ) => {
    const {
      control,
      formState: { errors },
      setValue,
      trigger
    } = useForm({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: previousActivityExpenses,
      resolver: joiResolver(schema)
    });

    useEffect(() => {
      trigger();
    }, []);

    const years = Object.keys(previousActivityExpenses);

    const getActualsHandler = (
      year,
      value,
      level,
      fundingType,
      activityType
    ) => {
      if (activityType === 'HIT + HIE ') {
        return setActualHitech(year, value);
      }
      if (activityType === 'MMIS ') {
        return setActualMmis(year, value, level, fundingType);
      }
    };

    const getApprovedHandler = (
      year,
      value,
      level,
      fundingType,
      activityType
    ) => {
      if (activityType === 'HIT + HIE ') {
        return setApprovedHitech(year, value);
      }
      if (activityType === 'MMIS ') {
        return setApprovedMmis(year, value, level, fundingType);
      }
    };

    const tables = [
      {
        ffp: 90,
        fundingTypeHeader: 'HIT + HIE ',
        fundingTypeSchema: 'hithie'
      },
      {
        ffp: 90,
        fundingTypeHeader: 'MMIS ',
        fundingTypeSchema: 'mmis'
      },
      {
        ffp: 75,
        fundingTypeHeader: 'MMIS ',
        fundingTypeSchema: 'mmis'
      },
      {
        ffp: 50,
        fundingTypeHeader: 'MMIS ',
        fundingTypeSchema: 'mmis'
      }
    ];

    return (
      <Fragment>
        {tables.map(level => (
          <table
            key={`${level.fundingTypeSchema}${level.ffp}`}
            className="budget-table"
          >
            <caption className="ds-h4">
              {level.fundingTypeHeader}
              {TABLE_HEADERS.federal(level.ffp)}
            </caption>
            <thead>
              <tr>
                <td className="th" aria-hidden="true" />
                <th
                  id={`prev_act_${level.fundingTypeSchema}${level.ffp}_total_approved`}
                  className="ds-u-text-align--right"
                  scope="col"
                >
                  {TABLE_HEADERS.approvedTotal}
                </th>

                <th
                  id={`prev_act_${level.fundingTypeSchema}${level.ffp}_federal_approved`}
                  className="ds-u-text-align--right"
                  scope="col"
                >
                  {TABLE_HEADERS.approved(level.ffp)}
                </th>
                <th
                  id={`prev_act_${level.fundingTypeSchema}${level.ffp}_federal_actual`}
                  className="ds-u-text-align--right"
                  scope="col"
                >
                  {TABLE_HEADERS.actual}
                </th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => {
                let expenses;
                let err;
                if (level.fundingTypeSchema === 'hithie') {
                  expenses =
                    previousActivityExpenses[year][level.fundingTypeSchema];
                  err =
                    errors && errors[`${year}`]
                      ? errors[`${year}`]?.hithie?.totalApproved?.message
                      : '';
                } else {
                  expenses =
                    previousActivityExpenses[year][level.fundingTypeSchema][
                      level.ffp
                    ];
                }

                const federalApproved =
                  (expenses.totalApproved * level.ffp) / 100;

                return (
                  <tr key={year}>
                    <th
                      id={`prev_act_${level.fundingTypeSchema}_row_${year}_${level.ffp}`}
                      scope="row"
                      data-cy="yearRow"
                    >
                      {TABLE_HEADERS.ffy(year)}
                    </th>
                    <td
                      headers={`prev_act_${level.fundingTypeSchema}_row_${year}_${level.ffp}`}
                      className={isViewOnly ? 'budget-table--number' : ''}
                      data-cy={`prev_act_${level.fundingTypeSchema}${level.ffp}_total_approved`}
                    >
                      {isViewOnly ? (
                        <Dollars>{expenses.totalApproved}</Dollars>
                      ) : (
                        <Controller
                          // name={`approved-total-${level.fundingTypeSchema}${level.ffp}-${year}`}
                          name={
                            level.fundingTypeSchema === 'hithie'
                              ? `${year}.hithie.totalApproved`
                              : `${year}.mmis.${level.ffp}.totalApproved`
                          }
                          control={control}
                          render={({ field: { name, ...props } }) => {
                            return (
                              <DollarField
                                {...props}
                                className="budget-table--input-holder"
                                fieldClassName="budget-table--input__number"
                                label={`approved total computable Medicaid funding for ${
                                  level.fundingTypeHeader
                                } at the ${level.ffp}/${
                                  100 - level
                                } level for FFY ${year}, state plus federal`}
                                labelClassName="ds-u-visibility--screen-reader"
                                value={expenses.totalApproved}
                                onChange={e => {
                                  setValue(name, e.target.value, {
                                    shouldValidate: true
                                  });
                                  getApprovedHandler(
                                    year,
                                    e.target.value,
                                    level.ffp,
                                    level.fundingTypeSchema,
                                    level.fundingTypeHeader
                                  );
                                }}
                                errorMessage={err}
                                errorPlacement="bottom"
                              />
                            );
                          }}
                        />
                      )}
                    </td>

                    <td
                      headers={`prev_act_${level.fundingTypeSchema}_row_${year}_${level.ffp}`}
                      className="budget-table--number"
                      data-cy={`prev_act_${level.fundingTypeSchema}${level.ffp}_federal_approved_${year}`}
                    >
                      <Dollars>{federalApproved}</Dollars>
                    </td>

                    <td
                      headers={`prev_act_${level.fundingTypeSchema}_row_${year}_${level.ffp}`}
                      className={isViewOnly ? 'budget-table--number' : ''}
                      data-cy={`prev_act_${level.fundingTypeSchema}${level.ffp}_federal_actual`}
                    >
                      {isViewOnly ? (
                        <Dollars>{expenses.federalActual}</Dollars>
                      ) : (
                        <DollarField
                          className="budget-table--input-holder"
                          fieldClassName="budget-table--input__number"
                          label={`actual ffp expenditures for ${
                            level.fundingTypeHeader
                          } at the ${level.ffp}/${
                            100 - level
                          } level for FFY ${year}`}
                          labelClassName="ds-u-visibility--screen-reader"
                          name={`actual-federal-${level.fundingTypeSchema}${level.ffp}-${year}`}
                          value={expenses.federalActual}
                          onChange={e => {
                            getActualsHandler(
                              year,
                              e.target.value,
                              level.ffp,
                              level.fundingTypeSchema,
                              level.fundingTypeHeader
                            );
                          }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </Fragment>
    );
  }
);

HitechApdPreviousActivityTables.propTypes = {
  isViewOnly: PropTypes.bool,
  previousActivityExpenses: PropTypes.object.isRequired,
  setActualMmis: PropTypes.func.isRequired,
  setApprovedMmis: PropTypes.func.isRequired,
  setActualHitech: PropTypes.func.isRequired,
  setApprovedHitech: PropTypes.func.isRequired
};

HitechApdPreviousActivityTables.defaultProps = {
  isViewOnly: false
};

const mapStateToProps = state => ({
  previousActivityExpenses: selectPreviousActivities(state)
});

const mapDispatchToProps = {
  setActualMmis: setPreviousActivityFederalActualExpense,
  setApprovedMmis: setPreviousActivityApprovedExpense,
  setActualHitech: setPreviousActivityFederalActualExpenseForHITandHIE,
  setApprovedHitech: setPreviousActivityApprovedExpenseForHITandHIE
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HitechApdPreviousActivityTables);

export {
  HitechApdPreviousActivityTables as plain,
  mapStateToProps,
  mapDispatchToProps
};
