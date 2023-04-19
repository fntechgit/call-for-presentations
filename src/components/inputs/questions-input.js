/**
 * Copyright 2021 OpenStack Foundation
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
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {Input, Dropdown, RadioList, CheckboxList, RawHTML} from 'openstack-uicore-foundation/lib/components'

export default class QuestionsInput extends React.Component {

    constructor(props) {
        super(props);

        let answers = props.questions.map(q => {
            let defaultValue = (q.type === 'CheckBox') ? 'false' : '';
            let answer = props.answers.find(ans => ans.question_id == q.id);
            let value = answer ? answer.answer : defaultValue;
            return ({question_id: q.id, answer: value});
        });

        this.state = {
            answers: answers,
        };

        this.handleChange = this.handleChange.bind(this);
        this.getInput = this.getInput.bind(this);
    }

    handleChange(ev) {
        let {value, id} = ev.target;

        id = id.toString();

        if (id.includes("_")) {
            id = id.split("_")[1];
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked ? "true" : "false";
        }

        if (ev.target.type === 'checkboxlist') {
            value = ev.target.value.join(',');
        }

        let answers = this.state.answers.map(ans => {
            let newValue = ans.answer;
            if (ans.question_id === parseInt(id)) newValue = `${value}`;

            return ({question_id: ans.question_id, answer: newValue})
        });

        let newEv = {
            target: {
                id: this.props.id,
                value: answers
            }
        };

        this.setState({answers});

        this.props.onChange(newEv);
    }

    getInput(question, answerValue) {
        let questionValues = question.values;
        let {entity} = this.props;
        let label = question.label;
        if(question.mandatory){
            label = `${label}<span>&nbsp;*</span>`;
        }
        switch (question.type) {
            case 'Text':
                return (
                    <React.Fragment>
                        <label><RawHTML>{label}</RawHTML></label>
                        <Input
                            id={question.id}
                            value={answerValue}
                            onChange={this.handleChange}
                            placeholder={question.placeholder}
                            className="form-control"
                            disabled={entity.id > 0 && !question.is_editable}
                        />

                    </React.Fragment>
                );
            case 'TextArea':
                return (
                    <React.Fragment>
                        <label><RawHTML>{label}</RawHTML></label>
                        <textarea
                            id={question.id}
                            value={answerValue}
                            onChange={this.handleChange}
                            placeholder={question.placeholder}
                            className="form-control"
                            rows="4"
                            disabled={entity.id > 0 && !question.is_editable}
                        />

                    </React.Fragment>
                );
            case 'CheckBox':
                return (
                    <div className="form-check abc-checkbox">
                        <input
                          type="checkbox"
                          id={`${entity.id}_${question.id}`}
                          checked={(answerValue === "true")}
                          onChange={this.handleChange}
                          className="form-check-input"
                          disabled={entity.id > 0 && !question.is_editable}
                        />

                        <label className="form-check-label" htmlFor={`${entity.id}_${question.id}`}>
                            <RawHTML>
                                {label}
                            </RawHTML>
                        </label>
                    </div>
                );
            case 'ComboBox':
                let value = answerValue ? questionValues.find(val => val.id == parseInt(answerValue)) : null;
                questionValues = questionValues.map(val => ({...val, value: val.id}));
                return (
                    <React.Fragment>
                        <label><RawHTML>{label}</RawHTML></label>
                        <Dropdown
                            id={question.id}
                            value={value}
                            options={questionValues}
                            onChange={this.handleChange}
                            disabled={entity.id > 0 && !question.is_editable}
                        />
                    </React.Fragment>
                );
            case 'CheckBoxList':
                questionValues = questionValues.map(val => ({...val, value: val.id}));
                answerValue = answerValue ? answerValue.split(',').map(ansVal => parseInt(ansVal)) : [];
                return (
                    <React.Fragment>
                        <label><RawHTML>{label}</RawHTML></label>
                        <CheckboxList
                            id={`${entity.id}_${question.id}`}
                            value={answerValue}
                            options={questionValues}
                            onChange={this.handleChange}
                            html
                            disabled={entity.id > 0 && !question.is_editable}
                        />
                    </React.Fragment>
                );
            case 'RadioButtonList':
                questionValues = questionValues.map(val => ({...val, value: val.id}));
                return (
                    <React.Fragment>
                        <label><RawHTML>{label}</RawHTML></label>
                        <RadioList
                            id={`${entity.id}_${question.id}`}
                            value={answerValue}
                            options={questionValues}
                            onChange={this.handleChange}
                            inline
                            html
                            disabled={entity.id > 0 && !question.is_editable}
                        />
                    </React.Fragment>
                );
        }
    }

    render() {
        let {answers} = this.state;
        let {questions, error} = this.props;
        let orderedQuestions = questions.sort((a, b) => (a.order > b.order) ? 1 : -1);
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        return (
            <div className="extra-questions">
                {orderedQuestions.map(q => {

                    let answer = answers.find(ans => ans.question_id === q.id);
                    let answerValue = answer ? answer.answer : null;
                    return (
                        <div className={`row form-group`} key={`question_answer_${q.id}`}>
                            <div className="col-md-12">
                                {this.getInput(q, answerValue)}
                            </div>
                        </div>
                    );
                })}
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );
    }
}