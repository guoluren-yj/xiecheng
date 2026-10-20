import { compose } from 'lodash';
import { observer } from 'mobx-react';

import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

const hocIndex = (comp) => {
  return compose(
    WithCustomizeC7N({
      unitCode: [
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.BASE_INFO`, // 基本信息
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.ORG_STAFF`, // 采购人员及组织
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.MEMBER`, // 寻源小组
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.SUPPLIER`, // 供应商行
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.QUOTATION_STAGE`, // 征询阶段
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.EXPERT.GROUP`, // 专家组
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.SCORE_INDICATES_TECH`, // 技术评分要素
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.SCORE_INDICATES_BUSI`, // 商务评分要素
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.SCORE_INDICATES`, // 评分要素
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.SCORE_INDICATES_ASSIGN`, // 分配专家
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.SCORE_TEMPLATE`, // 参考评分模版
        `SSRC.INQUIRY_HALL.RF_CONTROL_APPROVAL.ATTACHMENT_INFO`, // 商务｜技术 附件
      ],
    }),
    formatterCollections({
      code: [
        'ssrc.quoController',
        'ssrc.rfController',
        'ssrc.rfCheck',
        'ssrc.inquiryHall',
        'ssrc.bidChange',
        'ssrc.rfDetail',
        'ssrc.common',
        'ssrc.rf',
      ],
    }),
    remote(
      {
        code: 'SSRC_INQUIRY_CONTROLLER_RF_APPROVAL',
        name: 'remote',
      },
      {
        events: {},
      }
    )
  )(observer(comp));
};

export { hocIndex };
