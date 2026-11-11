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
 * */

import { getMarketingValue } from "./marketing-setting";

const mockState = { baseState: { marketingSettings: null } };
jest.mock("../store", () => ({ getState: () => mockState }));

const setting = (key, value) => ({ key, value, type: "TEXT" });

describe("getMarketingValue", () => {
  const originalWindow = global.window;
  const visit = (path) => {
    global.window = { location: { href: `https://cfp.example${path}` } };
  };

  beforeEach(() => {
    mockState.baseState.marketingSettings = {
      0: [
        setting("spkmgmt_disclaimer", "summit disclaimer"),
        setting("CFP_HIDE_MY_BIO", "summit")
      ],
      5: [setting("spkmgmt_disclaimer", "plan disclaimer")]
    };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("uses the plan value on a hyphenated summit slug", () => {
    visit("/app/my-summit/all-plans/5/presentations/10/summary");

    expect(getMarketingValue("spkmgmt_disclaimer")).toBe("plan disclaimer");
  });

  it("falls back to the summit value when the plan does not override the key", () => {
    visit("/app/my-summit/all-plans/5");

    expect(getMarketingValue("CFP_HIDE_MY_BIO")).toBe("summit");
  });

  it("uses the summit value outside a plan", () => {
    visit("/app/my-summit/all-plans");

    expect(getMarketingValue("spkmgmt_disclaimer")).toBe("summit disclaimer");
  });
});
