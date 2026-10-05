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

import * as Sentry from '@sentry/react';
import { initLogOut } from 'openstack-uicore-foundation/lib/security/methods';
import PresentationUploadsForm from './presentation-uploads-form';

jest.mock('@sentry/react', () => ({ captureMessage: jest.fn() }));
jest.mock('awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css', () => ({}));
jest.mock('openstack-uicore-foundation/lib/components', () => ({ RawHTML: () => null, UploadInputV2: () => null }));
jest.mock('openstack-uicore-foundation/lib/utils/methods', () => ({ findElementPos: () => 0 }));
jest.mock('openstack-uicore-foundation/lib/security/methods', () => ({ initLogOut: jest.fn() }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));
jest.mock('./presentation-submit-buttons', () => () => null);
jest.mock('../utils/methods', () => ({ scrollToError: jest.fn() }));

const makeForm = () => new PresentationUploadsForm({ entity: { id: 10, media_uploads: [] }, errors: {} });

describe('PresentationUploadsForm.onUploadError', () => {
    beforeEach(() => jest.clearAllMocks());

    it('reports a dropped-connection upload failure to Sentry', () => {
        makeForm().onUploadError('Server responded with 0 code.', undefined, 'media_upload_5');

        expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
        expect(Sentry.captureMessage).toHaveBeenCalledWith(
            'Media upload failed: Server responded with 0 code.',
            expect.objectContaining({
                level: 'error',
                tags: { upload_status: 'none' },
                extra: expect.objectContaining({ presentation_id: 10, upload_input: 'media_upload_5' }),
            })
        );
    });

    it('reports a server error response with its status and message', () => {
        makeForm().onUploadError({ message: 'server error' }, 500, 'media_upload_5');

        expect(Sentry.captureMessage).toHaveBeenCalledWith(
            'Media upload failed: server error',
            expect.objectContaining({ tags: { upload_status: 500 } })
        );
    });

    it('reports the same failure once when the upload input repeats it per chunk', () => {
        const form = makeForm();
        for (let i = 0; i < 6; i++) form.onUploadError('Server responded with 0 code.', undefined, 'media_upload_5');

        expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    });

    it('keeps logging out on 403 without reporting to Sentry', () => {
        makeForm().onUploadError({ detail: 'forbidden' }, 403, 'media_upload_5');

        expect(initLogOut).toHaveBeenCalledTimes(1);
        expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });
});
