/**
 * Copyright 2020 OpenStack Foundation
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
import Swal from "sweetalert2";
import SpeakerForm from '../components/speaker-form'
import { getSpeaker, resetSpeakerForm, saveSpeaker, getOrganizationalRoles } from "../actions/speaker-actions";
import history from "../history";


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

    componentWillReceiveProps(newProps) {
        let speakerId = newProps.match.params.speaker_id;
        let {entity, location, history, currentPresentation, loading, summit}   = newProps;

        if (!location.state) {
            history.push(`/app/${summit.slug}/presentations/${currentPresentation.id}/speakers`);
        }

        if (!speakerId || isNaN(speakerId)) {
            if (!location.state.hasOwnProperty('email')) {
                history.push(`/app/${summit.slug}/presentations/${currentPresentation.id}/speakers`);
            }
        } else if (speakerId != entity.id && !loading){
            this.props.getSpeaker(speakerId);
        }
    }

    componentDidMount () {
        let speakerId = this.props.match.params.speaker_id;

        let {entity, location, history, currentPresentation, loadedOrgRoles, summit}   = this.props;

        if (!location.state) {
            history.push(`/app/${summit.slug}/presentations/${currentPresentation.id}/speakers`);
        }

        if (!speakerId || isNaN(speakerId)) {
            if (!location.state.hasOwnProperty('email')) {
                history.push(`/app/${summit.slug}/presentations/${currentPresentation.id}/speakers`);
            } else {
                this.props.resetSpeakerForm(location.state.email);
            }
        } else if (speakerId != entity.id){
            this.props.getSpeaker(speakerId);
        }

        if (!loadedOrgRoles) {
            this.props.getOrganizationalRoles();
        }

    }

    handleSubmit(speaker) {
        this.props.saveSpeaker(speaker, this.state.type);
    }

    render() {
        let {entity, orgRoles, loggedMember, errors, speakerPermission, match, currentPresentation, loggedInSpeaker, summit} = this.props;
        let speakerId = match.params.speaker_id;

        if (speakerId && speakerId != loggedInSpeaker.id && speakerPermission && (!speakerPermission.approved || speakerId != speakerPermission.speaker_id) ) {

            Swal.fire({
                title: T.translate("errors.access_denied"),
                text: T.translate("edit_speaker.auth_required_text"),
                type: "warning",
            }).then(function(result){
                history.push(`/app/${summit.slug}/presentations/${currentPresentation.id}/speakers`);
            });

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
                />
            </div>
        );
    }
}

const mapStateToProps = ({ baseState, speakerState, presentationState, profileState }) => ({
    loading : baseState.loading,
    selectionPlan : baseState.selectionPlan,
    summit : baseState.summit,
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
        getOrganizationalRoles
    }
)(EditSpeakerPage);
