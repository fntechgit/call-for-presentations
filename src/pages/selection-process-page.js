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
import { RawHTML } from 'openstack-uicore-foundation/lib/components'

export default class SelectionProcessPage extends React.Component {

    render() {

        return (
            <div className="page-wrap" id="selection-process-page">
                <h1>{T.translate("selection_process.about_title")}</h1>
                <p>
                    {T.translate("selection_process.paragraph_1")}
                </p>
                <p>
                    {T.translate("selection_process.paragraph_2")}
                    <a href="https://openstackfoundation.formstack.com/forms/openstackberlin2018_programmingcommitteenom">
                        {T.translate("selection_process.nomination_form")}
                    </a>.
                </p>
                <p>
                    {T.translate("selection_process.paragraph_3")}
                </p>
                <p>
                    {T.translate("selection_process.paragraph_4")}
                </p>
                <p>
                    {T.translate("selection_process.paragraph_5")}
                </p>
                <hr/>
                <p>
                    {T.translate("selection_process.paragraph_6")}
                    <a href="https://wiki.openstack.org/wiki/Forum" target="_blank">
                        {T.translate("selection_process.openstack_wiki")}
                    </a>.
                </p>
                <p>
                    {T.translate("selection_process.provide_feedback")}
                    <a href="http://lists.openstack.org/cgi-bin/mailman/listinfo/community" target="_blank">
                        {T.translate("selection_process.mailing_list")}
                    </a>
                    <RawHTML>
                        {T.translate("selection_process.contact", {email: '<a href="mailto:summit@openstack.org">summit@openstack.org</a>'})}
                    </RawHTML>
                </p>
            </div>
        );
    }
}
