import React, { useEffect, useState, useRef } from 'react';
import { Row, Col } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { List, Icon } from 'hzero-ui';
import {
  getResponse,
  getCurrentOrganizationId,
  getAccessToken,
  isTenantRoleLevel,
} from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import {
  downloadTechnicalReport,
  downloadNotaryOfficeReport,
} from '@/services/purchaseContractViewService';

const newUrlPreviewList = [
  // ".doc", ".docx", ".docm",
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  // ".pdf",
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
];
const ContentModal = (props) => {
  const { data } = props;
  const leftRes = useRef(''); // 技术报告
  const rightRes = useRef(''); // 公证处报告
  const qysRes = useRef(''); // 契约锁存证
  const [leftLoading, setLeftLoading] = useState(true);
  const [rightLoading, setRightLoading] = useState(true);
  const [qysLoading, setQYSLoading] = useState(true);
  useEffect(() => {
    if (['FDD', 'FDD_SAAS'].includes(data.authType)) {
      downloadFDD();
    } else {
      downloadQYS();
    }
  }, []);
  // 法大大
  const downloadFDD = () => {
    setQYSLoading(false);
    downloadTechnicalReport(data.pcHeaderId)
      .then((res) => {
        if (getResponse(res)) {
          leftRes.current = res;
        }
      })
      .finally(() => {
        setLeftLoading(false);
      });
    downloadNotaryOfficeReport(data.pcHeaderId)
      .then((res) => {
        if (getResponse(res)) {
          rightRes.current = res;
        }
      })
      .finally(() => {
        setRightLoading(false);
      });
  };
  // 契约锁
  const downloadQYS = () => {
    setLeftLoading(false);
    setRightLoading(false);
    downloadNotaryOfficeReport(data.pcHeaderId)
      .then((res) => {
        if (getResponse(res)) {
          qysRes.current = res;
        }
      })
      .finally(() => {
        setQYSLoading(false);
      });
  };
  // 下载
  const downloadReport = (url) => {
    const organizationId = getCurrentOrganizationId();
    const api = `${HZERO_FILE}/v1/${organizationId}/files/download?bucketName=${PRIVATE_BUCKET}&url=${url}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: PRIVATE_BUCKET },
        { name: 'url', value: url },
      ],
    });
  };
  // 预览
  const previewReport = (reportUrl) => {
    const fA = reportUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    const url = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/${
          newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
        }`
      : `${HZERO_FILE}/v1/${
          newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
        }`;
    window.open(
      `${url}?url=${encodeURIComponent(
        reportUrl
      )}&bucketName=${'private-bucket'}&access_token=${getAccessToken()}`
    );
  };
  const modalContent = (
    <React.Fragment>
      <Spin spinning={rightLoading || leftLoading || qysLoading}>
        {['FDD', 'FDD_SAAS'].includes(data.authType) ? (
          <Row gutter={24}>
            <Col span={12}>
              <List
                header={
                  <div>
                    {intl.get(`spcm.common.view.technicalReportDownload`).d('技术报告下载')}:
                  </div>
                }
                bordered
                dataSource={leftRes?.current || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <a
                          style={{ color: '#29BECE' }}
                          onClick={() => downloadReport(item.fileUrl)}
                        >
                          {item.fileName}
                        </a>
                      }
                    />
                    <Icon
                      title={intl.get('hzero.common.upload.previewFile').d('预览附件')}
                      onClick={() => previewReport(item.fileUrl)}
                      style={{
                        float: 'right',
                        fontSize: '16px',
                        lineHeight: '22px',
                        paddingLeft: '6px',
                        cursor: 'pointer',
                        color: '#29BECE',
                      }}
                      type="eye-o"
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={12}>
              <List
                header={
                  <div>
                    {intl.get(`spcm.common.view.notaryOfficeReportDownload`).d('公证处报告下载')}:
                  </div>
                }
                bordered
                dataSource={rightRes?.current || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <a
                          style={{ color: '#29BECE' }}
                          onClick={() => downloadReport(item.fileUrl)}
                        >
                          {item.fileName}
                        </a>
                      }
                    />
                    <Icon
                      title={intl.get('hzero.common.upload.previewFile').d('预览附件')}
                      onClick={() => previewReport(item.fileUrl)}
                      style={{
                        float: 'right',
                        fontSize: '16px',
                        lineHeight: '22px',
                        paddingLeft: '6px',
                        cursor: 'pointer',
                        color: '#29BECE',
                      }}
                      type="eye-o"
                    />
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        ) : (
          <List
            header={
              <div>{intl.get(`spcm.common.view.certificateDownloadQYS`).d('契约锁存证下载')}:</div>
            }
            bordered
            dataSource={qysRes?.current || []}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <a style={{ color: '#29BECE' }} onClick={() => downloadReport(item.fileUrl)}>
                      {item.fileName}
                    </a>
                  }
                />
                <Icon
                  title={intl.get('hzero.common.upload.previewFile').d('预览附件')}
                  onClick={() => previewReport(item.fileUrl)}
                  style={{
                    float: 'right',
                    fontSize: '16px',
                    lineHeight: '22px',
                    paddingLeft: '6px',
                    cursor: 'pointer',
                    color: '#29BECE',
                  }}
                  type="eye-o"
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </React.Fragment>
  );

  return modalContent;
};

export default ContentModal;
