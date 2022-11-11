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

import store from '../store';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';
import { CREATED_RECEIVED, SPEAKER_RECEIVED, MODERATOR_RECEIVED, REGROUP_PRESENTATIONS } from '../actions/presentations-actions';
import {PRESENTATION_ADDED, PRESENTATION_DELETED} from '../actions/presentation-actions'
import {CLEAR_SUMMIT} from "../actions/base-actions";
import {updateOrAdd} from "../utils/methods";

const DEFAULT_STATE = {
    presentations_created: [],
    presentations_speaker: [],
    presentations_moderator: [],
    all_presentations: [],
    summitDocs: [],
};

const presentationsReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case CLEAR_SUMMIT: {
            return DEFAULT_STATE;
        }
        case CREATED_RECEIVED: {
            const {presentations_created} = state;
            const {response, selectionPlanId} = payload;
            const presentations = response.data;

            updateOrAdd(presentations_created, {selectionPlanId, presentations}, 'selectionPlanId');

            return {...state, presentations_created};
        }
        case SPEAKER_RECEIVED: {
            const {presentations_speaker} = state;
            const {response, selectionPlanId} = payload;
            let presentations = response.data;
            const createdIds = state.presentations_created.find(sp => sp.selectionPlanId === selectionPlanId)?.presentations.map(p => p.id) || [];

            presentations = presentations.filter(p => !createdIds.includes(p.id));

            updateOrAdd(presentations_speaker, {selectionPlanId, presentations}, 'selectionPlanId');

            return {...state, presentations_speaker};
        }
        case MODERATOR_RECEIVED: {
            const {presentations_moderator} = state;
            const {response, selectionPlanId} = payload;
            let presentations = response.data;
            const createdIds = state.presentations_created.find(sp => sp.selectionPlanId === selectionPlanId)?.presentations.map(p => p.id) || [];

            presentations = presentations.filter(p => !createdIds.includes(p.id));

            updateOrAdd(presentations_moderator, {selectionPlanId, presentations}, 'selectionPlanId');

            return {...state, presentations_moderator};
        }
        case PRESENTATION_DELETED: {
            const {presentationId, selectionPlanId} = payload;
            const {presentations_created, presentations_speaker, presentations_moderator, all_presentations} = state;
            const new_presentations_created = presentations_created
              .find(sp => sp.selectionPlanId === selectionPlanId).presentations
              .filter(p => p.id !== presentationId);
            const new_presentations_speaker = presentations_speaker
              .find(sp => sp.selectionPlanId === selectionPlanId).presentations
              .filter(p => p.id !== presentationId);
            const new_presentations_moderator = presentations_moderator
              .find(sp => sp.selectionPlanId === selectionPlanId).presentations
              .filter(p => p.id !== presentationId);
            const new_all_presentations = all_presentations.filter(p => p.id !== presentationId);
            const newSummitDocs = getSummitDocs(new_all_presentations, store.getState().baseState.allSummitDocs);

            return {
                ...state,
                presentations_created: new_presentations_created,
                presentations_speaker: new_presentations_speaker,
                presentations_moderator: new_presentations_moderator,
                all_presentations: new_all_presentations,
                summitDocs: newSummitDocs
            };
        }
        case PRESENTATION_ADDED: {
            let entity = {...payload.response};
            const new_all_presentations = [...state.all_presentations, entity];
            const summitDocs = getSummitDocs(new_all_presentations, store.getState().baseState.allSummitDocs);

            return {...state, new_all_presentations, summitDocs};
        }
        case REGROUP_PRESENTATIONS: {
            const allCreated = state.presentations_created.reduce((res, item) => [...res, ...item.presentations], []);
            const allSpeaker = state.presentations_speaker.reduce((res, item) => [...res, ...item.presentations], []);
            const allModerator = state.presentations_moderator.reduce((res, item) => [...res, ...item.presentations], []);

            const all_presentations = [...allSpeaker, ...allModerator].reduce((result, item) => {
                if (!result.find(p => p.id === item.id)) {
                    result.push(item);
                }
                return result;
            }, [...allCreated]);

            const summitDocs = getSummitDocs(all_presentations, store.getState().baseState.allSummitDocs);

            return {...state, all_presentations, summitDocs};
        }
        default:
            return state;
    }

};

const getSummitDocs = (allPresentations, allSummitDocs) => {
  const allTypes = [...new Set(allPresentations.map(p => p.type.id))];
  const filteredDocs = allSummitDocs.filter(doc => doc.show_always || doc.event_types.some(r => allTypes.indexOf(r) >= 0));

  return filteredDocs;
};

export default presentationsReducer
