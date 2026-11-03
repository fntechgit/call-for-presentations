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
import Swal from 'sweetalert2';
import { initLogOut } from 'openstack-uicore-foundation/lib/security/methods';
import PresentationUploadsForm from './presentation-uploads-form';

jest.mock('@sentry/react', () => ({ captureMessage: jest.fn() }));
jest.mock('awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css', () => ({}));
jest.mock('openstack-uicore-foundation/lib/components/raw-html', () => () => null);
jest.mock('openstack-uicore-foundation/lib/components/inputs/upload-input-v2', () => function UploadInputV2() { return null; });
jest.mock('openstack-uicore-foundation/lib/components/inputs/upload-input-v4', () => function UploadInputV4() { return null; });
jest.mock('openstack-uicore-foundation/lib/css/components/inputs/upload-input-v4.css', () => ({}));
jest.mock('openstack-uicore-foundation/lib/utils/methods', () => ({ findElementPos: () => 0 }));
jest.mock('openstack-uicore-foundation/lib/security/methods', () => ({ initLogOut: jest.fn() }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));
jest.mock('./presentation-submit-buttons', () => () => null);
jest.mock('../utils/methods', () => ({ scrollToError: jest.fn() }));

const mediaType = {
    id: 5,
    name: 'Slides',
    max_size: 10240, // KB, as summit-api serializes it
    max_uploads_qty: 2,
    is_editable: true,
    is_mandatory: false,
    type: { allowed_extensions: ['PDF'] },
};

const makeForm = (props = {}) => new PresentationUploadsForm({ entity: { id: 10, media_uploads: [] }, errors: {}, ...props });

const findByType = (node, name) => {
    if (!node || typeof node !== 'object') return null;
    if (Array.isArray(node)) {
        for (const child of node) {
            const found = findByType(child, name);
            if (found) return found;
        }
        return null;
    }
    if (node.type?.name === name) return node;
    return findByType(node.props?.children, name);
};

const renderUploadInput = (name) => {
    const form = makeForm({
        summit: {},
        presentation: { getAllowedMediaUploads: () => [mediaType] },
        step: 'UPLOADS',
    });
    return findByType(form.render(), name);
};

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

    it('shows the server message from a V4 403 error and logs out', () => {
        const error = Object.assign(new Error('forbidden'), { status: 403 });
        makeForm().onUploadError(error, error.status, 'media_upload_5');

        expect(Swal.fire).toHaveBeenCalledWith('ERROR', 'forbidden', 'error');
        expect(initLogOut).toHaveBeenCalledTimes(1);
        expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it('keeps logging out on 403 without reporting to Sentry', () => {
        makeForm().onUploadError({ detail: 'forbidden' }, 403, 'media_upload_5');

        expect(initLogOut).toHaveBeenCalledTimes(1);
        expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });
});

describe('PresentationUploadsForm upload input selection', () => {
    // jest runs in the node environment, so the env globals app.js sets live on a stub window
    beforeEach(() => { global.window = { FILE_UPLOAD_API_BASE_URL: 'https://files.test' }; });
    afterAll(() => { delete global.window; });

    it('renders UploadInputV4 against the file API base when the flag is "true"', () => {
        window.FILE_UPLOAD_USE_V4 = 'true';

        const input = renderUploadInput('UploadInputV4');

        expect(input).not.toBeNull();
        expect(renderUploadInput('UploadInputV2')).toBeNull();
        expect(input.props.postUrl).toBe('https://files.test/api/v1/files');
        expect(input.props).not.toHaveProperty('djsConfig');
        expect(input.props).not.toHaveProperty('parallelChunkUploads');
    });

    it('passes V4 the max size in MB, converted from the KB summit-api sends', () => {
        window.FILE_UPLOAD_USE_V4 = 'true';

        const input = renderUploadInput('UploadInputV4');

        expect(input.props.getMaxSize()).toBe(10);
        expect(input.props.mediaType.id).toBe(5);
    });

    it.each([undefined, 'false', '1'])('keeps UploadInputV2 on the chunked endpoint when the flag is %p', (flag) => {
        window.FILE_UPLOAD_USE_V4 = flag;

        const input = renderUploadInput('UploadInputV2');

        expect(input).not.toBeNull();
        expect(renderUploadInput('UploadInputV4')).toBeNull();
        expect(input.props.postUrl).toBe('https://files.test/api/v1/files/upload');
        expect(input.props.djsConfig).toEqual({ withCredentials: true });
        expect(input.props.parallelChunkUploads).toBe(true);
    });
});

describe('PresentationUploadsForm.onUploadComplete', () => {
    it('saves the media upload with filepath built from path + name', () => {
        const onSaveMU = jest.fn();
        const form = makeForm({ onSaveMU });

        form.onUploadComplete({ path: 'upload/abc/', name: 'slides.pdf' }, 'media_upload_5', { media_type: mediaType, media_upload: [] });

        expect(onSaveMU).toHaveBeenCalledWith(
            expect.objectContaining({ id: 10 }),
            { id: 0, media_upload_type_id: 5, filepath: 'upload/abc/slides.pdf', filename: 'slides.pdf', should_upload: true }
        );
    });
});
