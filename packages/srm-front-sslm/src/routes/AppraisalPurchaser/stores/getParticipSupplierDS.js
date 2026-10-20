/*
 * @Date: 2023-11-06 17:11:02
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getParticipSupplierDs = ({ evalHeaderId, evalGranularity }) => ({
  primaryKey: 'supplierId',
  pageSize: 20,
  forceValidate: true,
  fields: [
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.venderCode').d('供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.venderName').d('供应商名称'),
      name: 'supplierName',
    },
    {
      name: 'itemOrCategoryVOS',
      multiple: true,
      type: 'object',
      label:
        evalGranularity === 'SU+CA'
          ? intl.get(`spfm.supplierKpiIndicator.view.button.category`).d('参评品类')
          : intl.get(`spfm.supplierKpiIndicator.view.button.item`).d('参评物料'),
      lovCode:
        evalGranularity === 'SU+CA' ? 'SSLM_KPI_EVAL_HEADER_CATEGORY' : 'SSLM_KPI_EVAL_HEADER_ITEM',
      required: ['SU+CA', 'SU+IT'].includes(evalGranularity),
      optionsProps:
        evalGranularity === 'SU+CA'
          ? {
              paging: false,
              idField: 'categoryId',
              parentField: 'parentCategoryId',
              record: {
                dynamicProps: {
                  selectable: record => record.get('isCheck') !== false,
                },
              },
            }
          : {},
      dynamicProps: {
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          evelheaderId: evalHeaderId,
          supplierCompanyId: record.get('supplierId'),
          businessObjectCode: 'SRM_C_SRM_SSLM_KPI_EVAL',
        }),
      },
      transformResponse: (_, data) =>
        !isEmpty(data.itemOrCategoryList) ? data.itemOrCategoryList : null,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...rest } = data;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/${evalHeaderId}`,
        method: 'GET',
        data: { ...queryParams, ...rest },
      };
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-line/eval-manage/delete/${evalHeaderId}`,
      method: 'DELETE',
    },
  },
});

// 参评供应商-批量编辑ds
export const getBatchEditDs = () => ({
  autoCreate: true,
  fields: [
    // 新增供应商
    {
      name: 'addSupplier',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
      multiple: true,
    },
    // 新增品类
    {
      name: 'addCategory',
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      lovPara: {
        tenantId,
        enabledFlag: 1,
        businessObjectCode: 'SRM_C_SRM_SSLM_KPI_EVAL',
      },
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
    },
    // 新增物料
    {
      name: 'addItem',
      type: 'object',
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovCode: 'SMDM.CUSTOMER_ITEM',
      lovPara: {
        tenantId,
        enabledFlag: 1,
      },
    },
  ],
});
