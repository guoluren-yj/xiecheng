import { isArray } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const dsProps = () => ({
  fields: [
    {
      type: 'object',
      componentType: 'LOV',
      disabled: true,
      name: 'supplierCompanyId',
      lovCode: 'SSLM.USER_AUTH.SUPPLIER', // TODO
      label: intl.get(`sslm.outsideProjectSetup.modal.supplierName`).d('供应商名称'),
      transformRequest: value => value && value.supplierCompanyId,
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      type: 'object',
      componentType: 'LOV',
      ignore: 'always',
      name: 'salesPersonIdsLov',
      required: true,
      noCache: true,
      disabled: true,
      lovCode: 'SPFM.QUERY_SALES_PERSON', // TODO
      label: intl.get('sslm.supplierInvite.model.invite.salesName').d('销售员姓名'),
    },
    {
      name: 'companyContactId',
      bind: 'salesPersonIdsLov.id',
    },
    {
      type: 'boolean',
      componentType: 'CHECKBOX',
      name: 'levelTypeFlag',
      trueValue: 0,
      falseValue: 1,
      defaultValue: 1,
      required: true,
      label: intl.get(`sslm.outsideProjectSetup.modal.levelTypeFlag`).d('是否集团级合作'),
    },
    {
      type: 'object',
      componentType: 'LOV',
      ignore: 'always',
      name: 'companyIdLov',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY', // TODO
      label: intl.get(`sslm.outsideProjectSetup.modal.hezuoCompany`).d('合作公司'),
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            organizationId,
            // 集团集邀约，传一个标识给后端适配器
            levelTypeFlag: record.get('levelTypeFlag') ? 0 : 1,
          };
        },
      },
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
    },
    {
      type: 'string',
      componentType: 'SELECT',
      name: 'toCycleStageId',
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE', // TODO
      label: intl.get(`sslm.common.model.lifeCycle`).d('生命周期'),
    },
    {
      type: 'object',
      componentType: 'LOV',
      ignore: 'always',
      multiple: true,
      noCache: true,
      name: 'multiSupplierCategoryIdLov',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl.get(`sslm.common.view.supplier.class`).d('供应商分类'),
      lovPara: {
        tenantId: organizationId,
        enabledFlag: 1,
        parentCategoryId: 0,
      },
      textField: 'categoryDescription',
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag'),
          },
        },
        events: {
          select: ({ dataSet, record }) => {
            const parentCategoryId = record.get('parentCategoryId');
            if (parentCategoryId) {
              const parentRecord = dataSet.find(rec => rec.get('categoryId') === parentCategoryId);
              if (parentRecord) {
                dataSet.select(parentRecord);
              }
            }
          },
        },
      },
    },
    {
      name: 'multiSupplierCategoryId',
      bind: 'multiSupplierCategoryIdLov.categoryId',
      transformRequest: value => {
        if (value) {
          return isArray(value) ? value.join(',') : value;
        } else {
          return value;
        }
      },
    },
    {
      type: 'object',
      componentType: 'LOV',
      ignore: 'always',
      name: 'categoryIdLov',
      multiple: true,
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE', // TODO
      label: intl.get(`sslm.outsideProjectSetup.modal.categoryId`).d('准入分类'),
      lovPara: {
        tenantId: organizationId,
        businessObjectCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE',
      },
      noCache: true,
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
      transformRequest: val => val && val.join(','),
    },
    {
      name: 'categoryIds',
      bind: 'categoryIdLov.categoryId',
      transformRequest: value => {
        if (value) {
          return isArray(value) ? value : [value];
        } else {
          return value;
        }
      },
    },
  ],
});

export const formFields = [
  {
    name: 'supplierCompanyId',
    componentType: 'LOV',
  },
  {
    name: 'salesPersonIdsLov',
    componentType: 'LOV',
  },
  {
    name: 'levelTypeFlag',
    componentType: 'CHECKBOX',
  },
  {
    name: 'companyIdLov',
    componentType: 'LOV',
  },
  {
    componentType: 'SELECT',
    name: 'toCycleStageId',
  },
  {
    componentType: 'LOV',
    name: 'multiSupplierCategoryIdLov',
    tableProps: {
      selectionMode: 'rowbox',
      treeAsync: true,
      alwaysShowRowBox: true,
      onRow: ({ record }) => {
        const nodeProps = { disabled: false };
        if (+record.get('hasChild') === 0) {
          nodeProps.isLeaf = true;
        }
        return nodeProps;
      },
    },
  },
  {
    componentType: 'LOV',
    name: 'categoryIdLov',
  },
];
