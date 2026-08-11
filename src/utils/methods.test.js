/**
 * Copyright 2018 OpenStack Foundation
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

import { getAllowedLandingSelectionPlanId } from './methods';
import { SP_LANDING } from './constants';

describe('getAllowedLandingSelectionPlanId', () => {
    const setLanding = (value) => {
        global.localStorage = {
            getItem: (key) => (key === SP_LANDING && value !== null ? String(value) : null)
        };
    };

    const summitWithPlans = (...ids) => ({selection_plans: ids.map(id => ({id}))});

    it('returns the landing plan id when the user is allowed to submit to it', () => {
        setLanding(123);

        expect(getAllowedLandingSelectionPlanId(summitWithPlans(45, 123))).toBe(123);
    });

    it('returns null when the landing plan is not among the allowed plans', () => {
        // stale SP_LANDING: id kept from another summit or a closed plan.
        // this is the precondition of the /all-plans/{id}/profile redirect loop
        setLanding(999);

        expect(getAllowedLandingSelectionPlanId(summitWithPlans(45, 123))).toBeNull();
    });

    it('returns null when no landing plan was ever stored', () => {
        setLanding(null);

        expect(getAllowedLandingSelectionPlanId(summitWithPlans(45, 123))).toBeNull();
    });

    it('returns null when the stored value is not a usable plan id', () => {
        setLanding('');
        expect(getAllowedLandingSelectionPlanId(summitWithPlans(45, 123))).toBeNull();

        setLanding('not-a-plan');
        expect(getAllowedLandingSelectionPlanId(summitWithPlans(45, 123))).toBeNull();
    });

    it('returns null for a non-positive id even if a plan matches it', () => {
        setLanding(0);

        expect(getAllowedLandingSelectionPlanId(summitWithPlans(0, 123))).toBeNull();
    });

    it('returns null when the allowed plans are not loaded yet', () => {
        setLanding(123);

        expect(getAllowedLandingSelectionPlanId(undefined)).toBeNull();
        expect(getAllowedLandingSelectionPlanId({})).toBeNull();
    });
});
