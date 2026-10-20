/* eslint-disable no-shadow */
import React, { createContext, useRef } from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { set, upperFirst } from 'lodash';
import { toJS, runInAction } from 'mobx';

import { ETableType, EIsLeftShow, EModelType } from '@/globalData/modelManager';
import { isTenantRoleLevel } from 'utils/utils';
// import { findTree } from '@/utils/treeUtils';

const modelManagerStore = createContext({});

const LEFTWIDTH = 240; // 左边栏默认宽度
const RIGHTWIDTH = 240; // 右边栏默认宽度

export default modelManagerStore;

interface IPageFun {
  // type: EPageFunType;
  type: string;
}

interface IModelDetail {
  appId: number | string | null;
  id: number | string | null;
  code: number | string | null;
  name: string | null;
  assignPattern?: string;
  tenantId?: string | number;
  extendsParentCode?: string;
}
interface IApiDetail {
  id: number | string | null;
  code: number | string | null;
  name: string | null;
  assignPattern?: string;
}
interface IStoreData {
  modelRadio: ETableType;
  modelRefreshData: model.SyncModelResultVO;
  modelTypeParam: EModelType;
  // modelType: EModelType;
  modelType: string;
  modelTypeList: ('PREDEFINE' | 'PLATFORM' | 'PLATFORM_SHARED' | 'TENANT')[] | [];
  labelCodeList: string;
  isLeftShow: EIsLeftShow;
  isRightShow: EIsLeftShow;
  modelDataObj: model.LogicModelTreeVO;
  modelDataObjParams: string | null; // fixme
  publishStatus: string;
  modelDetailRadio: string;
  name: string;
  assignPattern: string;
  modelDetail: IModelDetail;
  apiDetail: IApiDetail;
  apiDetailTab: string;
  apiInterfaceList: model.baseStructure.ModelApiBind[] | []; // api接口定义列表数据
  refTableCode: string | number | null; // 编辑表字段需要的表code
  radioVal: string; // 控制表字段/扩展字段按钮选中状态 fieldBtn 表字段 redundantBtn 扩展字段
  redundantTableName: string | null; // 控制模型扩展字段表是否显示的依据
  redundantMode: string | null; // 模型扩展表扩展模式
  refServiceCode: string | null; // 当前选中模型服务名称
  refSchemaName: string | null; // 当前选中模型数据对象名称
  refDataSourceType: string; // 当前选中模型数据对象类型 (数据库名称 MySQL Oracle)
  refTableName: string;
  modelAttribute: boolean; // 右边显示模型
  fieldAttribute: any; // fixme 模型字段属性
  fieldShowEmpty: boolean;
  relationShowEmpty: boolean;
  relationAttribute: any; // fixme
  historyRightListName: string; // 右侧侧边栏点击历史
  leftWidthStyle: number; // 左边栏宽度
  rightWidthStyle: number; // 右边栏宽度
  // modelSelectedKeys: string[] | null;
  resourceUponRoleHierarchy: 'platform' | 'tenant'; // 当前查询、浏览的资源层级，平台层或租户层
  selectedTenantId: number | undefined;
  modelListPagingResetSignal: boolean;
  modelDetailRefreshSignal: boolean;
  modalDetailHeaderEditFlag: boolean;
  modalFileBatchEditFlag: boolean;
  relationshipEditId: string;
  apiDetailHeaderEditFlag: boolean;
  apiFileBatchEditFlag: boolean;
}

