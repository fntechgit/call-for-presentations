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
import T from 'i18n-react/dist/i18n-react';
import moment from 'moment-timezone';
import { formatEpoch } from 'openstack-uicore-foundation/lib/utils/methods';

// owns the clock subscription so a tick re-renders only this banner, not the step forms
export const PresentationReopenedBanner = ({ presentation, nowUtc }) => {
    // asks the model rather than re-deriving the condition, so the banner cannot announce a
    // deadline that canEdit() does not actually gate on
    const reopenedUntil = presentation.getReopenedUntil(nowUtc);

    if (!reopenedUntil) return null;

    return (
        <div className="alert alert-warning">
            {T.translate("edit_presentation.submission_reopened", {
                end_date: formatEpoch(reopenedUntil, "MMMM DD, YYYY h:mm a"),
                when: moment.tz.guess(),
            })}
        </div>
    );
};

const mapStateToProps = ({ clockState }) => ({
    nowUtc: clockState.nowUtc,
});

export default connect(mapStateToProps)(PresentationReopenedBanner);
