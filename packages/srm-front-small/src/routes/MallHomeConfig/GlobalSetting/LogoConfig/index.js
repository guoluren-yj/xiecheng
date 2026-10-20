import React, { useState, useEffect } from 'react';
import { Upload, Icon, Modal } from 'choerodon-ui';
import { compose } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import { PUBLIC_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { fetchDetail } from '@/services/mallHomeConfigService';
import styles from './index.less';

function LogoConfig(props) {
  const {
    mallHomeConfig: { fileList, currentlogoUrl },
    dispatch,
  } = props;
  const [visible, setVisible] = useState(false);
  const uploadButton = (
    <div>
      <Icon type="add" />
      <div className={styles["c7n-upload-text"]}>{intl.get('small.common.upload.desc').d('上传图片')}</div>
      <div className={styles["c7n-upload-max"]}>{fileList?.length || 0}/1</div>
    </div>
  );

  useEffect(() => {
    getLogoUrl();
  }, []);

  function getLogoUrl() {
    fetchDetail({
      srmUrl: window.location.origin,
      // srmUrl: 'https://gjsc100.dev.isrm.going-link.com',
    }).then((res) => {
      dispatch({
        type: 'mallHomeConfig/updateState',
        payload: {
          currentlogoUrl: res?.logoUrl,
        },
      });
    });
  }

  useEffect(() => {
    if (currentlogoUrl) {
      dispatch({
        type: 'mallHomeConfig/updateState',
        payload: {
          fileList: [{ url: currentlogoUrl, uid: uuid() }],
        },
      });
    }
  }, [currentlogoUrl]);

  const handleChange = ({ file }) => {
    dispatch({
      type: 'mallHomeConfig/updateState',
      payload: {
        fileList: [{ ...file, url: file.response, status: 'done' }],
        currentlogoUrl: file.response,
      },
    });
    switch (file.status) {
      case 'error':
        dispatch({
          type: 'mallHomeConfig/updateState',
          payload: {
            fileList: [],
            currentlogoUrl: '',
          },
        });
        notification.warning({
          message: intl.get(`hzero.common.upload.status.error`).d('上传失败'),
        });
        break;
      case 'done':
        // notification.success();
        break;
      default:
        break;
    }
  };

  const beforeUpload = (file) => {
    const fileSize = 1 * 1024 * 1024;
    const fileType = 'image/jpeg;image/jpg;image/png;';
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

  const handleRemove = () => {
    dispatch({
      type: 'mallHomeConfig/updateState',
      payload: {
        fileList: [],
        currentlogoUrl: '',
      },
    });
  };

  return (
    <>
      <div className="p-style" style={{ marginTop: 8, marginBottom: 16 }}>
        {intl
          .get('small.mallHomeConfig.view.uploadType.1M')
          .d('图片支持PNG、JPG、JPEG格式，且不能大于1M')}
      </div>
      <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
        <Upload
          name="file"
          accept="image/*"
          listType="picture-card"
          className="mall-home-config-upload"
          fileList={fileList}
          action={`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/multipart`}
          headers={{ Authorization: `bearer ${getAccessToken()}` }}
          data={(file) => ({
          bucketName: PUBLIC_BUCKET,
          fileName: file.name,
          directory: 'small-home-config',
        })}
          onChange={handleChange}
          onRemove={(file) => {
          handleRemove(file.url);
        }}
          onPreview={() => setVisible(true)}
          beforeUpload={beforeUpload}
        >
          {fileList?.length >= 1 ? null : uploadButton}
        </Upload>
      </div>
      <Modal visible={visible} footer={null} onCancel={() => setVisible(false)}>
        <img alt="example" style={{ width: '100%' }} src={currentlogoUrl} />
      </Modal>
    </>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(LogoConfig);
