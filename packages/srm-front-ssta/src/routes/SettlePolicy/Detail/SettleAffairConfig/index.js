/*
 * @Description: 结算策略详情-结算事务配置
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, memo } from 'react';
import intl from 'utils/intl';

import ErrorsAlert from '../components/ErrorsAlert';
import SelectBoxCard from '../components/SelectBoxCard';

/**
 * @description: 结算事务配置
 * @param {*}
 * @return {ReactNode}
 */
const SettleAffairConfig = () => {
  return (
    <Fragment>
      <div className="strategy-panel-wrapper">
        <ErrorsAlert />
        <SelectBoxCard
          name="settleBasePrice"
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.affairConnectPoolEffective')
            .d('结算事务接入结算池时生效')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.accessEffective').d('接入生效')}
          help={intl
            .get('ssta.settleStrategy.view.help.settleBasePrice')
            .d('该配置影响单价金额字段计算、金额调整等场景时的基准价取值')}
        />
        <SelectBoxCard
          name="settleMode"
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.affairConnectPoolEffective')
            .d('结算事务接入结算池时生效')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.accessEffective').d('接入生效')}
          help={intl
            .get('ssta.settleStrategy.view.help.settleMode')
            .d(
              '控制结算事务的结算流程，系统体现在【结算池】功能中可对账/开票是否出现该数据，开票后才可进行付款，付款流程通过付款申请配置中「启用付款」启用'
            )}
        />
        <SelectBoxCard
          name="settleMatchDimension"
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.affairConnectPoolEffective')
            .d('结算事务接入结算池时生效')}
          effectiveText={intl.get('ssta.settleStrategy.view.message.accessEffective').d('接入生效')}
          help={intl
            .get('ssta.settleStrategy.view.help.settleMatchDimension')
            .d(
              '配置时，注意与上游事务配置维度一致。费用单匹配维度为「金额」，物流需与「执行标的」配置一致'
            )}
        />
      </div>
    </Fragment>
  );
};

export default memo(SettleAffairConfig);
