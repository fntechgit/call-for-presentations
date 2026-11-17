export const SP_LANDING = "SP_LANDING";
export const EXTRA_QUESTION_MAX_LENGTH = 1024;
export const BACK_URL = "BackUrl";
// matches summit-api SpeakerService::addSpeakerPhoto / addSpeakerBigPhoto max_file_size (10 MB)
export const SPEAKER_PHOTO_MAX_SIZE = 10485760;
export const TWO = 2;
// CefSharp-embedded Chromium (e.g. email link scanners like Outlook Safe Links) rejects with this
// non-Error value when opening emailed links. The Sentry SDK default only covers MethodName:simulateEvent.
export const CEFSHARP_REJECTION_PATTERN =
  /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+$/;
