import React, {useContext} from 'react';
import LanguageSelect from "./language-select";
import AuthButton from "./auth-button";
import {connect} from "react-redux";
import T from "i18n-react";
import {formatEpoch} from "openstack-uicore-foundation/lib/utils/methods";
import moment from "moment-timezone";
import {getMarketingValue} from "./marketing-setting";
import {nowBetween} from "../utils/methods";

const Header = ({isLoggedUser, summit, language, profilePic, initLogOut, waitForApi, loading, selectionPlan}) => {
    let header_title = "";
    let header_subtitle = "";
    let summit_logo = summit?.logo ? summit.logo : window.LOGO_URL;
    const mkt_header_title = getMarketingValue("spkmgmt_header_title");
    const mkt_header_logo = getMarketingValue("spkmgmt_header_logo");
    const submissionIsClosed = !nowBetween(selectionPlan?.submission_begin_date, selectionPlan?.submission_end_date);
    const logoLink = summit ? `/app/${summit.slug}/all-plans` : '/app';

    const onClickLogout = () => {
        if (typeof window !== "undefined" && summit) {
            window.localStorage.setItem("summit_slug", summit.slug);
        }
        initLogOut();
    }

    if (window.APP_CLIENT_NAME === "openstack")
        header_title = T.translate("landing.call_for_presentations");

    if (selectionPlan) {
        const end_date = formatEpoch( selectionPlan.submission_end_date, "MMMM DD, YYYY h:mm a");

        if (header_title !== "") header_title += ": ";
        header_title += `${selectionPlan.name} ${summit.name}`;


        if (submissionIsClosed) {
            header_subtitle = T.translate("landing.closed");
        } else {
            header_subtitle = T.translate("landing.subtitle", {
                end_date: end_date,
                when: moment.tz.guess(),
            });
        }
    } else if (summit) {
        if (header_title !== "") header_title += ": ";
        header_title += `${summit.name}`;
    }

    header_title = mkt_header_title ? mkt_header_title : header_title;
    summit_logo = mkt_header_logo ? mkt_header_logo : summit_logo;

    if (waitForApi && loading) return <div className="header" />;

    return (
        <div className="header">
            <div className="header-title row">
                <div className="col-md-3 col-xs-6 text-left">
                    <a href={logoLink}>
                        <img alt="logo" className="header-logo" src={summit_logo} />
                    </a>
                </div>
                <div className="col-md-3 col-md-push-6 col-xs-6">
                    {window.SHOW_LANGUAGE_SELECTION && (
                        <LanguageSelect language={language} />
                    )}
                    <AuthButton
                        isLoggedUser={isLoggedUser}
                        picture={profilePic}
                        initLogOut={onClickLogout}
                    />
                </div>
                <div className="col-md-6 col-md-pull-3 col-xs-12 title">
                    <span>{header_title}</span>
                    <br />
                    <span className="subtitle"> {header_subtitle} </span>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({loggedUserState, baseState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    loading: baseState.loading,
    summit: baseState.summit,
});

export default connect(mapStateToProps)(Header);
