import React, { useState, useEffect } from 'react';
import { Icon, Modal, Upload } from 'choerodon-ui';
import { TextField, Form } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { connect } from 'dva';

import { PUBLIC_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

import styles from './index.less';

function FaviconConfig(props) {
  const {
    mallHomeConfig: { icoFileList = [], iconUrl = '', pageTitle = '' },
    dispatch,
  } = props;
  const [visible, setVisible] = useState(false);
  const uploadButton = (
    <div>
      <Icon type="add" />
      <div className={styles["c7n-upload-text"]}>{intl.get('small.common.upload.desc').d('上传图片')}</div>
      <div className={styles["c7n-upload-max"]}>{icoFileList?.length || 0}/1</div>
    </div>
  );

  useEffect(() => {
    if (iconUrl) {
      dispatch({
        type: 'mallHomeConfig/updateState',
        payload: {
          icoFileList: [
            {
              uid: -1,
              name: 'favicon',
              status: 'done',
              url: iconUrl,
            },
          ],
        },
      });
    }
  }, [iconUrl]);

  const handleChange = ({ file }) => {
    dispatch({
      type: 'mallHomeConfig/updateState',
      payload: {
        icoFileList: [{ ...file }],
        iconUrl: file.response,
      },
    });
    switch (file.status) {
      case 'error':
        notification.warning({
          message: intl.get(`hzero.common.upload.status.error`).d('上传失败'),
        });
        break;
      case 'done':
        notification.success();
        break;
      default:
        break;
    }
  };

  const beforeUpload = (file) => {
    const fileSize = 1 * 1024 * 1024;
    const fileType = 'image/jpeg;image/jpg;image/png;image/vnd.microsoft.icon;';
    if (fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('small.mallHomeConfig.view.updateLoadFileTypeMustBeImg')
          .d('logo文件类型必须是: jpeg/jpg/png'),
      });
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl.get('small.mallHomeConfig.view.fileSizeLimit').d('上传大小不能超过1M'),
      });
      return false;
    }
    return true;
  };

  const handleRemove = (url) => {
    dispatch({
      type: 'mallHomeConfig/deleteImgUrl',
      payload: {
        urls: [url],
      },
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'mallHomeConfig/updateState',
          payload: {
            icoFileList: [],
            iconUrl: '',
          },
        });
      }
    });
  };

  const uploadProps = {
    name: 'file',
    accept: 'image/*',
    // fileList: icoFileList,
    listType: 'picture-card',
    className: 'mall-home-config-upload',
    action: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/multipart`,
    headers: { Authorization: `bearer ${getAccessToken()}` },
    data: (file) => ({
      bucketName: PUBLIC_BUCKET,
      fileName: file.name,
      directory: 'small-home-config',
    }),
    showUploadList: false,
    onChange: handleChange,
    beforeUpload,
  };

  return (
    <div>
      <div className="p-style" style={{ marginTop: 8 }}>
        {intl.get('small.mallHomeConfig.view.title.desc').d('标题会应用至浏览器网页标题的位置')}
      </div>
      <div className="p-style" style={{ marginBottom: 16 }}>
        {intl
          .get('small.mallHomeConfig.view.favicon.desc')
          .d(
            'favicon会应用至浏览器网页标题左侧的图标；图片支持PNG、ICO、JPG、JPEG格式，且不能大于1M'
          )}
      </div>
      <div style={{ width: 340, marginBottom: 16 }}>
        <Form columns={1} labelLayout="float">
          <TextField
            onChange={(e) =>
              dispatch({
                type: 'mallHomeConfig/updateState',
                payload: {
                  pageTitle: e,
                },
              })
            }
            value={pageTitle}
            label={intl.get('small.mallHomeConfig.view.web.title').d('网站名称')}
          />
        </Form>
      </div>
      {icoFileList.map((p) => (
        <div className={styles['ex-img-content']}>
          {p.url && <img src={`${p.url}`} alt="" />}
          <div className="cover">
            <Icon type="visibility" onClick={() => setVisible(true)} />
            <Icon type="delete" onClick={() => handleRemove(iconUrl)} />
          </div>
        </div>
      ))}
      <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
        <Upload showUploadList {...uploadProps}>
          {icoFileList?.length >= 1 ? null : uploadButton}
        </Upload>
      </div>
      <Modal visible={visible} footer={null} onCancel={() => setVisible(false)}>
        <img alt="example" style={{ width: '100%' }} src={iconUrl} />
      </Modal>
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(FaviconConfig);
