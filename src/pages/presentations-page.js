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
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {getAllPresentations} from '../actions/presentations-actions';
import {deletePresentation, resetPresentation} from '../actions/presentation-actions';
import { getSelectionPlan } from '../actions/base-actions';
import '../styles/presentations-page.less';
import PresentationsTable from "../components/presentations-table";

class PresentationsPage extends React.Component {

  constructor(props) {
    super(props);

    this.handleNewPresentation = this.handleNewPresentation.bind(this);
    this.handleDeletePresentation = this.handleDeletePresentation.bind(this);
  }

  componentDidMount() {
    let {summit, selectionPlan, loggedSpeaker, history} = this.props;
    if (loggedSpeaker == null) {
      history.push(`/app/profile`);
      return;
    }

    // reload selection plan
    this.props.getSelectionPlan(summit.id, selectionPlan.id).then(() => {
      this.props.getAllPresentations(summit.id, selectionPlan.id).then(() => {
        // clear presentation form
        this.props.resetPresentation();
      });
    })

  }

  handleNewPresentation(ev) {
    let {history, match} = this.props;
    ev.preventDefault();
    history.push(`${match.url}/new/summary`);
  }

  handleDeletePresentation(ev, presentation) {
    let {deletePresentation} = this.props;

    ev.preventDefault();

    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: T.translate("presentations.remove_warning") + ' ' + presentation.title,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    }).then(function (result) {
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
      match,
      history
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
          <PresentationsTable
            title={T.translate("presentations.you_submitted")}
            presentations={presentations_created}
            onDelete={this.handleDeletePresentation}
            canEdit
            history={history}
            match={match}
          />
          <PresentationsTable
            title={T.translate("presentations.other_submitted_speaker")}
            presentations={presentations_speaker}
            history={history}
            match={match}
          />
          <PresentationsTable
            title={T.translate("presentations.other_submitted_moderator")}
            presentations={presentations_moderator}
            history={history}
            match={match}
          />
        </div>

      </div>
    );
  }
}

const mapStateToProps = ({presentationsState, baseState, clockState}) => ({
  selectionPlan: baseState.selectionPlan,
  summit: baseState.summit,
  presentations_created: presentationsState.presentations_created,
  presentations_speaker: presentationsState.presentations_speaker,
  presentations_moderator: presentationsState.presentations_moderator,
  loggedSpeaker: baseState.speaker,
  loading: baseState.loading,
  submissionIsClosed: baseState.submissionIsClosed,
  nowUtc: clockState.nowUtc,
  tagGroups: baseState.tagGroups,
})

export default connect(
  mapStateToProps,
  {
    getAllPresentations,
    deletePresentation,
    resetPresentation,
    getSelectionPlan,
  }
)(PresentationsPage);
