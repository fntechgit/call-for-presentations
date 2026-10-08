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

import T from 'i18n-react/dist/i18n-react';
import { PresentationReopenedBanner } from './presentation-reopened-banner';

jest.mock('i18n-react/dist/i18n-react', () => ({ translate: jest.fn((key) => key) }));
jest.mock('openstack-uicore-foundation/lib/utils/methods', () => ({ formatEpoch: (epoch) => `epoch:${epoch}` }));
jest.mock('moment-timezone', () => ({ tz: { guess: () => 'UTC' } }));

describe('PresentationReopenedBanner', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders nothing when submission is not reopened', () => {
        const presentation = { getReopenedUntil: jest.fn(() => null) };

        expect(PresentationReopenedBanner({ presentation, nowUtc: 1000 })).toBeNull();
        expect(presentation.getReopenedUntil).toHaveBeenCalledWith(1000);
    });

    it('announces the reopen deadline reported by the model', () => {
        const presentation = { getReopenedUntil: jest.fn(() => 2000) };

        const banner = PresentationReopenedBanner({ presentation, nowUtc: 1000 });

        expect(banner.props.className).toBe('alert alert-warning');
        expect(T.translate).toHaveBeenCalledWith('edit_presentation.submission_reopened', { end_date: 'epoch:2000', when: 'UTC' });
    });
});
