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
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    authErrorHandler,
} from "openstack-uicore-foundation/lib/utils/actions";
import { doLoginBasicLogin} from 'openstack-uicore-foundation/lib/security/methods';
import T from "i18n-react/dist/i18n-react";
import Swal from "sweetalert2";
import history from '../history'
import {
    getTagGroups
} from "./base-actions";
import {getAccessTokenSafely} from "../utils/methods";

export const RECEIVE_PRESENTATION = 'RECEIVE_PRESENTATION';
export const REQUEST_PRESENTATION = 'REQUEST_PRESENTATION';
export const RESET_PRESENTATION = 'RESET_PRESENTATION';
export const UPDATE_PRESENTATION = 'UPDATE_PRESENTATION';
export const PRESENTATION_UPDATED = 'PRESENTATION_UPDATED';
export const PRESENTATION_ADDED = 'PRESENTATION_ADDED';
export const PRESENTATION_DELETED = 'PRESENTATION_DELETED';
export const PRESENTATION_COMPLETED = 'PRESENTATION_COMPLETED';
export const PRESENTATION_MATERIAL_ATTACHED = 'PRESENTATION_MATERIAL_ATTACHED';
export const PRESENTATION_MATERIAL_DELETED = 'PRESENTATION_MATERIAL_DELETED';


export const getPresentation = (presentationId) => async (dispatch, getState) => {
    const {baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit, tagGroups} = baseState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'track_groups, speakers, track, track.allowed_tags, presentation_materials, type, type.allowed_media_upload_types, type.allowed_media_upload_types.type, media_uploads, tags, extra_questions, links'
    };

    return getRequest(
        null,
        createAction(RECEIVE_PRESENTATION),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/events/${presentationId}`,
      (err, res) => presentationErrorHandler(err, res)(dispatch, getState)
    )(params)(dispatch).then((payload) => {
            if(!tagGroups.length){
                dispatch(getTagGroups(summit.id));
            }
            dispatch(stopLoading());
            return payload.response;
        }
    );
};

export const resetPresentation = () => (dispatch, getState) => {
    dispatch(createAction(RESET_PRESENTATION)({}));
};

export const savePresentation = (entity, presentation, currentStep = null) => async (dispatch, getState) => {
    let {baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit, selectionPlan} = baseState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    const params = {
        access_token: accessToken,
        expand: 'track_groups, speakers, presentation_materials, type, media_uploads, tags, extra_questions, links'
    };

    if (entity.id) {

        return putRequest(
            createAction(UPDATE_PRESENTATION),
                createAction(PRESENTATION_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(({response}) => {

                dispatch(getPresentation(response.id))
                    .then((payload) => {
                        dispatch(stopLoading());
                        presentation.updatePresentation({...payload, track_id: payload.track.id}, payload.track);
                        const nextStep = presentation.getStepNameAfter(currentStep);
                        history.push(`/app/${summit.slug}/${selectionPlan.id}/presentations/${payload.id}/${nextStep}`);
                    });
            }, (error) => {
                dispatch(stopLoading());
            });
    }

    // if new set selection plan
    normalizedEntity.selection_plan_id = selectionPlan.id;

    return postRequest(
        createAction(UPDATE_PRESENTATION),
        createAction(PRESENTATION_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations`,
        normalizedEntity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then(({response}) => {
                dispatch(getPresentation(response.id)).then((payload) => {
                    dispatch(stopLoading());
                    presentation.updatePresentation({...payload, track_id: payload.track.id}, payload.track);
                    const nextStep = presentation.getStepNameAfter(currentStep);
                    history.push(`/app/${summit.slug}/${selectionPlan.id}/presentations/${payload.id}/${nextStep}`);
                }
            );
        }, (error) => {
            dispatch(stopLoading());
        });
};


export const saveMediaUpload = (entity, mediaUpload) => async (dispatch, getState) => {
    const {baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit} = baseState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    if (mediaUpload.hasOwnProperty('media_upload_type'))
        mediaUpload.media_upload_type_id = mediaUpload.media_upload_type.id;

    if (mediaUpload.id > 0) {

        return putRequest(
            null,
            createAction(PRESENTATION_MATERIAL_ATTACHED),
            `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${entity.id}/media-uploads/${mediaUpload.id}`,
            mediaUpload,
            authErrorHandler,
            {},
            true
        )(params)(dispatch).then(() => dispatch(stopLoading()));

    }

    return postRequest(
        null,
        createAction(PRESENTATION_MATERIAL_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${entity.id}/media-uploads`,
        mediaUpload,
        authErrorHandler,
        {},
        true
    )(params)(dispatch).finally(() => dispatch(stopLoading()));
};


export const deleteMediaUpload = (presentationId, materialId) => async (dispatch, getState) => {
    const {baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit} = baseState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    return deleteRequest(
        null,
        createAction(PRESENTATION_MATERIAL_DELETED)({materialId}),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${presentationId}/media-uploads/${materialId}`,
        authErrorHandler
    )(params)(dispatch).finally(() => dispatch(stopLoading()));
};


export const completePresentation = (entity) => async (dispatch, getState) => {
    const {baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit, selectionPlan} = baseState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    putRequest(
        null,
        createAction(PRESENTATION_COMPLETED),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${entity.id}/completed`,
        entity,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            history.push(`/app/${summit.slug}/${selectionPlan.id}/presentations/${entity.id}/thank-you`);
        });
}


export const deletePresentation = (selectionPlanId, presentationId) => async (dispatch, getState) => {
    const {baseState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {summit} = baseState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(PRESENTATION_DELETED)({selectionPlanId, presentationId}),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${presentationId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity.links = normalizedEntity.links.filter(l => l.trim() != '');
    normalizedEntity.tags = normalizedEntity.tags.map(t => t.tag);

    return normalizedEntity;
};


const presentationErrorHandler = (err, res) => (dispatch, getState) => {
    const {baseState} = getState();
    const {summit, selectionPlan} = baseState || {};
    const code = err.status;
    dispatch(stopLoading());

    let msg = '';

    switch (code) {
        case 403:
            Swal.fire("ERROR", T.translate("errors.user_not_authz"), "warning");
            break;
        case 401:
            doLoginBasicLogin(window.location.pathname);
            break;
        case 404:
            let error_message = {
                title: T.translate("errors.not_found"),
                html: (err.response.body.message) ? err.response.body.message : err.message,
                type: 'warning'
            };
            dispatch(showMessage(
                error_message,
                () => {
                    if (summit && selectionPlan) {
                        history.push(`/app/${summit.slug}/${selectionPlan.id}/presentations/`);
                    }
                }
            ));
            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                if (isNaN(key)) {
                    msg += key + ': ';
                }

                msg += value + '<br>';
            }
            Swal.fire("Validation error", msg, "warning");
            dispatch({
                type: VALIDATE,
                payload: {errors: err.response.body.errors}
            });
            break;
        default:
            Swal.fire("ERROR", T.translate("errors.server_error"), "error");
    }
};



