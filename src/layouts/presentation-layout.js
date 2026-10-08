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

import React from 'react'
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { getPresentation, resetPresentation } from '../actions/presentation-actions'
import EditPresentationPage from '../pages/edit-presentation-page'
import PreviewPresentationPage from '../pages/preview-presentation-page'
import ThankYouPresentationPage from '../pages/thankyou-presentation-page'
import EditSpeakerPage from '../pages/edit-speaker-page'
import Presentation from '../model/presentation'
import PresentationEditGate from '../components/presentation-edit-gate'

class PresentationLayout extends React.Component {

    constructor(props){
        super(props);
        this.presentation = new Presentation(
          props.entity,
          props.summit,
          props.selectionPlan,
          props.loggedSpeaker,
          props.tagGroups
        );
    }

    componentDidMount() {
        let {presentation_id} = this.props.match.params;
        if (!presentation_id) {
            this.props.resetPresentation();
            return;
        }
        // a failed load is already reported to the user by presentationErrorHandler
        this.props.getPresentation(presentation_id).catch(() => {});
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.presentation_id;
        let newId = newProps.match.params.presentation_id;

        if (newId && oldId !== newId) {
            this.props.getPresentation(newId).catch(() => {});
        }

        // Gated on the props each call actually reads: updatePresentation is not cheap or
        // side-effect free (it recomputes allowed media uploads and grouped tags, rewrites step
        // visibility, and writes progressNum onto the redux entity). The time-based edit lock lives
        // in PresentationEditGate. Identity comparison is sound here: presentation-reducer builds
        // a new entity object on RECEIVE_PRESENTATION and PRESENTATION_UPDATED.
        if (newProps.selectionPlan !== this.props.selectionPlan) {
            this.presentation.updateSelectionPlan(newProps.selectionPlan);
        }

        if (newProps.entity !== this.props.entity || newProps.track !== this.props.track) {
            this.presentation.updatePresentation(newProps.entity, newProps.track);
        }
    }

    render(){
        let { match, entity, speaker, history, loading, location, selectionPlan, selectionPlansSettings } = this.props;
        let isNew = !match.params.presentation_id;

        if (loading || (!isNew && !entity.id)) return null;

        if (!speaker) {
            history.push(`/app/${summit.slug}/all-plans/profile`);
        }

        const selectionPlanSettings = selectionPlansSettings && selectionPlansSettings.hasOwnProperty(selectionPlan?.id) ? (selectionPlansSettings[selectionPlan?.id] || {}): {};
        const defaultStep = selectionPlanSettings?.CFP_PRESENTATION_EDITION_DEFAULT_TAB ? selectionPlanSettings?.CFP_PRESENTATION_EDITION_DEFAULT_TAB : 'summary';

        return(
            <>
                <PresentationEditGate
                    presentation={this.presentation}
                    isNew={isNew}
                    presentationId={match.params.presentation_id}
                    entityId={entity.id}
                    pathname={location.pathname}
                    previewUrl={`${match.url}/preview`}
                />
                <Switch>
                    <Route strict exact path={`${match.url}/speakers/new`} render={(props) => <EditSpeakerPage {...props} selectionPlan={selectionPlan}/>}/>
                    <Route strict exact path={`${match.url}/speakers/:speaker_id(\\d+)`} render={(props) => <EditSpeakerPage {...props} selectionPlan={selectionPlan}/>}/>
                    <Route strict exact path={`${match.url}/preview`} render={(props) => <PreviewPresentationPage {...props} selectionPlan={selectionPlan}/>}/>
                    <Route strict exact path={`${match.url}/thank-you`} render={(props) => <ThankYouPresentationPage {...props} selectionPlan={selectionPlan}/>}/>
                    <Route strict exact path={`${match.url}/:step`} render={
                        props => (<EditPresentationPage {...props} presentation={this.presentation} selectionPlan={selectionPlan} />)
                    }/>
                    <Route render={props => (<Redirect to={`${match.url}/${defaultStep}`} />)}/>
                </Switch>
            </>
        );
    }

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


