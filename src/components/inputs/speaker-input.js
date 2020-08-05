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

import React from 'react';
import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';
import {querySpeakers} from 'openstack-uicore-foundation/lib/methods';


const optionStyle = {
    height: '40px',
    margin: '2px'
}

const imageStyle = {
    width: '40px',
    margin: '2px',
    marginRight: '8px',
    border: '1px solid whitesmoke'
}


const CustomOption = (option) => {
    if (option.__isNew__) {
        return option.label;
    }
    let {first_name, last_name, email, pic} = option;
    email = decodeURIComponent(email);
    return (
        <div style={optionStyle}>
            {pic && <img src={pic} style={imageStyle}/>}
            {first_name}&nbsp;{last_name}&nbsp;
            {email && <span>({email})</span>}
        </div>
    );
};

export default class CPFSpeakerInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.getSpeakers = this.getSpeakers.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
    }

    handleChange(value) {
        let ev = {
            target: {
                id: this.props.id,
                value: value,
                type: 'speakerinput'
            }
        };

        this.props.onChange(ev);

    }

    filterOptions(option, filterString) {
        let {speakers} = this.props;

        if (speakers.length) {
            return speakers.map(val => val.id).indexOf(option.value) < 0
        }

        return true;
    }

    getSpeakers(input, callback) {
        if (!input) {
            return Promise.resolve({options: []});
        }

        querySpeakers(null, input, callback);
    }

    isValidNewOption(inputValue, selectValue, selectOptions) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(inputValue).toLowerCase());
    }


    render() {
        let {onChange, id, speakers, value, ...rest} = this.props;

        return (
            <AsyncCreatableSelect
                value={value}
                onChange={this.handleChange}
                loadOptions={this.getSpeakers}
                getOptionValue={op => op.id}
                getOptionLabel={CustomOption}
                filterOptions={this.filterOptions}
                isMulti={false}
                placeholder="Find speakers or type email to create new"
                formatCreateLabel={(input) => `Add new speaker with email: "${input}" `}
                isValidNewOption={this.isValidNewOption}
                {...rest}
            />
        );

    }
}

