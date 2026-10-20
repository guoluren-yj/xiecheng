import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import { Icon, Upload } from 'choerodon-ui';
import { Form, TextField, Select } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { getEnvConfig } from 'utils/iocUtils';
// import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { queryFileList } from 'services/api';
import Viewer from 'react-viewer';

import { fetchUploadFile } from '@/services/supplierElecSignWorkplaceService'; // fetchFileByUuid

import styles from './index.less';

// const BKT_HFILE = PRIVATE_BUCKET;
const { BKT_HFILE } = getEnvConfig();
const DICTIONARY = 'spfm-comp';

export default function SignEditModal(props) {
  const { signAttachDS, attachmentUuid, record, defaultImageUrl, tenantNum, authType } = props;

  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false); //
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImage] = useState([]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (defaultImageUrl && attachmentUuid) {
      queryFileList({
        attachmentUUID: attachmentUuid,
        bucketName: BKT_HFILE,
        tenantId: getCurrentOrganizationId(),
      }).then((res) => {
        if (getResponse(res) && Array.isArray(res) && res.length) {
          let files = null;
          res.forEach((item, index) => {
            if (item.fileUrl === defaultImageUrl) {
              const url = getAttachmentUrl(
                item.fileUrl,
                BKT_HFILE,
                getCurrentOrganizationId(),
                DICTIONARY
              );
              files = {
                uid: index,
                name: item.fileName,
                status: 'done',
                url,
              };
            }
          });

          if (files) {
            setFileList([files]);
            setRefresh(true);
          }
        }
      });
    }
  }, [defaultImageUrl, attachmentUuid]);

  const handleChangeFile = () => {};

  const handleRemoveFile = () => {
    if (signAttachDS && signAttachDS.current) {
      signAttachDS.current.set('sealFileUrl', '');
      signAttachDS.current.set('sealPictureUrl', '');
    }
    setFileList([]);
  };

  const uploadSuccess = (res) => {
    if (signAttachDS && signAttachDS.current) {
      signAttachDS.current.set('sealFileUrl', res);
      signAttachDS.current.set('sealPictureUrl', res);
    }
  };

  /**
   * 上传前校验
   * @param {*} file
   * @returns
   */
  const beforeUpload = (file) => {
    const fileSize = 2; // 限制不超过10MB
    const authTypeStr = (record && record.get && record.get('sealType')) || authType;
    if (authTypeStr !== 'ESIGN' && file.size > fileSize * 1024 * 1024) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`spfm.buyerElectronicSign.model.fddUploadMsg`)
          .d('图片只支持png和jpg格式，不能大于2MB'),
      };
      file.response = res; // eslint-disable-line
      setFileList([]);
      notification.error({
        message: intl.get('hzero.common.status.mistake'),
        description: intl
          .get(`spfm.buyerElectronicSign.model.fddUploadMsg`)
          .d('图片只支持png和jpg格式，不能大于2MB'),
      });
      return false;
    }

    if (authTypeStr === 'ESIGN' && file.size > 50 * 1024) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`spfm.buyerElectronicSign.model.esignUploadMsg`)
          .d('图片只支持png和jpg格式，不能大于50KB'),
      };
      file.response = res; // eslint-disable-line
      setFileList([]);
      notification.error({
        message: intl.get('hzero.common.status.mistake'),
        description: intl
          .get(`spfm.buyerElectronicSign.model.esignUploadMsg`)
          .d('图片只支持png和jpg格式，不能大于50KB'),
      });
      return false;
    }

    const formData = new FormData();

    if (!attachmentUuid) {
      notification.info({
        message: intl
          .get('spfm.buyerElectronicSign.view.message.mustNeedUuid')
          .d('attachmentUuid不能为空'),
      });
      setFileList([]);
      return false;
    }

    formData.append('file', new Blob([file]));
    formData.append('fileName', file.name);
    formData.append('attachmentUUID', attachmentUuid);
    formData.append('bucketName', BKT_HFILE);
    formData.append('directory', DICTIONARY);
    formData.append('bucketDirectory', DICTIONARY);

    setLoading(true);
    setRefresh(true);
    // 上传文件
    fetchUploadFile(formData).then((res) => {
      setLoading(false);
      if (getResponse(res) && res && typeof res === 'string') {
        if (res.includes('failed') && res.includes('message')) {
          const obj = JSON.parse(res);
          notification.error({
            message: intl.get('hzero.common.status.mistake'),
            description: obj?.message,
          });
          return;
        }
        uploadSuccess(res);
        const url = getAttachmentUrl(res, BKT_HFILE, getCurrentOrganizationId(), DICTIONARY);
        setFileList([
          {
            ...file,
            url,
          },
        ]);
      }
    });

    return false;
  };

  const handlePreview = (file) => {
    setPreviewImage([
      {
        src: file.url || file.thumbUrl,
        alt: '', // 由于下方会显示 alt 所以这里给空字符串 file.name,
      },
    ]);
    setPreviewVisible(true);
  };

  const handlePreviewCancel = () => {
    setPreviewImage([]);
    setPreviewVisible(false);
  };

  const uploadButton = (
    <div>
      <Icon type={loading ? 'loading' : 'add'} />
      <div className="c7n-upload-text">
        {intl.get('hzero.common.title.uploadImage').d('上传图片')}
      </div>
    </div>
  );

  return (
    <div className={styles['seal-edit-form-basic']}>
      <Form dataSet={signAttachDS} columns={1} labelLayout="float">
        <TextField
          name="sealCode"
          format="uppercase"
          // pattern="/^[A-Z|\d]+$/"
          disabled={record && record.get('sealCode')}
        />
        <div className={styles['modal-form-help-msg']}>
          {intl.get('spfm.sealmanage.view.message.sealCodeHelpMsg').d('请填写1-13位数字或大写字母')}
        </div>
        <TextField name="sealName" />
        {/* <Attachment
                name="attachmentUuid"
                listType="picture-card"
                onUploadSuccess={uploadSuccess}
                onRemove={handleRemove}
              /> */}
        {tenantNum === 'SRM-EPPEN' && <Select name="sealBizType" />}
        <Upload
          name="sign-up"
          listType="picture-card"
          className="avatar-uploader"
          action=""
          accept=".png,.jpg"
          fileList={fileList}
          onPreview={handlePreview}
          beforeUpload={beforeUpload}
          onChange={handleChangeFile}
          onRemove={handleRemoveFile}
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>

        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={handlePreviewCancel}
          images={previewImages}
        />
      </Form>
    </div>
  );
}
