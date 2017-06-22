import deepFreeze from 'deep-freeze';
import reducer, {
  actions,
  actionTypes,
} from './reducer';

describe('reducer', () => {
  it('should return initial state', () => {
    const stateAfter = {};
    const action = {
      type: 'INIT',
    };
    deepFreeze(action);
    expect(reducer(undefined, action))
      .toEqual(stateAfter);
  });

  it('should handle LOGIN_SUCCESS action', () => {
    const sessionToken = 'session token';
    const stateBefore = {};
    const stateAfter = {
      sessionToken,
    };
    const action = {
      type: actionTypes.LOGIN_SUCCESS,
      sessionToken,
    };
    deepFreeze(action);
    deepFreeze(stateBefore);
    deepFreeze(stateAfter);
    expect(reducer(stateBefore, action))
      .toEqual(stateAfter);
  });

  it('should handle LOGOUT action', () => {
    const sessionToken = 'session token';
    const stateBefore = {
      sessionToken,
    };
    const stateAfter = {};
    const action = {
      type: actionTypes.LOGOUT,
    };
    deepFreeze(action);
    deepFreeze(stateBefore);
    deepFreeze(stateAfter);
    expect(reducer(stateBefore, action))
      .toEqual(stateAfter);
  });

  describe('actions', () => {
    it('should create loginStart action', () => {
      const actionAfter = {
        type: actionTypes.LOGIN_START,
      };
      deepFreeze(actionAfter);
      expect(actions.loginStart())
        .toEqual(actionAfter);
    });

    it('should create loginFail action', () => {
      const errorMessage = 'something bad happend';
      const actionAfter = {
        type: actionTypes.LOGIN_FAIL,
        errorMessage,
      };
      deepFreeze(actionAfter);
      expect(actions.loginFail({ errorMessage }))
        .toEqual(actionAfter);
    });

    it('should create loginSuccess action', () => {
      const sessionToken = 'some session token';
      const actionAfter = {
        type: actionTypes.LOGIN_SUCCESS,
        sessionToken,
      };
      deepFreeze(actionAfter);
      expect(actions.loginSuccess({ sessionToken }))
        .toEqual(actionAfter);
    });

    it('should create a logout action', () => {
      const actionAfter = {
        type: actionTypes.LOGOUT,
      };
      deepFreeze(actionAfter);
      expect(actions.logout())
        .toEqual(actionAfter);
    });
  });
});