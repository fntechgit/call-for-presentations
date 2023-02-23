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
import T from "i18n-react";
import Presentation from "../model/presentation";
import {connect} from "react-redux";
import {formatEpoch} from "../utils/methods";

const PresentationsTable = ({
                              title,
                              presentations,
                              summit,
                              selectionPlan,
                              selectionPlanSettings,
                              loggedSpeaker,
                              tagGroups,
                              nowUtc,
                              onDelete,
                              canEdit = false,
                              history,
                              match
                            }) => {

  const handleEditPresentation = (ev, presentation) => {
    ev.preventDefault();
    history.push(presentation.getProgressLink());
  };

  const handleReviewPresentation = (ev, presentation) => {
    ev.preventDefault();
    history.push(`${match.url}/${presentation.id}/preview#comments`);
  };

  return (
    <div className="row">
      <div className="col-md-12 title">
        <h3>{title}</h3>
      </div>
      {presentations.length > 0 &&
      <div className="col-md-12">
        <table className="table">
          <thead>
          <tr>
            <th>{T.translate("presentations.presentation_title", 
              {presentation: `${selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation")}`})}</th>
            <th>{T.translate("presentations.presentation_status", 
              {presentation: `${selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation")}`})}</th>
            <th>{T.translate("presentations.submission_plan")}</th>
            <th>{canEdit ? T.translate("presentations.last_edited") : <>&nbsp;</>}</th>
            <th>&nbsp;</th>
          </tr>
          </thead>
          <tbody>
          {presentations.map(p => {

            let presentation = new Presentation(p, summit, selectionPlan, loggedSpeaker, tagGroups, selectionPlanSettings);

            return (
              <tr key={'presentation_' + p.id}>
                <td className="pres-title">
                  <i className="fa fa-file-text-o"/>
                  <a onClick={ev => handleEditPresentation(ev, presentation)}>{p.title}</a>
                </td>
                <td className="pres-status">
                  {presentation.getStatus(nowUtc)}
                  {canEdit && p.public_comments && p.public_comments.length > 0 &&
                  <button className="btn btn-default btn-xs review-btn"
                          onClick={ev => handleReviewPresentation(ev, p)}>
                    <i className="fa fa-exclamation-triangle blink"/>
                    {T.translate("presentations.review")}
                  </button>
                  }
                </td>
                <td className="pres-sel-plan">
                  {presentation.getSelectionPlanName()}
                </td>
                <td className="pres-last-edited">
                  {canEdit ? formatEpoch(p.last_edited) : <>&nbsp;</>}
                </td>
                {canEdit &&
                <td className="text-right pres-actions">
                  {!presentation.submissionIsClosed && presentation.canDelete() &&
                  <button className="btn btn-danger btn-xs" onClick={ev => onDelete(ev, p)}>
                    {T.translate("general.delete")}
                  </button>
                  }
                </td>
                }
                {!canEdit && <td className="pres-actions">&nbsp;</td>}
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>
      }

      {presentations.length === 0 &&
      <div className="col-md-12 no-presentations">
        {T.translate("presentations.no_presentations", {presentations: `${selectionPlanSettings?.CFP_PRESENTATIONS_PLURAL_LABEL || T.translate("edit_presentation.presentations")}`})}
      </div>
      }
    </div>
  );
}

const mapStateToProps = ({baseState, clockState}) => ({
  summit: baseState.summit,
  loggedSpeaker: baseState.speaker,
  nowUtc: clockState.nowUtc,
  tagGroups: baseState.tagGroups,
})

export default connect(mapStateToProps, {})(PresentationsTable);
