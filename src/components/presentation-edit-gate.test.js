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

import { Redirect } from 'react-router-dom';
import { PresentationEditGate } from './presentation-edit-gate';

const renderGate = ({ canEdit = true, ...overrides } = {}) => PresentationEditGate({
    presentation: { canEdit: jest.fn(() => canEdit) },
    isNew: false,
    presentationId: '10',
    entityId: 10,
    pathname: '/app/summit/all-plans/89/presentations/10/summary',
    previewUrl: '/app/summit/all-plans/89/presentations/10/preview',
    nowUtc: 1000,
    ...overrides,
});

describe('PresentationEditGate', () => {
    it('renders nothing while the presentation is editable', () => {
        expect(renderGate()).toBeNull();
    });

    it('redirects to the preview once the presentation can no longer be edited', () => {
        const result = renderGate({ canEdit: false });

        expect(result.type).toBe(Redirect);
        expect(result.props.to).toBe('/app/summit/all-plans/89/presentations/10/preview');
    });

    it('waits for the first clock tick before gating', () => {
        expect(renderGate({ canEdit: false, nowUtc: null })).toBeNull();
    });

    it('does not redirect again when already on the preview', () => {
        expect(renderGate({ canEdit: false, pathname: '/app/summit/all-plans/89/presentations/10/preview' })).toBeNull();
    });

    it('does not gate a new presentation or a stale entity from another presentation', () => {
        expect(renderGate({ canEdit: false, isNew: true })).toBeNull();
        expect(renderGate({ canEdit: false, entityId: 11 })).toBeNull();
    });
});
