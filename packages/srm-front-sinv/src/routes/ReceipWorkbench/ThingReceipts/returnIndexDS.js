/**
 * @author biao.zhu@going-link.com
 * @since 2021-07-14 11:31:11
 * @lastTime 2021-07-14 16:06:22
 * @description 收货工作台-可退货列表DS定义
 * @copyright Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 事务
const returnTableDS = () => ({
  primaryKey: 'rcvTrxLineId',
  cacheSelection: true, // 跨页勾选
  cacheModified: true,
  pageSize: 20,
  fields: [
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
      name: 'secondaryUomId',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryUomId').d('单位'),
    },
    {
      name: 'uomName',
      type: 'string',
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'secondaryLeftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryLeftQuantity').d('可退货数量'),
    },
    {
      name: 'leftQuantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('doubleUnitEnabled')
            ? intl
                .get('sinv.receiptExecution.model.receipt.canLeftBaseQuantity')
                .d('可退货基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.canLeftQuantitys').d('可退货数量'),
      },
    },
    // {
    //   name: 'executeReverseQuantity',
    //   type: 'number',
    //   // min: 0,
    //   label: intl.get('sinv.receiptExecution.model.receipt.ReverseQuantity').d('退货数量'),
    //   dynamicProps: {
    //     step: ({ record }) => {
    //       const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
    //       const num = 1 / 10 ** uomPrecision;
    //       if (record.get('subjectType') === 'QUANTITY') {
    //         return num;
    //       }
    //     },
    //     min: ({ record }) => {
    //       if ([0, '0'].includes(record.get('uomPrecision'))) {
    //         return 1;
    //       }
    //       const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
    //       const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
    //       return textNum;
    //     },
    //   },
    // },
    // {
    //   name: 'reverseNodeLov',
    //   type: 'object',
    //   label: intl.get('sinv.receiptExecution.model.receipt.reverseNodes').d('退货节点'),
    //   lovCode: 'SPUC.SINV_WORKKENCH_REVERSE_NODE_URL',
    //   textField: 'rcvTypeName',
    //   ignore: 'always',
    //   noCache: true,
    //   dynamicProps: {
    //     lovPara: ({ record }) => {
    //       const strategyLineId = record.get('strategyLineId');
    //       return {
    //         tenantId: organizationId,
    //         nodeConfigId: record.get('nodeConfigId'),
    //         strategyLineIds: strategyLineId,
    //       };
    //     },
    //   },
    // },
    {
      name: 'executeReverseNodeConfigId',
      type: 'string',
      bind: 'reverseNodeLov.nodeConfigId',
    },
    {
      name: 'executeReverseRcvTrxTypeName',
      type: 'string',
      bind: 'reverseNodeLov.rcvTypeName',
    },
    {
      name: 'executeReverseRcvTrxTypeId',
      bind: 'reverseNodeLov.rcvTrxTypeId',
    },
    {
      name: 'leftTaxAmount',
      type: 'number',
      label: intl
        .get('sinv.receiptExecution.model.receipt.can.return.leftTaxAmounts')
        .d('可退货金额(含税)'),
    },
    {
      name: 'displayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.receivingReference')
        .d('收货单编号-行号'),
    },
    {
      name: 'trxDate',
      width: 160,
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.organizationName').d('收货组织'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
    },
    {
      name: 'locationName',
      type: 'string',
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
        .d('来源订单编号-行号'),
    },
    {
      name: 'fromDisplayAsnNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromPcSubjectNum')
        .d('来源送货单编号-行号'),
    },
    {
      name: 'fromPcNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.theFromPcNum').d('来源协议编号｜行号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'agentName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
    },

    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.receiptStrategy').d('收货策略'),
    },
    {
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'orderReturnedFlag',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.orderReturnedFlag').d('退货订单行'),
    },
    {
      label: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
      name: 'attachmentUrlList',
    },
    {
      name: 'projectTaskId',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.projectTaskId').d('项目任务名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/can-reverse/line`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { returnTableDS };
