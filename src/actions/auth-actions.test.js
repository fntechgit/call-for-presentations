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

import { authErrorHandler } from 'openstack-uicore-foundation/lib/utils/actions';
import { getUserInfo } from 'openstack-uicore-foundation/lib/security/actions';
import { getSpeakerInfo } from './auth-actions';

// whatever the error handler returns; uicore discards it, so a rejection here is never handled
const mockHandlerResults = [];
const mockRequestError = { current: null };

// Same contract as uicore's responseHandler: call errorHandler(err, res)(dispatch, state), ignore its
// return value, then reject.
jest.mock('openstack-uicore-foundation/lib/utils/actions', () => ({
    getRequest: (requestAction, receiveAction, url, errorHandler) => () => (dispatch, state) => {
        const err = mockRequestError.current;
        mockHandlerResults.push(errorHandler(err, {})(dispatch, state));
        return Promise.reject({ err, dispatch, state });
    },
    createAction: (type) => (payload) => ({ type, payload }),
    stopLoading: () => ({ type: 'STOP_LOADING' }),
    startLoading: () => ({ type: 'START_LOADING' }),
    authErrorHandler: jest.fn(() => ({ type: 'AUTH_ERROR' })),
}));
jest.mock('openstack-uicore-foundation/lib/security/actions', () => ({
    getUserInfo: jest.fn(() => () => Promise.resolve()),
}));
jest.mock('../utils/methods', () => ({ getAccessTokenSafely: async () => 'token' }));

describe('getSpeakerInfo', () => {
    beforeAll(() => {
        global.window = { API_BASE_URL: 'https://api.example' };
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockHandlerResults.length = 0;
    });

    it('falls back to the member on 404 without the error handler rejecting (CFP-PROD-1)', async () => {
        mockRequestError.current = { status: 404 };
        const dispatch = jest.fn((action) => action);

        await getSpeakerInfo()(dispatch, () => ({}));

        // before the fix the handler returned Promise.reject('not found'), which nothing could catch
        await expect(mockHandlerResults[0]).resolves.toBeUndefined();
        expect(getUserInfo).toHaveBeenCalledWith('groups');
        expect(authErrorHandler).not.toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith({ type: 'STOP_LOADING' });
    });

    it('reports other errors through authErrorHandler', async () => {
        mockRequestError.current = { status: 500 };
        const dispatch = jest.fn((action) => action);

        await getSpeakerInfo()(dispatch, () => ({}));

        await expect(mockHandlerResults[0]).resolves.toEqual({ type: 'AUTH_ERROR' });
        expect(authErrorHandler).toHaveBeenCalledWith({ status: 500 }, {});
    });
});
