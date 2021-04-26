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
import { Exclusive } from 'openstack-uicore-foundation/lib/components'
import T from "i18n-react/dist/i18n-react";
import CPFSpeakerInput from './inputs/speaker-input'
import Swal from "sweetalert2";
import {getMarketingValue} from "./marketing-setting";

class PresentationSpeakersForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            speaker: {},
            speakerInput: null,
            entity: {...props.entity},
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleChangeSpeaker = this.handleChangeSpeaker.bind(this);
        this.handleAddSpeaker = this.handleAddSpeaker.bind(this);
        this.handleEditSpeaker = this.handleEditSpeaker.bind(this);
    }

    handleSubmit(ev) {
        const entity = {...this.props.entity};
        ev.preventDefault();

        const validModerator = !entity.type.use_moderator || !entity.type.is_moderator_mandatory || entity.moderator;
        const validSpeaker = !entity.type.use_speakers || !entity.type.are_speakers_mandatory || entity.speakers.length > 0;

        if (!validModerator) {
            Swal.fire("Validation error", T.translate("edit_presentation.add_moderator_error"), "warning");
        } else if (!validSpeaker) {
            Swal.fire("Validation error", T.translate("edit_presentation.add_speaker_error"), "warning");
        } else {
            this.props.onSubmit(this.props.entity);
        }
    }

    handleBack(ev) {
        ev.preventDefault();
        this.props.onBack();
    }

    handleChangeSpeaker(ev) {
        let {value, id} = ev.target;
        this.setState({speaker: value, speakerInput: value});
    }

    handleSpeakerClick(speakerId, speakerType, ev) {
        let {history, entity, summit} = this.props;
        ev.preventDefault();
        this.props.onSpeakerEdit(entity.id, speakerId, speakerType);
    }

    handleSpeakerRemove(speakerId, ev) {
        ev.preventDefault();

        this.props.onRemoveSpeaker(speakerId);
    }

    handleModeratorRemove(moderatorId, ev) {
        ev.preventDefault();

        this.props.onRemoveModerator(moderatorId);
    }

    handleEditSpeaker(speakerId, speakerType, ev) {
        let {history, entity} = this.props;
        ev.preventDefault();
        this.props.onSpeakerEdit(entity.id, speakerId, speakerType);
    }

    handleAddSpeaker(speakerType, ev) {
        let {speaker} = this.state;
        let {history, entity, onAddSpeaker, onAddModerator, summit} = this.props;

        ev.preventDefault();

        if (!isNaN(speaker.id)) {
            if (speakerType == 'moderator') {
                onAddModerator(speaker);
            } else {
                onAddSpeaker(speaker);
            }

            this.setState({speakerInput: null});
        } else if (speaker.value) {
            history.push(`/app/${summit.slug}/presentations/${entity.id}/speakers/new`, { email: speaker.value, type: speakerType });
        }

    }


    render() {
        let {summit, entity, presentation, step} = this.props;
        let {speakerInput} = this.state;
        let eventType = summit.event_types.find(t => t.id == entity.type_id);
        const speaker_subtitle_1 = getMarketingValue('spkmgmt_speaker_subtitle_1');

        let canAddSpeakers = (eventType && eventType.max_speakers > entity.speakers.length);
        let canAddModerator = (eventType && eventType.max_moderators && !entity.moderator);
        let canAddParticipant = canAddModerator || canAddSpeakers;
        let speakerType = (canAddModerator) ? 'moderator' : 'speaker';

        let addMoreParticipantsLabel = '';
        if (canAddModerator) {
            addMoreParticipantsLabel = T.translate("edit_presentation.more_moderator");
        } else if (canAddParticipant) {
            addMoreParticipantsLabel = T.translate("edit_presentation.more_speaker");
        }

        return (
            <div>
                <h3>{speaker_subtitle_1 || T.translate("edit_presentation.speaker_included")}</h3>

                <hr/>
                <div className="speakers">
                    {entity.moderator &&
                        <div className="row speaker" key={"speaker_" + entity.moderator.id}>
                            <div className="col-md-4">
                                <i className="fa fa-user"></i>
                                <a href="#"
                                   onClick={this.handleSpeakerClick.bind(this, entity.moderator.id, 'moderator')}>
                                    {entity.moderator.first_name} {entity.moderator.last_name}
                                </a>
                            </div>
                            <div className="col-md-4">
                                {T.translate("edit_presentation.moderator")}
                            </div>
                            <div className="col-md-4">
                                <button className="btn btn-primary btn-xs" onClick={this.handleEditSpeaker.bind(this, entity.moderator.id, 'moderator')}>
                                    {T.translate("general.edit")}
                                </button>
                                <button className="btn btn-danger btn-xs" onClick={this.handleModeratorRemove.bind(this, entity.moderator.id)}>
                                    {T.translate("general.remove")}
                                </button>
                            </div>
                        </div>
                    }

                    {entity.speakers.map(s => (
                        <div className="row speaker" key={"speaker_" + s.id}>
                            <div className="col-md-4">
                                <i className="fa fa-user"></i>
                                <a href="#" onClick={this.handleSpeakerClick.bind(this, s.id, 'speaker')}>{s.first_name} {s.last_name}</a>
                            </div>
                            <div className="col-md-4">
                                {T.translate("edit_presentation.speaker")}
                            </div>
                            <div className="col-md-4">
                                <button className="btn btn-primary btn-xs" onClick={this.handleEditSpeaker.bind(this, s.id, 'speaker')}>
                                    {T.translate("general.edit")}
                                </button>
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
                        <br/>
                        <p className="more-speakers">{addMoreParticipantsLabel}</p>

                        <div className="row form-group">
                            <div className="col-md-8">
                                <label> {T.translate("edit_presentation.enter_speaker")} </label>
                                <CPFSpeakerInput
                                    id="speaker"
                                    value={speakerInput}
                                    speakers={entity.speakers}
                                    onChange={this.handleChangeSpeaker}
                                />
                            </div>
                            <div className="col-md-4 add-speaker-btn">
                                <button className="btn btn-primary" onClick={this.handleAddSpeaker.bind(this, speakerType)}>
                                    {T.translate("edit_presentation.add_speaker")}
                                </button>
                            </div>
                        </div>
                    </div>
                    }

                    {!canAddSpeakers && !canAddModerator &&
                    <h3 className="limit-speakers">{T.translate("edit_presentation.max_speakers")}</h3>
                    }

                    <Exclusive name="legal-disclaimer-speakers">
                        <div id="legal-other">
                            <label>{T.translate("edit_presentation.speaker_declaimer")}</label>
                        </div>
                    </Exclusive>

                    <hr/>
                    <SubmitButtons presentation={presentation} step={step} onSubmit={this.handleSubmit.bind(this)} backStep="tags"/>
                </form>

            </div>
        );
    }
}

export default PresentationSpeakersForm;
