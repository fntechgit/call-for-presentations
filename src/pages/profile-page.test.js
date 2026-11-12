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
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { render, act } from "@testing-library/react";
import ProfilePage from "./profile-page";
import { saveSpeakerProfile } from "../actions/speaker-actions";

// the SpeakerForm props from the latest render, so the test can submit the form
let mockFormProps;

jest.mock("i18n-react/dist/i18n-react", () => ({ translate: (key) => key }));
jest.mock("sweetalert2", () => ({ fire: jest.fn() }));
jest.mock("../styles/profile-page.less", () => ({}));
jest.mock("../components/speaker-form", () => (props) => {
  mockFormProps = props;
  return null;
});
jest.mock("../actions/speaker-actions", () => ({
  saveSpeakerProfile: jest.fn(() => ({ type: "NOOP" })),
  getOrganizationalRoles: jest.fn(() => ({ type: "NOOP" }))
}));
jest.mock("../actions/auth-actions", () => ({
  getSpeakerInfo: jest.fn(() => () => Promise.resolve())
}));

const SELECTION_PLAN_ID = 79;

const renderPage = async () => {
  const store = createStore(
    () => ({
      baseState: {
        speaker: { id: 1 },
        loading: false,
        selectionPlansSettings: {}
      },
      loggedUserState: { member: { id: 1 } },
      profileState: { entity: { id: 1 }, errors: {}, orgRoles: [{ id: 1 }] }
    }),
    applyMiddleware(thunk)
  );

  await act(async () => {
    render(
      <Provider store={store}>
        <ProfilePage selectionPlanId={SELECTION_PLAN_ID} history={{}} />
      </Provider>
    );
  });
};

describe("ProfilePage save", () => {
  it("saves the profile with the selection plan from the route, so the redirect returns to it", async () => {
    await renderPage();
    const entity = { id: 1, first_name: "Ada" };

    act(() => mockFormProps.onSubmit(entity));

    expect(saveSpeakerProfile).toHaveBeenCalledWith(entity, SELECTION_PLAN_ID);
  });
});
