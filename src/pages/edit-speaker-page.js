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
import swal from "sweetalert2";
import { formatEpoch } from '../utils/methods';
import SpeakerForm from '../components/speaker-form'
import { getSpeaker, resetSpeakerForm, saveSpeaker, attachPicture, getOrganizationalRoles } from "../actions/speaker-actions";
import history from "../history";

//import '../styles/presentations-page.less';

class EditSpeakerPage extends React.Component {

    constructor(props){
        super(props);

        let speakerType = props.location.state ? props.location.state.type : null;

        this.state = {
            entity: {...props.entity},
            type: speakerType
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount () {
        let speakerId = this.props.match.params.speaker_id;
        let {entity, location, history, currentPresentation, orgRoles}   = this.props;

        if (!speakerId || isNaN(speakerId)) {
            if (!location.state || !location.state.hasOwnProperty('email')) {
                history.push(`/app/presentations/${currentPresentation.id}/speakers`);
            } else {
                this.props.resetSpeakerForm(location.state.email);
            }
        } else if (speakerId != entity.id){
            this.props.getSpeaker(speakerId);
        }

        if (orgRoles.length == 0) {
            this.props.getOrganizationalRoles();
        }

    }

    handleSubmit(speaker) {
        this.props.saveSpeaker(speaker, this.state.type);
    }

    render() {
        let {entity, orgRoles, loggedMember, errors, attachPicture, speakerPermission, match, currentPresentation, loggedInSpeaker} = this.props;
        let speakerId = match.params.speaker_id;

        if (speakerId && speakerId != loggedInSpeaker.id && speakerPermission && (!speakerPermission.approved || speakerId != speakerPermission.speaker_id) ) {

            swal({
                title: T.translate("errors.access_denied"),
                text: T.translate("edit_speaker.auth_required_text"),
                type: "warning",
            }).then(function(result){
                history.push(`/app/presentations/${currentPresentation.id}/speakers`);
            }).catch(swal.noop);

            return (<div></div>);
        }

        return (
            <div className="page-wrap" id="edit-speaker-page">
                <h3>{T.translate("general.edit")} {T.translate("edit_speaker.profile")}</h3>
                <hr/>
                <SpeakerForm
                    entity={entity}
                    errors={errors}
                    member={loggedMember}
                    orgRoles={orgRoles}
                    onSubmit={this.handleSubmit}
                    onAttach={attachPicture}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ baseState, speakerState, presentationState, profileState }) => ({
    selectionPlan : baseState.selectionPlan,
    currentPresentation: presentationState.entity,
    loggedInSpeaker: profileState.entity,
    ...speakerState
})

export default connect (
    mapStateToProps,
    {
        getSpeaker,
        resetSpeakerForm,
        saveSpeaker,
        attachPicture,
        getOrganizationalRoles
    }
)(EditSpeakerPage);
