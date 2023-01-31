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
import T from 'i18n-react/dist/i18n-react';

export default class NavStep extends React.Component {


    render() {
        let {step, onClick, activeStep, progress, selectionPlanSettings } = this.props;
        let active = (activeStep === step.lcName);
        let disabled = (progress === 0 && step.step > 1);
        let future = (!active && progress < step.step);
        let completed = (!active &&  progress >= step.step);

        let step_class = '';
        let icon_class = '';

        if (active) {
            step_class += ' current';
            icon_class += ' fa-pencil navigation-icon-current';
        } else if (disabled) {
            step_class += ' disabled';
            icon_class += ' fa-plus-circle navigation-icon-incompleted';
        } else if (future) {
            step_class += ' future';
            icon_class += ' fa-plus-circle navigation-icon-incompleted';
        } else if (completed) {
            step_class += ' completed';
            icon_class += ' fa-check-circle navigation-icon-completed';
        }

        return (
            <li className={step_class}>
                <a id={'step-' + step.lcName} className={"presentation-step" + step_class} onClick={onClick} >
                    {step.lcName === "speakers" && selectionPlanSettings?.CFP_SPEAKERS_PLURAL_LABEL ?
                        selectionPlanSettings?.CFP_SPEAKERS_PLURAL_LABEL :
                        T.translate('presentation_nav.' + step.lcName)
                    }
                    <i className={"navigation-icon fa" + icon_class}></i>
                </a>
            </li>

        );

    }
}

