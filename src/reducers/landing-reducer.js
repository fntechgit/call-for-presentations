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

import { START_LOADING, STOP_LOADING, LOGOUT_USER } from "openstack-uicore-foundation/lib/actions";
import {RECEIVE_SUMMIT_PUBLIC, RECEIVE_SELECTION_PLAN_PUBLIC, SELECTION_CLOSED, RECEIVE_MARKETING_SETTINGS} from "../actions/base-actions";


const DEFAULT_STATE = {
    selectionPlan: null,
    summit: null,
    marketingSettings: null,
}

const landingReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type){
        case LOGOUT_USER:
            return DEFAULT_STATE;
        break;
        case RECEIVE_SELECTION_PLAN_PUBLIC: {
            let entity = {...payload.response};

            return {...state, selectionPlan: entity};
        }
        break;
        case RECEIVE_SUMMIT_PUBLIC: {
            let entity = {...payload.response};

            return {...state, summit: entity};
        }
        break;
        case RECEIVE_MARKETING_SETTINGS: {
            return {...state, marketingSettings: payload.response.data};
        }
        break;
        case SELECTION_CLOSED: {
            return {...state, selectionPlan: null};
        }
        break;
        default:
            return state;
        break;
    }
}

export default landingReducer