interface ISourceDetail {
  // appId?: string | number;
  code: string | number;
  name: string | number;
  isPublished: boolean;
  publishStatus: any; // FIXME: 这个因为在ISetSourceDetailAll里面作为参数有用到，这个时候把boolean赋值给string ｜ undefined会报错，所以暂时用any
  assignPattern?: string;
}
interface ISourceData {
  sourceDataObj: common.Page<model.LogicModel>;
  sourceDetail: ISourceDetail;
  refDataSourceType: string;
  sourceDetailType: string;
}
interface ISetSourceDetailAll {
  // appId?: string | number;
  name: string | number;
  code: string | number;
  publishStatus?: string;
  isPublished?: boolean;
  assignPattern?: string;
}
// store接口
export interface IModelManagerStore {
  pageFun: IPageFun;
  menuLoading: boolean; // 菜单Loading状态
  pageCenterContentHeight: number;
  storeData: IStoreData;
  currentModelDetailAll: () => model.LogicModel;
  setDataStore: (key: string, value: any, flag?: boolean) => void; // 任意值
  getDataStore: (key: string) => any; // 任意值
  setModelDataObjItem: () => void;
  setModelDetailAll: (item: model.LogicModel) => void;
  setApiDetailAll: (item: model.LogicModel) => void;
  clearDetailAll: (detailName: string) => void;
  setApiInterfaceList: (data: model.baseStructure.ModelApiBind[]) => void;
  getApiInterfaceList: () => model.baseStructure.ModelApiBind[];
  setRightEditData: (key?: string, data?: any) => void; // fixme
  setIsModelShow: (name: string, show: string) => void;
  authorizationData: ISourceData;
  setSourceData: (key: string, data: any) => void; // fixme
  getSourceData: (key: string) => any; // fixme
  getSourceDetailType: (key: string) => any; // fixme
  setSourceDetailAll: (item: ISetSourceDetailAll) => void;
  setPageType: (type: string) => void;
  clearStoreAll: (storeDataType: string) => void;
  setEditStatusToDefault: () => void;
  platformHidden: boolean;
  store?: any;
  ref?: any;
}

