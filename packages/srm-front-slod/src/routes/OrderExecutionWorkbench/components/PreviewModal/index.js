/*
 * @Description: PreviewModal - 订单签署-明细-附件预览弹窗
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022年3月23日17:06:50
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { Row, Col, Icon, Tag } from 'choerodon-ui';
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
    // this.state = {
    //   visible: false,
    // };
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
        type="visibility"
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
        <Col span={11}>{this.renderDownload(item)}</Col>
        <Col span={12}>{this.renderPreview(item)}</Col>
      </Row>
    ));
    return fileListDom;
  };

  handlePreview() {
    const { fileList } = this.props;
    Modal.open({
      closable: true,
      style: { width: 600 },
      title: intl.get(`slod.orderExecution.view.common.title.sealPicture`).d('印章图片'),
      children: (
        <React.Fragment>
          <div className={styles['preveiw-modal-content']}>
            {fileList.length > 0 && this.renderFileList(fileList)}
          </div>
        </React.Fragment>
      ),
      footer: null,
    });
  }

  render() {
    const { btnText, btnProps, fileList } = this.props;
    return (
      <React.Fragment>
        <Button {...btnProps} onClick={() => this.handlePreview()}>
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
