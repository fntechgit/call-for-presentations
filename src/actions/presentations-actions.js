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
export const PRESENTATIONS_RECEIVED = 'PRESENTATIONS_RECEIVED';

// one request per role for the whole summit; the reducer splits the results by selection plan
export const getAllPresentations = (summitId) => async (dispatch) => {
  const accessToken = await getAccessTokenSafely();

  dispatch(startLoading());

  const created = dispatch(getPresentationsByRole('creator', summitId, accessToken));

  const speaker = dispatch(getPresentationsByRole('speaker', summitId, accessToken));

  const moderator = dispatch(getPresentationsByRole('moderator', summitId, accessToken));

  return Promise.all([created, speaker, moderator]).then(([created, speaker, moderator]) => {
      dispatch(createAction(PRESENTATIONS_RECEIVED)({created, speaker, moderator}));
      dispatch(stopLoading());
    }
  );
};

export const getPresentationsByRole = (role, summitId, accessToken) => (dispatch) => {

  const params = {
    access_token: accessToken,
    expand: 'type'
  };

  return getRequest(
    null,
    createAction(DUMMY_ACTION),
    `${window.API_BASE_URL}/api/v1/speakers/me/presentations/${role}/summits/${summitId}`,
    authErrorHandler
  )(params)(dispatch).then(({response}) => response.data);
};
