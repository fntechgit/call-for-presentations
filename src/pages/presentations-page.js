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
import Swal from "sweetalert2";
import { getAllPresentations } from '../actions/presentations-actions';
import { deletePresentation, resetPresentation } from '../actions/presentation-actions';
import Presentation from '../model/presentation'
import '../styles/presentations-page.less';

class PresentationsPage extends React.Component {

    constructor(props){
        super(props);

        this.handleNewPresentation = this.handleNewPresentation.bind(this);
    }

    componentDidMount () {
        let {summit, selectionPlan, loggedSpeaker, history} = this.props;
        if(loggedSpeaker == null){
            history.push(`/app/profile`);
            return;
        }

        this.props.getAllPresentations(summit.id, selectionPlan.id).then(() => {
            // clear presentation form
            this.props.resetPresentation();
        });
    }

    handleNewPresentation(ev) {
        let {history, match} = this.props;
        ev.preventDefault();

        history.push(`${match.url}/new/summary`);
    }

    handleEditPresentation(presentation, ev) {
        let {history} = this.props;
        ev.preventDefault();

        history.push(presentation.getProgressLink());
    }

    handleReviewPresentation(presentation, ev) {
        let {history, match} = this.props;
        ev.preventDefault();

        history.push(`${match.url}/${presentation.id}/preview#comments`);
    }

    handleDeletePresentation(presentation, ev) {
        let {deletePresentation} = this.props;

        ev.preventDefault();

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("presentations.remove_warning") + ' ' + presentation.title,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deletePresentation(presentation.id);
            }
        });

    }

    render() {
        let {
            presentations_created,
            presentations_speaker,
            presentations_moderator,
            selectionPlan,
            summit,
            submissionIsClosed,
            loggedSpeaker,
            loading,
            nowUtc,
        } = this.props;

        if (loading || summit == null || loggedSpeaker == null) return null;

        return (
            <div className="page-wrap" id="presentations-page">
                <div className="header">
                    <div className="row">
                        <div className="col-md-6 your-title">
                            <h2> {T.translate("presentations.presentations")}</h2>
                        </div>
                        <div className="col-md-6 text-right add-pres-wrapper">
                            {!submissionIsClosed && selectionPlan && selectionPlan.allow_new_presentations &&
                                <button className="btn btn-success add-presentation-btn"
                                        onClick={this.handleNewPresentation}>
                                    {T.translate("presentations.add_presentation")}
                                </button>
                            }
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="row">
                        <div className="col-md-12 title">
                            <h3>{T.translate("presentations.you_submitted")}</h3>
                        </div>
                        {presentations_created.length > 0 &&
                        <div className="col-md-12">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{T.translate("presentations.presentation_title")}</th>
                                        <th>{T.translate("presentations.presentation_status")}</th>
                                        <th>{T.translate("presentations.submission_plan")}</th>
                                        <th>&nbsp;</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { presentations_created.map(p => {
                                    let presentation = new Presentation(p, summit, selectionPlan, loggedSpeaker);

                                    return (
                                        <tr key={'presentation_' + p.id}>
                                            <td>
                                                <i className="fa fa-file-text-o" />
                                                <a onClick={this.handleEditPresentation.bind(this, presentation)}>{p.title}</a>
                                            </td>
                                            <td>
                                                {presentation.getStatus(nowUtc)}
                                                {p.public_comments && p.public_comments.length > 0 &&
                                                    <button className="btn btn-default btn-xs review-btn" onClick={this.handleReviewPresentation.bind(this, p)}>
                                                        <i className="fa fa-exclamation-triangle blink" />
                                                        {T.translate("presentations.review")}
                                                    </button>
                                                }
                                            </td>
                                            <td>
                                                {presentation.getSelectionPlanName()}
                                            </td>
                                            <td className="text-right">
                                                {!submissionIsClosed && presentation.canDelete() &&
                                                <button className="btn btn-danger btn-xs" onClick={this.handleDeletePresentation.bind(this, p)}>
                                                    {T.translate("general.delete")}
                                                </button>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                        }

                        { presentations_created.length === 0 &&
                        <div className="col-md-12 no-presentations">
                            {T.translate("presentations.no_presentations_created")}
                        </div>
                        }
                    </div>
                    <div className="row">
                        <div className="col-md-12 title">
                            <h3>{T.translate("presentations.other_submitted_speaker")}</h3>
                        </div>
                        {presentations_speaker.length > 0 &&
                        <div className="col-md-12">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{T.translate("presentations.presentation_title")}</th>
                                        <th>{T.translate("presentations.presentation_status")}</th>
                                        <th>{T.translate("presentations.submission_plan")}</th>
                                        <th>&nbsp;</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { presentations_speaker.map(p => {
                                    let presentation = new Presentation(p, summit, selectionPlan, loggedSpeaker);

                                    return (
                                        <tr key={'presentation_' + p.id}>
                                            <td>
                                                <i className="fa fa-file-text-o" />
                                                <a onClick={this.handleEditPresentation.bind(this, presentation)}>{p.title}</a>
                                            </td>
                                            <td>
                                                {presentation.getStatus(nowUtc)}
                                            </td>
                                            <td>
                                                {presentation.getSelectionPlanName()}
                                            </td>
                                            <td> &nbsp; </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                        }
                        { presentations_speaker.length === 0 &&
                        <div className="col-md-12 no-presentations">
                            {T.translate("presentations.no_presentations_speaker")}
                        </div>
                        }
                    </div>
                    <div className="row">
                        <div className="col-md-12 title">
                            <h3>{T.translate("presentations.other_submitted_moderator")}</h3>
                        </div>
                        {presentations_moderator.length > 0 &&
                        <div className="col-md-12">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{T.translate("presentations.presentation_title")}</th>
                                        <th>{T.translate("presentations.presentation_status")}</th>
                                        <th>{T.translate("presentations.submission_plan")}</th>
                                        <th>&nbsp;</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { presentations_moderator.map(p => {
                                    let presentation = new Presentation(p, summit, selectionPlan, loggedSpeaker);

                                    return (
                                        <tr key={'presentation_' + p.id}>
                                            <td>
                                                <i className="fa fa-file-text-o" />
                                                <a onClick={this.handleEditPresentation.bind(this, presentation)}>{p.title}</a>
                                            </td>
                                            <td>
                                                {presentation.getStatus(nowUtc)}
                                            </td>
                                            <td>
                                                {presentation.getSelectionPlanName()}
                                            </td>
                                            <td> &nbsp; </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>
                        }
                        { presentations_moderator.length === 0 &&
                        <div className="col-md-12 no-presentations">
                            {T.translate("presentations.no_presentations_moderator")}
                        </div>
                        }
                    </div>
                </div>

            </div>
        );
    }
}

const mapStateToProps = ({ presentationsState, baseState, clockState }) => ({
    selectionPlan : baseState.selectionPlan,
    summit : baseState.summit,
    presentations_created : presentationsState.presentations_created,
    presentations_speaker : presentationsState.presentations_speaker,
    presentations_moderator : presentationsState.presentations_moderator,
    loggedSpeaker : baseState.speaker,
    loading: baseState.loading,
    submissionIsClosed: baseState.submissionIsClosed,
    nowUtc: clockState.nowUtc,
})

export default connect (
    mapStateToProps,
    {
        getAllPresentations,
        deletePresentation,
        resetPresentation
    }
)(PresentationsPage);
