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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import { withRouter } from 'react-router-dom'
import TagGroup from './tag-group'
import './tag-manager.less';

class TagManager extends React.Component {

    constructor (props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

    }

    handleClick(tagId, ev) {
        let selected = [...this.props.value];
        let {maxTags} = this.props;

        ev.preventDefault();

        if (selected.includes(tagId)) {
            selected = selected.filter(t => t != tagId);
        } else {
            selected.push(tagId);
        }

        this.props.onTagClick(selected);
    }

    render() {
        let {maxTags, allowedTags, value}  = this.props;
        let tagCount   = value.length;
        let canSelect  = tagCount < maxTags;

        return (
            <div className="tag-manager-wrapper">
                <div className="row">
                    <div className="col-lg-12">
                        {canSelect &&
                        <div className="alert alert-info">
                            {T.translate("edit_presentation.tag_max")}
                        </div>
                        }
                        {!canSelect &&
                        <div className="alert alert-warning">
                            {T.translate("edit_presentation.tag_max_reached")}
                        </div>
                        }
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-9">
                        {Object.keys(allowedTags).map((group) => (
                            <TagGroup key={"tag_group_" + group} selected={value} group={group} tags={allowedTags[group]} onClickTag={this.handleClick} />
                        ))}
                    </div>
                    <div className="col-lg-3">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                {T.translate("edit_presentation.selected_title")}
                            </div>
                            <div className="panel-body">
                                <h4>{tagCount} {T.translate("general.of")} {maxTags} {T.translate("edit_presentation.tags")}</h4>
                            </div>
                            {!canSelect &&
                            <ul className="list-group">
                                <li className="list-group-item">
                                    {T.translate("edit_presentation.tag_max_reached")}
                                </li>
                            </ul>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default withRouter(TagManager);
