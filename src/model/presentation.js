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
import moment from "moment";
import {NavStepsDefinitions} from "../components/presentation-nav/nav-steps-definition";

class Presentation {

    constructor(presentation, summit, selectionPlan, loggedUser){
        this._presentation  = presentation;
        this._selectionPlan = selectionPlan;
        this._user = loggedUser;
        this._summit = summit;
        this._steps = [
            {name: 'NEW', step: 0},
            {name: 'SUMMARY', step: 1},
            {name: 'UPLOADS', step: 2},
            {name: 'TAGS', step: 3},
            {name: 'SPEAKERS', step: 4},
            {name: 'REVIEW', step: 5},
            {name: 'COMPLETE', step: 6}
        ];

        this._presentation.selectionPlan = summit.selection_plans.find(sp => sp.id === presentation.selection_plan_id);
        this._presentation.progressNum = this._steps.find(s => s.name === this._presentation.progress).step;
    }

    updatePresentation(presentation) {
        this._presentation  = presentation;
        this._presentation.progressNum = this._steps.find(s => s.name === this._presentation.progress).step;
    }

    getStatus() {
        const {is_published, status, selection_status} = this._presentation;
        const enabled_sel_plans = this._summit.selection_plans.filter(sp => sp.is_enabled);
        const firstSelPlan = enabled_sel_plans.length > 0 ? enabled_sel_plans[0] : null;
        const lastSelPlan = enabled_sel_plans.length > 0 ? enabled_sel_plans[enabled_sel_plans.length - 1] : null;
        const now  = moment.utc().unix();

        if (is_published) {
            return T.translate("presentations.published");
        } else {
            if (!status) {
                return T.translate("presentations.not_submitted");
            } else if (firstSelPlan && lastSelPlan) {
                if (firstSelPlan.selection_begin_date > now) {
                    return T.translate("presentations.received");
                } else if (lastSelPlan.selection_end_date < now) {
                    if (!selection_status || selection_status === 'unaccepted') {
                        return T.translate("presentations.rejected");
                    } else {
                        return `${selection_status[0].toUpperCase()}${selection_status.slice(1)}`;
                    }
                } else if (firstSelPlan.selection_begin_date < now) {
                    return T.translate("presentations.in_review");
                }
            } else {
                return T.translate("presentations.received");
            }
        }
    }

    isSubmitted() {
        return (this._presentation.is_published || this._presentation.status == 'Received');
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
            let progress = this._presentation.progress.toLowerCase();
            let step = 'summary';

            if (progress !== 'complete') {
                step = this.getNextStep();
            }

            return `/app/${this._summit.slug}/presentations/${this._presentation.id}/${step}`;
        } else {
            return `/app/${this._summit.slug}/presentations/${this._presentation.id}/preview`;
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

    getEventType() {
        if (this._summit && this._presentation.type) {
            return this._summit.event_types.find(ev => ev.id === this._presentation.type.id);
        }

        return null;
    }

    getAllowedMediaUploads() {
        const eventType = this.getEventType();
        if (eventType && eventType.allowed_media_upload_types.length > 0) {
            return eventType.allowed_media_upload_types;
        }

        return [];
    }

    getNextStep() {
        const allowedMediaUploads = this.getAllowedMediaUploads();
        const steps = allowedMediaUploads.length > 0 ? NavStepsDefinitions : NavStepsDefinitions.filter(s => s.name !== 'uploads');
        const progressNum = this._presentation.progressNum || 1;
        const nextStep = steps[steps.findIndex(x => x.step === progressNum) + 1];
        return nextStep.name;
    }

    getStepAfter(step) {
        const allowedMediaUploads = this.getAllowedMediaUploads();
        const steps = allowedMediaUploads.length > 0 ? NavStepsDefinitions : NavStepsDefinitions.filter(s => s.name !== 'uploads');
        const nextStep = steps[steps.findIndex(x => x.name === step) + 1];
        return nextStep.name;
    }

    getPresentationProgress() {
        return this._presentation.progressNum;
    }

}

export default Presentation;
