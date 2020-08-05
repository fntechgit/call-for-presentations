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
    doLogin,
    postFile,
    putFile
} from "openstack-uicore-foundation/lib/methods";
import T from "i18n-react/dist/i18n-react";
import Swal from "sweetalert2";
import history from '../history'

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


export const getPresentation = (presentationId) => (dispatch, getState) => {

    let {loggedUserState, baseState} = getState();
    let {accessToken} = loggedUserState;
    let {summit} = baseState;

    dispatch(startLoading());

    let params = {
        access_token: accessToken,
        expand: 'track_groups,speakers,presentation_materials,type,media_uploads,media_uploads.media_upload_type'
    };

    return getRequest(
        null,
        createAction(RECEIVE_PRESENTATION),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/events/${presentationId}`,
        presentationErrorHandler
    )(params)(dispatch).then((payload) => {
            dispatch(stopLoading());
            return payload.response;
        }
    );
};

export const resetPresentation = () => (dispatch, getState) => {
    dispatch(createAction(RESET_PRESENTATION)({}));
};

export const savePresentation = (entity, nextStep) => async (dispatch, getState) => {
    let {loggedUserState, baseState} = getState();
    let {accessToken} = loggedUserState;
    let {summit} = baseState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token: accessToken
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
            .then((payload) => {

                let promises = [];

                if (entity.media_uploads.length > 0) {
                    promises = entity.media_uploads.map( async (mediaUpload) =>
                    {
                        if(mediaUpload.hasOwnProperty('should_delete') && mediaUpload.should_delete && mediaUpload.id > 0)
                            return await dispatch(deleteMediaUpload(entity.id, mediaUpload.id));
                        if(mediaUpload.hasOwnProperty('file') && mediaUpload.file)
                            return await dispatch(saveMediaUpload(payload.response, mediaUpload, mediaUpload.file));
                        // do nothing
                        return true;
                    });
                    return Promise.all(promises).then(() => {
                            dispatch(stopLoading());

                            return payload;
                        }
                    );
                }

                return payload;
            })
            .then((payload) => {
                dispatch(stopLoading());
                dispatch(getPresentation(payload.response.id)).then((payload) =>
                    history.push(`/app/${summit.slug}/presentations/${payload.id}/${nextStep}`)
                );
            });
    }

    return postRequest(
        createAction(UPDATE_PRESENTATION),
        createAction(PRESENTATION_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations`,
        normalizedEntity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {

            let promises = [];

            if (entity.media_uploads.length > 0) {
                promises = entity.media_uploads.map( async (mediaUpload) => await dispatch(saveMediaUpload(payload.response, mediaUpload, mediaUpload.file)));
                return Promise.all(promises).then(() => {
                        dispatch(stopLoading());
                        return payload;
                    }
                );
            }

            return payload;
        })
        .then((payload) => {
            dispatch(stopLoading());
            dispatch(getPresentation(payload.response.id)).then((payload) =>
                history.push(`/app/${summit.slug}/presentations/${payload.id}/tags`)
            );
        });

}

const saveMediaUpload = (entity, mediaUpload, file) => (dispatch, getState) => {
    let {loggedUserState, baseState} = getState();
    let {accessToken} = loggedUserState;
    let {summit} = baseState;

    let params = {
        access_token: accessToken,
    };

    if(mediaUpload.hasOwnProperty('media_upload_type'))
        mediaUpload.media_upload_type_id = mediaUpload.media_upload_type.id;

    if (mediaUpload.id > 0) {

        return putFile(
            null,
            createAction(PRESENTATION_MATERIAL_ATTACHED),
            `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${entity.id}/media-uploads/${mediaUpload.id}`,
            file,
            mediaUpload,
            authErrorHandler
        )(params)(dispatch);

    }

    return postFile(
            null,
            createAction(PRESENTATION_MATERIAL_ATTACHED),
            `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${entity.id}/media-uploads`,
            file,
            mediaUpload,
            authErrorHandler
        )(params)(dispatch);

}

export const deleteMediaUpload = (presentationId, materialId) => (dispatch, getState) => {

    let {loggedUserState, baseState} = getState();
    let {accessToken} = loggedUserState;
    let {summit} = baseState;

    let params = {
        access_token: accessToken,
    };

    return deleteRequest(
        null,
        createAction(PRESENTATION_MATERIAL_DELETED)({materialId}),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${presentationId}/media-uploads/${materialId}`,
        authErrorHandler
    )(params)(dispatch);
};

export const completePresentation = (entity) => (dispatch, getState) => {
    let {loggedUserState, baseState} = getState();
    let {accessToken} = loggedUserState;
    let {summit} = baseState;

    dispatch(startLoading());

    let params = {
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
            history.push(`/app/${summit.slug}/presentations/${entity.id}/thank-you`);
        });
}


export const deletePresentation = (presentationId) => (dispatch, getState) => {

    let {loggedUserState, baseState} = getState();
    let {accessToken} = loggedUserState;
    let {summit} = baseState;

    let params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(PRESENTATION_DELETED)({presentationId}),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/presentations/${presentationId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    let links = normalizedEntity.links.filter(l => l.trim() != '');
    normalizedEntity.links = links;

    let tags = normalizedEntity.tags.map(t => t.tag);
    normalizedEntity.tags = tags;

    return normalizedEntity;
};


const presentationErrorHandler = (err, res) => (dispatch, getState) => {
    let code = err.status;
    dispatch(stopLoading());

    let {baseState} = getState();
    let {summit} = baseState;

    let msg = '';

    switch (code) {
        case 403:
            Swal.fire("ERROR", T.translate("errors.user_not_authz"), "warning");
            break;
        case 401:
            doLogin(window.location.pathname);
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
                    history.push(`/app/${summit.slug}/presentations/`);
                }
            ));
            break;
        default:
            Swal.fire("ERROR", T.translate("errors.server_error"), "error");
    }
};



