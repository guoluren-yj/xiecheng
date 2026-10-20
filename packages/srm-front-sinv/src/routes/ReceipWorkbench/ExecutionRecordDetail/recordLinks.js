import React from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import ExpIndex from '../ThingReceipts/components/expIndex';
import styles from '../ThingReceipts/components/expIndex.less';

import { ColorRender } from '../util';
import { showBigNumber } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

// 封装通用c7nModal
export default function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

// c7n通用弹窗
export function showRecordModal({
  url = '',
  params = {},
  fields,
  columns,
  queryFields = false,
  width = 500,
  title = intl.get('hzero.common.view.message.lineDetail').d('行明细'),
  // doubleUnitEnabled,
}) {
  // 显示流程框
  const setShow = (record) => {
    const { orderTypeName = '-', sourceHeaderNum = '-', sourceLineNum = '-' } = record.get([
      'orderTypeName',
      'sourceHeaderNum',
      'sourceLineNum',
    ]);
    c7nModal({
      style: { width: 1090 },
      okCancel: false,
      className: styles['exp-modal'],
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: (
        <span>
          {`${intl
            .get('sinv.receiptWorkbench.model.view.title.rcvTypeDetail')
            .d('收货状态详情')}【${orderTypeName}】`}
          {`${sourceHeaderNum || ''}-${sourceHeaderNum ? sourceLineNum : ''}`}
        </span>
      ),
      children: <ExpIndex dataGather={record} />,
    });
  };

  const commonCols = [
    {
      name: 'itemCode',
      width: 100,
    },
    {
      name: 'itemName',
      width: 100,
    },
    {
      name: 'supplierName',
      width: 140,
      renderer: ({ record }) =>
        record.get('supplierId') ? record.get('supplierName') : record.get('supplierCompanyName'),
    },
    {
      name: 'secondaryQuantity',
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'secondaryLeftQuantity',
      width: 140,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'quantity',
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'leftQuantity',
      width: 150,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'trxDate',
      width: 130,
    },
    {
      name: 'invOrganizationName',
      width: 120,
    },
    {
      name: 'inventoryNameLov',
      width: 110,
    },
    {
      name: 'locationNameLov',
      width: 110,
    },
    {
      name: 'productNum',
      width: 150,
    },
    {
      name: 'productName',
      width: 120,
    },
    {
      name: 'fromDisplayPoNum',
      width: 170,
      renderer: ({ value, record }) => {
        if (value) {
          return `${value} | ${record.get('fromDisplayPoLineNum')}`;
        }
      },
    },
    {
      name: 'fromDisplayAsnNum',
      width: 170,
      renderer: ({ value, record }) => {
        if (value) {
          return `${value} | ${record.get('fromDisplayAsnLineNum')}`;
        }
      },
    },
    {
      name: 'fromOrderTypeName',
      width: 135,
    },
    {
      name: 'sourceStatusCode',
      width: 120,
      renderer: ({ value, record }) => {
        return <ColorRender value={value} record={record} setShow={setShow} />;
      },
    },
    {
      name: 'companyName',
      width: 100,
    },
    {
      name: 'purchaseAgentName',
      width: 120,
    },
    {
      name: 'creationName',
      width: 120,
    },
    {
      name: 'dueDate',
      width: 100,
      renderer: ({ value }) => dateTimeRender(value),
    },
    {
      name: 'fromDisplayTrxNum',
      width: 170,
      renderer: ({ value, record }) => {
        if (value) {
          return <span>{`${value} | ${record.get('fromDisplayTrxLineNum')}`}</span>;
        }
      },
    },
    {
      name: 'fromPcNum',
      width: 170,
      renderer: ({ value, record }) => {
        // const { commonToDetail = e => e } = this.props;
        if (value) {
          return `${value} | ${record.get('fromPcSubjectNum')}`;
        }
      },
    },
    {
      name: 'strategyCode',
      width: 150,
    },
    {
      name: 'processStatusMeaning',
      width: 150,
    },
    {
      name: 'errorReason',
      width: 150,
    },
  ];
  const commonFields = [
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNode')
        .d('收货节点'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.itemName').d('物料名称'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
      dynamicProps: {
        max: ({ record }) => {
          if (record.get('subjectType') === 'QUANTITY') {
            return record.get('leftQuantity');
          }
        },
      },
    },
    {
      name: 'secondaryLeftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行数量(基本)'),
      dynamicProps: {
        max: ({ record }) => {
          if (record.get('subjectType') === 'QUANTITY') {
            return record.get('leftQuantity');
          }
        },
      },
    },
    {
      name: 'leftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.baseLeftQuantity').d('可执行数量(基本)'),
    },
    {
      name: 'trxDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.organizationName').d('收货组织'),
    },
    {
      name: 'inventoryNameLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
      ignore: 'always',
      lovCode: 'SODR.INVENTORY',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            invOrganizationId: record.get('invOrganizationId'),
          };
        },
      },
    },
    {
      name: 'inventoryName',
      type: 'string',
      bind: 'inventoryNameLov.inventoryName',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
    },
    {
      name: 'inventoryId',
      type: 'string',
      bind: 'inventoryNameLov.inventoryId',
    },
    {
      name: 'locationNameLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
      ignore: 'always',
      lovCode: 'SRPM.LOCATION_BY_ORG_INV',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            inventoryId: record.get('inventoryId'),
          };
        },
        disabled: ({ record }) => !record.get('inventoryId'),
      },
    },
    {
      name: 'locatorId',
      type: 'string',
      bind: 'locationNameLov.locationId',
    },
    {
      name: 'locationName',
      type: 'string',
      bind: 'locationNameLov.locationName',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.productName').d('商品名称'),
    },
    {
      name: 'fromDisplayPoNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromDisplayPoLineNum')
        .d('来源订单编号｜行号'),
    },
    {
      name: 'fromDisplayAsnNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromPcSubjectNum')
        .d('来源送货单编号｜行号'),
    },
    {
      name: 'fromOrderTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.thiOrderTypeName').d('来源单据类型'),
    },
    {
      name: 'sourceStatusCode',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.sourceReceiveStatusCode')
        .d('来源单据收货状态'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'dueDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.dueDate').d('妥投时间'),
    },
    {
      name: 'fromDisplayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theDisplayTrxNum')
        .d('参考凭证编号｜行号'),
    },
    {
      name: 'fromPcNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.theFromPcNum').d('来源协议编号｜行号'),
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.receiptStrategy').d('收货策略'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.executionStatus')
        .d('执行状态'),
    },
    {
      name: 'errorReason',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.executionReason')
        .d('原因'),
    },
  ];
  const tableDs = new DataSet({
    selection: false,
    autoQuery: false,
    queryFields,
    fields: fields || commonFields,
    transport: {
      read({ data }) {
        return {
          url,
          method: 'GET',
          data: { ...data, ...params },
        };
      },
    },
  });
  tableDs.query();
  return c7nModal({
    resizable: true,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    style: { width },
    afterClose: () => {
      tableDs.reset();
    },
    title,
    children: <Table dataSet={tableDs} columns={columns || commonCols} />,
  });
}
