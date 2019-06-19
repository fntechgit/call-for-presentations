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
import { loadCurrentSelectionPlan, loadCurrentSummit } from '../actions/base-actions'
import PresentationsPage from '../pages/presentations-page'
import ProfilePage from '../pages/profile-page'
import SelectionProcessPage from '../pages/selection-process-page'
import TracksGuidePage from '../pages/tracks-guide-page'
import PresentationLayout from './presentation-layout'

class PrimaryLayout extends React.Component {

    componentWillMount () {
        this.props.loadCurrentSelectionPlan();
        this.props.loadCurrentSummit();
    }

    getActiveMenu() {
        let {location} = this.props;
        switch(location.pathname) {
            case '/app/presentations':
                return 'presentations';
                break;
            case '/app/profile':
                return 'profile';
                break
        }
    }

    render(){
        let { location, speaker, member, summit, loading } = this.props;

        if((!speaker || !speaker.id) && location.pathname != '/app/profile' && !loading) {
            return (
                <Redirect exact to={{ pathname: '/app/profile' }}  />
            );
        }

        if (!summit) return (<div></div>);

        let loggedUser = (speaker && speaker.id) ? speaker : member;

        if(loggedUser == null) return null;

        return(
            <div className="primary-layout container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        <NavMenu user={loggedUser} active={this.getActiveMenu()}/>
                    </div>
                    <div className="col-md-9">
                        <main id="page-wrap">
                            <Switch>
                                <Route strict exact path="/app/presentations" component={PresentationsPage}/>
                                <Route path="/app/presentations/:presentation_id(\d+)" component={PresentationLayout}/>
                                <Route path="/app/presentations/new" component={PresentationLayout}/>
                                <Route exact path="/app/profile" component={ProfilePage}/>
                                <Route exact path="/app/selection_process" component={SelectionProcessPage}/>
                                <Route exact path="/app/tracks_guide" component={TracksGuidePage}/>
                                <Route render={props => (<Redirect to="/app/presentations"/>)}/>
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
    loading: baseState.loading
})

export default connect(
    mapStateToProps,
    {
        loadCurrentSelectionPlan,
        loadCurrentSummit
    }
)(PrimaryLayout)


