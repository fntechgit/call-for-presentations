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
import { UploadInputV2 } from 'openstack-uicore-foundation/lib/components'
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

        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.onUploadComplete = this.onUploadComplete.bind(this);
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

    handleRemoveFile({id, name}) {
        const {entity} = this.state;
        if (id) {
            this.props.onDeleteMU(entity.id, id);
        }
    }

    getMediaUploadsByType(entity, mediaType) {
        if(entity.media_uploads.length > 0 )
            return entity.media_uploads.filter(mu => mu.media_upload_type_id === mediaType.id);
        return [];
    }

    onUploadComplete(response, id, data){
        const {entity} = this.state;

        // we just upload a file, then we need to figure we need to create it
        let {media_type, media_upload } = data;

        if(response){
            // new media upload
            media_upload = {
                id: 0,
                media_upload_type_id : media_type.id,
                filepath: `${response.path}${response.name}`,
                filename: response.name,
                should_upload: true
            };

            this.props.onSaveMU(entity, media_upload);
        }
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
                    var mediaUploads = this.getMediaUploadsByType(entity, mediaUploadType);
                    if(mediaUploads.length === 0){
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

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    render() {
        let {entity} = this.state;
        let {summit, presentation, step} = this.props;

        if (!summit) return(<div/>);

        const allowedMediaUploads = presentation.getAllowedMediaUploads();

        return (
            <form className="presentation-uploads-form">
                <input type="hidden" id="id" value={entity.id} />

                { allowedMediaUploads.map((media_type, i) => {
                    const notLastItem = i < allowedMediaUploads.length -1;
                    const allowedExt = media_type.type.allowed_extensions.map((ext) => `.${ext.toLowerCase()}`).join(",");
                    const mediaUploads = this.getMediaUploadsByType(entity, media_type);

                    return (
                        <div key={media_type.id} className={`row form-group ${notLastItem ? 'border' : ''}`}>
                            <div className="col-md-12">
                                <label>
                                    {media_type.name} ({allowedExt}) - Max. Size {media_type.max_size/1024} MB
                                    {media_type.is_mandatory && <i> - mandatory</i>}
                                </label>
                                {
                                    media_type.description !== '' &&
                                    <p>{media_type.description}</p>
                                }
                                <UploadInputV2
                                    id={`media_upload_${media_type.id}`}
                                    onUploadComplete={this.onUploadComplete}
                                    onRemove={this.handleRemoveFile}
                                    value={mediaUploads}
                                    mediaType={media_type}
                                    postUrl={`${window.API_BASE_URL}/api/public/v1/files/upload`}
                                    error={this.hasErrors(media_type.name)}
                                    djsConfig={{withCredentials:true}}
                                />
                            </div>
                        </div>
                    )
                })}

                <hr/>
                <SubmitButtons presentation={presentation} step={step} onSubmit={this.handleSubmit.bind(this)} />
            </form>
        );
    }
}

export default PresentationUploadsForm;
