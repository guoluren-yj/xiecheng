import React, { useMemo, useCallback } from 'react';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { Collapse } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { DataSet, Form, Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import intl from 'utils/intl';
import withRemote from 'utils/remote';
import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import commonStyles from '../../../common.less';
import { batchInfoDS, payListDS } from './indexDS';
import { openEmbedPage } from '../../../utils/utils';
import { BatchFlowCustCodeMap } from '../utils/type';

const { Panel } = Collapse;
const defaultActiveKey = ['batchInfo', 'payList'];

const BatchWorkflow = flow(
  observer,
  withCustomize({
    unitCode: [
      ...Object.values(BatchFlowCustCodeMap),
    ],
  }),
  withRemote({
    code: 'SBSM.PAYMENT_WORKBENCH_BATCH_FLOW_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.paymentWorkbench'] }),
)((props) => {

  const {
    match,
    remote,
    customizeForm,
    customizeTable,
    customizeCommon,
    customizeCollapse,
  } = props;

  const { params } = match || {};
  const { batchId } = params || {};

  const payListDs = useMemo(() => new DataSet(payListDS()), []);
  const batchInfoDs = useMemo(() => new DataSet({
    ...batchInfoDS(batchId),
    children: { payHeaderDTOList: payListDs },
  }), [batchId, payListDs]);

  const handleViewPayDocDetail = useCallback((payHeaderId) => {
    openEmbedPage({
      href: `/sbsm/payment-workbench/detail/${payHeaderId}`,
      params: { payHeaderId },
    });
  }, []);

  const payListColumns = useMemo<ColumnProps[]>(() => [
    {
      name: 'payNum',
      width: 200,
      renderer: ({ value, record }) => {
        const payHeaderId = record?.get('payHeaderId');
        return (
          <a onClick={() => handleViewPayDocDetail(payHeaderId)}>
            {value}
          </a>
        );
      },
    },
    { name: 'companyNum', width: 180 },
    { name: 'companyName', width: 250 },
    { name: 'displaySupplierNum', width: 180 },
    { name: 'displaySupplierName', width: 250 },
    { name: 'currencyCode', width: 100 },
    { name: 'payTypeName', width: 150 },
    { name: 'payFormMeaning', width: 150 },
    { name: 'payAmount', width: 120 },
    { name: 'remark', width: 150 },
    { name: 'createdByName', width: 150 },
    { name: 'creationDate', width: 150 },
    { name: 'attachmentUuid', width: 150 },
  ], [handleViewPayDocDetail]);

  return (
    <Content wrapperClassName={commonStyles[`collapse-content-wrap`]} className={commonStyles[`collapse-content`]}>
      <div className={commonStyles['workflow-card-wrapper']}>
        {customizeCommon(
          {
            code: BatchFlowCustCodeMap.BasicCard,
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            maxTagCount={3}
            dataSet={batchInfoDs}
            titleField="batchNum"
            contentRemainWidth="25%"
          />
        )}
      </div>
      {customizeCollapse(
        { code: BatchFlowCustCodeMap.Collapse },
        <Collapse
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          defaultActiveKey={defaultActiveKey}
        >
          <Panel showArrow={false} key='batchInfo' header={intl.get('sbsm.paymentWorkbench.view.title.payDocBatchInfo').d('支付单批次信息')}>
            {customizeForm(
              { code: BatchFlowCustCodeMap.BatchInfo },
              <Form dataSet={batchInfoDs} columns={3} labelLayout={LabelLayout.vertical} />
            )}
            {remote ? remote.render('SBSM.PAYMENT_WORKBENCH_BATCH_FLOW_CUX.BATCH_INFO_EXTRA', null, { batchInfoDs }) : null}
          </Panel>
          <Panel showArrow={false} key='payList' header={intl.get('sbsm.paymentWorkbench.view.title.payDocList').d('支付单列表')}>
            {customizeTable(
              { code: BatchFlowCustCodeMap.PayList },
              <Table dataSet={payListDs} columns={payListColumns} style={{ maxHeight: 430 }} />
            )}
          </Panel>
        </Collapse>
      )}
    </Content>
  );
});

export default BatchWorkflow;

