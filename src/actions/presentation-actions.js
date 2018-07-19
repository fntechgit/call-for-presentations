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
    showSuccessMessage
} from "openstack-uicore-foundation/lib/methods";
import {authErrorHandler, apiBaseUrl, VALIDATE} from './base-actions';
import T from "i18n-react/dist/i18n-react";
import {doLogin} from "./auth-actions";
import swal from "sweetalert2";


export const RECEIVE_PRESENTATION           = 'RECEIVE_PRESENTATION';
export const REQUEST_PRESENTATION           = 'REQUEST_PRESENTATION';
export const RESET_PRESENTATION             = 'RESET_PRESENTATION';
export const UPDATE_PRESENTATION            = 'UPDATE_PRESENTATION';
export const PRESENTATION_UPDATED           = 'PRESENTATION_UPDATED';
export const PRESENTATION_ADDED             = 'PRESENTATION_ADDED';


export const getPresentation = (presentationId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'track_groups, speakers'
    };

    return getRequest(
        null,
        createAction(RECEIVE_PRESENTATION),
        `${apiBaseUrl}/api/v1/summits/23/events/${presentationId}`,
        presentationErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetPresentation = () => (dispatch, getState) => {
    dispatch(createAction(RESET_PRESENTATION)({}));
};

export const savePresentation = (entity, history) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token : accessToken
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_PRESENTATION),
            createAction(PRESENTATION_UPDATED),
            `${apiBaseUrl}/api/v1/presentations/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_presentation.presentation_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_presentation.presentation_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_PRESENTATION),
            createAction(PRESENTATION_ADDED),
            `${apiBaseUrl}/api/v1/presentations`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/presentations/${payload.response.id}`) }
                ));
            });
    }
}


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

const presentationErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    let msg = '';

    switch (code) {
        case 403:
            swal("ERROR", T.translate("errors.user_not_authz"), "warning");
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
                () => { window.location = `${ window.location.origin}/presentations` }
            ));
            break;
        default:
            swal("ERROR", T.translate("errors.server_error"), "error");
    }
}
