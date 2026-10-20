// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SIEC, SRM_SPRM } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '@/routes/utils';

const commonPrompt = 'sprm.project.model.common';
const organizationId = getCurrentOrganizationId();

const wholeDs = () => ({
  pageSize: 20,
  autoQuery: false,
  fields: [
    {
      name: 'projectStatus',
      lookupCode: `SIEC.PROJECT_STATUS`,
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'operation',
      label: intl.get(`hzero.common.option`).d('操作'),
    },
    {
      name: 'workFlowApproveProcess',
      label: intl.get('hzero.common.button.approve.process').d('审批进度'),
      type: 'string',
    },
    {
      name: 'projectNum',
      label: intl.get(`${commonPrompt}.projectNum`).d('项目编号'),
    },
    {
      name: 'projectName',
      label: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
    },
    {
      name: 'projectTypeId',
      lovCode: 'SIEC.PROJECT_TYPE',
      label: intl.get(`${commonPrompt}.projectType`).d('项目类型'),
    },
    {
      name: 'principalUserId',
      label: intl.get('ssrc.tenderPlan.model.tenderPlan.projectUserName').d('项目负责人'),
      lovCode: 'SSRC.PREQUAL_USER',
    },
    {
      name: 'companyId',
      label: intl.get(`sprm.common.model.common.company`).d('公司'),
    },
    {
      name: 'ouId',
      label: intl.get(`sprm.common.model.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseOrgId',
      label: intl.get(`sprm.common.model.common.purchaseOrgName`).d('采购组织'),
    },
    {
      name: 'projectChangeInfo',
      label: intl.get(`${commonPrompt}.projectChangeInfo`).d('项目控制申请单查询'),
    },
    {
      name: 'createdByName',
      label: intl.get(`hzero.common.creationName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`hzero.common.creationDate`).d('创建时间'),
    },
    {
      name: 'departmentId',
      label: intl.get(`${commonPrompt}.departmentName`).d('部门'),
    },
    {
      name: 'changingFlag',
      label: intl.get(`sprm.common.model.common.changedFlag`).d('变更中'),
    },
    {
      name: 'sourcePlatform',
      lookupCode: 'SIEC.PROJECT_SOURCE',
      label: intl.get(`sprm.common.model.common.prSourcePlatform`).d('单据来源'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/project/list`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          customizeUnitCode: 'SIEC.PROJECT_LIST.LIST,SIEC.PROJECT_LIST.SEARCH',
        }),
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('workflowBusinessKey');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        // 查询审批记录数据
        const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
          workFlowBussinessKeys
        );
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

const projectChangeDs = ({ projectId }) => ({
  pageSize: 20,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'reqStatus',
      lookupCode: 'SIEC.PROJECT_APPLICATION_STATUS',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'reqNum',
      label: intl.get(`sprm.project.model.common.reqNum`).d('项目控制申请单号'),
    },
    {
      name: 'operation',
      label: intl.get(`hzero.common.option`).d('操作'),
    },
    {
      name: 'workFlowApproveProcess',
      label: intl.get('hzero.common.button.approve.process').d('审批进度'),
      type: 'string',
    },
    {
      name: 'reqType',
      label: intl.get(`sprm.common.model.common.sqType`).d('申请类型'),
    },
    {
      name: 'createdByName',
      label: intl.get(`hzero.common.creationName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`hzero.common.creationDate`).d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/project-req/${projectId}`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SIEC.PROJECT_LIST.DETAIL_LIST,SIEC.PROJECT_LIST.DETAIL_SEARCH',
        },
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('workflowBusinessKey');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        // 查询审批记录数据
        const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
          workFlowBussinessKeys
        );
        console.log(approvaFlags);
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

const createByPrDs = () => ({
  autoQuery: false,
  primaryKey: 'prLineId',
  cacheSelection: true,
  dataToJSON: 'selected',
  selection: 'multiple',
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.common.prNumAndLine`).d('采购申请编号|行号'),
      type: 'string',
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sodr.common.model.common.lineNum`).d('行号'),
      type: 'string',
    },
    {
      name: 'itemCode',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
      type: 'string',
    },
    {
      name: 'itemName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.commonName`).d('通用名'),
      name: 'commonName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物品分类'),
      name: 'categoryName',
      width: 100,
    },
    {
      label: intl.get('ssrc.common.company').d('公司'),
      name: 'companyName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
      name: 'ouName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
      name: 'invOrganizationName',
      width: 130,
    },
    {
      name: 'uomPrecision',
      type: 'number',
    },
    {
      name: 'quantity',
      width: 80,
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.quantity`).d('数量'),
      },
    },
    {
      label: intl.get(`sprm.common.model.common.availableQuantity`).d('剩余可占用数量'),
      name: 'availableQuantity',
      width: 160,
    },
    { label: intl.get(`sprm.common.model.common.uomName`).d('单位'), name: 'secondaryUomName' },
    {
      label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('申请数量'),
      name: 'secondaryQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('secondaryUomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价（含税）'),
      name: 'secondaryTaxInUnitPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantity`).d('剩余可占用数量'),
      name: 'occupiedQuantity',
      type: 'number',
      width: 140,
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
      name: 'uomName',
      width: 80,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
      name: 'currencyCode',
      width: 80,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
      name: 'neededDate',
      width: 170,
      type: 'date',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
      name: 'prRequestedName',
      width: 130,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandExecutor`).d('需求执行人'),
      name: 'executorName',
      width: 100,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
      width: 100,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
      name: 'unitName',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.requestDate`).d('申请日期'),
      name: 'requestDate',
      width: 170,
      type: 'date',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
      name: 'remark',
      width: 200,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prSourcePlatform`).d('数据来源'),
      name: 'sourcePlatformCode',
      width: 130,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignedDate`).d('最后分配时间'),
      name: 'assignedDate',
      width: 170,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.surfaceFlag`).d('表面处理'),
      name: 'surfaceTreatFlag',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNum`).d('供应商料号'),
      name: 'supplierItemCode',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNumDesc`).d('供应商料号描述'),
      name: 'supplierItemNumDesc',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectCategory`).d('项目类别'),
      name: 'projectCategoryMeaning',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prTypeName`).d('申请类型'),
      name: 'prTypeName',
      width: 150,
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/pro-refer-pr/workbench-pr-line`,
        method: 'GET',
        data: {
          ...data,
          prCustomizeFilterFlag: 1,
          erpControlFlag: 1,
          form: 'project',
          customizeUnitCode:
            'SIEC.PROJECT_LIST.CREATEBYPR_FILTER,SIEC.PROJECT_LIST.CREATEBYPR_LIST',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

export { wholeDs, projectChangeDs, createByPrDs };
