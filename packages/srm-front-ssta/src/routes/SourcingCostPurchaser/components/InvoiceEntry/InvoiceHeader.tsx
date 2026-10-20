import React, { useMemo, useCallback, useState, Fragment } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Form, Select, Lov, DatePicker, TextField, NumberField, Attachment, Output } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Icon } from 'choerodon-ui';
import Viewer from 'react-viewer';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import {
  getResponse,
  getAttachmentUrl,
  filterNullValueObject,
  getCurrentOrganizationId,
} from 'utils/utils';

import { updateAttachmentTaxAction } from './api';
import { previewPdf, getAttachmentUrlWithToken } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const bucketDirectory = 'finance-invoice';
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';

interface InvoiceHeaderProps {
  primaryKey: string,
  invoiceHeaderDs: DataSet,
}

const InvoiceHeader = observer((props: InvoiceHeaderProps) => {

  const { primaryKey, invoiceHeaderDs } = props;
  const [viewVisile, setViewVisible] = useState(false);
  const ocrFileUrl = invoiceHeaderDs.current?.get('ocrFileUrl');

  const onAttachmentsChange = useCallback(
    async (fileOpType, fileName?, fileUrl?) => {
      const { [primaryKey]: invoiceHeaderId, attachmentUuid } =
        invoiceHeaderDs.current?.get([primaryKey, 'attachmentUuid']) || {};
      // 当发票头的attachmentUuid不为空时，上传和删除附件要请求一个新增的接口
      if (attachmentUuid) {
        getResponse(
          await updateAttachmentTaxAction(
            filterNullValueObject({
              invoiceHeaderId,
              attachmentUuid,
              fileOpType,
              deleteFileName: fileName,
              deleteFileUrl: fileUrl,
            })
          )
        );
      }
    },
    [invoiceHeaderDs, primaryKey]
  );

  const handleViewOcrFile = useCallback(() => {
    const fA = ocrFileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(ocrFileUrl);
    else if (fileExt.toLowerCase() === 'ofd') return getAttachmentUrlWithToken(ocrFileUrl);
    setViewVisible(true);
  }, [ocrFileUrl]);

  const handleRemoveFile = useCallback((attachment) => {
    const { fileName, fileUrl } = attachment;
    onAttachmentsChange('DELETE', fileName, fileUrl);
  }, [onAttachmentsChange]);

  const viewImages = useMemo(() => {
    const downloadUrl = (getAttachmentUrl as any)(ocrFileUrl, bucketName, tenantId, bucketDirectory);
    return [
      {
        alt: '',
        downloadUrl,
        src: downloadUrl,
      },
    ];
  }, [ocrFileUrl]);

  return (
    <Fragment>
      <Form
        columns={2}
        useColon={false}
        dataSet={invoiceHeaderDs}
        labelLayout={LabelLayout.float}
      >
        <Select name='invoiceType' />
        <TextField name='invoiceCode' />
        <TextField name='invoiceNum' />
        <DatePicker name='invoicingDate' />
        <NumberField name='netAmount' />
        <NumberField name='taxAmount' />
        <Lov name='companyLov' />
        <Lov name='supplierCompanyLov' />
        <TextField name='checkCode' />
        <TextField name='memo' />
        {ocrFileUrl && (
          <Output
            name='uniSee'
            renderer={() => (
              <a onClick={handleViewOcrFile}>
                <Icon type="find_in_page" />
                {intl.get('ssta.invoice.model.invoice.OCRFile').d('OCR文件')}
              </a>
            )}
          />
        )}
        <Attachment
          max={9}
          sortable
          showHistory
          viewMode="popup"
          name="attachmentUuid"
          bucketName={bucketName}
          bucketDirectory="finance-invoice"
          className="head-upload-attachment"
          onUploadSuccess={() => onAttachmentsChange('UPLOAD')}
          onRemove={handleRemoveFile}
        />
      </Form>
      <Viewer
        noNavbar
        downloadable
        noImgDetails
        scalable={false}
        changeable={false}
        images={viewImages}
        visible={viewVisile}
        onClose={() => setViewVisible(false)}
      />
    </Fragment>
  );
});

export default InvoiceHeader;