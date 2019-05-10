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
import React from 'react';

import '../styles/landing-page.less';
import T from "i18n-react/dist/i18n-react";
import SelectionProcessPage from "./selection-process-page";
import TracksGuidePage from "./tracks-guide-page";


export default class LandingPage extends React.Component {

    render(){
        let {history, isLoggedUser, doLogin, initLogOut, picture} = this.props;

        return (
            <div className="container landing-page-wrapper">
                <h1 className="title">{T.translate("landing.title")}</h1>

                <div class="steps-wrapper">
                    <div class="steps-title">{T.translate("landing.steps_title")}</div>
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
                            <button className="btn btn-primary btn-lg" onClick={() => { doLogin(); }}>
                                {T.translate("landing.log_in")}
                            </button>
                        </div>
                        <div className="col-md-6 login-box">
                            <div className="submit-subtitle"> {T.translate("landing.or_join_us")}</div>
                            <a href="https://www.openstack.org/join" className="btn btn-default btn-lg" target="_blank">
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
        );
    }
}
