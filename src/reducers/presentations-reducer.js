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

import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/security/actions';
import {
  CREATED_RECEIVED,
  SPEAKER_RECEIVED,
  MODERATOR_RECEIVED,
  REGROUP_PRESENTATIONS
} from '../actions/presentations-actions';
import {PRESENTATION_ADDED, PRESENTATION_DELETED} from '../actions/presentation-actions'
import {CLEAR_SUMMIT, RECEIVE_ALLOWED_SELECTION_PLANS, RECEIVE_SUMMIT} from "../actions/base-actions";

const DEFAULT_STATE = {
  allSummitDocs: [],
  collections: [],
  speaker: null,
};

const presentationsReducer = (state = DEFAULT_STATE, action) => {
  const {type, payload} = action;
  switch (type) {
    case LOGOUT_USER: {
      return DEFAULT_STATE;
    }
    case CLEAR_SUMMIT: {
      return DEFAULT_STATE;
    }
    case RECEIVE_SUMMIT: {
      const {response: summit} = payload;
      const allSummitDocs = summit.summit_documents;
      return ({...state, allSummitDocs});
    }
    case RECEIVE_ALLOWED_SELECTION_PLANS: {
      const {data} = payload.response;
      const collections = data.map(sp => {
        return ({
          selectionPlan: sp,
          presentationsCreated: [],
          presentationsSpeaker: [],
          presentationsModerator: [],
          summitDocs: [],
          allPresentationTypes: []
        })
      })
      return ({...state, collections});
    }
    case CREATED_RECEIVED: {
      const {collections} = state;
      const {response, selectionPlanId} = payload;
      const presentations = response.data;
      const stateData = collections.find(col => col.selectionPlan.id === selectionPlanId);
      stateData.presentationsCreated = presentations;

      return {...state, collections};
    }
    case SPEAKER_RECEIVED: {
      const {collections} = state;
      const {response, selectionPlanId} = payload;
      const presentations = response.data;
      const stateData = collections.find(col => col.selectionPlan.id === selectionPlanId);
      const createdIds = stateData.presentationsCreated.map(pc => pc.id);
      stateData.presentationsSpeaker = presentations.filter(p => !createdIds.includes(p.id));

      return {...state, collections};
    }
    case MODERATOR_RECEIVED: {
      const {collections} = state;
      const {response, selectionPlanId} = payload;
      const presentations = response.data;
      const stateData = collections.find(col => col.selectionPlan.id === selectionPlanId);
      const createdIds = stateData.presentationsCreated.map(pc => pc.id);
      stateData.presentationsModerator = presentations.filter(p => !createdIds.includes(p.id));

      return {...state, collections};
    }
    case PRESENTATION_DELETED: {
      const {presentationId, selectionPlanId} = payload;
      const {collections, allSummitDocs} = state;
      const collectionsCopy = [...collections]
      const stateData = collectionsCopy.find(col => col.selectionPlan.id === selectionPlanId);

      stateData.presentationsCreated = stateData.presentationsCreated.filter(p => p.id !== presentationId);
      stateData.presentationsSpeaker = stateData.presentationsSpeaker.filter(p => p.id !== presentationId);
      stateData.presentationsModerator = stateData.presentationsModerator.filter(p => p.id !== presentationId);

      const allPresentationTypes = getAllTypes(stateData);

      stateData.summitDocs = getSummitDocs(selectionPlanId, allPresentationTypes, allSummitDocs);
      stateData.allPresentationTypes = allPresentationTypes;


      return {...state, collections: collectionsCopy};
    }
    case PRESENTATION_ADDED: {
      const {collections, allSummitDocs} = state;
      const collectionsCopy = [...collections]
      const entity = payload.response;
      const stateData = collectionsCopy.find(col => col.selectionPlan.id === entity.selection_plan_id);

      if (!stateData.allPresentationTypes.includes(entity.type.id)) {
        stateData.allPresentationTypes.push(entity.type.id);
        stateData.summitDocs = getSummitDocs(entity.selection_plan_id, stateData.allPresentationTypes, allSummitDocs);
      }

      return {...state, collections: collectionsCopy};
    }
    case REGROUP_PRESENTATIONS: {
      const {collections, allSummitDocs} = state;
      const collectionsCopy = [...collections]
      const {selectionPlanId} = payload;
      const stateData = collectionsCopy.find(col => col.selectionPlan.id === selectionPlanId);

      const allPresentationTypes = getAllTypes(stateData);

      stateData.summitDocs = getSummitDocs(selectionPlanId, allPresentationTypes, allSummitDocs);
      stateData.allPresentationTypes = allPresentationTypes;

      return {...state, collections: collectionsCopy};
    }
    default:
      return state;
  }

};

const getSummitDocs = (selectionPlanId, allTypes, allSummitDocs) => {
  return allSummitDocs.filter(doc => {
    const allowedType = doc.show_always || doc.event_types.some(r => allTypes.includes(r));
    const allowedSelectionPlan = doc.selection_plan_id === selectionPlanId;

    return allowedSelectionPlan && allowedType;
  });
};

const getAllTypes = (data, allTypes = []) => {
  allTypes = data.presentationsCreated.reduce((res, item) => [...res, item.type.id], allTypes);
  allTypes = data.presentationsSpeaker.reduce((res, item) => [...res, item.type.id], allTypes);
  allTypes = data.presentationsModerator.reduce((res, item) => [...res, item.type.id], allTypes);

  // remove duplicates
  allTypes = [...new Set(allTypes)];

  return allTypes;
}

export default presentationsReducer
