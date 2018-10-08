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
import 'react-select/dist/react-select.css';
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
    let {first_name, last_name, email, pic} = option;

    return (
        <div style={optionStyle}>
            { pic && <img src={pic} style={imageStyle} /> }
            { first_name }&nbsp;{ last_name }&nbsp;
            { email && <span>({email})</span> }
        </div>
    );
};

export default class CPFSpeakerInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.getSpeakers = this.getSpeakers.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
    }

    handleChange(value) {
        let ev = {target: {
            id: this.props.id,
            value: value,
            type: 'speakerinput'
        }};

        this.props.onChange(ev);

        this.setState({value: value});
    }

    filterOptions(options, filterString, values) {
        let {speakers} = this.props;
        let speakerOpts = options.map(s => (
            {id: s.id, first_name: s.first_name, last_name: s.last_name, email: s.email, pic: s.pic})
        );

        if (speakers.length) {
            let filtered_options = speakerOpts.filter( op => {
                return speakers.map(val => val.id).indexOf( op.id ) < 0;
            } );

            return filtered_options;
        } else {
            return speakerOpts;
        }
    }

    getSpeakers (input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        querySpeakers(null, input, callback);
    }


    render() {
        let {onChange, id, speakers, ...rest} = this.props;

        return (
            <AsyncCreatableSelect
                value={this.state.value}
                onChange={this.handleChange}
                loadOptions={this.getSpeakers}
                backspaceRemoves={true}
                valueKey="id"
                labelKey="email"
                filterOptions={this.filterOptions}
                optionRenderer={CustomOption}
                isMulti={false}
                placeholder="Find speakers or type email to create new"
                promptTextCreator={(email) => `Add new speaker with email: "${email}" `}
                {...rest}
            />
        );

    }
}

