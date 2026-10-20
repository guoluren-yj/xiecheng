/*
 * @Date: 2022-12-08 15:12:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getSupplierClassifyDS = () => ({
  primaryKey: 'categoryAlterLineId',
  cacheSelection: true,
  forceValidate: true,
  pageSize: 20,
  record: {
    dynamicProps: {
      selectable: record => !record.get('isRequisitionAddFlag'),
    },
  },
  fields: [
    {
      name: 'add',
      type: 'object',
      multiple: true,
      noCache: true,
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      lovPara: {
        tenantId,
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
      name: 'supplierCategoryId',
      type: 'object',
      required: true,
      lovCode: 'SSLM.SUPPLIER_CATEGORY_TREE',
      label: intl
        .get('sslm.commonApplication.model.coApp.supplierCategoryCode')
        .d('供应商分类代码'),
      textField: 'categoryCode',
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag'),
          },
        },
      },
      transformRequest: value => value && value.supplierCategoryId,
      transformResponse: (value, object) =>
        value
          ? {
              supplierCategoryId: object.supplierCategoryId,
              categoryDescription: object.categoryDescription,
              categoryCode: object.categoryCode,
              evaluationLevelFlag: object.evaluationLevelFlag,
              evaluationScoreFlag: object.evaluationScoreFlag,
            }
          : null,
    },
    {
      name: 'categoryDescription',
      bind: 'supplierCategoryId.categoryDescription',
      label: intl.get('sslm.commonApplication.model.coApp.SupplierCategoryDes').d('供应商分类描述'),
    },
    {
      name: 'categoryCode',
      bind: 'supplierCategoryId.categoryCode',
    },
    {
      name: 'evaluationLevelFlag',
      bind: 'supplierCategoryId.evaluationLevelFlag',
    },
    {
      name: 'evaluationScoreFlag',
      bind: 'supplierCategoryId.evaluationScoreFlag',
    },
    {
      name: 'evaluationLevel',
      lookupCode: 'SSLM.EVALUATION_LEVEL',
      label: intl.get('sslm.commonApplication.model.coApp.level').d('评级'),
      dynamicProps: {
        required: ({ record }) => !!record.get('evaluationLevelFlag'),
      },
    },
    {
      name: 'evaluationScore',
      type: 'number',
      numberGrouping: false,
      label: intl.get('sslm.commonApplication.model.coApp.score').d('评分'),
      dynamicProps: {
        required: ({ record }) => !!record.get('evaluationScoreFlag'),
      },
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'alterReason',
      label: intl.get('sslm.commonApplication.model.coApp.alterReason').d('变更理由'),
    },
    {
      name: 'alterDate',
      type: 'dateTime',
      label: intl.get('sslm.commonApplication.model.coApp.alterDate').d('变更时间'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.commonApplication.model.coApp.alterUserName').d('变更人'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const queryParams = dataSet?.parent?.getQueryParameter('queryParmas') || {};
      const customizeUnitCode = dataSet.getQueryParameter('customizeUnitCode');
      const { requisitionId, ...others } = queryParams;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-ctg-alter-lines/${requisitionId}`,
        method: 'GET',
        data: { ...others, customizeUnitCode },
      };
    },
    destroy: ({ dataSet, data }) => {
      const queryParams = dataSet?.parent?.getQueryParameter('queryParmas') || {};
      const customizeUnitCode = dataSet.getQueryParameter('customizeUnitCode');
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-ctg-alter-lines/${queryParams.requisitionId}`,
        method: 'DELETE',
        data: data && data.map(n => n.categoryAlterLineId),
        params: { customizeUnitCode },
      };
    },
  },
});
