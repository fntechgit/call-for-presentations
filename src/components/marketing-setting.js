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
import {connect} from "react-redux";
import store from '../store';


export const getMarketingValue = (key) => {
    const {baseState} = store.getState();
    const {marketingSettings} = baseState;

    if (!marketingSettings) return null;
    const setting = marketingSettings.find(s => s.key === key);

    if (!setting) return null;

    switch (setting.type) {
        case 'FILE':
            return setting.file;
        case 'TEXT':
            return setting.value;
        case 'TEXTAREA':
            return setting.value;
    }
};


const MarketingTag = ({type, key, className, settings}) => {

    const getValue = () => {
        const setting = settings.find(s => s.key === key);
        return setting.value || null;
    };

    const getHtml = () => {
        const value = getValue();
        if (!value) return null;

        switch (type) {
            case 'FILE':
                return (<img src={value} className={className}/>);
            case 'TEXT':
                return (<div className={className}> {value} </div>);
            case 'TEXTAREA':
                return (<div className={className}> {value} </div>);
        }
    };

    return (
        <>
            {getHtml()}
        </>
    );

};

const mapStateToProps = ({ baseState }) => ({
    settings: baseState.marketingSettings
});

export default connect(mapStateToProps, {})(MarketingTag)
