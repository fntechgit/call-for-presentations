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

import React from "react";
import {Dropdown} from 'openstack-uicore-foundation/lib/components'
import history from "../history";
import {connect} from "react-redux";
import {
    getAvailableSummits, clearCurrentSummit
} from "../actions/base-actions";
import T from "i18n-react";
import '../styles/summit-selection-page.less';

class SummitSelectionPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentSummit: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.onSelectedSummit = this.onSelectedSummit.bind(this);
    }

    componentDidMount() {
        console.log(`SummitSelectionPage::componentDidMount`);
        this.props.clearCurrentSummit();
        this.props.getAvailableSummits();
    }

    onSelectedSummit(slug) {
        history.push(`/${slug}`);
    }

    handleChange(ev) {
        let {value} = ev.target;
        this.onSelectedSummit(value);
    }

    render() {
        let {availableSummits, loading} = this.props;
        let {currentSummit} = this.state;
        if (availableSummits.length === 0){
            if(!loading)
                return (
                    <div className="center row">
                        <div className="col-sm-12 col-xs-12 col-lg-12">
                            <p>{T.translate("summit_selection_page.not_available_summits")}</p>
                        </div>
                    </div>
                );
            return null;
        }
        return (
            <div className="row summit-select-container">
                <div className="col-sm-12 col-xs-12 col-lg-12">
                    <div className="center row">
                        <div className="col-sm-12 col-xs-12 col-lg-12 summit-select-text">
                            <p>{T.translate('summit_selection_page.title')}</p>
                        </div>
                    </div>
                    <div className="center row">
                        <div className="col-sm-6 col-xs-10 col-lg-6 col-centered">
                            <Dropdown
                                value={currentSummit}
                                options={availableSummits.map(s => ({...s, value: s.slug, label: s.name}))}
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({summitSelectionState, baseState}) => ({
    availableSummits: summitSelectionState.availableSummits,
    loading: baseState.loading,
})


export default connect(mapStateToProps, {
    getAvailableSummits,
    clearCurrentSummit
})(SummitSelectionPage)
