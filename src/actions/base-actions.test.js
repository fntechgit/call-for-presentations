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
import {getAllFromSummit, getMarketingSettings, BASE_LOADED, REQUEST_MARKETING_SETTINGS, RECEIVE_MARKETING_SETTINGS} from './base-actions';

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

describe('getAllFromSummit', () => {
    let pending;

    // the summit resolves right away; every other request stays pending until the test resolves it
    const mockRequests = () => {
        pending = {};
        getRequest.mockImplementation((requestAction, receiveAction, endpoint) => () => () => {
            if (endpoint.endsWith('/summits/all/my-summit')) return Promise.resolve({response: {id: 10}});
            return new Promise(resolve => { pending[endpoint] = resolve; });
        });
    };

    const flush = () => new Promise(resolve => setTimeout(resolve, 0));

    const run = (withSpeakerData) => {
        const getState = () => ({});
        const dispatch = jest.fn(action => typeof action === 'function' ? action(dispatch, getState) : action);
        return {dispatch, result: getAllFromSummit('my-summit', withSpeakerData)(dispatch, getState)};
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.window = {API_BASE_URL: 'https://api', MARKETING_API_BASE_URL: 'https://marketing'};
        mockRequests();
    });

    it('requests the marketing settings, tag groups and allowed selection plans in parallel', async () => {
        const {dispatch, result} = run(true);
        await flush();

        expect(Object.keys(pending).sort()).toEqual([
            'https://api/api/v1/summits/10/selection-plans/me',
            'https://api/api/v1/summits/10/track-tag-groups',
            'https://marketing/api/public/v1/config-values/all/shows/10',
        ]);
        expect(dispatch).not.toHaveBeenCalledWith({type: BASE_LOADED, payload: {loaded: true}});

        pending['https://marketing/api/public/v1/config-values/all/shows/10']({response: {last_page: 1, data: []}});
        pending['https://api/api/v1/summits/10/track-tag-groups']({response: {data: []}});
        pending['https://api/api/v1/summits/10/selection-plans/me']({response: {data: []}});

        await expect(result).resolves.toEqual({id: 10});
        expect(dispatch).toHaveBeenCalledWith({type: BASE_LOADED, payload: {loaded: true}});
    });

    it('only loads the marketing settings when no speaker data is asked for', async () => {
        const {result} = run(false);
        await flush();

        expect(Object.keys(pending)).toEqual(['https://marketing/api/public/v1/config-values/all/shows/10']);

        pending['https://marketing/api/public/v1/config-values/all/shows/10']({response: {last_page: 1, data: []}});
        await expect(result).resolves.toEqual({id: 10});
    });
});
