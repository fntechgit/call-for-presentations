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
import { RawHTML } from 'openstack-uicore-foundation/lib/components'
import T from "i18n-react/dist/i18n-react";
import {getMarketingValue} from "./marketing-setting";

class PresentationReviewForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
        });
    }

    handleSubmit(ev) {
        ev.preventDefault();

        this.props.onSubmit(this.props.entity);
    }

    handleBack(ev) {
        ev.preventDefault();

        this.props.onBack();
    }

    render() {
        let {entity, track, presentation, step} = this.props;
        let title = '';
        let subtitle = '';
        const review_title = getMarketingValue('spkmgmt_review_title');
        const review_subtitle = getMarketingValue('spkmgmt_review_subtitle');

        if (presentation.isSubmitted()) {
            title = review_title || T.translate("edit_presentation.review_title");
            subtitle = review_subtitle || T.translate("edit_presentation.review_subtitle");
        } else {
            title = T.translate("edit_presentation.confirm_title");
            subtitle = T.translate("edit_presentation.review_important");
        }

        if (!entity.id || !track) return null;

        return (
            <form className="presentation-review-form">
                {!presentation.isSubmitted() &&
                    <SubmitButtons presentation={presentation} step={step} onSubmit={this.handleSubmit.bind(this)} />
                }

                <input type="hidden" id="id" value={entity.id} />

                <h1>{title}</h1>
                <h3>{subtitle}</h3>
                <hr/>
                <div className="item">
                    <label>{T.translate("edit_presentation.title")}</label><br/>
                    {entity.title}
                </div>
                <div className="item">
                    <label>{T.translate("edit_presentation.abstract")}</label><br/>
                    {entity.description &&
                    <RawHTML>{entity.description}</RawHTML>
                    }
                </div>
                <hr/>
                <div className="item">
                    <label>{T.translate("edit_presentation.level")}</label><br/>
                    {T.translate("event_level." + entity.level)}
                </div>
                <div className="item">
                    <label>{T.translate("edit_presentation.general_topic")}</label><br/>
                    {track.name &&
                    <RawHTML>{track.name}</RawHTML>
                    }
                </div>
                <div className="item">
                    <label>{T.translate("edit_presentation.attending_media")}</label><br/>
                    {entity.attending_media ? 'Yes' : 'No'}
                </div>
                <div className="item">
                    <label>{T.translate("edit_presentation.presentation_material")}</label><br/>
                    {entity.slides.map(f => <a href={f.link}>{f.name}</a>)}
                </div>


                {entity.moderator &&
                <div className="main-panel-section confirm-block">
                    <hr/>
                    <label>Moderators</label>
                    <div className="row">
                        <div className="col-lg-2">
                            <p className="user-img" style={{ backgroundImage: `url('${entity.moderator.pic}')` }}></p>
                        </div>
                        <div className="col-lg-10">
                            <label>Moderator</label>
                            <div className="confirm-item">
                                {entity.moderator.first_name} {entity.moderator.last_name}  <br/>
                                {entity.moderator.title}
                            </div>
                            <label>Bio</label>
                            <div className="confirm-item">
                                {entity.moderator.bio &&
                                <RawHTML>{entity.moderator.bio}</RawHTML>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                }


                <div className="main-panel-section confirm-block">
                    <hr/>
                    <label>Speakers</label>
                    { entity.speakers.map(s => (
                        <div className="row" key={'speaker_review_'+s.id}>
                            <div className="col-lg-2">
                                <p className="user-img" style={{ backgroundImage: `url('${s.pic}')` }}></p>
                            </div>
                            <div className="col-lg-10">
                                <label>Speaker</label>
                                <div className="confirm-item">
                                    {s.first_name} {s.last_name}<br/>
                                    {s.title}
                                </div>
                                <label>Bio</label>
                                <div className="confirm-item">
                                    {s.bio &&
                                    <RawHTML>{s.bio}</RawHTML>
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <hr/>
                <SubmitButtons presentation={presentation} onSubmit={this.handleSubmit.bind(this)} step={step} />
            </form>
        );
    }
}

export default PresentationReviewForm;
