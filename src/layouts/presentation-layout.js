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

import React, { useEffect, useMemo } from 'react'
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { getPresentation, resetPresentation } from '../actions/presentation-actions'
import EditPresentationPage from '../pages/edit-presentation-page'
import PreviewPresentationPage from '../pages/preview-presentation-page'
import ThankYouPresentationPage from '../pages/thankyou-presentation-page'
import EditSpeakerPage from '../pages/edit-speaker-page'
import Presentation from '../model/presentation'
import PresentationEditGate from '../components/presentation-edit-gate'

const PresentationLayout = ({
  match,
  entity,
  summit,
  track,
  selectionPlan,
  selectionPlansSettings,
  loggedSpeaker,
  speaker,
  history,
  loading,
  tagGroups,
  resetPresentation,
  getPresentation
}) => {
  const { presentation_id } = match.params;
  const isNew = !presentation_id;

  // rebuilt only when its inputs change: updatePresentation is not cheap or side-effect free
  // (it recomputes allowed media uploads and grouped tags, rewrites step visibility, and writes
  // progressNum onto the redux entity). Identity comparison is sound here: presentation-reducer
  // builds a new entity object on RECEIVE_PRESENTATION and PRESENTATION_UPDATED.
  const presentation = useMemo(() => {
    const model = new Presentation(entity, summit, selectionPlan, loggedSpeaker, tagGroups);
    model.updatePresentation(entity, track);
    return model;
  }, [entity, track, selectionPlan, summit, loggedSpeaker, tagGroups]);

  useEffect(() => {
    if (!presentation_id) {
      resetPresentation();
      return;
    }
    // a failed load is already reported to the user by presentationErrorHandler
    getPresentation(presentation_id).catch(() => {
    });
  }, [presentation_id]);

  if (loading || (!isNew && !entity.id)) return null;

  if (!speaker) {
    history.push(`/app/${summit.slug}/all-plans/profile`);
  }

  const selectionPlanSettings = selectionPlansSettings && selectionPlansSettings.hasOwnProperty(selectionPlan?.id) ? (selectionPlansSettings[selectionPlan?.id] || {}) : {};
  const defaultStep = selectionPlanSettings?.CFP_PRESENTATION_EDITION_DEFAULT_TAB || "summary";

  return (
    <Switch>
      <Route
        strict
        exact
        path={`${match.url}/preview`}
        render={(props) => <PreviewPresentationPage {...props} selectionPlan={selectionPlan} />}
      />
      <Route render={() => (
        <PresentationEditGate
          presentation={presentation}
          isNew={isNew}
          presentationId={presentation_id}
          entityId={entity.id}
          redirectUrl={isNew ? `/app/${summit.slug}/all-plans/${selectionPlan.id}` : `${match.url}/preview`}
        >
          <Switch>
            <Route
              strict
              exact
              path={`${match.url}/speakers/new`}
              render={
                (props) =>
                  <EditSpeakerPage {...props} selectionPlan={selectionPlan} />
              }
            />
            <Route
              strict
              exact
              path={`${match.url}/speakers/:speaker_id(\\d+)`}
              render={
                (props) =>
                  <EditSpeakerPage {...props} selectionPlan={selectionPlan} />
              }
            />
            <Route
              strict
              exact
              path={`${match.url}/thank-you`}
              render={
                (props) =>
                  <ThankYouPresentationPage {...props} selectionPlan={selectionPlan} />
              }
            />
            <Route
              strict
              exact
              path={`${match.url}/:step`}
              render={
                props => (
                  <EditPresentationPage {...props} presentation={presentation} selectionPlan={selectionPlan} />
                )
              }
            />
            <Route render={() => (<Redirect to={`${match.url}/${defaultStep}`} />)} />
          </Switch>
        </PresentationEditGate>
      )} />
    </Switch>
  );

}

const mapStateToProps = ({ baseState, presentationState }) => ({
  speaker: baseState.speaker,
  summit: baseState.summit,
  loading: baseState.loading,
  tagGroups: baseState.tagGroups,
  selectionPlansSettings: baseState.selectionPlansSettings,
  loggedSpeaker: baseState.speaker,
  ...presentationState
})

export default connect(
  mapStateToProps,
  {
    getPresentation,
    resetPresentation
  }
)(PresentationLayout)
