/**
 * Copyright 2026 OpenStack Foundation
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

import baseReducer from './base-reducer';
import {RECEIVE_MARKETING_SETTINGS} from '../actions/base-actions';

jest.mock('openstack-uicore-foundation/lib/utils/actions', () => ({
    getRequest: jest.fn(),
    createAction: (type) => (payload) => ({type, payload}),
    stopLoading: () => ({type: 'STOP_LOADING'}),
    startLoading: () => ({type: 'START_LOADING'}),
    authErrorHandler: jest.fn(),
    RESET_LOADING: 'RESET_LOADING',
    START_LOADING: 'START_LOADING',
    STOP_LOADING: 'STOP_LOADING',
}));
jest.mock('openstack-uicore-foundation/lib/security/actions', () => ({LOGOUT_USER: 'LOGOUT_USER'}));
jest.mock('../history', () => ({push: jest.fn()}));

describe('baseReducer RECEIVE_MARKETING_SETTINGS', () => {
    it('keeps the summit values apart from the per selection plan ones', () => {
        const data = [
            {key: 'spkmgmt_disclaimer', value: 'summit', selection_plan_id: 0},
            {key: 'spkmgmt_disclaimer', value: 'plan 5', selection_plan_id: 5},
            {key: 'CFP_LANDING_PAGE_TITLE', value: 'title 7', selection_plan_id: 7},
        ];

        const state = baseReducer(undefined, {type: RECEIVE_MARKETING_SETTINGS, payload: {response: {data}}});

        expect(state.marketingSettings).toEqual([data[0]]);
        expect(state.selectionPlansSettings).toEqual({
            5: {spkmgmt_disclaimer: 'plan 5'},
            7: {CFP_LANDING_PAGE_TITLE: 'title 7'},
        });
    });
});
