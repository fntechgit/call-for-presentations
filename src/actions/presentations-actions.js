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

import { authErrorHandler, apiBaseUrl} from './base-actions';
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
    showSuccessMessage
} from "openstack-uicore-foundation/lib/methods";

export const CREATED_RECEIVED       = 'CREATED_RECEIVED';
export const SPEAKER_RECEIVED       = 'SPEAKER_RECEIVED';
export const MODERATOR_RECEIVED     = 'MODERATOR_RECEIVED';


export const getAllPresentations = () => (dispatch, getState) => {

    let { loggedUserState, selectionPlanState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
        filter: `selection_plan_id==${selectionPlanState.id}`
    };

    dispatch(startLoading())

    // GET /api/v1/speakers/me/presentations/created?filter=selection_plan_id==123
    // GET /api/v1/speakers/me/presentations/non-created?filter=selection_plan_id==123

    return getRequest(
        null,
        createAction(CREATED_RECEIVED),
        `${apiBaseUrl}/api/v1/speakers/me/presentations/created`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

