/*
 * @Date: 2023-11-29 14:51:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getScoreResultDs = ({ isEdit } = {}) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'allowCheckFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.indicatorTemplate.model.scoreResult.modifiedScoreFlag')
        .d('允许修改分数'),
    },
    {
      name: 'modifyScoreRange',
      multiple: ',',
      lookupCode: 'SSLM.KPI_EVAL.SCORE_RANGE',
      label: intl
        .get('sslm.indicatorTemplate.model.scoreResult.modifiedScoreRange')
        .d('修改分数范围'),
      dynamicProps: {
        required: ({ record }) => isEdit && record.get('allowCheckFlag'),
      },
    },
    {
      name: 'evalSortMethod',
      lookupCode: 'SSLM.KPI_EVAL_SORT_METHOD',
      label: intl
        .get(`sslm.supplierKpiIndicator.model.issuedOrder.evalSortMethod`)
        .d('考评档案排名方式'),
      dynamicProps: {
        required: ({ record }) => isEdit && !['GYSKP_ORDER'].includes(record.get('evalTplType')),
      },
    },
    {
      name: 'autoPushVendorFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.indicatorTemplate.model.scoreResult.autoPublishToSupplier')
        .d('自动发布至供应商'),
    },
    {
      name: 'allowAppealFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.indicatorTemplate.model.scoreResult.allowAppeal').d('允许供应商申诉'),
    },
    {
      name: 'assignScoreLevel',
      label: intl.get(`sslm.evaluationTemplate.view.button.assignScoreLevel`).d('定义评分等级'),
    },
    {
      name: 'scoreReminder',
      label: intl.get('sslm.indicatorTemplate.model.scoreResult.scoreReminder').d('分数提醒设置'),
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'allowCheckFlag':
          record.set({ modifyScoreRange: null });
          break;
        default:
          break;
      }
    },
  },
});
