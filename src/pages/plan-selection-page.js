/**
 * Copyright 2020 OpenStack Foundation
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

import React, {useEffect} from "react";
import {Dropdown} from 'openstack-uicore-foundation/lib/components'
import history from "../history";
import {connect} from "react-redux";
import T from "i18n-react";
import {clearSelectionPlan} from '../actions/base-actions';
import {nowAfter} from "../utils/methods";

import '../styles/plan-selection-page.less';

const PlanSelectionPage = ({summit, loading, match, clearSelectionPlan}) => {
    const selPlans = summit?.selection_plans || [];
    const availablePlans = selPlans.filter(sp => {
        return sp.is_enabled && nowAfter(sp.submission_begin_date);
    });

    useEffect(() => {
        clearSelectionPlan();
    }, [])

    if (loading) return null;

    if (availablePlans.length === 0) {
        return (
            <div className="center row">
                <div className="col-sm-12 col-xs-12 col-lg-12">
                    <p>{T.translate("plan_selection_page.no_available_plans")}</p>
                </div>
            </div>
        );
    }

    const onChange = (ev) => {
        const {value} = ev.target;
        history.push(`/app/${summit.slug}/all-plans/${value}`);
    };

    const planOpts = availablePlans.map(sp => ({...sp, value: sp.id, label: sp.name}));

    return (
        <div className="row select-container">
            <div className="col-sm-12 col-xs-12 col-lg-12">
                <div className="center row">
                    <div className="col-sm-12 col-xs-12 col-lg-12 select-text">
                        <p>{T.translate('plan_selection_page.title')}</p>
                    </div>
                </div>
                <div className="center row">
                    <div className="col-sm-6 col-xs-10 col-lg-6 col-centered">
                        <Dropdown
                            options={planOpts}
                            onChange={onChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = ({baseState}) => ({
    loading: baseState.loading,
    summit: baseState.summit,
})


export default connect(mapStateToProps, {clearSelectionPlan})(PlanSelectionPage)
