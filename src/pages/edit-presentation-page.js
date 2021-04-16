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

import React from 'react';
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import { RawHTML } from 'openstack-uicore-foundation/lib/components'
import { savePresentation, completePresentation, saveMediaUpload, deleteMediaUpload } from "../actions/presentation-actions";
import { getSpeakerPermission, removeSpeakerFromPresentation, removeModeratorFromPresentation, assignModeratorToPresentation, assignSpeakerToPresentation } from "../actions/speaker-actions";
import { loadEventCategory } from "../actions/base-actions";
import PresentationSummaryForm from "../components/presentation-summary-form";
import PresentationNav from "../components/presentation-nav/index";
import {NavStepsDefinitions} from "../components/presentation-nav/nav-steps-definition";
import PresentationTagsForm from "../components/presentation-tags-form"
import PresentationUploadsForm from "../components/presentation-uploads-form"
import PresentationSpeakersForm from "../components/presentation-speakers-form";
import PresentationReviewForm from "../components/presentation-review-form";

import '../styles/edit-presentation-page.less';
import Presentation from "../model/presentation";
import {getMarketingValue} from "../components/marketing-setting";
import history from "../history";

class EditPresentationPage extends React.Component {

    componentWillMount() {
        let {entity} = this.props;

        if (entity.track_id && (!this.props.track || this.props.track.id !== entity.track_id)) {
            this.props.loadEventCategory();
        }
    }

    componentWillReceiveProps(newProps) {
        let {history, loading, entity} = newProps;
        let step = newProps.match.params.step;

        if (!NavStepsDefinitions.map(s => s.name).includes(step)) {
            history.push('summary');
        }

        if (!loading && newProps.entity.track_id && (!newProps.track || newProps.entity.track_id !== newProps.track.id)) {
            this.props.loadEventCategory();
        }
    }

    render() {
        let { entity, selectionPlan, summit, tagGroups, errors, track, history, savePresentation, saveMediaUpload,
            deleteMediaUpload, completePresentation, getSpeakerPermission, presentation } = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.new");
        let step = this.props.match.params.step;
        const allowedMediaUploads = presentation.getAllowedMediaUploads();
        const disclaimer = getMarketingValue('spkmgmt_disclaimer');

        if (!summit.event_types || !summit.tracks) return null;

        return (
            <div className="page-wrap" id="edit-presentation-page">
                <div className="presentation-header-wrapper">
                    <h2>{title} {T.translate("edit_presentation.presentation")}</h2>
                </div>
                <PresentationNav activeStep={step} progress={presentation.getPresentationProgress()} showUploads={allowedMediaUploads.length > 0} />

                {step === 'summary' &&
                <div className="presentation-form-wrapper">
                    {disclaimer &&
                    <div className="disclaimer">
                        <RawHTML>
                            {disclaimer}
                        </RawHTML>
                    </div>
                    }
                    <PresentationSummaryForm
                        entity={entity}
                        presentation={presentation}
                        step={step}
                        summit={summit}
                        selectionPlan={selectionPlan}
                        errors={errors}
                        onSubmit={entity => savePresentation(entity, presentation.getNextStep())}
                    />
                </div>
                }

                {step === 'uploads' &&
                <div className="uploads-form-wrapper">
                    <PresentationUploadsForm
                        entity={entity}
                        presentation={presentation}
                        step={step}
                        summit={summit}
                        selectionPlan={selectionPlan}
                        errors={errors}
                        onSaveMU={saveMediaUpload}
                        onDeleteMU={deleteMediaUpload}
                        onSubmit={() => history.push(`/app/${summit.slug}/presentations/${entity.id}/tags`)}
                    />
                </div>
                }

                {step === 'tags' &&
                <div className="tag-form-wrapper">
                    <PresentationTagsForm
                        entity={entity}
                        presentation={presentation}
                        step={step}
                        track={track}
                        tagGroups={tagGroups}
                        onSubmit={entity => savePresentation(entity, 'speakers')}
                    />
                </div>
                }

                {step === 'speakers' &&
                <div className="speakers-form-wrapper">
                    <PresentationSpeakersForm
                        history={history}
                        entity={entity}
                        presentation={presentation}
                        step={step}
                        summit={summit}
                        onAddSpeaker={this.props.assignSpeakerToPresentation}
                        onAddModerator={this.props.assignModeratorToPresentation}
                        onRemoveSpeaker={this.props.removeSpeakerFromPresentation}
                        onRemoveModerator={this.props.removeModeratorFromPresentation}
                        onSubmit={entity => savePresentation(entity, 'review')}
                        onSpeakerEdit={getSpeakerPermission}
                    />
                </div>
                }

                {step === 'review' &&
                <div className="review-form-wrapper">
                    <PresentationReviewForm
                        entity={entity}
                        presentation={presentation}
                        track={track}
                        step={step}
                        onSubmit={completePresentation}
                    />
                </div>
                }

            </div>
        );
    }
}

const mapStateToProps = ({ baseState, presentationState }) => ({
    selectionPlan : baseState.selectionPlan,
    summit : baseState.summit,
    tagGroups: baseState.tagGroups,
    loading : baseState.loading,
    loggedSpeaker : baseState.speaker,
     ...presentationState
})

export default connect (
    mapStateToProps,
    {
        savePresentation,
        saveMediaUpload,
        deleteMediaUpload,
        completePresentation,
        loadEventCategory,
        removeSpeakerFromPresentation,
        removeModeratorFromPresentation,
        assignModeratorToPresentation,
        assignSpeakerToPresentation,
        getSpeakerPermission
    }
)(EditPresentationPage);
