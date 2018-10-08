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

import { authErrorHandler, apiBaseUrl} from './base-actions';
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
    showSuccessMessage
} from "openstack-uicore-foundation/lib/methods";
import {fetchErrorHandler, fetchResponseHandler} from "openstack-uicore-foundation/src/utils/actions";
import history from '../history'
import {PRESENTATION_DELETED} from "./presentation-actions";


export const RECEIVE_SPEAKER        = 'RECEIVE_SPEAKER';
export const REQUEST_SPEAKER        = 'REQUEST_SPEAKER';
export const RESET_SPEAKER_FORM     = 'RESET_SPEAKER_FORM';
export const UPDATE_SPEAKER         = 'UPDATE_SPEAKER';
export const SPEAKER_UPDATED        = 'SPEAKER_UPDATED';
export const SPEAKER_SAVED          = 'SPEAKER_SAVED';
export const SPEAKER_ASSIGNED       = 'SPEAKER_ASSIGNED';
export const SPEAKER_REMOVED        = 'SPEAKER_REMOVED';
export const MODERATOR_ASSIGNED     = 'MODERATOR_ASSIGNED';
export const MODERATOR_REMOVED      = 'MODERATOR_REMOVED';
export const PIC_ATTACHED           = 'PIC_ATTACHED';


export const getSpeaker = (speakerId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'member,presentations'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPEAKER),
        `${apiBaseUrl}/api/v1/speakers/${speakerId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSpeakerForm = (email = '') => (dispatch, getState) => {
    dispatch(createAction(RESET_SPEAKER_FORM)({email}));
};

export const saveProfile = (entity) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(entity);

    putRequest(
        createAction(UPDATE_SPEAKER),
        createAction(SPEAKER_UPDATED),
        `${apiBaseUrl}/api/v1/speakers/${entity.id}`,
        normalizedEntity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showSuccessMessage(T.translate("edit_speaker.profile_saved")));
        });
}


export const saveSpeaker = (entity, type) => (dispatch, getState) => {
    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(entity);

    let success_message = {
        title: T.translate("general.done"),
        html: '',
        type: 'success'
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_SAVED),
            `${apiBaseUrl}/api/v1/speakers/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (type == 'moderator') {
                    success_message.html = T.translate("edit_speaker.moderator_saved");
                    dispatch(assignModeratorToPresentation(payload.response, success_message));
                } else {
                    success_message.html = T.translate("edit_speaker.speaker_saved");
                    dispatch(assignSpeakerToPresentation(payload.response, success_message));
                }
            });

    } else {

        postRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_SAVED),
            `${apiBaseUrl}/api/v1/speakers`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (type == 'moderator') {
                    success_message.html = T.translate("edit_speaker.moderator_created");
                    dispatch(assignModeratorToPresentation(payload.response, success_message));
                } else {
                    success_message.html = T.translate("edit_speaker.speaker_created");
                    dispatch(assignSpeakerToPresentation(payload.response, success_message));
                }
            });
    }
}

export const attachPicture = (entity, file) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    //dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    if (entity.id) {
        return dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            null,
            createAction(SPEAKER_UPDATED),
            `${apiBaseUrl}/api/v1/speakers/${entity.id}`,
            entity,
            authErrorHandler
        )(params)(dispatch)
            .then(() => {
                dispatch(uploadFile(entity, file));
            })
            .then(() => {
                dispatch(stopLoading());
            }
        );
    }
}

const uploadFile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(PIC_ATTACHED),
        `${apiBaseUrl}/api/v1/speakers/${entity.id}/photo`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
}


export const assignSpeakerToPresentation = (speaker, message) => (dispatch, getState) => {
    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken,
    };

    putRequest(
        null,
        createAction(SPEAKER_ASSIGNED)({speaker}),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/${presentationId}/speakers/${speaker.id}`,
        null,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                message,
                () => { history.push(`/app/presentations/${presentationId}/speakers`) }
            ));
        });
}


export const removeSpeakerFromPresentation = (speakerId) => (dispatch, getState) => {

    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SPEAKER_REMOVED)({speakerId}),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/${presentationId}/speakers/${speakerId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const assignModeratorToPresentation = (moderator, message) => (dispatch, getState) => {
    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken,
    };

    putRequest(
        null,
        createAction(MODERATOR_ASSIGNED)({moderator}),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/${presentationId}/moderators/${moderator.id}`,
        null,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                message,
                () => { history.push(`/app/presentations/${presentationId}/speakers`) }
            ));
        });
}


export const removeModeratorFromPresentation = (moderatorId) => (dispatch, getState) => {

    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(MODERATOR_REMOVED)({moderatorId}),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/${presentationId}/moderators/${moderatorId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    normalizedEntity.member_id = (normalizedEntity.member != null) ? normalizedEntity.member.id : 0;

    delete normalizedEntity['presentations'];
    delete normalizedEntity['all_presentations'];
    delete normalizedEntity['moderated_presentations'];
    delete normalizedEntity['all_moderated_presentations'];
    delete normalizedEntity['affiliations'];
    delete normalizedEntity['gender'];
    delete normalizedEntity['pic'];
    delete normalizedEntity['member'];
    delete normalizedEntity['summit_assistance'];
    delete normalizedEntity['code_redeemed'];

    return normalizedEntity;
}

export const querySpeakers = (summitId, input) => {

    let accessToken = window.accessToken;
    let filters = `first_name=@${input},last_name=@${input},email=@${input}`;
    let apiUrl = `${window.apiBaseUrl}/api/v1`;

    if (summitId) {
        apiUrl += `/summits/${summitId}`;
    }

    apiUrl += `/speakers?filter=${filters}&access_token=${accessToken}`;

    return fetch(apiUrl)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((s) => {
                let name = s.first_name + ' ' + s.last_name;
                return ({id: s.id, name: name, email: s.email, pic: s.pic});
            });

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};
