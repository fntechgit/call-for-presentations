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
import { deletePresentation } from '../actions/presentation-actions';
import { formatEpoch } from '../utils/methods';
import Presentation from '../model/presentation'

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
        ev.preventDefault();
        history.push(`/app/presentations/new/summary`);
    }

    handleEditPresentation(presentation, ev) {
        let {history} = this.props;
        ev.preventDefault();

        history.push(presentation.getProgressLink());
    }

    handleReviewPresentation(presentation, ev) {
        let {history} = this.props;
        ev.preventDefault();

        history.push(`/app/presentations/${presentation.id}/preview#comments`);
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
            cfpOpen,
            loggedSpeaker,
            loading
        } = this.props;

        if (loading) return(<div></div>);

        return (
            <div className="page-wrap" id="presentations-page">
                <div className="header">
                    <div className="row">
                        <div className="col-md-6 your-title">
                            <h2> {T.translate("presentations.presentations")}</h2>
                        </div>
                        {cfpOpen &&
                        <div className="col-md-6 text-right add-pres-wrapper">
                            <button className="btn btn-success add-presentation-btn"
                                    onClick={this.handleNewPresentation}>
                                {T.translate("presentations.add_presentation")}
                            </button>
                        </div>
                        }
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
                                <tbody>
                                { presentations_created.map(p => {
                                    let presentation = new Presentation(p, summit, selectionPlan, loggedSpeaker, cfpOpen);

                                    return (
                                        <tr key={'presentation_' + p.id}>
                                            <td>
                                                <i className="fa fa-file-text-o"></i>
                                                <a onClick={this.handleEditPresentation.bind(this, presentation)}>{p.title}</a>
                                            </td>
                                            <td>
                                                {presentation.getStatus()}
                                                {p.public_comments && p.public_comments.length > 0 &&
                                                    <button className="btn btn-default btn-xs review-btn" onClick={this.handleReviewPresentation.bind(this, p)}>
                                                        <i className="fa fa-exclamation-triangle blink" aria-hidden="true"></i>
                                                        {T.translate("presentations.review")}
                                                    </button>
                                                }
                                            </td>
                                            <td>
                                                {presentation.getSelectionPlanName()}
                                            </td>
                                            <td className="text-right">
                                                {cfpOpen && presentation.canDelete() &&
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

                        { presentations_created.length == 0 &&
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
                                <tbody>
                                { presentations_speaker.map(p => {
                                    let presentation = new Presentation(p, summit, selectionPlan, loggedSpeaker, cfpOpen);

                                    return (
                                        <tr key={'presentation_' + p.id}>
                                            <td>
                                                <i className="fa fa-file-text-o"></i>
                                                <a onClick={this.handleEditPresentation.bind(this, presentation)}>{p.title}</a>
                                            </td>
                                            <td>
                                                {presentation.getStatus()}
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
                        { presentations_speaker.length == 0 &&
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
                                <tbody>
                                { presentations_moderator.map(p => {
                                    let presentation = new Presentation(p, summit, selectionPlan, loggedSpeaker, cfpOpen);

                                    return (
                                        <tr key={'presentation_' + p.id}>
                                            <td>
                                                <i className="fa fa-file-text-o"></i>
                                                <a onClick={this.handleEditPresentation.bind(this, presentation)}>{p.title}</a>
                                            </td>
                                            <td>
                                                {presentation.getStatus()}
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
                        { presentations_moderator.length == 0 &&
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

const mapStateToProps = ({ presentationsState, loggedUserState, baseState }) => ({
    selectionPlan : baseState.selectionPlan,
    cfpOpen : baseState.cfpOpen,
    summit : baseState.summit,
    presentations_created : presentationsState.presentations_created,
    presentations_speaker : presentationsState.presentations_speaker,
    presentations_moderator : presentationsState.presentations_moderator,
    loggedSpeaker : baseState.speaker,
    loading: baseState.loading
})

export default connect (
    mapStateToProps,
    {
        getAllPresentations,
        deletePresentation
    }
)(PresentationsPage);
