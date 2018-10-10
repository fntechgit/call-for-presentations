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

    constructor(presentation, selectionPlan, loggedUser){
        this._presentation  = presentation;
        this._selectionPlan = selectionPlan;
        this._user = loggedUser;
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
        let allowedTrackIds = this._selectionPlan.track_groups.map(tg => [...tg.tracks]);
        allowedTrackIds = [].concat(...allowedTrackIds);

        let speakers = this._presentation.speakers.map(s => {
            if (typeof s == 'object') return s.id;
            else return s;
        });

        let isCreator = (this._presentation.creator_id == this._user.member.id);
        let isSpeaker = speakers.includes(this._user.id);
        let isModerator = (this._presentation.moderator && this._presentation.moderator.id == this._user.id);
        let belongsToSP = allowedTrackIds.includes(this._presentation.track_id);

        //return (isCreator || isSpeaker || isModerator) && belongsToSP;

        return (isSpeaker || isModerator) && belongsToSP;
    }

    canDelete() {
        return (!this._presentation.is_published && this._selectionPlan.id);
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

}

export default Presentation;
