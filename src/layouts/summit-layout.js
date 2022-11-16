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

import React, {useEffect, useRef} from 'react'
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import {getAllFromSummit, getAllSummitDocs} from '../actions/base-actions';
import AllPlansLayout from "./all-plans-layout";
import PlanSelectionPage from "../pages/plan-selection-page";
import ProfilePage from "../pages/profile-page";
import ClockComponent from '../components/clock';

const SummitLayout = ({summit, loading, match, speaker, location, getAllFromSummit, baseLoaded}) => {
    const urlSummitSlug = match.params.summit_slug;
    const summitSlug = summit?.slug;
    const firstRender = useRef(true);

    // get summit data on every refresh
    useEffect(() => {
        firstRender.current = false;
        getAllFromSummit(urlSummitSlug);
    }, []);

    if (summitSlug !== urlSummitSlug || !baseLoaded || firstRender.current) return null;

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
                <Route strict exact path={`${match.url}/select-plan`} component={PlanSelectionPage}/>
                <Route strict exact path={`${match.url}/profile`} component={ProfilePage}/>
                <Route path={`${match.url}/all-plans`} component={AllPlansLayout}/>
                <Route render={() => (<Redirect to={`/app/${summitSlug}/all-plans`}/>)}/>
            </Switch>
        </>
    );

}

const mapStateToProps = ({ baseState }) => ({
    speaker: baseState.speaker,
    summit: baseState.summit,
    loading: baseState.loading,
    baseLoaded: baseState.baseLoaded,
})

export default connect(mapStateToProps, {getAllFromSummit, getAllSummitDocs})(SummitLayout);
