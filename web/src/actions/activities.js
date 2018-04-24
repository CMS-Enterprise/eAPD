export const ADD_ACTIVITY = 'ADD_ACTIVITY';
export const ADD_ACTIVITY_GOAL = 'ADD_ACTIVITY_GOAL';
export const ADD_ACTIVITY_MILESTONE = 'ADD_ACTIVITY_MILESTONE';
export const REMOVE_ACTIVITY = 'REMOVE_ACTIVITY';
export const REMOVE_ACTIVITY_MILESTONE = 'REMOVE_ACTIVITY_MILESTONE';
export const UPDATE_ACTIVITY = 'UPDATE_ACTIVITY';

export const addActivity = () => ({ type: ADD_ACTIVITY });

export const addActivityGoal = id => ({ type: ADD_ACTIVITY_GOAL, id });

export const addActivityMilestone = id => ({
  type: ADD_ACTIVITY_MILESTONE,
  id
});

export const removeActivity = id => ({ type: REMOVE_ACTIVITY, id });

export const removeActivityMilestone = (id, milestoneIdx) => ({
  type: REMOVE_ACTIVITY_MILESTONE,
  id,
  milestoneIdx
});

export const updateActivity = (id, updates) => ({
  type: UPDATE_ACTIVITY,
  id,
  updates
});
