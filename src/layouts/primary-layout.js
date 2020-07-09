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
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import NavMenu from '../components/nav-menu/index'
import PresentationsPage from '../pages/presentations-page'
import ProfilePage from '../pages/profile-page'
import SelectionProcessPage from '../pages/selection-process-page'
import TracksGuidePage from '../pages/tracks-guide-page'
import PresentationLayout from './presentation-layout'
import { getAllFromSummit } from '../actions/base-actions';

class PrimaryLayout extends React.Component {

    componentDidMount() {
        let summitSlug = this.props.match.params.summit_slug;
        console.log(`PrimaryLayout::componentDidMount summitSlug ${summitSlug}`);
        this.props.getAllFromSummit(summitSlug);
    }

    componentWillReceiveProps(newProps) {
        let oldSummitSlug = this.props.match.params.summit_slug;
        let newSummitSlug = newProps.match.params.summit_slug;

        if (newSummitSlug && newSummitSlug !== oldSummitSlug) {
            console.log(`PrimaryLayout::componentWillReceiveProps newSummitSlug ${newSummitSlug}`);
            this.props.getAllFromSummit(newSummitSlug);
        }
    }

    getActiveMenu() {
        let {location, summit} = this.props;
        switch(location.pathname) {
            case `/app/${summit.slug}/presentations`:
                return 'presentations';
                break;
            case `/app/${summit.slug}/profile`:
                return 'profile';
                break;
        }
    }

    render(){
        let { location, speaker, member, summit, loading, match } = this.props;

        if (!summit) return null;

        if((!speaker || !speaker.id) && location.pathname !== '/app/profile' && !loading) {
            return (
                <Redirect exact to={{ pathname: `/app//${summit.slug}/profile` }}  />
            );
        }

        let loggedUser = (speaker && speaker.id) ? speaker : member;

        if(loggedUser == null) return null;

        return(
            <div className="primary-layout container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        <NavMenu user={loggedUser} active={this.getActiveMenu()} exclusiveSections={window.EXCLUSIVE_SECTIONS}/>
                    </div>
                    <div className="col-md-9">
                        <main id="page-wrap">
                            <Switch>
                                <Route path="/app/:summit_slug/presentations/new" component={PresentationLayout}/>
                                <Route path="/app/:summit_slug/presentations/:presentation_id(\d+)" component={PresentationLayout}/>
                                <Route strict exact path={`${match.url}/presentations`} component={PresentationsPage}/>
                                <Route exact path={`${match.url}/profile`} component={ProfilePage}/>
                                <Route exact path={`${match.url}/selection_process`} component={SelectionProcessPage}/>
                                <Route exact path={`${match.url}/tracks_guide`} component={TracksGuidePage}/>
                                <Route render={props => (<Redirect to={`/app/${summit.slug}/presentations`}/>)}/>
                            </Switch>
                        </main>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = ({ loggedUserState, baseState }) => ({
    member: loggedUserState.member,
    speaker: baseState.speaker,
    summit: baseState.summit,
    selectionPlan: baseState.selectionPlan,
    loading: baseState.loading
})

export default connect(
    mapStateToProps,
    {
        getAllFromSummit
    }
)(PrimaryLayout)


