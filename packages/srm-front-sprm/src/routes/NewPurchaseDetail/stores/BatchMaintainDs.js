/* //批量编辑字段的ds和行字段ds要一一对应 */
import intl from 'utils/intl';
import moment from 'moment';

export default ({
  organizationId,
  header,
  cuxBatchListField,
  handleBatchLineChange,
  uomCodeAndNameRule,
  listDs,
}) => {
  return {
    paging: false,
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'receiveAddress',
        label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = header?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'receiveContactName',
        label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = header?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'receiveTelNum',
        label: intl.get(`sprm.common.model.common.receiverTelNum`).d('收货联系电话'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = header?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'projectTaskId',
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        type: 'object',
        label: intl.get(`sprm.common.model.common.projectTaskId`).d('项目任务名称'),
        lovPara: { tileTreeFlag: 1, businessObjectCode: 'SRM_C_SRM_SPRM_PR_HEADER' },
        optionsProps: dsProps => ({
          ...dsProps,
          paging: 'server',
          idField: 'taskId',
          parentField: 'parentTaskId',
          record: {
            dynamicProps: {
              selectable: record => record.get('isCheck') !== false,
            },
          },
        }),
        transformRequest: value => value?.taskId,
        transformResponse: (value, object) => {
          return object?.projectTaskId
            ? {
                taskId: object?.projectTaskId,
                taskName: object?.projectTaskName,
              }
            : null;
        },
      },
      {
        label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
        name: 'projectNum',
      },
      {
        label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
        name: 'projectName',
      },
      {
        name: 'innerPoNum',
        label: intl.get(`sprm.common.model.common.inpaperNum`).d('内部订单号'),
      },
      {
        name: 'remark',
        label: intl.get(`sprm.common.model.common.remark`).d('备注'),
      },
      {
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountId',
        type: 'object',
        lovCode: 'SMDM.BUDGET_ACCOUNT',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              companyId: header?.get('companyId'),
            };
          },
        },
        transformRequest: value => value?.budgetAccountId,
        transformResponse(value, data) {
          if (value) {
            return {
              budgetAccountId: value,
              budgetAccountNum: data.budgetAccountNum,
              budgetAccountName: data.budgetAccountName,
            };
          } else {
            return null;
          }
        },
        valueField: 'budgetAccountId',
        textField: 'budgetAccountName',
      },
      {
        bind: 'budgetAccountId.budgetAccountNum',
        name: 'budgetAccountNum',
      },
      {
        bind: 'budgetAccountId.budgetAccountName',
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountName',
      },
      {
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
        name: 'projectCategory',
        type: 'object',
        lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
        transformRequest: value => value?.value,
        transformResponse(value, data) {
          if (value) {
            return {
              projectCategory: data.value,
              projectCategoryMeaning: data.meaning,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'projectCategoryMeaning',
        bind: 'projectCategory.meaning',
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
      },
      {
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        name: 'expBearDepId',
        type: 'object',
        valueField: 'unitId',
        textField: 'unitName',
        lovCode: 'SPFM.UNIT_G_C',
        transformRequest: value => value?.unitId,
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              ouId: header?.get('ouId'),
              // unitTypeCode: 'D',
              unitCompanyId: header?.get('parentUnitId'),
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              expBearDepId: data.unitId,
              expBearDepName: data.unitName,
              expBearDep: data.unitName,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'expBearDepName',
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        bind: 'expBearDepId.unitName',
      },
      {
        name: 'expBearDep',
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        bind: 'expBearDepId.unitName',
      },
      {
        name: 'accountSubjectId',
        type: 'object',
        lovCode: 'SPRM.ACCOUNT_SUBJECT',
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        valueField: 'accountSubjectId',
        transformRequest: value => value?.accountSubjectId,
        textField: 'accountSubjectName',
        lovPara: {
          tenantId: organizationId,
        },
        transformResponse(value, data) {
          if (value) {
            return {
              accountSubjectId: value,
              accountSubjectNum: data.accountSubjectNum,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'accountSubjectNum',
        bind: 'accountSubjectId.accountSubjectNum',
      },
      {
        name: 'inventoryId',
        type: 'object',
        // ignore: 'always',
        lovCode: 'SPRM.INVENTORY',
        label: intl.get(`sprm.common.model.inventoryName`).d('库房'),
        valueField: 'inventoryId',
        textField: 'inventoryName',
        lovPara: { tenantId: organizationId },
        transformRequest: value => value?.inventoryId,
        dynamicProps: {
          disabled({ record }) {
            return !record.get('invOrganizationId');
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              inventoryId: value,
              inventoryName: data.inventoryName,
              inventoryIdMeaning: data.inventoryName,
            };
          } else {
            return null;
          }
        },
      },
      {
        label: intl.get(`sprm.common.model.sumProject`).d('库房'),
        name: 'inventoryIdMeaning',
        bind: 'inventoryId.inventoryName',
      },
      {
        label: intl.get(`sprm.common.model.sumProject`).d('库房'),
        name: 'inventoryName',
        bind: 'inventoryId.inventoryName',
      },
      {
        label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
        name: 'neededDate',
        type: 'date',
        min: moment('1970-01-01'),
      },
      {
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        transformRequest: value => value?.organizationId,
        dynamicProps: {
          lovPara() {
            return {
              ouId: header?.get('ouId'),
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              invOrganizationId: value,
              invOrganizationName: data.organizationName,
            };
          } else {
            return null;
          }
        },
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        name: 'costId',
        type: 'object',
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        lovCode: 'SPRM.COST_CENTER',
        transformRequest: value => value?.costId,
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              ouId: header?.get('ouId'),
              companyId: header?.get('companyId'),
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              costId: value,
              costName: data.costName,
              costCode: data.costCode,
            };
          } else {
            return null;
          }
        },
        valueField: 'costId',
        textField: 'costName',
      },
      {
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        name: 'costName',
        bind: 'costId.costName',
      },
      {
        name: 'costCode',
        bind: 'costId.costCode',
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbsCode',
        type: 'object',
        lovCode: 'SMDM.WBS',
        transformRequest: value => value?.wbsCode,
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              companyId: header?.get('companyId'),
              ouId: header?.get('ouId'),
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              wbsCode: data.wbsCode,
              wbs: data.wbsName,
            };
          } else {
            return null;
          }
        },
        valueField: 'wbsCode',
        textField: 'wbsName',
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbs',
        bind: 'wbsCode.wbsName',
      },
      ...(typeof cuxBatchListField === 'function' ? cuxBatchListField({ header, listDs }) : []),
    ],
    events: {
      update: ({ record, name, value, dataSet }) => {
        // 基础信息
        if (name === 'invOrganizationId') {
          record.set({
            receiveAddress: value?.address,
          });
        }
        if (typeof handleBatchLineChange === 'function') {
          handleBatchLineChange({
            name,
            record,
            value,
            dataSet,
            uomCodeAndNameRule,
            header,
            listDs,
          });
        }
      },
    },
  };
};
