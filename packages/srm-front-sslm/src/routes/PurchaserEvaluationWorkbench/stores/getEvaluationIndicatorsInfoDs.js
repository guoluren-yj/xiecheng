import intl from 'utils/intl';

export const getEvaluationIndicatorsInfoDs = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'completeFlag',
      label: intl
        .get('sslm.purchaserEvaluationDetail.scoreTable.label.completeFlag')
        .d('评估项目状态'),
    },
    {
      name: 'indicatorCode',
      label: intl
        .get('sslm.purchaserEvaluationDetail.scoreTable.label.evalGroupCode')
        .d('评估指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl
        .get('sslm.purchaserEvaluationDetail.scoreTable.label.indicatorName')
        .d('评估指标名称'),
    },
    {
      name: 'respWeight',
      label: intl
        .get('sslm.purchaserEvaluationDetail.scoreTable.label.scoringWeight')
        .d('评分权重%'),
    },
    {
      name: 'score',
      label: intl.get(`sslm.common.model.archiveFilled.score`).d('得分'),
    },
  ],
});
