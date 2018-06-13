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
import { slide as Menu } from 'react-burger-menu'
import { withRouter } from 'react-router-dom'
import SubMenuItem from './sub-menu-item'
import MenuItem from './menu-item'
import MenuItemsDefinitions from './menu-items-definition'
import '../../styles/menu.less';

class NavMenu extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            subMenuOpen: '',
            menuOpen: false
        }

        this.drawMenuItem = this.drawMenuItem.bind(this);
    }

    toggleSubMenu(event, submenu) {
        event.preventDefault();
        this.setState({ ...this.state,
            subMenuOpen: submenu,
            menuOpen: true
        });
    }

    onMenuItemClick(event, url){
        let { history } = this.props;

        event.preventDefault();
        this.setState({menuOpen: false});

        history.push(`/app/${url}`);
    }

    drawMenuItem(item) {
        let {subMenuOpen} = this.state;

        if (item.hasOwnProperty('childs')) {
            return (
                <SubMenuItem
                    key={item.name}
                    subMenuOpen={subMenuOpen}
                    {...item}
                    onClick={(e) => this.toggleSubMenu(e, item.name)}
                    onItemClick={this.onMenuItemClick.bind(this)}
                />
            )
        } else {
            return (
                <MenuItem
                    key={item.name}
                    {...item}
                    onClick={(e) => this.onMenuItemClick(e, item.linkUrl)}
                />
            )
        }
    }

    render() {
        let {menuOpen} = this.state;

        return (
            <Menu id="app_menu" isOpen={ menuOpen } noOverlay width={ 300 } pageWrapId={ "page-wrap" } >
                <div className="separator">
                    {T.translate('menu.general')}
                </div>
                { MenuItemsDefinitions.map(it => {
                    return this.drawMenuItem(it);
                })}
            </Menu>
        );
    }

}

export default withRouter(NavMenu);
