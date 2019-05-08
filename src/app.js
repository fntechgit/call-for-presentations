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
import { Switch, Route, Router } from 'react-router-dom'
import PrimaryLayout from "./layouts/primary-layout"
import AuthorizedRoute from './routes/authorized-route'
import AuthorizationCallbackRoute from "./routes/authorization-callback-route"
import AuthButton from './components/auth-button'
import DefaultRoute from './routes/default-route'
import LogOutCallbackRoute from './routes/logout-callback-route'
import { connect } from 'react-redux'
import { onUserAuth } from './actions/auth-actions'
import { AjaxLoader, OPSessionChecker } from "openstack-uicore-foundation/lib/components";
import {getBackURL, formatEpoch, doLogin, doLogout, initLogOut, getUserInfo} from "openstack-uicore-foundation/lib/methods";
import T from 'i18n-react';
import history from './history'
import CustomErrorPage from "./pages/custom-error-page";
import { resetLoading } from './actions/base-actions';

// here is set by default user lang as en

let language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

try {
    T.setTexts(require(`./i18n/${language}.json`));
} catch (e) {
    T.setTexts(require(`./i18n/en.json`));
}


// move all env var to global scope so ui core has access to this

window.IDP_BASE_URL        = process.env['IDP_BASE_URL'];
window.API_BASE_URL        = process.env['API_BASE_URL'];
window.OAUTH2_CLIENT_ID    = process.env['OAUTH2_CLIENT_ID'];
window.SCOPES              = process.env['SCOPES'];
window.ALLOWED_USER_GROUPS = "";

class App extends React.PureComponent {

    componentWillMount() {
        this.props.resetLoading();
    }

    onClickLogin(){
        doLogin(getBackURL());
    }

    render() {
        let { isLoggedUser, onUserAuth, doLogout, getUserInfo, member, selectionPlan, backUrl, loading} = this.props;
        let profile_pic = member ? member.pic : '';

        let header_title = '';
        if (selectionPlan) {
            let end_date = formatEpoch(selectionPlan.submission_end_date);
            header_title = `: ${selectionPlan.name} - Open til ${end_date}`;
        }

        return (
            <Router history={history}>
                <div>
                    <AjaxLoader show={ loading } size={ 120 }/>
                    <OPSessionChecker
                        clientId={window.OAUTH2_CLIENT_ID}
                        idpBaseUrl={window.IDP_BASE_URL}
                    />
                    <div className="header">
                        <div className={"header-title " + (isLoggedUser ? '' : 'center')}>
                            {T.translate("landing.call_for_presentations")} {header_title}
                            <AuthButton isLoggedUser={isLoggedUser} picture={profile_pic} doLogin={this.onClickLogin.bind(this)} initLogOut={initLogOut}/>
                        </div>
                    </div>
                    <Switch>
                        <AuthorizedRoute isLoggedUser={isLoggedUser} backUrl={backUrl} path="/app" component={PrimaryLayout} />
                        <AuthorizationCallbackRoute onUserAuth={onUserAuth} path='/auth/callback' getUserInfo={getUserInfo} />
                        <LogOutCallbackRoute doLogout={doLogout}  path='/auth/logout'/>
                        <Route path="/404" render={props => (<p>404 - Not Found</p>)}/>
                        <Route path="/error" component={CustomErrorPage}/>
                        <DefaultRoute isLoggedUser={isLoggedUser} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

const mapStateToProps = ({ loggedUserState, baseState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    member: loggedUserState.member,
    loading : baseState.loading,
    selectionPlan: baseState.selectionPlan
})

export default connect(mapStateToProps, {
    onUserAuth,
    doLogout,
    getUserInfo,
    resetLoading
})(App)
