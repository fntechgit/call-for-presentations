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

import React from 'react';
import T from 'i18n-react/dist/i18n-react';

export default class TracksGuidePage extends React.Component {

  render() {

    return (
      <div className="page-wrap" id="selection-process-page">
        <h1>{T.translate("tracks_guide.title")}</h1>
        <h3>{T.translate("tracks_guide.the_summit")}</h3>
        <p>{T.translate("tracks_guide.the_summit_desc")}</p>

        <p>
          <strong> {T.translate("tracks_guide.5g")} </strong><br/>
          {T.translate("tracks_guide.5g_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.ai")} </strong><br/>
          {T.translate("tracks_guide.ai_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.ci_cd")} </strong><br/>
          {T.translate("tracks_guide.ci_cd_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.container_infra")} </strong><br/>
          {T.translate("tracks_guide.container_infra_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.getting_started")} </strong><br/>
          {T.translate("tracks_guide.getting_started_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.hands_on")} </strong><br/>
          {T.translate("tracks_guide.hands_on_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.hardware_enablement")} </strong><br/>
          {T.translate("tracks_guide.hardware_enablement_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.open_dev")} </strong><br/>
          {T.translate("tracks_guide.open_dev_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.private_cloud")} </strong><br/>
          {T.translate("tracks_guide.private_cloud_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.public_cloud")} </strong><br/>
          {T.translate("tracks_guide.public_cloud_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.security")} </strong><br/>
          {T.translate("tracks_guide.security_desc")}
        </p>
        <hr />
        <h3>{T.translate("tracks_guide.forum_discussions")}</h3>
        <p>
          <strong> {T.translate("tracks_guide.forum")} </strong><br/>
          {T.translate("tracks_guide.forum_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.project_onboarding")} </strong><br/>
          {T.translate("tracks_guide.project_onboarding_desc")}
        </p>

        <p>
          <strong> {T.translate("tracks_guide.working_groups")} </strong><br/>
          {T.translate("tracks_guide.working_groups_desc")}
        </p>
      </div>
    );
  }
}
