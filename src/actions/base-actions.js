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
import Swal from "sweetalert2";
import {
    getRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    authErrorHandler,
    VALIDATE
} from "openstack-uicore-foundation/lib/utils/actions";
import { initLogOut, doLoginBasicLogin} from 'openstack-uicore-foundation/lib/security/methods';
import history from '../history';
import {getAccessTokenSafely} from "../utils/methods";

export const SELECTION_CLOSED               = 'SELECTION_CLOSED';
export const RECEIVE_TAG_GROUPS             = 'RECEIVE_TAG_GROUPS';
export const RECEIVE_EVENT_CATEGORY         = 'RECEIVE_EVENT_CATEGORY';
export const RECEIVE_SUMMIT                 = 'RECEIVE_SUMMIT';
export const RECEIVE_SELECTION_PLAN         = 'RECEIVE_SELECTION_PLAN';
export const REQUEST_MARKETING_SETTINGS     = 'REQUEST_MARKETING_SETTINGS';
export const RECEIVE_MARKETING_SETTINGS     = 'RECEIVE_MARKETING_SETTINGS';
export const REQUEST_AVAILABLE_SUMMITS      = 'REQUEST_AVAILABLE_SUMMITS';
export const RECEIVE_AVAILABLE_SUMMITS      = 'RECEIVE_AVAILABLE_SUMMITS';
export const SUMMIT_DOCS_RECEIVED           = 'SUMMIT_DOCS_RECEIVED';
export const ERROR_RECEIVE_SUMMIT           = 'ERROR_RECEIVE_SUMMIT';
export const CLEAR_SUMMIT                   = 'CLEAR_SUMMIT';
export const CLEAR_SELECTION_PLAN           = 'CLEAR_SELECTION_PLAN';
export const BASE_LOADED                    = 'BASE_LOADED';

export const clearCurrentSummit = () => (dispatch, getState) => {
    dispatch(createAction(CLEAR_SUMMIT)({}));
};

export const clearSelectionPlan = () => (dispatch) => {
    dispatch(createAction(CLEAR_SELECTION_PLAN)({}));
}

export const getSelectionPlan = (summitId, selectionPlanId) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
        expand: 'summit,track_groups,extra_questions,extra_questions.values'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTION_PLAN),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/selection-plans/${selectionPlanId}`,
        selectionPlanErrorHandler
    )(params)(dispatch);
};

export const getAllFromSummit = (summitSlug) => (dispatch, getState) => {
    dispatch(startLoading());
    dispatch(createAction(BASE_LOADED)({loaded: false}));

    return getCurrentSummitPublic(summitSlug)(dispatch, getState)
        .then(({response}) => {
            return getMarketingSettings(response.id)(dispatch, getState).then(() => {
                dispatch(createAction(BASE_LOADED)({loaded: true}));
                dispatch(stopLoading());
            });
        });
};

export const getCurrentSummitPublic = (id) => (dispatch, getState) => {

    let params = {
        expand: 'event_types,event_types.allowed_media_upload_types,event_types.allowed_media_upload_types.type,tracks,selection_plans, selection_plans.track_groups,selection_plans.extra_questions,selection_plans.extra_questions.values'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SUMMIT),
        `${window.API_BASE_URL}/api/public/v1/summits/all/${id}`,
        currentSummitErrorHandler
    )(params)(dispatch);
}

export const getAvailableSummits = () => (dispatch, getState) => {

    dispatch(startLoading());

    // depends on user clocks
    const secondsSinceEpoch = Math.round(Date.now() / 1000);

    let filters = [
        `submission_begin_date<=${secondsSinceEpoch}`,
        `submission_end_date>=${secondsSinceEpoch}`,
        'selection_plan_enabled==1'
    ];

    let params = {
        'filter[]': filters,
        order: `+start_date`
    };

    return getRequest(
      createAction(REQUEST_AVAILABLE_SUMMITS),
      createAction(RECEIVE_AVAILABLE_SUMMITS),
      `${window.API_BASE_URL}/api/public/v1/summits/all`,
      authErrorHandler
    )(params)(dispatch).then(() => { dispatch(stopLoading()); });
}

export const getSummitById = (summitId) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
        expand: 'event_types,tracks'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SUMMIT),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
}

export const getTagGroups = (summitId) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
        expand       : "allowed_tags",
        per_page     : 100,
        page         : 1
    };

    return getRequest(
        null,
        createAction(RECEIVE_TAG_GROUPS),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/track-tag-groups`,
        authErrorHandler
    )(params)(dispatch);
};

export const loadEventCategory = () => async (dispatch, getState) => {
    const { baseState, presentationState } = getState();
    const accessToken = await getAccessTokenSafely();
    const summitId            = baseState.summit.id;
    const categoryId          = presentationState.entity.track_id;

    dispatch(startLoading());

    const params = {
        expand       : "allowed_tags",
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/tracks/${categoryId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getMarketingSettings = (summitId) => (dispatch, getState) => {

    let params = {
        per_page: 100,
        page: 1
    };

    return getRequest(
      createAction(REQUEST_MARKETING_SETTINGS),
      createAction(RECEIVE_MARKETING_SETTINGS),
      `${window.MARKETING_API_BASE_URL}/api/public/v1/config-values/all/shows/${summitId}`,
      authErrorHandler
    )(params)(dispatch);
};


export const getAllSummitDocs = (summitId) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(SUMMIT_DOCS_RECEIVED),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/summit-documents`,
        authErrorHandler
    )(params)(dispatch);
};

const currentSummitErrorHandler = (err, res) => (dispatch, state) => {
    let code = err.status;
    let msg = '';

    dispatch(stopLoading());

    switch (code) {
        case 404:
            msg = "";
            if (err.response.body && err.response.body.message) msg = err.response.body.message;
            else if (err.response.error && err.response.error.message) msg = err.response.error.message;
            else msg = err.message;
            // clear state
            dispatch(createAction(ERROR_RECEIVE_SUMMIT)({}));
            Swal.fire("Not Found", msg, "warning");
            // back selection page
            history.push('/');
            break;
        default:
            Swal.fire("ERROR", T.translate("errors.server_error"), "error");
            break
    }
};

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
            doLoginBasicLogin(window.location.pathname);
            break;
        case 404:
            dispatch(createAction(SELECTION_CLOSED)({}));
            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                msg += '- ' + value + '<br>';
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

