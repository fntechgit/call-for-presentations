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
import swal from "sweetalert2";
import { getPresentation, resetPresentation, savePresentation, stepBack } from "../actions/presentation-actions";
import PresentationSummaryForm from "../components/presentation-summary-form";
import PresentationNav from "../components/presentation-nav/index";
import PresentationTagsForm from "../components/presentation-tags-form"

import '../styles/edit-presentation-page.less';

class EditPresentationPage extends React.Component {

    constructor(props){
        super(props);
    }

    componentWillMount () {
        let presentationId = this.props.match.params.presentation_id;
        let {entity}   = this.props;

        if (!presentationId) {
            this.props.resetPresentation();
        } else if (presentationId != entity.id){
            this.props.getPresentation(presentationId);
        }
    }

    render() {
        let { entity, selectionPlan, step, errors, history, savePresentation } = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.new");

        return (
            <div className="page-wrap" id="edit-presentation-page">
                <div className="presentation-header-wrapper">
                    <h3>{title} {T.translate("edit_presentation.presentation")}</h3>
                </div>
                <PresentationNav active={step} progress={entity.current_step} />

                {step == 1 &&
                <div className="presentation-form-wrapper">
                    <PresentationSummaryForm
                        history={history}
                        entity={entity}
                        selectionPlan={selectionPlan}
                        errors={errors}
                        onSubmit={savePresentation}
                    />
                </div>
                }

                {step == 2 &&
                <div className="tag-form-wrapper">
                    <PresentationTagsForm
                        history={history}
                        entity={entity}
                        selectionPlan={selectionPlan}
                        onSubmit={savePresentation}
                        onBack={stepBack}
                    />
                </div>
                }
            </div>
        );
    }
}

const mapStateToProps = ({ selectionPlanState, presentationState }) => ({
    selectionPlan : selectionPlanState,
    ...presentationState
})

export default connect (
    mapStateToProps,
    {
        getPresentation,
        resetPresentation,
        savePresentation,
        stepBack
    }
)(EditPresentationPage);
