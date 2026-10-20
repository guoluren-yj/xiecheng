/*
 * @Description: PreviewModal - 订单签署-明细-附件预览弹窗
 * @Author: ZYF <yanfengz.zhang@hand-china.com>
 * @Date: 2021年4月15日11:04:50
 * @LastEditTime: 2021年4月15日11:04:50
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Button, Row, Col, Icon, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { HZERO_HFLE } from 'hzero-front/lib/utils/config.js';
import { getAccessToken, getCurrentOrganizationId } from 'hzero-front/lib/utils//utils';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const accessToken = getAccessToken();

export default class PreviewModal extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      visible: false,
    };
  }

  renderDownload = (file) => {
    const { fileName, bucketName, fileUrl } = file;
    const url = encodeURIComponent(fileUrl);
    const downLoadUrl = `${HZERO_HFLE}/v1/${organizationId}/files/download?access_token=${accessToken}&bucketName=${bucketName}&url=${url}`;
    return <a href={downLoadUrl}>{fileName}</a>;
  };

  renderPreview = (file) => {
    const { bucketName, fileUrl } = file;
    const url = encodeURIComponent(fileUrl);
    const previewUrl = `${HZERO_HFLE}/v1/${organizationId}/file-preview/by-url?access_token=${accessToken}&bucketName=${bucketName}&url=${url}`;
    return (
      <Icon
        type="eye-o"
        className="preview-icon"
        title={intl.get('hzero.common.upload.previewFile').d('预览附件')}
        onClick={() => {
          window.open(previewUrl);
        }}
      />
    );
  };

  renderFileList = (fileList) => {
    if (!fileList) return;
    const fileListDom = fileList.map((item) => (
      <Row style={{ textAlign: 'center' }}>
        <Col span={12}>{this.renderDownload(item)}</Col>
        <Col span={12}>{this.renderPreview(item)}</Col>
      </Row>
    ));
    return fileListDom;
  };

  render() {
    const { title, btnText, btnProps, fileList = [] } = this.props;
    const { visible } = this.state;
    return (
      <React.Fragment>
        <Modal
          title={title}
          visible={visible}
          footer={null}
          onCancel={() => {
            this.setState({ visible: false });
          }}
        >
          <div className={styles['preveiw-modal-content']}>
            {fileList.length > 0 && this.renderFileList(fileList)}
          </div>
        </Modal>
        <Button
          {...btnProps}
          onClick={() => {
            this.setState({
              visible: true,
            });
          }}
        >
          {btnText}
          {fileList.length > 0 && (
            <Tag
              color="#108ee9"
              style={{
                height: 'auto',
                lineHeight: '15px',
                marginLeft: '4px',
              }}
            >
              {fileList.length}
            </Tag>
          )}
        </Button>
      </React.Fragment>
    );
  }
}
