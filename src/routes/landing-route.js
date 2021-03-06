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
import React from 'react'
import {Redirect, Route} from 'react-router-dom'

class LandingRoute extends React.Component {

    render() {

        const { location, component: Component, isLoggedUser, doLogin, ...rest } = this.props;
        let summit_slug = this.props.computedMatch.params.summit_slug;
        return (

            <Route {...rest} render={props => {
                return isLoggedUser ? <Redirect
                    to={{
                        pathname: `/app/${summit_slug}/presentations`,
                        state: { from: location }
                    }}
                />:
                 <Component doLogin={doLogin} {...props} />
            }} />
        )
    }
}

export default LandingRoute;
