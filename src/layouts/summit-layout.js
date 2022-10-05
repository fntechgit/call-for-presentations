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
import {getAllFromSummit, getAllSummitDocs} from '../actions/base-actions';
import PrimaryLayout from "./primary-layout";
import PlanSelectionPage from "../pages/plan-selection-page";
import ProfilePage from "../pages/profile-page";
import ClockComponent from '../components/clock';

const SummitLayout = ({summit, loading, match, speaker, location, getAllFromSummit, getAllSummitDocs}) => {
    const urlSummitSlug = match.params.summit_slug;
    const summitSlug = summit?.slug;

    useEffect(() => {
        if (urlSummitSlug !== summitSlug) {
            getAllFromSummit(urlSummitSlug);
        }
    }, [summitSlug, urlSummitSlug]);

    useEffect(() => {
        if (urlSummitSlug === summitSlug && summit?.id) {
            getAllSummitDocs(summit.id);
        }
    }, [summit?.id]);

    if (summitSlug !== urlSummitSlug) return null;

    // check if speaker profile exists, if not redirect
    if((!speaker || !speaker.id) && location.pathname !== `/app/${summit.slug}/profile` && !loading) {
        return (
            <Redirect exact to={{ pathname: `/app/${summit.slug}/profile` }}  />
        );
    }

    return(
        <>
            <ClockComponent active={true} summit={summit} />
            <Switch>
                <Route strict exact path={match.url} component={PlanSelectionPage}/>
                <Route strict exact path={`${match.url}/profile`} component={ProfilePage}/>
                <Route path={`${match.url}/:selection_plan_id(\\d+)`} component={PrimaryLayout}/>
                <Route render={() => (<Redirect to={`/app/${summitSlug}`}/>)}/>
            </Switch>
        </>
    );

}

const mapStateToProps = ({ baseState }) => ({
    speaker: baseState.speaker,
    summit: baseState.summit,
    selectionPlan: baseState.selectionPlan,
    loading: baseState.loading,
    baseLoaded: baseState.baseLoaded
})

export default connect(mapStateToProps, {getAllFromSummit, getAllSummitDocs})(SummitLayout);
