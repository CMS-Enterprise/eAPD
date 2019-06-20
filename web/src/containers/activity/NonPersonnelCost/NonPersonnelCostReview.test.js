import { shallow } from 'enzyme';
import React from 'react';

import NonPersonnelCostReview from './NonPersonnelCostReview';

describe('the NonPersonnelCostReview component', () => {
  const expand = jest.fn();
  const handleDelete = jest.fn();

  const component = shallow(
    <NonPersonnelCostReview
      category="test category"
      desc="test desc"
      expand={expand}
      handleDelete={handleDelete}
      idx={53}
      years={{
        1487: 347293,
        1488: 234797
      }}
    />
  );

  test('renders correctly', () => {
    expect(component).toMatchSnapshot();
  });

  test('triggers the delete event', () => {
    component.find('StandardReview').prop('onDeleteClick')();
    expect(handleDelete).toHaveBeenCalled();
  });

  test('hooks up the expand event', () => {
    expect(component.find('StandardReview').prop('onEditClick')).toEqual(
      expand
    );
  });
});
