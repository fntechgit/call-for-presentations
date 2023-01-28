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

import React, {useLayoutEffect, useState, useMemo} from 'react';
import {connect} from 'react-redux';
import history from "../history";
import SelectionPlanSection from "../components/selection-plan-section";

import { getSelectionPlanSettings } from '../actions/base-actions';

const AllSelectionPlansPage = ({summit, loggedSpeaker, match, getSelectionPlanSettings, selectionPlansSettings}) => {
  const [plansToShow, setPlansToShow] = useState([]);
  const selectionPlansIds = summit.selection_plans.map(sp => sp.id).join();

  useLayoutEffect(() => {
    const availablePlans = getAvailablePlans();

    if (availablePlans.length > 0) {
      setPlansToShow(availablePlans);

      const selectionPlanMarketingSettings = [];
      availablePlans.forEach(plan => {
        selectionPlanMarketingSettings.push(getSelectionPlanSettings(summit.id, plan.id));
      })
      
      Promise.all(selectionPlanMarketingSettings);  
    }
  }, [selectionPlansIds])

  const getAvailablePlans = () => {
    const selectionPlanIdParam = parseInt(match?.params?.selection_plan_id) || null;
    let allPlans = summit.selection_plans;

    if (selectionPlanIdParam) {
      allPlans = allPlans.filter(sp => sp.id === selectionPlanIdParam);
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
      {plansToShow.map(sp => <SelectionPlanSection key={`selection-plan-section-${sp.id}`} selectionPlan={sp} selectionPlanSettings={selectionPlansSettings.find(plan => plan.selection_plan_id === sp.id)?.marketingSettings} history={history} match={match} />)}
    </div>
  );
};

const mapStateToProps = ({baseState, selectionPlanState}) => ({
  summit: baseState.summit,
  loggedSpeaker: baseState.speaker,
  loading: baseState.loading,
  selectionPlansSettings: selectionPlanState.selection_plans,
});

export default connect(mapStateToProps, {getSelectionPlanSettings})(AllSelectionPlansPage);
