/**
 * Copyright 2017 OpenStack Foundation
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
    RECEIVE_SPEAKER,
    RESET_SPEAKER_FORM,
    UPDATE_SPEAKER,
    SPEAKER_UPDATED,
    PIC_ATTACHED,
    RECEIVE_ORG_ROLES
} from '../actions/speaker-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';

export const DEFAULT_ENTITY = {
    id: 0,
    title: '',
    first_name: '',
    last_name: '',
    email: '',
    twitter: '',
    irc: '',
    bio: '',
    pic: '',
    affiliations: [],
    available_for_bureau: false,
    willing_to_present_video: false,
    languages: [],
    areas_of_expertise: [],
    other_presentation_links: [],
    willing_to_travel: false,
    funded_travel: false,
    travel_preferences: [],
    organizational_roles: [],
    org_has_cloud: false
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    orgRoles: [],
    errors: {}
};

const speakerReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SPEAKER_FORM: {
            let {email} = payload;
            return { ...state, errors:{}, entity: {...DEFAULT_ENTITY, email: email} };
        }
        break;
        case UPDATE_SPEAKER: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RECEIVE_SPEAKER: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            let areasOfExpertise = entity.areas_of_expertise.map(aoe => ({label: aoe.expertise, value: aoe.id}));
            entity.areas_of_expertise = areasOfExpertise;

            let orgRoles = entity.organizational_roles.map(or => or.id);
            entity.organizational_roles = orgRoles;

            let languages = entity.languages.map(l => l.id);
            entity.languages = languages;

            let travel_preferences = entity.travel_preferences.map(c => c.country_iso_code);
            entity.travel_preferences = travel_preferences;


            return {...state, entity: {...state.entity, ...entity}, errors: {} };
        }
        break;
        case PIC_ATTACHED: {
            let pic = state.entity.pic + '?' + new Date().getTime();
            return {...state, entity: {...state.entity, pic: pic} };;
        }
        case SPEAKER_UPDATED: {
            return state;
        }
        break;
        case RECEIVE_ORG_ROLES: {
            let orgRoles = [...payload.response.data];
            return {...state, orgRoles: orgRoles}
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default speakerReducer;
