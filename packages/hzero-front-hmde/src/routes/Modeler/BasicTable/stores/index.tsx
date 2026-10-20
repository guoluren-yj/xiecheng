/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { createContext, useRef } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

const Store = createContext({});

export default Store;

interface IApiDetail {
  apiId?: number | string;
  apiCode: number | string;
  apiPath: string;
  apiMethod: string;
}

interface IStoreData {
  pageType: string;
  level: string;
  _tenantId: string;
  viewType: string;
  tableId: number | string | null;
  tableName: string | null;
  tableType: string | null;
  modelDataObj: model.LogicModelTreeVO; // 当前应用信息
  isLeftShowMenu: boolean;
  refDataSourceType: string; // 当前基础表所属数据库类型 MySQL Oracle
  activeTabKey: string; // 切换表字段/索引 table
  refreshNum: number; // 控制是否立即刷新的数字 数字改变 则监听刷新 祛除了true/false只能刷新一次的弊端
  showNoServiceEmpty: boolean; // 无服务空tab页
  selectedTableKey: string;
  apiId?: string | number;
  apiCode?: string | number;
  apiPath: string;
  apiMethod: string;
  apiMenuList: model.baseStructure.ApiInfoTreeVO[]; // 模型API菜单数组
  // apiDetail: IApiDetail; // api详情
  // apiParam?: string | number; // 查询条件：过滤接口路径名参数
  hasApiTable: boolean;
  tenantId: number | string; // 租户编码
  tenantName: string; //  租户名称
  tenantMenuList: any[]; // 新增接口数据fixme
  labelCodeList: string; // 标签页编码list csv格式
  createTableFlag: number; // 是否有创建权限
  editTableFlag: number; // 是否有编辑权限
  editApiFlag: number; // 编辑API权限
  createApiFlag: number; // 创建API权限
  _currentDs: any;
}
interface ITableDetailAll {
  tableId: number | string | null;
  tableName: string | null;
  tableType: string | null;
}

// store接口
export interface IBaseTableList {
  globalLoading: boolean;
  tabVal: string; // Radio值 infrastructureManagement|infrastructureAuthorization
  storeData: IStoreData;
  setDataStore: (key: string, data: any, notStoreData?: boolean) => void; // 是any
  getDataStore: (key: string) => any; // 是any
  setModelDataObjItem: (val: model.LogicModelTreeVO) => void;
  setTableDetailAll: (item: ITableDetailAll) => void;
  apiMenuData: model.baseStructure.ApiInfoTreeVO[];
  setApiDetailAll: (item: IApiDetail) => void;
  resetApiDetail: () => void;
  resetTableDetail: () => void;
  resetAuthorization: () => void;
  hasApiTable: boolean;
  ref?: any; // fixme
  store?: any;
  currentDs?: any;
  setCurrentDs?: any;
}

// 存储状态数据函数
const state = ({ ref }) => ({
  globalLoading: false,
  tabVal: 'infrastructureManagement', // Radio值 infrastructureManagement|infrastructureAuthorization
  storeData: {
    level: 'platform', // 层级 平台层|租户层 platform|tenant
    _tenantId: '', // 左侧切到租户层后选择的租户ID
    viewType: 'labelView', // 视图分类 labelView|serviceView 标签视图|服务视图
    pageType: 'baseTable', // 表结构API结构 baseTable|api表

    tableId: '',
    tableName: '',
    tableType: '',
    modelDataObj: {} as model.LogicModelTreeVO, // 当前应用信息
    isLeftShowMenu: true,
    refDataSourceType: '', // 当前基础表所属数据库类型 MySQL Oracle
    activeTabKey: 'defaultTab', // 切换表字段/索引 table
    refreshNum: 0, // 控制是否立即刷新的数字 数字改变 则监听刷新 祛除了true/false只能刷新一次的弊端
    showNoServiceEmpty: false, // 无服务空tab页
    selectedTableKey: '',

    apiId: '',
    apiCode: '',
    apiPath: '',
    apiMethod: '',
    apiMenuList: [], // 模型API菜单数组
    // apiParam: '', // 查询条件：过滤接口路径名参数
    hasApiTable: false,

    // 服务授权相关租户信息
    tenantId: '', // 租户ID
    tenantNum: '', // 租户编码
    tenantName: '', //  租户名称
    tenantMenuList: [], // 基础表授权菜单数组

    editApiFlag: 0, // 编辑API权限
    createApiFlag: 0, // 创建API权限
    editTableFlag: 0, // 是否有编辑权限
    createTableFlag: 0, // 是否有创建权限

    // 标签页
    labelCodeList: '', // 标签编码列表字符串，以半角逗号拼接
    _currentDs: null, // 储存tab页切换时，当前的ds
  } as IStoreData,
  setDataStore(key, data, notStoreData) {
    if (!notStoreData) {
      set(this.storeData, key, data);
    } else {
      this[key] = data;
    }
  },
  getDataStore(key) {
    return toJS(this.storeData[key]);
  },
  setModelDataObjItem(val) {
    this.storeData.modelDataObj = { ...val };
  },
  setTableDetailAll(item) {
    // 模型选择
    this.storeData.tableId = item.tableId;
    this.storeData.tableName = item.tableName;
    this.storeData.tableType = item.tableType;
  },
  get apiMenuData() {
    return toJS(this.storeData.apiMenuList);
  },
  setApiDetailAll(item) {
    if (item) {
      set(this.storeData, 'apiId', item.apiId);
      set(this.storeData, 'apiCode', item.apiCode);
      set(this.storeData, 'apiPath', item.apiPath);
      set(this.storeData, 'apiMethod', item.apiMethod);
    }
  },
  resetApiDetail() {
    set(this.storeData, 'apiId', null);
    set(this.storeData, 'apiCode', null);
  },
  resetTableDetail() {
    set(this.storeData, 'tableId', null);
    set(this.storeData, 'tableName', null);
    set(this.storeData, 'tableType', null);
  },
  resetAuthorization() {
    set(this.storeData, 'tenantId', null);
    set(this.storeData, 'tenantNum', null);
    set(this.storeData, 'tenantName', null);
  },
  get hasApiTable() {
    return this.storeData.apiMenuList.some((item) => item.children && item.children.length > 0);
  },
  ref,
  setCurrentDs(ds) {
    this.storeData._currentDs = ds;
  },
  get currentDs() {
    return this.storeData._currentDs;
  },
  removeCurrentDs() {
    this.storeData._currentDs = null;
  },
});

export const StoreProvider = (props) => {
  const { children } = props;
  const ref = {
    listMenuRef: useRef(),
    menuSelectRef: useRef(), // 全部展开/关闭
    baseTableDetailRef: useRef(),
    indexTableDetailRef: useRef(),
    apiMenuRef: useRef(),
    basicDataMenuRef: useRef(),
    baseLabelMenuRef: useRef(), // 基础结构标签菜单
    addTableModelRef: useRef(), // 正向建表组件实例
  };
  const store = useLocalStore(
    // eslint-disable-next-line no-shadow
    state,
    { ref }
  ) as IBaseTableList;
  const value = {
    ...props,
    store,
  };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};
