/**
 * Copyright 2022 OpenStack Foundation
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
import { REHYDRATE } from 'redux-persist';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {
    UPDATE_CLOCK,
} from '../actions/clock-actions';

// null, not the browser clock: uicore's Clock leaves state.timestamp null until the time
// service answers, and tick() no-ops until then, so any seed here survives for a whole round
// trip. A device clock running fast past submission_reopened_until would make an active grant
// read as expired, and the resulting redirect to /preview is one-way. Consumers treat null as
// "not known yet" rather than as a time. Ticks arrive in epoch SECONDS, as does the API.
const DEFAULT_STATE = {
    nowUtc: null,
};

const clockReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch (type) {
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case REHYDRATE:
            // A persisted clock is always stale, and builds before this seed was corrected stored
            // milliseconds. The config blacklist cannot discard it: it only filters outbound
            // writes, while autoMergeLevel2 merges every stored key back in on rehydrate. Returning
            // a NEW object is what suppresses that merge, since the reconciler skips any key whose
            // substate the reducer already modified.
            return { nowUtc: null };
        case UPDATE_CLOCK: {
            const { timestamp } = payload;
            return { ...state, nowUtc: timestamp };
        }
        default:
            return state;
    }
};

export default clockReducer;