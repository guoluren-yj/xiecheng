import { createElement } from 'react';
import dynamic from 'dva/dynamic';
// 引入 存储 数据权限维度配置的方法
import { setDimension } from './dimensions';
// 引入  加在 model 的包装方法
// import { dynamicWrapper } from '../utils/router';
// 设置 编码为 DEMO 的 数据权限维度
const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// 引入  加在 model 的包装方法
// wrapper of dynamic
export const dynamicWrapper = (app, models, component) => {
  return dynamic({
    app,
    models: () =>
      models
        .filter((model) => modelNotExisted(app, model))
        .map((m) => import(`../models/${m}.js`)) || [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

// 公司
setDimension({
  code: 'COMPANY',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityCompanySrm'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Company')
    );
  },
});

// 客户
setDimension({
  code: 'CUSTOMER',
  // component: async () => {
  //   return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityCustomerNew'], () =>
  //     import('../routes/SubAccount/Org/AuthorityManagement/Detail/Customer')
  //   );
  // },
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityCustomerUnitSrm'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/CustomerUnit')
    );
  },
});

// 员工
setDimension({
  code: 'EMPLOYEE',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityEmployee'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Employee')
    );
  },
});

// 组织架构-公司
setDimension({
  code: 'GROUP',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityGroup'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Group')
    );
  },
});

// 岗位
setDimension({
  code: 'POSITION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityPosition'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Position')
    );
  },
});

// 采购品类
setDimension({
  code: 'PURCHASE_CATEGORY',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityPurcatSrm'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Purcat')
    );
  },
});

// 采购物料
setDimension({
  code: 'PURCHASE_ITEM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityPurchaseItem'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Puritem')
    );
  },
});

// 销售产品
setDimension({
  code: 'SUPPLIER_ITEM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authoritySalitem'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Salitem')
    );
  },
});

// 供应商
setDimension({
  code: 'SUPPLIER',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authoritySupplierSrm'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Supplier')
    );
  },
});

// 部门
setDimension({
  code: 'UNIT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityUnit'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Unit')
    );
  },
});

// 供应商分类
setDimension({
  code: 'SUPPLIER_CATEGORY',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authoritySupplierType'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/SupplierType')
    );
  },
});

// 客户物料品类
setDimension({
  code: 'CUSTOMER_ITEM_CATEGORY',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['authorityManagement/authorityCustomerItemCategory'],
      () => import('../routes/SubAccount/Org/AuthorityManagement/Detail/CustomerItemCategory')
    );
  },
});

// 库房
setDimension({
  code: 'INVENTORY',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityInventory'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Inventory')
    );
  },
});

// 采购组织
setDimension({
  code: 'PURORG',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityPurorg'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Purorg')
    );
  },
});

// 采购员
setDimension({
  code: 'PURAGENT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityPuragent'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/Puragent')
    );
  },
});

// 采购申请类型
setDimension({
  code: 'PRTYPE',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityPrType'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/purchaseRequisitionType')
    );
  },
});

// 采购订单类型
setDimension({
  code: 'POTYPE',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityPoType'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/PurchaseOrderType')
    );
  },
});

// 创建人部门
setDimension({
  code: 'CREATED_UNIT_ID',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityUnitCreate'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/CreateUnit')
    );
  },
});

// 质量整改创建
setDimension({
  code: 'PROBLEM_TYPE',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['authorityManagement/authorityQualityRectification'],
      () => import('../routes/SubAccount/Org/AuthorityManagement/Detail/QualityRectification')
    );
  },
});

// 创建人所属部门
setDimension({
  code: 'CREATED_MAIN_UNIT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['authorityManagement/authorityMainUnit'], () =>
      import('../routes/SubAccount/Org/AuthorityManagement/Detail/CreateMainUnit')
    );
  },
});
