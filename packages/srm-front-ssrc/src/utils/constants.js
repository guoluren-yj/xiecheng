/**
 * Constants 常量 ssrc
 * @date: 2020-2-7
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Tooltip } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

/* 报价方向悬浮解释 */
@formatterCollections({ code: ['ssrc.common'] })
export default class QuotationDirectLable extends React.Component {
  render() {
    return (
      <Tooltip
        title={intl
          .get('ssrc.common.view.message.auctionDirection')
          .d(
            '用于控制供应商的报价方向。荷兰式表示报价必须越来越低；英式表示报价必须越来越高；无要求表示对报价方向无控制。'
          )}
        placement="right"
      >
        {intl.get('ssrc.common.auctionDirection').d('报价方向')}
      </Tooltip>
    );
  }
}

// 价格库服务名

const SRM_SPC = '/spc';

// 中文正则表达式, 使用 test 方法 无需 /g
const ChineseReg = /[\u4e00-\u9fa5]/;

const NumberMin = '0';
const NumberMax = '99999999999999999999';
const NumberDecimalMin = '0.000001';

// 主要页面标识
const PageSourceSymbol = {
  inquiryHallUpdate: 'InquiryHallUpdate', // 询价维护
  rfxWholeUpdate: 'RfxWholeUpdate', // 线下整单维护
  offlineResultEntry: 'OfflineResultEntry', // 线下结果录入维护
  quotationController: 'QuotationController', // 寻源过程控制(NEW)维护
  projectSetupUpdate: 'ProjectSetupUpdate', // 寻源立项维护
  oldSupplierQuotation: 'OldSupplierQuotation', // 老报价
  oldCheckPriceUpdate: 'oldCheckPriceUpdate', // 老核价-edit
  newCheckPriceUpdate: 'newCheckPriceUpdate', // 新核价-edit
};

export { SRM_SPC, ChineseReg, NumberMax, NumberMin, NumberDecimalMin, PageSourceSymbol };
