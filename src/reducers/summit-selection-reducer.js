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

import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import {RECEIVE_AVAILABLE_SUMMITS} from "../actions/base-actions";


const DEFAULT_STATE = {
    availableSummits: []
};

const summitSelectionReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch(type){
        case LOGOUT_USER:
            return DEFAULT_STATE;
            break;
        case RECEIVE_AVAILABLE_SUMMITS:
            let summits = [...payload.response.data];
            return {...state, availableSummits: summits};
        default:
            return state;
            break;
    }
};

export default summitSelectionReducer
