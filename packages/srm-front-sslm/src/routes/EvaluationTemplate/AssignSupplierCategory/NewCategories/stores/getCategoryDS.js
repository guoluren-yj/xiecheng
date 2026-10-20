/*
 * @Date: 2023-03-07 10:39:32
 * @Author: CDJ <dengji.chen@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const categoryDS = ({ scopeId }) => ({
  autoQuery: true,
  paging: false,
  idField: 'categoryId',
  parentField: 'parentCategoryId',
  dataToJSON: 'selected',
  fields: [
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.productCode`).d('品类编码'),
      name: 'categoryCode',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.categoryName`).d('品类名称'),
      name: 'categoryName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.productCode`).d('品类编码'),
      name: 'categoryCode',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.categoryName`).d('品类名称'),
      name: 'categoryName',
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/scope/${scopeId}/category`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          enabledFlag: 1,
          businessObjectCode: 'SRM_C_SRM_SSLM_KPI_EVAL',
        },
      };
    },
  },
  record: {
    dynamicProps: {
      selectable: record => record.get('isCheck') !== false,
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.data.evalTplScopeDtlId) {
          Object.assign(record, { isSelected: true });
        }
      });
    },
    select: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.select(i));
      }
    },
    unSelect: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.unSelect(i));
      }
    },
  },
});

export { categoryDS };
