/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

export const getSupplierClassifyDS = ({
  isAllPlatform,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  forceValidate: true,
  paging: false,
  fields: [
    {
      name: 'categoryCode',
      required: true,
      type: 'object',
      textField: 'categoryCode',
      valueField: 'categoryCode',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      lovPara: {
        enabledFlag: 1,
        queryTenantId: partnerTenantId,
      },
      label: intl.get('sslm.enterpriseInform.model.supplierClassify.code').d('供应商类型分类'),
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => {
              const { hasChild } = record.data;
              return !+hasChild;
            },
          },
        },
      },
      transformRequest: value => value && value.categoryCode,
      transformResponse: (value, data) => {
        const { categoryCode, categoryDescription } = data;
        return value
          ? {
              categoryCode,
              categoryDescription,
            }
          : null;
      },
    },
    {
      name: 'categoryDescription',
      bind: 'categoryCode.categoryDescription',
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
    {
      name: 'objectFlag',
      ignore: 'always',
      label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('firmChangeCateId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      // 只读页面标红用readUrlProps这个接口
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { changeReqId } = dataSet.getState('dsState') || {};
      return !readOnlyFlag
        ? {
            url: `${SRM_SSLM}/v1/${organizationId}/firm-change-cates`,
            method: 'GET',
            data: {
              changeReqId,
              customizeUnitCode: code,
              customizeTenantId: partnerTenantId,
            },
          }
        : readUrlProps;
    },
    submit: ({ data }) => {
      const url = `${SRM_SSLM}/v1/${organizationId}/firm-change-cates`;
      return {
        url,
        method: 'POST',
        params: {
          customizeUnitCode: isAllPlatform ? null : code,
          customizeTenantId: isAllPlatform ? null : partnerTenantId,
        },
        data,
      };
    },
  },
});

// 分类新建按钮
export const getSupplierClassifyLov = ({ partnerTenantId } = {}) => ({
  forceValidate: true,
  paging: false,
  fields: [
    {
      name: 'categoryLov',
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      lovPara: {
        queryTenantId: partnerTenantId,
        enabledFlag: 1,
      },
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => {
              const { hasChild } = record.data;
              return !+hasChild;
            },
          },
        },
      },
    },
  ],
});
