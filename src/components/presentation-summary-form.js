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

import React, {useState, useEffect} from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {Dropdown, Input, RadioList, RawHTML, TextArea, TextEditor} from 'openstack-uicore-foundation/lib/components'
import SubmitButtons from './presentation-submit-buttons'
import {scrollToError, validate} from '../utils/methods'
import QuestionsInput from '../components/inputs/questions-input'

const PresentationSummaryForm = (props) => {
    const {selectionPlan, selectionPlanSettings, summit, presentation, step, disclaimer} = props;
    const [entity, setEntity] = useState({...props.entity});
    const [errors, setErrors] = useState({});
    const errorsLength = Object.keys(errors).length;
    let event_types_ddl = [];
    let categories = [];

    useEffect(() => {
        //scroll to first error
        if (Object.keys(errors).length > 0) {
            scrollToError();
        }
    }, [errorsLength]);

    useEffect(() => {
        //scroll to first error
        if (Object.keys(props.errors).length > 0) {
            setErrors(props.errors);
        }
    }, [props.errors]);

    useEffect(() => {
        const entity_copy = {...entity};
        let entityChanged = false;

        // set event type if only one option (2 counting the placeholder)
        if (!entity.id && !entity.type_id && event_types_ddl.length === 2) {
            entity_copy.type_id = event_types_ddl[0].value;
            entityChanged = true;
        }

        // set event category if only one option
        if (!entity.id && categories.length === 1) {
            entity_copy.track_id = categories[0].value;
            entityChanged = true;
        }

        if (entityChanged) {
            setEntity(entity_copy);
        }

    }, [event_types_ddl.length, categories.length]);

    const handleChange = (ev) => {
        let entity_copy = {...entity};
        let errors_copy = {...errors};
        let {value, id} = ev.target;
        id = id.toString();

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (id.startsWith('link_')) {
            delete (errors_copy[id]);
            id = 'links';
            value = [...entity_copy.links];
            value[ev.target.dataset.key] = ev.target.value.trim();
        }

        delete (errors_copy[id]);
        entity_copy[id] = value;
        setEntity(entity_copy);
        setErrors(errors_copy);
    }

    const handleSubmit = (ev) => {
        const {selectionPlan, disclaimer} = props;
        const errors_copy = {...errors};
        ev.preventDefault();        

        let rules = {
            title: {required: 'Title is required.'},
            type_id: {required: 'Format is required.'},
            track_id: {required: 'Please select a track.'},
            extra_questions: {
                required_questions: {
                    value: selectionPlan.extra_questions,
                    msg: 'Please complete required Questions.',
                },
                maxLength: {
                    value: 512,
                    msg: 'Answer exceeds max limit of 512 characters',
                    field: 'answer',
                }
            },
        };

        if (disclaimer) {
            // add the rule
            rules = {
                ...rules, disclaimer_accepted: {
                    required: 'This field is required.',
                }
            }
        }

        if (isQuestionEnabled('level')) {
            rules.level = {required: 'Please select the level.'};
        }

        if (isQuestionEnabled('social_description')) {
            rules.social_description = {maxLength: {value: 280, msg: 'Value exceeds max limit of 280 characters'}};
        }

        if (isQuestionEnabled('attendees_expected_learnt')) {
            rules.attendees_expected_learnt = {
                required: 'This field is required.',
                maxLength: {value: 1000, msg: 'Value exceeds max limit of 1000 characters'}
            };
        }

        if (isQuestionEnabled('description')) {
            rules.description = {
                required: 'Abstract is required.',
                maxLength: {value: 1000, msg: 'Value exceeds max limit of 1000 characters'}
            };
        }

        if (isQuestionEnabled('links')) {
            rules.links = {links: 'Link is not valid. Links must start with http:// or https://'};
        }

        validate(entity, rules, errors_copy);

        if (Object.keys(errors_copy).length === 0) {
            props.onSubmit(entity);
            return
        }

        setErrors(errors_copy);
    }

    const hasErrors = (field) => {
        if (field in errors) {
            return errors[field];
        }

        return '';
    }

    const isQuestionEnabled = (question_id) => {
        const {selectionPlan} = props;
        return selectionPlan.allowed_presentation_questions.includes(question_id);
    }

    const isQuestionEditable = (question_id) => {
        const {selectionPlan} = props;
        return selectionPlan.allowed_presentation_editable_questions.includes(question_id);
    }

    if (!summit || !selectionPlan) return (<div/>);

    event_types_ddl = summit.event_types
        .filter(et => selectionPlan.event_types.includes(et.id))
        .map(et => {
            return ({value: et.id, label: et.name, type: et.class_name});
        });

    let event_types_limits = '';
    for (var event_type of event_types_ddl) {
        const ev_type_obj = summit.event_types.find(ev => ev.id === event_type.value);
        event_types_limits += ev_type_obj.name + ': ' + T.translate("edit_presentation.format_max_speakers",
            {
                speakers: `${selectionPlanSettings?.CFP_SPEAKERS_PLURAL_LABEL ||
                T.translate('edit_presentation.speakers')}`
            }) + ' ' + ev_type_obj.max_speakers;
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

    const allAllowedTrackIds = selectionPlan.track_groups.reduce((res, item) => {
        return [...res, ...item.tracks];
    }, []);

    const allowedTrackIds = [...new Set(allAllowedTrackIds)];

    categories = summit.tracks
        .filter(t => allowedTrackIds.includes(t.id))
        .map(t => ({value: t.id, label: t.name, description: t.description, order: t.order})).sort(
            (a, b) => {
                if (a.order < b.order) {
                    return -1;
                }
                if (a.order > b.order) {
                    return 1;
                }
                return 0;
            }
        );

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
                    <input type="checkbox"
                           id="disclaimer_accepted"
                           name="disclaimer_accepted"
                           disabled={entity.id > 0 && !isQuestionEditable('disclaimer_accepted')}
                           checked={entity.disclaimer_accepted}
                           onChange={handleChange} className="form-check-input"/>
                    <label className="form-check-label" htmlFor="disclaimer_accepted">
                        I Agree *
                    </label>
                </div>
                {hasErrors('disclaimer_accepted') &&
                <p className="error-label">{hasErrors('disclaimer_accepted')}</p>
                }
            </div>
            }
            <form className="presentation-summary-form">
                <input type="hidden" id="id" value={entity.id}/>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {selectionPlanSettings?.CFP_PRESENTATION_SUMMARY_TITLE_LABEL || T.translate("edit_presentation.title")} </label>
                        <Input
                            className="form-control"
                            id="title"
                            value={entity.title}
                            onChange={handleChange}
                            disabled={entity.id > 0 && !isQuestionEditable('title')}
                            error={hasErrors('title')}
                        />
                    </div>
                </div>
                {selectionPlanSettings?.CFP_PRESENTATION_SUMMARY_HIDE_TRACK_SELECTION !== '1' && event_types_ddl.length > 2 &&
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.format")} </label>
                            <p> {event_types_limits} </p>
                            <Dropdown
                                id="type_id"
                                value={entity.type_id}
                                onChange={handleChange}
                                placeholder={T.translate("general.placeholders.select_one")}
                                options={event_types_ddl}
                                disabled={!!entity.id}
                                error={hasErrors('type_id')}
                            />
                        </div>
                    </div>
                }            
                {selectionPlanSettings?.CFP_PRESENTATION_SUMMARY_HIDE_ACTIVITY_TYPE_SELECTION !== '1' && categories.length > 1 &&
                    <div className="row form-group">
                        <div className="col-md-12">
                            <label> {T.translate("edit_presentation.general_topic",
                                {presentation: selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation").toLowerCase()})} </label>
                            <RadioList
                                disabled={entity.id > 0 && !isQuestionEditable('track_id')}
                                id="track_id"
                                value={entity.track_id}
                                onChange={handleChange}
                                options={categories}
                                error={hasErrors('track_id')}
                            />
                        </div>
                    </div>
                }
                {isQuestionEnabled('level') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.level",
                            {presentation: selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation").toLowerCase()})} </label>
                        <Dropdown
                            disabled={entity.id > 0 && !isQuestionEditable('level')}
                            id="level"
                            value={entity.level}
                            onChange={handleChange}
                            placeholder={T.translate("general.placeholders.select_one")}
                            options={level_ddl}
                            error={hasErrors('level')}
                        />
                    </div>
                </div>
                }
                {isQuestionEnabled('description') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {selectionPlanSettings?.CFP_PRESENTATION_SUMMARY_ABSTRACT_LABEL || T.translate("edit_presentation.abstract")} </label>
                        <TextEditor id="description"
                                    className={`editor${entity.id > 0 && !isQuestionEditable('description')?' disabled':''}`}
                                    value={entity.description}
                                    readOnly={entity.id > 0 && !isQuestionEditable('description')}
                                    onChange={handleChange} error={hasErrors('description')}/>
                    </div>
                </div>
                }
                <hr/>
                {isQuestionEnabled('social_description') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <p>{T.translate("edit_presentation.social_summary_desc")}</p>
                        <label> {selectionPlanSettings?.CFP_PRESENTATION_SUMMARY_SOCIAL_SUMMARY_LABEL || T.translate("edit_presentation.social_summary")} </label>
                        <TextArea id="social_description" value={entity.social_description}
                                  disabled={entity.id > 0 && !isQuestionEditable('social_description')}
                                  onChange={handleChange} error={hasErrors('social_description')}/>
                    </div>
                </div>
                }
                {isQuestionEnabled('attendees_expected_learnt') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.expected_learn")} </label>
                        <TextEditor id="attendees_expected_learnt"
                                    className={`editor${entity.id > 0 && !isQuestionEditable('attendees_expected_learnt')?' disabled':''}`}
                                    readOnly={entity.id > 0 && !isQuestionEditable('attendees_expected_learnt')}
                                    value={entity.attendees_expected_learnt} onChange={handleChange}
                                    error={hasErrors('attendees_expected_learnt')}/>
                    </div>
                </div>
                }
                {isQuestionEnabled('attending_media') &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.attending_media",
                            {presentation: selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation").toLowerCase()})} </label>
                        <RadioList
                            disabled={entity.id > 0 && !isQuestionEditable('attending_media')}
                            id="attending_media"
                            value={entity.attending_media}
                            onChange={handleChange}
                            options={attending_media_opts}
                            inline
                            error={hasErrors('attending_media')}
                        />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-12">
                        <QuestionsInput
                            id="extra_questions"
                            answers={entity.extra_questions}
                            entity={entity}
                            questions={selectionPlan.extra_questions}
                            onChange={handleChange}
                            error={hasErrors('extra_questions')}
                        />
                    </div>
                </div>
                {isQuestionEnabled('links') &&
                <>
                    <hr/>
                    <div className="row form-group">
                        <div className="col-md-12">
                            <p>{selectionPlanSettings?.CFP_PRESENTATION_SUMMARY_LINKS_LABEL || T.translate("edit_presentation.links")} </p>
                        </div>
                        <div className="col-md-12">
                            <label> #1 </label>
                            <Input
                                disabled={entity.id > 0 && !isQuestionEditable('links')}
                                className="form-control" id="link_0" data-key="0" value={entity.links[0]}
                                onChange={handleChange} error={hasErrors('link_0')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #2 </label>
                            <Input
                                disabled={entity.id > 0 && !isQuestionEditable('links')}
                                className="form-control" id="link_1" data-key="1" value={entity.links[1]}
                                onChange={handleChange} error={hasErrors('link_1')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #3 </label>
                            <Input
                                disabled={entity.id > 0 && !isQuestionEditable('links')}
                                className="form-control" id="link_2" data-key="2" value={entity.links[2]}
                                onChange={handleChange} error={hasErrors('link_2')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #4 </label>
                            <Input
                                disabled={entity.id > 0 && !isQuestionEditable('links')}
                                className="form-control" id="link_3" data-key="3" value={entity.links[3]}
                                onChange={handleChange} error={hasErrors('link_3')}/>
                        </div>
                        <div className="col-md-12">
                            <label> #5 </label>
                            <Input
                                disabled={entity.id > 0 && !isQuestionEditable('links')}
                                className="form-control" id="link_4" data-key="4" value={entity.links[4]}
                                onChange={handleChange} error={hasErrors('link_4')}/>
                        </div>
                    </div>
                </>
                }
                <hr/>
                <SubmitButtons
                    presentation={presentation}
                    step={step}
                    onSubmit={handleSubmit}
                    showBack={false}
                />
            </form>
        </div>
    );
}

export default PresentationSummaryForm;
