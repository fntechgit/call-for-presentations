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
} from "openstack-uicore-foundation/lib/utils/actions";

import {getTagGroups} from './base-actions';
import {getAccessTokenSafely} from "../utils/methods";

export const DUMMY_ACTION = 'DUMMY_ACTION';
export const CREATED_RECEIVED = 'CREATED_RECEIVED';
export const SPEAKER_RECEIVED = 'SPEAKER_RECEIVED';
export const MODERATOR_RECEIVED = 'MODERATOR_RECEIVED';
export const REGROUP_PRESENTATIONS = 'REGROUP_PRESENTATIONS';

export const getAllPresentations = (summitId, selectionPlanId) => async (dispatch) => {
  const accessToken = await getAccessTokenSafely();

  dispatch(startLoading());

  const created = dispatch(getCreatorPresentations(selectionPlanId, accessToken));

  const speaker = dispatch(getSpeakerPresentations(selectionPlanId, accessToken));

  const moderator = dispatch(getModeratorPresentations(selectionPlanId, accessToken));

  return Promise.all([created, speaker, moderator]).then(() => {
      dispatch(createAction(REGROUP_PRESENTATIONS)({selectionPlanId}));
      dispatch(stopLoading());
    }
  );
};

export const getCreatorPresentations = (selectionPlanId, accessToken) => (dispatch, getState) => {

  const params = {
    access_token: accessToken,
    expand: 'type'
  };

  return getRequest(
    null,
    createAction(DUMMY_ACTION),
    `${window.API_BASE_URL}/api/v1/speakers/me/presentations/creator/selection-plans/${selectionPlanId}`,
    authErrorHandler
  )(params)(dispatch).then(({response}) => {
    dispatch(createAction(CREATED_RECEIVED)({response, selectionPlanId}));
  });
}

export const getSpeakerPresentations = (selectionPlanId, accessToken) => (dispatch, getState) => {

  let params = {
    access_token: accessToken,
    expand: 'type'
  };

  return getRequest(
    null,
    createAction(DUMMY_ACTION),
    `${window.API_BASE_URL}/api/v1/speakers/me/presentations/speaker/selection-plans/${selectionPlanId}`,
    authErrorHandler
  )(params)(dispatch).then(({response}) => {
    dispatch(createAction(SPEAKER_RECEIVED)({response, selectionPlanId}));
  });
}

export const getModeratorPresentations = (selectionPlanId, accessToken) => (dispatch, getState) => {

  let params = {
    access_token: accessToken,
    expand: 'type'
  };

  return getRequest(
    null,
    createAction(DUMMY_ACTION),
    `${window.API_BASE_URL}/api/v1/speakers/me/presentations/moderator/selection-plans/${selectionPlanId}`,
    authErrorHandler
  )(params)(dispatch).then(({response}) => {
    dispatch(createAction(MODERATOR_RECEIVED)({response, selectionPlanId}));
  });
};

/*
export const getSummitDocs = (presentations, summitId) => async (dispatch, getState) => {


    let { baseState } = getState();
    const accessToken = await getAccessTokenSafely();

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
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/summit-documents`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};*/
