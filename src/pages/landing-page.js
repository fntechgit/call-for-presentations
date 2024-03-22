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
import React, {useMemo, useState, useEffect} from 'react';

import '../styles/landing-page.less';
import T from "i18n-react/dist/i18n-react";
import SelectionProcessPage from "./selection-process-page";
import TracksGuidePage from "./tracks-guide-page";
import { Exclusive } from 'openstack-uicore-foundation/lib/components'
import { getAllFromSummit, getSelectionPlanSettings } from '../actions/base-actions';
import { connect } from 'react-redux'
import {getCurrentSelectionPlanId} from "../utils/methods";

const LandingPage = ({summitSlug, match, summit, isLoggedUser, backUrl, selectionPlansSettings, ...props}) => {
    const selectionPlanIdParam = getCurrentSelectionPlanId(match);
    const [settingsFetched, setSettingsFetched] = useState(false);
    const _backUrl = backUrl || `/app/${summitSlug}`;
    const url = window.location.href;
    const arr = url.split("/");
    const domain = arr[0] + "//" + arr[2];

    useEffect(() => {
        if (!isLoggedUser && summitSlug) {
            props.getAllFromSummit(summitSlug);
        }
    }, [isLoggedUser, summitSlug]);

    useEffect(() => {
        if (summit) {
            if (selectionPlanIdParam) {
                const selPlan = summit.selection_plans.find(sp => sp.id === selectionPlanIdParam);
                // retrieve marketing settings for selection plan
                props.getSelectionPlanSettings(summit.id, selPlan.id)
                  .then(() => {
                      setSettingsFetched(true);
                  });
            } else {
                setSettingsFetched(true);
            }
        }
    }, [selectionPlanIdParam, summit]);

    const pageTitle = useMemo(() => {
        const selectionPlanSettings = selectionPlansSettings?.[selectionPlanIdParam] || {};
        const defaultTitle = T.translate("landing.submit_title");

        return selectionPlanSettings?.CFP_LANDING_PAGE_TITLE || defaultTitle;
    }, [settingsFetched]);


    if ( !summit || isLoggedUser || !settingsFetched) return null;


    return (
      <div className="container landing-page-wrapper">
          <Exclusive name="os-landing">
              <div>
                  <h1 className="title">{T.translate("landing.title", {summit_name: `OpenInfra Summit ${summit.name}`})}</h1>
                  <div className="steps-wrapper">
                      <div className="steps-title">{T.translate("landing.steps_title")}</div>
                      <ul className="submit-steps">
                          <li>
                              <span>1</span>
                              <a href="#track-guide">
                                  {T.translate("landing.review_link")}
                              </a>
                          </li>
                          <li>
                              <span>2</span>
                              <a href="#selection-process">{T.translate("landing.learn_link")}</a>
                          </li>
                          <li>
                              <span>3</span>
                              <a href="#submit">{T.translate("landing.submit_link")}</a>
                          </li>
                      </ul>
                  </div>
                  <hr className="separator"/>
                  <div className="submit-wrapper" id="submit">
                      <h2 className="submit-title">{T.translate("landing.submit_title")}</h2>

                      <div className="row">
                          <div className="col-md-6 login-box">
                              <div className="submit-subtitle"> {T.translate("landing.already_member")} </div>
                              <button className="btn btn-primary btn-lg" onClick={() => { props.doLogin(_backUrl); }}>
                                  {T.translate("landing.log_in")}
                              </button>
                          </div>
                          <div className="col-md-6 login-box">
                              <div className="submit-subtitle"> {T.translate("landing.or_join_us")}</div>
                              <a href="https://openinfra.dev/join" className="btn btn-default btn-lg" target="_blank">
                                  {T.translate("landing.join_us")}
                              </a>
                          </div>
                      </div>
                  </div>
                  <hr className="separator"/>
                  <div className="selection-process-wrapper" id="selection-process">
                      <SelectionProcessPage />
                  </div>
                  <hr className="separator"/>
                  <div className="categories-wrapper" id="track-guide">
                      <TracksGuidePage />
                  </div>
              </div>
          </Exclusive>

          <Exclusive name="fntech-landing">
              <div className="submit-wrapper" id="submit">
                  <h2 className="submit-title">{pageTitle}</h2>

                  <div className="row">
                      <div className="col-md-6 login-box">
                          <div className="submit-subtitle"> {T.translate("landing.have_login")} </div>
                          <button className="btn btn-primary btn-lg" onClick={() => { props.doLogin(_backUrl); }}>
                              {T.translate("landing.log_in")}
                          </button>
                      </div>
                      <div className="col-md-6 login-box">
                          <div className="submit-subtitle"> {T.translate("landing.or_create_id")}</div>
                          <a href={`${window.IDP_BASE_URL}/auth/register?client_id=${window.OAUTH2_CLIENT_ID}&redirect_uri=${_backUrl}`} className="btn btn-default btn-lg" target="_blank">
                              {T.translate("landing.sign_up")}
                          </a>
                      </div>
                  </div>
              </div>
          </Exclusive>
      </div>
    );
}


const mapStateToProps = ({ loggedUserState, baseState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    member: loggedUserState.member,
    speaker: baseState.speaker,
    loading : baseState.loading,
    summit: baseState.summit,
    selectionPlansSettings: baseState.selectionPlansSettings,
});

export default connect(mapStateToProps, {getAllFromSummit, getSelectionPlanSettings})(LandingPage);


