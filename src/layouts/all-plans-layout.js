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

import React from 'react'
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router-dom';
import {getAllFromSummit} from '../actions/base-actions';
import AllSelectionPlansPage from "../pages/all-selection-plans-page";
import NavMenu from "../components/nav-menu";
import SelectionPlanLayout from "./selection-plan-layout";
import ProfilePage from "../pages/profile-page";
import SelectionProcessPage from "../pages/selection-process-page";
import TracksGuidePage from "../pages/tracks-guide-page";

const AllPlansLayout = ({summit, location, match, speaker, member}) => {
  const loggedUser = (speaker && speaker.id) ? speaker : member;
  const getActiveMenu = () => {
    if (location.pathname.includes('presentations')) {
      return 'presentations';
    }

    if (location.pathname.includes('profile')) {
      return 'profile';
    }
  };

  if (summit == null || loggedUser == null) return null;

  return (
    <div className="primary-layout container-fluid">
      <div className="row">
        <div className="col-md-3">
          <NavMenu user={loggedUser} active={getActiveMenu()} exclusiveSections={window.EXCLUSIVE_SECTIONS}/>
        </div>
        <div className="col-md-9">
          <main id="page-wrap">
            <Switch>
              <Route strict exact path={match.url} component={AllSelectionPlansPage}/>
              <Route strict exact path={`${match.url}/profile`} component={ProfilePage}/>
              <Route path={`${match.url}/:selection_plan_id(\\d+)`} component={SelectionPlanLayout}/>
              <Route path={`${match.url}/selection_process`} render={props => <SelectionProcessPage {...props} />} />
              <Route path={`${match.url}/tracks_guide`} render={props => <TracksGuidePage {...props} />} />
              <Route render={() => (<Redirect to={`/app/${summit.slug}/all-plans`}/>)}/>
            </Switch>
          </main>
        </div>
      </div>
    </div>
  );

}

const mapStateToProps = ({baseState, loggedUserState}) => ({
  member: loggedUserState.member,
  speaker: baseState.speaker,
  summit: baseState.summit,
  loading: baseState.loading
})

export default connect(mapStateToProps, {getAllFromSummit})(AllPlansLayout);
