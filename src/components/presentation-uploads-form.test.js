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

import * as Sentry from "@sentry/react";
import Swal from "sweetalert2";
import { initLogOut } from "openstack-uicore-foundation/lib/security/methods";
import history from "../history";
import PresentationUploadsForm from "./presentation-uploads-form";

jest.mock("@sentry/react", () => ({ captureMessage: jest.fn() }));
jest.mock(
  "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css",
  () => ({})
);
jest.mock(
  "openstack-uicore-foundation/lib/components/raw-html",
  () => () => null
);
jest.mock(
  "openstack-uicore-foundation/lib/components/inputs/upload-input-v2",
  () =>
    function UploadInputV2() {
      return null;
    }
);
jest.mock(
  "openstack-uicore-foundation/lib/components/inputs/upload-input-v4",
  () =>
    function UploadInputV4() {
      return null;
    }
);
jest.mock(
  "openstack-uicore-foundation/lib/css/components/inputs/upload-input-v4.css",
  () => ({})
);
jest.mock("openstack-uicore-foundation/lib/utils/methods", () => ({
  findElementPos: () => 0
}));
jest.mock("openstack-uicore-foundation/lib/security/methods", () => ({
  initLogOut: jest.fn()
}));
jest.mock("sweetalert2", () => ({ fire: jest.fn() }));
jest.mock("i18n-react/dist/i18n-react", () => ({ translate: (key) => key }));
jest.mock("./presentation-submit-buttons", () => () => null);
jest.mock("../utils/methods", () => ({ scrollToError: jest.fn() }));
jest.mock("../history", () => ({ block: jest.fn() }));

const mediaType = {
  id: 5,
  name: "Slides",
  max_size: 10240, // KB, as summit-api serializes it
  max_uploads_qty: 2,
  is_editable: true,
  is_mandatory: false,
  type: { allowed_extensions: ["PDF"] }
};

const makeForm = (props = {}) =>
  new PresentationUploadsForm({
    entity: { id: 10, media_uploads: [] },
    errors: {},
    ...props
  });

const findByType = (node, name) => {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByType(child, name);
      if (found) return found;
    }
    return null;
  }
  if (node.type?.name === name) return node;
  return findByType(node.props?.children, name);
};

const renderUploadInput = (name) => {
  const form = makeForm({
    summit: {},
    presentation: { getAllowedMediaUploads: () => [mediaType] },
    step: "UPLOADS"
  });
  return findByType(form.render(), name);
};

const talk = { name: "talk.mp4", size: 120 };
const slides = { name: "slides.pdf", size: 40 };
const completed = (file) => ({
  path: "upload/abc/",
  name: `abc_${file.name}`,
  original_name: file.name,
  size: file.size
});
const data = { media_type: mediaType, media_upload: [] };
const flush = () => new Promise(setImmediate);

// the form is never mounted, so state updates are applied by hand
const withState = (form) => {
  form.setState = (update) => {
    form.state = { ...form.state, ...update(form.state) };
  };
  return form;
};

describe("PresentationUploadsForm.onUploadError", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reports a dropped-connection upload failure to Sentry", () => {
    makeForm().onUploadError(
      "Server responded with 0 code.",
      undefined,
      "media_upload_5"
    );

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Media upload failed: Server responded with 0 code.",
      expect.objectContaining({
        level: "error",
        tags: { upload_status: "none" },
        extra: expect.objectContaining({
          presentation_id: 10,
          upload_input: "media_upload_5"
        })
      })
    );
  });

  it("reports a server error response with its status and message", () => {
    makeForm().onUploadError(
      { message: "server error" },
      500,
      "media_upload_5"
    );

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Media upload failed: server error",
      expect.objectContaining({ tags: { upload_status: 500 } })
    );
  });

  it("reports the same failure once when the upload input repeats it per chunk", () => {
    const form = makeForm();
    for (let i = 0; i < 6; i++)
      form.onUploadError(
        "Server responded with 0 code.",
        undefined,
        "media_upload_5"
      );

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
  });

  it("shows the server message from a V4 403 error and logs out", () => {
    const error = Object.assign(new Error("forbidden"), { status: 403 });
    makeForm().onUploadError(error, error.status, "media_upload_5");

    expect(Swal.fire).toHaveBeenCalledWith("ERROR", "forbidden", "error");
    expect(initLogOut).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it("keeps logging out on 403 without reporting to Sentry", () => {
    makeForm().onUploadError({ detail: "forbidden" }, 403, "media_upload_5");

    expect(initLogOut).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });
});

