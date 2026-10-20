import React, { Fragment, useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, DataSet, DatePicker, Lov, Select, Table } from 'choerodon-ui/pro';
import { Card, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import EditorForm from '../EditorForm';
import { headerDS, lineDS } from './stores/storeDS';
import { syncAiInvoiceHeader } from './utils/api';

const AiInvoiceRecognizeDetail = observer((props: any) => {
  const { modal, aiBatchId, operate } = props || {};
  const editFlag = operate === 'edit';
  const lineDs = useMemo(() => new DataSet(lineDS({ aiBatchId })), [aiBatchId]);
  const headerDs = useMemo(
    () =>
      new DataSet({
        ...headerDS({ aiBatchId }),
        children: {
          items: lineDs,
        },
      }),
    [lineDs, aiBatchId]
  );

  const handleSync = useCallback(async () => {
    Object.assign(headerDs, { status: 'loading' });
    const res = getResponse(await syncAiInvoiceHeader(headerDs.current?.toJSONData()));
    Object.assign(headerDs, { status: 'ready' });
    if (!res) return;
    notification.success({});
    modal.close();
  }, [headerDs, modal]);

  const loading = headerDs.status !== 'ready';

  const handleOk = useCallback(async () => {
    const res = await headerDs.submit();
    if (!res) return false;
  }, [headerDs]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
    }
  }, [modal, handleOk]);

  useEffect(() => {
    if (modal && editFlag) {
      modal.update({
        okProps: { loading },
        footer: (okBtn, cancelBtn) => [
          okBtn,
          <Button icon="sync" loading={loading} onClick={handleSync}>
            {intl.get('ssta.aiRecognizeRecord.view.button.syncInvPoolOrSettle').d('同步发票池/结算单')}
          </Button>,
          cancelBtn,
        ],
      });
    }
  }, [modal, editFlag, loading, handleSync]);

  const formFields = useMemo(
    () => [
      { name: 'invoiceNum' },
      { name: 'invoiceType', editor: Select },
      { name: 'invoicingDate', editor: DatePicker },
      { name: 'currencyLov', editor: Lov },
      { name: 'taxIncludedAmount' },
      { name: 'netAmount' },
      { name: 'taxAmount' },
      { name: 'companyName' },
      { name: 'buyerContact' },
      { name: 'purAddrAndTel' },
      { name: 'supplierCompanyName' },
      { name: 'sellerContact' },
      { name: 'supAddrAndTel' },
      { name: 'beneficiaryBank' },
      { name: 'beneficiaryAccountNum' },
      { name: 'beneficiaryAccountName' },
      { name: 'beneficiaryBankAddress' },
      { name: 'paymentTerms' },
      { name: 'memo' },
    ],
    []
  );

  const lineColumns = useMemo(
    () => [
      { name: 'lineNum', width: 80 },
      { name: 'itemName', width: 240 },
      { name: 'quantity', width: 120 },
      { name: 'netPrice', width: 140 },
      { name: 'taxRate', width: 120 },
      { name: 'netAmount', width: 140 },
      { name: 'taxAmount', width: 140 },
      { name: 'taxIncludedAmount', width: 140 },
      { name: 'uom', width: 140 },
      { name: 'spec', width: 160 },
    ].map((item) => ({ ...item, editor: editFlag })),
    [editFlag]
  );

  return (
    <Fragment>
      <Spin spinning={loading}>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={intl.get('ssta.aiRecognizeRecord.view.title.invoiceHeaderInfo').d('基础信息')}
        >
          <EditorForm dataSet={headerDs} columns={3} editorFlag={editFlag} editorColumns={formFields} />
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={intl.get('ssta.aiRecognizeRecord.view.title.invoiceLineInfo').d('明细行信息')}
        >
          <Table columns={lineColumns} dataSet={lineDs} style={{ maxHeight: 430 }} />
        </Card>
      </Spin>
    </Fragment>
  );
});

export default AiInvoiceRecognizeDetail;
