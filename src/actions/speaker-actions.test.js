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
import { authErrorHandler, showMessage } from 'openstack-uicore-foundation/lib/utils/actions';
import { getSpeakerInfo } from './auth-actions';
import {
    getSpeakerPermission,
    requestSpeakerPermission,
    saveSpeaker,
    saveSpeakerProfile,
    SPEAKER_BIG_PIC_ATTACHED,
} from './speaker-actions';

// per-request outcome keyed by "METHOD /path"; anything not listed succeeds with mockDefaultResponse
const mockOutcomes = {};
const mockCalls = [];
const mockDefaultResponse = { id: 7, url: 'https://cdn.example/pic.png' };

// Same contract as uicore's responseHandler: on failure it calls errorHandler(err, res)(dispatch, state)
// and then rejects; on success it dispatches the receive action and resolves with {response}.
const mockRequest = (method, receiveAction, url, errorHandler) => () => (dispatch, state) => {
    const key = `${method} ${url.replace('https://api.example', '')}`;
    mockCalls.push(key);
    const outcome = mockOutcomes[key] || {};

    return Promise.resolve(outcome.wait).then(() => {
        if (outcome.status) {
            const err = { status: outcome.status, response: { body: { errors: ['file param not set!'] } } };
            if (errorHandler) errorHandler(err, {})(dispatch, state);
            return Promise.reject({ err, dispatch, state });
        }
        const response = mockDefaultResponse;
        if (typeof receiveAction === 'function') dispatch(receiveAction({ response }));
        return { response };
    });
};

jest.mock('openstack-uicore-foundation/lib/utils/actions', () => ({
    getRequest: (requestAction, receiveAction, url, errorHandler) => mockRequest('GET', receiveAction, url, errorHandler),
    putRequest: (requestAction, receiveAction, url, body, errorHandler) => mockRequest('PUT', receiveAction, url, errorHandler),
    postRequest: (requestAction, receiveAction, url, body, errorHandler) => mockRequest('POST', receiveAction, url, errorHandler),
    deleteRequest: (requestAction, receiveAction, url, errorHandler) => mockRequest('DELETE', receiveAction, url, errorHandler),
    createAction: (type) => (payload) => ({ type, payload }),
    stopLoading: () => ({ type: 'STOP_LOADING' }),
    startLoading: () => ({ type: 'START_LOADING' }),
    showMessage: jest.fn(() => ({ type: 'SHOW_MESSAGE' })),
    showSuccessMessage: jest.fn(() => ({ type: 'SHOW_SUCCESS_MESSAGE' })),
    authErrorHandler: jest.fn(() => () => {}),
}));
jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));
jest.mock('sweetalert2', () => ({ fire: jest.fn(() => Promise.resolve({ value: false })) }));
jest.mock('../history', () => ({ push: jest.fn() }));
jest.mock('./auth-actions', () => ({ getSpeakerInfo: jest.fn(() => ({ type: 'GET_SPEAKER_INFO' })) }));
jest.mock('../utils/methods', () => ({
    getAccessTokenSafely: async () => 'token',
    getSubmissionsPath: () => 'all-plans',
}));

const getState = () => ({
    baseState: { summit: { id: 1, slug: 'summit' } },
    profileState: { entity: { id: 1 } },
    presentationState: { entity: { id: 10, selection_plan_id: 89 } },
});

const makeDispatch = () => {
    const dispatch = jest.fn((action) => (typeof action === 'function' ? action(dispatch, getState) : action));
    return dispatch;
};

const deferred = () => {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    return { promise, resolve };
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

const makeSpeaker = (overrides = {}) => ({
    id: 7,
    company: 'Acme',
    areas_of_expertise: [],
    other_presentation_links: [],
    organizational_roles: [],
    ...overrides,
});

const pic = { name: 'pic.png' };
const bigPic = { name: 'big.png' };

let unhandled;
const onUnhandled = (reason) => unhandled.push(reason);

beforeAll(() => {
    global.window = { API_BASE_URL: 'https://api.example' };
    process.on('unhandledRejection', onUnhandled);
});

afterAll(() => process.off('unhandledRejection', onUnhandled));

beforeEach(() => {
    jest.clearAllMocks();
    mockCalls.length = 0;
    Object.keys(mockOutcomes).forEach((key) => delete mockOutcomes[key]);
    unhandled = [];
});

afterEach(async () => {
    await flush();
    expect(unhandled).toEqual([]);
});

const successMessages = () => showMessage.mock.calls.filter(([message]) => message && message.type === 'success');

describe('getSpeakerPermission', () => {
    it('shows the request authorization popup on 404 and settles without rejecting (CFP-PROD-A)', async () => {
        mockOutcomes['GET /api/v1/speakers/5/edit-permission'] = { status: 404 };

        await expect(getSpeakerPermission(89, 10, 5, 'speaker')(makeDispatch(), getState)).resolves.toBeUndefined();

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'edit_speaker.auth_required' }));
    });
});

