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
import { LOGOUT_USER , SET_LOGGED_USER, RECEIVE_USER_INFO, RECEIVE_SPEAKER_INFO} from '../actions/auth-actions';
import {RECEIVE_COUNTRIES} from "../actions/base-actions";
import {START_LOADING, STOP_LOADING} from "openstack-uicore-foundation";

const DEFAULT_STATE = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
    speaker: null
}

const loggedUserReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type){
        case SET_LOGGED_USER: {
            let {accessToken} = action.payload;
            window.accessToken = accessToken;
            return {...state, isLoggedUser: true, accessToken};
        }
        case LOGOUT_USER: {
            window.accessToken = null;
            return DEFAULT_STATE
        }
        case RECEIVE_USER_INFO: {
            let {response} = action.payload;
            return {...state, member: response};
        }
        case RECEIVE_SPEAKER_INFO: {
            let {response} = action.payload;
            return {...state, speaker: response, member: response.member};
        }
        default:
            return state;
    }
}

export default loggedUserReducer
