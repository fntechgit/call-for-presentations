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
import {getCurrentSelectionPlanId, getLandingSelectionPlanId} from "../../utils/methods";
import DocList from "./doc-list";


const NavMenu = ({summit, active, user, exclusiveSections, presentation}) => {
    const [activeItem, setActiveItem] = useState(active);
    const landingSP = getLandingSelectionPlanId();
    const currentSP = getCurrentSelectionPlanId();

    const globalSummitDocs = summit.summit_documents.filter(sd => sd.selection_plan_id === 0);

    const otherDocs = summit.summit_documents.filter(d => {
        let shouldFilter = !!d.selection_plan;
        // if user landed on a SP, then we just show those docs
        if (currentSP || landingSP) {
            shouldFilter = d.selection_plan?.id === parseInt(currentSP || landingSP)
        }

        // if doc doesn't have a type constraint we should show it
        if (d.event_types.length === 0) {
            return shouldFilter;
        }

        // if user is editing a specific presentation type, we filter docs for that type
        if (presentation?.type_id) {
            shouldFilter = d.event_types.includes(presentation.type_id);
        } else if (d.event_types?.length > 0) { // we filter the docs that have a type constraint
            shouldFilter = false;
        }
        return shouldFilter;
    });

    const summitDocsPerPlan = otherDocs.reduce((res, it) => {
        if (!it.selection_plan) return res;
        if (!res[it.selection_plan.name]) res[it.selection_plan.name] = [];
        res[it.selection_plan.name].push(it);
        return res;
    }, {});


    const onMenuItemClick = (event, item) => {
        event.preventDefault();
        setActiveItem(item.name);

        const path = item.pathTransform ? item.pathTransform(landingSP) : item.name;
        const url = `/app/${summit.slug}/${path}`;

        history.push(url);
    };

    const shouldShowItem = (item) => {
        if (item.show) return item.show;
        else if (item.showIf) {
            return item.showIf();
        }

        return exclusiveSections.includes(item.name);
    }

    const handleRequestSupport = (e) => {
        e.preventDefault();
        const supportEmailAddress = summit.speakers_support_email || summit.support_email || window.SUPPORT_EMAIL;
        window.open(`mailto:${supportEmailAddress}`, '_blank');
        return false;
    }

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
                    <MenuItem
                      key="support"
                      name="support"
                      label="Contact Support"
                      iconClass="fa-envelope"
                      show
                      onClick={(e) => handleRequestSupport(e)}
                      active={false}
                    />
                    <hr/>

                    <DocList docs={globalSummitDocs} title="General Docs" />

                    {Object.entries(summitDocsPerPlan).map(([sptitle, spdocs]) => {
                        return (
                          <DocList docs={spdocs} title={sptitle} key={`doc-sp-${sptitle}`} />
                        )
                    })}

                </ul>
            </div>
        </div>
    );

}

const mapStateToProps = ({ baseState, presentationState }) => ({
    summit: baseState.summit,
    presentation: presentationState.entity
})

export default withRouter(connect(
    mapStateToProps,
)(NavMenu));
