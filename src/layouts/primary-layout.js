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
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import NavMenu from '../components/nav-menu/index'
import PresentationsPage from '../pages/presentations-page'
import ProfilePage from '../pages/profile-page'
import SelectionProcessPage from '../pages/selection-process-page'
import TracksGuidePage from '../pages/tracks-guide-page'
import PresentationLayout from './presentation-layout'
import {getSelectionPlan} from "../actions/base-actions";

const PrimaryLayout = ({location, summit, speaker, member, match, selectionPlan, getSelectionPlan}) => {
    const loggedUser = (speaker && speaker.id) ? speaker : member;
    const selectionPlanIdParam = parseInt(match.params.selection_plan_id);

    const getActiveMenu = () => {
        if (location.pathname.includes('presentations')) {
            return 'presentations';
        }

        if (location.pathname.includes('profile')) {
            return 'profile';
        }
    };

    useEffect(() => {
        if (selectionPlan?.id !== selectionPlanIdParam) {
            getSelectionPlan(summit.id, selectionPlanIdParam);
        }
    }, [selectionPlan, match]);

    if (!loggedUser || selectionPlan?.id !== selectionPlanIdParam) return null;

    return (
        <div className="primary-layout container-fluid">
            <div className="row">
                <div className="col-md-3">
                    <NavMenu user={loggedUser} active={getActiveMenu()} exclusiveSections={window.EXCLUSIVE_SECTIONS}/>
                </div>
                <div className="col-md-9">
                    <main id="page-wrap">
                        <Switch>
                            <Route strict exact path={`${match.url}/presentations`} component={PresentationsPage}/>
                            <Route path={`${match.url}/presentations/new`} component={PresentationLayout}/>
                            <Route path={`${match.url}/presentations/:presentation_id(\\d+)`} component={PresentationLayout}/>
                            <Route exact path={`${match.url}/profile`} component={ProfilePage}/>
                            <Route exact path={`${match.url}/selection_process`} component={SelectionProcessPage}/>
                            <Route exact path={`${match.url}/tracks_guide`} component={TracksGuidePage}/>
                            <Route render={props => (<Redirect to={`${match.url}/presentations`}/>)}/>
                        </Switch>
                    </main>
                </div>
            </div>
        </div>
    );

}

const mapStateToProps = ({ loggedUserState, baseState }) => ({
    member: loggedUserState.member,
    speaker: baseState.speaker,
    summit: baseState.summit,
    selectionPlan: baseState.selectionPlan,
    loading: baseState.loading,
});

export default connect(mapStateToProps, {getSelectionPlan})(PrimaryLayout)


