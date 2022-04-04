import React, {useEffect} from "react";
import { connect } from "react-redux";
import {compose} from "redux";

const componentWrapper = (WrappedComponent) => ({marketingSettings,...props}) => {

    // on first load we load schedules data, always
    useEffect(() => {
        if(marketingSettings?.length > 0)
        {
            // set color vars
            if (typeof document !== 'undefined') {
                marketingSettings.forEach(setting => {
                    if (getComputedStyle(document.documentElement).getPropertyValue(`--${setting.key}`)) {
                        document.documentElement.style.setProperty(`--${setting.key}`, setting.value);
                        document.documentElement.style.setProperty(`--${setting.key}50`, `${setting.value}50`);
                    }
                });
            }
        }
    }, [marketingSettings?.length]);
    return <WrappedComponent {...props}/>;
};

const mapStateToProps = ({
                             baseState,
                         }) => ({
    marketingSettings: baseState.marketingSettings,

});

const reduxConnection = connect(mapStateToProps, {});

const withMarketingSettings = compose(reduxConnection, componentWrapper);

export default withMarketingSettings;