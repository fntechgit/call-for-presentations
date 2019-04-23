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

import history from '../history'


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

export const RECEIVE_SPEAKER_PROFILE        = 'RECEIVE_SPEAKER_PROFILE';
export const REQUEST_SPEAKER_PROFILE        = 'REQUEST_SPEAKER_PROFILE';
export const RESET_PROFILE_FORM             = 'RESET_PROFILE_FORM';
export const UPDATE_SPEAKER_PROFILE         = 'UPDATE_SPEAKER_PROFILE';
export const SPEAKER_PROFILE_UPDATED        = 'SPEAKER_PROFILE_UPDATED';
export const SPEAKER_PROFILE_SAVED          = 'SPEAKER_PROFILE_SAVED';
export const PROFILE_PIC_ATTACHED           = 'PROFILE_PIC_ATTACHED';
export const RECEIVE_ORG_ROLES              = 'RECEIVE_ORG_ROLES';


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
        `${window.API_BASE_URL}/api/v1/speakers/${speakerId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSpeakerForm = (email = '') => (dispatch, getState) => {
    dispatch(createAction(RESET_SPEAKER_FORM)({email}));
};

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
            `${window.API_BASE_URL}/api/v1/speakers/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (type == 'moderator') {
                    success_message.html = T.translate("edit_speaker.moderator_saved");
                    dispatch(assignModeratorToPresentation(payload.response));
                } else {
                    success_message.html = T.translate("edit_speaker.speaker_saved");
                    dispatch(assignSpeakerToPresentation(payload.response));
                }
            })
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/presentations/${presentationId}/speakers`) }
                ));
            });

    } else {

        postRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_SAVED),
            `${window.API_BASE_URL}/api/v1/speakers`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (type == 'moderator') {
                    success_message.html = T.translate("edit_speaker.moderator_created");
                    dispatch(assignModeratorToPresentation(payload.response));
                } else {
                    success_message.html = T.translate("edit_speaker.speaker_created");
                    dispatch(assignSpeakerToPresentation(payload.response));
                }
            })
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/presentations/${presentationId}/speakers`) }
                ));
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
            `${window.API_BASE_URL}/api/v1/speakers`,
            entity,
            authErrorHandler
        )(params)(dispatch)
            .then((payload) => {
                dispatch(uploadFile(payload.response, file));
            })
            .then(() => {
                dispatch(stopLoading());
            }
        );
    }
}

const uploadFile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(PIC_ATTACHED),
        `${window.API_BASE_URL}/api/v1/speakers/${entity.id}/photo`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
}


export const assignSpeakerToPresentation = (speaker) => (dispatch, getState) => {
    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken,
    };

    putRequest(
        null,
        createAction(SPEAKER_ASSIGNED)({speaker}),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/${presentationId}/speakers/${speaker.id}`,
        null,
        authErrorHandler
    )(params)(dispatch);
}


export const removeSpeakerFromPresentation = (speakerId) => (dispatch, getState) => {

    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken
    };

    dispatch(startLoading());

    return deleteRequest(
        null,
        createAction(SPEAKER_REMOVED)({speakerId}),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/${presentationId}/speakers/${speakerId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const assignModeratorToPresentation = (moderator) => (dispatch, getState) => {
    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken,
    };

    putRequest(
        null,
        createAction(MODERATOR_ASSIGNED)({moderator}),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/${presentationId}/moderators/${moderator.id}`,
        null,
        authErrorHandler
    )(params)(dispatch);
}


export const removeModeratorFromPresentation = (moderatorId) => (dispatch, getState) => {

    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let presentationId      = presentationState.entity.id;

    let params = {
        access_token : accessToken
    };

    dispatch(startLoading());

    return deleteRequest(
        null,
        createAction(MODERATOR_REMOVED)({moderatorId}),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/${presentationId}/moderators/${moderatorId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    normalizedEntity.member_id = (normalizedEntity.member != null) ? normalizedEntity.member.id : 0;
    normalizedEntity.areas_of_expertise = entity.areas_of_expertise.map(aoe => aoe.label);

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




/******************************************** PROFILE *****************************************/




export const saveSpeakerProfile = (entity) => (dispatch, getState) => {
    let { loggedUserState, presentationState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntityProfile(entity);

    let success_message = {
        title: T.translate("general.done"),
        html: '',
        type: 'success'
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPEAKER_PROFILE),
            createAction(SPEAKER_PROFILE_SAVED),
            `${window.API_BASE_URL}/api/v1/speakers/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                success_message.html = T.translate("edit_profile.profile_saved");
                dispatch(showMessage(success_message));
            });

    } else {

        postRequest(
            createAction(UPDATE_SPEAKER_PROFILE),
            createAction(SPEAKER_PROFILE_SAVED),
            `${window.API_BASE_URL}/api/v1/speakers`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                success_message.html = T.translate("edit_profile.profile_saved");
                dispatch(showMessage(success_message));
            });
    }
}


export const attachProfilePicture = (entity, file) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    //dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    if (entity.id) {
        return dispatch(uploadFileProfile(entity, file));
    } else {
        return postRequest(
            null,
            createAction(SPEAKER_PROFILE_SAVED),
            `${window.API_BASE_URL}/api/v1/speakers`,
            entity,
            authErrorHandler
        )(params)(dispatch)
            .then((payload) => {
                dispatch(uploadFileProfile(payload.response, file));
            })
            .then(() => {
                    dispatch(stopLoading());
                }
            );
    }
}

const uploadFileProfile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(PROFILE_PIC_ATTACHED),
        `${window.API_BASE_URL}/api/v1/speakers/${entity.id}/photo`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
}


export const getOrganizationalRoles = () => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ORG_ROLES),
        `${window.API_BASE_URL}/api/v1/speakers/organizational-roles`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}


const normalizeEntityProfile = (entity) => {
    let normalizedEntity = {...entity};

    normalizedEntity.organizational_roles = entity.organizational_roles.filter( r => Number.isInteger(r));
    normalizedEntity.other_organizational_role = entity.organizational_roles.filter( r => typeof r === 'string');

    normalizedEntity.areas_of_expertise = entity.areas_of_expertise.map(a => a.label);


    delete normalizedEntity['affiliations'];
    delete normalizedEntity['pic'];
    delete normalizedEntity['member'];

    return normalizedEntity;
}
