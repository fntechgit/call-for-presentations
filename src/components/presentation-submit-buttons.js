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

export default class SubmitButtons extends React.Component {

    render() {
        let {step, onSubmit, onBack} = this.props;

        return (
            <div className="row submit-buttons">
                {step > 1 &&
                <div className="col-md-6">
                    <button onClick={onBack} className="btn btn-default btn-back pull-left" >
                        <i className="fa fa-chevron-left" aria-hidden="true"></i> &nbsp;
                        {T.translate("general.go_back")}
                    </button>
                </div>
                }

                <div className="col-md-6">
                    <button onClick={onSubmit} className="btn btn-primary btn-save pull-right" >
                        {T.translate("general.save_and_continue")} &nbsp;
                        <i className="fa fa-chevron-right" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        );
    }
}

