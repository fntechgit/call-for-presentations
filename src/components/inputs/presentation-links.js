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
import T from "i18n-react/dist/i18n-react";


export default class PresentationLinks extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.drawRow = this.drawRow.bind(this);
    }

    handleChange(attr, idx, ev) {
        let links = [...this.props.links];
        let link = Object.assign({}, links[idx]);
        link[attr] = ev.target.value;
        links[idx] = link;

        let event = {target: {
            id: 'other_presentation_links',
            value: links,
            type: 'presentationlinks'
        }};

        this.props.onChange(event);
    }

    drawRow(idx) {
        let {links} = this.props;
        let link = (links.length >= idx) ? links[idx] : null;
        let title = link ? link.title : '';
        let url = link ? link.link : '';

        return (
            <tr key={"presentation_link_" + idx}>
                <td>
                    <input id={"link_title_" + idx} value={title} onChange={this.handleChange.bind(this,'title',idx)} className="form-control"/>
                </td>
                <td>
                    <input id={"link_url_" + idx} value={url} onChange={this.handleChange.bind(this,'link',idx)} className="form-control"/>
                </td>
            </tr>
        );
    }


    render() {
        let rows = [0,1,2,3,4];
        let {id, error} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );

        return (
            <div>
                <table className="table table-striped" id={id}>
                    <thead>
                        <tr>
                            <th>{T.translate("edit_speaker.link")}</th>
                            <th>{T.translate("edit_speaker.title")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r =>
                            this.drawRow(r)
                        )}
                    </tbody>
                </table>
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}

