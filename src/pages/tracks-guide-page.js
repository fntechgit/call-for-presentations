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
import {RawHTML} from 'openstack-uicore-foundation/lib/components'
import {connect} from "react-redux";

const TracksGuidePage = ({summit}) => {


  return (
    <div className="page-wrap" id="selection-process-page">
      <h1>{T.translate("tracks_guide.title", {summit: summit.name})}</h1>
      <h3>{summit.name}</h3>
      <p>{T.translate("tracks_guide.the_summit_desc", {summit: summit.name})}</p>
      <p>
        <strong> {T.translate("tracks_guide.forum")} </strong><br/>
        <RawHTML>{T.translate("tracks_guide.forum_desc")}</RawHTML>
      </p>
      <p>
        <strong> {T.translate("tracks_guide.new_contributor")} </strong><br/>
        <RawHTML>{T.translate("tracks_guide.new_contributor_desc", {summit: summit.name})}</RawHTML>
      </p>
      <p>
        <strong> {T.translate("tracks_guide.gerrit")} </strong><br/>
        <RawHTML>{T.translate("tracks_guide.gerrit_desc")}</RawHTML>
      </p>
      <p>
        <strong> {T.translate("tracks_guide.5g")} </strong><br/>
        {T.translate("tracks_guide.5g_desc")}
      </p>

      <p>
        <strong> {T.translate("tracks_guide.ai")} </strong><br/>
        {T.translate("tracks_guide.ai_desc")}
      </p>

      <p>
        <strong> {T.translate("tracks_guide.scientific")} </strong><br/>
        {T.translate("tracks_guide.scientific_desc")}
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
        <strong> {T.translate("tracks_guide.private_cloud")} </strong><br/>
        {T.translate("tracks_guide.private_cloud_desc")}
      </p>

      <p>
        <strong> {T.translate("tracks_guide.hybrid_cloud")} </strong><br/>
        {T.translate("tracks_guide.hybrid_cloud_desc")}
      </p>

      <p>
        <strong> {T.translate("tracks_guide.digital_sovereign")} </strong><br/>
        {T.translate("tracks_guide.digital_sovereign_desc")}
      </p>

      <p>
        <strong> {T.translate("tracks_guide.security")} </strong><br/>
        {T.translate("tracks_guide.security_desc")}
      </p>
    </div>
  );
}

const mapStateToProps = ({baseState}) => ({
  summit: baseState.summit,
});

export default connect(
  mapStateToProps,
  {}
)(TracksGuidePage);

