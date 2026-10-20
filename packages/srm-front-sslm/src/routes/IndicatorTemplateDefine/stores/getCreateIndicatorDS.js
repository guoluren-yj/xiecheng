/*
 * getCreateIndicatorDS - 手工新建指标DS
 * @Date: 2023-10-08 11:50:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getCreateIndicatorDs = ({ isEdit } = {}) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'parentIndicatorId',
      defaultValue: -1,
    },
    {
      name: 'parentIndicatorName',
      disabled: true,
      label: intl.get('sslm.supplierKpiIndicator.model.sendOrder.parentIndicator').d('父级指标'),
      defaultValue: intl
        .get('spfm.supplierKpiIndicator.model.suKpiIn.parentIndicatorRoot')
        .d('根节点'),
    },
    {
      name: 'indicatorCode',
      required: isEdit,
      maxLength: 30,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorCode').d('指标编码'),
      pattern: /^[0-9A-Za-z-_]*$/,
      dynamicProps: {
        disabled: ({ record }) => record.get('indicatorId'),
      },
    },
    {
      name: 'indicatorName',
      required: isEdit,
      maxLength: 600,
      type: 'intl',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorName').d('指标名称'),
    },
    {
      name: 'scoreType',
      required: isEdit,
      lookupCode: 'SPFM.KPI_SCORE_TYPE',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreType').d('评分方式'),
    },
    {
      name: 'indicatorType',
      lookupCode: 'SSLM.KPI_INDICATOR_TYPE',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorType').d('指标类型'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('scoreType') === 'MANUAL',
        disabled: ({ record }) => record.get('scoreType') !== 'MANUAL',
      },
    },
    {
      name: 'evalStandard',
      label: intl.get(`sslm.supplierKpiIndicator.model.sendOrder.evalStandard`).d('评分标准'),
    },
    {
      name: 'scoreFrom',
      precision: 2,
      step: 0.01,
      type: 'number',
      numberGrouping: false,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreFrom').d('分值从'),
      dynamicProps: {
        required: ({ record }) => {
          const { indicatorType, scoreType } = record.get(['indicatorType', 'scoreType']);
          return isEdit && (indicatorType === 'SCORE' || scoreType === 'SYSTEM');
        },
        disabled: ({ record }) => {
          const { indicatorType } = record.get(['indicatorType']);
          return ['TICK', 'VETO'].includes(indicatorType);
        },
      },
    },
    {
      name: 'scoreTo',
      precision: 2,
      step: 0.01,
      type: 'number',
      numberGrouping: false,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreTo').d('分值至'),
      dynamicProps: {
        required: ({ record }) => {
          const { indicatorType, scoreType } = record.get(['indicatorType', 'scoreType']);
          return isEdit && (indicatorType === 'SCORE' || scoreType === 'SYSTEM');
        },
        disabled: ({ record }) => {
          const { indicatorType } = record.get(['indicatorType']);
          return ['TICK', 'VETO'].includes(indicatorType);
        },
      },
    },
    {
      name: 'defaultScore',
      precision: 2,
      step: 0.01,
      type: 'number',
      numberGrouping: false,
      label: intl.get('sslm.common.model.field.defaultScore').d('默认分值'),
    },
    {
      name: 'indicatorScore',
      precision: 2,
      step: 0.01,
      type: 'number',
      numberGrouping: false,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.indiScore').d('指标分值'),
      dynamicProps: {
        required: ({ record }) => {
          const { indicatorType, scoreType } = record.get(['indicatorType', 'scoreType']);
          return isEdit && (scoreType === 'MANUAL' && indicatorType === 'TICK');
        },
        disabled: ({ record }) => {
          const { indicatorType, scoreType } = record.get(['indicatorType', 'scoreType']);
          return !(scoreType === 'MANUAL' && indicatorType === 'TICK');
        },
      },
    },
    {
      name: 'isStandard',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.common.model.field.defaultOption').d('默认选项'),
    },
    {
      name: 'benchmarkScore',
      type: 'number',
      defaultValue: 0,
      numberGrouping: false,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.benchmarkScore').d('基准分值'),
      dynamicProps: {
        required: ({ record }) => {
          const { indicatorType, parentIndicatorId } = record.get([
            'indicatorType',
            'parentIndicatorId',
          ]);
          return isEdit && indicatorType === 'SCORE' && [-1, null].includes(parentIndicatorId);
        },
        disabled: ({ record }) => {
          const { indicatorType } = record.get(['indicatorType']);
          return indicatorType !== 'SCORE';
        },
      },
    },
    {
      name: 'orderSeq',
      type: 'number',
      min: 0,
      step: 1,
      precision: 1,
      defaultValue: 1,
      numberGrouping: false,
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.orderSeq').d('排序'),
    },
  ],
  events: {
    update: ({ value, record, name }) => {
      switch (name) {
        case 'scoreType':
          record.set({
            indicatorType: null,
            indicatorScore: null,
          });
          break;
        case 'indicatorType':
          if (value !== 'SCORE') {
            record.set({
              benchmarkScore: 0,
            });
          }
          if (value === 'TICK') {
            record.set({
              scoreFrom: null,
              scoreTo: null,
              defaultScore: null,
            });
          } else if (value === 'VETO') {
            record.set({
              scoreFrom: null,
              scoreTo: null,
              defaultScore: null,
              indicatorScore: null,
            });
          } else {
            record.set({
              indicatorScore: null,
            });
          }
          if (value !== 'TICK') {
            record.set({ isStandard: null });
          }
          break;
        case 'indicatorScore':
          {
            const { indicatorType, isStandard } = record.get(['indicatorType', 'isStandard']);
            if (indicatorType === 'TICK' && isStandard) {
              record.set({ defaultScore: value });
            }
          }
          break;
        case 'isStandard':
          {
            const { indicatorType, indicatorScore } = record.get([
              'indicatorType',
              'indicatorScore',
            ]);
            if (indicatorType === 'TICK') {
              if (value === 0) {
                record.set({ defaultScore: 0 });
              } else {
                record.set({ defaultScore: indicatorScore });
              }
            }
          }
          break;
        default:
          break;
      }
    },
  },
});
