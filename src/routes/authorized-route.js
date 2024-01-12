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
import { Route, Redirect } from 'react-router-dom'
import URI from "urijs";
import {BACK_URL} from "../utils/constants";

class AuthorizedRoute extends React.Component {

    getBackUrl = () => {

        const { location, backUrl } = this.props;
        let currentBackUrl = backUrl || location.pathname;

        if(location.search != null){
            currentBackUrl += location.search
        }

        if(location.hash != null){
            currentBackUrl += location.hash
        }

        let url = URI(currentBackUrl);

        if(url.hasQuery(BACK_URL))
            currentBackUrl = url.query(true)[BACK_URL];

        return currentBackUrl;
    };

    render() {
        const { component: Component, isLoggedUser, computedMatch, Fallback, ...rest } = this.props;
        const backUrl = this.getBackUrl();
        const summit_slug = computedMatch.params.summit_slug;
        const redirectTo = {
            pathname: `/app/${summit_slug}?${BACK_URL}=${encodeURIComponent(backUrl)}`,
            state: { from: rest.location }
        };
        const FallbackComponent = (props) => Fallback ? <Fallback {...this.props} {...props} backUrl={backUrl}/> : <Redirect to={redirectTo} />;

        return (
            <Route {...rest} render={props => isLoggedUser ? <Component {...props} /> : FallbackComponent(props)} />
        )
    }
}

export default AuthorizedRoute;


