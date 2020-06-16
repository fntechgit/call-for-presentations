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
    getRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler
} from "openstack-uicore-foundation/lib/methods";

export const CREATED_RECEIVED       = 'CREATED_RECEIVED';
export const SPEAKER_RECEIVED       = 'SPEAKER_RECEIVED';
export const MODERATOR_RECEIVED     = 'MODERATOR_RECEIVED';
export const SUMMIT_DOCS_RECEIVED   = 'SUMMIT_DOCS_RECEIVED';


export const getAllPresentations = () => async (dispatch, getState) => {

    let { loggedUserState, baseState } = getState();
    let { accessToken } = loggedUserState;
    let summitId = baseState.summit.id;

    dispatch(startLoading());

    let created = await dispatch(getCreatorPresentations(summitId, accessToken));

    let speaker = await dispatch(getSpeakerPresentations(summitId, accessToken));

    let moderator = await dispatch(getModeratorPresentations(summitId, accessToken));

    return Promise.all([created, speaker, moderator]).then(() => {
            dispatch(stopLoading());
            return [...created.response.data, ...speaker.response.data, ...moderator.response.data];
        }
    );
};


export const getCreatorPresentations = (summitId, accessToken) => (dispatch, getState) => {
    let params = {
        access_token : accessToken,
        expand: 'type'
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
        access_token : accessToken,
        expand: 'type'
    };

    return getRequest(
        null,
        createAction(SPEAKER_RECEIVED),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/speaker/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
}


export const getModeratorPresentations = (summitId, accessToken) => (dispatch, getState) => {
    let params = {
        access_token : accessToken,
        expand: 'type'
    };

    return getRequest(
        null,
        createAction(MODERATOR_RECEIVED),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/moderator/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
};

export const getSummitDocs = (presentations) => (dispatch, getState) => {
    let { loggedUserState, baseState } = getState();
    let { accessToken }     = loggedUserState;
    let { summit }          = baseState;

    dispatch(startLoading());

    let eventTypes = presentations.map(p => p.type.name);
    eventTypes = eventTypes.filter((t,i) => eventTypes.indexOf(t) === i);

    let params = {
        access_token : accessToken,
        'filter[]': [`event_type==${eventTypes.join('||')}`]
    };

    return getRequest(
        null,
        createAction(SUMMIT_DOCS_RECEIVED),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/summit-documents`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};
