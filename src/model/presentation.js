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

import T from 'i18n-react/dist/i18n-react';
import {formatEpoch, nowBetween} from "../utils/methods";

const SelectionStatus_Accepted = 'accepted';
const SelectionStatus_Alternate = 'alternate';
const SelectionStatus_Rejected = 'unaccepted';
const Status_Received = 'Received';
const Status_Accepted = 'Accepted';

class Presentation {

    /**
     * @param presentation
     * @param summit
     * @param selectionPlan
     * @param loggedUser
     * @param tagGroups
     * @param selectionPlanSettings
     */
    constructor(presentation, summit, selectionPlan, loggedUser, tagGroups, selectionPlanSettings = {}) {
        this._presentation = presentation;
        this._selectionPlan = selectionPlan;
        this._selectionPlanSettings = selectionPlanSettings;
        this._user = loggedUser;
        this._summit = summit;
        this._presentation.selectionPlan = summit.selection_plans.find(sp => sp.id === presentation.selection_plan_id);
        this._tagGroups = tagGroups;
        this._track = null;
        this._submissionIsClosed = selectionPlan ? !nowBetween(selectionPlan.submission_begin_date, selectionPlan.submission_end_date) : true;

        this._steps = [
            {name: 'NEW', lcName: 'new', step: 0},
            {name: 'SUMMARY', lcName: 'summary', step: 1, showInNav: true},
            {name: 'UPLOADS', lcName: 'uploads', step: 2, showInNav: false},
            {name: 'TAGS', lcName: 'tags', step: 3, showInNav: false},
            {name: 'SPEAKERS', lcName: 'speakers', step: 4, showInNav: false},
            {name: 'REVIEW', lcName: 'review', step: 5, showInNav: true},
            {name: 'COMPLETE', lcName: 'complete', step: 6}
        ];

        this.updatePresentation(presentation);
    }

    updatePresentation(presentation, track = null) {
        this._presentation = presentation;

        if (track && this._presentation.track_id === track.id) {
            this._track = track;
        }

        const allowedMediaUploads = this.getAllowedMediaUploads();
        const groupedTags = this.getAllowedTags();
        const showSpeakers = (this._presentation.type?.use_speakers && this._presentation.type?.max_speakers > 0) ||
            (this._presentation.type?.use_moderator && this._presentation.type?.max_moderators > 0);

        this._steps.forEach(stp => {
            if (stp.name === 'UPLOADS' && this._presentation.type) stp.showInNav = (allowedMediaUploads.length > 0);
            if (stp.name === 'TAGS' && this._presentation.track_id) stp.showInNav = (groupedTags.length > 0);
            if (stp.name === 'SPEAKERS' && this._presentation.type) stp.showInNav = showSpeakers;
        });

        const currentStep = this.getCurrentStep();

        this._presentation.progressNum = currentStep.step;
    }

    /**
     * @param nowUtc
     * @returns {React.ReactNode}
     */
    getStatus(nowUtc) {

        const {is_published, status, selection_status, selectionPlan} = this._presentation;
        const {
            submission_begin_date,
            submission_end_date,
            selection_begin_date,
            selection_end_date,
            submission_lock_down_presentation_status_date
        } = selectionPlan || {};

        /**
         * Published - Presentation is published
         * Not Submitted - the submission period is open or closed, the submission is started, but not complete.
         * Received  - the submission is complete and the submission period is open
         * In Review - the submission is complete, submission period is closed, track chairs is open or the
         *             submission_lock_down_presentation_status_date is greater than now.
         * Rejected - the submission is complete, the track chairs is closed, submission is closed, and the presentation is
         *            not in alternate or accepted on teams list.
         * Accepted - the submission is complete, the track chair is closed, submission is closed, and the presentation is
         *            in alternate or accepted on teams list.
         **/

            // submission ( CFP )
            // check submission period
        const submissionOpen = nowUtc >= submission_begin_date && nowUtc <= submission_end_date;
        const submissionClosed = !submissionOpen;
        // selection ( track chairs )
        // check selection period
        const selectionOpen = nowUtc >= selection_begin_date && nowUtc <= selection_end_date;
        const selectionEnded = !selectionOpen;

        // if the presentation is published the Accepted status is returned
        const submissionComplete = [Status_Accepted, Status_Received].includes(status);
        const lockDownPeriod = submission_lock_down_presentation_status_date && submission_lock_down_presentation_status_date > nowUtc;

        const submissionAccepted = [SelectionStatus_Alternate, SelectionStatus_Accepted].includes(selection_status);

        if (!status) return T.translate("presentations.not_submitted");

        if (submissionComplete) {
            // is lock down period is enabled then short-circuit everything
            if (lockDownPeriod || (submissionClosed && selectionOpen)) {
                return T.translate("presentations.in_review");
            } else if (is_published) {
                return T.translate('presentations.published')
            } else if (selectionEnded) {
                return submissionAccepted ? T.translate("presentations.accepted") : T.translate("presentations.rejected")
            } else {
                return T.translate("presentations.received");
            }
        }
        // default state
        return T.translate("presentations.not_submitted");
    }

