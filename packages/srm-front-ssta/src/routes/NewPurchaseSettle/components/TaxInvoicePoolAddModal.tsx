import React, { Fragment, useMemo, useEffect, useContext, useCallback, cloneElement } from 'react';
import { Lov, Table, Output, Select, DataSet, TextField, DatePicker, Attachment, NumberField, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isNil, isFunction, isEmpty } from 'lodash';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { Store } from '../Detail/StoreProvider';
import EditorForm from '../../Components/EditorForm';
import { getSelectedNegActConfirmMsg } from '../../../utils/utils';
import { getBusinessRules } from '../../../services/invoicePurPoolService';
import { taxInvPoolHeaderDS, taxInvPoolLineDS } from '../../../stores/NewPurchaseSettleDS';

import commonStyles from '../../common.less';

const headUnitCodes = {
  add: 'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_ADD',
  edit: 'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_UPDATE',
};
const lineUnitCodes = {
  add: 'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_LINE_CREATE',
  edit: 'SSTA.PURCHASE_SETTLE_DETAIL.ADVANCE_TAXINVOICE_LINE_EDIT',
};

const computeDateProps = async (record) => {
  const { belongCompanyId: companyId, belongSupplierCompanyId: supplierCompanyId } = record.get([
    'belongCompanyId',
    'belongSupplierCompanyId',
  ]);
  if (companyId && supplierCompanyId) {
    const res = getResponse(
      await getBusinessRules({
        cnfCode: 'SITE.SSTA.ENABLE_INVOICE_CHECK',
        companyId,
        supplierCompanyId,
      })
    );
    record.setState('enableCheckFlag', Boolean(res));
  } else if (record.getState('enableCheckFlag')) {
    record.setState('enableCheckFlag', false);
  }
};

const onHeaderUpdate = ({ record, name }) => {
  if (['belongCompanyIdLov', 'belongSupplierCompanyIdLov'].includes(name)) {
    computeDateProps(record);
  }
  if (['invoiceType'].includes(name)) {
    // 发票类型发生变化，发票代码清空
    record.set('invoiceCode', record.getField('invoiceCode').get('defaultValue'));
  }
};

export default observer((props) => {
  const { modal, recordData, showModal, okCallback } = props;
  const { customizeForm, customizeTable } = useContext<any>(Store);
  const { invoiceHeaderId } = recordData || {};
  const type = isNil(invoiceHeaderId) ? 'add' : 'edit';
  const taxInvPoolLineDs = useMemo(() => new DataSet(taxInvPoolLineDS(lineUnitCodes[type])), [type]);
  const taxInvPoolHeaderDs = useMemo(() => new DataSet({
    ...taxInvPoolHeaderDS({
      invoiceHeaderId,
      customizeUnitCode: headUnitCodes[type],
    }),
    events: { update: onHeaderUpdate },
    children: { invoiceLineList: taxInvPoolLineDs },
  }), [type, taxInvPoolLineDs, invoiceHeaderId]);

  const { ocrFileUrl, ofdFileUrl, aiAttachmentUrl } = taxInvPoolHeaderDs.current?.get(['ocrFileUrl', 'ofdFileUrl', 'aiAttachmentUrl']) || {};
  const isDisabled = ocrFileUrl || ofdFileUrl ? false : taxInvPoolLineDs.length > 0;
  const loading = taxInvPoolHeaderDs.status !== 'ready';

  const handleSave = useCallback(async (stayOpenModal = false) => {
    const res = await taxInvPoolHeaderDs.submit();
    if (!res) return false;
    if (isFunction(okCallback)) okCallback();
    if (stayOpenModal && res?.content && !isEmpty(res.content)) {
      // 重新加载信息,获取头汇总金额和默认信息
      taxInvPoolHeaderDs
        .setState('invoiceHeaderId', res.content[0].invoiceHeaderId)
        .query();
      return false;

    };
  }, [taxInvPoolHeaderDs, okCallback]);

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

  const editorColumns = useMemo(
    () =>
      [
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
          disabled: isDisabled,
        },
        {
          name: 'taxAmount',
          editor: NumberField,
          disabled: isDisabled,
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
          maxLength: 6,
        },
        {
          name: 'memo',
          editor: TextField,
        },
        ocrFileUrl && {
          name: 'uniSee',
          editor: Output,
          renderer: () => (
            <a onClick={() => showModal(ocrFileUrl)}>
              {intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.OCRSee').d('OCR文件')}
            </a>
          ),
        },
        aiAttachmentUrl && {
          name: 'aiAttachmentUrl',
          editor: Output,
          renderer: () => (
            <a onClick={() => showModal(aiAttachmentUrl)}>
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
          editor: Attachment,
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'finance-invoice',
          showHistory: true,
          max: 9,
          sortable: true,
        },
      ].filter((item) => item),
    [isDisabled, showModal, ocrFileUrl, aiAttachmentUrl]
  );

  const columns = useMemo(
    () => [
      {
        name: 'lineNum',
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
          .d(`“免税”、“*”号、“0%、“不征税”发票，统一维护0%`),
        width: 120,
      },
      {
        name: 'taxAmount',
        editor: true,
        width: 120,
      },
      {
        name: 'netPrice',
        editor: true,
        width: 120,
      },
      {
        name: 'spec',
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
        editor: true,
        width: 150,
      },
      {
        name: 'trafficDateEnd',
        editor: true,
        width: 150,
      },
    ],
    []
  );

  const handleDelete = useCallback(async () => {
    const res = await taxInvPoolLineDs.delete(taxInvPoolLineDs.selected, getSelectedNegActConfirmMsg('delete', taxInvPoolLineDs));
    if (res) {
      const { objectVersionNumber } = res?.content?.[0] || {};
      if (taxInvPoolHeaderDs.current) taxInvPoolHeaderDs.current.set('objectVersionNumber', objectVersionNumber);
      taxInvPoolLineDs.query();
    }
  }, [taxInvPoolLineDs, taxInvPoolHeaderDs]);

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
        dataSet={taxInvPoolHeaderDs}
        editorColumns={editorColumns}
        customizeForm={customizeForm}
        customizeOptions={{ code: headUnitCodes[type] }}
      />
      <div style={{ marginTop: '20px' }}>
        <div className={commonStyles['ssta-content-title']}>
          {intl.get(`ssta.invoiceSheet.view.message.panel.transactiossnDetails`).d('发票行信息')}
        </div>
        {customizeTable(
          { code: lineUnitCodes[type] },
          <Table
            dataSet={taxInvPoolLineDs}
            columns={columns}
            style={{ maxHeight: '430px' }}
            buttons={buttons}
          />
        )}
      </div>
    </Fragment>
  );
});