describe("PresentationUploadsForm upload input selection", () => {
  // jest runs in the node environment, so the env globals app.js sets live on a stub window
  beforeEach(() => {
    global.window = { FILE_UPLOAD_API_BASE_URL: "https://files.test" };
  });
  afterAll(() => {
    delete global.window;
  });

  it("renders UploadInputV4 against the file API base when the flag is 'true'", () => {
    window.FILE_UPLOAD_USE_V4 = "true";

    const input = renderUploadInput("UploadInputV4");

    expect(input).not.toBeNull();
    expect(renderUploadInput("UploadInputV2")).toBeNull();
    expect(input.props.postUrl).toBe("https://files.test/api/v1/files");
    expect(input.props).not.toHaveProperty("djsConfig");
    expect(input.props).not.toHaveProperty("parallelChunkUploads");
  });

  it("passes V4 the max size in MB, converted from the KB summit-api sends", () => {
    window.FILE_UPLOAD_USE_V4 = "true";

    const input = renderUploadInput("UploadInputV4");

    expect(input.props.getMaxSize()).toBe(10);
    expect(input.props.mediaType.id).toBe(5);
  });

  it.each([undefined, "false", "1"])(
    "keeps UploadInputV2 on the chunked endpoint when the flag is %p",
    (flag) => {
      window.FILE_UPLOAD_USE_V4 = flag;

      const input = renderUploadInput("UploadInputV2");

      expect(input).not.toBeNull();
      expect(renderUploadInput("UploadInputV4")).toBeNull();
      expect(input.props.postUrl).toBe(
        "https://files.test/api/v1/files/upload"
      );
      expect(input.props.djsConfig).toEqual(
        expect.objectContaining({ withCredentials: true })
      );
      expect(input.props.parallelChunkUploads).toBe(true);
    }
  );
});

describe("PresentationUploadsForm.onUploadComplete", () => {
  it("saves the media upload with filepath built from path + name", () => {
    const onSaveMU = jest.fn(() => Promise.resolve());
    const form = makeForm({ onSaveMU });

    form.onUploadComplete(
      { path: "upload/abc/", name: "slides.pdf" },
      "media_upload_5",
      { media_type: mediaType, media_upload: [] }
    );

    expect(onSaveMU).toHaveBeenCalledWith(expect.objectContaining({ id: 10 }), {
      id: 0,
      media_upload_type_id: 5,
      filepath: "upload/abc/slides.pdf",
      filename: "slides.pdf",
      should_upload: true
    });
  });
});

