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
import { getSpeaker, resetSpeakerForm, saveSpeaker, attachPicture } from "../actions/speaker-actions";

//import '../styles/presentations-page.less';

class EditSpeakerPage extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            entity: {...props.entity},
        };
    }

    componentWillMount () {
        let speakerId = this.props.match.params.speaker_id;
        let {entity, location}   = this.props;

        if (!speakerId || !Number.isInteger(speakerId)) {
            this.props.resetSpeakerForm();
            this.setState({entity: {...entity, email: location.state.email}});
        } else if (speakerId != entity.id){
            this.props.getSpeaker(speakerId);
        }
    }

    render() {
        let {entity, errors, saveSpeaker, attachPicture} = this.props;

        return (
            <div className="page-wrap" id="edit-speaker-page">
                <h3>{T.translate("general.edit")} {T.translate("edit_speaker.profile")}</h3>
                <hr/>
                <SpeakerForm
                    entity={entity}
                    errors={errors}
                    onSubmit={saveSpeaker}
                    onAttach={attachPicture}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ selectionPlanState, speakerState }) => ({
    selectionPlan : selectionPlanState,
    ...speakerState
})

export default connect (
    mapStateToProps,
    {
        getSpeaker,
        resetSpeakerForm,
        saveSpeaker,
        attachPicture
    }
)(EditSpeakerPage);
