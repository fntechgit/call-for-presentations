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

// owns the clock subscription; a sibling of the routes, since a connected wrapper would re-render them every tick
export const PresentationEditGate = ({ presentation, isNew, presentationId, entityId, pathname, previewUrl, nowUtc }) => {
    // nowUtc is null until the first Clock tick. Evaluating the gate against a seed would
    // let a fast device clock read a live grant as expired, and this redirect is one-way:
    // the guard below skips it once already on /preview, so a corrected tick never undoes it.
    if (!isNew && nowUtc != null && presentationId == entityId && !presentation.canEdit(nowUtc) && !pathname.endsWith('preview')) {
        return <Redirect to={previewUrl} />;
    }

    return null;
};

const mapStateToProps = ({ clockState }) => ({
    nowUtc: clockState.nowUtc,
});

export default connect(mapStateToProps)(PresentationEditGate);
