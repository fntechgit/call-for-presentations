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

import React, {useState} from 'react'
import { withRouter } from 'react-router-dom'
import history from '../../history'
import MenuItem from './menu-item'
import MenuItemsDefinitions from './menu-items-definition'
import '../../styles/menu.less';
import {connect} from "react-redux";
import {getMarketingValue} from "../marketing-setting";


const NavMenu = ({summit, active, user, exclusiveSections, globalSummitDocs}) => {
    const [activeItem, setActiveItem] = useState(active);

    const onMenuItemClick = (event, item) => {
        event.preventDefault();
        setActiveItem(item.name);

        let url = `/app/${summit.slug}/${item.name}`;

        history.push(url);
    };

    const shouldShowItem = (item) => {
        if (item.show) return item.show;
        else if (item.showIf) {
            return item.showIf();
        }

        return exclusiveSections.includes(item.name);
    }

    const hideMyBio = getMarketingValue('CFP_HIDE_MY_BIO');

    return (
        <div id="app_menu" >
            <div id="app_menu_body">
                <p className="user-img" style={{backgroundImage: `url('${user.pic}')`}} />
                <h3 className="user-name">{user.first_name} {user.last_name}</h3>
                <ul className="items">
                    {MenuItemsDefinitions.map(it => (
                        <MenuItem
                            key={it.name}
                            name={it.name}
                            iconClass={it.iconClass}
                            show={shouldShowItem(it)}
                            onClick={(e) => onMenuItemClick(e, it)}
                            active={activeItem === it.name}
                        />
                    ))}
                    {globalSummitDocs?.map(doc => (
                        <MenuItem
                            key={doc.name}
                            name={doc.name}
                            label={doc.label}
                            iconClass="fa-download"
                            show
                            onClick={(e) => window.open(doc.file, '_blank')}
                            active={false}
                        />
                    ))}
                    <MenuItem
                        key="support"
                        name="support"
                        label="Contact Support"
                        iconClass="fa-envelope"
                        show
                        onClick={(e) => window.open(`mailto:${window.SUPPORT_EMAIL}`, '_blank')}
                        active={false}
                    />
                </ul>
            </div>
        </div>
    );

}

const mapStateToProps = ({ baseState }) => ({
    globalSummitDocs: baseState.globalSummitDocs,
    summit: baseState.summit,
})

export default withRouter(connect(
    mapStateToProps,
)(NavMenu));
