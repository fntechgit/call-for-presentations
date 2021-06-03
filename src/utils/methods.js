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

import moment from 'moment-timezone';
import URI from "urijs";
import validator from 'validator';

export const findElementPos = (obj) => {
    var curtop = -70;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return [curtop];
    }
}

export const epochToMoment = (atime) => {
    if(!atime) return atime;
    atime = atime * 1000;
    return moment(atime);
}

export const epochToMomentTimeZone = (atime, time_zone) => {
    if(!atime) return atime;
    atime = atime * 1000;
    return moment(atime).tz(time_zone);
}

export const formatEpoch = (atime, format = 'M/D/YYYY h:mm a') => {
    if(!atime) return atime;
    return epochToMoment(atime).format(format);
}

export const objectToQueryString = (obj) => {
    var str = "";
    for (var key in obj) {
        if (str != "") {
            str += "&";
        }
        str += key + "=" + encodeURIComponent(obj[key]);
    }

    return str;
}

export const getBackURL = () => {
    let url      = URI(window.location.href);
    let query    = url.search(true);
    let fragment = url.fragment();
    let backUrl  = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : null;
    if(fragment != null && fragment != ''){
        backUrl += `#${fragment}`;
    }
    return backUrl;
}

export const scrollToError = () => {
    let firstError = document.getElementsByClassName("error-label")[0];
    if (firstError) {
        firstError.scrollIntoView({behavior: "smooth", block: "center"});
    }
}

export const validate = (entity, rules, errors) => {
    let result = true;

    for (var field in rules) {

        if (rules[field].hasOwnProperty('required')) {
            if (typeof entity[field] == 'string') {
                var stripedHtml = entity[field].replace(/<[^>]+>/g, '');
                if (!stripedHtml) {
                    errors[field] = rules[field].required;
                    result = false;
                }
            } else if (!entity[field] || entity[field].length == 0) {
                errors[field] = rules[field].required;
                result = false;
            }
        }

        if (rules[field].hasOwnProperty('email')) {
            if (entity[field] && !validator.isEmail(entity[field])) {
                errors[field] = rules[field].email;
                result = false;
            }
        }

        if (rules[field].hasOwnProperty('maxLength')) {
            if (entity[field].length > 0 && entity[field].length > rules[field].maxLength.value) {
                errors[field] = rules[field].maxLength.msg;
                result = false;
            }
        }

        if (rules[field].hasOwnProperty('link')) {
            if (entity[field] && !validator.isURL(entity[field])) {
                errors[field] = rules[field].link;
                result = false;
            }
        }

        if (rules[field].hasOwnProperty('links')) {
            for (let [idx, link] of entity[field].entries()) {
                if (link && !validator.isURL(link,{require_protocol: true})) {
                    errors['link_'+idx] = rules[field].links;
                    result = false;
                    break;
                }
            }
        }

        if (rules[field].hasOwnProperty('title_link')) {
            for (let link of entity[field]) {
                if (link.link && !validator.isURL(link.link,{protocols: ['http', 'https'], require_protocol:true})) {
                    errors[field] = rules[field].title_link;
                    result = false;
                    break;
                }
            }
        }

        if(rules[field].hasOwnProperty('required_questions')){
            let answers = entity[field];
            let questions = rules[field].required_questions.value;
            // check questions
            if(questions.length > 0) {
                for (var eq of questions) {
                    if(eq.mandatory){ // only check for mandatory questions ( skip optionals)
                        // check if the user answered
                        let findEq = answers.find(q => q.question_id == eq.id);
                        if(!findEq){
                            // answer not found
                            errors[field] = rules[field].required_questions.msg;
                            result = false;
                            break;
                        }
                        let answeredQuestions = false;
                        // answer found
                        switch(eq.type) {
                            case 'TextArea':
                            case 'Text':
                            case 'ComboBox':
                            case 'RadioButtonList':
                            case 'CheckBoxList':
                            case 'RadioButton':
                                answeredQuestions = findEq && findEq.answer != "" ? true : false;
                                break;
                            case 'CheckBox':
                                answeredQuestions = findEq && findEq.answer == "true" ? true : false;
                                break;
                        }
                        if(!answeredQuestions){
                            errors[field] = rules[field].required_questions.msg;
                            result = false;
                        }
                    }
                }
            }
        }
    }

    return result;
}

