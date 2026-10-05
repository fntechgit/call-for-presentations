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

import Swal from 'sweetalert2';
import { getPresentation } from './presentation-actions';

const mockHandlerErrors = [];

// Same contract as uicore's responseHandler: from superagent's async callback it calls
// errorHandler(err, res)(dispatch, state) and only then rejects. If that call throws, the
// exception escapes the callback and the promise never settles.
jest.mock('openstack-uicore-foundation/lib/utils/actions', () => ({
    getRequest: (requestActionCreator, receiveActionCreator, endpoint, errorHandler) =>
        () => (dispatch, state) => new Promise((resolve, reject) => {
            setTimeout(() => {
                const err = { status: undefined, message: 'Timeout of 60000ms exceeded' };
                try {
                    errorHandler(err, undefined)(dispatch, state);
                } catch (e) {
                    mockHandlerErrors.push(e);
                    return;
                }
                reject({ err, dispatch, state });
            }, 0);
        }),
    putRequest: jest.fn(),
    postRequest: jest.fn(),
    deleteRequest: jest.fn(),
    createAction: (type) => (payload) => ({ type, payload }),
    stopLoading: () => ({ type: 'STOP_LOADING' }),
    startLoading: () => ({ type: 'START_LOADING' }),
    showMessage: jest.fn(),
    authErrorHandler: jest.fn(),
}));
jest.mock('openstack-uicore-foundation/lib/security/methods', () => ({ doLoginBasicLogin: jest.fn() }));
jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));
jest.mock('../history', () => ({ push: jest.fn() }));
jest.mock('./base-actions', () => ({ getAllowedSelectionPlans: jest.fn() }));
jest.mock('../utils/methods', () => ({ getAccessTokenSafely: async () => 'token' }));

describe('getPresentation', () => {
    beforeAll(() => {
        global.window = { API_BASE_URL: 'https://api.example' };
    });

    it('reports a failed load through presentationErrorHandler and rejects instead of crashing', async () => {
        const dispatch = jest.fn((action) => action);
        const getState = () => ({ baseState: { summit: { id: 1, slug: 'summit' }, tagGroups: [] } });

        // before the fix the error handler returned undefined, uicore called it as a thunk
        // ("a(...) is not a function", CFP-PROD-3 / CFP-PROD-C) and the promise never settled
        const outcome = await Promise.race([
            getPresentation(10)(dispatch, getState).then(() => 'resolved', () => 'rejected'),
            new Promise((resolve) => setTimeout(() => resolve('pending'), 200)),
        ]);

        expect(mockHandlerErrors).toEqual([]);
        expect(outcome).toBe('rejected');
        expect(Swal.fire).toHaveBeenCalledWith('ERROR', 'errors.server_error', 'error');
        expect(dispatch).toHaveBeenCalledWith({ type: 'STOP_LOADING' });
    });
});
