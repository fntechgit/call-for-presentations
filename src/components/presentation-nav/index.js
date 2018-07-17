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
import NavStep from './nav-step'
import NavStepsDefinitions from './nav-steps-definition'
import './presentation-nav.less';

class PresentationNav extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            activeStep: props.active
        }

    }

    onStepClick(event, step){
        let { history } = this.props;

        event.preventDefault();

        this.setState({
            activeStep: step.step
        });

        history.push(`/app/${step}`);
    }

    render() {

        let {progress} = this.props;
        let {activeStep} = this.state;

        return (
            <div className="presentation-nav-wrapper">
                <ul className="presentation-nav-steps">
                    { NavStepsDefinitions.map(step => (
                        <NavStep
                            key={step.name + "-step"}
                            onClick={(e) => this.onStepClick(e, step)}
                            step={step}
                            activeStep={activeStep}
                            progress={progress}
                        />
                    ))}
                </ul>
            </div>
        );
    }

}

export default withRouter(PresentationNav);
