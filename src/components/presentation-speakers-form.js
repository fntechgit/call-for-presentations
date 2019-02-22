/**
 * Copyright 2017 OpenStack Foundation
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
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import SubmitButtons from "./presentation-submit-buttons";
import T from "i18n-react/dist/i18n-react";
import CPFSpeakerInput from './inputs/speaker-input'
import { Dropdown } from 'openstack-uicore-foundation/lib/components'

class PresentationSpeakersForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            speaker: {},
            entity: {...props.entity},
            role: ''
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleChangeSpeaker = this.handleChangeSpeaker.bind(this);
        this.handleAddSpeaker = this.handleAddSpeaker.bind(this);
        this.handleChangeRole = this.handleChangeRole.bind(this);
    }

    handleSubmit(ev) {
        let entity = {...this.props.entity};
        ev.preventDefault();

        this.props.onSubmit(this.props.entity, 'review');
    }

    handleBack(ev) {
        ev.preventDefault();
        this.props.onBack();
    }

    handleChangeSpeaker(ev) {
        let {value} = ev.target;
        this.setState({speaker: value});
    }

    handleChangeRole(ev) {
        let {value} = ev.target;
        this.setState({role: value});
    }

    handleSpeakerClick(speakerId, ev) {
        let {history, entity} = this.props;
        ev.preventDefault();

        history.push(`/app/presentations/${entity.id}/speakers/${speakerId}`);
    }

    handleSpeakerRemove(speakerId, ev) {
        ev.preventDefault();

        this.props.onRemoveSpeaker(speakerId);
    }

    handleModeratorRemove(moderatorId, ev) {
        ev.preventDefault();

        this.props.onRemoveModerator(moderatorId);
    }

    handleAddSpeaker(ev) {
        let {speaker, role} = this.state;
        let {history, entity} = this.props;

        ev.preventDefault();

        if (!isNaN(speaker.id)) {
            history.push(`/app/presentations/${entity.id}/speakers/${speaker.id}`, {type: role});
        } else if (speaker.value) {
            history.push(`/app/presentations/${entity.id}/speakers/new`, { email: speaker.value, type: role });
        }

    }


    render() {
        let {summit, entity} = this.props;
        let {role, speaker} = this.state;
        let eventType = summit.event_types.find(t => t.id == entity.type_id);

        let canAddSpeakers = (eventType.max_speakers > entity.speakers.length);
        let canAddModerator = (eventType.max_moderators > entity.speakers.length && eventType.min_moderators <= entity.speakers.length);
        let canAddParticipant = canAddModerator || canAddSpeakers;
        let enableAddButton = role && (speaker.value || speaker.id);

        let speakerRoles = [
            {value: 'speaker', label: 'Speaker'},
            {value: 'moderator', label: 'Moderator'}
        ];


        return (
            <div>

                <h3>{T.translate("edit_presentation.speaker_included")}</h3>
                <p>{T.translate("edit_presentation.speaker_important")}</p>

                <hr/>
                <div className="speakers">
                    {entity.moderators.map(m => (
                        <div className="row speaker" key={"speaker_" + m.id}>
                            <div className="col-md-4">
                                <i className="fa fa-user"></i>
                                <a href="#"
                                   onClick={this.handleSpeakerClick.bind(this, m.id)}>
                                    {m.first_name} {m.last_name}
                                </a>
                            </div>
                            <div className="col-md-2">
                                {T.translate("edit_presentation.moderator")}
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-danger btn-xs" onClick={this.handleModeratorRemove.bind(this, m.id)}>
                                    {T.translate("general.remove")}
                                </button>
                            </div>
                        </div>
                    ))}

                    {entity.speakers.map(s => (
                        <div className="row speaker" key={"speaker_" + s.id}>
                            <div className="col-md-4">
                                <i className="fa fa-user"></i>
                                <a href="#" onClick={this.handleSpeakerClick.bind(this, s.id)}>{s.first_name} {s.last_name}</a>
                            </div>
                            <div className="col-md-2">
                                {T.translate("edit_presentation.speaker")}
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-danger btn-xs" onClick={this.handleSpeakerRemove.bind(this, s.id)}>
                                    {T.translate("general.remove")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <form className="presentation-speakers-form">
                    <input type="hidden" id="id" value={entity.id}/>

                    {canAddParticipant &&
                    <div>
                        <h3 className="more-speakers">{T.translate("edit_presentation.more_speaker")}</h3>


                        <div className="row form-group">
                            <div className="col-md-4">
                                <label> {T.translate("edit_presentation.first_role")} </label>
                                <Dropdown
                                    id="role"
                                    value={this.state.role}
                                    onChange={this.handleChangeRole}
                                    placeholder={T.translate("edit_presentation.select_role")}
                                    options={speakerRoles}
                                />
                            </div>
                        </div>

                        <div className="row form-group">
                            <div className="col-md-6">
                                <label> {T.translate("edit_presentation.enter_speaker")} </label>
                                <CPFSpeakerInput
                                    id="speaker"
                                    speakers={entity.speakers}
                                    onChange={this.handleChangeSpeaker}
                                />
                            </div>
                            <div className="col-md-4 add-speaker-btn">
                                <button className="btn btn-primary" disabled={!enableAddButton} onClick={this.handleAddSpeaker.bind(this)}>
                                    {T.translate("edit_presentation.add_speaker")}
                                </button>
                            </div>
                        </div>
                    </div>
                    }

                    {!canAddSpeakers && !canAddModerator &&
                    <h3 className="limit-speakers">{T.translate("edit_presentation.max_speakers")}</h3>
                    }

                    <div id="legal-other">
                        <label>{T.translate("edit_presentation.speaker_declaimer")}</label>
                    </div>
                    <hr/>
                    <SubmitButtons onSubmit={this.handleSubmit.bind(this)} backStep="tags"/>
                </form>

            </div>
        );
    }
}

export default PresentationSpeakersForm;
