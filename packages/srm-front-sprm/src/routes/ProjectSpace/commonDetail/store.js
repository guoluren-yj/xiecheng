// import moment from 'moment';
import intl from 'utils/intl';
import moment from 'moment';
import { SRM_SIEC, PRIVATE_BUCKET } from '_utils/config';
import { DATETIME_MIN } from 'utils/constants';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { fetchContactInfo } from '@/services/projectSpaceService';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { isEmpty, isFunction } from 'lodash';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '@/routes/utils';

const commonPrompt = 'sprm.project.model.common';
const organizationId = getCurrentOrganizationId();
const HeaderDs = ({
  taskDs,
  purListDs,
  supplierDs,
  projectReqHeaderId,
  projectId,
  customizeUnitCode,
  handleHeaderDsLoad,
}) => {
  return {
    paging: false,
    autoQuery: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'projectNum',
        disabled: true,
        label: intl.get(`${commonPrompt}.projectNum`).d('项目编号'),
      },
      {
        name: 'projectName',
        required: true,
        label: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
      },
      {
        name: 'companyId',
        label: intl.get(`sprm.common.model.common.company`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        type: 'object',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => record?.get('projectReqHeaderId'),
        },
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
        transformRequest: value => value?.companyId,
        transformResponse: (value, object) => {
          return object?.companyId
            ? {
                ...object,
                companyId: object?.companyId,
              }
            : null;
        },
      },
      {
        name: 'ouId',
        label: intl.get(`sprm.common.model.ouName`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        type: 'object',
        dynamicProps: {
          lovPara({ record }) {
            return {
              companyId: record.get('companyId')?.companyId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformRequest: value => value?.ouId,
        transformResponse: (value, object) => {
          return object?.ouId
            ? {
                ...object,
                ouId: object?.ouId,
                ouName: object?.ouName,
              }
            : null;
        },
      },
      {
        name: 'purchaseOrgId',
        label: intl.get(`sprm.common.model.common.purchaseOrgName`).d('采购组织'),
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
        textField: 'organizationName',
        type: 'object',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              tenantId: organizationId,
            };
          },
        },
        transformRequest: value => value?.purchaseOrgId,
        transformResponse: (value, object) => {
          return object?.purchaseOrgId
            ? {
                ...object,
                purchaseOrgId: object.purchaseOrgId,
                organizationName: object.purchaseOrganizationName,
              }
            : {};
        },
      },
      {
        name: 'departmentId',
        label: intl.get(`sprm.common.model.common.department`).d('部门'),
        lovCode: 'SPRM.USER_UNIT',
        type: 'object',
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              tenantId: organizationId,
            };
          },
        },
        transformRequest: value => value?.unitId,
        transformResponse: (value, object) => {
          return object?.departmentId
            ? {
                ...object,
                unitId: object?.departmentId,
                unitName: object?.departmentName,
              }
            : {};
        },
      },
      {
        name: 'projectTypeId',
        label: intl.get('entity.order.type.typeDescription').d('项目类型'),
        lovCode: 'SIEC.PROJECT_TYPE',
        type: 'object',
        transformRequest: value => value?.typeId,
        transformResponse: (value, object) => {
          return object?.projectTypeId
            ? {
                ...object,
                typeId: object.projectTypeId,
                typeDescription: object.projectTypeName,
              }
            : null;
        },
      },
      {
        name: 'currencyCode',
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        textField: 'codeName',
        valueField: 'currencyCode',
        required: true,
        type: 'object',
        dynamicProps: {
          disabled: ({ record }) => record?.get('projectReqHeaderId'),
        },
        label: intl.get(`sprm.common.model.currencyCode`).d('币种'),
        transformRequest: value => value?.currencyCode,
        transformResponse: (value, object) => {
          return object?.currencyCode
            ? {
                ...object,
                currencyCode: object.currencyCode,
                currencyName: object.currencyName,
                codeName: object.currencyCodeAndName,
              }
            : null;
        },
      },
      {
        name: 'budgetAmount',
        label: intl.get('sprm.common.project.budgetAmount').d('预算金额'),
        type: 'number',
        dynamicProps: {
          disabled: ({ dataSet }) => {
            const projectTaskListDs = dataSet?.children?.projectTaskList;
            const projectTaskListArr = projectTaskListDs ? projectTaskListDs.data : [];
            console.log(projectTaskListArr);
            const projectFilterCanceled = projectTaskListArr?.filter(e =>
              ['UNCANCELED'].includes(e.get('cancelStatus'))
            );
            const amountRules = dataSet.getState('amountRules') || 'SELF_MAINTENANCE';
            return (
              amountRules === 'TOTAL_AMOUNT_PR_LIST' ||
              (amountRules === 'TOTAL_AMOUNT_TASK' && projectFilterCanceled?.length > 1)
            );
          },
        },
        min: 0,
        numberGrouping: true,
      },
      {
        name: 'principalUserId',
        label: intl.get('ssrc.tenderPlan.model.tenderPlan.projectUserName').d('项目负责人'),
        lovCode: 'SSRC.PREQUAL_USER',
        transformRequest: value => value?.id,
        type: 'object',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
            };
          },
        },
        required: true,
        transformResponse: (value, object) => {
          return object?.principalUserId
            ? {
                ...object,
                id: object?.principalUserId,
                realName: object?.principalUserName,
              }
            : null;
        },
      },
      {
        name: 'projectTeamUserList',
        label: intl.get('sprm.common.project.projectTeamUserList').d('项目团队成员'),
        lovCode: 'SSRC.PREQUAL_USER',
        multiple: true,
        type: 'object',
        textField: 'realName',
        lovPara: { tenantId: organizationId },
        valueField: 'id',
        transformResponse: (value, object) => {
          const newData = object?.projectTeamUserList?.map(item => ({
            ...item,
            id: item?.userId,
            realName: item?.userName,
          }));
          return object?.projectTeamUserList ? newData : null;
        },
        transformRequest: value =>
          value?.map(e => ({
            userId: e.id,
            projectId,
            projectReqHeaderId,
            tenantId: organizationId,
            userName: e.realName,
            teamUserId: e.teamUserId,
          })),
      },
      {
        name: 'creationDate',
        label: intl.get('hzero.common.creationDate').d('创建时间'),
        type: 'dateTime',
      },
      {
        name: 'projectStatus',
        lookupCode: `SIEC.PROJECT_STATUS`,
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'sourcePlatform',
        lookupCode: 'SIEC.PROJECT_SOURCE',
        label: intl.get(`sprm.common.model.common.prSourcePlatform`).d('单据来源'),
      },
      {
        name: 'projectExplanation',
        label: intl.get(`sprm.common.model.common.projectExplanation`).d('项目说明'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.purchaseRequest.title.attachment').d('附件'),
      },
      {
        name: 'createdByName',
        label: intl.get(`hzero.common.creationName`).d('创建人'),
      },
      {
        name: 'amount',
        type: 'number',
        numberGrouping: true,
        label: intl.get(`sprm.project.model.common.amount`).d('总金额'),
      },
      {
        name: 'sourceDocument',
        label: intl.get(`sprm.common.model.common.sourceDocumentAndLineNum`).d('来源单号-行号'),
      },
    ],
    children: {
      projectTaskList: taskDs,
      supplierList: supplierDs,
      taskPurchaseItemList: purListDs,
    },
    transport: {
      read: () => {
        if (projectId) {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project/base/${projectId}`,
            method: 'GET',
            data: filterNullValueObject({
              customizeUnitCode,
            }),
          };
        } else if (projectReqHeaderId) {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-req/base/${projectReqHeaderId}`,
            method: 'GET',
            data: filterNullValueObject({
              customizeUnitCode,
            }),
          };
        } else {
          return false;
        }
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
        if (handleHeaderDsLoad && isFunction(handleHeaderDsLoad)) {
          handleHeaderDsLoad({ dataSet });
        }
      },
    },
  };
};
const TaskDs = ({ projectId, source, customizeUnitCode, projectReqHeaderId }) => {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    forceValidate: true,
    dataToJSON: 'dirty',
    primaryKey: ['change', 'changeRead'].includes(source) ? 'taskReqId' : 'taskId',
    idField: ['change', 'changeRead'].includes(source) ? 'taskReqId' : 'taskId',
    parentField: ['change', 'changeRead'].includes(source) ? 'parentTaskReqId' : 'parentTaskId',
    fields: [
      {
        name: 'level',
        label: intl.get(`${commonPrompt}.level`).d('层级'),
      },
      {
        name: 'taskNum',
        label: intl.get(`${commonPrompt}.taskNum`).d('任务编号'),
        dynamicProps: {
          disabled({ record }) {
            return record.get('projectReqHeaderId');
          },
        },
      },
      {
        name: 'taskName',
        dynamicProps: {
          disabled({ record }) {
            return record.get('taskId') && record.get('projectReqHeaderId');
          },
        },
        label: intl.get(`${commonPrompt}.taskName`).d('任务名称'),
      },
      {
        name: 'cancelStatus',
        lookupCode: 'SIEC.PROJECT_TASK_CANCEL_STATUS',
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'principalUserId',
        label: intl.get(`${commonPrompt}.principalUserId`).d('负责人'),
        lovCode: 'SSRC.PREQUAL_USER',
        type: 'object',
        lovPara: { tenantId: organizationId },
        dynamicProps: {
          disabled({ record }) {
            return record.get('cancelStatus') !== 'UNCANCELED';
          },
        },
        transformRequest: value => value?.id,
        transformResponse: (value, object) => {
          return object?.principalUserId
            ? {
                ...object,
                id: object?.principalUserId,
                realName: object?.principalUserName,
              }
            : null;
        },
      },
      {
        name: 'budgetAmount',
        label: intl.get('sprm.common.project.budgetAmount').d('预算金额'),
        type: 'number',
        numberGrouping: true,
        dynamicProps: {
          disabled({ record, dataSet }) {
            const amountRules = dataSet.getState('amountRules') || 'SELF_MAINTENANCE';
            return (
              record.get('cancelStatus') !== 'UNCANCELED' ||
              (record.children?.length > 0 && amountRules === 'TOTAL_AMOUNT_TASK')
            );
          },
        },
      },
      {
        name: 'taskExplanation',
        label: intl.get(`${commonPrompt}.taskExplanation`).d('任务说明'),
        dynamicProps: {
          disabled({ record }) {
            return record.get('cancelStatus') !== 'UNCANCELED';
          },
        },
      },
      { name: 'assignPurItem', label: intl.get(`${commonPrompt}.assignPurItem`).d('分配采购件') },
      { name: 'action', label: intl.get('hzero.common.button.action').d('操作') },
    ],
    cascadeParams: () => {},
    transport: {
      read: ({ data }) => {
        if (projectId && !['change', 'changeRead'].includes(source)) {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-task/${projectId}`,
            method: 'GET',
            data: filterNullValueObject({
              ...data,
              customizeUnitCode,
            }),
          };
        } else if (projectReqHeaderId) {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-task/req/${projectReqHeaderId}`,
            method: 'GET',
            data: filterNullValueObject({
              ...data,

              customizeUnitCode,
            }),
          };
        }
      },
    },
  };
};

