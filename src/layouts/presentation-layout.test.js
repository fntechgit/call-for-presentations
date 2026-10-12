/**
 * @jest-environment jsdom
 */
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
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider, connect } from 'react-redux';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, act, screen } from '@testing-library/react';
import PresentationLayout from './presentation-layout';
import { SelectionPlanContext } from '../components/SelectionPlanContext';

// render counts of the stubbed pages and forms, keyed by stub name
const mockRenders = {};
const mockStub = (name) => () => {
    mockRenders[name] = (mockRenders[name] || 0) + 1;
    return null;
};

jest.mock('../pages/preview-presentation-page', () => mockStub('preview'));
jest.mock('../pages/thankyou-presentation-page', () => mockStub('thankYou'));
jest.mock('../pages/edit-speaker-page', () => mockStub('speakerPage'));
jest.mock('../components/presentation-summary-form', () => mockStub('summaryForm'));
jest.mock('../components/presentation-nav/index', () => mockStub('nav'));
jest.mock('../components/presentation-tags-form', () => mockStub('tagsForm'));
jest.mock('../components/presentation-uploads-form', () => mockStub('uploadsForm'));
jest.mock('../components/presentation-speakers-form', () => mockStub('speakersForm'));
jest.mock('../components/presentation-review-form', () => mockStub('reviewForm'));
jest.mock('../components/marketing-setting', () => ({ getMarketingValue: () => '' }));
jest.mock('../styles/edit-presentation-page.less', () => ({}));
jest.mock('../actions/presentation-actions', () => ({
    getPresentation: jest.fn(() => () => Promise.resolve()),
    resetPresentation: jest.fn(() => ({ type: 'NOOP' })),
    savePresentation: jest.fn(),
    completePresentation: jest.fn(),
    saveMediaUpload: jest.fn(),
    deleteMediaUpload: jest.fn(),
    setShowInfoPopup: jest.fn(() => ({ type: 'NOOP' })),
    setPresentationType: jest.fn(),
}));
jest.mock('../actions/speaker-actions', () => ({
    getSpeakerPermission: jest.fn(),
    removeSpeakerFromPresentation: jest.fn(),
    removeModeratorFromPresentation: jest.fn(),
    assignModeratorToPresentation: jest.fn(),
    assignSpeakerToPresentation: jest.fn(),
}));
jest.mock('../actions/base-actions', () => ({ loadEventCategory: jest.fn(() => ({ type: 'NOOP' })) }));
jest.mock('../utils/methods', () => ({
    nowBetween: (start, end) => Date.now() > start * 1000 && Date.now() < end * 1000,
    formatEpoch: (epoch) => `epoch:${epoch}`,
}));
jest.mock('openstack-uicore-foundation/lib/utils/methods', () => ({ formatEpoch: (epoch) => `epoch:${epoch}` }));
jest.mock('i18n-react/dist/i18n-react', () => ({ translate: (key) => key }));
jest.mock('sweetalert2', () => ({ fire: jest.fn() }));

const DAY = 86400;
const NOW = Math.floor(Date.now() / 1000);
const BASE_URL = '/presentations/10';

const openPlan = { id: 89, is_enabled: true, submission_begin_date: NOW - DAY, submission_end_date: NOW + DAY };
const lockedPlan = { ...openPlan, is_enabled: false };
// window ended an hour ago, so only the reopen grant on the entity keeps it editable
const closedPlan = { ...openPlan, submission_end_date: NOW - 3600 };

const speaker = { id: 5, member: { id: 7 } };
const entity = { id: 10, selection_plan_id: 89, creator_id: 7, progress: 'SUMMARY', track_id: 0, speakers: [] };
const emptyEntity = { id: 0, progress: 'NEW', track_id: 0, speakers: [] };

const patch = (slice, values) => ({ type: 'PATCH', slice, values });

const reducer = (state, action) => (action.type === 'PATCH'
    ? { ...state, [action.slice]: { ...state[action.slice], ...action.values } }
    : state);

// stands in for primary-layout, which hands the selection plan down as a prop
const Host = connect(({ hostState }) => ({ selectionPlan: hostState.selectionPlan }))(
    ({ selectionPlan, ...props }) => <PresentationLayout {...props} selectionPlan={selectionPlan} />
);

