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

import React, {useEffect} from 'react'
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router-dom';
import {getAllowedSelectionPlan, getSelectionPlanSettings} from '../actions/base-actions';
import PrimaryLayout from "./primary-layout";
import AllSelectionPlansPage from "../pages/all-selection-plans-page";
import ProfilePage from "../pages/profile-page";
import SelectionProcessPage from "../pages/selection-process-page";
import TracksGuidePage from "../pages/tracks-guide-page";

const SelectionPlanLayout = ({summit, match, ...props}) => {
  const selectionPlanId = parseInt(match.params?.selection_plan_id);

  useEffect(() => {
    if (selectionPlanId) {
      // update selection plan and retrieve marketing settings for selection plan
      props.getAllowedSelectionPlan(selectionPlanId).finally(() => props.getSelectionPlanSettings(summit.id, selectionPlanId));
    }
  }, [selectionPlanId]);

  return (
    <Switch>
      <Route strict exact path={match.url} render={props => <AllSelectionPlansPage {...props} selectionPlanId={selectionPlanId} />} />
      <Route path={`${match.url}/presentations`} render={props => <PrimaryLayout {...props} selectionPlanId={selectionPlanId} />} />
      <Route path={`${match.url}/profile`} render={props => <ProfilePage {...props} selectionPlanId={selectionPlanId} />} />
      <Route path={`${match.url}/selection_process`} render={props => <SelectionProcessPage {...props} selectionPlanId={selectionPlanId} />} />
      <Route path={`${match.url}/tracks_guide`} render={props => <TracksGuidePage {...props} selectionPlanId={selectionPlanId} />} />
      <Route render={() => (<Redirect to={`${match.url}/presentations`}/>)} />
    </Switch>
  );
}

const mapStateToProps = ({baseState}) => ({
  summit: baseState.summit,
})

export default connect(mapStateToProps, {getAllowedSelectionPlan, getSelectionPlanSettings})(SelectionPlanLayout);