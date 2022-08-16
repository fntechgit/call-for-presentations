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

        this.props.onSubmit(entity);
    }

    render() {
        let {entity} = this.state;
        let {presentation, step, groupedTags} = this.props;

        return (
            <form className="presentation-tags-form">
                <input type="hidden" id="id" value={entity.id} />
                <TagManager maxTags={8} allowedTags={groupedTags} value={entity.tags} onTagClick={this.handleTagClick} />
                <hr/>
                <SubmitButtons presentation={presentation} step={step} onSubmit={this.handleSubmit.bind(this)} backStep="uploads" />
            </form>
        );
    }
}

export default PresentationTagsForm;
