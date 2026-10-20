/*
 * @Date: 2022-03-16 17:02:16
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useCallback } from 'react';
import { isArray, isEmpty } from 'lodash';
import { Menu } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import styles from './index.less';

// 整合state
export const useSetState = initialState => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    newState => {
      set(prevState => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

function getMenusList(list = []) {
  // 业务类单据
  const businessDoc = list.filter(n => n.parentValue === 'BU_DOC');
  // 主数据类单据
  const masterDoc = list.filter(n => n.parentValue === 'AD_DOC');
  // 其他单据（存放二开单据）
  const otherDoc = list.filter(n => !['BU_DOC', 'AD_DOC'].includes(n.parentValue));
  // 最终菜单集合
  const newMenuList = [
    {
      title: intl.get('sslm.workbench.view.menu.businessDoc').d('业务类单据'),
      value: businessDoc,
    },
    {
      title: intl.get('sslm.workbench.view.menu.masterDoc').d('主数据类单据'),
      value: masterDoc,
    },
    {
      title: intl.get('sslm.workbench.view.menu.otherDoc').d('其他单据'),
      value: otherDoc,
    },
  ].filter(n => !isEmpty(n.value));
  return newMenuList;
}

export function renderMenuItem(item) {
  return (
    <Menu.Item key={uuid()} value={item.value} router={item.tag} menuParams={item}>
      {item.meaning}
    </Menu.Item>
  );
}

export function renderSubMenu(menu) {
  const { children } = menu;
  return children && isArray(children) ? (
    <Menu.SubMenu key={uuid()} value={menu.value} title={menu.meaning}>
      {children.map(child => renderSubMenu(child))}
    </Menu.SubMenu>
  ) : (
    renderMenuItem(menu)
  );
}

export function renderItemGroup(menu) {
  return (
    <Menu.ItemGroup title={menu.title}>{menu.value.map(n => renderSubMenu(n))}</Menu.ItemGroup>
  );
}

/**
 * @param menus 菜单列表
 * @param isGroup 是否分类
 * @param onItemClick 点击菜单时的回调
 */
export function renderMenus({ menus = [], isGroup = false, onItemClick = () => {} }) {
  const newMenuList = isGroup ? getMenusList(menus) : menus;
  return (
    <Menu onClick={onItemClick} className={styles['custom-menu-wrap']}>
      {newMenuList.map(menu => (isGroup ? renderItemGroup(menu) : renderSubMenu(menu)))}
    </Menu>
  );
}

// 头按钮权限集合
export const btnsPermissions = [
  {
    name: 'operationGuide',
    code: 'srm.partner.my-partner.supplier-workbench.button.intro',
    meaning: '供应商管理工作台-操作指引',
  },
  {
    name: 'document',
    code: 'srm.partner.my-partner.supplier-workbench.ps.button.supplier.document',
    meaning: '供应商管理工作台-供应商文档',
  },
  {
    name: 'platform-import',
    code: 'srm.partner.my-partner.supplier-workbench.button.button.inport',
    meaning: '平台供应商-导入',
  },
  {
    name: 'import',
    code: 'srm.partner.my-partner.supplier-workbench.api.ps.external.supplier.button.import.old',
    meaning: '本地供应商-导入',
  },
  {
    name: 'batchUpdateSupplierData',
    code: 'srm.partner.my-partner.supplier-workbench.button.auto.push.erp',
    meaning: '本地供应商-批量更新单据供应商数据',
  },
  {
    name: 'invite',
    code: 'srm.partner.my-partner.supplier-workbench.ps.button.enterprise.invite',
    meaning: '供应商管理工作台-企业邀约',
  },
  {
    name: 'platform-import-new',
    code: 'srm.partner.my-partner.supplier-workbench.button.button.inport.new',
    meaning: '平台供应商-(新)导入',
  },
  {
    name: 'newLocalSupplierExport',
    code: 'srm.partner.my-partner.supplier-workbench.ps.external.supplier.button.export',
    meaning: '本地供应商-新导出',
  },
  {
    name: 'localSupplierExport',
    code: 'srm.partner.my-partner.supplier-workbench.ps.external.supplier.button.export.old',
    meaning: '本地供应商-导出',
  },
  {
    name: 'commonImport',
    code: 'srm.partner.my-partner.supplier-workbench.api.ps.external.supplier.button.import.new',
    meaning: '本地供应商-新导入',
  },
  {
    name: 'supplierExport',
    code: 'srm.partner.my-partner.supplier-workbench.ps.supplier.button.export.old',
    meaning: '平台供应商-供应商维度导出',
  },
  {
    name: 'supplierCategoryExport',
    code: 'srm.partner.my-partner.supplier-workbench.ps.supplier.category.button.export.old',
    meaning: '平台供应商-供应商+品类物料导出',
  },
  {
    name: 'newSupplierExport',
    code: 'srm.partner.my-partner.supplier-workbench.ps.supplier.button.export',
    meaning: '平台供应商-供应商维度-新导出',
  },
  {
    name: 'newSupplierCategoryExport',
    code: 'srm.partner.my-partner.supplier-workbench.ps.supplier.category.button.export',
    meaning: '平台供应商-供应商+品类物料-新导出',
  },
];
