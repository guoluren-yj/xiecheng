import React, { useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Select, Lov, DatePicker, TextField, NumberField, Attachment, Output, Spin } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { updateAttachmentTaxAction } from '@/services/invoicePurPoolService';
import EditorForm from '@/routes/Components/EditorForm';

export default observer((props) => {
  const { customizeForm, headerAddDS, customizeCode, showModal, remote, invoiceLineAddDS } = props;
  const { ocrFileUrl, ofdFileUrl, aiAttachmentUrl } =
    headerAddDS?.current?.get(['ocrFileUrl', 'ofdFileUrl', 'aiAttachmentUrl']) || {};
  const isDisabledFlag = ocrFileUrl || ofdFileUrl ? false : invoiceLineAddDS?.length > 0;

  const handleBeforeUpload = useCallback(
    (_, attachmentFiles) => {
      headerAddDS.setState(
        'originFileUrlList',
        (attachmentFiles || []).filter((attach) => attach.fileUrl).map((attach) => attach.fileUrl)
      );
    },
    [headerAddDS]
  );

  const onAttachmentsChange = useCallback(
    async (fileOpType, attachment) => {
      const { fileName, fileUrl, attachmentUUID } = attachment || {};
      const { invoiceHeaderId } = headerAddDS?.current?.get(['invoiceHeaderId']) || {};
      // 当发票头的attachmentUuid不为空时，上传和删除附件要请求一个新增的接口
      if (invoiceHeaderId) {
        getResponse(
          await updateAttachmentTaxAction(
            filterNullValueObject({
              invoiceHeaderId,
              attachmentUuid: attachmentUUID,
              fileOpType,
              deleteFileName: fileOpType === 'DELETE' ? fileName : null,
              deleteFileUrl: fileOpType === 'DELETE' ? fileUrl : null,
              originFileUrlList: fileOpType === 'UPLOAD' ? headerAddDS.getState('originFileUrlList') || [] : null,
            })
          )
        );
      }
    },
    [headerAddDS]
  );

  const editorColumns = useMemo(() => {
    const columnsList = [
      {
        name: 'invoiceType',
        editor: Select,
      },
      { name: 'invoiceCode', editor: TextField },
      { name: 'invoiceNum', editor: TextField },
      {
        name: 'invoicingDate',
        editor: DatePicker,
      },
      {
        name: 'netAmount',
        editor: NumberField,
        disabled: isDisabledFlag,
      },
      {
        name: 'taxAmount',
        editor: NumberField,
        disabled: isDisabledFlag,
      },
      {
        name: 'belongCompanyIdLov',
        editor: Lov,
      },
      {
        name: 'belongSupplierCompanyIdLov',
        editor: Lov,
      },
      {
        name: 'companyNameLov',
        editor: Lov,
      },
      {
        name: 'supplierCompanyNameLov',
        editor: Lov,
      },
      {
        name: 'checkCode',
        editor: TextField,
      },
      {
        name: 'memo',
        editor: TextField,
      },
      ocrFileUrl && {
        name: 'uniSee',
        editor: Output,
        renderer: ({ record }) => (
          <a onClick={() => showModal(record)}>
            <Icon type="find_in_page" />
            {intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.OCRSee').d('OCR文件')}
          </a>
        ),
      },
      aiAttachmentUrl && {
        name: 'aiAttachmentUrl',
        editor: Output,
        renderer: ({ record }) => (
          <a onClick={() => showModal(record)}>
            <Icon type="find_in_page" />
            {intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.AISee').d('AI文件')}
          </a>
        ),
      },
      { name: 'buyerContact' },
      { name: 'sellerContact' },
      { name: 'beneficiaryBank' },
      { name: 'beneficiaryAccountNum' },
      { name: 'beneficiaryAccountName' },
      { name: 'beneficiaryBankAddress' },
      { name: 'paymentTerms' },
      {
        name: 'attachmentUuid',
        editor: () => {
          return (
            <Attachment
              name="attachmentUuid"
              className="head-upload-attachment"
              viewMode="popup"
              bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
              max={9}
              bucketDirectory="finance-invoice"
              sortable
              showHistory
              beforeUpload={handleBeforeUpload}
              onUploadSuccess={(_, attachment) => onAttachmentsChange('UPLOAD', attachment)}
              onRemove={(attachment) => {
                return onAttachmentsChange('DELETE', attachment);
              }}
            />
          );
        },
      },
    ].filter((item) => item);
    return remote && remote.process
      ? remote.process('SSTA_SUPINVOICE_POOL_DETAIL_ACTION.COLUMNS', columnsList, { headerAddDS })
      : columnsList;
  }, [
    isDisabledFlag,
    showModal,
    ocrFileUrl,
    aiAttachmentUrl,
    headerAddDS,
    onAttachmentsChange,
    handleBeforeUpload,
    remote,
  ]);
  if (!headerAddDS?.current) return <Spin loading />;
  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerAddDS}
      editorFlag
      editorColumns={editorColumns}
      customizeOptions={{ code: customizeCode }}
      customizeForm={customizeForm}
    />
  );
});