    isSubmitted() {
        return (this._presentation.is_published || this._presentation.status === 'Received');
    }

    canEdit() {
        if (!this._selectionPlan || this._submissionIsClosed) return false;

        let speakers = this._presentation.speakers.map(s => {
            if (typeof s == 'object') return s.id;
            else return s;
        });

        let creatorId = this._presentation.creator ? this._presentation.creator.id : this._presentation.creator_id;
        let moderatorId = this._presentation.moderator ? this._presentation.moderator.id : this._presentation.moderator_speaker_id;

        let isCreator = (creatorId === this._user.member.id);
        let isSpeaker = speakers.includes(this._user.id);
        let isModerator = (moderatorId === this._user.id);
        let belongsToSP = (this._presentation.selection_plan_id === this._selectionPlan.id);

        return (isCreator || isSpeaker || isModerator) && belongsToSP;
    }

    canDelete() {
        if (!this._selectionPlan) return false;

        let belongsToSP = (this._presentation.selection_plan_id === this._selectionPlan.id);
        return (!this._presentation.is_published && belongsToSP);
    }

    getProgressLink() {

        if (this.canEdit()) {

            let step = 'summary';

            if (this._presentation.progress !== 'COMPLETE') {
                step = this.getNextStepName();
            }

            // default step

            if (this._presentation.id > 0 && this._selectionPlanSettings?.CFP_PRESENTATION_EDITION_DEFAULT_TAB) {
                step = this._selectionPlanSettings?.CFP_PRESENTATION_EDITION_DEFAULT_TAB;
            }

            return `/app/${this._summit.slug}/all-plans/${this._selectionPlan.id}/presentations/${this._presentation.id}/${step}`;
        } else {
            return `/app/${this._summit.slug}/all-plans/${this._selectionPlan.id}/presentations/${this._presentation.id}/preview`;
        }
    }

    getSelectionPlanName() {
        const {selectionPlan} = this._presentation;
        let selectionPlanName = 'N/A';

        if (selectionPlan) {
            const startDate = formatEpoch(selectionPlan.submission_begin_date, 'MMM Do');
            const endDate = formatEpoch(selectionPlan.submission_end_date, 'MMM Do');
            selectionPlanName = `${selectionPlan.name} - ${startDate} to ${endDate}`;
        }

        return selectionPlanName;
    }

    getAllowedMediaUploads() {
        if (this._presentation?.type && this._presentation.type.allowed_media_upload_types.length > 0) {
            return this._presentation.type.allowed_media_upload_types;
        }

        return [];
    }

    getAllowedTags() {
        const track = this._track;
        const tagGroups = this._tagGroups;
        let groupedTags = [];

        if (track && tagGroups.length > 0) {
            let allowedTags = track.allowed_tags.map(t => ({id: t.id, tag: t.tag}));
            groupedTags = tagGroups.map(group => {
                let tags = allowedTags.filter(tag => group.allowed_tags.map(t => t.tag_id).includes(tag.id));
                return ({name: group.name, tags: tags});
            });

            groupedTags = groupedTags.filter(gr => gr.tags.length > 0);
        }

        return groupedTags;
    };

    getCurrentStep() {
        let currentStep = this._steps.find(s => s.name === this._presentation.progress);

        while (!currentStep.showInNav && currentStep.step < (this._steps.length - 1)) {
            currentStep = this._steps[currentStep.step + 1];
        }

        return currentStep;
    }

    getNextStep() {
        const progressNum = this._presentation.progressNum || 1;
        const reviewStep = this._steps.find(stp => stp.name === 'REVIEW');
        let nextStep = progressNum > 4 ? reviewStep : this._steps[progressNum + 1];

        while (!nextStep.showInNav && nextStep.step < (this._steps.length - 1)) {
            nextStep = this._steps[nextStep.step + 1];
        }

        return nextStep;
    }

    getNextStepName() {
        const nextStep = this.getNextStep();
        return nextStep.lcName;
    }

    getStepNameAfter(stepName) {
        const stepIdx = this._steps.findIndex(stp => stp.name === stepName);
        let nextStep = this._steps[stepIdx + 1];

        while (!nextStep.showInNav && nextStep.step < (this._steps.length - 1)) {
            nextStep = this._steps[nextStep.step + 1];
        }

        return nextStep.lcName;
    }

    getStepNameBefore(stepName) {
        const stepIdx = this._steps.findIndex(stp => stp.name === stepName.toUpperCase());
        let nextStep = this._steps[stepIdx - 1];

        while (!nextStep.showInNav && nextStep.step > 0) {
            nextStep = this._steps[nextStep.step - 1];
        }

        return nextStep.lcName;
    }

    getPresentationProgress() {
        return this._presentation.progressNum;
    }

}

export default Presentation;
