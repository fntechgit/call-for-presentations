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

import T from "i18n-react/dist/i18n-react";

export const getSpeakerLimits = (type) => {
    if (!type) return { min: 0, max: 0 };
    // min_speakers/max_speakers are non-nullable ints on the API's PresentationType
    // (see PresentationTypeSerializer) - always present, never Infinity/unbounded.
    const { min_speakers: min, max_speakers: max } = type;
    // Protection against invalid configuration of max_speakers < min_speakers
    return { min, max: max >= min ? max : min };
};

export const getSpeakerCountErrorField = (speakersCount, minSpeakers, maxSpeakers) => {
    if (speakersCount > maxSpeakers) return "remove_speakers";

    switch (true) {
        // There should be only one speaker
        case (minSpeakers === maxSpeakers && maxSpeakers === 1):
            return "add_only_one_speaker";
        // There should be exactly a number of speakers
        case (minSpeakers === maxSpeakers && maxSpeakers !== 1):
            return "add_exact_number_of_speakers";
        // The default error message when there is an upper limit and a minimum of speakers
        default:
            return "add_speakers";
    }
};

// Single source of truth for "is this presentation's speaker count valid" - used both
// by the Speakers step (on save) and the Review step (on final Complete), so the
// Complete action can't finalize a presentation the Speakers step would have rejected.
export const validateSpeakerCount = (entity) => {
    if (!entity?.type?.use_speakers) return { valid: true };

    const speakersCount = Array.isArray(entity.speakers) ? entity.speakers.length : 0;
    const { min, max } = getSpeakerLimits(entity.type);

    if (speakersCount <= max && speakersCount >= min) return { valid: true };

    return {
        valid: false,
        errorField: getSpeakerCountErrorField(speakersCount, min, max),
        min,
        max,
        excess: speakersCount - max
    };
};

// Single source of truth for the presentation-level "can this be submitted" check -
// used by both the Speakers step (Save) and the Review step (Complete), so a
// presentation missing its mandatory moderator or its required speaker count can't
// be finalized from either entry point. The moderator requirement is checked first,
// matching the order the Speakers step originally validated in.
export const getSubmitValidationError = (entity, selectionPlanSettings) => {
    const presentation = selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation").toLowerCase();
    const validModerator = !entity.type.use_moderator || !entity.type.is_moderator_mandatory || entity.moderator;

    if (!validModerator) {
        return { errorField: "add_moderator", params: { presentation } };
    }

    const speakerValidation = validateSpeakerCount(entity);

    if (!speakerValidation.valid) {
        const speaker = (selectionPlanSettings?.CFP_SPEAKERS_SINGULAR_LABEL || T.translate("edit_presentation.speaker")).toLowerCase();
        const speakers = (selectionPlanSettings?.CFP_SPEAKERS_PLURAL_LABEL || T.translate("edit_presentation.speakers")).toLowerCase();
        const { errorField, min, max, excess } = speakerValidation;
        return { errorField, params: { presentation, speaker, speakers, max, min, excess } };
    }

    return null;
};
