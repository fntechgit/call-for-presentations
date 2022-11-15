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
    authErrorHandler,
} from "openstack-uicore-foundation/lib/utils/actions";

import history from '../history'
import Swal from "sweetalert2";
import {getSpeakerInfo} from "./auth-actions";
import {getAccessTokenSafely} from "../utils/methods";

export const RECEIVE_SPEAKER_PERMISSION = 'RECEIVE_SPEAKER_PERMISSION';
export const REQUEST_SPEAKER_PERMISSION = 'REQUEST_SPEAKER_PERMISSION';
export const SPEAKER_PERMISSION_REQUESTED = 'SPEAKER_PERMISSION_REQUESTED';
export const RECEIVE_SPEAKER = 'RECEIVE_SPEAKER';
export const RESET_SPEAKER_FORM = 'RESET_SPEAKER_FORM';
export const UPDATE_SPEAKER = 'UPDATE_SPEAKER';
export const SPEAKER_UPDATED = 'SPEAKER_UPDATED';
export const SPEAKER_SAVED = 'SPEAKER_SAVED';
export const SPEAKER_ASSIGNED = 'SPEAKER_ASSIGNED';
export const SPEAKER_REMOVED = 'SPEAKER_REMOVED';
export const MODERATOR_ASSIGNED = 'MODERATOR_ASSIGNED';
export const MODERATOR_REMOVED = 'MODERATOR_REMOVED';
export const PIC_ATTACHED = 'PIC_ATTACHED';

export const RECEIVE_SPEAKER_PROFILE = 'RECEIVE_SPEAKER_PROFILE';
export const RESET_PROFILE_FORM = 'RESET_PROFILE_FORM';
export const UPDATE_SPEAKER_PROFILE = 'UPDATE_SPEAKER_PROFILE';
export const SPEAKER_PROFILE_UPDATED = 'SPEAKER_PROFILE_UPDATED';
export const SPEAKER_PROFILE_SAVED = 'SPEAKER_PROFILE_SAVED';
export const PROFILE_PIC_ATTACHED = 'PROFILE_PIC_ATTACHED';
export const BIG_PIC_ATTACHED = 'BIG_PIC_ATTACHED';
export const RECEIVE_ORG_ROLES = 'RECEIVE_ORG_ROLES';


export const getSpeaker = (speakerId) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
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


export const getSpeakerPermission = (selectionPlanId, presentationId, speakerId, speakerType) => async (dispatch, getState) => {
    const {profileState, baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit} = baseState;

    if (speakerId == profileState.entity.id) {
        history.push(`/app/${summit.slug}/all-plans/${selectionPlanId}/presentations/${presentationId}/speakers/${speakerId}`, {type: speakerType});
        return;
    }

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'member,presentations'
    };

    return getRequest(
        createAction(REQUEST_SPEAKER_PERMISSION),
        createAction(RECEIVE_SPEAKER_PERMISSION),
        `${window.API_BASE_URL}/api/v1/speakers/${speakerId}/edit-permission`,
        speakerPermissionErrorHandler,
        {speakerId}
    )(params)(dispatch).then((payload) => {
            dispatch(stopLoading());

            if (payload.response.approved) {
                history.push(`/app/${summit.slug}/all-plans/${selectionPlanId}/presentations/${presentationId}/speakers/${speakerId}`, {type: speakerType});
            } else {
                Swal.fire({
                    title: T.translate("edit_speaker.auth_pending"),
                    text: T.translate("edit_speaker.auth_pending_text"),
                    type: "warning",
                });
            }

        }
    );
};

export const speakerPermissionErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    if (code == 404) {
        Swal.fire({
            title: T.translate("edit_speaker.auth_required"),
            text: T.translate("edit_speaker.auth_required_text"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#00ca00",
            confirmButtonText: T.translate("edit_speaker.request_auth")
        }).then(function (result) {
            if (result.value) {
                dispatch(requestSpeakerPermission());
            }
        });
    } else {
        dispatch(authErrorHandler(err, res));
    }
}

