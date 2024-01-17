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
import LandingPage from "../pages/landing-page";

const LandingLayout = ({match, ...parentProps}) => {
  const summitSlug = match.params.summit_slug;

  return (
    <>
      <Switch>
        <Route
          strict
          exact
          path={`${match.url}/all-plans/:selection_plan_id`}
          render={props => (<LandingPage summitSlug={summitSlug} {...parentProps} {...props} />)}
        />
        <Route
          path={match.url}
          render={props => (<LandingPage summitSlug={summitSlug} {...parentProps} {...props} />)}
        />
      </Switch>
    </>
  );

}

export default LandingLayout;
