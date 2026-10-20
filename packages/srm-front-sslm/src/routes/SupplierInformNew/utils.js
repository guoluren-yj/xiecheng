/*
 * @Date: 2023-04-17 11:12:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

import Basic from './Detail/Basic';
import CompareBasic from './Compare/Basic';
import Investiga from './Detail/Investiga';
import SupplierBasic from './Detail/SupplierBasic';
import CompareSupplierBasic from './Compare/SupplierBasic';
import CompareInvestiga from './Compare/Investiga';

// 列表页单据类型
export const documentList = () => [
  {
    key: 'waitSubmit',
    countKey: 'toSubmitCount',
    tab: intl.get('sslm.common.view.message.waitSubmit').d('待提交'),
    searchCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.WAIT_SUBMIT_SEARCH_BAR',
    customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.WAIT_SUBMIT_LIST',
  },
  {
    key: 'approval',
    countKey: 'approveCount',
    tab: intl.get('sslm.common.view.message.approval').d('审批中'),
    searchCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.APPROVAL_SEARCH_BAR',
    customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.APPROVAL_LIST',
  },
  {
    key: 'all',
    countKey: 'totalCount',
    tab: intl.get('sslm.common.view.message.all').d('全部'),
    searchCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.ALL_SEARCH_BAR',
    customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.ALL_LIST',
  },
];

// 明细头标题
export const getHeaderTitle = status => {
  switch (status) {
    case 'create':
      return intl.get('sslm.common.view.message.createApplication').d('新建申请单');
    case 'read':
      return intl.get('sslm.common.view.message.search').d('查看申请单');
    default:
      return intl.get('sslm.common.view.message.editApplication').d('编辑申请单');
  }
};

// 明细步骤条与组件集合
export const getComponentList = ({ investigateTemplateId }) => {
  return [
    {
      key: 'basic',
      stepTitle: intl.get('sslm.supplierInform.view.title.baseInfo').d('申请单基础信息'),
      component: Basic,
      compareComponent: CompareBasic,
    },
    {
      key: 'supplierBasic',
      stepTitle: intl
        .get('sslm.supplierInform.view.title.supplierBaseInfo')
        .d('变更供应商基础信息'),
      component: SupplierBasic,
      compareComponent: CompareSupplierBasic,
    },
    investigateTemplateId && {
      key: 'investigation',
      stepTitle: intl.get('sslm.supplierInform.view.title.investigationInfo').d('变更调查表信息'),
      component: Investiga,
      compareComponent: CompareInvestiga,
    },
  ].filter(Boolean);
};

// 列表页按钮个性化
export const headerBtnCode = {
  waitSubmit: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.WAIT_SUBMIT_BTN',
  approval: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.APPROVAL_BTN',
  all: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_LIST.ALL_BTN',
};