export const requestSpeakerPermission = () => async (dispatch, getState) => {
    const {speakerState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {speakerPermissionRequest} = speakerState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    putRequest(
        createAction(REQUEST_SPEAKER_PERMISSION),
        createAction(SPEAKER_PERMISSION_REQUESTED),
        `${window.API_BASE_URL}/api/v1/speakers/${speakerPermissionRequest}/edit-permission`,
        {},
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            dispatch(showSuccessMessage(T.translate("edit_speaker.auth_requested_success")));
        });


}

export const resetSpeakerForm = (email = '') => (dispatch, getState) => {
    dispatch(createAction(RESET_SPEAKER_FORM)({email}));
};

export const saveSpeaker = (entity, type) => async (dispatch, getState) => {
    const {presentationState, baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit} = baseState;
    const {id: presentationId, selection_plan_id: selectionPlanId} = presentationState.entity;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    const pic_file = entity.pic_file;
    const normalizedEntity = normalizeEntity(entity);

    const success_message = {
        title: T.translate("general.done"),
        html: '',
        type: 'success'
    };

    if (entity.id) {

        return putRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_SAVED),
            `${window.API_BASE_URL}/api/v1/speakers/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (type === 'moderator') {
                    success_message.html = T.translate("edit_speaker.moderator_saved");
                    dispatch(assignModeratorToPresentation(payload.response));
                } else {
                    success_message.html = T.translate("edit_speaker.speaker_saved");
                    dispatch(assignSpeakerToPresentation(payload.response));
                }

                return payload;
            })
            .then((payload) => {
                if (pic_file) {
                    dispatch(uploadFile(payload.response, pic_file));
                }
            })
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/${summit.slug}/all-plans/${selectionPlanId}/presentations/${presentationId}/speakers`)
                    }
                ));
            });

    }

    return postRequest(
        createAction(UPDATE_SPEAKER),
        createAction(SPEAKER_SAVED),
        `${window.API_BASE_URL}/api/v1/speakers`,
        normalizedEntity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {
            if (type === 'moderator') {
                success_message.html = T.translate("edit_speaker.moderator_created");
                dispatch(assignModeratorToPresentation(payload.response));
            } else {
                success_message.html = T.translate("edit_speaker.speaker_created");
                dispatch(assignSpeakerToPresentation(payload.response));
            }
            return payload;
        })
        .then((payload) => {
            if (pic_file) {
                dispatch(uploadFile(payload.response, pic_file));
            }
        })
        .then(() => {
            dispatch(showMessage(
                success_message,
                () => {
                    history.push(`/app/${summit.slug}/all-plans/${selectionPlanId}/presentations/${presentationId}/speakers`)
                }
            ));
        });

}

const uploadFile = (entity, file) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token: accessToken,
    };

    const formData = new FormData();
    formData.append('file', file);

    postRequest(
        null,
        createAction(PIC_ATTACHED),
        `${window.API_BASE_URL}/api/v1/speakers/${entity.id}/photo`,
        formData,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
}


