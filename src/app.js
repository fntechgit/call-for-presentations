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
import { Switch, Route, Router } from "react-router-dom";
import T from "i18n-react";
import { merge } from "lodash";
import history from "./history";
import { connect } from "react-redux";
import URI from "urijs";
import AuthorizedRoute from "./routes/authorized-route";
import AuthorizationCallbackRoute from "./routes/authorization-callback-route";
import DefaultRoute from "./routes/default-route";
import LogOutCallbackRoute from "./routes/logout-callback-route";
import SummitLayout from './layouts/summit-layout';
import { AjaxLoader, OPSessionChecker } from "openstack-uicore-foundation/lib/components";
import {
  doLogout,
  doLogin,
  getUserInfo,
  onUserAuth,
} from "openstack-uicore-foundation/lib/methods";
import CustomErrorPage from "./pages/custom-error-page";
import { resetLoading, getAvailableSummits } from "./actions/base-actions";
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

window.IDP_BASE_URL = process.env["IDP_BASE_URL"];
window.API_BASE_URL = process.env["API_BASE_URL"];
window.MARKETING_API_BASE_URL = process.env["MARKETING_API_BASE_URL"];
window.OAUTH2_CLIENT_ID = process.env["OAUTH2_CLIENT_ID"];
window.SCOPES = process.env["SCOPES"];
window.APP_CLIENT_NAME = appClientName;
window.ALLOWED_USER_GROUPS = "";
window.EXCLUSIVE_SECTIONS = [];
window.LOGO_URL = process.env["LOGO_URL"];
window.SHOW_LANGUAGE_SELECTION = !!Number(
  process.env["SHOW_LANGUAGE_SELECTION"]
);
window.SUPPORT_EMAIL = process.env["SUPPORT_EMAIL"];

if (exclusiveSections.hasOwnProperty(window.APP_CLIENT_NAME)) {
  window.EXCLUSIVE_SECTIONS = exclusiveSections[window.APP_CLIENT_NAME];
}

class App extends PureComponent {

  getBackURL = () => {
    const { summit } = this.props;
    const defaultLocation = summit != null ? `/app/${summit.slug}` : "/";
    const url = URI(window.location.href);
    const query = url.search(true);
    let location = url.pathname();
    const fragment = url.fragment();

    if (location === "/" + summit.slug) location = defaultLocation;
    let backUrl = query.hasOwnProperty("BackUrl") ? query["BackUrl"] : location;
    if (fragment != null && fragment !== "") {
      backUrl += `#${fragment}`;
    }

    return backUrl;
  }

  onClickLogin = () => {
    const backUrl = this.getBackURL();
    doLogin(backUrl);
  }

  render() {
    const {isLoggedUser, onUserAuth, doLogout, getUserInfo, backUrl, loading } = this.props;

    return (
      <Router history={history}>
        <div>
          <AjaxLoader show={loading} size={120} />
          {isLoggedUser && (
            <OPSessionChecker
              clientId={window.OAUTH2_CLIENT_ID}
              idpBaseUrl={window.IDP_BASE_URL}
            />
          )}
          <Header language={language} />

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
  getAvailableSummits,
})(withMarketingSettings(App));
