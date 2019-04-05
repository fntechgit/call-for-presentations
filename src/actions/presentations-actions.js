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

import T from "i18n-react/dist/i18n-react";
import {
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler
} from "openstack-uicore-foundation/lib/methods";

export const CREATED_RECEIVED       = 'CREATED_RECEIVED';
export const SPEAKER_RECEIVED       = 'SPEAKER_RECEIVED';
export const MODERATOR_RECEIVED     = 'MODERATOR_RECEIVED';


export const getAllPresentations = () => (dispatch, getState) => {

    let { loggedUserState, baseState } = getState();
    let { accessToken } = loggedUserState;
    let summitId = baseState.summit.id;

    dispatch(startLoading());

    let created = dispatch(getCreatorPresentations(summitId, accessToken));

    let speaker = dispatch(getSpeakerPresentations(summitId, accessToken));

    let moderator = dispatch(getModeratorPresentations(summitId, accessToken));

    Promise.all([created, speaker, moderator]).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const getCreatorPresentations = (summitId, accessToken) => (dispatch, getState) => {
    let params = {
        access_token : accessToken
    };

    return getRequest(
        null,
        createAction(CREATED_RECEIVED),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/creator/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
}

export const getSpeakerPresentations = (summitId, accessToken) => (dispatch, getState) => {
    let params = {
        access_token : accessToken
    };

    getRequest(
        null,
        createAction(SPEAKER_RECEIVED),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/speaker/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
}


export const getModeratorPresentations = (summitId, accessToken) => (dispatch, getState) => {
    let params = {
        access_token : accessToken
    };

    getRequest(
        null,
        createAction(MODERATOR_RECEIVED),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/moderator/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
}
