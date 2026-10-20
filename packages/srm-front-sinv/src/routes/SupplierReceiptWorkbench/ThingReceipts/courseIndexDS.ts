import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SPUC, PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config.js';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import { filterNullValueObject, getDateFormat } from 'hzero-front/lib/utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { isEmpty } from 'lodash';
import {
  queryBatchSimpleApprovalHistory,
  queryBatchApprovaFlag,
} from 'srm-front-boot/lib/utils/utils';
import { getBatchOperationFlag } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

// 事务-按单 TODO：缺少是否成功打印
const courseTableDS = (): DataSetProps => ({
  autoQuery: false,
  primaryKey: 'rcvTrxHeaderId',
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'rcvStatusCodeMeaning',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.rcvStatusCodeMeaning')
        .d('状态'),
    },
    {
      name: 'operate',
      type: FieldType.string,
      label: intl.get('hzero.common.option').d('操作'),
    },
    {
      name: 'displayTrxNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNum')
        .d('收货单号'),
    },
    {
      name: 'viewApproval',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.orderTypeName.viewApproval').d('审批进度'),
    },
    {
      name: 'nodeConfigName',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNode')
        .d('收货节点'),
    },
    {
      name: 'rcvTypeName',
      type: FieldType.string,
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeReName').d('收货类型'),
    },
    {
      name: 'returnedFlag',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货'),
    },
    {
      name: 'totalQuantity',
      type: FieldType.number,
      label: intl.get('sinv.receiptWorkbench.model.receipt.totalQuantity').d('汇总数量'),
    },
    {
      name: 'totalTaxIncludedAmount',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.totalTaxIncludedAmount').d('汇总金额（含税）'),
    },
    {
      name: 'printFlag',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.printLabel').d('打印标记'),
    },
    {
      name: 'supplierName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customer').d('客户'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl.get('sinv.receiptWorkbench.model.receipt.remarkExplain').d('备注说明'),
    },
    {
      name: 'creationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.dateTime,
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing`,
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
  fields: [
    {
      name: 'rcvStatusCodeMeaning',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.rcvStatusCodeMeaning')
        .d('状态'),
    },
    {
      name: 'nodeConfigName',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNode')
        .d('收货节点'),
    },
    {
      name: 'displayTrxNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNums')
        .d('收货单号-行号'),
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
      name: 'returnedFlag',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货'),
    },
    {
      name: 'secondaryQuantity',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
    },
    {
      name: 'quantity',
      type: FieldType.number,
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('doubleUnitEnabled')
            ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
      },
    },
    {
      name: 'taxIncludedAmount',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.taxIncludedAmount').d('执行金额(含税)'),
    },
    {
      name: 'rcvTypeName',
      type: FieldType.string,
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeReName').d('收货类型'),
    },
    {
      name: 'trxDate',
      type: FieldType.date,
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
      format: getDateFormat(),
    },
    {
      name: 'invOrganizationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.invOrganizationName').d('收货组织'),
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
      name: 'fromOrderTypeName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.thiOrderTypeName').d('来源单据类型'),
    },
    {
      name: 'dueDate',
      type: FieldType.date,
      label: intl.get('sinv.receiptExecution.model.receipt.dueDate').d('妥投时间'),
    },
    {
      name: 'remark',
      type: FieldType.string,
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
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customer').d('客户'),
    },
    {
      name: 'creationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.dateTime,
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
    },
    {
      name: 'orderReturnedFlag',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.orderReturnedFlag').d('退货订单行'),
    },
    {
      label: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
      name: 'attachmentUrlList',
      type: FieldType.string,
    },
    {
      name: 'fromDisplayTrxNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.theDisplayTrxNum')
        .d('参考凭证编号-行号'),
    },
    {
      name: 'projectTaskId',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.projectTaskId').d('项目任务名称'),
    },
    {
      name: 'strategyCode',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.receiptStrategy').d('收货策略'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing-sinv/line`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { courseTableDS, courseAsnTableDS };