describe('requestSpeakerPermission', () => {
    it('reports a failed request through authErrorHandler without an unhandled rejection', async () => {
        mockOutcomes['PUT /api/v1/speakers/5/edit-permission'] = { status: 500 };
        const state = () => ({ ...getState(), speakerState: { speakerPermissionRequest: 5 } });
        const dispatch = jest.fn((action) => (typeof action === 'function' ? action(dispatch, state) : action));

        await requestSpeakerPermission()(dispatch, state);
        await flush();

        expect(authErrorHandler).toHaveBeenCalled();
    });
});

describe('saveSpeakerProfile', () => {
    it('shows "profile saved" only after both photo uploads finish (update)', async () => {
        const photo = deferred();
        const bigPhoto = deferred();
        mockOutcomes['POST /api/v1/speakers/7/photo'] = { wait: photo.promise };
        mockOutcomes['POST /api/v1/speakers/7/big-photo'] = { wait: bigPhoto.promise };

        const saving = saveSpeakerProfile(makeSpeaker({ pic_file: pic, big_pic_file: bigPic }))(makeDispatch(), getState);
        await flush();

        expect(mockCalls).toEqual(expect.arrayContaining(['PUT /api/v1/speakers/7', 'POST /api/v1/speakers/7/photo', 'POST /api/v1/speakers/7/big-photo']));
        photo.resolve();
        await flush();
        expect(successMessages()).toHaveLength(0);

        bigPhoto.resolve();
        await saving;

        expect(successMessages()).toHaveLength(1);
        expect(successMessages()[0][0].html).toBe('edit_profile.profile_saved');
    });

    it('does not report success when a photo upload fails, and settles (update)', async () => {
        mockOutcomes['POST /api/v1/speakers/7/photo'] = { status: 412 };

        await expect(saveSpeakerProfile(makeSpeaker({ pic_file: pic }))(makeDispatch(), getState)).resolves.toBeUndefined();

        expect(authErrorHandler).toHaveBeenCalled();
        expect(successMessages()).toHaveLength(0);
    });

    it('refreshes the speaker and reports success only after the uploads (create)', async () => {
        const photo = deferred();
        mockOutcomes['POST /api/v1/speakers/7/photo'] = { wait: photo.promise };

        const saving = saveSpeakerProfile(makeSpeaker({ id: 0, pic_file: pic }))(makeDispatch(), getState);
        await flush();

        expect(mockCalls).toEqual(expect.arrayContaining(['POST /api/v1/speakers', 'POST /api/v1/speakers/7/photo']));
        expect(getSpeakerInfo).not.toHaveBeenCalled();
        expect(successMessages()).toHaveLength(0);

        photo.resolve();
        await saving;

        expect(getSpeakerInfo).toHaveBeenCalledTimes(1);
        expect(successMessages()).toHaveLength(1);
    });

    it('does not refresh or report success when a photo upload fails, and settles (create)', async () => {
        mockOutcomes['POST /api/v1/speakers/7/photo'] = { status: 412 };

        await expect(saveSpeakerProfile(makeSpeaker({ id: 0, pic_file: pic }))(makeDispatch(), getState)).resolves.toBeUndefined();

        expect(getSpeakerInfo).not.toHaveBeenCalled();
        expect(successMessages()).toHaveLength(0);
    });
});

describe('saveSpeaker', () => {
    it('uploads both photos, keeping the big photo out of the profile state, before reporting success', async () => {
        const bigPhoto = deferred();
        mockOutcomes['POST /api/v1/speakers/7/big-photo'] = { wait: bigPhoto.promise };
        const dispatch = makeDispatch();

        const saving = saveSpeaker(makeSpeaker({ pic_file: pic, big_pic_file: bigPic }), 'speaker')(dispatch, getState);
        await flush();

        expect(mockCalls).toEqual(expect.arrayContaining(['PUT /api/v1/speakers/7', 'POST /api/v1/speakers/7/photo', 'POST /api/v1/speakers/7/big-photo']));
        expect(successMessages()).toHaveLength(0);

        bigPhoto.resolve();
        await saving;

        const dispatchedTypes = dispatch.mock.calls.map(([action]) => action && action.type);
        expect(dispatchedTypes).toContain(SPEAKER_BIG_PIC_ATTACHED);
        expect(dispatchedTypes).not.toContain('BIG_PIC_ATTACHED');
        expect(successMessages()).toHaveLength(1);
        expect(successMessages()[0][0].html).toBe('edit_speaker.speaker_saved');
    });

    it('does not report success when a photo upload fails, and settles', async () => {
        mockOutcomes['POST /api/v1/speakers/7/photo'] = { status: 412 };

        await expect(saveSpeaker(makeSpeaker({ pic_file: pic }), 'speaker')(makeDispatch(), getState)).resolves.toBeUndefined();

        expect(authErrorHandler).toHaveBeenCalled();
        expect(successMessages()).toHaveLength(0);
    });
});
