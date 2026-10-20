import React, { useMemo, useEffect, useCallback, useState } from 'react';
import type { ReactElement } from 'react';
import { observer } from 'mobx-react';
import { CheckBox, DataSet, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import type { TransportType } from 'choerodon-ui/dataset/data-set/Transport';

import imgSvg from '../../../assets/img.svg';
import { attachmentBatchDownLoadDS as attachmentBatchDownLoadDs } from './mainDS';
import { taxAttachmentAllLoad } from '../../../services/settlePoolServices';
import NoFile from '../NoFile';
import { getTextResponseApi } from '../../utils/index';
import Style from './index.less';

type FileType = 'OCR' | 'OFD' | 'MANUAL_UPLOAD' | 'EXTERNAL_IMPORT'
type InvoiceTypeMeaingMaps = {
  [key in FileType]?: string;
}

interface CategoryRenderProps
{
  dataSet: DataSet;
  invoiceTypeMeaningMaps: InvoiceTypeMeaingMaps
}

interface AttachFileProps
{
  file: {
    fileName: string;
    fileSize: number;
  }
}

interface InvAttachBatchProps
{
  readTransport: TransportType;
  modal: any;
  remote?: any;
  ds?: any;
}

const AttachmentItem = observer((props: AttachFileProps) =>
{
  const { file } = props;
  const { fileName, fileSize } = file || {};
  return (
    <div className="attachments-item">
      <img alt="" src={imgSvg} className="item-img" />
      <span className="item-text-distance">
        <span className="file-name">{fileName}</span>
        <span className="file-size">({(fileSize / (1024 * 1024)).toFixed(2)}KB)</span>
      </span>
    </div>
  );
});

const CategoryRender = observer(((props: CategoryRenderProps) =>
{
  const { dataSet, invoiceTypeMeaningMaps } = props;

  if (!dataSet?.current) return;
  const fileDTO = dataSet.current.get('fileDTO') || {};
  return Object.keys(invoiceTypeMeaningMaps).map((key) => fileDTO[key] ? (
    <div className={Style['ssta-settle-attachments-category']}>
      <CheckBox dataSet={dataSet} name="invoiceFileType" value={key} defaultChecked>
        <span style={{ fontWeight: 'bold' }}> {invoiceTypeMeaningMaps[key]}</span>
      </CheckBox>
      {['EXTERNAL_IMPORT'].includes(key) && (
        <div style={{ paddingTop: '5px', color: 'red' }}>
          {intl
            .get('ssta.common.view.message.externalImportWarning')
            .d('仅支持批量下载srm系统内部文件，外部系统文件链接暂不支持批量下载')}
        </div>
      )}
      <div className={Style['ssta-settle-attachments-content']}>
        {fileDTO[key].map((file: any) => (
          <AttachmentItem file={file} />
        ))}
      </div>
    </div>
  ) : (
    ''
  )
  );
}) as unknown as (props: any) => ReactElement);

export default observer(({ readTransport, modal, remote, ds }: InvAttachBatchProps) =>
{
  const attachmentBatchDownLoadDS = useMemo(
    () =>
      new DataSet({
        ...attachmentBatchDownLoadDs(readTransport),
        events: {
          update: ({ name, value }) =>
          {
            if (name === 'invoiceFileType')
            {
              modal.update({
                okProps: { disabled: value.length === 0 },
              });
            }
          },
        },
      }),
    [readTransport, modal]
  );

  const invoiceTypeMeaningMaps = useMemo(
    () => ({
      OCR: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.OCRSee').d('OCR文件'),
      OFD: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
      MANUAL_UPLOAD: intl.get('ssta.common.view.message.manualUploadFile').d('手工上传文件'),
      EXTERNAL_IMPORT: intl
        .get('ssta.common.view.message.externalImportFile')
        .d('外部系统返回文件'),
    }),
    []
  );

  const [isNoFiles, setisNoFiles] = useState(true); // 是否有文件
  const [loading, setLoading] = useState(true);

  const handleDownload = useCallback(async () =>
  {
    const { invoiceFileType, fileDTO = [] } = attachmentBatchDownLoadDS?.current?.get([
      'invoiceFileType',
      'fileDTO',
    ]);
    const params = {
      directory: intl.get('ssta.common.view.message.attachmentAllDownload').d('附件批量下载'),
      urls: [],
      uuids: [],
      lowerDirectory: Object.keys(invoiceTypeMeaningMaps).map((key) =>
      {
        const actualKeys = (invoiceFileType || []).filter((type: string) => type === key);
        const actualKey = actualKeys.length > 0 ? actualKeys[0] : undefined;
        return {
          directory: invoiceTypeMeaningMaps[key],
          urls: ((actualKey && fileDTO[actualKey]) || []).map((file: { fileUrl: any; }) => file.fileUrl),
          uuids: [],
          lowerDirectory: [],
        };
      }),
    };
    if (remote && remote.event) {
      const beforeRes = await remote.event.fireEvent('handleBatchDownloadCux', {
        params,
        attachmentBatchDownLoadDS,
        readTransport,
        setLoading,
        modal,
        taxAttachmentAllLoad,
        getTextResponseApi,
      });
      if (beforeRes === false) return false;
    }
    setLoading(true);
    const res = await taxAttachmentAllLoad(params);
    setLoading(false);
    const url = getTextResponseApi(res);
    if (!url) return false;
    const downloadElem = document.createElement('a');
    downloadElem.href = url;
    downloadElem.click();
    if (remote && remote.event) {
      remote.event.fireEvent('handleBatchDownloadAfterCux', {
        attachmentBatchDownLoadDS,
        setLoading,
        modal,
        tableDs: ds,
      });
    }
  }, [attachmentBatchDownLoadDS, invoiceTypeMeaningMaps, remote, modal]);

  useEffect(() =>
  {
    modal.handleOk(handleDownload);
    modal.update({
      okProps: { loading, disabled: isNoFiles },
      cancelProps: { loading },
    });
  }, [modal, handleDownload, loading, isNoFiles]);

  useEffect(() =>
  {
    setLoading(true);
    attachmentBatchDownLoadDS
      .query()
      .then((res) =>
      {
        if (res)
        {
          const { fileDTO } = res?.[0] || {};
          setisNoFiles(isEmpty(fileDTO || {}));
        }
        setLoading(false);
      })
      .catch(() =>
      {
        setLoading(false);
      });
  }, [modal, attachmentBatchDownLoadDS]);

  return (
    <Spin spinning={loading}>
      {!isNoFiles ? (
        <CategoryRender
          dataSet={attachmentBatchDownLoadDS}
          invoiceTypeMeaningMaps={invoiceTypeMeaningMaps}
        />
      ) : (
        <NoFile />
      )}
    </Spin>
  );
});
