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
import{ LOGOUT_USER } from '../actions/auth-actions';
import {
    RECEIVE_SUMMIT,
    RECEIVE_TAG_GROUPS,
    SELECTION_PLAN_RECEIVED,
    SELECTION_CLOSED
} from '../actions/base-actions';

const DEFAULT_STATE = {
    id: 0,
    name: '',
    is_enabled: false,
    max_submission_allowed_per_user: 0,
    selection_begin_date: 0,
    selection_end_date: 0,
    submission_begin_date: 0,
    submission_end_date: 0,
    voting_begin_date: 0,
    voting_end_date: 0,
    track_groups: [],
    tag_groups: [],
    summit: {}
}

const selectionPlanReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SELECTION_CLOSED:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case SELECTION_PLAN_RECEIVED: {
            let entity = {...payload.response};
            return {...entity};
        }
        break;
        case RECEIVE_SUMMIT: {
            let entity = {...payload.response};
            return {...state, summit: entity};
        }
        break;
        case RECEIVE_TAG_GROUPS: {
            let groups = [...payload.response.data];
            return {...state, tag_groups: groups};
        }
            break;
        default:
            return state;
    }

}

export default selectionPlanReducer
