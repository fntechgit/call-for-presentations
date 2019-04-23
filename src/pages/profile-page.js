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
import SpeakerForm from '../components/speaker-form'
import { saveSpeakerProfile, attachProfilePicture, getOrganizationalRoles } from "../actions/speaker-actions";
import { getSpeakerInfo } from "../actions/auth-actions";

import '../styles/profile-page.less';

class ProfilePage extends React.Component {

    constructor(props){
        super(props);


    }

    componentWillMount () {
        if (!this.props.speaker) {
            this.props.getSpeakerInfo(null);
        }

        if (this.props.orgRoles.length == 0) {
            this.props.getOrganizationalRoles();
        }
    }

    render() {
        let {entity, orgRoles, loggedMember, errors, saveSpeakerProfile, attachProfilePicture, loading} = this.props;

        if (!entity.id && !loading && !errors) {
            swal({
                title: T.translate("edit_profile.important"),
                text: T.translate("edit_profile.fill_speaker_details"),
                type: "warning"
            });
        }

        return (
            <div className="page-wrap" id="profile-page">
                <h3>{T.translate("general.edit")} {T.translate("edit_profile.profile")}</h3>
                <hr/>
                <SpeakerForm
                    entity={entity}
                    errors={errors}
                    member={loggedMember}
                    orgRoles={orgRoles}
                    onSubmit={saveSpeakerProfile}
                    onAttach={attachProfilePicture}
                    showAffiliations
                />
            </div>
        );
    }
}

const mapStateToProps = ({ profileState, loggedUserState, baseState }) => ({
    selectionPlan : baseState.selectionPlan,
    loggedMember: loggedUserState.member,
    speaker: baseState.speaker,
    loading: baseState.loading,
    ...profileState
})

export default connect (
    mapStateToProps,
    {
        saveSpeakerProfile,
        attachProfilePicture,
        getSpeakerInfo,
        getOrganizationalRoles
    }
)(ProfilePage);