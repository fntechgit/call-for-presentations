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

import React, {useState, useLayoutEffect} from 'react'
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router-dom';
import ProfilePage from '../pages/profile-page'
import SelectionProcessPage from '../pages/selection-process-page'
import TracksGuidePage from '../pages/tracks-guide-page'
import PresentationLayout from './presentation-layout'
import {getSelectionPlanSettings} from "../actions/base-actions";

const PrimaryLayout = ({summit, speaker, member, match,...props}) => {
  const loggedUser = (speaker && speaker.id) ? speaker : member;
  const selectionPlanIdParam = parseInt(match.params.selection_plan_id);
  const [selectionPlan, setSelectionPlan] = useState(null);

  useLayoutEffect(() => {
    if (selectionPlanIdParam) {
      const selPlan = summit.selection_plans.find(sp => sp.id === selectionPlanIdParam);
      setSelectionPlan(selPlan);
      // retrieve marketing settings for selection plan
      props.getSelectionPlanSettings(summit.id, selPlan.id);
    }
  }, [selectionPlanIdParam]);

  if (!loggedUser || !selectionPlanIdParam || !selectionPlan) return null;

  return (
    <>
      <Switch>
        <Route
          path={`${match.url}/new`}
          render={(props) => <PresentationLayout selectionPlan={selectionPlan} {...props}/>}
        />
        <Route
          path={`${match.url}/:presentation_id(\\d+)`}
          render={(props) => <PresentationLayout selectionPlan={selectionPlan} {...props}/>}
        />
        <Route exact path={`${match.url}/profile`} component={ProfilePage}/>
        <Route exact path={`${match.url}/selection_process`} component={SelectionProcessPage}/>
        <Route exact path={`${match.url}/tracks_guide`} component={TracksGuidePage}/>
        <Route render={props => (<Redirect to={`/app/${summit.slug}/all-plans/${selectionPlanIdParam}`}/>)}/>
      </Switch>
    </>
  );

}

const mapStateToProps = ({loggedUserState, baseState}) => ({
  member: loggedUserState.member,
  speaker: baseState.speaker,
  summit: baseState.summit,
  loading: baseState.loading,
});

export default connect(mapStateToProps, {getSelectionPlanSettings})(PrimaryLayout)


