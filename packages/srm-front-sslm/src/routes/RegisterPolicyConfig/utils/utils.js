/*
 * @date: 2024/04/19 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';

import BasicPolicy from '../components/BasicPolicy';
import RestPolicy from '../components/RestPolicy';
import SupplierBasicConfig from '../components/SupplierBasicConfig';

export const getPanel = () => {
  const panelList = [
    {
      key: 'basicPolicy',
      component: BasicPolicy,
      tab: intl.get('sslm.registerPolicy.view.registerPolicy.relationInvestiga').d('关联调查表'),
    },
    {
      key: 'standardPolicy',
      component: SupplierBasicConfig,
      tab: intl.get('sslm.registerPolicy.view.registerPolicy.enterpriseInfo').d('企业信息页签'),
    },
    {
      key: 'invitePolicy',
      component: RestPolicy,
      tab: intl
        .get('sslm.registerPolicy.view.registerPolicy.inviteCooperaPolicy')
        .d('邀约合作策略'),
    },
    {
      key: 'otherInfo',
      component: RestPolicy,
      tab: intl.get('sslm.registerPolicy.view.registerPolicy.identityPolicy').d('身份验证策略'),
    },
  ];
  return panelList;
};

export const getFieldHelp = (configName = '') => {
  if (configName === 'otherInfo') {
    return intl
      .get('sslm.registerPolicy.view.registerPolicy.otherInfoDisplayTips')
      .d(
        '勾选该配置且在页面个性化的"企业认证"单元中配置了拓展字段，才会在企业认证过程中展示其他信息页签'
      );
  }
  return '';
};
