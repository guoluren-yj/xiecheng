import React from 'react';
import { connect } from 'dva';

import formatterCollections from 'utils/intl/formatterCollections';

import { getAccessToken } from 'utils/utils';

import { dynamicWrapper } from '@/utils/router';
import HzeroWorkplace from './HzeroWorkplace';
import BillRenewal from '@//routes/SupplierWorkplace/BillRenewal';

export const cardsConfig = [
  // FIXME: 直接使用了 window.dvaApp 需要注意
  {
    code: 'SRM_CommonlyUsed',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_CommonlyUsed')
      );
    },
  },
  {
    code: 'SRM_CustomerManagement',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_CustomerManagement')
      );
    },
  },
  {
    code: 'SRM_Delivery',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('../Dashboard/SRM_Delivery'));
    },
  },
  {
    code: 'SRM_Financial',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_Financial')
      );
    },
  },
  {
    code: 'SRM_Goods',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('../Dashboard/SRM_Goods'));
    },
  },
  {
    code: 'SRM_Goods_New',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_Goods_New')
      );
    },
  },
  {
    code: 'SRM_Sup_Goods_New',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_Sup_Goods_New')
      );
    },
  },
  {
    code: 'SRM_LeadershipReport',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_LeadershipReport')
      );
    },
  },
  {
    code: 'SRM_PurchaseOrder',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_PurchaseOrder')
      );
    },
  },
  {
    code: 'SRM_PartInfo',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('../Dashboard/SRM_PartInfo'));
    },
  },
  {
    code: 'SRM_PurchaserQualityBusiness',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_PurchaserQualityBusiness')
      );
    },
  },
  {
    code: 'SRM_PurClaimManage',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_PurClaimManage')
      );
    },
  },
  {
    code: 'SRM_PurchasingReport',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_PurchasingReport')
      );
    },
  },
  {
    code: 'SRM_TotalPurchaseReport',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_TotalPurchaseReport')
      );
    },
  },
  {
    code: 'SRM_SalesOrder',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SalesOrder')
      );
    },
  },
  {
    code: 'SRM_SupplierFinancial',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SupplierFinancial')
      );
    },
  },
  {
    code: 'SRM_SupplierManagement',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SupplierManagement')
      );
    },
  },
  {
    code: 'SRM_SupplierQualityBusiness',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SupplierQualityBusiness')
      );
    },
  },
  {
    code: 'SRM_SupplierTodoWorkflow',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SupplierTodoWorkflow')
      );
    },
  },
  {
    code: 'SRM_SupplyReport',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SupplyReport')
      );
    },
  },
  {
    code: 'SRM_TodoWorkflow',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_TodoWorkflow')
      );
    },
  },
  {
    code: 'SRM_Message',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('../Dashboard/SRM_Message'));
    },
  },
  {
    code: 'SRM_RiskMonitoring',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_RiskMonitoring')
      );
    },
  },
  {
    code: 'SCUX_SUPPLIER_MANAGE',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_SUPPLIER_MANAGE')
      );
    },
  },
  {
    code: 'SRM_PurchaseRequisit',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_PurchaseRequisit')
      );
    },
  },
  {
    code: 'SRM_Contract',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('../Dashboard/SRM_Contract'));
    },
  },
  {
    code: 'SBUX_SPCM_TITLE',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_STARBUCK_CONTRACT_CARD')
      );
    },
  },
  {
    code: 'SRM_SingContract',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SingContract')
      );
    },
  },
  {
    code: 'SRM_PurchaseRequisitionPool',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('./SRM_PurchaseRequisitionPool')
      );
    },
  },
  {
    code: 'SRM_SupplierReport',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('./SRM_SupplierReport'));
    },
  },
  {
    code: 'WATSONS_Message',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/WATSONS_Message')
      );
    },
  },
  {
    code: 'SRM_TotalRetailReceipts',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('./SRM_TotalRetailReceipts'));
    },
  },
  {
    code: 'SRM_MyApproval',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('./SRM_MyApproval'));
    },
  },
  {
    code: 'SRM_Watson_File',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () => import('./SRM_Watson_File'));
    },
  },
  {
    code: 'SRM_Settlement',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_Settlement')
      );
    },
  },
  {
    code: 'SRM_SupplierSettlement',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_SupplierSettlement')
      );
    },
  },
  {
    code: 'SCUX_PCI_ASN_CHECK_COUNT',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_PCI_ASN_CHECK_COUNT')
      );
    },
  },
  {
    code: 'SCUX_PCI_ASN_SIGN_COUNT',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_PCI_ASN_SIGN_COUNT')
      );
    },
  },
  {
    code: 'WBJT_GROUP_CARD',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/WBJT_GROUP_CARD')
      );
    },
  },
  {
    code: 'SCUX_WATSON_ZG_SUP_TODO_CARD',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_WATSON_ZG_SUP_TODO_CARD')
      );
    },
  },
  {
    code: 'SCUX_WATSON_ZG_PUR_TODO_CARD',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_WATSON_ZG_PUR_TODO_CARD')
      );
    },
  },
  {
    code: 'SCUX_Schedule',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_Schedule')
      );
    },
  },
  {
    code: 'SCUX_STARBUCKS_SRM_PurchaseRequisiton',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_STARBUCK_PUR_COUNT')
      );
    },
  },
  {
    code: 'SCUX_STARBUCKS_SRM_Settlement',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_STARBUCKS_SRM_Settlement')
      );
    },
  },
  {
    code: 'SCUX_SUPPLIER_MANAGE',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_SUPPLIER_MANAGE')
      );
    },
  },
  {
    code: 'SCUX_TOPSTAR_NOTICE',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SCUX_TOPSTAR_NOTICE')
      );
    },
  },
  {
    code: 'AMBN_RiskMonitor', // AMBN风险监控
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/AMBN_RiskMonitor')
      );
    },
  },
  {
    code: 'CompanyNotice', // AMBN风险监控
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['srmCards'], () =>
        import('../Dashboard/SRM_CompanyNotice')
      );
    },
  },
];

// 多语言code最后一项拼接&h-menu-id=-1, 用于标识非菜单页面在查询多语言时header中不可传h-menu-id
@formatterCollections({ code: ['hpfm.card', 'spfm.dashboard'] })
@connect(({ global }) => ({
  activeTabKey: global.activeTabKey,
  menuHidden: global.menuHidden,
}))
export default class WorkPlace extends React.Component {
  componentWillReceiveProps(nextProps) {
    // 返回工作台时 刷新工作台
    // 增加判断token是为了判断是否是退出登录
    if (
      nextProps.activeTabKey !== this.props.activeTabKey &&
      nextProps.activeTabKey === '/workplace' &&
      this.workPlaceRef &&
      getAccessToken()
    ) {
      this.workPlaceRef.initLayout();
    }
  }

  render() {
    const { menuHidden } = this.props;
    if (menuHidden) {
      return <BillRenewal {...this.props} />;
    }
    return (
      <HzeroWorkplace
        onRef={ref => {
          this.workPlaceRef = ref;
        }}
        cardsConfig={cardsConfig}
      />
    );
  }
}
