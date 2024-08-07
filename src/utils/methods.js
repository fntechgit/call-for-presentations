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
import {getAccessToken, initLogOut} from 'openstack-uicore-foundation/lib/security/methods'
import defaultColors from './default-colors.json';
import {BACK_URL, SP_LANDING} from "./constants";

export const stripHtmlText = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

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

export const nowBetween = (start, end) => {
    const now = moment().valueOf();
    return now > (start * 1000) && now < (end * 1000);
}

export const nowAfter = (date) => {
    const now = moment().valueOf();
    return now > (date * 1000);
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
    let backUrl  = query.hasOwnProperty(BACK_URL) ? query[BACK_URL] : null;
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
            // this allows to validate values on nested objects
            // field atributte specify the object attribute
            let field2Validate = rules[field].maxLength?.field || null;
            const id2Group = rules[field].maxLength?.id || null;
            let toValidate = [];
            // we could have an array of values to check ( repetitive group)
            // if we only have one, we simulate the array
            if (!Array.isArray(entity[field])) {
                toValidate.push({id: field, val: entity[field]})
            } else {
                toValidate = entity[field].map(e => {
                    const id = id2Group ? `${field}-${e[id2Group]}` : field;
                    return {id, val: e[field2Validate]}
                })
            }

            toValidate.forEach(e => {
                let val = stripHtmlText(e.val);
                if (val.length > 0 && val.length > rules[field].maxLength.value) {
                    errors[e.id] = rules[field].maxLength.msg;
                    result = false;
                }
            })
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
                if (link.link) {
                    if (!validator.isURL(link.link.trim(), {protocols: ['http', 'https'], require_protocol: true})) {
                        errors[field] = rules[field].title_link+': '+link.link;
                        result = false;
                        break;
                    }
                    if (!link.title) {
                        errors[field] = rules[field].title;
                        result = false;
                        break;
                    }
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
                        let findEq = answers.find(a => a.question_id == eq.id);
                        if (!findEq) {
                            // answer not found
                            errors[`${field}-${eq.id}`] = rules[field].required_questions.msg;
                            result = false;
                            break;
                        }
                        let answeredQuestions = false;
                        // answer found
                        switch(eq.type) {
                            case 'TextArea':
                            case 'Text':
                            case 'ComboBox':
                            case 'CountryComboBox':
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
                            errors[`${field}-${eq.id}`] = rules[field].required_questions.msg;
                            result = false;
                        }
                    }
                }
            }
        }
    }

    return result;
}

export const getAccessTokenSafely = async () => {
    try {
        return await getAccessToken();
    }
    catch (e) {
        console.log('log out: ', e);
        initLogOut();
    }
};

export const setDocumentColors = (data) => {
    if (typeof document !== 'undefined') {
        data.forEach(setting => {
            if (getComputedStyle(document.documentElement).getPropertyValue(`--${setting.key}`)) {
                document.documentElement.style.setProperty(`--${setting.key}`, setting.value);
                document.documentElement.style.setProperty(`--${setting.key}50`, `${setting.value}50`);
            }
        });
    }
};

export const formatSelectionPlanSettings = (data) => {
    let selectionPlanSettings = {};
    // format selection plan settings
    data.forEach(setting => {
        if(setting.selection_plan_id) {
            if(!selectionPlanSettings.hasOwnProperty(setting.selection_plan_id)){
                selectionPlanSettings[setting.selection_plan_id] = {}
            }
            selectionPlanSettings[setting.selection_plan_id] = {...selectionPlanSettings[setting.selection_plan_id], [setting.key]: setting.value}
        }
    });
    return selectionPlanSettings;
}

export const setDefaultColors = () => {
    setDocumentColors(defaultColors);
};

export const getSubmissionsPath = () => {
    const selectionPlanLandingId = localStorage.getItem(SP_LANDING);
    return selectionPlanLandingId ? `all-plans/${selectionPlanLandingId}` : 'all-plans';
};

export const getLandingSelectionPlanId = () => {
    return localStorage.getItem(SP_LANDING);
}

/**
 *
 * @param match
 * @returns {number}
 */
export const getCurrentSelectionPlanId = (match) => {
    // first try to use the match obj
    if(match?.params?.selection_plan_id)
        return parseInt(match.params.selection_plan_id)
    // and use raw url as a fallback
    const regex = /^\/app\/(\w*)\/all-plans\/(\d*)/;
    let currentUrl = URI(window.location.href);
    let path = currentUrl.path();
    const matches = path.match(regex);
    if(matches && matches.length > 2 ){
        return parseInt(matches[2]);
    }
    return 0;
}

// checks if path is: all-plans/{selection_plan_id}, all-plans/{selection_plan_id}/profile, all-plans/{selection_plan_id}/presentations
export const getLandingSelectionPlan = path => {
    const regex = /all-plans\/(\d+)(?:$|\/profile|\/presentations)(?:\/|$)$/;
    const regexMatch = path.match(regex);

    return regexMatch?.[1] || null;
}

// checks if path is: all-plans, all-plans/presentations
export const isGlobalLanding = path => {
    const regex = /all-plans(?:$|\/presentations)(?:\/|$)$/;
    const regexMatch = path.match(regex);

    return !!regexMatch;
}
