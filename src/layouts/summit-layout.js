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

import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router-dom';
import {getAllFromSummit, getAllSummitDocs, getTagGroups, getAllowedSelectionPlans} from '../actions/base-actions';
import AllPlansLayout from "./all-plans-layout";
import PlanSelectionPage from "../pages/plan-selection-page";
import ProfilePage from "../pages/profile-page";
import ClockComponent from '../components/clock';
import {getLandingSelectionPlanId} from "../utils/methods";

const SummitLayout = ({summit, loading, match, speaker, location, baseLoaded, ...props}) => {
  const urlSummitSlug = match.params.summit_slug;
  const summitSlug = summit?.slug;
  const [dataLoaded, setDataLoaded] = useState(false);

  // get summit data on every refresh
  useEffect(() => {
    props.getAllFromSummit(urlSummitSlug).then(async (summit) => {
      await props.getTagGroups(summit.id);
      await props.getAllowedSelectionPlans(summit.id);
      setDataLoaded(true);
    });
  }, []);

  if (summitSlug !== urlSummitSlug || !baseLoaded || !dataLoaded) return null;

  // check if speaker profile exists, if not redirect
  if ((!speaker || !speaker.id) && !location.pathname.includes('/profile') && !loading) {
    const spLanding = getLandingSelectionPlanId();

    return (
      <Redirect exact to={{pathname: `/app/${summit.slug}/${spLanding ? `all-plans/${spLanding}/profile` : 'all-plans/profile'}`}}/>
    );
  }

  return (
    <>
      <ClockComponent active={true} summit={summit}/>
      <Switch>
        <Route strict exact path={`${match.url}/select-plan`} component={PlanSelectionPage}/>
        <Route path={`${match.url}/all-plans`} component={AllPlansLayout}/>
        <Route
            path={`${match.url}/:selection_plan_id(\\d+)/presentations`}
            render={props => (<Redirect to={`/app/${summitSlug}/all-plans/${props.match.params.selection_plan_id}`}/>)}
        />
        <Route
          path={`${match.url}/profile`}
          render={() => (<Redirect to={`/app/${summitSlug}/all-plans/profile`}/>)}
        />
        <Route render={() => (<Redirect to={`/app/${summitSlug}/all-plans`}/>)}/>
      </Switch>
    </>
  );

}

const mapStateToProps = ({baseState}) => ({
  speaker: baseState.speaker,
  summit: baseState.summit,
  loading: baseState.loading,
  baseLoaded: baseState.baseLoaded,
})

export default connect(mapStateToProps, {
  getAllFromSummit,
  getAllSummitDocs,
  getTagGroups,
  getAllowedSelectionPlans
})(SummitLayout);
