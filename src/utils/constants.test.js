import { CEFSHARP_REJECTION_PATTERN } from "./constants";

describe("CEFSHARP_REJECTION_PATTERN", () => {
  it("matches the CefSharp MethodName:update rejection (CFP-PROD-5)", () => {
    expect(
      CEFSHARP_REJECTION_PATTERN.test(
        "Non-Error promise rejection captured with value: Object Not Found Matching Id:1, MethodName:update, ParamCount:4"
      )
    ).toBe(true);
  });

  it("matches the SDK's MethodName:simulateEvent variant", () => {
    expect(
      CEFSHARP_REJECTION_PATTERN.test(
        "Non-Error promise rejection captured with value: Object Not Found Matching Id:3, MethodName:simulateEvent, ParamCount:1"
      )
    ).toBe(true);
  });

  it("does not match generic non-Error promise rejections", () => {
    expect(
      CEFSHARP_REJECTION_PATTERN.test(
        "Non-Error promise rejection captured with value: undefined"
      )
    ).toBe(false);
  });
});
