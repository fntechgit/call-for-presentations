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
import {Switch, Route, Router} from 'react-router-dom'
import moment from 'moment-timezone';
import PrimaryLayout from "./layouts/primary-layout"
import AuthorizedRoute from './routes/authorized-route'
import AuthorizationCallbackRoute from "./routes/authorization-callback-route"
import AuthButton from './components/auth-button'
import DefaultRoute from './routes/default-route'
import LogOutCallbackRoute from './routes/logout-callback-route'
import {connect} from 'react-redux'
import {AjaxLoader, OPSessionChecker} from "openstack-uicore-foundation/lib/components";
import {
    formatEpoch,
    doLogout,
    initLogOut,
    doLogin,
    getUserInfo,
    onUserAuth
} from "openstack-uicore-foundation/lib/methods";
import T from 'i18n-react';
import history from './history';
import CustomErrorPage from "./pages/custom-error-page";
import {
    resetLoading,
    getAvailableSummits
} from './actions/base-actions';
import LandingPage from "./pages/landing-page";
import LanguageSelect from "./components/language-select";
import exclusiveSections from 'js-yaml-loader!./exclusive-sections.yml';
import {getMarketingValue} from "./components/marketing-setting";
import SummitSelectionPage from "./pages/summit-selection-page";
import LandingRoute from "./routes/landing-route";
import URI from "urijs";
import ProfilePage from "./pages/profile-page";
import DirectAuthorizedRoute from "./routes/direct-authorized-route";

// here is set by default user lang as en

let language = localStorage.getItem('PREFERRED_LANGUAGE');

if (!language) {
    language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

    // language would be something like es-ES or es_ES
    // However we store our files with format es.json or en.json therefore retrieve only the first 2 digits

    if (language.length > 2) {
        language = language.split("-")[0];
        language = language.split("_")[0];
    }
}

try {
    T.setTexts(require(`./i18n/${language}.json`));
} catch (e) {
    T.setTexts(require(`./i18n/en.json`));
}


// move all env var to global scope so ui core has access to this

window.IDP_BASE_URL = process.env['IDP_BASE_URL'];
window.API_BASE_URL = process.env['API_BASE_URL'];
window.MARKETING_API_BASE_URL = process.env['MARKETING_API_BASE_URL'];
window.OAUTH2_CLIENT_ID = process.env['OAUTH2_CLIENT_ID'];
window.SCOPES = process.env['SCOPES'];
window.APP_CLIENT_NAME = process.env['APP_CLIENT_NAME'];
window.ALLOWED_USER_GROUPS = "";
window.EXCLUSIVE_SECTIONS = [];

if (exclusiveSections.hasOwnProperty(window.APP_CLIENT_NAME)) {
    window.EXCLUSIVE_SECTIONS = exclusiveSections[window.APP_CLIENT_NAME];
}

