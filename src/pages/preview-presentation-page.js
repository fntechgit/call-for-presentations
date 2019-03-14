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

import '../styles/preview-presentation-page.less';

class PreviewPresentationPage extends React.Component {

    constructor(props){
        super(props);

        this.onDone = this.onDone.bind(this);

    }

    componentWillReceiveProps(newProps) {

    }

    onDone(ev) {
        let {history} = this.props;
        ev.preventDefault();

        history.push(`/app/presentations`);
    }

    render() {
        let { entity, selectionPlan, errors, track, history } = this.props;

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
                    <div className="item">
                        <label>{T.translate("edit_presentation.abstract")}</label><br/>
                        <RawHTML>{entity.description}</RawHTML>
                    </div>
                    <hr/>
                    <div className="item">
                        <label>{T.translate("edit_presentation.level")}</label><br/>
                        {entity.level}
                    </div>
                    {track &&
                    <div className="item">
                        <label>{T.translate("edit_presentation.general_topic")}</label><br/>
                        <RawHTML>{track.name}</RawHTML>
                    </div>
                    }
                    <div className="item">
                        <label>{T.translate("edit_presentation.attending_media")}</label><br/>
                        {entity.attending_media ? 'Yes' : 'No'}
                    </div>
                    <hr/>

                    {entity.moderator &&
                    <div className="main-panel-section confirm-block">
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

                    <hr/>
                    <div className="main-panel-section confirm-block">
                        <label>Speakers</label>
                        { entity.speakers.map(s => (
                            <div className="row" key={'speaker_review_'+s.id}>
                                <div className="col-lg-2">
                                    <p className="user-img" style={{ backgroundImage: `url(${s.pic})` }}></p>
                                </div>
                                <div className="col-lg-10">
                                    <label>Speaker</label>
                                    <div className="confirm-item">
                                        {s.first_name} {s.last_name}<br/>
                                        {s.title}
                                    </div>
                                    { s.bio &&
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
    selectionPlan : baseState.selectionPlan,
    ...presentationState
})

export default connect (
    mapStateToProps,
    {
    }
)(PreviewPresentationPage);