const setup = ({ path, plan = openPlan, presentation = entity, nowUtc = NOW, loading = false }) => {
    const store = createStore(reducer, {
        hostState: { selectionPlan: plan },
        baseState: {
            speaker,
            summit: { id: 1, slug: 'summit', selection_plans: [plan], event_types: [], tracks: [] },
            loading,
            tagGroups: [],
            selectionPlansSettings: {},
        },
        presentationState: { entity: presentation, track: null, errors: {}, showInfoPopup: false },
        clockState: { nowUtc },
    }, applyMiddleware(thunk));
    const history = createMemoryHistory({ initialEntries: [path] });
    const setSelectionPlanCtx = jest.fn();

    render(
        <Provider store={store}>
            <Router history={history}>
                <SelectionPlanContext.Provider value={{ setSelectionPlanCtx }}>
                    <Route path="/presentations/:presentation_id" component={Host} />
                </SelectionPlanContext.Provider>
            </Router>
        </Provider>
    );

    const tick = (count = 1) => {
        for (let i = 1; i <= count; i++) {
            act(() => { store.dispatch(patch('clockState', { nowUtc: store.getState().clockState.nowUtc + 1 })); });
        }
    };

    return { store, history, setSelectionPlanCtx, tick };
};

describe('PresentationLayout edit gate', () => {
    beforeEach(() => {
        Object.keys(mockRenders).forEach((key) => delete mockRenders[key]);
    });

    describe('locked presentation', () => {
        it('goes straight to the preview from the bare URL without mounting the edit page', () => {
            const { history, setSelectionPlanCtx, tick } = setup({ path: BASE_URL, plan: lockedPlan });
            tick(5);

            expect(history.location.pathname).toBe(`${BASE_URL}/preview`);
            expect(mockRenders.preview).toBeGreaterThan(0);
            expect(mockRenders.summaryForm).toBeUndefined();
            expect(setSelectionPlanCtx).not.toHaveBeenCalled();
        });

        it('goes straight to the preview from a step URL without mounting the edit page', () => {
            const { history, setSelectionPlanCtx } = setup({ path: `${BASE_URL}/summary`, plan: lockedPlan });

            expect(history.location.pathname).toBe(`${BASE_URL}/preview`);
            expect(mockRenders.summaryForm).toBeUndefined();
            expect(setSelectionPlanCtx).not.toHaveBeenCalled();
        });

        it('goes to the preview when the entity arrives after the clock has started', () => {
            const { store, history, setSelectionPlanCtx, tick } = setup({ path: BASE_URL, plan: lockedPlan, presentation: emptyEntity });

            act(() => { store.dispatch(patch('presentationState', { entity })); });
            tick(5);

            expect(history.location.pathname).toBe(`${BASE_URL}/preview`);
            expect(mockRenders.summaryForm).toBeUndefined();
            expect(setSelectionPlanCtx).not.toHaveBeenCalled();
        });

        it('keeps the thank-you page gated', () => {
            const { history } = setup({ path: `${BASE_URL}/thank-you`, plan: lockedPlan });

            expect(history.location.pathname).toBe(`${BASE_URL}/preview`);
            expect(mockRenders.thankYou).toBeUndefined();
        });
    });

    describe('clock ticks', () => {
        it('do not re-render the step forms of an editable presentation', () => {
            const { history, tick } = setup({ path: `${BASE_URL}/summary` });
            const rendersBeforeTicks = mockRenders.summaryForm;

            tick(5);

            expect(history.location.pathname).toBe(`${BASE_URL}/summary`);
            expect(rendersBeforeTicks).toBeGreaterThan(0);
            expect(mockRenders.summaryForm).toBe(rendersBeforeTicks);
        });

        it('do not re-render the speaker page', () => {
            const { tick } = setup({ path: `${BASE_URL}/speakers/new` });
            const rendersBeforeTicks = mockRenders.speakerPage;

            tick(5);

            expect(rendersBeforeTicks).toBeGreaterThan(0);
            expect(mockRenders.speakerPage).toBe(rendersBeforeTicks);
        });
    });

    describe('changes that skip a loading cycle', () => {
        it('redirects as soon as the selection plan stops allowing edits', () => {
            const { store, history } = setup({ path: `${BASE_URL}/summary` });

            act(() => { store.dispatch(patch('hostState', { selectionPlan: lockedPlan })); });

            expect(history.location.pathname).toBe(`${BASE_URL}/preview`);
        });

        it('redirects as soon as the entity stops allowing edits', () => {
            const { store, history } = setup({ path: `${BASE_URL}/summary` });

            act(() => { store.dispatch(patch('presentationState', { entity: { ...entity, creator_id: 99 } })); });

            expect(history.location.pathname).toBe(`${BASE_URL}/preview`);
        });

        it('hides the reopen banner as soon as the grant stops being what allows edits', () => {
            const { store, history } = setup({
                path: `${BASE_URL}/summary`,
                plan: closedPlan,
                presentation: { ...entity, submission_reopened_until: NOW + DAY },
            });
            expect(screen.queryByText('edit_presentation.submission_reopened')).not.toBeNull();

            // the plan window is extended past now, so edits are allowed by the window itself
            act(() => { store.dispatch(patch('hostState', { selectionPlan: openPlan })); });

            expect(screen.queryByText('edit_presentation.submission_reopened')).toBeNull();
            expect(history.location.pathname).toBe(`${BASE_URL}/summary`);
        });
    });
});
