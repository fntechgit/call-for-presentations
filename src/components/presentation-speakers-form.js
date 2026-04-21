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
import { Exclusive, Dropdown } from 'openstack-uicore-foundation/lib/components'
import T from "i18n-react/dist/i18n-react";
import CPFSpeakerInput from './inputs/speaker-input'
import Swal from "sweetalert2";

class PresentationSpeakersForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            speaker: {},
            speakerInput: null,
            entity: {...props.entity},
            currentSpeakerType : null
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleChangeSpeaker = this.handleChangeSpeaker.bind(this);
        this.handleAddSpeaker = this.handleAddSpeaker.bind(this);
        this.handleEditSpeaker = this.handleEditSpeaker.bind(this);
        this.handleChangeSpeakerType = this.handleChangeSpeakerType.bind(this);
        this.handleAddSpeaker = this.handleAddSpeaker.bind(this);
    }

    handleChangeSpeakerType(ev){
        let {value, id} = ev.target;
        id = id.toString();
        this.setState({...this.state, currentSpeakerType: value, error: null});
    }

    handleSubmit(ev) {
        ev.preventDefault();

        const { selectionPlanSettings, entity } = this.props;
        const validModerator = !entity.type.use_moderator || !entity.type.is_moderator_mandatory || entity.moderator;
        const presentation = selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation").toLowerCase();

        if (!validModerator) {
            Swal.fire("Validation error", T.translate("edit_presentation.errors.add_moderator", { presentation }), "warning");
            return;
        }

        const speakersCount = Array.isArray(entity.speakers) ? entity.speakers.length : 0;
        const defaultMinSpeakers = (entity.type?.are_speakers_mandatory ? 1 : 0);
        const defaultMaxSpeakers = ((entity.type?.are_speakers_mandatory || entity.type?.use_speakers) ? Infinity : 0);
        const minSpeakers = entity.type?.min_speakers || defaultMinSpeakers;
        const possibleMaxSpeakers = (entity.type?.max_speakers || defaultMaxSpeakers);
        // Protection against invalid configuration of max_speakers < min_speakers
        const maxSpeakers = possibleMaxSpeakers >= minSpeakers ? possibleMaxSpeakers : minSpeakers;
        const validSpeaker = !entity.type.use_speakers || (speakersCount <= maxSpeakers && speakersCount >= minSpeakers);

        if (!validSpeaker) {
            const speaker = (selectionPlanSettings?.CFP_SPEAKERS_SINGULAR_LABEL || T.translate("edit_presentation.speaker")).toLowerCase();
            const speakers = (selectionPlanSettings?.CFP_SPEAKERS_PLURAL_LABEL || T.translate("edit_presentation.speakers")).toLowerCase();
            const translationParams = { presentation, speaker, speakers, max: maxSpeakers, min: minSpeakers };

            let errorField;
            switch (true) {
                // There is no upper limit of speakers but there is a minimum
                case (Infinity === maxSpeakers):
                    errorField = "add_min_number_speakers";
                    break;
                // There should be only one speaker
                case (minSpeakers === maxSpeakers && maxSpeakers === 1):
                    errorField = "add_only_one_speaker";
                    break;
                // There should be exactly a number of speakers
                case (minSpeakers === maxSpeakers && maxSpeakers !== 1):
                    errorField = "add_exact_number_of_speakers";
                    break;
                // The default error message when there is an upper limit and a minimum of speakers
                default:
                    errorField = "add_speakers";
                    break;
            }

            Swal.fire("Validation error", T.translate(`edit_presentation.errors.${errorField}`, translationParams), "warning");
            return;
        }

        this.props.onSubmit(this.props.entity);
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
        this.props.onSpeakerEdit(entity.selection_plan_id, entity.id, speakerId, speakerType);
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
        this.props.onSpeakerEdit(entity.selection_plan_id, entity.id, speakerId, speakerType);
    }

    handleAddSpeaker(ev) {
        const {speaker, currentSpeakerType} = this.state;
        const {history, onAddSpeaker, onAddModerator, match, selectionPlanSettings} = this.props;
        const speakerLabel = selectionPlanSettings?.CFP_SPEAKERS_SINGULAR_LABEL || T.translate("edit_presentation.speaker").toLowerCase();
        ev.preventDefault();

        if(!speaker){
            // speaker not set
            this.setState({...this.state, error: T.translate("edit_presentation.errors.missing_speaker", {speaker: speakerLabel})});
            return;
        }

        if(!currentSpeakerType){
            this.setState({...this.state, error: T.translate("edit_presentation.errors.role")});
            return;
        }

        if (!isNaN(speaker.id)) {
            // existing speaker
            if (currentSpeakerType == 'moderator') {
                onAddModerator(speaker);
            } else {
                onAddSpeaker(speaker);
            }
            this.setState({...this.state, currentSpeakerType: null, speakerInput: null, error: null});
            return false;
        }

        if (speaker.value) {

            // new speaker
            history.push(`${match.url}/new`, { email: speaker.value, type: currentSpeakerType });
            return false;
        }

        // speaker not set
        this.setState({...this.state, error: T.translate("edit_presentation.errors.missing_speaker", {speaker: speakerLabel})});
        return false;
    }

    render() {
        let {summit, selectionPlanSettings, entity, presentation, step} = this.props;
        let {speakerInput, error, speaker} = this.state;
        let eventType = summit.event_types.find(t => t.id == entity.type_id);
        let speakersCount = entity.speakers?.length ?? 0;
        let canAddSpeakers = (eventType && eventType.max_speakers > speakersCount);
        let canAddModerator = (eventType && eventType.max_moderators && !entity.moderator);

        let speakerTypes = [];
        if(canAddSpeakers){
            speakerTypes.push({value:'speaker', label: selectionPlanSettings?.CFP_SPEAKERS_SINGULAR_LABEL || T.translate("edit_presentation.labels.speaker")});
        }

        if(canAddModerator){
            speakerTypes.push({value:'moderator', label: T.translate("edit_presentation.labels.moderator")});
        }

        return (
            <div>
                <h3>{T.translate("edit_presentation.speaker_included",
                    { presentation: selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation")})}</h3>

                <span dangerouslySetInnerHTML={{ __html: T.translate("edit_presentation.speaker_included_note")}} />

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

                    {entity.speakers?.map(s => (
                        <div className="row speaker" key={"speaker_" + s.id}>
                            <div className="col-md-4">
                                <i className="fa fa-user"></i>
                                <a href="#" onClick={this.handleSpeakerClick.bind(this, s.id, 'speaker')}>{s.first_name} {s.last_name}</a>
                            </div>
                            <div className="col-md-4">
                                {selectionPlanSettings?.CFP_SPEAKERS_SINGULAR_LABEL || T.translate("edit_presentation.speaker")}
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
                    {speakerTypes.length > 0 &&
                    <div>
                        <br/>
                        <div className="row form-group">
                            <div className="col-md-8">
                                <label> {T.translate("edit_presentation.enter_speaker")} </label>
                                <CPFSpeakerInput
                                    id="speaker"
                                    selectionPlanSettings={selectionPlanSettings}
                                    value={speakerInput}
                                    speakers={entity.speakers}
                                    placeholder={T.translate("edit_presentation.placeholders.speakers",
                                        {speakers: `${selectionPlanSettings?.CFP_SPEAKERS_PLURAL_LABEL ||
                                            T.translate('edit_presentation.speakers').toLowerCase()}`
                                        })}
                                    onChange={this.handleChangeSpeaker}
                                />
                            </div>
                            <div className="col-md-3">
                                <label> {T.translate("edit_presentation.role")} </label>
                                <Dropdown
                                    id="speaker_type"
                                    value={this.state.currentSpeakerType}
                                    options={speakerTypes}
                                    onChange={this.handleChangeSpeakerType}
                                    isSearchable={false}
                                    isClearable={false}
                                    placeholder={T.translate("edit_presentation.placeholders.role")}
                                />
                            </div>
                            <div className="col-md-1 add-speaker-btn">
                                <button
                                    className="btn btn-primary"
                                    onClick={this.handleAddSpeaker}>
                                    {T.translate("edit_presentation.add_speaker")}
                                </button>
                            </div>
                        </div>
                        {error &&
                        <p className="error-label">{error}</p>}
                        {speaker && isNaN(speaker.id) && (speaker.value)  &&
                        <p>* Please select a Role and click "Add".</p>}
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
                    <SubmitButtons presentation={presentation} step={step} onSubmit={this.handleSubmit.bind(this)} />
                </form>

            </div>
        );
    }
}

export default PresentationSpeakersForm;
