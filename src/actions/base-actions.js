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
import swal from "sweetalert2";
import {doLogin, initLogOut} from "./auth-actions";
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
    getBackURL
} from "openstack-uicore-foundation/lib/methods";

export const apiBaseUrl                     = process.env['API_BASE_URL'];
export const VALIDATE                       = 'VALIDATE';
const LOGOUT_USER                           = 'LOGOUT_USER';
export const SELECTION_PLAN_RECEIVED        = 'SELECTION_PLAN_RECEIVED';
export const SELECTION_CLOSED               = 'SELECTION_CLOSED';
export const RECEIVE_SUMMIT                 = 'RECEIVE_SUMMIT';
export const RECEIVE_TAG_GROUPS             = 'RECEIVE_TAG_GROUPS';
export const RECEIVE_EVENT_CATEGORY         = 'RECEIVE_EVENT_CATEGORY';
export const RESET_LOADER                   = 'RESET_LOADER';


export const resetLoading = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOADER)({}));
}

export const loadCurrentSelectionPlan = () => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
        expand: 'summit,track_groups'
    };

    dispatch(startLoading());

    return getRequest(
        null,
        createAction(SELECTION_PLAN_RECEIVED),
        `${apiBaseUrl}/api/v1/summits/all/selection-plans/current/submission`,
        selectionPlanErrorHandler
    )(params)(dispatch).then((payload) => {
            let summit = dispatch(getSummitById(payload.response.summit.id));
            let tagGroups = dispatch(getTagGroups(payload.response.summit.id));

            Promise.all([summit, tagGroups]).then(() => { dispatch(stopLoading()); });
        }
    );
};

export const getSummitById = (summitId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
        expand: 'event_types,tracks'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SUMMIT),
        `${apiBaseUrl}/api/v1/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
}

export const getTagGroups = (summitId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
        expand       : "allowed_tags",
        per_page     : 100,
        page         : 1
    };

    return getRequest(
        null,
        createAction(RECEIVE_TAG_GROUPS),
        `${apiBaseUrl}/api/v1/summits/${summitId}/track-tag-groups`,
        authErrorHandler
    )(params)(dispatch);
};


export const loadEventCategory = () => (dispatch, getState) => {

    let { loggedUserState, selectionPlanState, presentationState } = getState();
    let { accessToken }     = loggedUserState;
    let summitId            = selectionPlanState.summit.id;
    let categoryId          = presentationState.entity.track_id;

    dispatch(startLoading());

    let params = {
        expand       : "allowed_tags,extra_questions",
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY),
        `${apiBaseUrl}/api/v1/summits/${summitId}/tracks/${categoryId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const authErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    let msg = '';

    switch (code) {
        case 403:
            let error_message = {
                title: 'ERROR',
                html: T.translate("errors.user_not_authz"),
                type: 'error'
            };

            dispatch(showMessage( error_message, initLogOut ));
            break;
        case 401:
            doLogin(window.location.pathname);
            break;
        case 404:
            msg = (err.response.body.message) ? err.response.body.message : err.message;
            swal("Not Found", msg, "warning");
            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                msg += '- ' + value + '<br>';
            }
            swal("Validation error", msg, "warning");
            dispatch({
                type: VALIDATE,
                payload: {errors: err.response.body.errors}
            });
            break;
        default:
            swal("ERROR", T.translate("errors.server_error"), "error");
    }
}


export const selectionPlanErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    let msg = '';

    switch (code) {
        case 403:
            let error_message = {
                title: 'ERROR',
                html: T.translate("errors.user_not_authz"),
                type: 'error'
            };

            dispatch(showMessage( error_message, initLogOut ));
            break;
        case 401:
            doLogin(window.location.pathname);
            break;
        case 404:
            dispatch({type: SELECTION_CLOSED});
            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                msg += '- ' + value + '<br>';
            }
            swal("Validation error", msg, "warning");
            dispatch({
                type: VALIDATE,
                payload: {errors: err.response.body.errors}
            });
            break;
        default:
            swal("ERROR", T.translate("errors.server_error"), "error");
    }
}
