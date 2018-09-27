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
import
{
    RECEIVE_PRESENTATION,
    RESET_PRESENTATION,
    UPDATE_PRESENTATION,
    PRESENTATION_UPDATED,
    PRESENTATION_ADDED
} from '../actions/presentation-actions';

import { LOGOUT_USER } from '../actions/auth-actions';
import { VALIDATE, RECEIVE_EVENT_CATEGORY } from '../actions/base-actions';


export const DEFAULT_ENTITY = {
    id: 0,
    progress: 'NEW',
    progressNum: 0,
    title: '',
    type_id: 0,
    track_id: 0,
    description: '',
    social_description: '',
    attendees_expected_learnt: '',
    attending_media: 0,
    links: ['','','','',''],
    extra_questions: [],
    tags: [],
    speakers:[]
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    track: null,
    steps:[
        {name: 'NEW', step: 0},
        {name: 'SUMMARY', step: 1},
        {name: 'TAGS', step: 2},
        {name: 'SPEAKERS', step: 3},
        {name: 'REVIEW', step: 4},
        {name: 'COMPLETE', step: 5}
    ],
    errors: {}
}

const presentationReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
            break;
        case RESET_PRESENTATION: {
            return DEFAULT_STATE;
        }
            break;
        case UPDATE_PRESENTATION: {
            return {...state,  entity: {...state.entity, ...payload}, errors: {} };
        }
            break;
        case RECEIVE_PRESENTATION: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.hasOwnProperty('links')) {
                entity.links = entity.links.map(l => l.link);
                let length = entity.links.length;
                entity.links.length = 5;
                entity.links.fill('', length, 5);
            }

            entity.progressNum = state.steps.find(s => s.name == entity.progress).step;

            return {...state, entity: {...state.entity, ...entity}, errors: {} };
        }
        case PRESENTATION_ADDED:
        case PRESENTATION_UPDATED: {
            return {...state };
        }
        case RECEIVE_EVENT_CATEGORY: {
            let entity = {...payload.response};
            return {...state, track: {...entity}};
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        default:
            return state;
    }

}

export default presentationReducer
