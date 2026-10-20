/*
 * @Date: 2023-05-08 19:42:54
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import React from 'react';

const style = { margin: 0, padding: 0, whiteSpace: 'nowrap' };

// 经营性质集合
export const serviceTypeList = () => ({
  manufacturer: intl.get('sslm.common.model.business.manufacturer').d('制造商'),
  trader: intl.get('sslm.common.model.business.trader').d('贸易商'),
  servicer: intl.get('sslm.common.model.business.servicer').d('服务商'),
  agent: intl.get('sslm.common.model.business.agent').d('代理商'),
  integration: intl.get('sslm.common.model.business.integration').d('集成商'),
  contractor: intl.get('sslm.common.model.business.contractor').d('承包商'),
  dealer: intl.get('sslm.common.model.business.dealer').d('经销商'),
});

// 供货能力清单tooltip提示信息
export const abilityTooltip = () => ({
  supplyStatusTip: (
    <React.Fragment>
      <p style={style}>
        {intl.get('sslm.supplyAbility.model.supAbility.supplyStatus').d('可供状态')}-G：
        {intl.get('sslm.supplyAbility.view.message.supplyStatusG').d('Green, 表示供货能力强')};
      </p>
      <p style={style}>
        {intl.get('sslm.supplyAbility.model.supAbility.supplyStatus').d('可供状态')}-Y：
        {intl.get('sslm.supplyAbility.view.message.supplyStatusY').d('Yellow, 表示供货能力有风险')};
      </p>
      <p style={style}>
        {intl.get('sslm.supplyAbility.model.supAbility.supplyStatus').d('可供状态')}-R：
        {intl.get('sslm.supplyAbility.view.message.supplyStatusR').d('Red, 表示供货能力严重不足')};
      </p>
    </React.Fragment>
  ),
  psaTip: intl
    .get(`sslm.supplyAbility.view.message.psaShortTip`)
    .d(
      'PSA即Probabilistic Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。'
    ),
  psaScoreTip: intl
    .get(`sslm.supplyAbility.view.message.psaScoreTip`)
    .d(
      'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评分即将概率风险指标量化，进行打分。'
    ),
  psaFinishDate: intl
    .get(`sslm.supplyAbility.view.message.psaFinishDate`)
    .d('风险量化评价的完成时间。'),
  spaTip: intl
    .get(`sslm.supplyAbility.view.message.spaTip`)
    .d(
      'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评级即将安全指标量化，划分等级。'
    ),
  spaScore: intl
    .get(`sslm.supplyAbility.view.message.spaScore`)
    .d(
      'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评分即将安全指标量化，进行打分。'
    ),
  spaFinishDate: intl
    .get(`sslm.supplyAbility.view.message.spaFinishDate`)
    .d('安全综合评价的完成时间。'),
});
