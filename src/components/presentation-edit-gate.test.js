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
import { PresentationEditGate, mapStateToProps } from './presentation-edit-gate';

const lockedFor = ({ canEdit = true, canCreate = true, nowUtc = 1000, ...overrides } = {}) => mapStateToProps(
    { clockState: { nowUtc } },
    {
        presentation: { canEdit: jest.fn(() => canEdit), canCreate: jest.fn(() => canCreate) },
        isNew: false,
        presentationId: '10',
        entityId: 10,
        ...overrides,
    },
).locked;

describe('PresentationEditGate', () => {
    const redirectUrl = '/app/summit/all-plans/89/presentations/10/preview';
    const children = 'routes';

    it('renders the routes while unlocked', () => {
        expect(PresentationEditGate({ locked: false, redirectUrl, children })).toBe(children);
    });

    it('replaces the routes with a redirect once locked', () => {
        const result = PresentationEditGate({ locked: true, redirectUrl, children });

        expect(result.type).toBe(Redirect);
        expect(result.props.to).toBe(redirectUrl);
    });
});

describe('PresentationEditGate mapStateToProps', () => {
    it('is unlocked while the presentation is editable', () => {
        expect(lockedFor()).toBe(false);
    });

    it('locks once the presentation can no longer be edited', () => {
        expect(lockedFor({ canEdit: false })).toBe(true);
    });

    it('waits for the first clock tick before locking', () => {
        expect(lockedFor({ canEdit: false, nowUtc: null })).toBe(false);
    });

    it('does not lock a stale entity from another presentation', () => {
        expect(lockedFor({ canEdit: false, entityId: 11 })).toBe(false);
    });

    it('gates a new presentation on canCreate, not canEdit', () => {
        expect(lockedFor({ isNew: true, canEdit: false, canCreate: true })).toBe(false);
        expect(lockedFor({ isNew: true, canEdit: true, canCreate: false })).toBe(true);
    });

    it('gates a new presentation before the first clock tick', () => {
        expect(lockedFor({ isNew: true, canCreate: false, nowUtc: null })).toBe(true);
    });
});
