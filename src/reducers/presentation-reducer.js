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
    PRESENTATION_ADDED,
    PRESENTATION_COMPLETED,
    PRESENTATION_MATERIAL_ATTACHED,
    PRESENTATION_MATERIAL_DELETED
} from '../actions/presentation-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { RECEIVE_EVENT_CATEGORY } from '../actions/base-actions';
import {
    SPEAKER_ASSIGNED,
    SPEAKER_REMOVED,
    MODERATOR_ASSIGNED,
    MODERATOR_REMOVED,
    PIC_ATTACHED
} from '../actions/speaker-actions';


export const DEFAULT_ENTITY = {
    id: 0,
    progress: 'NEW',
    title: '',
    type_id: 0,
    track_id: 0,
    level: '',
    description: '',
    social_description: '',
    attendees_expected_learnt: '',
    attending_media: 0,
    will_all_speakers_attend: 0,
    links: ['','','','',''],
    extra_questions: [],
    tags: [],
    speakers: [],
    moderator: null,
    media_uploads:[],
    public_comments: [],
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    track: null,
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
            let entity = {...payload};
            return {...state, entity: {...state.entity, ...entity}, errors: {} };
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

            if (entity.hasOwnProperty('media_uploads')) {
                entity.media_uploads = entity.media_uploads.map((item, index) => ({...item, index: index}));
            }

            if(entity.type) {
                entity.type_id = entity.type.id;
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, errors: {} };
        }
        break;
        case PRESENTATION_ADDED:
        case PRESENTATION_COMPLETED:
        case PRESENTATION_UPDATED: {
            let entity = {...payload.response};

            // these come un expanded, we need to use what we had
            delete entity.speakers;
            delete entity.links;
            delete entity.tags;
            delete entity.extra_questions;

            let tmp_entity = {...state.entity, ...entity};

            return {...state, entity: tmp_entity };
        }
        break;
        case PRESENTATION_MATERIAL_ATTACHED: {
            let material = {...payload.response};
            return {...state, errors: {}, entity: {...state.entity, media_uploads: [...state.entity.media_uploads, material] }};
        }
        break;
        case PRESENTATION_MATERIAL_DELETED: {
            let {materialId} = payload;
            const media_uploads = state.entity.media_uploads.filter(mu => mu.id !== materialId);
            return {...state, errors: {}, entity: {...state.entity, media_uploads: media_uploads} };
        }
        break;
        case RECEIVE_EVENT_CATEGORY: {
            let entity = {...payload.response};
            return {...state, track: {...entity}};
        }
        break;
        case SPEAKER_ASSIGNED: {
            let {speaker} = payload;
            let speakers = state.entity.speakers.filter(s => s.id != speaker.id);
            return {...state, entity: {...state.entity, speakers: [...speakers, speaker]}};
        }
        break;
        case SPEAKER_REMOVED: {
            let {speakerId} = payload;
            let speakers = state.entity.speakers.filter(s => s.id != speakerId);
            return {...state, entity: {...state.entity, speakers: speakers}};
        }
        break;
        case MODERATOR_ASSIGNED: {
            let {moderator} = payload;
            return {...state, entity: {...state.entity, moderator: moderator}};
        }
        break;
        case MODERATOR_REMOVED: {
            let {moderatorId} = payload;
            return {...state, entity: {...state.entity, moderator: null}};
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
