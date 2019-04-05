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
    createAction,
    getRequest,
    showMessage,
    startLoading,
    stopLoading,
    authErrorHandler
} from "openstack-uicore-foundation/lib/methods";

import {SET_LOGGED_USER} from "openstack-uicore-foundation/lib/actions"

import history from '../history'

export const RECEIVE_SPEAKER_INFO       = 'RECEIVE_SPEAKER_INFO';

export const onUserAuth = (accessToken, idToken, sessionState) => (dispatch) => {
    dispatch({
        type: SET_LOGGED_USER,
        payload: {accessToken, idToken, sessionState}
    });

    dispatch(getSpeakerInfo(null));
}



export const getSpeakerInfo = (backUrl) => (dispatch, getState) => {

    let { loggedUserState }     = getState();
    let { accessToken } = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'member'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPEAKER_INFO),
        `${window.API_BASE_URL}/api/v1/speakers/me`,
        authErrorHandler
    )(params)(dispatch, getState).then(() => {

        dispatch(stopLoading());

        if (backUrl) {
            history.push(backUrl);
        }
    });
}