describe("PresentationUploadsForm leaving the step with uploads running", () => {
  let prompt;
  const mountForm = () => {
    const form = withState(
      makeForm({
        onSaveMU: jest.fn(() => Promise.resolve()),
        onDeleteMU: jest.fn()
      })
    );
    form.componentDidMount();
    prompt = history.block.mock.calls[0][0];
    return form;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.window = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
  });
  afterAll(() => {
    delete global.window;
  });

  it("asks only while an upload is running", () => {
    const form = mountForm();
    expect(prompt()).toBeUndefined();

    form.onUploadStart("media_upload_5", talk);
    expect(prompt()).toBe("edit_presentation.errors.uploads_in_progress");

    form.onUploadComplete(completed(talk), "media_upload_5", data);
    expect(prompt()).toBeUndefined();
  });

  it("keeps asking while another file of the same input is still uploading", () => {
    const form = mountForm();
    form.onUploadStart("media_upload_5", talk);
    form.onUploadStart("media_upload_5", slides);

    form.onUploadComplete(completed(slides), "media_upload_5", data);
    expect(prompt()).toBe("edit_presentation.errors.uploads_in_progress");

    form.handleRemoveFile(talk);
    expect(prompt()).toBeUndefined();
  });

  it("keeps asking for a retried file after another file of the same input finishes", () => {
    const form = mountForm();
    form.onUploadStart("media_upload_5", talk);
    form.onUploadStart("media_upload_5", slides);

    // slides fails while talk is still uploading, then the user retries it
    form.onUploadError(
      "Server responded with 0 code.",
      undefined,
      "media_upload_5"
    );
    form.onUploadStart("media_upload_5", slides);

    form.onUploadComplete(completed(talk), "media_upload_5", data);
    expect(prompt()).toBe("edit_presentation.errors.uploads_in_progress");

    form.onUploadComplete(completed(slides), "media_upload_5", data);
    expect(prompt()).toBeUndefined();
  });

  it("asks the browser to confirm a tab close or reload only while an upload is running", () => {
    const form = mountForm();
    const unload = { preventDefault: jest.fn() };
    form.onBeforeUnload(unload);
    expect(unload.preventDefault).not.toHaveBeenCalled();

    form.onUploadStart("media_upload_5", talk);
    form.onBeforeUnload(unload);
    expect(unload.preventDefault).toHaveBeenCalled();
  });

  it("keeps asking for the running file after another one fails and its row is dismissed", () => {
    const form = mountForm();
    form.onUploadStart("media_upload_5", talk);
    form.onUploadStart("media_upload_5", slides);

    // V4 reports the failed File, then dismissing its error row reports it through onRemove
    form.onUploadError(
      "Server responded with 0 code.",
      undefined,
      "media_upload_5",
      slides
    );
    form.handleRemoveFile(slides);
    expect(prompt()).toBe("edit_presentation.errors.uploads_in_progress");

    form.onUploadComplete(completed(talk), "media_upload_5", data);
    expect(prompt()).toBeUndefined();
  });

  it("stops asking when the upload fails", () => {
    const form = mountForm();
    form.onUploadStart("media_upload_5", talk);

    form.onUploadError(
      "Server responded with 0 code.",
      undefined,
      "media_upload_5"
    );
    expect(prompt()).toBeUndefined();
  });
});

