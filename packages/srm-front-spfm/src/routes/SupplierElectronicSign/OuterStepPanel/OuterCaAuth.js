import React, { useMemo, useState, useEffect } from 'react';
import { DataSet, Form, Output, Button, Spin } from 'choerodon-ui/pro';
import { Upload, Icon } from 'choerodon-ui';
import Viewer from 'react-viewer';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import notification from 'utils/notification';
import { getEnvConfig } from 'utils/iocUtils';
import {
  getResponse,
  getCurrentOrganizationId,
  getAttachmentUrl,
  getAccessToken,
} from 'utils/utils';
// import { downloadFile } from 'services/api';

import {
  fetchUploadFile,
  fetchAttachUuid,
  getFileList,
  fetchSavePayment,
} from '@/services/supplierElecSignWorkplaceService';
import { createAttachmentUUID } from '@/utils/utils';

import { BankDetailDS } from '../stores/supplierSignDS';
import styles from './index.less';

const { BKT_HFILE } = getEnvConfig();
const DICTIONARY = 'spfm-comp';

let attachmentUuid = '';
let allegedUrl = '';

export default function OuterCaAuth(props) {
  const { companyDetail, authType, approveFlag, tenantId, onRefreshStatus = () => {} } = props;

  const basicFormDS = useMemo(() => new DataSet({ ...BankDetailDS() }), []);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [refresh, setRefresh] = useState(false); //
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImage] = useState([]);

  useEffect(() => {
    handleGetUuid();
    return () => {
      attachmentUuid = '';
      allegedUrl = '';
    };
  }, []);

  useEffect(() => {
    if (approveFlag) {
      handleSavePayment();
    }
  }, [approveFlag]);

  useEffect(() => {
    if (companyDetail && companyDetail.companyId && authType) {
      basicFormDS.setQueryParameter('companyId', companyDetail.companyId);
      basicFormDS.setQueryParameter('authType', authType);
      basicFormDS.query();
    }
  }, [companyDetail, authType]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleGetUuid = async () => {
    attachmentUuid = await createAttachmentUUID();
  };

  /**
   * 查看授权书
   */
  const showPdf = (record) => {
    const fileUrl = record && record.get ? record.get('licenceUrl') : '';

    const preUrl = fileUrl
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url?url=${fileUrl}&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
      : '';

    if (!fileUrl) return false;
    setPreviewImage([
      {
        src: preUrl,
        alt: '', // 由于下方会显示 alt 所以这里给空字符串 file.name,
      },
    ]);
    setPreviewVisible(true);
  };

  const handleRemoveFile = () => {
    setFileList([]);
  };

  const uploadSuccess = (fileUrl) => {
    allegedUrl = fileUrl;
  };

  /**
   * 上传前校验
   * @param {*} file
   * @returns
   */
  const beforeUpload = (file) => {
    const fileSize = 20; // 限制不超过10MB
    if (file.size > fileSize * 1024 * 1024) {
      file.status = 'error'; // eslint-disable-line
      setFileList([]);
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
      } else {
        setFileList([]);
      }
    });

    return false;
  };

  const handleSavePayment = async () => {
    const obj = basicFormDS?.toData()[0] ?? {};

    if (Object.keys(obj).length > 0 && authType && allegedUrl) {
      setFetchLoading(true);
      setRefresh(true);
      // 打款验证信息
      const res = await fetchSavePayment({
        ...companyDetail,
        ...obj,
        authType,
        allegedUUID: attachmentUuid,
        allegedUrl,
        partnerTenant: tenantId,
      });
      setFetchLoading(false);
      setRefresh(true);
      if (getResponse(res)) {
        onRefreshStatus();
      }
    } else {
      notification.info({
        message: intl.get('spfm.buyerElectronicSign.view.message.fileNotNull').d('授权书不能为空'),
      });
    }
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

  const handleDownloadFile = async () => {
    const result = await fetchAttachUuid();
    if (result && result.fileUuid) {
      const res = await getFileList({ uuid: result.fileUuid });
      if (getResponse(res) && Array.isArray(res) && res.length) {
        const fileObj = res[0];
        if (fileObj.fileUrl) {
          const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url`;
          window.open(
            `${url}?url=${
              fileObj.fileUrl
            }&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
          );
        }
      }
    }
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
    <Spin spinning={fetchLoading}>
      <div className={styles['outer-ca-auth-card-title']}>
        {intl.get('spfm.supplierElectronicSign.view.title.businessInfo').d('企业信息')}
      </div>
      <div style={{ marginTop: '20px' }}>
        <Form dataSet={basicFormDS} columns={3} labelLayout="float">
          <Output name="companyNum" />
          <Output name="companyName" />
          <Output name="registerNumber" />
          <Output
            label={intl
              .get('spfm.supplierElectronicSign.view.title.registerBook')
              .d('企业注册证书')}
            name="showPdf"
            renderer={({ record }) => {
              const licenceUrl = record && record.get ? record.get('licenceUrl') : '';
              return licenceUrl ? (
                <a onClick={() => showPdf(record)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </a>
              ) : (
                '-'
              );
            }}
          />
        </Form>
      </div>

      <div className={styles['outer-ca-auth-card-title']} style={{ marginTop: '32px' }}>
        {intl.get('spfm.supplierElectronicSign.view.button.uploadAuthLetter').d('上传授权书')}
      </div>
      <div style={{ marginTop: '4px' }}>
        <span style={{ color: '#868D9C;' }}>
          {intl
            .get('spfm.supplierElectronicSign.view.message.uploadMessage')
            .d('为确保组织真实意愿，需组织线下签署授权书进行认证授权申请；')}
        </span>
        <Button icon="file_download_black-o" funcType="link" onClick={handleDownloadFile}>
          <span>
            {intl.get('spfm.supplierElectronicSign.view.button.downAuthLetter').d('下载授权书模板')}
          </span>
        </Button>
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{ color: '#4E5769' }}>
          {intl
            .get('spfm.supplierElectronicSign.view.button.uploadSignAuth')
            .d('上传授权书（需线下加盖公章）')}
        </div>
        <Upload
          name="sign-up"
          listType="picture-card"
          className="avatar-uploader"
          action=""
          accept=".png,.jpg"
          fileList={fileList}
          onPreview={handlePreview}
          beforeUpload={beforeUpload}
          onChange={() => {}}
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
      </div>
    </Spin>
  );
}
