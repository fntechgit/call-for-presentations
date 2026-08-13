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

export const getSpeakerLimits = (type) => {
    if (!type) return { min: 0, max: 0 };
    const defaultMin = type.are_speakers_mandatory ? 1 : 0;
    const defaultMax = (type.are_speakers_mandatory || type.use_speakers) ? Infinity : 0;
    const min = type.min_speakers ?? defaultMin;
    const possibleMax = type.max_speakers ?? defaultMax;
    // Protection against invalid configuration of max_speakers < min_speakers
    const max = possibleMax >= min ? possibleMax : min;
    return { min, max };
};

export const getSpeakerCountErrorField = (speakersCount, minSpeakers, maxSpeakers) => {
    if (speakersCount > maxSpeakers) return "remove_speakers";

    switch (true) {
        // There is no upper limit of speakers but there is a minimum
        case (Infinity === maxSpeakers):
            return "add_min_number_speakers";
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
