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
import 'react-select/dist/react-select.css';

export default class RadioList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.hasOwnProperty('value') &&  this.state.value != nextProps.value) {
            this.setState({value: nextProps.value});
        }
    }

    handleChange(selection) {

        let ev = {target: {
            id: this.props.id,
            value: selection.target.value,
            type: 'radio'
        }};

        this.props.onChange(ev);
    }

    getLabel(option, inline) {
        if (inline) {
            return (
                <label className="form-check-label" htmlFor={"radio_" + option.value} style={{float: 'left'}}>
                    {option.label}
                </label>
            );
        } else {
            return (
                <label className="form-check-label" htmlFor={"radio_" + option.value} style={{float: 'left'}}>
                    <h4 style={{marginTop: '0px'}}>{option.label}</h4>
                    <p>{option.description}</p>
                </label>
            );
        }
    }

    render() {

        let {onChange, value, className, error, options, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );
        let inline = ( this.props.hasOwnProperty('inline') );

        let style, label;

        if (inline) {
            style = {
                paddingLeft: '22px',
                marginLeft: '20px',
                float: 'left'
            };


        } else {
            style = {
                paddingLeft: '22px'
            }
        }

        return (
            <div>
                { options.map(op => {
                    let checked = (op.value == value);
                    return (
                        <div className="form-check abc-radio" key={"radio_key_" + op.value} style={style}>
                            <input
                                className="form-check-input"
                                type="radio"
                                id={"radio_" + op.value}
                                value={op.value}
                                checked={checked}
                                onChange={this.handleChange}
                            />
                            {this.getLabel(op, inline)}
                        </div>
                    )
                })}

                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}