export function ModelManagerProvider(props) {
  const { children } = props;
  const ref = {
    // 模型设计器
    menuListRef: useRef(), // 模型菜单
    modelDetailRef: useRef(),
    apiDetailRef: useRef(),
    listViewRef: useRef(),
    menuSelectRef: useRef(),
    modelRelationShipFormRef: useRef(),
    modelFormEditRef: useRef(), // 模型form操作表单
    pageRef: useRef(),
    // 模型授权租户
    // seeSourceRef: useRef(),
    firstStepRef: useRef(),
    secondStepRef: useRef(),
    thirdStepRef: useRef(),
  };
  const store = useLocalStore(
    // eslint-disable-next-line no-shadow
    ({ ref }) =>
      ({
        pageFun: { type: 'model' }, // 模型管理|授权 model|authorization
        menuLoading: false, // 菜单Loading状态
        pageCenterContentHeight: 0, // 页面中间部分高度
        // 模型设计器
        storeData: {
          modelRadio: 'modelTable', // apiTable: api模型 modelTable: 表模型
          modelRefreshData: {}, // 同步结果
          modelTypeParam: '' as EModelType, // 模型类型参数 预置模型|自定义模型
          modelType: '' as EModelType,
          modelTypeList: [],
          labelCodeList: '',
          isLeftShow: 'true', // 左边是否展开
          isRightShow: 'false', // 右边是否展开 false true no
          modelDataObj: {} as model.LogicModelTreeVO, // 左边栏数据
          modelDataObjParams: null, // 查询左边菜单栏
          publishStatus: '', // 发布状态
          modelDetailRadio: 'fieldRadio', // fieldRadio 字段信息 relationRadio 模型关系
          modelDetail: {
            // 左边选中的数据
            id: null,
            code: null,
            name: '',
            assignPattern: '',
            tenantId: undefined,
            extendsParentCode: undefined,
            // name: null,
            // assignPattern: '',
          }, // 模型详情数据
          apiDetail: {
            // api模型详情
            // id: null,
            // code: null,
            // name: null,
            // assignPattern: '',
          },
          apiDetailTab: 'fieldDefinition', // 模型字段定义 fieldDefinition 接口定义 interfaceDefinition
          apiInterfaceList: [], // api接口定义列表数据
          refTableCode: null, // 编辑表字段需要的表code
          radioVal: 'fieldBtn', // 控制表字段/扩展字段按钮选中状态 fieldBtn 表字段 redundantBtn 扩展字段
          redundantTableName: '', // 控制模型扩展字段表是否显示的依据
          redundantMode: '', // 模型扩展表扩展模式
          refServiceCode: '', // 当前选中模型服务名称
          refSchemaName: '', // 当前选中模型数据对象名称
          refDataSourceType: '', // 当前选中模型数据对象类型 (数据库名称 MySQL Oracle)
          refTableName: '',
          modelAttribute: true, // 右边显示模型
          fieldAttribute: null, // 模型字段属性
          fieldShowEmpty: false,
          relationShowEmpty: false,
          // apiFieldAttribute: null, // 新增的api字段属性
          relationAttribute: null,
          historyRightListName: 'model', // 右侧侧边栏点击历史
          leftWidthStyle: LEFTWIDTH, // 左边栏宽度
          rightWidthStyle: 0, // 右边栏宽度
          // modelSelectedKeys: null, // 数据源菜单选中项key数组
          resourceUponRoleHierarchy: 'platform',
          selectedTenantId: undefined,
          modelListPagingResetSignal: false,
          modelDetailRefreshSignal: false,
          modalDetailHeaderEditFlag: false, // 模型设计器详情-顶部头信息编辑状态
          modalFileBatchEditFlag: false, // 模型字段 批量编辑标识
          relationshipEditId: '', // 关联关系编辑行的ID
          apiDetailHeaderEditFlag: false, // api设计器详情-顶部头信息编辑状态
          apiFileBatchEditFlag: false, // api模型字段 批量编辑标识
        } as IStoreData,
        get currentModelDetailAll() {
          // 当前模型的数据 (保证操作、发布模型等 版本号最新)
          if (store.storeData.modelDetail.id) {
            const currentObj = (store.storeData.modelDataObj.content || []).find(
              (ele) => ele.id === store.storeData.modelDetail.id
            );
            return currentObj || {};
          }
          return (store.storeData.modelDataObj.content || [])[0] || {};
        },
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
        setModelDataObjItem() {
          // 改变左边列表某一个模型的数据
          const modelDataObj = { ...this.storeData.modelDataObj };
          this.storeData.modelDataObj = modelDataObj;
        },
        setModelDetailAll(item) {
          // 表模型选择
          // eslint-disable-next-line prefer-destructuring
          if (item) {
            store.storeData.currentModelDetailAll = item;
            this.storeData.publishStatus = item.publishStatus;
            this.storeData.refServiceCode = item.refServiceCode;
            this.storeData.refSchemaName = item.refSchemaName;
            this.storeData.refDataSourceType = item.refDataSourceType;
            this.storeData.modelType = item.type; // 模型类型 预置|自定义
            this.storeData.name = item.name;
            this.storeData.modelDetail.assignPattern = item.assignPattern;
            this.storeData.modelDetail.id = item.id ? item.id : null; // 主键加密 字符串不用Number类型转换
            this.storeData.modelDetail.code = item.code;
            this.storeData.modelDetail.name = item.name;
            this.storeData.modelDetail.tenantId = item.tenantId;
            this.storeData.modelDetail.extendsParentCode = item.extendsParentCode;
            if (item?.type === 'PREDEFINE') {
              this.storeData.radioVal = 'fieldBtn';
            }
          }
        },
        setApiDetailAll(item) {
          // api模型选择
          // eslint-disable-next-line prefer-destructuring
          if (item) {
            this.storeData.publishStatus = item.publishStatus;
            this.storeData.refServiceCode = item.refServiceCode;
            this.storeData.refSchemaName = item.refSchemaName;
            this.storeData.refDataSourceType = item.refDataSourceType;
            this.storeData.modelType = item.type; // 模型类型 预置|自定义
            this.storeData.name = item.name;
            this.storeData.modelDetail.assignPattern = item.assignPattern;
            this.storeData.apiDetail.id = item.id ? item.id : null; // 主键加密 字符串不用Number类型转换
            this.storeData.apiDetail.code = item.code;
          }
        },
        // 清除modelDetail/apiDetail
        clearDetailAll(detailName) {
          if (detailName) {
            this.storeData[detailName].id = null;
            this.storeData[detailName].code = null;
            this.storeData[detailName].name = null;
          }
        },
        setApiInterfaceList(data) {
          this.storeData.apiInterfaceList = data;
        },
        getApiInterfaceList() {
          return toJS(this.storeData.apiInterfaceList);
        },
        setRightEditData(key, data) {
          // 右侧侧边栏显示内容控制
          switch (key) {
            case 'model':
              this.storeData.fieldShowEmpty = false;
              this.storeData.relationShowEmpty = false;
              this.storeData.modelAttribute = true;
              this.storeData.relationAttribute = null;
              this.storeData.fieldAttribute = null;
              this.storeData.historyRightListName = 'model';
              break;
            case 'field':
              if (!data) {
                this.storeData.fieldShowEmpty = true;
              } else {
                this.storeData.fieldShowEmpty = false;
              }
              this.storeData.relationShowEmpty = false;
              this.storeData.modelAttribute = false;
              this.storeData.relationAttribute = null;
              this.storeData.fieldAttribute = data;
              this.storeData.historyRightListName = 'field';
              if (this.pageFun.type === 'model') {
                this.setIsModelShow('right', 'true');
              } else {
                this.setIsModelShow('right', 'no');
              }
              break;
            case 'relation':
              if (!data) {
                this.storeData.relationShowEmpty = true;
              } else {
                this.storeData.relationShowEmpty = false;
              }
              this.storeData.fieldShowEmpty = false;
              this.storeData.modelAttribute = false;
              this.storeData.relationAttribute = data;
              this.storeData.fieldAttribute = null;
              this.storeData.historyRightListName = 'relation';
              if (this.pageFun.type === 'model') {
                this.setIsModelShow('right', 'true');
              } else {
                this.setIsModelShow('right', 'no');
              }
              break;
            default:
          }
        },
        setIsModelShow(name = 'right', show) {
          // 设置收起成按钮状态
          if (show === 'false') {
            // 收起
            this.setDataStore(`${name}WidthStyle`, 46);
          } else if (show === 'no') {
            this.setDataStore(`${name}WidthStyle`, 0);
          } else if (show === 'true') {
            this.setDataStore(`${name}WidthStyle`, name === 'right' ? RIGHTWIDTH : LEFTWIDTH);
          }
          this.setDataStore(`is${upperFirst(name)}Show`, show);
        },

        // 模型授权租户
        authorizationData: {
          // sourceRadio: 'modelTable', // apiTable: api模型 modelTable: 表模型
          sourceDataObj: {} as common.Page<model.LogicModel>, // 模型，左侧列表数据
          // sourceDataObjParams: '', // 模型授权租户，查询左边菜单栏参数
          sourceDetail: {
            code: '',
            name: '',
            publishStatus: '', // 发布状态编码
            isPublished: false, // 是否发布
          }, // 模型详情数据, // 模型授权租户，右边数据
          refDataSourceType: '', // 当前选中模型类型 (数据库名称 MySQL Oracle): '', // 当前选中模型数据对象类型 (数据库名称 MySQL Oracle)
          sourceDetailType: 'see', // eidt ,create// 当前模型详情的状态
        },

        setSourceData(key, data) {
          set(this.authorizationData, key, data);
        },

        getSourceData(key) {
          return toJS(this.authorizationData[key]);
        },
        getSourceDetailType(key = 'sourceDetailType') {
          return this.authorizationData[key];
        },
        setSourceDetailAll(item) {
          // eslint-disable-next-line prefer-destructuring
          this.authorizationData.sourceDetail.code = item.code || '';
          this.authorizationData.sourceDetail.name = item.name || '';
          this.authorizationData.sourceDetail.publishStatus = item.publishStatus as string; // 发布状态字段 PUBLISHED
          this.authorizationData.sourceDetail.isPublished = item.publishStatus === 'PUBLISHED'; // 是否发布
          this.authorizationData.sourceDetail.assignPattern = item.assignPattern; // 是否发布
        },
        // 设置当前页面为什么功能
        setPageType(type = 'model') {
          switch (type) {
            // case 'model':
            //   this.setSourceDetailAll({} as any);
            //   break;
            case 'authorization':
              // this.setApiDetailAll({} as model.LogicModel);
              // this.setModelDetailAll({} as model.LogicModel);
              this.setIsModelShow('right', 'no');
              break;
            default:
          }
          this.pageFun.type = type;
        },
        // 清空所有 可扩展
        clearStoreAll(storeDataType) {
          runInAction(() => {
            this[storeDataType] = {}; // 目前只做了清空虚拟字段
          });
        },
        setEditStatusToDefault() {
          set(this.storeData, 'modalDetailHeaderEditFlag', false);
          set(this.storeData, 'modalFileBatchEditFlag', false);
          set(this.storeData, 'relationshipEditId', '');
          set(this.storeData, 'apiDetailHeaderEditFlag', false);
          set(this.storeData, 'apiFileBatchEditFlag', false);
        },
        get platformHidden() {
          return (
            (this.storeData.resourceUponRoleHierarchy === 'tenant' &&
              !!this.storeData.selectedTenantId) ||
            isTenantRoleLevel()
          );
        },
        ref,
      } as IModelManagerStore),
    { ref }
  );
  return (
    <modelManagerStore.Provider
      value={{
        store,
        history: props.history,
      }}
    >
      {children}
    </modelManagerStore.Provider>
  );
}
