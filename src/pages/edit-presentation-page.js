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

import React, {useContext, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {
  savePresentation,
  completePresentation,
  saveMediaUpload,
  deleteMediaUpload,
  setShowInfoPopup
} from "../actions/presentation-actions";
import {
  getSpeakerPermission,
  removeSpeakerFromPresentation,
  removeModeratorFromPresentation,
  assignModeratorToPresentation,
  assignSpeakerToPresentation
} from "../actions/speaker-actions";
import {loadEventCategory} from "../actions/base-actions";
import PresentationSummaryForm from "../components/presentation-summary-form";
import PresentationNav from "../components/presentation-nav/index";
import PresentationTagsForm from "../components/presentation-tags-form"
import PresentationUploadsForm from "../components/presentation-uploads-form"
import PresentationSpeakersForm from "../components/presentation-speakers-form";
import PresentationReviewForm from "../components/presentation-review-form";
import {getMarketingValue} from "../components/marketing-setting";

import '../styles/edit-presentation-page.less';
import {SelectionPlanContext} from "../components/SelectionPlanContext";

const EditPresentationPage = ({entity, track, presentation, selectionPlan, summit, match, selectionPlans, showInfoPopup, setShowInfoPopup, ...props}) => {
  const {setSelectionPlanCtx} = useContext(SelectionPlanContext);

  const [selectionPlanSettings, setSelectionPlanSettings] = useState(null);

  useEffect(() => {
    if (entity.track_id && (!track || track.id !== entity.track_id)) {
      props.loadEventCategory();
    }
  }, [entity?.track_id, track?.id]);

  useEffect(() => {
    if (!presentation._steps.map(s => s.lcName).includes(match.params.step)) {
      history.push('summary');
    }
  }, [match.params.step]);

  useEffect(() => {
    setSelectionPlanCtx(selectionPlan);
    setSelectionPlanSettings(selectionPlans[selectionPlan.id] || {});
    return () => { setSelectionPlanCtx(null) }
  }, [selectionPlan?.id])


  const getNavSteps = () => {
    return presentation._steps.filter(stp => stp.showInNav);
  };

  const {
    errors,
    history,
    savePresentation,
    saveMediaUpload,
    deleteMediaUpload,
    completePresentation,
    getSpeakerPermission,
    trackGroups
  } = props;
  const title = (entity.id) ? T.translate("general.edit") : T.translate("general.new");
  const step = match.params.step;
  const disclaimer = selectionPlan.submission_period_disclaimer || getMarketingValue('spkmgmt_disclaimer');
  const groupedTags = presentation.getAllowedTags(trackGroups);
  const navSteps = getNavSteps();

  if (!summit.event_types || !summit.tracks) return null;

  if (selectionPlanSettings?.CFP_PRESENTATION_EDITION_CUSTOM_MESSAGE && showInfoPopup) {
    Swal.fire({
      html: selectionPlanSettings.CFP_PRESENTATION_EDITION_CUSTOM_MESSAGE,
      type: "info",
      showCloseButton: true,
    }).then((result) =>  {
      setShowInfoPopup(false)
    });
  }

  return (
    <div className="page-wrap" id="edit-presentation-page">
      <div className="presentation-header-wrapper">
        <h2>{title} {`${selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation")}`}</h2>
      </div>
      <PresentationNav activeStep={step} progress={presentation.getPresentationProgress()} steps={navSteps} selectionPlanSettings={selectionPlanSettings} />

      {step === 'summary' &&
      <PresentationSummaryForm
        entity={entity}
        disclaimer={disclaimer}
        presentation={presentation}
        step={step}
        summit={summit}
        selectionPlan={selectionPlan}
        selectionPlanSettings={selectionPlanSettings}
        errors={errors}
        onSubmit={entity => savePresentation(entity, presentation, 'SUMMARY')}
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
          selectionPlanSettings={selectionPlanSettings}
          errors={errors}
          onSaveMU={saveMediaUpload}
          onDeleteMU={deleteMediaUpload}
          onSubmit={() => history.push(`/app/${summit.slug}/all-plans/${selectionPlan.id}/presentations/${entity.id}/${presentation.getStepNameAfter('UPLOADS')}`)}
        />
      </div>
      }

      {step === 'tags' &&
      <div className="tag-form-wrapper">
        <PresentationTagsForm
          entity={entity}
          presentation={presentation}
          selectionPlanSettings={selectionPlanSettings}
          step={step}
          groupedTags={groupedTags}
          onSubmit={entity => savePresentation(entity, presentation, 'TAGS')}
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
          selectionPlanSettings={selectionPlanSettings}
          onAddSpeaker={props.assignSpeakerToPresentation}
          onAddModerator={props.assignModeratorToPresentation}
          onRemoveSpeaker={props.removeSpeakerFromPresentation}
          onRemoveModerator={props.removeModeratorFromPresentation}
          onSubmit={entity => savePresentation(entity, presentation, 'SPEAKERS')}
          onSpeakerEdit={getSpeakerPermission}
        />
      </div>
      }

      {step === 'review' &&
      <div className="review-form-wrapper">
        <PresentationReviewForm
            selectionPlan={selectionPlan}
            entity={entity}
            presentation={presentation}
            track={track}
            step={step}
            onSubmit={completePresentation}
            selectionPlanSettings={selectionPlanSettings}
        />
      </div>
      }

    </div>
  );
}

const mapStateToProps = ({baseState, presentationState}) => ({
  summit: baseState.summit,
  tagGroups: baseState.tagGroups,
  loading: baseState.loading,
  loggedSpeaker: baseState.speaker,
  selectionPlans: baseState.selectionPlansSettings,
  ...presentationState
})

export default connect(
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
    getSpeakerPermission,
    setShowInfoPopup,
  }
)(EditPresentationPage);
