/*
 * @Date: 2022-05-28 10:39:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const categoryDS = ({
  evalHeaderId,
  supplierId,
  docStatus,
  isBdkpiEvalFlag,
  selectedData = [],
  categorySelectFlag = false,
}) => ({
  primaryKey: 'categoryId',
  autoQuery: true,
  paging: false,
  idField: 'categoryId',
  parentField: 'parentCategoryId',
  dataToJSON: 'selected',
  cacheSelection: true,
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
        url: `${SRM_SSLM}/v1/${organizationId}/eval-line/category/c7n/${evalHeaderId}/${supplierId}`,
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
      selectable: record =>
        ['NEW', 'NEW_REJECTED'].includes(docStatus) &&
        !isBdkpiEvalFlag &&
        record.get('isCheck') !== false,
    },
  },
  events: {
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
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        const { categoryId, evalLineId } = record.get(['categoryId', 'evalLineId']);
        if (categorySelectFlag) {
          if (selectedData.includes(categoryId)) {
            Object.assign(record, { isSelected: true });
          }
        } else if (evalLineId) {
          Object.assign(record, { isSelected: true });
        }
      });
    },
  },
});

export { categoryDS };
