/**
 * Copyright 2026 OpenStack Foundation
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
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

// locked is derived in mapStateToProps: a react-redux 5 connect is a legacy context provider, so any gate render re-renders the routes
export const PresentationEditGate = ({ locked, redirectUrl, children }) => {
    if (locked) return <Redirect to={redirectUrl} />;

    return children;
};

// An existing presentation waits for the first Clock tick: nowUtc is null until then, evaluating
// against a seed would let a fast device clock read a live grant as expired, and this redirect is
// one-way: the gate isn't mounted on /preview, so a corrected tick never undoes it. canCreate is
// on the local clock, so /new is gated from the first render; nowUtc still re-runs it every tick.
export const mapStateToProps = ({ clockState }, { presentation, isNew, presentationId, entityId }) => ({
    locked: isNew
        ? !presentation.canCreate()
        : clockState.nowUtc != null && presentationId == entityId && !presentation.canEdit(clockState.nowUtc),
});

export default connect(mapStateToProps)(PresentationEditGate);
