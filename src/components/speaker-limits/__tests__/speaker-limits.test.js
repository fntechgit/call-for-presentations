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

import { getSpeakerLimits, getSpeakerCountErrorField } from '..';

describe('getSpeakerLimits', () => {
    it('returns zero/zero when no event type is available yet', () => {
        expect(getSpeakerLimits(null)).toEqual({ min: 0, max: 0 });
        expect(getSpeakerLimits(undefined)).toEqual({ min: 0, max: 0 });
    });

    it('defaults to at-least-one with no upper bound when speakers are mandatory and no explicit limits are configured', () => {
        expect(getSpeakerLimits({ are_speakers_mandatory: true })).toEqual({ min: 1, max: Infinity });
    });

    it('defaults to optional/unbounded when speakers are enabled but not mandatory and no explicit limits are configured', () => {
        expect(getSpeakerLimits({ use_speakers: true, are_speakers_mandatory: false })).toEqual({ min: 0, max: Infinity });
    });

    it('defaults to zero/zero when the event type does not use speakers at all', () => {
        expect(getSpeakerLimits({ use_speakers: false, are_speakers_mandatory: false })).toEqual({ min: 0, max: 0 });
    });

    it('honors an explicit min_speakers of 0 even when speakers are mandatory', () => {
        // min_speakers=0 is a real, distinct configuration from "unset" - the
        // nullish check must not treat 0 as missing and fall back to defaultMin=1.
        expect(getSpeakerLimits({ are_speakers_mandatory: true, min_speakers: 0 })).toEqual({ min: 0, max: Infinity });
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

    it('reports add_min_number_speakers when there is no upper bound', () => {
        expect(getSpeakerCountErrorField(0, 2, Infinity)).toBe('add_min_number_speakers');
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
