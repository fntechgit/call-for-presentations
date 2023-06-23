/**
 * Copyright 2018 OpenStack Foundation
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

import React from 'react';
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import { RawHTML } from 'openstack-uicore-foundation/lib/components'
import { loadEventCategory } from "../actions/base-actions";
import {getSubmissionsPath} from "../utils/methods";

import '../styles/preview-presentation-page.less';

class PreviewPresentationPage extends React.Component {

    constructor(props){
        super(props);

        this.onDone = this.onDone.bind(this);
        this.isQuestionEnabled = this.isQuestionEnabled.bind(this);
    }

    componentWillReceiveProps(newProps) {
        let {loading} = newProps;

        if (!loading && newProps.entity.track_id && (!newProps.track || newProps.entity.track_id != newProps.track.id)) {
            this.props.loadEventCategory();
        }
    }

    onDone(ev) {
        ev.preventDefault();
        
        const {history, summit} = this.props;
        const submissionsPath = getSubmissionsPath();

        history.push(`/app/${summit.slug}/${submissionsPath}`);
    }

    isQuestionEnabled(question_id) {
        const {selectionPlan} = this.props;
        return selectionPlan.allowed_presentation_questions.includes(question_id);
    }

    render() {
        const { entity, selectionPlan, track } = this.props;
        const selectionPlanSettings = this.props.selectionPlansSettings[selectionPlan.id] || {};
        
        return (
            <div className="page-wrap" id="preview-presentation-page">
                <div className="presentation-header-wrapper">
                    <h2>{T.translate("preview_presentation.preview_presentation")}</h2>
                </div>

                <div className="preview-form-wrapper">
                    <div className="item">
                        <label>{T.translate("edit_presentation.title")}</label><br/>
                        {entity.title}
                    </div>
                    {this.isQuestionEnabled('description') &&
                    <div className="item">
                        <label>{T.translate("edit_presentation.abstract")}</label><br/>
                        <RawHTML>{entity.description}</RawHTML>
                    </div>
                    }
                    <hr/>
                    {this.isQuestionEnabled('level') &&
                    <div className="item">
                        <label>{T.translate("edit_presentation.level")}</label><br/>
                        {T.translate("event_level." + entity.level)}
                    </div>
                    }
                    {track &&
                    <div className="item">
                        <label>
                            {selectionPlanSettings?.CFP_TRACK_QUESTION_LABEL ? 
                                selectionPlanSettings?.CFP_TRACK_QUESTION_LABEL 
                                :
                                T.translate("edit_presentation.general_topic",
                                {presentation: selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation").toLowerCase()})}
                        </label>
                        <br/>
                        <RawHTML>{track.name}</RawHTML>
                    </div>
                    }
                    {this.isQuestionEnabled('attending_media') &&
                    <div className="item">
                        <label>{T.translate("edit_presentation.attending_media")}</label><br/>
                        {entity.attending_media ? 'Yes' : 'No'}
                    </div>
                    }
                    <div className="item">
                    <label>{T.translate("edit_presentation.materials")}</label><br/>
                        <ul>
                        {entity.media_uploads.map(doc => (
                                <li key={doc.id}>
                                    <a id={doc.name + '-material'} onClick={() => window.open(doc.private_url, '_blank')} >
                                        {`${doc.name} `}
                                        <i className='fa fa-download' />
                                    </a>
                                </li>
                        ))}
                        </ul>
                    </div>

                    {entity.moderator &&
                    <div className="main-panel-section confirm-block">
                        <hr/>
                        <label>Moderators</label>
                        <div className="row">
                            <div className="col-lg-2">
                                <p className="user-img" style={{ backgroundImage: `url(${entity.moderator.pic})` }}></p>
                            </div>
                            <div className="col-lg-10">
                                <label>Moderator</label>
                                <div className="confirm-item">
                                    {entity.moderator.first_name} {entity.moderator.last_name}  <br/>
                                    {entity.moderator.title}
                                </div>
                                { entity.moderator.bio &&
                                    <div>
                                        <label>Bio</label>
                                        <div className="confirm-item">
                                            <RawHTML>{entity.moderator.bio}</RawHTML>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    }
                    {entity.speakers.length > 0 &&
                    <div className="main-panel-section confirm-block">
                        <hr/>
                        <label>{selectionPlanSettings?.CFP_SPEAKERS_PLURAL_LABEL || T.translate("edit_presentation.speakers")}</label>
                        {entity.speakers.map(s => (
                            <div className="row" key={'speaker_review_' + s.id}>
                                <div className="col-lg-2">
                                    <p className="user-img" style={{backgroundImage: `url(${s.pic})`}}></p>
                                </div>
                                <div className="col-lg-10">
                                    <label>Speaker</label>
                                    <div className="confirm-item">
                                        {s.first_name} {s.last_name}<br/>
                                        {s.title}
                                    </div>
                                    {s.bio &&
                                    <div>
                                        <label>Bio</label>
                                        <div className="confirm-item">
                                            <RawHTML>{s.bio}</RawHTML>
                                        </div>
                                    </div>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                    }

                    {entity.public_comments && entity.public_comments.length > 0 &&
                    <div>
                        <hr/>
                        <div className="main-panel-section confirm-block comments" id="comments">
                            <label>{T.translate("edit_presentation.chair_comments")}</label>
                            <ul>
                            {entity.public_comments.map(c => (
                                <li className="comment-item" key={'comment_review_' + c.id}>
                                    {c.body}
                                </li>
                            ))}
                            </ul>
                        </div>
                    </div>
                    }

                    <hr/>
                    <div className="row submit-buttons">
                        <div className="col-md-6 col-md-offset-6">
                            <button onClick={this.onDone} className="btn btn-primary pull-right btn-save" >
                                {T.translate("general.done")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ baseState, presentationState }) => ({
    summit: baseState.summit,
    loading : baseState.loading,
    selectionPlansSettings: baseState.selectionPlansSettings,
    ...presentationState
})

export default connect (
    mapStateToProps,
    {
      loadEventCategory
    }
)(PreviewPresentationPage);
