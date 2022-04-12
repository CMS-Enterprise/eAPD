import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'tinymce/tinymce';
import { Editor } from '@tinymce/tinymce-react';

// A theme is required
import 'tinymce/themes/silver';
import 'tinymce/icons/default';

// Editor styles
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.css';
import 'tinymce/skins/content/default/content.css';

// Any plugins you want to use have to be imported
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/image';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/help';
import 'tinymce/plugins/link';

import { uploadFile } from '../actions/editApd';
import { generateKey } from '../util';
import '../file-loader';

const VALID_FILE_TYPES = [
  'jpeg',
  'jpg',
  'jfif',
  'pjeg',
  'pjp',
  'png',
  'gif',
  'webp',
  'tif',
  'tiff'
];

// this function is used when the user presses the image button
const fileButtonOnClick = (button, editor, upload) => () => {
  const selectedFile = button.files[0];
  if (selectedFile && selectedFile.type) {
    // check file type to see if it's valid before trying to upload
    const { type } = selectedFile;
    // eslint-disable-next-line no-unused-vars
    const [fileKind, fileType] = type.split('/');
    if (!VALID_FILE_TYPES.includes(fileType)) {
      // if the file type is not allowed notify the user and close the request
      editor.notificationManager.open({
        text: `${fileType.toUpperCase()} file type not supported`,
        type: 'error',
        icon: 'warning',
        closeButton: true,
        timeout: 10000
      });
      return Promise.resolve();
    }

    // add a placeholder to the editor
    const placeholderKey = `[uploading image {${generateKey()}}]`;
    editor.insertContent(placeholderKey);
    return upload(selectedFile)
      .then(url => {
        // replaces the placehold with a link to the image
        const content = editor.getContent();
        const newContent = content.replace(
          placeholderKey,
          `<img src="${url}">`
        );
        editor.setContent(newContent);
      })
      .catch(() => {
        // if there is an error notify the user, remove the placeholder, and close the request
        editor.notificationManager.open({
          text: 'Unable to upload file',
          type: 'error',
          icon: 'warning',
          closeButton: true,
          timeout: 10000
        });
        const content = editor.getContent();
        const newContent = content.replace(placeholderKey, '');
        editor.setContent(newContent);
        return Promise.resolve();
      });
  }
  return Promise.resolve();
};

// sets up the image button
const setupTinyMCE = upload => editor => {
  editor.on('init', () => {
    const { id } = editor;
    const event = new CustomEvent(`tinymceLoaded.${id}`, {
      detail: {},
      editor: this
    });
    document.dispatchEvent(event);
  });

  editor.ui.registry.addButton('eapdImageUpload', {
    icon: 'image',
    onAction: () => {
      const fileButton = document.createElement('input');
      fileButton.setAttribute('type', 'file');
      fileButton.setAttribute('accept', 'image/*');
      fileButton.addEventListener(
        'change',
        fileButtonOnClick(fileButton, editor, upload),
        false
      );
      fileButton.click();
    },
    tooltip: 'Insert an image'
  });
};

class RichText extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id || `rte-${generateKey()}`
    };
  }

  // this is called when a user drags and drops an image into the editor
  // the editor will warn the user if the file type is not allowed before trying to upload
  uploadImage = () => async (blob, success, failure) => {
    const { uploadFile: upload, onSync } = this.props;
    const { id } = this.state;

    try {
      const url = await upload(blob.blob());
      success(url);
      /* global tinyMCE */
      // ☝️ lets eslint know that tinyMCE is defined. Once we've told Tiny the
      // URL of the uploaded image, it'll update the content of the textbox,
      // but it does NOT call the change event. That means that dropped images
      // aren't saved as IMG tags unless the user makes additional changes to
      // the textbox content. To get around that, we can get a reference to
      // the editor, pull the content, and manually trigger the event.
      const editor = tinyMCE.get(id);
      onSync(editor.getContent());
    } catch (e) {
      failure('Unable to upload file');
    }
  };

  onEditorChange = newContent => {
    const { onSync } = this.props;
    onSync(newContent);
  };

  render() {
    const { uploadFile: upload, content } = this.props;
    const { id } = this.state;

    // https://www.tiny.cloud/docs/plugins/
    const plugins = [
      'advlist',
      'autoresize',
      'lists',
      'paste',
      'help',
      'link',
      'image'
    ];

    // https://www.tiny.cloud/docs/advanced/available-toolbar-buttons/
    const toolbar = [
      'undo redo',
      'style',
      'bold italic strikethrough forecolor',
      'alignleft aligncenter alignright alignjustify',
      'outdent indent',
      'numlist bullist',
      'formatselect',
      'link',
      'eapdImageUpload',
      'help'
    ].join(' | ');

    return (
      <div className="rte--wrapper">
        <Editor
          id={id}
          init={{
            toolbar,
            plugins,
            setup: setupTinyMCE(upload),
            autoresize_bottom_margin: 0,
            browser_spellcheck: true,
            file_picker_types: 'image',
            images_upload_handler: this.uploadImage(),
            images_file_types: VALID_FILE_TYPES.join(','),
            paste_data_images: true, // true adds drag and drop support
            a11y_advanced_options: true,
            menubar: '',
            relative_urls: false,
            encoding: 'xml',
            forced_root_block: 'p',
            invalid_elements: 'script',
            remove_trailing_brs: true,
            link_assume_external_targets: true,
            default_link_target: '_blank',
            toolbar_mode: 'wrap',
            selector: 'textarea',
            skin: false
          }}
          value={content}
          onEditorChange={this.onEditorChange}
        />
      </div>
    );
  }
}

RichText.propTypes = {
  content: PropTypes.string,
  id: PropTypes.string,
  onSync: PropTypes.func,
  uploadFile: PropTypes.func.isRequired
};

RichText.defaultProps = {
  content: '',
  id: '',
  onSync: () => {}
};

const mapDispatchToProps = { uploadFile };

export default connect(null, mapDispatchToProps)(RichText);

export {
  RichText as plain,
  fileButtonOnClick,
  mapDispatchToProps,
  setupTinyMCE
};
