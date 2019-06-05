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

import { START_LOADING, STOP_LOADING, LOGOUT_USER } from "openstack-uicore-foundation/lib/actions";
import {RESET_LOADER, SELECTION_CLOSED, SELECTION_PLAN_RECEIVED, RECEIVE_SUMMIT, RECEIVE_TAG_GROUPS} from "../actions/base-actions";
import { RECEIVE_SPEAKER_INFO } from '../actions/auth-actions';
import {PROFILE_PIC_ATTACHED, SPEAKER_PROFILE_SAVED} from "../actions/speaker-actions";


const DEFAULT_STATE = {
    selectionPlan: null,
    summit: null,
    cfpOpen: false,
    tagGroups: [],
    loading: 0,
    countries: [],
    speaker: null
}

const baseReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type){
        case RESET_LOADER:
            return {...state, loading: 0};
        break;
        case LOGOUT_USER:
            return DEFAULT_STATE;
        break;
        case START_LOADING:
            return {...state, loading: (state.loading + 1)};
        break;
        case STOP_LOADING:
            let loadingCount = (state.loading == 0) ? 0 : state.loading -1;
            return {...state, loading: loadingCount};
        break;
        case SELECTION_PLAN_RECEIVED: {
            let entity = {...payload.response};
            let cfpOpen = (entity && state.summit && state.summit.id == entity.summit.id);

            return {...state, selectionPlan: entity, cfpOpen: cfpOpen};
        }
        break;
        case SELECTION_CLOSED: {
            return {...state, selectionPlan: null, cfpOpen: false};
        }
        break;
        case RECEIVE_SUMMIT: {
            let entity = {...payload.response};
            let cfpOpen = (state.selectionPlan && entity && entity.id == state.selectionPlan.summit.id);

            return {...state, summit: entity, cfpOpen: cfpOpen};
        }
        break;
        case RECEIVE_TAG_GROUPS: {
            let groups = [...payload.response.data];
            return {...state, tagGroups: groups};
        }
        break;
        case RECEIVE_SPEAKER_INFO: {
            let {response} = action.payload;
            return {...state, speaker: response};
        }
        break;
        case PROFILE_PIC_ATTACHED: {
            let pic_info = {...payload.response};
            return {...state, speaker: {...state.speaker, pic: pic_info.url} };;
        }
        break;
        default:
            return state;
        break;
    }
}

export default baseReducer
