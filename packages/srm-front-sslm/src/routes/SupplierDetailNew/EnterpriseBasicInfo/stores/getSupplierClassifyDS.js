/*
 * @Date: 2023-08-17 10:37:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getSupplierClassifyDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sslm.commonApplication.model.coApp.supCategoryCode').d('供应商分类代码'),
      name: 'categoryCode',
    },
    {
      label: intl
        .get('sslm.commonApplication.model.coApp.supCategoryDescription')
        .d('供应商分类描述'),
      name: 'categoryDescription',
    },
    {
      label: intl.get('sslm.commonApplication.model.coApp.supEvaluationLevel').d('评级'),
      name: 'evaluationLevel',
    },
    {
      label: intl.get('sslm.commonApplication.model.coApp.supEvaluationScore').d('评分'),
      name: 'evaluationScore',
    },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const params = dataSet.getQueryParameter('params');
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-category-assign/queryAssign`,
        method: 'GET',
        data: params,
      };
    },
  },
});