const PurListDs = ({
  projectId,
  taskId,
  projectReqHeaderId,
  updatedData = [],
  customizeUnitCode,
  filterParams = [],
  taskReqId,
  source,
}) => {
  return {
    pageSize: 20,
    autoCreate: false,
    autoQuery: true,
    cacheSelection: true,
    selection: !source || source === 'change' ? 'multiple' : false,
    cacheModified: true,
    dataToJSON: 'dirty',
    primaryKey: ['change', 'changeRead'].includes(source) ? 'purchaseItemReqId' : 'purchaseItemId',
    fields: [
      {
        name: 'itemId',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
        type: 'object',
        textField: 'itemCode',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        dynamicProps: {
          disabled({ record }) {
            return record.get('purchaseItemId') && record.get('purchaseItemReqId');
          },
        },
        transformRequest: value => value?.itemId,
        transformResponse: (value, object) => {
          return value
            ? {
                itemId: object?.itemId,
                itemName: object?.itemName,
                itemCode: object?.itemCode,
              }
            : null;
        },
      },
      { name: 'itemCode' },
      { name: 'virtualLineNum', label: intl.get(`sprm.common.model.common.lineNumber`).d('行号') },
      {
        name: 'itemName',
        required: true,
        dynamicProps: {
          disabled({ record }) {
            return record.get('purchaseItemId') && record.get('purchaseItemReqId');
          },
        },
        label: intl.get(`sprm.common.model.common.itemName`).d('物料名称'),
      },
      {
        name: 'categoryId',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        type: 'object',
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
        transformRequest: value => value?.categoryId,
        textField: 'categoryName',
        optionsProps: {
          paging: 'server',
          idField: 'categoryId',
          parentField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: record => record.get('isCheck') !== false,
            },
          },
        },
        transformResponse: (value, object) => {
          return value
            ? {
                categoryId: object?.categoryId,
                categoryName: object?.categoryName,
              }
            : null;
        },
      },
      { name: 'categoryName', bind: 'categoryId.categoryName' },
      { name: 'uomCodeAndName', bind: 'uomId.uomCodeAndName' },
      {
        name: 'taskNum',
        lovCode: projectId ? 'SIEC.PROEJCT_TASK' : 'SIEC.PROJECT_TASK_REQ',
        type: 'object',
        valueField: 'taskNum',
        textField: 'taskNum',
        help: !source
          ? intl
              .get(`${commonPrompt}.taskNumHelp`)
              .d('更改任务编号后需点击【保存】按钮，更改方可生效')
          : undefined,
        dynamicProps: {
          lovPara() {
            return {
              projectId,
              projectReqHeaderId,
              tenantId: organizationId,
            };
          },
        },
        label: intl.get(`${commonPrompt}.taskNum`).d('任务编号'),
        transformRequest: value => value?.taskNum,
      },
      {
        label: intl.get(`sprm.common.model.common.itemModel`).d('型号'),
        name: 'model',
      },
      {
        label: intl.get(`sprm.common.model.common.itemSpecs`).d('规格'),
        name: 'specifications',
      },
      {
        name: 'taskLevel',
        label: intl.get(`${commonPrompt}.level`).d('层级'),
      },
      {
        name: 'quantity',
        validator(value) {
          if (value <= 0) {
            return intl.get(`sprm.common.message.baseMustExceedZero`).d('基本数量必须大于零');
          } else {
            return true;
          }
        },
        required: true,
        type: 'number',
        label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
      },
      {
        name: 'cancelStatus',
        lookupCode: 'SIEC.PROJECT_TASK_PUR_ITEM_STATUS',
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'estimatedUnitPrice',
        numberGrouping: true,
        type: 'number',
        min: 0,
        label: intl.get(`${commonPrompt}.secondaryTaxInUnitPrice`).d('预估单价(含税)'),
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
        name: 'estimatedLineAmount',
        numberGrouping: true,
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`sprm.common.model.common.unitPriceBatch`).d('每'),
        type: 'number',
        precision: 0,
        min: 1,
        numberGrouping: true,
        name: 'unitPriceBatch',
      },
      {
        label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
        name: 'demandDate',
        min: moment().format(DATETIME_MIN),
        type: 'date',
      },
      {
        name: 'uomId',
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomCodeAndName',
        label: intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
        valueField: 'uomId',
        transformRequest: value => value?.uomId,
        transformResponse: (value, object) => {
          return object?.uomId
            ? {
                ...object,
                uomId: object?.uomId,
                uomName: object?.uomName,
                uomCodeAndName: object?.uomName,
              }
            : null;
        },
      },
      { name: 'uomCodeAndName', bind: 'uomId.uomCodeAndName' },
      {
        name: 'remark',
        label: intl.get(`sprm.common.model.common.remark`).d('备注'),
      },
      { name: 'projectId' },
      { name: 'taskId' },
      { name: 'taskReqId' },
      { name: 'tenantId' },
      {
        name: 'sourceDocument',
        label: intl.get(`sprm.common.model.common.sourceDocumentAndLineNum`).d('来源单号-行号'),
      },
    ],
    transport: {
      read: ({ dataSet, params }) => {
        const [dataPara] = dataSet.queryDataSet ? dataSet.queryDataSet.toData() : [{}];
        if (projectId && !['change', 'changeRead'].includes(source)) {
          const filter = dataSet.parent
            ? dataSet.parent?.getState('deletePurList') || filterParams
            : filterParams;
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-task/purchase-item/query`,
            method: 'post',
            params: {
              ...params,
              ...dataPara,
              projectId,
              projectReqHeaderId,
              taskId,
              customizeUnitCode,
            },
            data: filterNullValueObject({
              ...dataPara,
              taskId,
              excludePurchaseItemIds: filter?.map(e => e?.purchaseItemId),
              projectId,
              projectReqHeaderId,
              customizeUnitCode,
            }),
          };
        } else if (projectReqHeaderId) {
          const filter = dataSet.parent
            ? dataSet.parent?.getState('deletePurList') || filterParams
            : filterParams;
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-task/req/purchase-item/query`,
            method: 'POST',
            params: {
              ...params,
              projectReqHeaderId,
              taskReqId,
              ...dataPara,
              customizeUnitCode,
            },
            data: filterNullValueObject({
              taskReqId,
              ...dataPara,
              excludePurchaseItemReqIds: filter?.map(e => e?.purchaseItemReqId),
              projectReqHeaderId,
              customizeUnitCode,
            }),
          };
        }
      },
    },
    events: {
      load: ({ dataSet }) => {
        const updated = updatedData?.filter(e => e?.purchaseItemId || e.purchaseItemReqId);
        const created = updatedData?.filter(e => !(e.purchaseItemId || e.purchaseItemReqId));
        dataSet.forEach(ele => {
          const currentLine = updated.find(
            item =>
              item.purchaseItemId === ele?.get('purchaseItemId') ||
              (item.purchaseItemReqId === ele?.get('purchaseItemReqId') && item.purchaseItemReqId)
          );
          if (currentLine) {
            ele.set({
              ...currentLine,
              itemId: { ...currentLine },
              categoryId: { ...currentLine },
              uomId: { ...currentLine },
            });
          }
        });
        created.forEach(e => {
          dataSet.create(e, 0);
        });
      },
      update: ({ name, record, value }) => {
        if (name === 'itemId') {
          if (value) {
            const {
              itemName,
              model,
              itemCode,
              specifications,
              itemCategoryId,
              itemCategoryName,
            } = value;
            record.set({
              itemName,
              itemCode,
              model,
              specifications,
              categoryId: {
                categoryId: itemCategoryId,
                categoryName: itemCategoryName,
              },
            });
          }
        }
        if (name === 'taskNum') {
          if (projectId) {
            record.set({ taskId: value.taskId });
          } else if (projectReqHeaderId) {
            record.set({ taskReqId: value.taskReqId });
          }
        }
      },
    },
  };
};
const SupplierDs = ({ source, projectId, projectReqHeaderId, customizeUnitCode }) => {
  return {
    page: false,
    pageSize: 20,
    dataToJSON: 'dirty',
    autoQuery: false,
    selection: !source || source === 'change' ? 'multiple' : false,
    cacheSelection: true,
    cacheModified: true,
    fields: [
      {
        name: 'supplierCodeLov',
        type: 'object',
        lovCode: 'SPRM.SUPPLIER',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        dynamicProps: {
          textField: ({ record }) =>
            record.get('supplierCompanyNum') ? 'supplierCompanyNum' : 'supplierNum',
        },
        required: true,
        label: intl.get(`entity.supplier.supplierCompanyNum`).d('供应商编码'),
        transformResponse: (value, object) => {
          return object
            ? {
                ...object,
                displaySupplierName: object?.supplierCompanyName || object?.supplierName,
              }
            : null;
        },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierCodeLov.supplierCompanyId',
      },
      {
        name: 'supplierId',
        bind: 'supplierCodeLov.supplierId',
      },
      {
        name: 'supplierCompanyCode',
        type: 'string',
        bind: 'supplierCodeLov.supplierCompanyNum',
      },
      {
        name: 'supplierCode',
        type: 'string',
        bind: 'supplierCodeLov.supplierNum',
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCodeLov.supplierCompanyNum',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCodeLov.supplierTenantId',
      },
      {
        name: 'displaySupplierName',
        label: intl.get(`${commonPrompt}.displaySupplierName`).d('供应商名称'),
        type: 'string',
        bind: 'supplierCodeLov.displaySupplierName',
      },
      {
        name: 'contact',
        required: true,
        label: intl.get(`hzero.common.roles.contacts`).d('联系人'),
      },
      {
        name: 'contactPhone',
        required: true,
        label: intl.get(`${commonPrompt}.contactPhone`).d('联系人电话'),
        validator: (value, name, record) => {
          // 校验器 自定义校验规则对内容进行校验
          const testReg = record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
          if (!testReg.test(value)) {
            return intl.get(`sprm.common.model.common.enterPhoneErrMsg`).d('请输入有效的手机号');
          }
        },
      },
      {
        name: 'internationalTelCode',
        label: intl.get(`sprm.common.model.common.internationalTelCode`).d('国别码'),
        lookupCode: 'HPFM.IDD',
        dynamicProps: {
          disabled: ({ record }) => record.getField('contactPhone').disabled,
          required: ({ record }) => record.getField('contactPhone').required,
        },
      },
      {
        name: 'contactEmail',
        type: 'email',
        required: true,
        label: intl.get(`${commonPrompt}.contactEmail`).d('联系人邮箱'),
      },
      { name: 'projectId' },
      { name: 'projectReqHeaderId' },
      { name: 'tenantId' },
    ],
    transport: {
      read: ({ dataSet, params }) => {
        if (projectId && !['change', 'changeRead'].includes(source)) {
          const filter = dataSet.parent ? dataSet.parent?.getState('deleteSupplierList') : [];
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project/${projectId}/supplier/query`,
            method: 'POST',
            params: {
              ...params,
              customizeUnitCode,
            },
            data: filterNullValueObject({
              projectId,
              excludeProjectSupplierIds: filter?.map(e => e.projectSupplierId),
              customizeUnitCode,
            }),
          };
        } else if (projectReqHeaderId) {
          const filter = dataSet.parent ? dataSet.parent?.getState('deleteSupplierList') : [];
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-req/${projectReqHeaderId}/supplier/query`,
            method: 'POST',
            params: {
              ...params,
              customizeUnitCode,
            },
            data: filterNullValueObject({
              projectReqHeaderId,
              excludeProjectSupplierIds: filter?.map(e => e.projectSupplierId),
              customizeUnitCode,
            }),
          };
        } else {
          return false;
        }
      },
    },
    events: {
      update: ({ name, record, value, dataSet }) => {
        if (name === 'supplierCodeLov' && value) {
          const { supplierId, supplierCompanyId } = value;
          const companyId = dataSet.parent.current.get('companyId');
          fetchContactInfo({
            supplierId,
            supplierCompanyId,
            defaultFlag: 1,
            companyId: companyId.companyId || companyId,
          }).then(res => {
            if (res.content) {
              const [
                {
                  name: contact,
                  mobilephone: contactPhone,
                  internationalTelCode,
                  mail: contactEmail,
                },
              ] = res.content;
              record.set({
                contact,
                contactPhone,
                internationalTelCode,
                contactEmail,
              });
            }
          });
        }
      },
    },
  };
};

