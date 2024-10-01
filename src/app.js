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

import React, {PureComponent, useEffect, useState} from "react";
import {Switch, Route, Router} from 'react-router-dom'
import T from "i18n-react";
import history from "./history";
import {connect} from "react-redux";
import AuthorizedRoute from './routes/authorized-route'
import AuthorizationCallbackRoute from "./routes/authorization-callback-route"
import LogOutCallbackRoute from './routes/logout-callback-route'
import LogInCallbackRoute from './routes/login-callback-route'
import DefaultRoute from "./routes/default-route";
import SummitLayout from './layouts/summit-layout';
import LandingLayout from './layouts/landing-layout';
import {AjaxLoader} from "openstack-uicore-foundation/lib/components";
import {resetLoading} from "openstack-uicore-foundation/lib/utils/actions";
import {doLogout, onUserAuth, getUserInfo} from 'openstack-uicore-foundation/lib/security/actions';
import {initLogOut, doLoginBasicLogin, getIdToken} from 'openstack-uicore-foundation/lib/security/methods';
import IdTokenVerifier from 'idtoken-verifier';
import CustomErrorPage from "./pages/custom-error-page";
import exclusiveSections from "js-yaml-loader!./exclusive-sections.yml";
import SummitSelectionPage from "./pages/summit-selection-page";
import ProfilePage from "./pages/profile-page";
import DirectAuthorizedRoute from "./routes/direct-authorized-route";
import Header from "./components/header";
import {SelectionPlanContext} from "./components/SelectionPlanContext";
import {SP_LANDING} from "./utils/constants";
import {getLandingSelectionPlan, isGlobalLanding} from "./utils/methods";
import URI from "urijs";
import { putOnLocalStorage }
  from "openstack-uicore-foundation/lib/utils/methods";
import {BACK_URL} from "./utils/constants";
import * as Sentry from "@sentry/react";
import {SentryFallbackFunction} from './components/SentryErrorComponent';
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
window.OAUTH2_FLOW = process.env['OAUTH2_FLOW'] || "token id_token";
window.SCOPES = process.env["SCOPES"];
window.APP_CLIENT_NAME = appClientName;
window.ALLOWED_USER_GROUPS = "";
window.EXCLUSIVE_SECTIONS = [];
window.LOGO_URL = process.env["LOGO_URL"];
window.SHOW_LANGUAGE_SELECTION = !!Number(process.env["SHOW_LANGUAGE_SELECTION"]);
window.SUPPORT_EMAIL = process.env["SUPPORT_EMAIL"];
window.SENTRY_DSN = process.env["SENTRY_DSN"];

if (exclusiveSections.hasOwnProperty(window.APP_CLIENT_NAME)) {
  window.EXCLUSIVE_SECTIONS = exclusiveSections[window.APP_CLIENT_NAME];
}

const App = ({isLoggedUser, onUserAuth, doLogout, getUserInfo, loading, ...props}) => {
  const [selectionPlanCtx, setSelectionPlanCtx] = useState(null);
  const [sentryInitialized, setSentryInitialized] = useState(false);
  const idToken = getIdToken();

  /*
    This Effect runs only on first load and sets the SP_LANDING if is a selection plan landing url
    If it is a global url then it resets SP_LANDING
  */
  useEffect(() => {
    const globalLanding = isGlobalLanding(location.pathname);
    const landingSelectionPlan = getLandingSelectionPlan(location.pathname);

    props.resetLoading();

    if (landingSelectionPlan) {
      localStorage.setItem(SP_LANDING, landingSelectionPlan);
    } else if (globalLanding) {
      localStorage.removeItem(SP_LANDING);
    }
  }, []);

  const onClickLogin = (backUrl) => {
    let url = URI('/auth/login');

    if (backUrl)
      url = url.query({[BACK_URL]:backUrl});

    history.push(url.toString());
  }

  const onClickLogOut = () => {
    const currentUrl = URI(window.location.href);
    putOnLocalStorage(BACK_URL, currentUrl.path());
    initLogOut();
  }

  // get user pic from idtoken claims (IDP)
  let profile_pic = '';

  if (idToken) {
    let verifier = new IdTokenVerifier({
      issuer: window.IDP_BASE_URL,
      audience: window.OAUTH2_CLIENT_ID
    });
    let jwt = verifier.decode(idToken);
    profile_pic = jwt.payload.picture;
  }

  if (window.SENTRY_DSN && window.SENTRY_DSN !== "" && sentryInitialized === false) {
    console.log("app init sentry ...")
    // Initialize Sentry
    Sentry.init({
      dsn: window.SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Tracing
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost"],
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
    setSentryInitialized(true);
  }

  return (
    <Sentry.ErrorBoundary fallback={SentryFallbackFunction({ componentName: "Call For Presentation App" })}>
      <Router history={history}>
        <SelectionPlanContext.Provider value={{ selectionPlanCtx, setSelectionPlanCtx }}>

          <div>
            <AjaxLoader show={loading} size={120} />
            <Route
              path={['/auth/logout', '/auth/callback', '/error', '/404', '/app/start', '/app/profile']}
              children={({ match }) => (
                <Header language={language} profilePic={profile_pic} initLogOut={onClickLogOut} waitForApi={!match} selectionPlan={selectionPlanCtx} />
              )}
            />

            <Switch>
              <LogInCallbackRoute path="/auth/login" doLogin={doLoginBasicLogin} />
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
                component={SummitLayout}
                doLogin={onClickLogin}
                Fallback={LandingLayout}
              />
              <DefaultRoute isLoggedUser={isLoggedUser} />
            </Switch>
          </div>
        </SelectionPlanContext.Provider>
      </Router>
    </Sentry.ErrorBoundary>
  );
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
  availableSummits: summitSelectionState.availableSummits,
});

export default connect(mapStateToProps, {
  onUserAuth,
  doLogout,
  getUserInfo,
  resetLoading,

})(App);
