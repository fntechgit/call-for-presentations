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
                    <a href="https://openinfrafoundation.formstack.com/forms/programmingcommittee2022">
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
                </p>
                <p>
                    {T.translate("selection_process.provide_feedback")}
                    <a href="https://lists.openinfra.dev/cgi-bin/mailman/listinfo/foundation" target="_blank">
                        {T.translate("selection_process.mailing_list")}
                    </a>
                    <RawHTML>
                        {T.translate("selection_process.contact", {email: '<a href="mailto:summit@openinfra.dev">summit@openinfra.dev</a>'})}
                    </RawHTML>
                </p>
            </div>
        );
    }
}
