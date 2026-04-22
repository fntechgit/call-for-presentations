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

import React, { useEffect, Suspense } from 'react'
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import AjaxLoader from "openstack-uicore-foundation/lib/components/ajaxloader";
import { getAllowedSelectionPlan, getSelectionPlanSettings } from '../actions/base-actions';
import history from '../history'

const EditPresentationPage = React.lazy(() =>
  import("../pages/edit-presentation-page")
);

const PrimaryLayout = React.lazy(() => import("./primary-layout"));
const AllSelectionPlansPage = React.lazy(() => import("../pages/all-selection-plans-page"));
const ProfilePage = React.lazy(() => import("../pages/profile-page"));
const SelectionProcessPage = React.lazy(() => import("../pages/selection-process-page"));
const TracksGuidePage = React.lazy(() => import("../pages/tracks-guide-page"));

const SelectionPlanLayout = ({ summit, match, ...props }) => {
  const selectionPlanId = parseInt(match.params?.selection_plan_id);

  useEffect(() => {
    if (selectionPlanId) {
      const allowedSelectionPlans = summit.selection_plans;
      if (!allowedSelectionPlans.some(sp => sp.id === selectionPlanId)) {
        history.push(`/app/${summit.slug}/all-plans`);
        return;
      }
      // update selection plan and retrieve marketing settings for selection plan
      props.getAllowedSelectionPlan(selectionPlanId).finally(() => props.getSelectionPlanSettings(summit.id, selectionPlanId));
    }
  }, [selectionPlanId]);

  return (
    <Suspense fallback={<AjaxLoader show relative size={120} />}>
      <Switch>
        <Route strict exact path={match.url} render={props => <AllSelectionPlansPage {...props} selectionPlanId={selectionPlanId} />} />
        <Route path={`${match.url}/presentations`} render={props => <PrimaryLayout {...props} selectionPlanId={selectionPlanId} />} />
        <Route path={`${match.url}/profile`} render={props => <ProfilePage {...props} selectionPlanId={selectionPlanId} />} />
        <Route path={`${match.url}/selection_process`} render={props => <SelectionProcessPage {...props} />} />
        <Route path={`${match.url}/tracks_guide`} render={props => <TracksGuidePage {...props} />} />
        <Route render={() => (<Redirect to={`${match.url}/presentations`} />)} />
      </Switch>
    </Suspense>
  );
}

const mapStateToProps = ({ baseState }) => ({
  summit: baseState.summit
})

export default connect(mapStateToProps, { getAllowedSelectionPlan, getSelectionPlanSettings })(SelectionPlanLayout);