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
import history from '../history'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Input, TextEditor, UploadInput, RadioList } from 'openstack-uicore-foundation/lib/components'
import {findElementPos} from 'openstack-uicore-foundation/lib/methods'


class ProfileForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
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

    handleUploadFile(file) {
        console.log('file uploaded');
        let formData = new FormData();
        formData.append('file', file);
        this.props.onAttach(this.state.entity, formData)
    }

    handleRemoveFile(ev) {
        let entity = {...this.state.entity};

        entity.attachment = '';
        this.setState({entity:entity});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
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

        return (
            <form className="summit-speaker-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_profile.title")} </label>
                        <Input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("general.first_name")} </label>
                        <Input className="form-control" id="first_name" value={entity.first_name} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("general.last_name")} </label>
                        <Input className="form-control" id="last_name" value={entity.last_name} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_profile.email")} </label>
                        <Input disabled className="form-control" id="email" value={entity.email} onChange={this.handleChange}/>
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_profile.twitter")} </label>
                        <Input className="form-control" id="twitter" value={entity.twitter} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_profile.irc")} </label>
                        <Input className="form-control" id="irc" value={entity.irc} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_profile.bio")} </label>
                        <TextEditor id="bio" value={entity.bio} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_profile.profile_pic")} </label>
                        <UploadInput
                            value={entity.pic}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.affiliations")}</label><br/>
                        {T.translate("edit_profile.affiliations_disclaimer")}
                    </div>
                </div>
                <hr/>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.disclaimer")}</label><br/>
                        {T.translate("edit_profile.disclaimer_text")}
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.want_bureau")}</label><br/>
                        {T.translate("edit_profile.want_bureau_text")}
                        <div className="checkboxes-div">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="speaker_bureau" checked={entity.speaker_bureau}
                                       onChange={this.handleChange} className="form-check-input" />
                                <label className="form-check-label" htmlFor="speaker_bureau">
                                    {T.translate("edit_profile.speaker_bureau")}
                                </label>
                            </div>
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="video_conference" checked={entity.video_conference}
                                       onChange={this.handleChange} className="form-check-input" />
                                <label className="form-check-label" htmlFor="video_conference">
                                    {T.translate("edit_profile.video_conference")}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.spoken_languages")}</label>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.expertise")}</label>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.previous_links")}</label>
                    </div>
                </div>
                <hr/>
                <h3>{T.translate("edit_profile.travel")}</h3>
                <div className="row form-group">
                    <div className="col-md-12 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="travel_restrictions" checked={entity.travel_restrictions}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="travel_restrictions">
                                {T.translate("edit_profile.travel_restrictions")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.select_countries")}</label>
                    </div>
                    <div className="col-md-12 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="company_willing" checked={entity.company_willing}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="company_willing">
                                {T.translate("edit_profile.company_willing")}
                            </label>
                        </div>
                    </div>
                </div>
                <hr/>
                <h3>{T.translate("edit_profile.role")}</h3>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.org_role")}</label>
                        <div className="checkboxes-div">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id="speaker_bureau" checked={entity.speaker_bureau}
                                       onChange={this.handleChange} className="form-check-input" />
                                <label className="form-check-label" htmlFor="speaker_bureau">
                                    {T.translate("edit_profile.speaker_bureau")}
                                </label>
                            </div>
                        </div>
                        <label>{T.translate("edit_profile.org_role_other")}</label>
                    </div>
                    <div className="col-md-12">
                        <label>{T.translate("edit_profile.opertating_os")}</label>
                        <RadioList
                            id="opertating_os"
                            value={entity.opertating_os}
                            onChange={this.handleChange}
                            options={[{value: 1, label: T.translate("general.yes")}, {value: 0, label: T.translate("general.no")}]}
                            error={this.hasErrors('opertating_os')}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default ProfileForm;
