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
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";
import { getPresentation, resetPresentation } from '../actions/presentation-actions'
import EditPresentationPage from '../pages/edit-presentation-page'
import PreviewPresentationPage from '../pages/preview-presentation-page'
import EditSpeakerPage from '../pages/edit-speaker-page'
import Presentation from '../model/presentation'

class PresentationLayout extends React.Component {

    componentWillMount() {
        let presentationId = this.props.match.params.presentation_id;

        if (!presentationId) {
            this.props.resetPresentation();
        } else {
            this.props.getPresentation(presentationId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.presentation_id;
        let newId = newProps.match.params.presentation_id;

        if (!newId) {
            this.props.resetPresentation();
        } else if (oldId != newId) {
            this.props.getPresentation(presentationId);
        }
    }

    render(){
        let { match, entity, selectionPlan, speaker, history, loading } = this.props;
        let presentation = new Presentation(entity, selectionPlan, speaker);

        if (loading) return(<div></div>);

        if (match.params.presentation_id && !loading && !presentation.canEdit()) {
            return(<Redirect to={`${match.url}/summary`} />);
        }

        if (!speaker) {
            history.push(`/app/profile`);
        }

        return(
            <Switch>
                <Route strict exact path={`${match.url}/speakers/new`} component={EditSpeakerPage}/>
                <Route strict exact path={`${match.url}/speakers/:speaker_id(\\d+)`} component={EditSpeakerPage}/>
                <Route strict exact path={`${match.url}/preview`} component={PreviewPresentationPage}/>
                <Route strict exact path={`${match.url}/:step`} component={EditPresentationPage}/>
                <Route render={props => (<Redirect to={`${match.url}/summary`} />)}/>
            </Switch>
        );
    }

}

const mapStateToProps = ({ loggedUserState, selectionPlanState, presentationState, baseState }) => ({
    speaker: loggedUserState.speaker,
    selectionPlan: selectionPlanState,
    loading: baseState.loading,
    ...presentationState
})

export default connect(
    mapStateToProps,
    {
        getPresentation,
        resetPresentation
    }
)(PresentationLayout)


