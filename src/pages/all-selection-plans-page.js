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
import {connect} from 'react-redux';
import SelectionPlanSection from "../components/selection-plan-section";

const AllSelectionPlansPage = ({summit, loggedSpeaker, history, loading}) => {

  const getAvailablePlans = () => {
    return summit.selection_plans.filter(sp => sp.is_enabled);
  };

  if (summit == null || loggedSpeaker == null) return null;

  if (!loggedSpeaker) {
    history.push(`/app/profile`);
    return;
  }

  const plansToShow = getAvailablePlans();

  return (
    <div>
      {plansToShow.map(sp => <SelectionPlanSection key={`selection-plan-section-${sp.id}`} selectionPlan={sp} />)}
    </div>
  );
};

const mapStateToProps = ({baseState}) => ({
  summit: baseState.summit,
  loggedSpeaker: baseState.speaker,
  loading: baseState.loading,
});

export default connect(mapStateToProps)(AllSelectionPlansPage);