describe("PresentationUploadsForm after a file is saved", () => {
  beforeEach(() => {
    global.window = {
      FILE_UPLOAD_API_BASE_URL: "https://files.test",
      FILE_UPLOAD_USE_V4: "true"
    };
  });
  afterAll(() => {
    delete global.window;
  });

  const inputKey = (form) => findByType(form.render(), "UploadInputV4").key;

  it("remounts the input only once none of its uploads are running", async () => {
    const form = withState(
      makeForm({
        summit: {},
        presentation: { getAllowedMediaUploads: () => [mediaType] },
        onSaveMU: jest.fn(() => Promise.resolve())
      })
    );
    const initialKey = inputKey(form);
    form.onUploadStart("media_upload_5", talk);
    form.onUploadStart("media_upload_5", slides);

    form.onUploadComplete(completed(slides), "media_upload_5", data);
    await flush();
    expect(inputKey(form)).toBe(initialKey);

    form.onUploadComplete(completed(talk), "media_upload_5", data);
    await flush();
    expect(inputKey(form)).not.toBe(initialKey);
  });

  // V2's Dropzone counts its own uploaded files plus value, so without a remount
  // the second file of a max-2 type is rejected with "Max files reached."
  it("remounts UploadInputV2 after each save when the flag is off", async () => {
    window.FILE_UPLOAD_USE_V4 = undefined;
    const form = withState(
      makeForm({
        summit: {},
        presentation: { getAllowedMediaUploads: () => [mediaType] },
        onSaveMU: jest.fn(() => Promise.resolve())
      })
    );
    const v2Key = () => findByType(form.render(), "UploadInputV2").key;
    const firstKey = v2Key();

    form.onUploadComplete(completed(talk), "media_upload_5", data);
    await flush();
    const secondKey = v2Key();
    expect(secondKey).not.toBe(firstKey);

    form.onUploadComplete(completed(slides), "media_upload_5", data);
    await flush();
    expect(v2Key()).not.toBe(secondKey);
  });

  describe("with V2 files still uploading", () => {
    const setup = () => {
      window.FILE_UPLOAD_USE_V4 = undefined;
      const form = withState(
        makeForm({
          summit: {},
          presentation: { getAllowedMediaUploads: () => [mediaType] },
          onSaveMU: jest.fn(() => Promise.resolve())
        })
      );
      const v2Key = () => findByType(form.render(), "UploadInputV2").key;
      // what Dropzone does on construction: runs init with itself as this
      const dropzone = { files: [] };
      findByType(form.render(), "UploadInputV2").props.djsConfig.init.call(
        dropzone
      );
      return { form, v2Key, dropzone };
    };

    it("waits for the last file before remounting, so the remount cancels nothing", async () => {
      const { form, v2Key, dropzone } = setup();
      const first = { name: talk.name, status: "success" };
      const second = { name: slides.name, status: "uploading" };
      dropzone.files = [first, second];
      const initialKey = v2Key();

      form.onUploadComplete(completed(talk), "media_upload_5", data);
      await flush();
      expect(v2Key()).toBe(initialKey);

      second.status = "success";
      form.onUploadComplete(completed(slides), "media_upload_5", data);
      await flush();
      expect(v2Key()).not.toBe(initialKey);
    });

    it("counts a file still in Dropzone's async accept as uploading", async () => {
      const { form, v2Key, dropzone } = setup();
      dropzone.files = [
        { name: talk.name, status: "success" },
        { name: slides.name, status: "added" }
      ];
      const initialKey = v2Key();

      form.onUploadComplete(completed(talk), "media_upload_5", data);
      await flush();
      expect(v2Key()).toBe(initialKey);
    });

    it("remounts once the user cancels the file the remount was waiting for", async () => {
      const { form, v2Key, dropzone } = setup();
      const second = { name: slides.name, status: "uploading" };
      dropzone.files = [{ name: talk.name, status: "success" }, second];
      const initialKey = v2Key();

      form.onUploadComplete(completed(talk), "media_upload_5", data);
      await flush();
      expect(v2Key()).toBe(initialKey);

      // Dropzone drops the file from its list, then reports removedfile
      dropzone.files = dropzone.files.filter((f) => f !== second);
      form.handleRemoveFile(second);
      expect(v2Key()).not.toBe(initialKey);
    });
  });
});

describe("PresentationUploadsForm removing a saved file", () => {
  it("sends one DELETE until the first one returns", async () => {
    let resolveDelete;
    const onDeleteMU = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        })
    );
    const form = makeForm({ onDeleteMU });
    const saved = { id: 77, filename: "talk.mp4" };

    form.handleRemoveFile(saved);
    form.handleRemoveFile(saved);
    expect(onDeleteMU).toHaveBeenCalledTimes(1);

    resolveDelete();
    await flush();
    form.handleRemoveFile(saved);
    expect(onDeleteMU).toHaveBeenCalledTimes(2);
  });
});

describe("PresentationUploadsForm submitting the step", () => {
  const mandatory = { ...mediaType, is_mandatory: true, min_uploads_qty: 1 };

  it("counts a delivered file whose save has not returned toward the minimum", async () => {
    let resolveSave;
    const onSubmit = jest.fn();
    const form = makeForm({
      entity: { id: 10, type_id: 3, media_uploads: [] },
      summit: {
        event_types: [{ id: 3, allowed_media_upload_types: [mandatory] }]
      },
      onSaveMU: jest.fn(
        () =>
          new Promise((resolve) => {
            resolveSave = resolve;
          })
      ),
      onSubmit
    });

    form.onUploadComplete(completed(slides), "media_upload_5", {
      media_type: mandatory,
      media_upload: []
    });
    form.handleSubmit({ preventDefault: () => {} });

    expect(onSubmit).toHaveBeenCalled();
    expect(form.state.errors).toEqual({});
    resolveSave();
    await flush();
  });
});
