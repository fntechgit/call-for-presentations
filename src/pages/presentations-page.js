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
import swal from "sweetalert2";
import { getAllPresentations } from '../actions/presentations-actions';
import { formatEpoch } from '../utils/methods';

import '../styles/presentations-page.less';

class PresentationsPage extends React.Component {

    constructor(props){
        super(props);

        this.handleNewPresentation = this.handleNewPresentation.bind(this);
    }

    componentWillMount () {
        this.props.getAllPresentations();
    }

    handleNewPresentation(ev) {
        let {history} = this.props;
        history.push(`/app/presentations/new`);
    }

    render() {
        let { presentations_created, presentations_speaker, presentations_moderator } = this.props;

        return (
            <div className="page-wrap" id="presentations-page">
                <div className="row">
                    <div className="col-md-6">
                        <h2> {T.translate("presentations.presentations")}</h2>
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-success" onClick={this.handleNewPresentation}>
                            {T.translate("presentations.add_presentation")}
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 title">
                        <h3>{T.translate("presentations.you_submitted")}</h3>
                    </div>
                    { presentations_created.length > 0 && presentations_created.map(p => (
                        <div>
                            <div className="col-md-6">
                                <i className="fa fa-file-text-o"></i>
                                {p.title}
                            </div>
                            <div className="col-md-2">
                                {p.status}
                            </div>
                            <div className="col-md-2">
                                Delete
                            </div>
                        </div>
                    ))}
                    { presentations_created.length == 0 &&
                    <div className="col-md-12">
                        {T.translate("presentations.no_presentations_created")}
                    </div>
                    }
                </div>
                <div className="row">
                    <div className="col-md-12 title">
                        <h3>{T.translate("presentations.other_submitted_speaker")}</h3>
                    </div>
                    { presentations_speaker.length > 0 && presentations_speaker.map(p => (
                        <div>
                            <div className="col-md-6">
                                <i className="fa fa-file-text-o"></i>
                                {p.title}
                            </div>
                            <div className="col-md-2">
                                {p.status}
                            </div>
                            <div className="col-md-2">
                                Delete
                            </div>
                        </div>
                    ))}
                    { presentations_speaker.length == 0 &&
                    <div className="col-md-12">
                        {T.translate("presentations.no_presentations_speaker")}
                    </div>
                    }
                </div>
                <div className="row">
                    <div className="col-md-12 title">
                        <h3>{T.translate("presentations.other_submitted_moderator")}</h3>
                    </div>
                    { presentations_moderator.length > 0 && presentations_moderator.map(p => (
                        <div>
                            <div className="col-md-6">
                                <i className="fa fa-file-text-o"></i>
                                {p.title}
                            </div>
                            <div className="col-md-2">
                                {p.status}
                            </div>
                            <div className="col-md-2">
                                Delete
                            </div>
                        </div>
                    ))}
                    { presentations_moderator.length == 0 &&
                    <div className="col-md-12">
                        {T.translate("presentations.no_presentations_moderator")}
                    </div>
                    }
                </div>

            </div>
        );
    }
}

const mapStateToProps = ({ selectionPlanState, presentationsState }) => ({
    selectionPlan : selectionPlanState,
    presentations_created : presentationsState.presentations_created,
    presentations_speaker : presentationsState.presentations_speaker,
    presentations_moderator : presentationsState.presentations_moderator
})

export default connect (
    mapStateToProps,
    {
        getAllPresentations
    }
)(PresentationsPage);
