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

export default class SelectionProcessPage extends React.Component {

    render() {

        return (
            <div className="page-wrap" id="selection-process-page">
                <h1>About The Summit Submission and Selection Process</h1>
                <p>
                    On average, the OpenStack Foundation receives more than 1,000 submissions for the Summit. Of
                    those, we are only able to select 25-30% for participation. To decide which talks are accepted,
                    we rely on a Programming Committee as well as a community voting process that will open in July
                    2018.
                </p>
                <p>
                    The Summit is organized around Tracks, which are focused on specific open infrastructure problem
                    domains, including Edge Computing, CI/CD, and Private &amp; Hybrid Cloud. Presentations for each
                    Track are determined by a Program Committee for each Track. The Foundation selects the Program
                    Committee members from a list of people nominated by the community. The Foundation strives to
                    recruit Programming Committee members from a diverse set of companies, open source communities,
                    regions and roles across communities (i.e., contributing developers, users and business
                    leaders). To nominate someone for the Summit Programming Committee for a specific Track, please
                    fill out the
                    <a href="https://openstackfoundation.formstack.com/forms/openstackberlin2018_programmingcommitteenom">
                        nomination form
                    </a>.
                </p>
                <p>
                    The Foundation will also extend invitations directly to a small number of highly regarded
                    speakers from past events for each Track, and we expect this content to make up less than 15% of
                    total Summit presentations.
                </p>
                <p>
                    Once the Call for Presentations has concluded on July 17, 2018 at 11:59pm PT, all submissions
                    will be made available for community vote and input. After community voting closes, Programming
                    Committee members will receive their presentations to review and will determine the final
                    selections for their respective Tracks. Community votes are meant to help inform the decision,
                    but are not the only guide. Programming Committee members are expected to exercise judgment in
                    their area of expertise and help ensure diversity of sessions and speakers. Real-world user
                    stories and technical, in-the-trenches experiences are favored over sales pitches.
                </p>
                <p>
                    After the Programming Committee makes their decisions, speakers will be informed August 13, 2018.
                    If you are selected as a speaker (or alternate speaker), you will receive a free code to
                    register for the Berlin Summit, as well as a set of deadlines and deliverables leading up to the
                    event.
                </p>
                <p>
                    If a speaker is selected as an Alternate, we will also ask them to prepare a Lightning Talk. This
                    is in an effort to ensure that Alternates are onsite in the event they are needed, as well as
                    program high quality Lightning Talks, which are very popular at the Summits.
                </p>
                <hr/>
                <p>
                    Please note that this process covers the speaking sessions during the Summit, NOT the Forum
                    sessions. You can more about that process on the
                    <a href="https://wiki.openstack.org/wiki/Forum" target="_blank">OpenStack Wiki</a>.
                </p>
                <p>
                    Want to provide feedback on this process? Join the discussion on the
                    <a href="http://lists.openstack.org/cgi-bin/mailman/listinfo/community" target="_blank">
                        openstack-community mailing list
                    </a>
                    , and/or contact the Foundation Summit Team directly
                    <a href="mailto:summit@openstack.org">summit@openstack.org</a>.
                </p>
            </div>
        );
    }
}
