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

import Presentation from './presentation';

jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));

const DAY = 86400;
const NOW = Math.floor(Date.now() / 1000);
const openPlan = { id: 89, is_enabled: true, allow_new_presentations: true, submission_begin_date: NOW - DAY, submission_end_date: NOW + DAY };

const newPresentation = (selectionPlan) => new Presentation(
    { id: 0, progress: 'NEW', speakers: [] },
    { selection_plans: [] },
    selectionPlan,
    { id: 5, member: { id: 7 } },
    [],
);

describe('Presentation.canCreate', () => {
    it('allows a new presentation while the submission window is open', () => {
        expect(newPresentation(openPlan).canCreate()).toBe(true);
    });

    it('refuses once the submission window has ended or before it starts', () => {
        expect(newPresentation({ ...openPlan, submission_end_date: NOW - 3600 }).canCreate()).toBe(false);
        expect(newPresentation({ ...openPlan, submission_begin_date: NOW + 3600 }).canCreate()).toBe(false);
    });

    it('refuses when the plan does not allow new presentations', () => {
        expect(newPresentation({ ...openPlan, allow_new_presentations: false }).canCreate()).toBe(false);
    });

    it('refuses on a disabled or missing plan', () => {
        expect(newPresentation({ ...openPlan, is_enabled: false }).canCreate()).toBe(false);
        expect(newPresentation(null).canCreate()).toBe(false);
    });
});
