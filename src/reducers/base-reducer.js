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

import { START_LOADING, STOP_LOADING, RESET_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import {
    RECEIVE_TAG_GROUPS,
    CLEAR_SUMMIT,
    ERROR_RECEIVE_SUMMIT,
    RECEIVE_SUMMIT,
    RECEIVE_MARKETING_SETTINGS,
    BASE_LOADED,
    REQUEST_MARKETING_SETTINGS,
    REQUEST_AVAILABLE_SUMMITS,
    RECEIVE_ALLOWED_SELECTION_PLANS,
    REQUEST_SELECTION_PLAN_SETTINGS,
    RECEIVE_SELECTION_PLAN_SETTINGS,
    RECEIVE_ALLOWED_SELECTION_PLAN
} from "../actions/base-actions";
import { RECEIVE_SPEAKER_INFO } from '../actions/auth-actions';
import {PROFILE_PIC_ATTACHED} from "../actions/speaker-actions";
import {setDefaultColors, setDocumentColors, formatSelectionPlanSettings} from "../utils/methods";


const DEFAULT_STATE = {
    tagGroups: [],
    loading: false,
    countries: [],
    speaker: null,
    summit: null,
    marketingSettings: null,
    selectionPlansSettings: {},
    submissionIsClosed: false,
    baseLoaded: false,
    allowedSelectionPlans: [],
};

const baseReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch(type){
        case RESET_LOADING:
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
            return {...state, summit: null, marketingSettings: null, submissionIsClosed: false, baseLoaded: false};
        case ERROR_RECEIVE_SUMMIT:
            return {...state, summit: null, marketingSettings: null, submissionIsClosed: false};
        case RECEIVE_SUMMIT: {
            const entity = payload.response;
            return {...state, summit: entity, marketingSettings: null, baseLoaded: false};
        }
        case REQUEST_AVAILABLE_SUMMITS:
        case REQUEST_MARKETING_SETTINGS: {
            setDefaultColors();
            return {...state, marketingSettings: null};
        }
        case RECEIVE_MARKETING_SETTINGS: {
            const {data} = payload.response;
            // set color vars
            setDocumentColors(data);
            const selectionPlansSettings = formatSelectionPlanSettings(data);
            return {...state, marketingSettings: data, selectionPlansSettings: selectionPlansSettings};
        }
        case RECEIVE_ALLOWED_SELECTION_PLANS: {
            const {data} = payload.response;
            return {...state, summit: {...state.summit, selection_plans: data}};
        }
        case REQUEST_SELECTION_PLAN_SETTINGS: {
            return {...state, selectionPlansSettings: {}};
        }
        case RECEIVE_SELECTION_PLAN_SETTINGS: {
            const {data} = payload.response;
            const selectionPlansSettings = formatSelectionPlanSettings(data);
            let newSelectionPlansSettings = { ...state.selectionPlansSettings, ...selectionPlansSettings};
            return {...state, marketingSettings: data, selectionPlansSettings: newSelectionPlansSettings} ;
        }
        case RECEIVE_ALLOWED_SELECTION_PLAN: {
            const newSelectionPlan = payload.response;
            const updatedSelectionPlans = [...state.summit.selection_plans.filter(sp => sp.id !== newSelectionPlan.id), newSelectionPlan];
            return {...state, summit: {...state.summit, selection_plans: updatedSelectionPlans}};
        }
        default:
            return state;
    }
}

export default baseReducer
