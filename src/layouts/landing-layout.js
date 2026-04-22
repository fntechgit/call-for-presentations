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

import React, { Suspense } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom';
import URI from "urijs";
import AjaxLoader from "openstack-uicore-foundation/lib/components/ajaxloader";
import { BACK_URL } from "../utils/constants";

const LandingPage = React.lazy(() =>
  import("../pages/landing-page")
);

const LandingLayout = ({ match, ...parentProps }) => {
  const summitSlug = match.params.summit_slug;
  let url = URI(window.location.href);
  let currentBackUrl = null
  if (url.hasQuery(BACK_URL))
    currentBackUrl = url.query(true)[BACK_URL];

  if (currentBackUrl) {
    return (
      <Route render={props => {
        return <Redirect to={currentBackUrl} />
      }} />
    )
  }

  return (
    <Suspense fallback={<AjaxLoader show relative size={120} />}>
      <Switch>
        <Route
          strict
          exact
          path={`${match.url}/all-plans/:selection_plan_id`}
          render={props => (<LandingPage summitSlug={summitSlug} {...parentProps} {...props} />)}
        />
        <Route
          path={match.url}
          render={props => (<LandingPage summitSlug={summitSlug} {...parentProps} {...props} />)}
        />
      </Switch>
    </Suspense>
  );

}

export default LandingLayout;
