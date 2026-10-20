/**
 * 企业信息
 * @date: 2018-8-13
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import { Icon, Upload, Modal } from 'hzero-ui';
import { PRIVATE_BUCKET } from '_utils/config';
// import UploadModal from 'components/Upload';
const bucketDirectory = 'spfm-comp';

export default class ImgPreview extends PureComponent {
  state = {
    previewVisible: false,
    previewFile: null,
  };

  reUploadRef = React.createRef();

  @Bind()
  handlePreview = (file) => {
    this.setState({
      previewVisible: true,
      previewFile: file,
    });
  };

  @Bind()
  handleCancelPreview = () => {
    this.setState({
      previewVisible: false,
      previewFile: null,
    });
  };

  @Bind()
  handleCancelModal = () => {
    this.setState({
      modalVisible: false,
      previewFile: null,
    });
  };

  @Bind()
  handleOpenModal = () => {
    this.setState({
      modalVisible: true,
    });
  };

  @Bind()
  handleReUploadChange = () => {
    return false;
  };

  render() {
    const { modalVisible, previewVisible, previewFile } = this.state;
    const { url, title } = this.props;
    return (
      <div style={{ display: 'inline-block' }}>
        <a onClick={this.handleOpenModal} disabled={isEmpty(url)}>
          <Icon type="paper-clip" />
          {title}
        </a>
        <Modal visible={modalVisible} footer={null} onCancel={this.handleCancelModal}>
          <Upload
            listType="picture-card"
            showUploadList={{
              showRemoveIcon: false,
              getCustomFilenameTitle: (file) => {
                return `custom-${file.name}`;
              },
            }}
            viewOnly
            onPreview={this.handlePreview}
            fileList={[
              {
                uid: -1,
                name: `${title}.png`,
                status: 'done',
                url: getAttachmentUrl(
                  url,
                  PRIVATE_BUCKET,
                  getCurrentOrganizationId(),
                  bucketDirectory
                ),
              },
            ]}
          />
          <Upload ref={this.reUploadRef} beforeUpload={this.handleReUploadChange} fileList={[]} />
          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancelPreview}>
            <img
              alt="example"
              style={{ width: '100%' }}
              src={previewFile && (previewFile.url || previewFile.thumbUrl)}
            />
          </Modal>
        </Modal>
      </div>
    );
  }
}
