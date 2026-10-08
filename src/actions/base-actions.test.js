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
import { getAllowedSelectionPlan, getAllowedSelectionPlans } from './base-actions';

const mockHandlerErrors = [];

// Same contract as uicore's responseHandler: from the request callback it calls
// errorHandler(err, res)(dispatch, state) and only then rejects. If that call throws, the
// exception escapes the callback and the promise never settles.
jest.mock('openstack-uicore-foundation/lib/utils/actions', () => ({
    getRequest: (requestAction, receiveAction, url, errorHandler) => () => (dispatch, state) =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                const err = { status: 500 };
                try {
                    errorHandler(err, {})(dispatch, state);
                } catch (e) {
                    mockHandlerErrors.push(e);
                    return;
                }
                reject({ err, dispatch, state });
            }, 0);
        }),
    createAction: (type) => (payload) => ({ type, payload }),
    stopLoading: () => ({ type: 'STOP_LOADING' }),
    startLoading: () => ({ type: 'START_LOADING' }),
    authErrorHandler: jest.fn(() => () => {}),
}));
jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));
jest.mock('../history', () => ({ push: jest.fn() }));
jest.mock('../utils/methods', () => ({ getAccessTokenSafely: async () => 'token' }));

const settles = (promise) => Promise.race([
    promise.then(() => 'resolved', () => 'rejected'),
    new Promise((resolve) => setTimeout(() => resolve('pending'), 200)),
]);

describe('selection plan loading errors', () => {
    const getState = () => ({ baseState: { summit: { id: 1, slug: 'summit' } } });

    beforeAll(() => {
        global.window = { API_BASE_URL: 'https://api.example' };
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockHandlerErrors.length = 0;
    });

    // before the fix console.log was the error handler; uicore called its undefined return
    // value as a thunk, threw "is not a function" and the promise never settled

    it('getAllowedSelectionPlans reports a failure through authErrorHandler and rejects', async () => {
        const dispatch = jest.fn((action) => action);

        const outcome = await settles(getAllowedSelectionPlans(1)(dispatch, getState));

        expect(mockHandlerErrors).toEqual([]);
        expect(outcome).toBe('rejected');
        expect(authErrorHandler).toHaveBeenCalled();
    });

    it('getAllowedSelectionPlan reports a failure through authErrorHandler and rejects', async () => {
        const dispatch = jest.fn((action) => action);

        const outcome = await settles(getAllowedSelectionPlan(89)(dispatch, getState));

        expect(mockHandlerErrors).toEqual([]);
        expect(outcome).toBe('rejected');
        expect(authErrorHandler).toHaveBeenCalled();
    });
});
