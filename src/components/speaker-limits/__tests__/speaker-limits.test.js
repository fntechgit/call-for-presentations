/**
 * Copyright 2017 OpenStack Foundation
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

import { getSpeakerLimits, getSpeakerCountErrorField, validateSpeakerCount } from '..';

describe('getSpeakerLimits', () => {
    it('returns zero/zero when no event type is available yet', () => {
        expect(getSpeakerLimits(null)).toEqual({ min: 0, max: 0 });
        expect(getSpeakerLimits(undefined)).toEqual({ min: 0, max: 0 });
    });

    it('defaults to zero/zero when the event type does not use speakers at all', () => {
        expect(getSpeakerLimits({ use_speakers: false, are_speakers_mandatory: false, min_speakers: 0, max_speakers: 0 })).toEqual({ min: 0, max: 0 });
    });

    it('honors an explicit min_speakers of 0 even when speakers are mandatory', () => {
        // min_speakers=0 is a real, distinct configuration from a positive minimum -
        // the API always sends a concrete min_speakers, so 0 must pass through as-is.
        expect(getSpeakerLimits({ are_speakers_mandatory: true, min_speakers: 0, max_speakers: 5 })).toEqual({ min: 0, max: 5 });
    });

    it('honors an explicit finite range', () => {
        expect(getSpeakerLimits({ use_speakers: true, min_speakers: 2, max_speakers: 5 })).toEqual({ min: 2, max: 5 });
    });

    it('honors an explicit exact-count configuration (min equals max)', () => {
        expect(getSpeakerLimits({ use_speakers: true, min_speakers: 3, max_speakers: 3 })).toEqual({ min: 3, max: 3 });
    });

    it('clamps max_speakers up to min_speakers when the event type is misconfigured with max below min', () => {
        expect(getSpeakerLimits({ use_speakers: true, min_speakers: 3, max_speakers: 1 })).toEqual({ min: 3, max: 3 });
    });

    it('honors an explicit max_speakers of 0 when min is also 0', () => {
        expect(getSpeakerLimits({ use_speakers: true, min_speakers: 0, max_speakers: 0 })).toEqual({ min: 0, max: 0 });
    });
});

describe('getSpeakerCountErrorField', () => {
    it('reports remove_speakers when the count exceeds the max, even for an exact-count requirement', () => {
        // over-max must win over the min===max branch below - a submitter over
        // the limit needs to be told to remove speakers, not to add the exact count.
        expect(getSpeakerCountErrorField(5, 3, 3)).toBe('remove_speakers');
    });

    it('reports add_only_one_speaker when exactly one speaker is required', () => {
        expect(getSpeakerCountErrorField(0, 1, 1)).toBe('add_only_one_speaker');
    });

    it('reports add_exact_number_of_speakers when an exact count greater than one is required', () => {
        expect(getSpeakerCountErrorField(1, 3, 3)).toBe('add_exact_number_of_speakers');
    });

    it('reports add_speakers for a bounded range with distinct min and max', () => {
        expect(getSpeakerCountErrorField(0, 2, 5)).toBe('add_speakers');
    });
});

describe('validateSpeakerCount', () => {
    it('is valid when the event type does not use speakers at all, regardless of count', () => {
        expect(validateSpeakerCount({ type: { use_speakers: false }, speakers: [] })).toEqual({ valid: true });
    });

    it('is invalid when exactly one speaker is required and none were added', () => {
        const result = validateSpeakerCount({ type: { use_speakers: true, min_speakers: 1, max_speakers: 1 }, speakers: [] });
        expect(result.valid).toBe(false);
        expect(result.errorField).toBe('add_only_one_speaker');
    });

    it('is valid once enough speakers were added to satisfy the minimum', () => {
        const speakers = [{ id: 1 }, { id: 2 }];
        expect(validateSpeakerCount({ type: { use_speakers: true, min_speakers: 2, max_speakers: 5 }, speakers })).toEqual({ valid: true });
    });

    it('is invalid, with the correct excess, when the count exceeds the max', () => {
        // regression test for the Complete-action bypass: a speaker removed on the Speakers step
        // can leave a presentation over/under limits without ever re-running this check there, so
        // this same function must also gate the Review step's Complete action before it submits.
        const speakers = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const result = validateSpeakerCount({ type: { use_speakers: true, min_speakers: 1, max_speakers: 2 }, speakers });
        expect(result).toEqual({ valid: false, errorField: 'remove_speakers', min: 1, max: 2, excess: 1 });
    });

    it('is invalid when the entity has no speakers array at all', () => {
        const result = validateSpeakerCount({ type: { use_speakers: true, min_speakers: 1, max_speakers: 1 } });
        expect(result.valid).toBe(false);
        expect(result.errorField).toBe('add_only_one_speaker');
    });
});
