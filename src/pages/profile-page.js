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

import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import SpeakerForm from '../components/speaker-form'
import {saveSpeakerProfile, getOrganizationalRoles} from "../actions/speaker-actions";
import {getSpeakerInfo} from "../actions/auth-actions";

import '../styles/profile-page.less';
import {getSubmissionsPath} from "../utils/methods";

const ProfilePage = ({entity, speaker, orgRoles, loggedMember, errors, loading, summit, selectionPlanId, history, selectionPlansSettings, ...props}) => {
    const selectionPlanSettings = selectionPlansSettings?.[selectionPlanId];
    const speakerLabel = selectionPlanSettings?.CFP_SPEAKERS_SINGULAR_LABEL || 'Speaker';
    const [speakerLoaded, setSpeakerLoaded] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const hasErrors = Object.keys(errors).length > 0;

    useEffect(() => {
        props.getSpeakerInfo().finally(() => setSpeakerLoaded(true));
    }, []);

    useEffect(() => {
        if (orgRoles.length === 0) {
            props.getOrganizationalRoles();
        }
    }, [orgRoles]);

    const handleSaveSpeakerProfile = (entity) => {
        props.saveSpeakerProfile(entity);
    }

    useEffect(() => {
        if (!speaker?.id && !loading && !hasErrors && speakerLoaded && !alertShown) {
            // speaker not found
            Swal.fire({
                title: T.translate("landing.speaker_profile_required"),
                text: entity?.email ?
                  T.translate("landing.speaker_profile_required_text", {user_account: entity.email})
                  :
                  'Loading ...',
                type: "warning",
            });

            setAlertShown(true);
        }
    }, [speaker?.id, loading, hasErrors, alertShown, speakerLoaded]);

    return (
        <div className="page-wrap" id="profile-page">
            <h3>{T.translate("general.edit")} {T.translate("edit_profile.profile", {speakerLabel})}</h3>
            <hr/>
            <SpeakerForm
                entity={entity}
                summit={summit}
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
    selectionPlansSettings: baseState.selectionPlansSettings,
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
