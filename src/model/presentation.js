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
import {formatEpoch} from "../utils/methods";

class Presentation {

    constructor(presentation, summit, selectionPlan, loggedUser, tagGroups){
        this._presentation  = presentation;
        this._selectionPlan = selectionPlan;
        this._user = loggedUser;
        this._summit = summit;
        this._presentation.selectionPlan = summit.selection_plans.find(sp => sp.id === presentation.selection_plan_id);
        this._tagGroups = tagGroups;
        this._track = null;

        this._steps = [
            {name: 'NEW', lcName: 'new', step: 0},
            {name: 'SUMMARY', lcName: 'summary', step: 1, showInNav: true},
            {name: 'UPLOADS', lcName: 'uploads', step: 2, showInNav: false},
            {name: 'TAGS', lcName: 'tags', step: 3, showInNav: false},
            {name: 'SPEAKERS', lcName: 'speakers', step: 4, showInNav: true},
            {name: 'REVIEW', lcName: 'review', step: 5, showInNav: true},
            {name: 'COMPLETE', lcName: 'complete', step: 6}
        ];

        this.updatePresentation(presentation);
    }

    updatePresentation(presentation, track = null) {
        this._presentation  = presentation;
        const allowedMediaUploads = this.getAllowedMediaUploads();
        const groupedTags = this.getAllowedTags();

        if (track && this._presentation.track_id === track.id) {
            this._track = track;
        }

        this._steps.forEach(stp => {
            if (stp.name === 'UPLOADS' && this._presentation.type) stp.showInNav = (allowedMediaUploads.length > 0);
            if (stp.name === 'TAGS' && this._presentation.track_id) stp.showInNav = (groupedTags.length > 0);
        });

        const currentStep = this.getCurrentStep();

        this._presentation.progressNum = currentStep.step;
    }

    getStatus(nowUtc) {
      const { is_published, status, selection_status, selectionPlan } = this._presentation;
        const { selection_begin_date, selection_end_date, submission_lock_down_presentation_status_date } = selectionPlan || {};

        if (is_published) return T.translate("presentations.published");
        if (!status) return T.translate("presentations.not_submitted");

        if(submission_lock_down_presentation_status_date && submission_lock_down_presentation_status_date > 0){
            if(submission_lock_down_presentation_status_date > nowUtc){
                // we are on lock down period
                return T.translate("presentations.in_review");
            }
            if (!selection_status || selection_status === 'unaccepted') {
                // presentation is rejected
                return T.translate("presentations.rejected");
            }
            // send the presentation status with first letter in uppercase
            return `${selection_status[0].toUpperCase()}${selection_status.slice(1)}`;
        }
        // check if we have a selection plan and a valid selection period ( old logic)
        else if (selection_begin_date && selection_end_date && selection_begin_date <= selection_end_date ) {
            if (selection_begin_date > nowUtc) {
                // selection process didnt started yet
                return T.translate("presentations.received");
            }
            if (selection_end_date < nowUtc) {
                // selection process ended already
                if (!selection_status || selection_status === 'unaccepted') {
                    // presentation is rejected
                    return T.translate("presentations.rejected");
                }
                // send the presentation status with first letter in uppercase
                return `${selection_status[0].toUpperCase()}${selection_status.slice(1)}`;
            }
            if (selection_begin_date < nowUtc) {
                // if selection process didnt started yet
                return T.translate("presentations.in_review");
            }
        }
        return T.translate("presentations.received");
    }

    isSubmitted() {
        return (this._presentation.is_published || this._presentation.status === 'Received');
    }

    canEdit() {
        if (!this._selectionPlan) return false;

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

            return `/app/${this._summit.slug}/${this._selectionPlan.id}/presentations/${this._presentation.id}/${step}`;
        } else {
            return `/app/${this._summit.slug}/${this._selectionPlan.id}/presentations/${this._presentation.id}/preview`;
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
                let tags = allowedTags.filter( tag => group.allowed_tags.map(t => t.tag_id).includes(tag.id) );
                return ({name: group.name, tags: tags});
            });

            groupedTags = groupedTags.filter(gr => gr.tags.length > 0);
        }

        return groupedTags;
    };

    getCurrentStep() {
        let currentStep = this._steps.find(s => s.name === this._presentation.progress);

        while(!currentStep.showInNav && currentStep.step < (this._steps.length - 1)) {
            currentStep = this._steps[currentStep.step + 1];
        }

        return currentStep;
    }

    getNextStep() {
        const progressNum = this._presentation.progressNum || 1;
        const reviewStep = this._steps.find(stp => stp.name === 'REVIEW');
        let nextStep = progressNum > 4 ? reviewStep : this._steps[progressNum + 1];

        while(!nextStep.showInNav && nextStep.step < (this._steps.length - 1)) {
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

        while(!nextStep.showInNav && nextStep.step < (this._steps.length - 1)) {
            nextStep = this._steps[nextStep.step + 1];
        }

        return nextStep.lcName;
    }

    getStepNameBefore(stepName) {
        const stepIdx = this._steps.findIndex(stp => stp.name === stepName.toUpperCase());
        let nextStep = this._steps[stepIdx - 1];

        while(!nextStep.showInNav && nextStep.step > 0) {
            nextStep = this._steps[nextStep.step - 1];
        }

        return nextStep.lcName;
    }

    getPresentationProgress() {
        return this._presentation.progressNum;
    }

}

export default Presentation;
