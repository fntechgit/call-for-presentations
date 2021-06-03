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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {Input, TextEditor, Dropdown, RadioList, TextArea, RawHTML} from 'openstack-uicore-foundation/lib/components'
import {findElementPos} from 'openstack-uicore-foundation/lib/methods'
import SubmitButtons from './presentation-submit-buttons'
import {validate, scrollToError} from '../utils/methods'
import QuestionsInput from '../components/inputs/questions-input'

class PresentationSummaryForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if (Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {

        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;
        id = id.toString();

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (id.startsWith('link_')) {
            delete (errors[id]);
            id = 'links';
            value = [...entity.links];
            value[ev.target.dataset.key] = ev.target.value;
        }

        delete (errors[id]);
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {

        const {summit, selectionPlan, disclaimer} = this.props;
        const {entity, errors} = this.state;
        const selectedType = summit.event_types.find(ev => ev.id === entity.type_id);

        ev.preventDefault();

        let rules = {
            title: {required: 'Title is required.'},
            type_id: {required: 'Format is required.'},
            track_id: {required: 'Please select a track.'},
            description: {
                required: 'Abstract is required.',
                maxLength: {value: 1000, msg: 'Value exceeds max limit of 1000 characters'}
            },
            social_description: {
                maxLength: {value: 100, msg: 'Value exceeds max limit of 100 characters'}
            },
            attendees_expected_learnt: {
                required: 'This field is required.',
                maxLength: {value: 1000, msg: 'Value exceeds max limit of 100 characters'}
            },
            links: {links: 'Link is not valid. Links must start with http:// or https://'},
            extra_questions: {
                required_questions: {
                    value: selectionPlan.extra_questions,
                    msg: 'Please complete required Questions.',
                }
            },
        };

        if(disclaimer){
            // add the rule
            rules = {...rules , disclaimer_accepted:{
                required: 'This field is required.',
            }}
        }

        if (selectedType && selectedType.allows_level) {
            rules.level = {required: 'Please select the level.'};
        }

        validate(entity, rules, errors);

        if (Object.keys(errors).length === 0) {
            this.props.onSubmit(entity);
            return
        }

        this.setState({errors}, () => {
            if (Object.keys(errors).length > 0) {
                scrollToError();
            }
        });
    }

    hasErrors(field) {
        let {errors} = this.state;
        if (field in errors) {
            return errors[field];
        }

        return '';
    }

    render() {
        const {entity} = this.state;
        const {selectionPlan, summit, presentation, step, disclaimer} = this.props;

        if (!summit || !selectionPlan) return (<div/>);

        const selectedType = summit.event_types.find(ev => ev.id === entity.type_id);
        const event_types_ddl = summit.event_types
            .filter(et => et.should_be_available_on_cfp)
            .map(et => {
                return ({value: et.id, label: et.name, type: et.class_name});
            });

        let event_types_limits = '';
        for (var event_type of event_types_ddl) {
            const ev_type_obj = summit.event_types.find(ev => ev.id === event_type.value);
            event_types_limits += ev_type_obj.name + ': ' + T.translate("edit_presentation.format_max_speakers") + ' ' + ev_type_obj.max_speakers;
            if (ev_type_obj.max_moderators) {
                event_types_limits += ', ' + T.translate("edit_presentation.format_max_moderators") + ' ' + ev_type_obj.max_moderators;
            }
            event_types_limits += ' - ';
        }

        // empty value
        event_types_ddl.push({value: 0, label: T.translate("edit_presentation.placeholders.type_id"), type: ''});

        // TODO get event level options
        const level_ddl = [
            // empty value
            {label: T.translate("edit_presentation.placeholders.level"), value: ''},
            {label: T.translate("event_level.Beginner"), value: 'Beginner'},
            {label: T.translate("event_level.Intermediate"), value: 'Intermediate'},
            {label: T.translate("event_level.Advanced"), value: 'Advanced'},
            {label: 'N/A', value: 'N/A'}
        ];

        let allowedTrackIds = selectionPlan.track_groups.map(tg => [...tg.tracks]);
        allowedTrackIds = [].concat(...allowedTrackIds);

        const categories = summit.tracks
            .filter(t => allowedTrackIds.includes(t.id))
            .map(t => ({value: t.id, label: t.name, description: t.description}));


        const attending_media_opts = [
            {label: T.translate("general.yes"), value: 1},
            {label: T.translate("general.no"), value: 0}
        ];

        const speakers_attend_opts = [
            {label: T.translate("general.yes"), value: 1},
            {label: T.translate("general.no"), value: 0}
        ];

        return (
            <div className="presentation-form-wrapper">
                {disclaimer &&
                    <div className="disclaimer">
                        <RawHTML>
                            {disclaimer}
                        </RawHTML>
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="disclaimer_accepted" name="disclaimer_accepted"
                                   checked={entity.disclaimer_accepted}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="disclaimer_accepted">
                                I Agree
                            </label>
                        </div>
                        {this.hasErrors('disclaimer_accepted') &&
                        <p className="error-label">{this.hasErrors('disclaimer_accepted')}</p>
                        }
                    </div>
                }
                <form className="presentation-summary-form">
                    <input type="hidden" id="id" value={entity.id}/>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.title")} </label>
                            <Input
                                className="form-control"
                                id="title"
                                value={entity.title}
                                onChange={this.handleChange}
                                error={this.hasErrors('title')}
                                disabled={!!entity.id}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.format")} </label>
                            <p> {event_types_limits} </p>
                            <Dropdown
                                id="type_id"
                                value={entity.type_id}
                                onChange={this.handleChange}
                                placeholder={T.translate("general.placeholders.select_one")}
                                options={event_types_ddl}
                                disabled={!!entity.id}
                                error={this.hasErrors('type_id')}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.general_topic")} </label>
                            <RadioList
                                id="track_id"
                                value={entity.track_id}
                                onChange={this.handleChange}
                                options={categories}
                                error={this.hasErrors('track_id')}
                            />
                        </div>
                    </div>
                    {selectedType && selectedType.allows_level &&
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.level")} </label>
                            <Dropdown
                                id="level"
                                value={entity.level}
                                onChange={this.handleChange}
                                placeholder={T.translate("general.placeholders.select_one")}
                                options={level_ddl}
                                error={this.hasErrors('level')}
                            />
                        </div>
                    </div>
                    }
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.abstract")} </label>
                            <TextEditor id="description" className="editor" value={entity.description}
                                        onChange={this.handleChange} error={this.hasErrors('description')}/>
                        </div>
                    </div>
                    <hr/>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <p>{T.translate("edit_presentation.social_summary_desc")}</p>
                            <label> {T.translate("edit_presentation.social_summary")} </label>
                            <TextArea id="social_description" value={entity.social_description}
                                      onChange={this.handleChange} error={this.hasErrors('social_description')}/>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.expected_learn")} </label>
                            <TextEditor id="attendees_expected_learnt" className="editor"
                                        value={entity.attendees_expected_learnt} onChange={this.handleChange}
                                        error={this.hasErrors('attendees_expected_learnt')}/>
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.attending_media")} </label>
                            <RadioList
                                id="attending_media"
                                value={entity.attending_media}
                                onChange={this.handleChange}
                                options={attending_media_opts}
                                inline
                                error={this.hasErrors('attending_media')}
                            />
                        </div>
                    </div>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <QuestionsInput
                                id="extra_questions"
                                answers={entity.extra_questions}
                                entity={entity}
                                questions={selectionPlan.extra_questions}
                                onChange={this.handleChange}
                                error={this.hasErrors('extra_questions')}
                            />
                        </div>
                    </div>
                    <hr/>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <p>{T.translate("edit_presentation.links")} </p>
                        </div>
                        <div className="col-md-12">
                            <label> #1 </label>
                            <Input className="form-control" id="link_0" data-key="0" value={entity.links[0]}
                                   onChange={this.handleChange} error={this.hasErrors('link_0')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #2 </label>
                            <Input className="form-control" id="link_1" data-key="1" value={entity.links[1]}
                                   onChange={this.handleChange} error={this.hasErrors('link_1')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #3 </label>
                            <Input className="form-control" id="link_2" data-key="2" value={entity.links[2]}
                                   onChange={this.handleChange} error={this.hasErrors('link_2')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #4 </label>
                            <Input className="form-control" id="link_3" data-key="3" value={entity.links[3]}
                                   onChange={this.handleChange} error={this.hasErrors('link_3')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #5 </label>
                            <Input className="form-control" id="link_4" data-key="4" value={entity.links[4]}
                                   onChange={this.handleChange} error={this.hasErrors('link_4')}/>
                        </div>
                    </div>
                    <hr/>
                    <SubmitButtons presentation={presentation} step={step} onSubmit={this.handleSubmit.bind(this)}/>
                </form>
            </div>
        );
    }
}

export default PresentationSummaryForm;
