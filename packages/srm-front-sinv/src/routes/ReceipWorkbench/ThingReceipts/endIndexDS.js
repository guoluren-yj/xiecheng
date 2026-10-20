/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { fetchUnreadChatAPI } from '../../components/Chat/services';

const organizationId = getCurrentOrganizationId();

// 按收货行
const endTableDS = () => ({
  autoQuery: false,
  primaryKey: 'rcvTrxLineId',
  cacheSelection: true,
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
      name: 'displayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNums')
        .d('收货单号-行号'),
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
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
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
      name: 'returnedFlag',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryQuantity').d('单据数量'),
    },
    {
      name: 'quantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => {
          return dataSet.getState('doubleUnitEnabled')
            ? intl.get('sinv.receiptExecution.model.receipt.billBaseQuantity').d('单据基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.quantity').d('单据数量');
        },
      },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('sinv.receiptWorkbench.model.receipt.receiptsAmount').d('单据金额(含税)'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeReName').d('收货类型'),
    },
    {
      name: 'trxDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.invOrganizationName').d('收货组织'),
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
      name: 'fromDisplayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theDisplayTrxNum')
        .d('参考凭证编号-行号'),
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
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'billMatchedFlag',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.billMatchedFlag').d('对账状态'),
    },
    {
      name: 'invoiceMatchedStatusMeaning',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.invoiceMatchedStatusMeaning')
        .d('开票状态'),
    },
    {
      name: 'paymentStatusMeaning',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.paymentStatusMeaning').d('付款状态'),
    },
    {
      name: 'importStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.erpSyncStatus`).d('导出状态'),
    },
    {
      name: 'associatedNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.associatedNum').d('关联单据信息'),
    },
    {
      name: 'processDocuments',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.processDocuments').d('单据流'),
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
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.receiptStrategy').d('收货策略'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/line`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

// 按收货单
const endAsnTableDS = () => ({
  autoQuery: false,
  primaryKey: 'rcvTrxHeaderId',
  cacheSelection: true,
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
      name: 'displayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNum')
        .d('收货单号'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeReName').d('收货类型'),
    },
    {
      name: 'returnedFlag',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货'),
    },
    {
      name: 'totalQuantity',
      type: 'number',
      label: intl.get('sinv.receiptWorkbench.model.receipt.totalQuantity').d('汇总数量'),
    },
    {
      name: 'totalTaxIncludedAmount',
      type: 'number',
      label: intl
        .get('sinv.receiptExecution.model.receipt.totalTaxIncludedAmount')
        .d('汇总金额（含税）'),
    },
    {
      name: 'printFlag',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.printLabel').d('打印标记'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/header`,
        method: 'GET',
        data: queryData,
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const rcvTrxHeaderIds = dataSet.reduce((acc, cur) => {
        const value = cur.get('rcvTrxHeaderId');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(rcvTrxHeaderIds)) {
        // 查询审批聊天数据
        const chatList = await fetchUnreadChatAPI({ body: rcvTrxHeaderIds, camp: 'pur' });
        if (getResponse(chatList)) {
          if (isEmpty(chatList)) {
            dataSet.setState({ chatList: [] });
            return;
          }
          dataSet.setState({ chatList: chatList || [] });
        } else {
          dataSet.setState({ chatList: [] });
        }
      }
    },
  },
});

export { endTableDS, endAsnTableDS };
