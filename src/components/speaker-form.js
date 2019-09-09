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
import {findElementPos} from 'openstack-uicore-foundation/lib/methods'
import AffiliationsTable from './affiliationstable'
import PresentationLinks from "./inputs/presentation-links";
import { Input, TextEditor, UploadInput, Exclusive, RadioList, CountryInput, LanguageInput, CheckboxList, FreeMultiTextInput } from 'openstack-uicore-foundation/lib/components'
import {validate, scrollToError} from "../utils/methods";


class SpeakerForm extends React.Component {
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

        delete(errors[id]);
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleUploadFile(file) {
        let entity = {...this.state.entity};
        entity.pic_file = file;
        entity.pic = file.preview;
        this.setState({entity: entity});
    }

    handleRemoveFile(ev) {
        let entity = {...this.state.entity};
        entity.pic_file = null;
        entity.pic = '';
        this.setState({entity:entity});
    }

    handleSubmit(ev) {
        let {entity, errors} = this.state;
        let linksOk = true;
        ev.preventDefault();

        let rules = {
            title: {required: 'Title is required.'},
            first_name: {required: 'First name is required.'},
            last_name: {required: 'Last name is required.'},
            email: {required: 'Email is required.', email: 'This is not a valid email address.'},
            country: { required: 'Please select a Country.'},
            bio: { required: 'Please tell us about yourself.', maxLength: {value: 1000, msg: 'Value exeeded max limit of 1000 characters'}},
            other_presentation_links: {title_link: 'Links must start with http or https'}
        };

        validate(entity, rules, errors)

        if (Object.keys(errors).length == 0) {
            this.props.onSubmit(this.state.entity);
        } else {
            this.setState({errors}, () => {
                if (Object.keys(errors).length > 0) {
                    scrollToError();
                }
            });
        }

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
        let {member, orgRoles} = this.props;
        let showAffiliation = this.props.hasOwnProperty('showAffiliation');

        let roleOptions = orgRoles.map(r => ({value: r.id, label: r.role}));

        return (
            <form className="summit-speaker-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_speaker.title")} </label>
                        <Input className="form-control" id="title" value={entity.title} onChange={this.handleChange} error={this.hasErrors('title')} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("general.first_name")} </label>
                        <Input className="form-control" id="first_name" value={entity.first_name} onChange={this.handleChange} error={this.hasErrors('first_name')}/>
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("general.last_name")} </label>
                        <Input className="form-control" id="last_name" value={entity.last_name} onChange={this.handleChange} error={this.hasErrors('last_name')}/>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_speaker.email")} </label>
                        <Input disabled className="form-control" id="email" value={entity.email} onChange={this.handleChange} error={this.hasErrors('email')}/>
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_speaker.twitter")} </label>
                        <Input className="form-control" id="twitter" value={entity.twitter} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_speaker.irc")} </label>
                        <Input className="form-control" id="irc" value={entity.irc} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_speaker.country")} </label>
                        <CountryInput id="country" value={entity.country} onChange={this.handleChange} error={this.hasErrors('country')} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_speaker.bio")} </label>
                        <TextEditor id="bio" value={entity.bio} onChange={this.handleChange} error={this.hasErrors('bio')} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_speaker.profile_pic")} </label>
                        <UploadInput
                            value={entity.pic}
                            file={entity.pic_file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                {showAffiliation &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_speaker.affiliations")}</label><br/>
                        <AffiliationsTable
                            ownerId={member.id}
                            data={entity.affiliations}
                        />

                        {T.translate("edit_speaker.affiliations_disclaimer")}
                    </div>
                </div>
                }
                <Exclusive name="speaker-recording-disclaimer">
                    <div>
                        <hr/>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label>{T.translate("edit_speaker.disclaimer")}</label><br/>
                                {T.translate("edit_speaker.disclaimer_text")}
                            </div>
                        </div>
                    </div>
                </Exclusive>
                <Exclusive name="speaker-bureau">
                    <div className="row form-group speaker-bureau-wrapper">
                        <div className="col-md-12">
                            <label>{T.translate("edit_speaker.want_bureau")}</label><br/>
                            {T.translate("edit_speaker.want_bureau_text")}
                            <div className="checkboxes-div">
                                <div className="form-check abc-checkbox">
                                    <input type="checkbox" id="available_for_bureau" checked={entity.available_for_bureau}
                                           onChange={this.handleChange} className="form-check-input" />
                                    <label className="form-check-label" htmlFor="available_for_bureau">
                                        {T.translate("edit_speaker.speaker_bureau")}
                                    </label>
                                </div>
                                <div className="form-check abc-checkbox">
                                    <input type="checkbox" id="willing_to_present_video" checked={entity.willing_to_present_video}
                                           onChange={this.handleChange} className="form-check-input" />
                                    <label className="form-check-label" htmlFor="willing_to_present_video">
                                        {T.translate("edit_speaker.video_conference")}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Exclusive>
                <hr/>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_speaker.spoken_languages")}</label><br/>
                        <LanguageInput id="languages" multi value={entity.languages} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_speaker.expertise")}</label><br/>
                        <FreeMultiTextInput id="areas_of_expertise" limit={5} value={entity.areas_of_expertise} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label>{T.translate("edit_speaker.previous_links")}</label>
                    </div>
                    <div className="col-md-8">
                        <PresentationLinks
                            id="other_presentation_links"
                            links={entity.other_presentation_links}
                            onChange={this.handleChange}
                            error={this.hasErrors('other_presentation_links')}
                        />
                    </div>
                </div>
                <hr/>
                <h3>{T.translate("edit_speaker.travel")}</h3>
                <div className="row form-group">
                    <div className="col-md-12 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="willing_to_travel" checked={entity.willing_to_travel}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="willing_to_travel">
                                {T.translate("edit_speaker.travel_restrictions")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <label>{T.translate("edit_speaker.select_countries")}</label>
                        <CountryInput id="travel_preferences" multi value={entity.travel_preferences} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-12 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="funded_travel" checked={entity.funded_travel}
                                   onChange={this.handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="funded_travel">
                                {T.translate("edit_speaker.company_willing")}
                            </label>
                        </div>
                    </div>
                </div>
                <Exclusive name="speaker-role">
                    <div>
                        <hr/>
                        <h3>{T.translate("edit_speaker.role")}</h3>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <label>{T.translate("edit_speaker.org_role")}</label>
                                <CheckboxList
                                    id="organizational_roles"
                                    value={entity.organizational_roles}
                                    options={roleOptions}
                                    onChange={this.handleChange}
                                    error={this.hasErrors('organizational_roles')}
                                    allowOther
                                />
                            </div>
                            <div className="col-md-12 org-has-cloud-wrapper">
                                <label>{T.translate("edit_speaker.opertating_os")}</label>
                                <RadioList
                                    id="org_has_cloud"
                                    inline
                                    value={entity.org_has_cloud}
                                    onChange={this.handleChange}
                                    options={[{value: 1, label: T.translate("general.yes")}, {value: 0, label: T.translate("general.no")}]}
                                    error={this.hasErrors('org_has_cloud')}
                                />
                            </div>
                        </div>
                    </div>
                </Exclusive>

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

export default SpeakerForm;
