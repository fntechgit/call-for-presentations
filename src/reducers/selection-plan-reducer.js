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
import {RECEIVE_SELECTION_PLAN_SETTINGS} from "../actions/base-actions";


const DEFAULT_STATE = {
    selection_plans: []    
};

const selectionPlanReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch(type){
        case LOGOUT_USER:
            return DEFAULT_STATE;
            break;
        case RECEIVE_SELECTION_PLAN_SETTINGS:
            let data = payload.response.data;
            const selectionPlanId = data[0].selection_plan_id;
            // parse data
            const settings = data.map(ms => ({ [ms.key]: ms.value}));
            // array to object
            const marketing_setting = Object.assign(...settings, {});
            const selectionPlans = [...state.selection_plans.filter(sp => sp.selection_plan_id !== selectionPlanId)];
            return {...state, selection_plans: [...selectionPlans, { selection_plan_id: selectionPlanId, marketingSettings: marketing_setting}]};
        default:
            return state;
            break;
    }
};

export default selectionPlanReducer
