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
import EditSpeakerPage from '../pages/edit-speaker-page'

class PresentationLayout extends React.Component {

    componentWillMount() {
        let presentationId = this.props.match.params.presentation_id;

        if (!presentationId) {
            this.props.resetPresentation();
        } else {
            this.props.getPresentation(presentationId);
        }
    }

    render(){
        let { match, entity } = this.props;

        return(
            <Switch>
                <Route strict exact path={`${match.url}/speakers/:speaker_id(\\d+)`} component={EditSpeakerPage}/>
                <Route strict exact path={`${match.url}/:step`} component={EditPresentationPage}/>
                <Route render={props => (<Redirect to={`${match.url}/summary`} />)}/>
            </Switch>
        );
    }

}

const mapStateToProps = ({ loggedUserState, selectionPlanState, presentationState }) => ({
    speaker: loggedUserState.speaker,
    selectionPlan: selectionPlanState,
    ...presentationState
})

export default connect(
    mapStateToProps,
    {
        getPresentation,
        resetPresentation
    }
)(PresentationLayout)