const TaskChildDs = ({ taskId, taskReqId, hasChildFlag, customizeUnitCode }) => {
  return {
    paging: false,
    autoQuery: true,
    dataToJSON: 'all',
    primaryKey: 'taskReqId',
    fields: [
      {
        name: 'taskNum',
        disabled: !!taskReqId || !!taskId,
        required: true,
        label: intl.get(`${commonPrompt}.taskNum`).d('任务编号'),
      },
      {
        name: 'taskName',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => {
            if (record?.get('level') === '0') return true;
            return record?.get('taskReqId') && record?.get('taskId');
          },
        },
        label: intl.get(`${commonPrompt}.taskName`).d('任务名称'),
      },
      {
        name: 'principalUserId',
        label: intl.get(`${commonPrompt}.principalUserId`).d('负责人'),
        lovCode: 'SSRC.PREQUAL_USER',
        transformRequest: value => value?.id,
        type: 'object',
        dynamicProps: {
          disabled: ({ record }) => record?.get('level') === '0',
          lovPara() {
            return {
              tenantId: organizationId,
            };
          },
        },
        required: true,
        transformResponse: (value, object) => {
          return object?.principalUserId
            ? {
                ...object,
                id: object?.principalUserId,
                realName: object?.principalUserName,
              }
            : null;
        },
      },
      {
        name: 'budgetAmount',
        label: intl.get('sprm.common.project.budgetAmount').d('预算金额'),
        type: 'number',
        dynamicProps: {
          disabled({ record, dataSet }) {
            if (record?.get('level') === '0') return true;
            const amountRules = dataSet.getState('amountRules') || 'SELF_MAINTENANCE';
            return hasChildFlag && amountRules === 'TOTAL_AMOUNT_TASK';
          },
        },
        numberGrouping: true,
      },
      {
        name: 'taskExplanation',
        label: intl.get(`sprm.common.model.common.taskExplanation`).d('任务说明'),
        dynamicProps: {
          disabled: ({ record }) => record?.get('level') === '0',
        },
      },
      { name: 'taskId' },
    ],
    transport: {
      read: () => {
        if (taskId) {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-task/detail/${taskId}`,
            method: 'GET',
            data: filterNullValueObject({
              customizeUnitCode: customizeUnitCode || 'SIEC.PROJECT_EDIT.COST_FORM',
            }),
          };
        } else if (taskReqId) {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-task/req/detail/${taskReqId}`,
            method: 'GET',
            data: filterNullValueObject({
              customizeUnitCode: customizeUnitCode || 'SIEC.PROJECT_EDIT.COST_FORM',
            }),
          };
        } else {
          return false;
        }
      },
    },
  };
};

