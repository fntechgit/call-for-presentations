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
    RECEIVE_SPEAKER_PROFILE,
    RESET_PROFILE_FORM,
    UPDATE_SPEAKER_PROFILE,
    SPEAKER_PROFILE_UPDATED,
    PROFILE_PIC_ATTACHED,
    RECEIVE_ORG_ROLES
} from '../actions/speaker-actions';

import { RECEIVE_SPEAKER_INFO } from '../actions/auth-actions';
import {AFFILIATION_ADDED, AFFILIATION_DELETED, AFFILIATION_SAVED} from '../actions/member-actions'
import { LOGOUT_USER, RECEIVE_USER_INFO, VALIDATE } from 'openstack-uicore-foundation/lib/actions';

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

const profileReducer = (state = DEFAULT_STATE, action) => {
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
        case RECEIVE_USER_INFO: {
            let entity = {...payload.response};
            return {
                ...state,
                entity: {
                    ...DEFAULT_ENTITY,
                    email: entity.email,
                    last_name: entity.last_name,
                    first_name: entity.first_name
                },
                errors: {}
            };
        }
        break;
        case UPDATE_SPEAKER_PROFILE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RECEIVE_SPEAKER_INFO: {
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
        case PROFILE_PIC_ATTACHED: {
            let pic = state.entity.pic + '?' + new Date().getTime();
            return {...state, entity: {...state.entity, pic: pic} };;
        }
        case SPEAKER_PROFILE_UPDATED: {
            return state;
        }
        break;
        case AFFILIATION_ADDED: {
            let affiliation = {...payload.response};
            let affiliations = [...state.entity.affiliations, affiliation];
            return {...state, entity: {...state.entity, affiliations: affiliations}, errors: {} };
        }
        break;
        case AFFILIATION_SAVED: {
            let {affiliation} = payload;
            let affiliations = state.entity.affiliations.map(a => {
                    if (a.id == affiliation.id) return affiliation;
                    return a;
                }
            );
            return {...state, entity: {...state.entity, affiliations: affiliations}, errors: {} };
        }
        break;
        case AFFILIATION_DELETED: {
            let {affiliationId} = payload;
            let affiliations = state.entity.affiliations.filter(a => a.id != affiliationId);
            return {...state, entity: {...state.entity, affiliations: affiliations}, errors: {} };
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

export default profileReducer;
