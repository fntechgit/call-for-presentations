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

jest.mock('../history', () => ({ push: jest.fn() }));
jest.mock('openstack-uicore-foundation/lib/security/actions', () => ({ LOGOUT_USER: 'LOGOUT_USER' }));

import presentationsReducer from './presentations-reducer';
import {PRESENTATIONS_RECEIVED} from '../actions/presentations-actions';
import {RECEIVE_ALLOWED_SELECTION_PLANS, RECEIVE_SUMMIT} from '../actions/base-actions';

const presentation = (id, selectionPlanId, typeId = 1) => ({id, selection_plan_id: selectionPlanId, type: {id: typeId}});

const buildState = (summitDocs = []) => {
    let state = presentationsReducer(undefined, {type: RECEIVE_SUMMIT, payload: {response: {summit_documents: summitDocs}}});
    return presentationsReducer(state, {
        type: RECEIVE_ALLOWED_SELECTION_PLANS,
        payload: {response: {data: [{id: 1}, {id: 2}]}}
    });
};

const receive = (state, {created = [], speaker = [], moderator = []}) =>
    presentationsReducer(state, {type: PRESENTATIONS_RECEIVED, payload: {created, speaker, moderator}});

const collectionFor = (state, selectionPlanId) =>
    state.collections.find(col => col.selectionPlan.id === selectionPlanId);

describe('presentationsReducer PRESENTATIONS_RECEIVED', () => {
    it('groups each role by selection plan', () => {
        const state = receive(buildState(), {
            created: [presentation(10, 1), presentation(11, 2)],
            speaker: [presentation(20, 2)],
            moderator: [presentation(30, 1)],
        });

        const plan1 = collectionFor(state, 1);
        const plan2 = collectionFor(state, 2);
        expect(plan1.presentationsCreated.map(p => p.id)).toEqual([10]);
        expect(plan1.presentationsSpeaker).toEqual([]);
        expect(plan1.presentationsModerator.map(p => p.id)).toEqual([30]);
        expect(plan2.presentationsCreated.map(p => p.id)).toEqual([11]);
        expect(plan2.presentationsSpeaker.map(p => p.id)).toEqual([20]);
        expect(plan2.presentationsModerator).toEqual([]);
    });

    it('drops presentations of plans that have no collection or no plan at all', () => {
        const state = receive(buildState(), {
            created: [presentation(10, 3)],
            speaker: [presentation(20, null)],
        });

        state.collections.forEach(col => {
            expect(col.presentationsCreated).toEqual([]);
            expect(col.presentationsSpeaker).toEqual([]);
        });
    });

    it('does not list a created presentation again as speaker or moderator', () => {
        const state = receive(buildState(), {
            created: [presentation(10, 1)],
            speaker: [presentation(10, 1)],
            moderator: [presentation(10, 1)],
        });

        const plan1 = collectionFor(state, 1);
        expect(plan1.presentationsCreated.map(p => p.id)).toEqual([10]);
        expect(plan1.presentationsSpeaker).toEqual([]);
        expect(plan1.presentationsModerator).toEqual([]);
    });

    it('keeps the summit docs of each plan that match its presentation types', () => {
        const docs = [
            {id: 100, selection_plan_id: 1, show_always: false, event_types: [7]},
            {id: 101, selection_plan_id: 1, show_always: false, event_types: [8]},
            {id: 102, selection_plan_id: 2, show_always: true, event_types: []},
        ];
        const state = receive(buildState(docs), {created: [presentation(10, 1, 7)]});

        expect(collectionFor(state, 1).summitDocs.map(d => d.id)).toEqual([100]);
        expect(collectionFor(state, 1).allPresentationTypes).toEqual([7]);
        expect(collectionFor(state, 2).summitDocs.map(d => d.id)).toEqual([102]);
    });
});
