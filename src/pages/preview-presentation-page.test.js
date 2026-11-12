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
 * */

import React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { render, screen, fireEvent } from "@testing-library/react";
import PreviewPresentationPage from "./preview-presentation-page";
import { SP_LANDING } from "../utils/constants";

jest.mock("i18n-react/dist/i18n-react", () => ({ translate: (key) => key }));
jest.mock(
  "openstack-uicore-foundation/lib/components/raw-html",
  () => () => null
);
jest.mock("../styles/preview-presentation-page.less", () => ({}));
jest.mock("../actions/base-actions", () => ({
  loadEventCategory: jest.fn(() => ({ type: "NOOP" }))
}));

const CURRENT_PLAN_ID = 79;
const STALE_LANDING_PLAN_ID = 81;

const summit = {
  slug: "summit-slug",
  selection_plans: [{ id: CURRENT_PLAN_ID }, { id: STALE_LANDING_PLAN_ID }]
};

const renderPage = () => {
  const store = createStore(() => ({
    baseState: { summit, loading: false, selectionPlansSettings: {} },
    presentationState: {
      entity: { title: "Talk", media_uploads: [], speakers: [] },
      track: null
    }
  }));
  const history = { push: jest.fn() };

  render(
    <Provider store={store}>
      <PreviewPresentationPage
        history={history}
        selectionPlan={{
          id: CURRENT_PLAN_ID,
          allowed_presentation_questions: []
        }}
      />
    </Provider>
  );

  return history;
};

afterEach(() => localStorage.clear());

describe("PreviewPresentationPage Done button", () => {
  it("returns to submissions for the current selection plan, not the stale landing plan", () => {
    localStorage.setItem(SP_LANDING, String(STALE_LANDING_PLAN_ID));
    const history = renderPage();

    fireEvent.click(screen.getByText("general.done"));

    expect(history.push).toHaveBeenCalledWith(
      `/app/summit-slug/all-plans/${CURRENT_PLAN_ID}`
    );
  });
});