export const assignSpeakerToPresentation = (speaker) => async (dispatch, getState) => {
    const {presentationState} = getState();
    const accessToken = await getAccessTokenSafely();
    const presentationId = presentationState.entity.id;

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    return putRequest(
        null,
        createAction(SPEAKER_ASSIGNED)({speaker}),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/${presentationId}/speakers/${speaker.id}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const removeSpeakerFromPresentation = (speakerId) => async (dispatch, getState) => {
    const {presentationState} = getState();
    const accessToken = await getAccessTokenSafely();
    const presentationId = presentationState.entity.id;

    const params = {
        access_token: accessToken
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

export const assignModeratorToPresentation = (moderator) => async (dispatch, getState) => {
    const {presentationState} = getState();
    const accessToken = await getAccessTokenSafely();
    const presentationId = presentationState.entity.id;

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    return putRequest(
        null,
        createAction(MODERATOR_ASSIGNED)({moderator}),
        `${window.API_BASE_URL}/api/v1/speakers/me/presentations/${presentationId}/moderators/${moderator.id}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}


export const removeModeratorFromPresentation = (moderatorId) => async (dispatch, getState) => {

    const {presentationState} = getState();
    const accessToken = await getAccessTokenSafely();
    const presentationId = presentationState.entity.id;

    const params = {
        access_token: accessToken
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
    normalizedEntity.other_presentation_links = entity.other_presentation_links.filter(l => l.link);

    delete normalizedEntity['member_id'];
    delete normalizedEntity['presentations'];
    delete normalizedEntity['all_presentations'];
    delete normalizedEntity['moderated_presentations'];
    delete normalizedEntity['all_moderated_presentations'];
    delete normalizedEntity['affiliations'];
    delete normalizedEntity['gender'];
    delete normalizedEntity['pic'];
    delete normalizedEntity['pic_file'];
    delete normalizedEntity['member'];
    delete normalizedEntity['summit_assistance'];
    delete normalizedEntity['code_redeemed'];

    return normalizedEntity;
}


/******************************************** PROFILE *****************************************/



export const saveSpeakerProfile = (entity) => async (dispatch, getState) => {
    const {baseState} = getState();
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    const pic_file = entity.pic_file;
    const big_pic_file = entity.big_pic_file;
    const normalizedEntity = normalizeEntityProfile(entity);

    const success_message = {
        title: T.translate("general.done"),
        html: '',
        type: 'success'
    };

    if (entity.id) {

        return putRequest(
            createAction(UPDATE_SPEAKER_PROFILE),
            createAction(SPEAKER_PROFILE_SAVED),
            `${window.API_BASE_URL}/api/v1/speakers/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (pic_file) {
                    dispatch(uploadFileProfile(payload.response, pic_file));
                }
                if (big_pic_file) {
                    dispatch(uploadFileBigPhoto(payload.response, big_pic_file));
                }
            })
            .then((payload) => {
                success_message.html = T.translate("edit_profile.profile_saved");
                dispatch(showMessage(success_message));
            });
    }

    return postRequest(
        createAction(UPDATE_SPEAKER_PROFILE),
        createAction(SPEAKER_PROFILE_SAVED),
        `${window.API_BASE_URL}/api/v1/speakers`,
        normalizedEntity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {
            if (pic_file) {
                dispatch(uploadFileProfile(payload.response, pic_file));
            }
            if (big_pic_file) {
                dispatch(uploadFileBigPhoto(payload.response, big_pic_file));
            }
        })
        .then((payload) => {
            // we need to call this because we need the expanded member in the speaker payload
            dispatch(getSpeakerInfo(null));
        })
        .then((payload) => {
            const redirectUrl = baseState.summit ? `/app/${baseState.summit.slug}` : '/app/start';
            success_message.html = T.translate("edit_profile.profile_saved");
            dispatch(showMessage(success_message, () => history.push(redirectUrl)));
        });
}


const uploadFileProfile = (entity, file) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    const formData = new FormData();
    formData.append('file', file);

    const params = {
        access_token: accessToken,
    };

    postRequest(
        null,
        createAction(PROFILE_PIC_ATTACHED),
        `${window.API_BASE_URL}/api/v1/speakers/${entity.id}/photo`,
        formData,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
}

const uploadFileBigPhoto = (entity, file) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    const formData = new FormData();
    formData.append('file', file);

    const params = {
        access_token: accessToken,
    };

    postRequest(
        null,
        createAction(BIG_PIC_ATTACHED),
        `${window.API_BASE_URL}/api/v1/speakers/${entity.id}/big-photo`,
        formData,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
}


export const getOrganizationalRoles = () => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
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

    normalizedEntity.organizational_roles = entity.organizational_roles.filter(r => Number.isInteger(r));
    normalizedEntity.other_organizational_role = entity.organizational_roles.filter(r => typeof r === 'string');

    normalizedEntity.areas_of_expertise = entity.areas_of_expertise.map(a => a.label);
    normalizedEntity.other_presentation_links = entity.other_presentation_links.filter(l => l.link);


    delete normalizedEntity['affiliations'];
    delete normalizedEntity['pic'];
    delete normalizedEntity['pic_file'];
    delete normalizedEntity['member'];
    delete normalizedEntity['member_id'];

    return normalizedEntity;
}
