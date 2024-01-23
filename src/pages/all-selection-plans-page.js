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

import React, {useLayoutEffect, useState, useEffect} from 'react';
import {connect} from 'react-redux';
import history from "../history";
import SelectionPlanSection from "../components/selection-plan-section";
import {getSelectionPlanSettings} from "../actions/base-actions";

const AllSelectionPlansPage = ({summit, loggedSpeaker, match, selectionPlanId, selectionPlansSettings, getSelectionPlanSettings}) => {
  const [plansToShow, setPlansToShow] = useState([]);
  const selectionPlansIds = summit.selection_plans.map(sp => sp.id).join();

  useEffect(()=>{
    const currentSelectionPlanIds = selectionPlanId ? [selectionPlanId] : selectionPlansIds.split(',');
    currentSelectionPlanIds.forEach((id) => getSelectionPlanSettings(summit.id, id));
  }, []);

  useLayoutEffect(() => {
    const availablePlans = getAvailablePlans();
    if (availablePlans.length > 0) {
      setPlansToShow(availablePlans);
    }
  }, [selectionPlansIds])

  const getAvailablePlans = () => {
    let allPlans = summit.selection_plans;

    if (selectionPlanId) {
      allPlans = allPlans.filter(sp => sp.id === selectionPlanId);
    }
    return allPlans.sort((a,b) => a.submission_begin_date - b.submission_begin_date);
  };

  if ( !summit || !loggedSpeaker ) return null;

  if (!loggedSpeaker) {
    history.push(`/app/profile`);
    return;
  }

  if (plansToShow.length === 0) {
    return (
      <div className="small-page-wrap">You cannot submit a presentation for this event at this time</div>
    );
  }

  return (
    <div>
      {plansToShow.map(sp => <SelectionPlanSection key={`selection-plan-section-${sp.id}`} selectionPlan={sp} selectionPlanSettings={selectionPlansSettings[sp.id] || {}} history={history} match={match} />)}
    </div>
  );
};

const mapStateToProps = ({baseState}) => ({
  summit: baseState.summit,
  loggedSpeaker: baseState.speaker,
  loading: baseState.loading,
  selectionPlansSettings: baseState.selectionPlansSettings
});

export default connect(mapStateToProps, {getSelectionPlanSettings})(AllSelectionPlansPage);
