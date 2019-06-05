import { shallow } from 'enzyme';
import React from 'react';

import MilestoneReview from './MilestoneReview';

describe('the MilestoneReview component', () => {
  const expand = jest.fn();
  const onDelete = jest.fn();

  const component = shallow(
    <MilestoneReview
      idx={1532}
      endDate="2020-20-20"
      expand={expand}
      name="Milestone name"
      onDelete={onDelete}
    />
  );

  test('renders correctly', () => {
    expect(component).toMatchSnapshot();
  });

  test('triggers the delete event', () => {
    component.find('StandardReview').prop('onDeleteClick')();
    expect(onDelete).toHaveBeenCalledWith(1532);
  });

  test('hooks up the expand event', () => {
    expect(component.find('StandardReview').prop('onEditClick')).toEqual(
      expand
    );
  });
});
