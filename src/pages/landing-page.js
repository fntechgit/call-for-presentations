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
import { Exclusive } from 'openstack-uicore-foundation/lib/components'
import { getAllFromSummit } from '../actions/base-actions';
import { connect } from 'react-redux'

class LandingPage extends React.Component {

    componentDidMount() {
        let { isLoggedUser, match } = this.props;
        let summitSlug = match.params.summit_slug;

        if (!isLoggedUser && summitSlug) {
            this.props.getAllFromSummit(summitSlug);
        }
    }

    componentWillReceiveProps(newProps) {
        let { isLoggedUser, match } = this.props;
        let oldSummitSlug = match.params.summit_slug;
        let newSummitSlug = newProps.match.params.summit_slug;

        if (!isLoggedUser && newSummitSlug && newSummitSlug !== oldSummitSlug) {
            this.props.getAllFromSummit(newSummitSlug);
        }
    }

    render(){
        let {doLogin, summit, isLoggedUser} = this.props;
        var url = window.location.href;
        var arr = url.split("/");
        var domain = arr[0] + "//" + arr[2];
        if( !summit || isLoggedUser ) return null;

        return (
            <div className="container landing-page-wrapper">
                <Exclusive name="os-landing">
                    <div>
                        <h1 className="title">{T.translate("landing.title", {'summit_name' : summit.name})}</h1>

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
                </Exclusive>

                <Exclusive name="fntech-landing">
                    <div className="submit-wrapper" id="submit">
                        <h2 className="submit-title">{T.translate("landing.submit_title")}</h2>

                        <div className="row">
                            <div className="col-md-6 login-box">
                                <div className="submit-subtitle"> {T.translate("landing.have_login")} </div>
                                <button className="btn btn-primary btn-lg" onClick={() => { doLogin(); }}>
                                    {T.translate("landing.log_in")}
                                </button>
                            </div>
                            <div className="col-md-6 login-box">
                                <div className="submit-subtitle"> {T.translate("landing.or_create_id")}</div>
                                <a href={`${window.IDP_BASE_URL}/auth/register?client_id=${window.OAUTH2_CLIENT_ID}&redirect_uri=${domain}/app/profile`} className="btn btn-default btn-lg" target="_blank">
                                    {T.translate("landing.sign_up")}
                                </a>
                            </div>
                        </div>
                    </div>
                </Exclusive>
            </div>
        );
    }
}


const mapStateToProps = ({ loggedUserState, baseState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    member: loggedUserState.member,
    speaker: baseState.speaker,
    loading : baseState.loading,
    summit: baseState.summit,
});

export default connect(
    mapStateToProps,
    {
        getAllFromSummit
    }
)(LandingPage);


