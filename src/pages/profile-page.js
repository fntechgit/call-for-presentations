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

import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import SpeakerForm from '../components/speaker-form'
import {saveSpeakerProfile, getOrganizationalRoles} from "../actions/speaker-actions";
import {getSpeakerInfo} from "../actions/auth-actions";

import '../styles/profile-page.less';

const ProfilePage = (props) => {

    useEffect(() => {
        props.getSpeakerInfo(null);
    }, []);

    useEffect(() => {
        if (props.orgRoles.length === 0) {
            props.getOrganizationalRoles();
        }
    }, [props.orgRoles]);

    const handleSaveSpeakerProfile = (entity) => {
        const {history, summit} = props;

        props.saveSpeakerProfile(entity).then(() => {
            if (summit) {
                history.push(`/app/${summit.slug}`);
                return;
            }
            // if we dont have a summit , the we are at /app/profile path
            history.push('/app/start')
        });
    }

    const {speaker, orgRoles, loggedMember, errors, loading} = props;

    if (!speaker.id && !loading && !errors) {
        Swal.fire({
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
                entity={props.entity}
                errors={errors}
                member={loggedMember}
                orgRoles={orgRoles}
                onSubmit={handleSaveSpeakerProfile}
                showAffiliations
            />
        </div>
    );
}

const mapStateToProps = ({profileState, loggedUserState, baseState}) => ({
    summit: baseState.summit,
    loggedMember: loggedUserState.member,
    speaker: baseState.speaker,
    loading: baseState.loading,
    ...profileState
})

export default connect(
    mapStateToProps,
    {
        saveSpeakerProfile,
        getSpeakerInfo,
        getOrganizationalRoles
    }
)(ProfilePage);
