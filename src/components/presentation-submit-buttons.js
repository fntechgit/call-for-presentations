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
import T from "i18n-react/dist/i18n-react";
import history from '../history'
import {getMarketingValue} from "./marketing-setting";

class SubmitButtons extends React.Component {

    handleBack(ev) {
        let {presentation, step} = this.props;
        ev.preventDefault();

        history.push(presentation.getStepNameBefore(step));
    }

    render() {
        let {onSubmit, selectionPlanSettings, presentation, step, showBack} = this.props;
        let submitButton = '';
        const review_tc_note = getMarketingValue('spkmgmt_review_tc_note');

        if (step == 'review') {
            if (presentation.isSubmitted()) {
                submitButton =
                    <button disabled className="btn btn-default pull-right" >
                        {review_tc_note || T.translate("general.already_submitted", {presentation: `${selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation")}`})} &nbsp;
                    </button>;
            } else {
                submitButton = <button onClick={onSubmit} className="btn btn-primary btn-save pull-right" >
                    {T.translate("general.confirm_submission")} &nbsp;
                    <i className="fa fa-chevron-right" aria-hidden="true"></i>
                </button>;
            }
        } else {
            submitButton = <button onClick={onSubmit} className="btn btn-primary btn-save pull-right" >
                {T.translate("general.save_and_continue")} &nbsp;
                <i className="fa fa-chevron-right" aria-hidden="true"></i>
            </button>;
        }

        return (
            <div className="row submit-buttons">

                <div className="col-md-6">
                    {showBack &&
                    <button onClick={this.handleBack.bind(this)} className="btn btn-default btn-back pull-left">
                        <i className="fa fa-chevron-left" aria-hidden="true"></i> &nbsp;
                        {T.translate("general.go_back")}
                    </button>
                    }
                </div>

                <div className="col-md-6">
                    {submitButton}
                </div>
            </div>
        );
    }
}

SubmitButtons.defaultProps = {
    showBack: true
};

export default SubmitButtons;
