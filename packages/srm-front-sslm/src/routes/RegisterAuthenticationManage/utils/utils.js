/*
 * utils - 工具方法
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';

import AccountManage from '../components/AccountManage';
import EnterpriseManage from '../components/EnterpriseManage';
import RegisterStrategy from '../components/RegisterStrategy';

// 页签
export const getPanelList = () => [
  {
    key: 'account',
    tab: intl.get('sslm.registerAuthManage.view.title.account').d('账号管理'),
    searchCode: 'SSLM.REGISTER_AUTH_MANAGE.ACCOUNT.FILTER',
    customizeUnitCode: 'SSLM.REGISTER_AUTH_MANAGE.ACCOUNT.LIST',
    component: AccountManage,
  },
  {
    key: 'enterprise',
    tab: intl.get('sslm.registerAuthManage.view.title.enterprise').d('企业管理'),
    searchCode: 'SSLM.REGISTER_AUTH_MANAGE.ENTERPRISE.FILTER',
    customizeUnitCode: 'SSLM.REGISTER_AUTH_MANAGE.ENTERPRISE.LIST',
    component: EnterpriseManage,
  },
  {
    key: 'registerStrategy',
    tab: intl.get('sslm.registerAuthManage.view.title.registerStrategy').d('注册策略'),
    searchCode: 'SSLM.REGISTER_AUTH_MANAGE.REGISTER_STRATEGY.FILTER',
    customizeUnitCode: 'SSLM.REGISTER_AUTH_MANAGE.REGISTER_STRATEGY.LIST',
    component: RegisterStrategy,
  },
];
