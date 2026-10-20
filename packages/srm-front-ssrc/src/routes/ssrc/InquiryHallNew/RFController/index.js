/*
 * @Descripttion: 寻源过程控制--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 15:13:33
 * @LastEditors: yiping.liu
 */
import React from 'react';
import { compose } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import Page from './Page';
import { StoreProvider } from './store';

const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

const hocIndex = (comp) => {
  return compose(
    WithCustomizeC7N({
      unitCode: [
        'SSRC.INQUIRY_HALL.RF_CONTROL.BASE_INFO', // 基本信息
        'SSRC.INQUIRY_HALL.RF_CONTROL.ORG_STAFF', // 采购人员及组织
        'SSRC.INQUIRY_HALL.RF_CONTROL.MEMBER', // 寻源小组
        'SSRC.INQUIRY_HALL.RF_CONTROL.SUPPLIER', // 供应商行
        'SSRC.INQUIRY_HALL.RF_CONTROL.QUOTATION_STAGE', // 征询阶段
        'SSRC.INQUIRY_HALL.RF_CONTROL.EXPERT.GROUP', // 专家组
        'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_TECH', // 技术评分要素
        'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_BUSI', // 商务评分要素
        'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES', // 评分要素
        'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_ASSIGN', // 分配专家
        'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_TEMPLATE', // 参考评分模版
        'SSRC.INQUIRY_HALL.RF_CONTROL.ATTACHMENT_INFO', // 商务｜技术 附件
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
        code: 'SSRC_INQUIRY_CONTROLLER_RF',
        name: 'remote',
      },
      {
        events: {
          // 批量添加供应商确定前置置埋点
          async remoteHandleOkSupplier() {
            return true;
          },
        },
      }
    )
  )(comp);
};

const Update = hocIndex(Index);

export default Update;

export { hocIndex, Index };
