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
    startLoading,
    stopLoading,
    authErrorHandler,
    initLogOut,
    getUserInfo,
} from "openstack-uicore-foundation/lib/methods";

import history from '../history'
import T from "i18n-react/dist/i18n-react";
import Swal from "sweetalert2";

export const RECEIVE_SPEAKER_INFO       = 'RECEIVE_SPEAKER_INFO';

export const getSpeakerInfo = (backUrl) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'member'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPEAKER_INFO),
        `${window.API_BASE_URL}/api/v1/speakers/me`,
        speakerErrorHandler
    )(params)(dispatch, getState).then(() => {

        dispatch(stopLoading());

        if (backUrl) {
            history.push(backUrl);
        }
    });
}

export const speakerErrorHandler = (err, res) => (dispatch, getState) => {
    let { baseState } = getState();
    let code = err.status;
    dispatch(stopLoading());

    if (code == 404) {
        // speaker not found

        Swal.fire({
            title: T.translate("landing.speaker_profile_required"),
            text: T.translate("landing.speaker_profile_required_text"),
            type: "warning",
        });

        const backUrl = baseState.summit ? `/app/${baseState.summit.slug}/profile` : '/app/profile';
        //try to get member
        return getUserInfo('groups', backUrl, history)(dispatch, getState);
    }
    dispatch(authErrorHandler(err, res));
}