class App extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onClickLogin = this.onClickLogin.bind(this);
        this.onClickLogout = this.onClickLogout.bind(this);
    }

    componentDidMount() {
    }

    getBackURL() {
        let {summit} = this.props;

        let defaultLocation = summit != null ? `/app/${summit.slug}` : '/';
        let url = URI(window.location.href);
        let location = url.pathname();
        if (location === '/'+summit.slug) location = defaultLocation;
        let query = url.search(true);
        let fragment = url.fragment();
        let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : location;
        if (fragment != null && fragment != '') {
            backUrl += `#${fragment}`;
        }

        return backUrl;

    }

    onClickLogin() {
        doLogin(this.getBackURL());
    }

    onClickLogout(){
        if(typeof window !== 'undefined' && this.props.summit) {
            window.localStorage.setItem('summit_slug', this.props.summit.slug);
        }
        initLogOut();
    }

    render() {

        let {
            isLoggedUser, onUserAuth, doLogout, getUserInfo, member, speaker, backUrl,
            selectionPlan, summit, loading, submissionIsClosed
        } = this.props;

        let profile_pic = speaker ? speaker.member.pic : (member ? member.pic : '');

        let header_title = T.translate('landing.call_for_presentations');
        let header_subtitle = '';
        var summit_logo = 'https://object-storage-ca-ymq-1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/images-fn-staging/idp-logo.png';
        if(window.APP_CLIENT_NAME === 'openstack')
            summit_logo = 'https://object-storage-ca-ymq-1.vexxhost.net/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/Uploads/arrows.svg';

        const mkt_header_title = getMarketingValue('spkmgmt_header_title');
        const mkt_header_logo = getMarketingValue('spkmgmt_header_logo');

        if (summit) {
            summit_logo = (summit.logo) ? summit.logo : summit_logo;

            if (selectionPlan) {
                let end_date = formatEpoch(selectionPlan.submission_end_date, 'MMM Do h:mm a');
                header_title += `: ${selectionPlan.name} ${summit.name}`;
                header_subtitle = T.translate('landing.subtitle', {'end_date' : end_date, 'when': moment.tz.guess()});
            }
            else if(submissionIsClosed){
                header_title += `: ${summit.name}`;
                header_subtitle = T.translate('landing.closed');
            }
        }

        header_title = mkt_header_title ? mkt_header_title : header_title;
        summit_logo = mkt_header_logo ? mkt_header_logo : summit_logo;

        return (
            <Router history={history}>
                <div>

                    <AjaxLoader show={loading} size={120}/>
                    {isLoggedUser &&
                    <OPSessionChecker
                        clientId={window.OAUTH2_CLIENT_ID}
                        idpBaseUrl={window.IDP_BASE_URL}
                    />
                    }
                    <div className="header">
                        <div className="header-title row">
                            <div className="col-md-3 col-xs-6 text-left">
                                <a href="/">
                                <img className="header-logo" src={summit_logo}/>
                                </a>
                            </div>
                            <div className="col-md-3 col-md-push-6 col-xs-6">
                                <LanguageSelect language={language}/>
                                <AuthButton isLoggedUser={isLoggedUser} picture={profile_pic} initLogOut={this.onClickLogout}/>
                            </div>
                            <div className="col-md-6 col-md-pull-3 col-xs-12 title">
                                <span>{header_title}</span>
                                <br/>
                                <span className="subtitle"> {header_subtitle} </span>
                            </div>
                        </div>
                    </div>


                    <React.Fragment>
                        <Switch>
                            <LogOutCallbackRoute path='/auth/logout' doLogout={doLogout} />
                            <AuthorizationCallbackRoute onUserAuth={onUserAuth} path='/auth/callback' getUserInfo={getUserInfo} />
                            <Route path="/error" component={CustomErrorPage} />
                            <Route path="/404" render={props => (<p>404 - Not Found</p>)} />
                            <Route path="/app/start" component={SummitSelectionPage} />
                            <DirectAuthorizedRoute path="/app/profile" strict exact isLoggedUser={isLoggedUser} component={ProfilePage}/>
                            <LandingRoute path="/app/:summit_slug" strict exact isLoggedUser={isLoggedUser} component={LandingPage} doLogin={this.onClickLogin}/>
                            <AuthorizedRoute path="/app/:summit_slug" isLoggedUser={isLoggedUser} backUrl={backUrl} component={PrimaryLayout}/>
                            <DefaultRoute isLoggedUser={isLoggedUser}/>
                        </Switch>
                    </React.Fragment>

                </div>
            </Router>
        );
    }
}

const mapStateToProps = ({loggedUserState, baseState, summitSelectionState}) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    member: loggedUserState.member,
    speaker: baseState.speaker,
    loading: baseState.loading,
    summit: baseState.summit,
    submissionIsClosed: baseState.submissionIsClosed,
    selectionPlan: baseState.selectionPlan,
    availableSummits: summitSelectionState.availableSummits,
})

export default connect(mapStateToProps, {
    onUserAuth,
    doLogout,
    getUserInfo,
    resetLoading,
    getAvailableSummits
})(App)
