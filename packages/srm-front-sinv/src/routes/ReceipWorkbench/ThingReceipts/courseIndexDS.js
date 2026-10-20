/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, filterNullValueObject, getDateFormat } from 'utils/utils';
import {
  queryBatchSimpleApprovalHistory,
  queryBatchApprovaFlag,
} from 'srm-front-boot/lib/utils/utils';
import { getBatchOperationFlag } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

// 事务-按单 TODO：缺少是否成功打印
const courseTableDS = () => ({
  autoQuery: false,
  primaryKey: 'rcvTrxHeaderId',
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'rcvStatusCodeMeaning',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.rcvStatusCodeMeaning')
        .d('状态'),
    },
    {
      name: 'operate',
      type: 'string',
      label: intl.get('hzero.common.option').d('操作'),
    },
    {
      name: 'displayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNum')
        .d('收货单号'),
    },
    {
      name: 'viewApproval',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.viewApproval')
        .d('审批进度'),
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNode')
        .d('收货节点'),
      // label: intl
      //   .get('sinv.receiptExecution.model.receipt.orderTypeName.cutStrategyCode')
      //   .d('当前执行策略'),
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
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.remarkExplain').d('备注说明'),
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
      format: DEFAULT_DATETIME_FORMAT,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing`,
        method: 'GET',
        data: queryData,
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const businessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('businessKey');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(businessKeys)) {
        // 查询审批记录数据
        const simpleApprovalHistoryList = await queryBatchSimpleApprovalHistory(businessKeys);
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(businessKeys);
        // // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(businessKeys);
        dataSet.setState({ simpleApprovalHistoryList, approvaFlags, operationFlags });
      }
    },
  },
});

// 事务-按行 TODO:按行数据未填,接口未联调，缺少参考凭证编号【与事务编号重复】、定制品属性
const courseAsnTableDS = () => ({
  autoQuery: false,
  primaryKey: 'rcvTrxLineId',
  cacheSelection: true,
  pageSize: 20,
  cacheModified: true,
  fields: [
    {
      name: 'rcvStatusCodeMeaning',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.rcvStatusCodeMeaning')
        .d('状态'),
    },
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
      label: intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
    },
    {
      name: 'quantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('doubleUnitEnabled')
            ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
      },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.taxIncludedAmount').d('执行金额(含税)'),
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
      format: getDateFormat(),
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
      name: 'dueDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.dueDate').d('妥投时间'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.lineRemark').d('行备注'),
      maxLength: 300,
    },
    {
      name: 'sinvLineAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get('sinv.receiptExecution.model.receipt.lineUuid').d('行附件'),
    },
    {
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
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
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
      format: DEFAULT_DATETIME_FORMAT,
    },
    {
      name: 'processDocuments',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.processDocuments').d('单据流'),
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
      name: 'fromDisplayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theDisplayTrxNum')
        .d('参考凭证编号-行号'),
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
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing-sinv/line`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { courseTableDS, courseAsnTableDS };
