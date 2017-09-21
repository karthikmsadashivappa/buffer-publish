import {
  actions as dataFetchActions,
  actionTypes as dataFetchActionTypes,
} from '@bufferapp/async-data-fetch';
import { actions as notificationActions } from '@bufferapp/notifications';
import { actionTypes } from './reducer';

const transformScheduleForApi = (unformattedSchedule, action) => {
  if (!Array.isArray(unformattedSchedule)) return [];

  unformattedSchedule.forEach((scheduleItem) => {
    if (scheduleItem.days.includes(action.dayName)) {
      scheduleItem.times[action.timeIndex] = `${action.hours}:${action.minutes}`;
    }
  });

  return unformattedSchedule;
};

export default ({ dispatch, getState }) => next => (action) => {
  next(action);
  switch (action.type) {
    case actionTypes.UPDATE_SCHEDULE_TIME:
      dispatch(dataFetchActions.fetch({
        name: 'updateSchedule',
        args: {
          profileId: action.profileId,
          schedules: transformScheduleForApi(getState().settings.schedules, action),
        },
      }));
      break;
    case `updateSchedule_${dataFetchActionTypes.FETCH_SUCCESS}`:
      dispatch(notificationActions.createNotification({
        notificationType: 'success',
        message: 'Awesome! Your schedule has been successfully saved.',
      }));
      break;
    case `updateSchedule_${dataFetchActionTypes.FETCH_FAIL}`:
      dispatch(notificationActions.createNotification({
        notificationType: 'error',
        message: action.error,
      }));
      break;
    default:
      break;
  }
};
