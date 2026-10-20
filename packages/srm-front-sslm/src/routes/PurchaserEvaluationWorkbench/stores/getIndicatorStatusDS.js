/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-15 11:32:26
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/stores/getIndicatorStatusDS.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { bucketDirectory } from '@/routes/utils/utils';

export const getIndicatorStatusDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'loginName',
      label: intl.get('sslm.common.modal.grade.raterAccount').d('评分人账户'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.common.modal.grade.realName').d('评分人'),
    },
    {
      name: 'indicatorName',
      label: intl.get('sslm.common.modal.grade.description').d('评分描述'),
    },
    {
      name: 'respWeight',
      label: intl.get('sslm.common.modal.grade.respWeight').d('评分人权重%'),
    },
    {
      name: 'defaultScore',
      label: intl.get('sslm.common.modal.grade.defaultScore').d('缺省分值'),
    },
    {
      name: 'isStandard',
      label: intl.get('sslm.common.modal.grade.isStandard').d('符合评分标准'),
    },
    {
      name: 'isVeto',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.isVeto').d('否决该项'),
    },
    {
      name: 'indOptName',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.indOptName').d('评分选项'),
    },
    {
      name: 'score',
      label: intl.get('sslm.common.modal.grade.score').d('得分'),
    },
    {
      name: 'scoreAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.evaluation,
      label: intl.get('sslm.common.modal.grade.uuid').d('评分人附件'),
    },
    {
      name: 'completeFlag',
      label: intl.get('sslm.common.modal.grade.completeStatus').d('评分完成状态'),
    },
    {
      name: 'siteLocation',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.siteLocation')
        .d('现场定位'),
    },
  ],
});
