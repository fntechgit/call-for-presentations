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
import { VALIDATE } from '../actions/base-actions';


export const DEFAULT_ENTITY = {
    progress: 3,
    id: 0,
    title: '',
    type_id: 0,
    track_id: 1,
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
            return {...state,  entity: {...payload}, errors: {} };
        }
            break;
        case RECEIVE_PRESENTATION: {
            let entity = {...payload.response};
            let registration_code = '', on_site_phone = '', registered = false, checked_in = false, confirmed = false;

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.hasOwnProperty('registration_code')) {
                entity.registration_code = entity.registration_code.code;
                entity.code_redeemed = entity.registration_code.redeemed;
            }

            if (entity.hasOwnProperty('summit_assistance')) {
                entity.on_site_phone = entity.summit_assistance.on_site_phone;
                entity.registered = entity.summit_assistance.registered;
                entity.checked_in = entity.summit_assistance.checked_in;
                entity.confirmed = entity.summit_assistance.confirmed;
            }

            return {...state, entity: {...state.entity, ...entity}, errors: {} };
        }
        case PRESENTATION_ADDED:
        case PRESENTATION_UPDATED: {
            return {...state, step: 2 };
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        default:
            return state;
    }

}

export default presentationReducer
