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
import { UploadInput } from 'openstack-uicore-foundation/lib/components';
import SpeakerForm from './speaker-form';
import { SPEAKER_PHOTO_MAX_SIZE } from '../utils/constants';

jest.mock('awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css', () => ({}));
jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));
jest.mock('openstack-uicore-foundation/lib/utils/methods', () => ({ findElementPos: () => 0 }));
jest.mock('openstack-uicore-foundation/lib/components', () => {
    const stub = () => null;
    return {
        Input: stub, TextEditor: stub, UploadInput: () => null, Exclusive: stub, CountryInput: stub,
        LanguageInput: stub, CheckboxList: stub, FreeMultiTextInput: stub, RegistrationCompanyInput: stub,
    };
});
jest.mock('./affiliationstable', () => () => null);
jest.mock('./inputs/presentation-links', () => () => null);
jest.mock('../utils/methods', () => ({ validate: jest.fn(), scrollToError: jest.fn() }));

const findAllByType = (node, type, found = []) => {
    if (!node || typeof node !== 'object') return found;
    if (Array.isArray(node)) {
        node.forEach((child) => findAllByType(child, type, found));
        return found;
    }
    if (node.type === type) found.push(node);
    return findAllByType(node.props?.children, type, found);
};

const makeForm = () => new SpeakerForm({
    entity: { company: 'Acme', other_presentation_links: [] },
    errors: {},
    member: { id: 1 },
    orgRoles: [],
    summit: { id: 1 },
});

describe('SpeakerForm photo size limit', () => {
    beforeEach(() => jest.clearAllMocks());

    it('limits both photo inputs to the API max size', () => {
        const form = makeForm();
        const uploads = findAllByType(form.render(), UploadInput);

        expect(uploads).toHaveLength(2);
        uploads.forEach((upload) => {
            expect(upload.props.maxSize).toBe(SPEAKER_PHOTO_MAX_SIZE);
            expect(upload.props.handleError).toBe(form.handleUploadError);
        });
    });

    it('warns when a rejected photo is over the limit, so it is never uploaded', () => {
        makeForm().handleUploadError([{ name: 'huge.png', size: SPEAKER_PHOTO_MAX_SIZE + 1 }]);

        expect(Swal.fire).toHaveBeenCalledWith('Validation error', 'edit_speaker.photo_too_large', 'warning');
    });

    it('stays silent for files rejected for another reason, as before', () => {
        makeForm().handleUploadError([{ name: 'notes.pdf', size: 1024 }]);

        expect(Swal.fire).not.toHaveBeenCalled();
    });
});
