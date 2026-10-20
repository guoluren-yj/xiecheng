/*
 * @Date: 2023-11-15 13:42:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getEvaluationIndicatorDs = ({ evalTplId }) => ({
  idField: 'evalTplIndId',
  parentField: 'parentId',
  childrenField: 'children',
  forceValidate: true,
  fields: [
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorCode').d('指标编码'),
      name: 'indicatorCode',
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorName').d('指标名称'),
      name: 'indicatorName',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'action',
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreType').d('评分方式'),
      name: 'scoreTypeMeaning',
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorType').d('指标类型'),
      name: 'indicatorTypeMeaning',
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.evalStandard').d('评分标准'),
      name: 'evalStandard',
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.respWeight').d('权重%'),
      name: 'evalWeight',
      type: 'number',
      min: 0,
      step: 0.01,
      numberGrouping: false,
      dynamicProps: {
        required: ({ dataSet }) => {
          const headerInfo = dataSet.getState('headerInfo');
          if (headerInfo) {
            return headerInfo.indCalMethod === 'WEIGHT';
          }
        },
      },
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreFrom').d('分值从'),
      name: 'scoreFrom',
      type: 'number',
      step: 0.01,
      precision: 2,
      numberGrouping: false,
      dynamicProps: {
        disabled: ({ record }) => ['TICK', 'VETO'].includes(record.get('indicatorType')),
        required: ({ record }) => !['TICK', 'VETO', 'OPT'].includes(record.get('indicatorType')),
      },
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreTo').d('分值至'),
      name: 'scoreTo',
      type: 'number',
      step: 0.01,
      precision: 2,
      numberGrouping: false,
      dynamicProps: {
        disabled: ({ record }) => ['TICK', 'VETO'].includes(record.get('indicatorType')),
        required: ({ record }) => !['TICK', 'VETO', 'OPT'].includes(record.get('indicatorType')),
      },
    },
    {
      label: intl.get('sslm.common.model.field.defaultScore').d('默认分值'),
      name: 'defaultScore',
      type: 'number',
      step: 0.01,
      precision: 2,
      numberGrouping: false,
      dynamicProps: {
        disabled: ({ record }) => record.get('indicatorType') !== 'SCORE',
      },
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indiScore').d('指标分值'),
      name: 'indicatorScore',
      type: 'number',
      step: 0.01,
      precision: 2,
      numberGrouping: false,
      dynamicProps: {
        disabled: ({ record }) => !['TICK'].includes(record.get('indicatorType')),
        required: ({ record }) => ['TICK'].includes(record.get('indicatorType')),
      },
    },
    {
      label: intl.get('sslm.common.model.field.defaultOption').d('默认选项'),
      name: 'isStandard',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record }) => !['TICK', 'VETO'].includes(record.get('indicatorType')),
      },
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.benchmarkScore').d('基准分值'),
      name: 'benchmarkScore',
      defaultValue: 0,
      type: 'number',
      numberGrouping: false,
      dynamicProps: {
        disabled: ({ record }) =>
          !(
            +record.get('parentId') === -1 &&
            record.get('scoreType') === 'MANUAL' &&
            record.get('indicatorType') === 'SCORE'
          ),
        required: ({ record }) =>
          record.get('scoreType') === 'MANUAL' &&
          record.get('indicatorType') === 'SCORE' &&
          +record.get('parentId') === -1,
      },
    },
    {
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.orderSeq').d('排序'),
      name: 'orderSeq',
      type: 'number',
      min: 0,
      step: 1,
      precision: 0,
      numberGrouping: false,
    },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'configuration',
      label: intl.get('sslm.common.view.configuration').d('配置'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/indicators/new/tree`,
        method: 'GET',
        data: {
          ...data,
          evalTplId,
          customizeCode: 'SSLM.TEMPLATE_DEFINE.EVALUATION_INDICATOR.SEARCH_BAR',
        },
      };
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${tenantId}/eval-templates/indicators/batch-delete`,
      method: 'DELETE',
    },
  },
  events: {
    update: ({ name, value, record }) => {
      switch (name) {
        case 'indicatorScore':
          if (record.get('indicatorType') === 'TICK' && record.get('isStandard')) {
            record.set('defaultScore', value);
          }
          break;
        case 'isStandard':
          if (record.get('indicatorType') === 'TICK') {
            if (value === 0) {
              record.set('defaultScore', 0);
            } else {
              record.set('defaultScore', record.get('indicatorScore'));
            }
          }
          break;
        default:
          break;
      }
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
