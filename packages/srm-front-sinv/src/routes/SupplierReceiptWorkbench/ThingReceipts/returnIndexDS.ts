import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SPUC } from 'srm-front-boot/lib/utils/config.js';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId();

const returnTableDS = (): DataSetProps => ({
  primaryKey: 'rcvTrxLineId',
  cacheSelection: true, // 跨页勾选
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'nodeConfigName',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNode')
        .d('收货节点'),
    },
    {
      name: 'itemCode',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.itemName').d('物料名称'),
    },
    {
      name: 'secondaryUomId',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryUomId').d('单位'),
    },
    {
      name: 'uomName',
      type: FieldType.string,
    },
    {
      name: 'supplierName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'secondaryLeftQuantity',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryLeftQuantity').d('可退货数量'),
    },
    {
      name: 'leftQuantity',
      type: FieldType.number,
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('doubleUnitEnabled')
            ? intl
                .get('sinv.receiptExecution.model.receipt.canLeftBaseQuantity')
                .d('可退货基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.canLeftQuantitys').d('可退货数量'),
      },
    },
    {
      name: 'leftTaxAmount',
      type: FieldType.number,
      label: intl
        .get('sinv.receiptExecution.model.receipt.can.return.leftTaxAmounts')
        .d('可退货金额(含税)'),
    },
    {
      name: 'displayTrxNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.receivingReference')
        .d('收货单编号-行号'),
    },
    {
      name: 'trxDate',
      type: FieldType.date,
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'invOrganizationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.organizationName').d('收货组织'),
    },
    {
      name: 'inventoryName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
    },
    {
      name: 'locationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
    },
    {
      name: 'productNum',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.productName').d('商品名称'),
    },
    {
      name: 'fromDisplayPoNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromDisplayPoLineNum')
        .d('来源订单编号-行号'),
    },
    {
      name: 'fromDisplayAsnNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromPcSubjectNum')
        .d('来源送货单编号-行号'),
    },
    {
      name: 'fromPcNum',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.theFromPcNum').d('来源协议编号｜行号'),
    },
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customer').d('客户'),
    },
    {
      name: 'agentName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
    },
    {
      name: 'creationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'strategyCode',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.receiptStrategy').d('收货策略'),
    },
    {
      name: 'customSpecsJson',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'orderReturnedFlag',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.orderReturnedFlag').d('退货订单行'),
    },
    {
      label: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
      name: 'attachmentUrlList',
    },
    {
      name: 'projectTaskId',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.projectTaskId').d('项目任务名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/can-reverse/line`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { returnTableDS };
