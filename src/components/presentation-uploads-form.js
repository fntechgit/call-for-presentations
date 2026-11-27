/**
 * Copyright 2020 OpenStack Foundation
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
import T from "i18n-react/dist/i18n-react";
import "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css";
import RawHTML from "openstack-uicore-foundation/lib/components/raw-html";
import UploadInputV2 from "openstack-uicore-foundation/lib/components/inputs/upload-input-v2";
import UploadInputV4 from "openstack-uicore-foundation/lib/components/inputs/upload-input-v4";
import "openstack-uicore-foundation/lib/css/components/inputs/upload-input-v4.css";
import { findElementPos } from "openstack-uicore-foundation/lib/utils/methods";
import { initLogOut } from "openstack-uicore-foundation/lib/security/methods";
import Swal from "sweetalert2";
import * as Sentry from "@sentry/react";
import SubmitButtons from "./presentation-submit-buttons";
import { scrollToError } from "../utils/methods";
import history from "../history";
import { ERROR_403, KILOBYTES_IN_MEGABYTE } from "../utils/constants";

// the upload input reports a single failed file once per failed chunk,
// so the same error is only sent to Sentry once inside this window
const UPLOAD_ERROR_REPORT_WINDOW_MS = 10000;

const getUploadErrorMessage = (error) => {
  if (typeof error === "string") return error;
  return error?.message || error?.detail || "unknown error";
};

// Dropzone statuses of a file not yet uploaded: "added" covers V2's async accept
// (token + md5), before the file is queued
const V2_ACTIVE_STATUSES = ["added", "queued", "uploading"];

const isUploadV4Enabled = () => window.FILE_UPLOAD_USE_V4 === "true";

// the complete response echoes the client file name as original_name
const isSameFile = (body, file) =>
  !!body &&
  !!file &&
  body.original_name === file.name &&
  body.size === file.size;

class PresentationUploadsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: { ...props.entity },
      errors: props.errors,
      inputKeys: {}
    };

    // V4 uploads still transferring, as {inputId, file}. errors don't say which file failed,
    // so only the number of entries per input is reliable, not which file each one is
    this.runningUploads = [];
    // saved files whose DELETE has not returned yet
    this.deletingIds = new Set();
    // per media type id, delivered files whose POST has not returned yet
    this.savingUploads = {};
    // per V2 input id, its Dropzone instance
    this.v2Dropzones = {};
    // inputs whose remount waits for their running uploads
    this.pendingRemounts = new Set();

    this.handleRemoveFile = this.handleRemoveFile.bind(this);
    this.onUploadStart = this.onUploadStart.bind(this);
    this.onUploadComplete = this.onUploadComplete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onUploadError = this.onUploadError.bind(this);
    this.onBeforeUnload = this.onBeforeUnload.bind(this);
  }

  componentDidMount() {
    // leaving the step unmounts the inputs, which cancels their uploads
    this.unblockHistory = history.block(() =>
      this.runningUploads.length > 0
        ? T.translate("edit_presentation.errors.uploads_in_progress")
        : undefined
    );
    // history.block does not cover closing the tab or reloading
    window.addEventListener("beforeunload", this.onBeforeUnload);
  }

  componentWillUnmount() {
    // saves still in flight resolve after this, and Dropzone reports its files as removed
    this.unmounted = true;
    if (this.unblockHistory) this.unblockHistory();
    window.removeEventListener("beforeunload", this.onBeforeUnload);
  }

  onBeforeUnload(ev) {
    if (this.runningUploads.length === 0) return;
    // browsers show their own message
    ev.preventDefault();
    ev.returnValue = "";
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      entity: { ...nextProps.entity },
      errors: { ...nextProps.errors }
    });

    // scroll to first error
    if (nextProps.errors && Object.keys(nextProps.errors).length > 0) {
      const firstError = Object.keys(nextProps.errors)[0];
      const firstNode = document.getElementById(firstError);
      if (firstNode) window.scrollTo(0, findElementPos(firstNode));
    }
  }

  handleRemoveFile(file) {
    const { entity } = this.state;
    if (file.id) {
      // the row stays until the DELETE returns, and a second one gets a 404
      if (this.deletingIds.has(file.id)) return;
      this.deletingIds.add(file.id);
      // the action resolves after a failure too, so the file can be removed again
      this.props
        .onDeleteMU(entity.id, file.id)
        .then(() => this.deletingIds.delete(file.id));
      return;
    }

    // V4 passes the File of an upload the user cancelled or dismissed, V2 the Dropzone file
    // it removed. remove one entry only, a retried file can also hold another entry
    const index = this.runningUploads.findIndex((u) => u.file === file);
    if (index >= 0) this.runningUploads.splice(index, 1);
    // the cancelled file may be the last one a pending remount was waiting for
    this.pendingRemounts.forEach((inputId) => this.remountIfIdle(inputId));
  }

  onUploadStart(inputId, file) {
    // a retry counts again, its failure already removed an entry
    this.runningUploads.push({ inputId, file });
  }

  // file is the File that failed (V4 onError), body the complete response that echoes it
  takeRunningUpload(inputId, { file, body } = {}) {
    const ofInput = this.runningUploads.filter((u) => u.inputId === inputId);
    const upload = file
      ? ofInput.find((u) => u.file === file)
      : ofInput.find((u) => isSameFile(body, u.file)) || ofInput[0];
    if (upload)
      this.runningUploads = this.runningUploads.filter((u) => u !== upload);
  }

  // V2 keeps no File list of its own outside Dropzone, so its instance is kept to see
  // which files are still uploading. init runs once per Dropzone, so a remount replaces it
  getV2DjsConfig(inputId) {
    const form = this;
    return {
      withCredentials: true,
      init() {
        form.v2Dropzones[inputId] = this;
      }
    };
  }

  isInputBusy(inputId) {
    if (this.runningUploads.some((u) => u.inputId === inputId)) return true;
    const dropzone = this.v2Dropzones[inputId];
    return (
      !!dropzone &&
      dropzone.files.some((f) => V2_ACTIVE_STATUSES.includes(f.status))
    );
  }

  // V4 keeps a finished row until a saved file has its exact name, and summit-api renames it.
  // V2's Dropzone counts its uploaded files plus value, so a later file hits "Max files reached".
  // remounting the input fixes both, and cancels nothing once none of its uploads are running.
  // A busy input is remounted when its last file is saved, or when the user cancels it
  remountIfIdle(inputId) {
    if (this.unmounted) return;
    if (this.isInputBusy(inputId)) {
      this.pendingRemounts.add(inputId);
      return;
    }
    this.pendingRemounts.delete(inputId);
    this.setState(({ inputKeys }) => ({
      inputKeys: { ...inputKeys, [inputId]: (inputKeys[inputId] || 0) + 1 }
    }));
  }

  getMediaUploadsByType(entity, mediaType) {
    if (entity.media_uploads.length > 0)
      return entity.media_uploads.filter(
        (mu) => mu.media_upload_type_id === mediaType.id
      );
    return [];
  }

  onUploadComplete(response, id, data) {
    const { entity } = this.state;

    // we just upload a file, then we need to figure we need to create it
    let { media_type, media_upload } = data;

    if (response) {
      this.takeRunningUpload(id, { body: response });

      // new media upload
      media_upload = {
        id: 0,
        media_upload_type_id: media_type.id,
        filepath: `${response.path}${response.name}`,
        filename: response.name,
        should_upload: true
      };

      // the action resolves after a failure too
      // counted toward the minimum on submit until the save lands in entity
      this.savingUploads[media_type.id] =
        (this.savingUploads[media_type.id] || 0) + 1;

      this.props.onSaveMU(entity, media_upload).then(() => {
        this.savingUploads[media_type.id] -= 1;
        this.remountIfIdle(id);
      });
    }
  }

  onUploadError(error, status, inputId, file) {
    // V4 passes the File that failed. a retry reports it again through onUploadStart,
    // and dismissing its row reports it through onRemove, which then finds no entry
    this.takeRunningUpload(inputId, { file });

    if (status == ERROR_403) {
      // V2 passes the response body ({detail}), V4 an Error carrying the server message
      Swal.fire("ERROR", error?.detail || error?.message, "error");
      console.log(error);
      initLogOut();
      return;
    }

    // Upload failures (e.g. "Server responded with 0 code." on a dropped connection)
    // are not exceptions, so without this they never reach Sentry.
    const message = getUploadErrorMessage(error);
    const reportKey = `${inputId}|${status}|${message}`;
    const now = Date.now();
    if (
      this.lastUploadErrorReport &&
      this.lastUploadErrorReport.key === reportKey &&
      now - this.lastUploadErrorReport.at < UPLOAD_ERROR_REPORT_WINDOW_MS
    ) {
      return;
    }
    this.lastUploadErrorReport = { key: reportKey, at: now };

    Sentry.captureMessage(`Media upload failed: ${message}`, {
      level: "error",
      tags: { upload_status: status ?? "none" },
      extra: {
        presentation_id: this.state.entity?.id,
        upload_input: inputId,
        error
      }
    });
  }

  handleSubmit(ev) {
    const { entity, errors } = this.state;
    const { summit } = this.props;
    ev.preventDefault();

    const cur_event_type = summit.event_types.find(
      (ev) => ev.id === entity.type_id
    );

    if (cur_event_type) {
      cur_event_type.allowed_media_upload_types.forEach((mediaUploadType) => {
        if (
          mediaUploadType.is_mandatory ||
          mediaUploadType.min_uploads_qty > 0
        ) {
          // check if user provided file
          const mediaUploads = this.getMediaUploadsByType(
            entity,
            mediaUploadType
          );
          const saving = this.savingUploads[mediaUploadType.id] || 0;
          if (mediaUploads.length + saving < mediaUploadType.min_uploads_qty) {
            errors[
              mediaUploadType.name
            ] = `This field is required. You must upload a minimum of ${mediaUploadType.min_uploads_qty} files`;
          }
        }
      });
    }

    if (Object.keys(errors).length === 0) {
      this.props.onSubmit(entity);
    } else {
      this.setState({ errors }, () => {
        if (Object.keys(errors).length > 0) {
          scrollToError();
        }
      });
    }
  }

  hasErrors(field) {
    const { errors } = this.state;
    if (field in errors) {
      return errors[field];
    }

    return "";
  }

  render() {
    const { entity, inputKeys } = this.state;
    const { summit, presentation, step } = this.props;

    if (!summit) return <div />;

    const allowedMediaUploads = presentation.getAllowedMediaUploads();

    return (
      <form className="presentation-uploads-form">
        <input type="hidden" id="id" value={entity.id} />

        {allowedMediaUploads.map((media_type, i) => {
          const notLastItem = i < allowedMediaUploads.length - 1;
          const allowedExt = media_type.type.allowed_extensions
            .map((ext) => `.${ext.toLowerCase()}`)
            .join(",");
          const mediaUploads = this.getMediaUploadsByType(entity, media_type);
          const maxFiles =
            media_type.max_uploads_qty > 0 ? media_type.max_uploads_qty : null;
          const uploadInputProps = {
            id: `media_upload_${media_type.id}`,
            onUploadComplete: this.onUploadComplete,
            onError: this.onUploadError,
            onRemove: this.handleRemoveFile,
            value: mediaUploads,
            mediaType: media_type,
            error: this.hasErrors(media_type.name),
            maxFiles,
            canAdd: media_type.is_editable || mediaUploads.length < maxFiles,
            canDelete: media_type.is_editable
          };

          return (
            <div
              key={media_type.id}
              className={`row form-group ${notLastItem ? "border" : ""}`}
            >
              <div className="col-md-12">
                <label>
                  {media_type.name} ({allowedExt}) - Max. Size{" "}
                  {media_type.max_size / KILOBYTES_IN_MEGABYTE} MB
                  {media_type.is_mandatory && (
                    <i> - {media_type.min_uploads_qty} mandatory</i>
                  )}
                  {maxFiles && <i> - {maxFiles} max. allowed</i>}
                </label>
                {media_type.description && (
                  <div>
                    <RawHTML>{media_type.description}</RawHTML>
                  </div>
                )}
                {isUploadV4Enabled() ? (
                  <UploadInputV4
                    key={`${uploadInputProps.id}-${
                      inputKeys[uploadInputProps.id] || 0
                    }`}
                    {...uploadInputProps}
                    onUploadStart={(file) =>
                      this.onUploadStart(uploadInputProps.id, file)
                    }
                    postUrl={`${window.FILE_UPLOAD_API_BASE_URL}/api/v1/files`}
                    // max_size is in KB; V4 expects MB here (V2 converts KB itself)
                    getMaxSize={() =>
                      media_type.max_size / KILOBYTES_IN_MEGABYTE
                    }
                  />
                ) : (
                  <UploadInputV2
                    key={`${uploadInputProps.id}-${
                      inputKeys[uploadInputProps.id] || 0
                    }`}
                    {...uploadInputProps}
                    postUrl={`${window.FILE_UPLOAD_API_BASE_URL}/api/v1/files/upload`}
                    djsConfig={this.getV2DjsConfig(uploadInputProps.id)}
                    parallelChunkUploads
                  />
                )}
              </div>
            </div>
          );
        })}

        <hr />
        <SubmitButtons
          presentation={presentation}
          step={step}
          onSubmit={this.handleSubmit.bind(this)}
        />
      </form>
    );
  }
}

export default PresentationUploadsForm;
