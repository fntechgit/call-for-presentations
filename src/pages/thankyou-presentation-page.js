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
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import { Exclusive } from 'openstack-uicore-foundation/lib/components'
import {getSubmissionsPath} from "../utils/methods";

import '../styles/thankyou-presentation-page.less';

class ThankYouPresentationPage extends React.Component {

    constructor(props){
        super(props);
        this.onDone = this.onDone.bind(this);
    }

    onDone(ev) {
        ev.preventDefault();
    
        const {history, summit} = this.props;
        const submissionsPath = getSubmissionsPath();
    
        history.push(`/app/${summit.slug}/${submissionsPath}`);
    }

    render() {
        return (
            <div className="page-wrap" id="thankyou-presentation-page">
                <div className="presentation-header-wrapper">
                    <h2>{T.translate("thankyou_presentation.thank_you")}</h2>
                </div>

                <div className="thankyou-body-wrapper">
                    <p>
                        <b>{T.translate("thankyou_presentation.saved")}</b>{'  '}
                        {T.translate("thankyou_presentation.saved_cont")}
                    </p>
                    <Exclusive name="thank-you-body">
                    <p>
                        {T.translate("thankyou_presentation.body")}
                    </p>
                    </Exclusive>

                    <hr/>
                    <div className="row submit-buttons">
                        <div className="col-md-6 col-md-offset-6">
                            <button onClick={this.onDone} className="btn btn-primary pull-right btn-save" >
                                {T.translate("general.got_it")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ baseState, presentationState }) => ({
    summit:baseState.summit,
    ...presentationState
})

export default connect (
    mapStateToProps,
    {
    }
)(ThankYouPresentationPage);
