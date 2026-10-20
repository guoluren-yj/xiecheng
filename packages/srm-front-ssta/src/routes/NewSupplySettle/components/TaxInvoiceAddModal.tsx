/*
 * @Description: file content
 * @Date: 2022-12-2 13:18:10
 * @Author: xie.yan <yan.xie@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useMemo, useCallback, useContext, useEffect, cloneElement } from 'react';
import { Lov, Icon, Table, Output, Select, DataSet, TextField, DatePicker, Attachment, NumberField, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isNil, isUndefined, isFunction, isEmpty } from 'lodash';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { Store } from '../Detail/StoreProvider';
import EditorForm from '../../Components/EditorForm';
import { getSelectedNegActConfirmMsg } from '../../../utils/utils';
import { getTaxConfig } from '../../../services/settlePoolServices';
import { updateAttachmentTax } from '../../../services/invoicePurPoolService';
import { updateAttachmentTaxAction } from '../../../services/settlePoolServices';
import { taxInvHeaderDS, taxInvLineDS } from '../../../stores/NewSupplySettleDS';
import commonStyles from '../../common.less';

const lineUnitCodes = {
  add: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.LINE_CREATE',
  edit: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE.HEAD_EDIT.LINE_CREATE',
};
const headUnitCodes = {
  add: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_ADD',
  edit: 'SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_EDIT',
};

export default observer((props) => {
  const { modal, recordData, okCallback, handleViewOcrFile } = props;

  const {
    customizeForm,
    customizeTable,
    settleHeaderId,
    enableCheckFlag,
    settleHeader,
    remoteProps,
  } = useContext<any>(Store);
  const { ocrFileUrl, ofdFileUrl, aiAttachmentUrl, taxInvoiceHeaderId } = recordData || {};
  const type = isNil(taxInvoiceHeaderId) ? 'add' : 'edit';
  const taxInvoiceLineCreateFlag = settleHeader?.get('enableTaxInvoiceLineCreateFlag');
  const enableTaxInvoiceLineCreateFlag = isUndefined(taxInvoiceLineCreateFlag) ? true : taxInvoiceLineCreateFlag;

  const onHeaderUpdate = useCallback(({ record, name }) => {
    if (['invoiceSpecies'].includes(name)) {
      // 发票类型发生变化，发票代码清空
      record.set('invoiceCode', record.getField('invoiceCode').get('defaultValue'));
    }
    if (remoteProps?.event) {
      remoteProps.event.fireEvent('onTaxAddHeaderUpdateCux', {
        record,
        name,
      });
    }
  }, [remoteProps]);

  // 行输入变化
  const onLineUpdate = useCallback(({ record, name, value }) => {
    if (remoteProps?.event) {
      // 三宁 行更新埋点处理输入数量和单据后，计算金额和税额，如果后面加标准逻辑，有冲突需要检查三宁二开
      remoteProps.event.fireEvent('onTaxAddLineUpdateCux', {
        record,
        name,
        value,
        settleHeader,
      });
    }
  }, [remoteProps, settleHeader]);

  const taxInvLineDs = useMemo(() => new DataSet({
    ...taxInvLineDS(lineUnitCodes[type]),
    events: { update: onLineUpdate },
  }), [type, onLineUpdate]);
  const taxInvHeaderDs = useMemo(() => new DataSet({
    ...taxInvHeaderDS({
      settleHeaderId,
      enableCheckFlag,
      taxInvoiceHeaderId,
      customizeUnitCode: `${headUnitCodes[type]},${lineUnitCodes[type]}`,
    }),
    events: { update: onHeaderUpdate },
    children: { taxInvoiceLineList: taxInvLineDs },
  }), [type, taxInvLineDs, settleHeaderId, enableCheckFlag, taxInvoiceHeaderId, onHeaderUpdate]);

  const loading = taxInvHeaderDs.status !== 'ready';
  const isDisabledFlag = ocrFileUrl || ofdFileUrl ? false : taxInvLineDs.length > 0;

  useEffect(() => {
    // 获取发票号码，发票代码的配置信息
    getTaxConfig().then((res) => {
      if (getResponse(res)) {
        taxInvHeaderDs.setState('taxConfigMap', res);
      }
    });
  }, [taxInvHeaderDs]);

  const handleSave = useCallback(async (stayOpenModal = false) => {
    const res = await taxInvHeaderDs.submit();
    if (!res) return false;
    if (isFunction(okCallback)) okCallback();
    if (stayOpenModal && res.content && !isEmpty(res.content)) {
      // 重新加载信息,获取头汇总金额和默认信息
      // taxInvHeaderDs.loadData(res.content[0].taxInvoiceHeaderList || []);
      // 由于props中的taxInvoiceHeaderId没值，查询的时候会报错
      taxInvHeaderDs.setState('taxInvoiceHeaderId', res.content[0].taxInvoiceHeaderList[0].taxInvoiceHeaderId);
      taxInvHeaderDs.query();
      return false;
    };
  }, [taxInvHeaderDs, okCallback]);

  useEffect(() => {
    modal.update({
      footer: (okBtn, cancelBtn) => [
        cloneElement(okBtn, { loading }),
        <Button loading={loading} onClick={() => handleSave(true)}>{intl.get(`ssta.common.button.onlySave`).d('仅保存')}</Button>,
        cancelBtn,
      ],
      okText: intl.get(`ssta.common.button.saveAndClose`).d('保存并关闭'),
    });
  }, [modal, loading, handleSave]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSave);
  }, [modal, handleSave]);

  const handleBeforeUpload = useCallback(
    (_, attachmentFiles) => {
      taxInvHeaderDs.setState(
        'originFileUrlList',
        (attachmentFiles || []).filter((attach) => attach.fileUrl).map((attach) => attach.fileUrl)
      );
      return true;
    },
    [taxInvHeaderDs]
  );

  const onAttachmentsChange = useCallback(
    async (fileOpType, attachment) => {
      const { fileName, fileUrl, attachmentUUID } = attachment || {};
      const { taxInvoiceHeaderId, attachmentUuid } =
      taxInvHeaderDs?.current?.get(['taxInvoiceHeaderId', 'attachmentUuid']) || {};
      if (taxInvoiceHeaderId) {
        try {
          // 当attachmentUuid不为空时，上传和删除附件要请求一个新增的接口
          getResponse(
            await updateAttachmentTaxAction(
              filterNullValueObject({
                taxInvoiceHeaderId,
                attachmentUuid: attachmentUUID,
                fileOpType,
                deleteFileName: fileOpType === 'DELETE' ? fileName : null,
                deleteFileUrl: fileOpType === 'DELETE' ? fileUrl : null,
                originFileUrlList:
                  fileOpType === 'UPLOAD' ? taxInvHeaderDs.getState('originFileUrlList') || [] : null,
              })
            )
          );
        } finally {
          // 上传成功后，调用更新行附件的接口,如果已经有了attachmentUuid不需要再调更新接口
          if (!attachmentUuid && fileOpType === 'UPLOAD') {
            const res = await updateAttachmentTax({
              taxInvoiceHeaderId,
              attachmentUuid: attachmentUUID,
            });
            if (getResponse(res)) {
              // 手工新建点击【仅保存】，然后再上传附件
              // 由于props中的taxInvoiceHeaderId没值，查询的时候会报错
              taxInvHeaderDs.setState('taxInvoiceHeaderId', taxInvoiceHeaderId);
              taxInvHeaderDs.query();
            }
          }
        }
      }
    },
    [taxInvHeaderDs]
  );

  const editorColumns = useMemo(
    () =>
      [
        {
          name: 'invoiceSpecies',
          editor: Select,
        },
        { name: 'invoiceCode', editor: TextField },
        { name: 'invoiceNumber', editor: TextField },
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
        ocrFileUrl && {
          name: 'seeocr',
          editor: Output,
          renderer: () => (
            <a onClick={() => handleViewOcrFile(ocrFileUrl)}>
              <Icon type="find_in_page" />
              {intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.OCRSee').d('OCR文件')}
            </a>
          ),
        },
        aiAttachmentUrl && {
          name: 'aiAttachmentUrl',
          editor: Output,
          renderer: () => (
            <a onClick={() => handleViewOcrFile(aiAttachmentUrl)}>
              <Icon type="find_in_page" />
              {intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.AISee').d('AI文件')}
            </a>
          ),
        },
        { name: 'buyerContact' },
        { name: 'sellerContact' },
        { name: 'beneficiaryBank' },
        { name: 'beneficiaryBankAddress' },
        { name: 'beneficiaryAccountNum' },
        { name: 'beneficiaryAccountName' },
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
                onRemove={(attachment) => { onAttachmentsChange('DELETE', attachment); }}
              />
            );
          },
        },
      ].filter((item) => item),
    [
      ocrFileUrl,
      isDisabledFlag,
      aiAttachmentUrl,
      handleViewOcrFile,
      handleBeforeUpload,
      onAttachmentsChange,
    ]
  );

  const columns = useMemo(() => {
    const normalColumns = [
      {
        name: 'taxInvoiceLineNum',
        width: 80,
      },
      {
        name: 'itemName',
        editor: true,
        width: 220,
      },
      {
        name: 'netAmount',
        editor: true,
        width: 120,
      },
      {
        name: 'quantity',
        editor: true,
        width: 120,
      },
      {
        name: 'taxRate',
        editor: true,
        help: intl
          .get('ssta.costSheet.model.costSheet.TaxRateTooltip')
          .d(`"免税"、"*"号、"0%、"不征税"发票，统一维护0%`),
        width: 120,
      },
      {
        name: 'taxAmount',
        type: 'number',
        editor: true,
        width: 120,
      },
      {
        name: 'netPrice',
        editor: true,
        width: 120,
      },
      {
        name: 'specificationsModel',
        editor: true,
        width: 120,
      },
      {
        name: 'uom',
        editor: true,
        width: 120,
      },
      {
        name: 'plateNo',
        editor: true,
        width: 150,
      },
      {
        name: 'trafficType',
        editor: true,
        width: 120,
      },
      {
        name: 'trafficDateStart',
        type: 'string',
        editor: true,
        width: 150,
      },
      {
        name: 'trafficDateEnd',
        editor: true,
        width: 150,
      },
    ];
    const processColumns = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_TAX_INVOICE_ADD_COLUMNS', normalColumns, {
        settleHeader,
        taxInvHeaderDs,
      })
      : normalColumns;
    return processColumns;
  }, [remoteProps, settleHeader, taxInvHeaderDs]);

  const handleDelete = useCallback(async () => {
    const res = await taxInvLineDs.delete(taxInvLineDs.selected, getSelectedNegActConfirmMsg('delete', taxInvLineDs));
    if (res) {
      const { objectVersionNumber, netAmount, taxAmount } = res?.content?.[0] || {};
      if (taxInvHeaderDs.current) taxInvHeaderDs.current.set({ objectVersionNumber, netAmount, taxAmount });
      taxInvLineDs.query();
    }
  }, [taxInvLineDs, taxInvHeaderDs]);

  const buttons = useMemo<Buttons[]>(() => {
    return [
      TableButtonType.add,
      [TableButtonType.delete, {
        icon: 'delete_sweep',
        children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
        onClick: handleDelete,
      }],
    ];
  }, [handleDelete]);

  return (
    <Fragment>
      <div className={commonStyles['ssta-content-title']}>
        {intl.get(`ssta.costSheet.view.message.panel.headerInfos`).d('发票头信息')}
      </div>
      <EditorForm
        editorFlag
        columns={3}
        useColon={false}
        dataSet={taxInvHeaderDs}
        editorColumns={editorColumns}
        customizeForm={customizeForm}
        customizeOptions={{ code: headUnitCodes[type] }}
      />
      {Number(enableTaxInvoiceLineCreateFlag) === 1 && (
        <div style={{ marginTop: '20px' }}>
          <div className={commonStyles['ssta-content-title']}>
            {intl.get(`ssta.invoiceSheet.view.message.panel.transactiossnDetails`).d('发票行信息')}
          </div>
          {customizeTable(
            { code: lineUnitCodes[type] },
            <Table
              dataSet={taxInvLineDs}
              columns={columns}
              style={{ maxHeight: '430px' }}
              buttons={buttons}
            />
          )}
        </div>
      )}
    </Fragment>
  );
});