const ExcuteLineDs = ({ projectId, source, tableFlat, executionDocHeaderId }) => {
  let fieldKeyProps = {};
  if (tableFlat === 'origin') {
    fieldKeyProps = {
      parentField: 'parentExectionId',
      idField: 'executionId',
      expandField: 'expand',
      primaryKey: 'executionId',
    };
  }
  return {
    pageSize: 20,
    autoQuery: true,
    dataToJSON: 'all',
    selection: false,
    paging: 'server',
    cacheModified: true,
    primaryKey: tableFlat !== 'headerTiling' ? 'executionId' : 'executionDocHeaderId',
    fields: [
      {
        name: 'status',
        lookupCode: 'SIEC.PROJECT_APPLICATION_STATUS',
        label: intl.get(`hzero.common.status`).d('状态'),
      },
      {
        name: 'viewDetail',
        label: intl.get('sprm.project.model.viewDetail').d('查看明细'),
      },
      {
        name: 'executionDocNum',
        required: true,
        label: intl.get(`${commonPrompt}.executionDocNum`).d('明细单据编号-行号'),
      },
      {
        name: 'executionDoc',
        required: true,
        label: intl.get(`${commonPrompt}.executionDocOnlyNum`).d('明细单据编号'),
      },
      {
        name: 'taskLevel',
        label: intl.get(`${commonPrompt}.level`).d('层级'),
      },
      {
        name: 'taskNum',
        label: intl.get(`${commonPrompt}.taskNum`).d('任务编号'),
      },
      {
        name: 'executionDocType',
        label: intl.get(`${commonPrompt}.executionDocType`).d('单据类型'),
      },
      {
        name: 'itemId',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`sprm.common.model.common.itemName`).d('物料名称'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sprm.common.model.common.currency').d('币种'),
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
        name: 'amount',
        numberGrouping: true,
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.docFlow`).d('单据流'),
        type: 'string',
        name: 'docFlow',
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.purchaseRequest.title.attachment').d('附件'),
      },
      {
        label: intl.get(`sprm.project.model.common.applicationAmount`).d('申请金额'),
        name: 'applicationAmount',
        numberGrouping: true,
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`sprm.common.model.common.bidAmount`).d('中标金额'),
        name: 'bidAmount',
        numberGrouping: true,
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`sprm.common.model.common.receiptAmount`).d('收货金额'),
        name: 'receiptAmount',
        numberGrouping: true,
        type: 'number',
        disabled: true,
      },
      {
        name: 'taskLevel',
        label: intl.get(`${commonPrompt}.level`).d('层级'),
      },
      {
        name: 'totalAmount',
        type: 'number',
        numberGrouping: true,
        label: intl.get(`${commonPrompt}.totalAmount`).d('总金额'),
      },
      {
        name: 'companyId',
        label: intl.get(`sprm.common.model.common.company`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        type: 'object',
        required: true,
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
        transformRequest: value => value?.companyId,
        transformResponse: (value, object) => {
          return object?.companyId
            ? {
                ...object,
                companyId: object?.companyId,
              }
            : null;
        },
      },
      {
        name: 'createdByName',
        label: intl.get(`hzero.common.creationName`).d('创建人'),
      },
      {
        name: 'ouId',
        label: intl.get(`sprm.common.model.ouName`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        type: 'object',
        dynamicProps: {
          lovPara({ record }) {
            return {
              companyId: record.get('companyId')?.companyId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformRequest: value => value?.ouId,
        transformResponse: (value, object) => {
          return object?.ouId
            ? {
                ...object,
                ouId: object?.ouId,
                ouName: object?.ouName,
              }
            : null;
        },
      },
    ],
    ...fieldKeyProps,
    transport: {
      read: ({ data }) => {
        const url = {
          lineTiling: `/v1/${organizationId}/project-doc-execution/line-tiling`,
          headerTiling: `/v1/${organizationId}/project-doc-execution/header-tiling`,
          origin: `/v1/${organizationId}/project-doc-execution/origin`,
        };
        const customizeUnitCode = {
          lineTiling: `SIEC.PROJECT_READ.LINK_TABLE,SIEC.PROJECT_READ.FLAT_FILTER`,
          headerTiling: `SIEC.PROJECT_READ.HEADER_LIST,SIEC.PROJECT_READ.HEADER_FILTER`,
          origin: `SIEC.PROJECT_READ.ORIGIN_LIST,SIEC.PROJECT_READ.ORIGIN_FILTER`,
        };
        if (projectId && source === 'readOnly') {
          return {
            url: `${SRM_SIEC}${url[tableFlat]}`,
            method: 'GET',
            data: filterNullValueObject({
              projectId,
              customizeUnitCode: customizeUnitCode[tableFlat],
              ...data,
              executionDocHeaderId,
            }),
          };
        }
      },
    },
  };
};

const DetailReqDs = ({ projectReqHeaderId }) => {
  return {
    selection: false,
    dataToJSON: 'all',
    autoQuery: true,
    autoCreate: false,
    fields: [
      {
        name: 'reqNum',
        label: intl.get('sprm.project.model.common.reqNum').d('项目控制申请单号'),
        disabled: true,
      },
      {
        name: 'reqType',
        label: intl.get(`sprm.common.model.common.sqType`).d('申请类型'),
        disabled: true,
        lookupCode: 'SIEC.PROJECT_APPLICATION_TYPE',
      },
      {
        name: 'createdByName',
        label: intl.get(`hzero.common.creationName`).d('创建人'),
        disabled: true,
      },
      {
        name: 'creationDate',
        label: intl.get('hzero.common.creationDate').d('创建时间'),
        type: 'dateTime',
        disabled: true,
      },
      {
        name: 'reqStatus',
        lookupCode: 'SIEC.PROJECT_APPLICATION_STATUS',
        label: intl.get('hzero.common.reqStatus').d('申请单状态'),
        disabled: true,
      },
      {
        name: 'reqReason',
        required: true,
        label: intl.get('hzero.common.reqReason').d('申请理由'),
      },
    ],
    transport: {
      read: () => {
        if (projectReqHeaderId) {
          return {
            url: `${SRM_SIEC}/v1/${organizationId}/project-req/detail/${projectReqHeaderId}`,
            method: 'GET',
            data: { projectReqHeaderId },
          };
        }
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
  };
};
export { HeaderDs, TaskDs, PurListDs, SupplierDs, TaskChildDs, ExcuteLineDs, DetailReqDs };
