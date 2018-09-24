/**
 * Copyright 2018 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import {
    LOGOUT_USER,
    SET_LOGGED_USER,
    RECEIVE_USER_INFO,
    RECEIVE_SPEAKER_INFO,
    START_SESSION_STATE_CHECK,
    END_SESSION_STATE_CHECK
} from '../actions/auth-actions';


const DEFAULT_STATE = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
    speaker: null,
    idToken: null,
    sessionState: null,
    backUrl : null,
    checkingSessionState: false,
}

const loggedUserReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type){
        case SET_LOGGED_USER: {
            let { accessToken, idToken, sessionState } = action.payload;
            window.accessToken = accessToken;
            window.idToken = idToken;
            window.sessionState = sessionState;
            return {...state, isLoggedUser:true, accessToken, idToken, sessionState, backUrl : null };
        }
        case LOGOUT_USER : {
            window.accessToken = null;
            window.idToken = null;
            window.sessionState = null;
            return {...DEFAULT_STATE, backUrl: payload.backUrl};
        }
        case RECEIVE_USER_INFO: {
            let {response} = action.payload;
            return {...state, member: response};
        }
        case RECEIVE_SPEAKER_INFO: {
            let {response} = action.payload;
            return {...state, speaker: response, member: response.member};
        }
        case START_SESSION_STATE_CHECK:{
            return {...state, checkingSessionState: true };
        }
        case END_SESSION_STATE_CHECK:{
            return {...state, checkingSessionState: false };
        }
        default:
            return state;
    }
}

export default loggedUserReducer
