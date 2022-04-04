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
import {
    RESET_LOADER,
    SELECTION_CLOSED,
    RECEIVE_TAG_GROUPS,
    CLEAR_SUMMIT,
    ERROR_RECEIVE_SUMMIT,
    RECEIVE_SELECTION_PLAN,
    RECEIVE_SUMMIT,
    RECEIVE_MARKETING_SETTINGS,
    SUMMIT_DOCS_RECEIVED,
    BASE_LOADED,
    CLEAR_SELECTION_PLAN,
} from "../actions/base-actions";
import { RECEIVE_SPEAKER_INFO } from '../actions/auth-actions';
import {PROFILE_PIC_ATTACHED} from "../actions/speaker-actions";
import {nowBetween} from "../utils/methods";


const DEFAULT_STATE = {
    tagGroups: [],
    loading: false,
    countries: [],
    speaker: null,
    selectionPlan: null,
    summit: null,
    marketingSettings: null,
    submissionIsClosed: false,
    allSummitDocs: [],
    baseLoaded: false,
};

const baseReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch(type){
        case RESET_LOADER:
            return {...state, loading: 0};
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            return {...state, loading: true};
        case STOP_LOADING:
            return {...state, loading: false};
        case BASE_LOADED:
            const {loaded} = action.payload;
            return {...state, baseLoaded: loaded};
        case RECEIVE_TAG_GROUPS: {
            const groups = [...payload.response.data];
            return {...state, tagGroups: groups};
        }
        case RECEIVE_SPEAKER_INFO: {
            const {response} = action.payload;
            return {...state, speaker: response};
        }
        case PROFILE_PIC_ATTACHED: {
            const pic_info = {...payload.response};
            return {...state, speaker: {...state.speaker, pic: pic_info.url} };;
        }
        // summit / selection plan
        case CLEAR_SUMMIT:
            return {...state, selectionPlan: null, summit: null, marketingSettings: null, submissionIsClosed: false, allSummitDocs: [], baseLoaded: false};
        case ERROR_RECEIVE_SUMMIT:
            return {...state, selectionPlan: null, summit: null, marketingSettings: null, submissionIsClosed: false};
        case CLEAR_SELECTION_PLAN:
            return {...state, selectionPlan: null, submissionIsClosed: false, baseLoaded: false};
        case RECEIVE_SELECTION_PLAN: {
            const entity = {...payload.response};
            const submissionIsClosed = !nowBetween(entity.submission_begin_date, entity.submission_end_date);
            return {...state, selectionPlan: entity, submissionIsClosed};
        }
        case RECEIVE_SUMMIT: {
            const entity = {...payload.response};
            return {...state, summit: entity, marketingSettings: null, selectionPlan: null, allSummitDocs: entity.summit_documents, baseLoaded: false};
        }
        case SUMMIT_DOCS_RECEIVED: {
            const {data} = payload.response;
            return {...state, allSummitDocs: data};
        }
        case RECEIVE_MARKETING_SETTINGS: {
            const {data} = payload.response;
            // set color vars
            if (typeof document !== 'undefined') {
                data.forEach(setting => {
                    if (getComputedStyle(document.documentElement).getPropertyValue(`--${setting.key}`)) {
                        document.documentElement.style.setProperty(`--${setting.key}`, setting.value);
                        document.documentElement.style.setProperty(`--${setting.key}50`, `${setting.value}50`);
                    }
                });
            }
            return {...state, marketingSettings: data};
        }
        case SELECTION_CLOSED: {
            return {...state, selectionPlan: null, submissionIsClosed : true};
        }
        default:
            return state;
    }
}

export default baseReducer
