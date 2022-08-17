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
import { savePresentation, completePresentation, saveMediaUpload, deleteMediaUpload } from "../actions/presentation-actions";
import { getSpeakerPermission, removeSpeakerFromPresentation, removeModeratorFromPresentation, assignModeratorToPresentation, assignSpeakerToPresentation } from "../actions/speaker-actions";
import { loadEventCategory } from "../actions/base-actions";
import PresentationSummaryForm from "../components/presentation-summary-form";
import PresentationNav from "../components/presentation-nav/index";
import PresentationTagsForm from "../components/presentation-tags-form"
import PresentationUploadsForm from "../components/presentation-uploads-form"
import PresentationSpeakersForm from "../components/presentation-speakers-form";
import PresentationReviewForm from "../components/presentation-review-form";
import {getMarketingValue} from "../components/marketing-setting";

import '../styles/edit-presentation-page.less';

class EditPresentationPage extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {entity, track} = this.props;

        if (entity.track_id && (!track || track.id != entity.track_id)) {

            this.props.loadEventCategory();
        }
    }

    componentWillReceiveProps(newProps) {
        const {history, loading, match, track, entity, presentation} = newProps;

        if (!presentation._steps.map(s => s.lcName).includes(match.params.step)) {
            history.push('summary');
        }

        if (!loading && entity.track_id && (!track || entity.track_id !== track.id)) {
            this.props.loadEventCategory();
        }
    }

    getNavSteps() {
      const {presentation} = this.props;
      return presentation._steps.filter(stp => stp.showInNav);
    };

    render() {
        const { entity, selectionPlan, summit, errors, track, history, savePresentation, saveMediaUpload,
            deleteMediaUpload, completePresentation, getSpeakerPermission, presentation, match, trackGroups } = this.props;

        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.new");
        let step = match.params.step;
        const disclaimer = selectionPlan.submission_period_disclaimer || getMarketingValue('spkmgmt_disclaimer');
        const groupedTags = presentation.getAllowedTags(trackGroups);
        const navSteps = this.getNavSteps();

        if (!summit.event_types || !summit.tracks) return null;

        return (
            <div className="page-wrap" id="edit-presentation-page">
                <div className="presentation-header-wrapper">
                    <h2>{title} {T.translate("edit_presentation.presentation")}</h2>
                </div>
                <PresentationNav activeStep={step} progress={presentation.getPresentationProgress()} steps={navSteps} />

                {step === 'summary' &&
                    <PresentationSummaryForm
                        entity={entity}
                        disclaimer={disclaimer}
                        presentation={presentation}
                        step={step}
                        summit={summit}
                        selectionPlan={selectionPlan}
                        errors={errors}
                        onSubmit={entity => savePresentation(entity, presentation, presentation.getStepNameAfter('SUMMARY'))}
                    />
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
                        onSubmit={() => history.push(`/app/${summit.slug}/${selectionPlan.id}/presentations/${entity.id}/${presentation.getStepNameAfter('UPLOADS')}`)}
                    />
                </div>
                }

                {step === 'tags' &&
                <div className="tag-form-wrapper">
                    <PresentationTagsForm
                        entity={entity}
                        presentation={presentation}
                        step={step}
                        groupedTags={groupedTags}
                        onSubmit={entity => savePresentation(entity, presentation, 'speakers')}
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
                        match={match}
                        summit={summit}
                        onAddSpeaker={this.props.assignSpeakerToPresentation}
                        onAddModerator={this.props.assignModeratorToPresentation}
                        onRemoveSpeaker={this.props.removeSpeakerFromPresentation}
                        onRemoveModerator={this.props.removeModeratorFromPresentation}
                        onSubmit={entity => savePresentation(entity, presentation, 'review')}
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
