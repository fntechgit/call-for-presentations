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
import { CREATED_RECEIVED, SPEAKER_RECEIVED, MODERATOR_RECEIVED, PRESENTATION_DELETED } from '../actions/presentations-actions';

const DEFAULT_STATE = {
    presentations_created: [],
    presentations_speaker: [],
    presentations_moderator: []
}

const presentationsReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case CREATED_RECEIVED: {
            let presentations = [...payload.response.data];

            return {...state, presentations_created: presentations};
        }
        break;
        case SPEAKER_RECEIVED: {
            let presentations = [...payload.response.data];
            let createdIds = state.presentations_created.map(p => p.id);

            presentations = presentations.filter(p => !createdIds.includes(p.id));

            return {...state, presentations_speaker: presentations};
        }
        break;
        case MODERATOR_RECEIVED: {
            let presentations = [...payload.response.data];
            let createdIds = state.presentations_created.map(p => p.id);

            presentations = presentations.filter(p => !createdIds.includes(p.id));

            return {...state, presentations_moderator: presentations};
        }
        break;
        case PRESENTATION_DELETED: {
            let {presentationId} = payload;
            let {presentations_created, presentations_speaker, presentations_moderator} = state;
            let new_presentations_created = presentations_created.filter(p => p.id != presentationId);
            let new_presentations_speaker = presentations_speaker.filter(p => p.id != presentationId);
            let new_presentations_moderator = presentations_moderator.filter(p => p.id != presentationId);

            return {
                ...state,
                presentations_created: new_presentations_created,
                presentations_speaker: new_presentations_speaker,
                presentations_moderator: new_presentations_moderator
            };
        }
        break;
        default:
            return state;
    }

}

export default presentationsReducer
