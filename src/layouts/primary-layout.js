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
import { loadCurrentSelectionPlan } from '../actions/selection-plan-actions'
import PresentationsPage from '../pages/presentations-page'
import ProfilePage from '../pages/profile-page'
import EditPresentationPage from '../pages/edit-presentation-page'

class PrimaryLayout extends React.Component {

    componentWillMount () {
        //this.props.loadCurrentSelectionPlan();
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
        let { match, location, speaker, member } = this.props;

        if(!speaker && location.pathname != '/app/profile') {
            return (
                <Redirect exact to={{ pathname: '/app/profile' }}  />
            );
        }

        return(
            <div className="primary-layout container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        <NavMenu user={speaker} active={this.getActiveMenu()}/>
                    </div>
                    <div className="col-md-9">
                        <main id="page-wrap">
                            <Switch>
                                <Route exact path="/app/presentations" component={PresentationsPage}/>
                                <Route exact path="/app/presentations/new" component={EditPresentationPage}/>
                                <Route path="/app/presentations/:presentation_id" component={EditPresentationPage}/>
                                <Route exact path="/app/profile" component={ProfilePage}/>
                                <Route render={props => (<Redirect to="/app/presentations"/>)}/>
                            </Switch>
                        </main>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = ({ loggedUserState, selectionPlanState }) => ({
    member: loggedUserState.member,
    speaker: loggedUserState.speaker,
    selectionPlan: selectionPlanState
})

export default connect(
    mapStateToProps,
    {
        loadCurrentSelectionPlan
    }
)(PrimaryLayout)


