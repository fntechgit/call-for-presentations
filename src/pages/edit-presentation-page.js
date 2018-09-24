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
import { getPresentation, resetPresentation, savePresentation } from "../actions/presentation-actions";
import PresentationSummaryForm from "../components/presentation-summary-form";
import PresentationNav from "../components/presentation-nav/index";
import NavStepsDefinitions from "../components/presentation-nav/nav-steps-definition";
import PresentationTagsForm from "../components/presentation-tags-form"
import PresentationSpeakersForm from "../components/presentation-speakers-form";
import PresentationReviewForm from "../components/presentation-review-form";

import '../styles/edit-presentation-page.less';

class EditPresentationPage extends React.Component {

    constructor(props){
        super(props);
    }

    componentWillReceiveProps(newProps) {
        let {history} = newProps;
        let step = newProps.match.params.step;

        if (!NavStepsDefinitions.map(s => s.name).includes(step)) {
            history.push('summary');
        }
    }

    render() {
        let { entity, selectionPlan, errors, history, savePresentation } = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.new");
        let step = this.props.match.params.step;

        if (!selectionPlan.summit.event_types || !selectionPlan.summit.tracks) return (<div></div>);

        return (
            <div className="page-wrap" id="edit-presentation-page">
                <div className="presentation-header-wrapper">
                    <h3>{title} {T.translate("edit_presentation.presentation")}</h3>
                </div>
                <PresentationNav activeStep={step} progress={entity.progress} />

                {step == 'summary' &&
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

                {step == 'tags' &&
                <div className="tag-form-wrapper">
                    <PresentationTagsForm
                        history={history}
                        entity={entity}
                        selectionPlan={selectionPlan}
                        onSubmit={savePresentation}
                    />
                </div>
                }

                {step == 'speakers' &&
                <div className="speakers-form-wrapper">
                    <PresentationSpeakersForm
                        history={history}
                        entity={entity}
                        selectionPlan={selectionPlan}
                        onSubmit={savePresentation}
                    />
                </div>
                }

                {step == 'review' &&
                <div className="review-form-wrapper">
                    <PresentationReviewForm
                        history={history}
                        entity={entity}
                        selectionPlan={selectionPlan}
                        onSubmit={savePresentation}
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
        savePresentation
    }
)(EditPresentationPage);
