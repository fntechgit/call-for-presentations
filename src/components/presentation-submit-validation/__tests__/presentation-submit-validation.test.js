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

import T from 'i18n-react/dist/i18n-react';
import en from '../../../i18n/en.json';
import { getSpeakerLimits, getSpeakerCountErrorField, validateSpeakerCount, getSubmitValidationError } from '..';

T.setTexts(en);

describe('getSpeakerLimits', () => {
    it('returns zero/zero when no event type is available yet', () => {
        expect(getSpeakerLimits(null)).toEqual({ min: 0, max: 0 });
        expect(getSpeakerLimits(undefined)).toEqual({ min: 0, max: 0 });
    });

    it.each([
        [0, 5], // an explicit 0 minimum must pass through as-is, not be coerced to a default
        [3, 3]  // an exact-count configuration (min equals max)
    ])('honors an explicit min_speakers=%i, max_speakers=%i configuration', (min, max) => {
        expect(getSpeakerLimits({ min_speakers: min, max_speakers: max })).toEqual({ min, max });
    });

    it('clamps max_speakers up to min_speakers when the event type is misconfigured with max below min', () => {
        expect(getSpeakerLimits({ min_speakers: 3, max_speakers: 1 })).toEqual({ min: 3, max: 3 });
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

describe('getSubmitValidationError', () => {
    // regression coverage for the Complete-action bypass: this is the exact function
    // both PresentationSpeakersForm and PresentationReviewForm call before submitting,
    // so a presentation missing its mandatory moderator or its required speaker count
    // must be rejected from either entry point, not just the Speakers step.

    it('blocks submission when a mandatory moderator is missing', () => {
        const entity = {
            type: { use_moderator: true, is_moderator_mandatory: true, use_speakers: false, min_speakers: 0, max_speakers: 0 },
            moderator: null,
            speakers: []
        };
        const result = getSubmitValidationError(entity, {});

        expect(result.errorField).toBe('add_moderator');
        expect(T.translate(`edit_presentation.errors.${result.errorField}`, result.params))
            .toBe('You need to add a moderator to the presentation.');
    });

    it('checks the mandatory moderator before the speaker count', () => {
        // a presentation missing both must still report the moderator error first -
        // this is the exact ordering PresentationSpeakersForm always validated, and
        // the one PresentationReviewForm's Complete action used to skip entirely.
        const entity = {
            type: { use_moderator: true, is_moderator_mandatory: true, use_speakers: true, min_speakers: 1, max_speakers: 1 },
            moderator: null,
            speakers: []
        };
        const result = getSubmitValidationError(entity, {});

        expect(result.errorField).toBe('add_moderator');
    });

    it('blocks submission when the speaker count is below the minimum', () => {
        const entity = {
            type: { use_moderator: false, is_moderator_mandatory: false, use_speakers: true, min_speakers: 2, max_speakers: 5 },
            moderator: null,
            speakers: []
        };
        const result = getSubmitValidationError(entity, {});

        expect(result.errorField).toBe('add_speakers');
        expect(T.translate(`edit_presentation.errors.${result.errorField}`, result.params))
            .toBe('You need to add between 2 and 5 speakers to the presentation.');
    });

    it('blocks submission when the speaker count exceeds the maximum', () => {
        const entity = {
            type: { use_moderator: false, is_moderator_mandatory: false, use_speakers: true, min_speakers: 1, max_speakers: 2 },
            moderator: null,
            speakers: [{ id: 1 }, { id: 2 }, { id: 3 }]
        };
        const result = getSubmitValidationError(entity, {});

        expect(result.errorField).toBe('remove_speakers');
        expect(T.translate(`edit_presentation.errors.${result.errorField}`, result.params))
            .toBe('You can have at most 2 speakers in the presentation. Please remove 1.');
    });

    it.each([
        ['the moderator and speaker-count requirements are both satisfied', {
            type: { use_moderator: true, is_moderator_mandatory: true, use_speakers: true, min_speakers: 1, max_speakers: 2 },
            moderator: { id: 1 },
            speakers: [{ id: 2 }]
        }],
        ['the event type requires neither a moderator nor any speakers', {
            type: { use_moderator: false, is_moderator_mandatory: false, use_speakers: false, min_speakers: 0, max_speakers: 0 },
            moderator: null,
            speakers: []
        }]
    ])('returns null when %s', (_description, entity) => {
        expect(getSubmitValidationError(entity, {})).toBeNull();
    });
});
