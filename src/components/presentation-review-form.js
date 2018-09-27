/**
 * Copyright 2017 OpenStack Foundation
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
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import SubmitButtons from "./presentation-submit-buttons";

class PresentationReviewForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
        });
    }

    handleSubmit(ev) {
        ev.preventDefault();

        this.props.onSubmit(this.props.entity);
    }

    handleBack(ev) {
        ev.preventDefault();

        this.props.onBack();
    }

    render() {
        let {selectionPlan, entity} = this.props;

        return (
            <form className="presentation-review-form">
                <input type="hidden" id="id" value={entity.id} />
                REVIEW
                <hr/>
                <SubmitButtons onSubmit={this.handleSubmit.bind(this)} backStep="speakers" />
            </form>
        );
    }
}

export default PresentationReviewForm;
