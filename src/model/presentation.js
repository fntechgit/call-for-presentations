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
import {NavStepsDefinitions} from "../components/presentation-nav/nav-steps-definition";

class Presentation {

    constructor(presentation, summit, selectionPlan, loggedUser, cfpOpen){
        this._presentation  = presentation;
        this._selectionPlan = selectionPlan;
        this._user = loggedUser;
        this._cfpOpen = cfpOpen;
        this._summit = summit;

        let presentationSelectionPlan = summit.selection_plans.find(sp => sp.id == presentation.selection_plan_id);

        this._presentation.selectionPlan = presentationSelectionPlan;
    }

    getStatus() {
        if(this._presentation.is_published) {
            return T.translate("presentations.published");
        } else if (this._presentation.status) {
            return this._presentation.status;
        } else {
            return T.translate("presentations.not_submitted");
        }
    }

    canEdit() {
        if (!this._selectionPlan || !this._cfpOpen) return false;

        let speakers = this._presentation.speakers.map(s => {
            if (typeof s == 'object') return s.id;
            else return s;
        });

        let creatorId = this._presentation.creator ? this._presentation.creator.id : this._presentation.creator_id;
        let moderatorId = this._presentation.moderator ? this._presentation.moderator.id : this._presentation.moderator_speaker_id;

        let isCreator = (creatorId == this._user.member.id);
        let isSpeaker = speakers.includes(this._user.id);
        let isModerator = (moderatorId == this._user.id);
        let belongsToSP = (this._presentation.selection_plan_id == this._selectionPlan.id);

        return (isCreator || isSpeaker || isModerator) && belongsToSP;
    }

    canDelete() {
        let belongsToSP = (this._presentation.selection_plan_id == this._selectionPlan.id);
        return (!this._presentation.is_published && this._cfpOpen && belongsToSP);
    }

    getProgressLink() {
        if (this.canEdit()) {
            let progress = this._presentation.progress.toLowerCase();
            let step = 'summary';

            if (progress != 'complete') {
                step = progress;
            }

            return `/app/presentations/${this._presentation.id}/${step}`;
        } else {
            return `/app/presentations/${this._presentation.id}/preview`;
        }
    }

    getSelectionPlanName() {
        let selectionPlanName = (this._presentation.selectionPlan) ? this._presentation.selectionPlan.name : 'N/A';
        return selectionPlanName;
    }

}

export default Presentation;
