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
  authErrorHandler,
} from "openstack-uicore-foundation/lib/utils/actions";
import history from '../history';
import {getAccessTokenSafely} from "../utils/methods";
import {DUMMY_ACTION} from "./presentations-actions";
import {speakerErrorHandler} from "./auth-actions";

export const RECEIVE_TAG_GROUPS = 'RECEIVE_TAG_GROUPS';
export const RECEIVE_EVENT_CATEGORY = 'RECEIVE_EVENT_CATEGORY';
export const RECEIVE_SUMMIT = 'RECEIVE_SUMMIT';
export const REQUEST_MARKETING_SETTINGS = 'REQUEST_MARKETING_SETTINGS';
export const RECEIVE_MARKETING_SETTINGS = 'RECEIVE_MARKETING_SETTINGS';
export const REQUEST_AVAILABLE_SUMMITS = 'REQUEST_AVAILABLE_SUMMITS';
export const RECEIVE_AVAILABLE_SUMMITS = 'RECEIVE_AVAILABLE_SUMMITS';
export const SUMMIT_DOCS_RECEIVED = 'SUMMIT_DOCS_RECEIVED';
export const ERROR_RECEIVE_SUMMIT = 'ERROR_RECEIVE_SUMMIT';
export const CLEAR_SUMMIT = 'CLEAR_SUMMIT';
export const BASE_LOADED = 'BASE_LOADED';
export const RECEIVE_ALLOWED_SELECTION_PLANS = 'RECEIVE_ALLOWED_SELECTION_PLANS';
export const REQUEST_SELECTION_PLAN_SETTINGS = 'REQUEST_SELECTION_PLAN_SETTINGS';
export const RECEIVE_SELECTION_PLAN_SETTINGS = 'RECEIVE_SELECTION_PLAN_SETTINGS';


export const clearCurrentSummit = () => (dispatch, getState) => {
  dispatch(createAction(CLEAR_SUMMIT)({}));
};

export const getAllFromSummit = (summitSlug) => (dispatch, getState) => {
  dispatch(startLoading());
  dispatch(createAction(BASE_LOADED)({loaded: false}));

  return getCurrentSummitPublic(summitSlug)(dispatch, getState)
    .then(({response}) => {
      return dispatch(getMarketingSettings(response.id)).then(() => {
        dispatch(createAction(BASE_LOADED)({loaded: true}));
        dispatch(stopLoading());
        return response;
      });
    });
};

export const getCurrentSummitPublic = (id) => (dispatch) => {
  let params = {
    expand: 'event_types,event_types.allowed_media_upload_types,event_types.allowed_media_upload_types.type,tracks'
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
  )(params)(dispatch).then(() => {
    dispatch(stopLoading());
  });
}

export const getTagGroups = (summitId) => async (dispatch) => {
  const accessToken = await getAccessTokenSafely();

  const params = {
    access_token: accessToken,
    expand: "allowed_tags",
    per_page: 100,
    page: 1
  };

  return getRequest(
    null,
    createAction(RECEIVE_TAG_GROUPS),
    `${window.API_BASE_URL}/api/v1/summits/${summitId}/track-tag-groups`,
    authErrorHandler
  )(params)(dispatch);
};

export const getAllowedSelectionPlans = (summitId) => async (dispatch, getState) => {
  const accessToken = await getAccessTokenSafely();

  dispatch(startLoading());

  const params = {
    access_token: accessToken,
    expand: 'track_groups,extra_questions,extra_questions.values'
  };

  return getRequest(
    null,
    createAction(RECEIVE_ALLOWED_SELECTION_PLANS),
    `${window.API_BASE_URL}/api/v1/summits/${summitId}/selection-plans/me`,
    console.log
  )(params)(dispatch, getState).then(() => {
    dispatch(stopLoading());
  });
}

export const loadEventCategory = () => async (dispatch, getState) => {
  const {baseState, presentationState} = getState();
  const accessToken = await getAccessTokenSafely();
  const summitId = baseState.summit.id;
  const categoryId = presentationState.entity.track_id;

  dispatch(startLoading());

  const params = {
    expand: "allowed_tags",
    access_token: accessToken,
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

export const getMarketingSettings = (summitId) => (dispatch) => {

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

export const getSelectionPlanSettings = (summitId, selectionPlanId) => (dispatch) => {

  let params = {
    per_page: 100,
    page: 1,
    selection_plan_id: selectionPlanId
  };

  return getRequest(
    createAction(REQUEST_SELECTION_PLAN_SETTINGS),
    createAction(RECEIVE_SELECTION_PLAN_SETTINGS),
    `${window.MARKETING_API_BASE_URL}/api/public/v1/config-values/all/shows/${summitId}`,
    authErrorHandler
  )(params)(dispatch);
};


export const getAllSummitDocs = (summitId) => async (dispatch) => {
  const accessToken = await getAccessTokenSafely();

  const params = {
    access_token: accessToken,
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

