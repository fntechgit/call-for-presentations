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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Input, TextEditor, UploadInput, Dropdown, RadioList } from 'openstack-uicore-foundation/lib/components'
import {findElementPos} from 'openstack-uicore-foundation/lib/methods'
import SubmitButtons from './presentation-submit-buttons'


class PresentationSummaryForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
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
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        if (id.startsWith('link_')) {
            id = 'links';
            value = [...entity.links];
            value[ev.target.dataset.key] = ev.target.value;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(entity, 'tags');
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }


    render() {
        let {entity} = this.state;
        let {selectionPlan, summit} = this.props;

        let event_types_ddl = summit.event_types
            .filter(et => et.should_be_available_on_cfp)
            .map(et => {
                return ({value: et.id, label: et.name, type: et.class_name});
        });

        // TODO get event level options
        let level_ddl = [
            {label: 'Beginner', value: 'Beginner'},
            {label: 'Intermediate', value: 'Intermediate'},
            {label: 'Advanced', value: 'Advanced'},
            {label: 'N/A', value: 'N/A'}
        ];

        let allowedTrackIds = selectionPlan.track_groups.map(tg => [...tg.tracks]);
        allowedTrackIds = [].concat(...allowedTrackIds);

        let categories = summit.tracks
            .filter(t => allowedTrackIds.includes(t.id))
            .map(t => ({value: t.id, label: t.name, description: t.description}));


        let attending_media_opts = [
            {label: T.translate("general.yes"), value: 1},
            {label: T.translate("general.no"), value: 0}
        ];

        return (
            <form className="presentation-summary-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.title")} </label>
                        <Input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.format")} </label>
                        <Dropdown
                            id="type_id"
                            value={entity.type_id}
                            onChange={this.handleChange}
                            placeholder={T.translate("general.placeholders.select_one")}
                            options={event_types_ddl}
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
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.abstract")} </label>
                        <TextEditor id="description" className="editor" value={entity.description} onChange={this.handleChange} />
                    </div>
                </div>
                <hr/>
                <div className="row form-group">
                    <div className="col-md-12">
                        <p>{T.translate("edit_presentation.social_summary_desc")}</p>
                        <label> {T.translate("edit_presentation.social_summary")} </label>
                        <textarea id="social_description" value={entity.social_description} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.expected_learn")} </label>
                        <TextEditor id="attendees_expected_learnt" className="editor" value={entity.attendees_expected_learnt} onChange={this.handleChange} />
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
                <hr/>
                <div className="row form-group">
                    <div className="col-md-12">
                        <p>{T.translate("edit_presentation.links")} </p>
                    </div>
                    <div className="col-md-12">
                        <label> #1 </label>
                        <Input className="form-control" id="link_0" data-key="0" value={entity.links[0]} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #2 </label>
                        <Input className="form-control" id="link_1" data-key="1" value={entity.links[1]} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #3 </label>
                        <Input className="form-control" id="link_2" data-key="2" value={entity.links[2]} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #4 </label>
                        <Input className="form-control" id="link_3" data-key="3" value={entity.links[3]} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #5 </label>
                        <Input className="form-control" id="link_4" data-key="4" value={entity.links[4]} onChange={this.handleChange} />
                    </div>
                </div>
                <hr/>
                <SubmitButtons onSubmit={this.handleSubmit.bind(this)} />
            </form>
        );
    }
}

export default PresentationSummaryForm;
