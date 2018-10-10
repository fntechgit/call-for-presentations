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
import ProfileForm from '../components/profile-form'
import { saveSpeakerProfile, attachProfilePicture } from "../actions/speaker-actions";

//import '../styles/presentations-page.less';

class ProfilePage extends React.Component {

    constructor(props){
        super(props);


    }

    componentWillMount () {


    }

    componentWillReceiveProps(newProps) {

    }

    render() {
        let {entity, errors, saveSpeakerProfile, attachProfilePicture, loading} = this.props;

        if (!entity.id && !loading) {
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
                <ProfileForm
                    entity={entity}
                    errors={errors}
                    onSubmit={saveSpeakerProfile}
                    onAttach={attachProfilePicture}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ selectionPlanState, profileState, loggedUserState, baseState }) => ({
    selectionPlan : selectionPlanState,
    loggedSpeaker: loggedUserState.speaker,
    loading: baseState.loading,
    ...profileState
})

export default connect (
    mapStateToProps,
    {
        saveSpeakerProfile,
        attachProfilePicture
    }
)(ProfilePage);
