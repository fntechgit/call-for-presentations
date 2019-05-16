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

export const validate = (entity, rules, errors) => {
    let result = true;
    let firstError = null;

    for (var field in rules) {

        if (rules[field].hasOwnProperty('required')) {
            if (!entity[field] || entity[field].length == 0) {
                errors[field] = rules[field].required;
                result = false;
                if (!firstError) {
                    firstError = document.getElementById(field);
                }
            }
        }

        if (rules[field].hasOwnProperty('email')) {
            if (entity[field] && !validator.isEmail(entity[field])) {
                errors[field] = rules[field].email;
                result = false;
                if (!firstError) {
                    firstError = document.getElementById(field);
                }
            }
        }

        if (rules[field].hasOwnProperty('maxLength')) {
            if (entity[field].length > 0 && entity[field].length > rules[field].maxLength.value) {
                errors[field] = rules[field].maxLength.msg;
                result = false;
                if (!firstError) {
                    firstError = document.getElementById(field);
                }
            }
        }

        if (rules[field].hasOwnProperty('link')) {
            if (entity[field] && !validator.isURL(entity[field])) {
                errors[field] = rules[field].link;
                result = false;
                if (!firstError) {
                    firstError = document.getElementById(field);
                }
            }
        }

    }

    if (!result) {
        firstError = firstError ? firstError : document.getElementsByTagName("form")[0];
        firstError.scrollIntoView({behavior: "smooth", block: "center"});
    }

    return result;
}

