/*
 * @Date: 2023-04-12 10:28:52
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getSupplierClassifyDS = ({ compareFlag = false } = {}) => ({
  forceValidate: true,
  paging: !compareFlag, // 对比不分页
  fields: [
    {
      name: 'categoryLov',
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      lovPara: {
        tenantId: organizationId,
        enabledFlag: 1,
      },
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
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
      name: 'categoryCode',
      required: true,
      type: 'object',
      textField: 'categoryCode',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      lovPara: {
        enabledFlag: 1,
        tenantId: organizationId,
      },
      label: intl.get('sslm.enterpriseInform.model.supplierClassify.code').d('供应商类型分类'),
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag'),
          },
        },
      },
      transformRequest: value => value && value.supplierCategoryCode,
      transformResponse: (value, data) => {
        const { categoryCode, supplierCategoryId, categoryDescription } = data;
        return value
          ? {
              categoryCode,
              supplierCategoryId,
              supplierCategoryCode: categoryCode,
              supplierCategoryDescription: categoryDescription,
            }
          : null;
      },
    },
    {
      name: 'supplierCategoryId',
      bind: 'categoryCode.supplierCategoryId',
    },
    {
      name: 'categoryDescription',
      bind: 'categoryCode.supplierCategoryDescription',
      label: intl.get('sslm.enterpriseInform.model.supplierClassify.describe').d('供应商分类描述'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('supplierCategoryId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-cates`,
        method: 'GET',
        data: {
          changeReqId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SCLASSIFY',
        },
      };
    },
  },
});
