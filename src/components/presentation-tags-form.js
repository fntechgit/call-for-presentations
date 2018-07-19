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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import TagManager from './tag-manager/index'
import SubmitButtons from "./presentation-submit-buttons";

class PresentationTagsForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity}
        };

        this.handleTagClick = this.handleTagClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
        });
    }

    handleTagClick(value, ev) {
        let entity = {...this.state.entity};

        entity.tags = value;
        this.setState({entity: entity});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity, this.props.history);
    }

    render() {
        let {entity} = this.state;
        let {selectionPlan, history} = this.props;


        // TODO get allowed tags grouped by tag group
        let allowedTags = {
            'session type': [{id: 1, label: '101'}, {id: 2, label: 'Arch / Ops'}, {id: 3, label: 'Case Study'}],
            'other open source projects': [{id: 5, label: 'Ansible'}, {id: 4, label: 'Calico'}],
            'openstack projects mentioned': [{id: 7, label: 'Barbican'}, {id: 6, label: 'Cinder'}, {id: 8, label: 'Swift'}]
        };


        return (
            <form className="presentation-tags-form">
                <input type="hidden" id="id" value={entity.id} />
                <TagManager maxTags={8} allowedTags={allowedTags} value={entity.tags} onTagClick={this.handleTagClick} />
                <hr/>
                <SubmitButtons onSubmit={this.handleSubmit.bind(this)} history={history} backStep="summary" />
            </form>
        );
    }
}

export default PresentationTagsForm;
