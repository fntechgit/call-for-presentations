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

import {getRequest} from 'openstack-uicore-foundation/lib/utils/actions';
import {getMarketingSettings, REQUEST_MARKETING_SETTINGS, RECEIVE_MARKETING_SETTINGS} from './base-actions';

jest.mock('openstack-uicore-foundation/lib/utils/actions', () => ({
    getRequest: jest.fn(),
    createAction: (type) => (payload) => ({type, payload}),
    stopLoading: () => ({type: 'STOP_LOADING'}),
    startLoading: () => ({type: 'START_LOADING'}),
    authErrorHandler: jest.fn(),
}));
jest.mock('i18n-react/dist/i18n-react', () => ({translate: (key) => key}));
jest.mock('sweetalert2', () => ({fire: jest.fn()}));
jest.mock('../history', () => ({push: jest.fn()}));
jest.mock('../utils/methods', () => ({getAccessTokenSafely: async () => 'token'}));

describe('getMarketingSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.window = {MARKETING_API_BASE_URL: 'https://marketing'};
    });

    it('fetches the summit and selection plan values from the show endpoint in one request', async () => {
        getRequest.mockImplementation(() => () => () =>
            Promise.resolve({response: {last_page: 1, data: [{key: 'A', selection_plan_id: 0}, {key: 'B', selection_plan_id: 5}]}}));
        const dispatch = jest.fn();

        await getMarketingSettings(10)(dispatch);

        expect(getRequest).toHaveBeenCalledTimes(1);
        expect(getRequest.mock.calls[0][2]).toBe('https://marketing/api/public/v1/config-values/all/shows/10');
        expect(dispatch).toHaveBeenCalledWith({type: REQUEST_MARKETING_SETTINGS, payload: {}});
        expect(dispatch).toHaveBeenCalledWith({
            type: RECEIVE_MARKETING_SETTINGS,
            payload: {response: {data: [{key: 'A', selection_plan_id: 0}, {key: 'B', selection_plan_id: 5}]}}
        });
    });

    it('requests the remaining pages without a selection plan filter and joins them in page order', async () => {
        const requestedPages = [];
        getRequest.mockImplementation(() => (params) => () => {
            requestedPages.push(params);
            return Promise.resolve({response: {last_page: 3, data: [{key: `K${params.page}`}]}});
        });
        const dispatch = jest.fn();

        await getMarketingSettings(10)(dispatch);

        expect(requestedPages).toEqual([{page: 1, per_page: 100}, {page: 2, per_page: 100}, {page: 3, per_page: 100}]);
        expect(dispatch).toHaveBeenLastCalledWith({
            type: RECEIVE_MARKETING_SETTINGS,
            payload: {response: {data: [{key: 'K1'}, {key: 'K2'}, {key: 'K3'}]}}
        });
    });
});
