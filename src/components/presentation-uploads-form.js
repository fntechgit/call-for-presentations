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
 **/

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Input, TextEditor, UploadInput, Dropdown, RadioList, TextArea, Exclusive } from 'openstack-uicore-foundation/lib/components'
import {findElementPos} from 'openstack-uicore-foundation/lib/methods'
import SubmitButtons from './presentation-submit-buttons'
import {validate, scrollToError} from '../utils/methods'
import Swal from "sweetalert2";


class PresentationUploadsForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.handleFileError = this.handleFileError.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if(nextProps.errors && Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleUploadFile(file, props) {

        let { errors, entity} = this.state;
        let {mediatype, mediaupload } = props;

        if(mediaupload == null){
            // new media upload
            mediaupload = {
                id: 0,
                media_upload_type : mediatype,
            };
            // add
            entity.media_uploads = [...entity.media_uploads, mediaupload];
        }

        if(mediaupload.hasOwnProperty('should_delete'))
            delete mediaupload.should_delete;

        mediaupload.file = file;
        mediaupload.private_url = file.preview;
        mediaupload.filename = file.name;

        // update
        entity.media_uploads = entity.media_uploads.map((item, index) => {
            if (index !== mediaupload.index) {
                // This isn't the item we care about - keep it as-is
                return item
            }

            return {
                ...item,
                ...mediaupload
            }
        });

        delete errors[mediatype.name];

        this.setState({...this.state, entity, errors});
    }

    handleFileError(error, props){
        if(error.length > 0){
            let file = error[0];
            let {mediatype } = props;
            Swal.fire("Validation Error", `File size is greather than allowed ${mediatype.max_size/1024} MB`, "warning");
        }
    }

    handleRemoveFile(ev, props) {

        let entity = {...this.state.entity};
        let { mediaupload } = props;

        mediaupload.should_delete = true;
        mediaupload.private_url = '';
        mediaupload.file = null;

        if(mediaupload.id  > 0 ){
            entity.media_uploads = entity.media_uploads.map((item, index) => {
                if (index !== mediaupload.index) {
                    // This isn't the item we care about - keep it as-is
                    return item
                }

                return {
                    ...item,
                    ...mediaupload
                }
            });
        }
        else{
            // delete it
            entity.media_uploads=  [...entity.media_uploads.slice(0, mediaupload.index), ...entity.media_uploads.slice(mediaupload.index + 1)];
        }

        this.setState({entity:entity});
    }


    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    getMediaUploadFile(entity, mediaType){
        if(entity.media_uploads.length > 0 ){
            let mediaUpload = entity.media_uploads.filter(mu => mu.hasOwnProperty('media_upload_type') && mu.media_upload_type.id === mediaType.id);
            if(mediaUpload.length > 0){
                return mediaUpload[0].file;
            }
        }
        return null;
    }

    getMediaUploadFilePreview(entity, mediaType){
        if(entity.media_uploads.length > 0 ){
            let mediaUpload = entity.media_uploads.filter(mu => mu.hasOwnProperty('media_upload_type') && mu.media_upload_type.id === mediaType.id);
            if(mediaUpload.length > 0){
                if(mediaUpload[0].hasOwnProperty('should_delete') && mediaUpload[0].should_delete)
                    return '';

                return mediaUpload[0].hasOwnProperty('private_url') && mediaUpload[0].private_url !== '' ?  mediaUpload[0].private_url : mediaUpload[0].public_url ;
            }
        }
        return '';
    }

    getMediaUploadFileName(entity, mediaType){
        if(entity.media_uploads.length > 0 ){
            let mediaUpload = entity.media_uploads.filter(mu => mu.hasOwnProperty('media_upload_type') && mu.media_upload_type.id === mediaType.id);
            if(mediaUpload.length > 0){
                return mediaUpload[0].hasOwnProperty('should_delete') && mediaUpload[0].should_delete ? '' : mediaUpload[0].filename;
            }
        }
        return '';
    }

    getMediaUploadByType(entity, mediaType){
        if(entity.media_uploads.length > 0 )
            return entity.media_uploads.find(mu => mu.hasOwnProperty('media_upload_type') && mu.media_upload_type.id === mediaType.id);
        return null;
    }

    handleSubmit(ev) {
        let {entity, errors} = this.state;
        let { summit } = this.props;
        ev.preventDefault();

        var cur_event_type = summit.event_types.find(ev => ev.id === entity.type_id);

        if(cur_event_type) {
            cur_event_type.allowed_media_upload_types.forEach(mediaUploadType => {
                if(mediaUploadType.is_mandatory){
                    // check if user provided file
                    var mediaUpload = this.getMediaUploadByType(entity, mediaUploadType);
                    if(!mediaUpload){
                        errors[mediaUploadType.name] = 'This field is required.';
                    }

                    if(this.getMediaUploadFile(entity, mediaUploadType) == null && this.getMediaUploadFilePreview(entity, mediaUploadType) === ''){
                        errors[mediaUploadType.name] = 'This field is required.';
                    }
                }
            });
        }

        if (Object.keys(errors).length === 0) {
            this.props.onSubmit(entity);
        } else {
            this.setState({errors}, () => {
                if (Object.keys(errors).length > 0) {
                    scrollToError();
                }
            });
        }
    }

    render() {
        let {entity} = this.state;
        let {summit, presentation, step} = this.props;

        if (!summit) return(<div/>);

        const cur_event_type = summit.event_types.find(ev => ev.id === entity.type_id);

        return (
            <form className="presentation-uploads-form">
                <input type="hidden" id="id" value={entity.id} />

                { cur_event_type && cur_event_type.allowed_media_upload_types.length > 0 && cur_event_type.allowed_media_upload_types.map((media_type, i) => {
                    const notLastItem = i < cur_event_type.allowed_media_upload_types.length -1;
                    const allowedExt = media_type.type.allowed_extensions.map((ext) => `.${ext.toLowerCase()}`).join(",");

                    return (
                        <div key={media_type.id} className={`row form-group ${notLastItem ? 'border' : ''}`}>
                            <div className="col-md-12">
                                <label>
                                    {media_type.name} ({allowedExt}) - Max. Size {media_type.max_size/1024} MB
                                    {media_type.is_mandatory && <i> - mandatory</i>}
                                </label>
                                {
                                    media_type.description !== '' &&
                                    <h4>{media_type.description}</h4>
                                }
                                <UploadInput
                                    fileName={this.getMediaUploadFileName(entity, media_type)}
                                    mediatype= {media_type}
                                    mediaupload={this.getMediaUploadByType(entity, media_type)}
                                    handleUpload={this.handleUploadFile}
                                    handleRemove={this.handleRemoveFile}
                                    handleError={this.handleFileError}
                                    className="dropzone col-md-6"
                                    multiple={false}
                                    maxSize={media_type.max_size * 1024}
                                    error={this.hasErrors(media_type.name)}
                                    value={this.getMediaUploadFilePreview(entity, media_type)}
                                    file={this.getMediaUploadFile(entity, media_type)}
                                    accept={media_type.type.allowed_extensions.map((ext) => `.${ext.toLowerCase()}`).join(",")}
                                />
                            </div>
                        </div>
                    )
                })}

                <hr/>
                <SubmitButtons presentation={presentation} step={step} onSubmit={this.handleSubmit.bind(this)} backStep="summary" />
            </form>
        );
    }
}

export default PresentationUploadsForm;
