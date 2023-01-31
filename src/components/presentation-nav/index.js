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

import React from 'react'
import { withRouter } from 'react-router-dom'
import history from '../../history'
import NavStep from './nav-step'
import './presentation-nav.less';

class PresentationNav extends React.Component {

    constructor (props) {
        super(props);

    }

    onStepClick(event, step){
        let {progress} = this.props;
        let disabled = step.step > progress + 1; // is not next step

        event.preventDefault();

        if (!disabled) {
            history.push(step.lcName);
        }
    }

    render() {
        let {progress, selectionPlanSettings, activeStep, steps} = this.props;

        return (
            <div className="presentation-nav-wrapper">
                <ul className="presentation-nav-steps">
                    { steps.map(step => (
                        <NavStep
                            key={step.lcName + "-step"}
                            onClick={(e) => this.onStepClick(e, step)}
                            step={step}
                            activeStep={activeStep}
                            progress={progress}
                            selectionPlanSettings={selectionPlanSettings}
                        />
                    ))}
                </ul>
            </div>
        );
    }

}

export default withRouter(PresentationNav);
