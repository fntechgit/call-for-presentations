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
                <h1>Summit Tracks</h1>
                <h3>The Summit</h3>
                <p>
                    The OpenStack Summit is a four-day event covering everything Open Infrastructure.
                    Content includes keynotes, presentations, panels, hands-on workshops, and
                    collaborative working sessions. Expect to hear about the intersection of many open
                    source infrastructure projects, including Ansible, Ceph, Kata Containers,
                    Kubernetes, ONAP, OpenStack and more.
                </p>

                <p>
                    <strong> CI/CD </strong><br/>
                    Topics include: Software development pipeline, automated testing, QA,
                    culture &amp; process, policies &amp; compliance, CI/CD ecosystem, repository
                    architecture, unit vs integration testing, deployment maturity model, gitops
                </p>

                <p>
                    <strong> Container Infrastructure </strong><br/>
                    Topics include: Running containers at scale, container ecosystem, container
                    networking, container storage, container security, hybrid VM &amp; container
                    architectures, containers &amp; bare metal
                </p>

                <p>
                    <strong> Edge Computing </strong><br/>
                    Topics include: 5G, cloudlet, distributed computing, Mesh, security, networking,
                    architecture, ease of deployment, edge ecosystem, hardware performance accelerators
                    (e.g. GPUs, ASICs, etc.), hardware profile, IoT, low end-to-end latency, management
                    tools, scaling, edge-enabled applications, physical hardening, QoS, remote/extreme
                    environments, remote troubleshooting, standalone cloudlets, tamper evidence, tamper
                    resistance, VM and container handoff across WAN connections, zero-touch provisioning
                </p>

                <p>
                    <strong> Hands-On Workshops </strong><br/>
                    Hands-on Workshops offer a window into training for operators and application
                    developers across different projects. Sessions are typically 90 minutes and require
                    an RSVP and some prep work. Bring your laptop and walk away with the skills you need
                    to become an open source contributor.
                </p>

                <p>
                    <strong> HPC / GPU / AI </strong><br/>
                    Topics include: AI, computation, cluster, economics, exascale, government, GPUs,
                    grid, HPC, HTC, machine learning, New applications for AI running on OpenStack
                    clouds, Novel/Emerging architectures for GPUs/AI, operations at scale, performance,
                    scientific research,<br/>
                    <br/>

                </p>

                <p>
                    <strong> Open Source Community </strong><br/>
                    Topics include: community management, diversity and inclusion, mentoring, open
                    source governance, ambassadors, roadmap development
                </p>

                <p>
                    <strong> Private &amp; Hybrid Cloud </strong><br/>
                    Topics include: architecture, bare metal, economics, hardware, operations,
                    orchestration &amp; hybrid cloud tools, networking, organizational
                    culture &amp; processes, security &amp; compliance, SLAs, storage, upgrades, user
                    experience, vendor selection
                </p>

                <p>
                    <strong> Public Cloud </strong><br/>
                    Topics include: architecture / hardware, economics, cloud portability,
                    features &amp; needs, federation, hardware, operations / upgrades, multi-tenance,
                    networking, performance, scale, security &amp; compliance, SLAs, storage, open
                    source platforms, tools &amp; SDKs, UI / UX, upgrades, user experience
                </p>

                <p>
                    <strong> Telecom &amp; NFV </strong><br/>
                    Topics include: 5G, architecture, NFV, economics, hardware, operations, performance,
                    QoS, SDN, SLAs, standardization e.g. ETSI NFV
                </p>

                <hr/>

                <h3>The Forum</h3>
                <p>
                    OpenStack users and developers gather at the Forum to brainstorm the requirements for
                    the next release, gather feedback on the past version and have strategic discussions
                    that go beyond just one release cycle. Sessions are submitted outside of the Summit
                    Call for Presentations and are more collaborative, discussion-oriented.
                </p>
            </div>
        );
    }
}
