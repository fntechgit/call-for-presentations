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
import MenuItem from './menu-item'
import MenuItemsDefinitions from './menu-items-definition'
import '../../styles/menu.less';

class NavMenu extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            activeItem: 'presentations'
        }
    }

    onMenuItemClick(event, item){
        let { history } = this.props;

        event.preventDefault();

        this.setState({
            activeItem: item.name
        });

        history.push(`/app/${item.url}`);
    }

    render() {

        let {user} = this.props;
        let {activeItem} = this.state;

        return (
            <div id="app_menu" >
                <p className="user-img" style={{backgroundImage: 'url(' + user.pic + ')'}} ></p>
                <h3 className="user-name">{user.first_name} {user.last_name}</h3>
                <ul className="items">
                { MenuItemsDefinitions.map(it => (
                    <MenuItem
                        key={it.name}
                        {...it}
                        onClick={(e) => this.onMenuItemClick(e, it)}
                        active={activeItem == it.name}
                    />
                ))}
                </ul>
            </div>
        );
    }

}

export default withRouter(NavMenu);
