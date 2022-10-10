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

import React, {PureComponent} from "react";
import {Switch, Route, Router} from 'react-router-dom'
import T from "i18n-react";
import { merge } from "lodash";
import history from "./history";
import { connect } from "react-redux";
import AuthorizedRoute from './routes/authorized-route'
import AuthorizationCallbackRoute from "./routes/authorization-callback-route"
import LogOutCallbackRoute from './routes/logout-callback-route'
import DefaultRoute from "./routes/default-route";
import SummitLayout from './layouts/summit-layout';
import { AjaxLoader } from "openstack-uicore-foundation/lib/components";
import { getBackURL } from "openstack-uicore-foundation/lib/utils/methods";
import { resetLoading } from "openstack-uicore-foundation/lib/utils/actions";
import { doLogout, onUserAuth, getUserInfo} from 'openstack-uicore-foundation/lib/security/actions';
import { initLogOut, doLoginBasicLogin, getIdToken} from 'openstack-uicore-foundation/lib/security/methods';
import IdTokenVerifier from 'idtoken-verifier';
import CustomErrorPage from "./pages/custom-error-page";
import exclusiveSections from "js-yaml-loader!./exclusive-sections.yml";
import SummitSelectionPage from "./pages/summit-selection-page";
import ProfilePage from "./pages/profile-page";
import DirectAuthorizedRoute from "./routes/direct-authorized-route";
import Header from "./components/header";
import LandingPage from "./pages/landing-page";
import withMarketingSettings from "./components/withMarketingSettings";

// here is set by default user lang as en
let language = localStorage.getItem("PREFERRED_LANGUAGE");

if (!language) {
  language =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage;

  // language would be something like es-ES or es_ES
  // However we store our files with format es.json or en.json therefore retrieve only the first 2 digits

  if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
  }
}

const appClientName = process.env["APP_CLIENT_NAME"];

try {
  const i18nGlobalResources = require(`./i18n/${language}.json`);
  // specific tenant resources - here goes everything we want to overwrite
  const tenantResources = require(`./i18n/multitenant/${appClientName}/${language}.json`);
  const mergedResources = merge(i18nGlobalResources, tenantResources)
  T.setTexts(mergedResources);
} catch (e) {
  T.setTexts(require(`./i18n/en.json`));
}

// move all env var to global scope so ui core has access to this

window.IDP_BASE_URL           = process.env["IDP_BASE_URL"];
window.API_BASE_URL           = process.env["API_BASE_URL"];
window.MARKETING_API_BASE_URL = process.env["MARKETING_API_BASE_URL"];
window.OAUTH2_CLIENT_ID       = process.env["OAUTH2_CLIENT_ID"];
window.OAUTH2_FLOW            = process.env['OAUTH2_FLOW'] || "token id_token";
window.SCOPES                 = process.env["SCOPES"];
window.APP_CLIENT_NAME        = appClientName;
window.ALLOWED_USER_GROUPS    = "";
window.EXCLUSIVE_SECTIONS     = [];
window.LOGO_URL               = process.env["LOGO_URL"];
window.SHOW_LANGUAGE_SELECTION = !!Number(process.env["SHOW_LANGUAGE_SELECTION"]);
window.SUPPORT_EMAIL          = process.env["SUPPORT_EMAIL"];

if (exclusiveSections.hasOwnProperty(window.APP_CLIENT_NAME)) {
  window.EXCLUSIVE_SECTIONS = exclusiveSections[window.APP_CLIENT_NAME];
}

class App extends PureComponent {
  constructor(props) {
    super(props);
    props.resetLoading();
  }

  onClickLogin = (backUrl) => {
    doLoginBasicLogin(backUrl);
  }

  render() {
    const {isLoggedUser, onUserAuth, doLogout, getUserInfo, backUrl, loading } = this.props;
    const idToken = getIdToken();

    // get user pic from idtoken claims (IDP)
    let profile_pic = '';

    if(idToken){
      let verifier = new IdTokenVerifier({
        issuer:   window.IDP_BASE_URL,
        audience: window.OAUTH2_CLIENT_ID
      });
      let jwt = verifier.decode(idToken);
      profile_pic = jwt.payload.picture;
    }

    return (
      <Router history={history}>
        <div>
          <AjaxLoader show={loading} size={120} />
          <Header language={language} profilePic={profile_pic} initLogOut={initLogOut} />

          <Switch>
            <LogOutCallbackRoute path="/auth/logout" doLogout={doLogout} />
            <AuthorizationCallbackRoute
                onUserAuth={onUserAuth}
                path="/auth/callback"
                getUserInfo={getUserInfo}
            />
            <Route path="/error" component={CustomErrorPage} />
            <Route path="/404" render={(props) => <p>404 - Not Found</p>} />
            <Route path="/app/start" component={SummitSelectionPage} />
            <DirectAuthorizedRoute
                path="/app/profile"
                strict
                exact
                isLoggedUser={isLoggedUser}
                component={ProfilePage}
            />
            <AuthorizedRoute
                path="/app/:summit_slug"
                isLoggedUser={isLoggedUser}
                backUrl={backUrl}
                component={SummitLayout}
                doLogin={this.onClickLogin}
                Fallback={LandingPage}
            />
            <DefaultRoute isLoggedUser={isLoggedUser} />
          </Switch>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = ({
  loggedUserState,
  baseState,
  summitSelectionState,
}) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  member: loggedUserState.member,
  speaker: baseState.speaker,
  loading: baseState.loading,
  summit: baseState.summit,
  submissionIsClosed: baseState.submissionIsClosed,
  selectionPlan: baseState.selectionPlan,
  availableSummits: summitSelectionState.availableSummits,
});

export default connect(mapStateToProps, {
  onUserAuth,
  doLogout,
  getUserInfo,
  resetLoading,

})(withMarketingSettings(App));
