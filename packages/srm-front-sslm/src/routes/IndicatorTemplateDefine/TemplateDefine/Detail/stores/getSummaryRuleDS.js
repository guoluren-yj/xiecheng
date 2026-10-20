/*
 * @Date: 2023-11-29 14:47:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getSummaryRuleDs = ({ isEdit } = {}) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'indCalMethod',
      defaultValue: 'WEIGHT',
      lookupCode: 'SSLM.KPI_EVAL.COMPUTE_MODE',
      label: intl
        .get('sslm.indicatorTemplate.model.field.indicatorComputeMethod')
        .d('指标分数计算方式'),
      dynamicProps: {
        required: ({ record }) => isEdit && !['GYSKP_ORDER'].includes(record.get('evalTplType')),
      },
    },
    {
      name: 'autoCollectFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get('sslm.indicatorTemplate.model.field.automaticScoreSummary')
        .d('评分完成后是否自动汇总分数'),
    },
  ],
});
