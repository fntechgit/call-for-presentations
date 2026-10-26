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
import { EditSpeakerPage } from './edit-speaker-page';

jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));
jest.mock('../components/speaker-form', () => () => null);
jest.mock('../actions/speaker-actions', () => ({
    getSpeaker: jest.fn(),
    resetSpeakerForm: jest.fn(),
    saveSpeaker: jest.fn(),
    getOrganizationalRoles: jest.fn(),
}));
jest.mock('../history', () => ({ push: jest.fn() }));

const SPEAKERS_URL = '/app/summit/all-plans/2/presentations/3/speakers';

const makeProps = (overrides = {}) => ({
    history: { push: jest.fn() },
    summit: { slug: 'summit' },
    selectionPlan: { id: 2 },
    selectionPlansSettings: {},
    currentPresentation: { id: 3 },
    match: { params: {} },
    location: { state: undefined },
    entity: {},
    loading: false,
    loadedOrgRoles: true,
    loggedInSpeaker: { id: 1 },
    speakerPermission: 0,
    getSpeaker: jest.fn(),
    resetSpeakerForm: jest.fn(),
    saveSpeaker: jest.fn(),
    getOrganizationalRoles: jest.fn(),
    ...overrides,
});

describe('EditSpeakerPage without router state (CFP-PROD-E, CFP-PROD-D)', () => {
    beforeEach(() => jest.clearAllMocks());

    it('redirects to the presentation speakers step on mount instead of crashing', () => {
        const props = makeProps();
        const page = new EditSpeakerPage(props);

        expect(() => page.componentDidMount()).not.toThrow();
        expect(props.history.push).toHaveBeenCalledTimes(1);
        expect(props.history.push).toHaveBeenCalledWith(SPEAKERS_URL);
        expect(props.resetSpeakerForm).not.toHaveBeenCalled();
    });

    it('redirects to the presentation speakers step on new props instead of crashing', () => {
        const props = makeProps();
        const page = new EditSpeakerPage(props);

        expect(() => page.componentWillReceiveProps(props)).not.toThrow();
        expect(props.history.push).toHaveBeenCalledTimes(1);
        expect(props.history.push).toHaveBeenCalledWith(SPEAKERS_URL);
    });

    it('goes back to the speakers step after the access denied popup', async () => {
        Swal.fire.mockReturnValue(Promise.resolve({ value: true }));
        const props = makeProps({
            match: { params: { speaker_id: '5' } },
            speakerPermission: { approved: false, speaker_id: 5 },
        });
        const page = new EditSpeakerPage(props);

        page.render();
        await new Promise(process.nextTick);

        expect(Swal.fire).toHaveBeenCalledTimes(1);
        expect(props.history.push).toHaveBeenCalledWith(SPEAKERS_URL);
    });
});
