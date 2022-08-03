/**
 * Copyright 2022 OpenStack Foundation
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
import { Clock }  from "openstack-uicore-foundation/lib/components";
import { updateClock } from '../actions/clock-actions';
import { connect } from 'react-redux';

const ClockComponent = ({
                            active,
                            summit,
                            updateClock
                        }) => {
    return (
        <div>
            {active && summit &&
            <Clock onTick={(timestamp) => updateClock(timestamp)} timezone={summit.time_zone_id} />
            }
        </div>
    );
}

export default connect(null, { updateClock })(ClockComponent);