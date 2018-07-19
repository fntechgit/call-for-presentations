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
import { Input, TextEditor, UploadInput, Dropdown } from 'openstack-uicore-foundation/lib/components'
import {findElementPos} from 'openstack-uicore-foundation/lib/methods'
import RadioList from './radio-list'
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

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity, this.props.history);
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
        let {selectionPlan} = this.props;


        // TODO get submission event type options
        let event_types_ddl = [
            {label: 'Presentation', value: 1, type: 'Presentation'},
            {label: 'Panel', value: 2, type: 'Panel'}
        ];

        // TODO get event level options
        let level_ddl = [
            {label: 'Beginner', value: 'Beginner'},
            {label: 'Intermediate', value: 'Intermediate'},
            {label: 'Advanced', value: 'Advanced'},
            {label: 'N/A', value: 'N/A'}
        ];

        // TODO get categories from selectionPlan
        // let categories = selectionPlan.categoryGroups.map(t => ({label: t.name, value: t.id}));
        let categories = [
            {label: 'Container Infra', value: 1, description: 'Topics include: Running containers at scale, container ecosystem, container networking, container storage, container security, hybrid VM & container architectures, containers & bare metal'},
            {label: 'Edge Computing', value: 2, description: 'Topics include: 5G, cloudlet, distributed computing, Mesh, security, networking, architecture, ease of deployment, edge ecosystem, hardware performance accelerators (e.g. GPUs, ASICs, etc.), hardware profile, IoT, low end-to-end latency, management tools, scaling, edge-enabled applications, physical hardening, QoS, remote/extreme environments, remote troubleshooting, standalone cloudlets, tamper evidence, tamper resistance, VM and container handoff across WAN connections, zero-touch provisioning'}
        ];

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
                        <label> {T.translate("edit_presentation.abstract")} (1000 chars) </label>
                        <TextEditor id="abstract" className="editor" value={entity.abstract} onChange={this.handleChange} />
                    </div>
                </div>
                <hr/>
                <div className="row form-group">
                    <div className="col-md-12">
                        <p>{T.translate("edit_presentation.social_summary_desc")}</p>
                        <label> {T.translate("edit_presentation.social_summary")} (100 chars) </label>
                        <textarea id="social_summary" value={entity.social_summary} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_presentation.expected_learn")} (1000 chars) </label>
                        <TextEditor id="expected_learn" className="editor" value={entity.expected_learn} onChange={this.handleChange} />
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
                        <Input className="form-control" id="link_1" value={entity.link_1} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #2 </label>
                        <Input className="form-control" id="link_2" value={entity.link_2} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #3 </label>
                        <Input className="form-control" id="link_3" value={entity.link_3} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #4 </label>
                        <Input className="form-control" id="link_4" value={entity.link_4} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label> #5 </label>
                        <Input className="form-control" id="link_5" value={entity.link_5} onChange={this.handleChange} />
                    </div>
                </div>
                <hr/>
                <SubmitButtons onSubmit={this.handleSubmit.bind(this)} />
            </form>
        );
    }
}

export default PresentationSummaryForm;
