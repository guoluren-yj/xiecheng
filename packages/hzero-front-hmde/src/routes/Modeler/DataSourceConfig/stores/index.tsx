/* eslint-disable no-shadow */
import React, { createContext, useRef } from 'react';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS, runInAction } from 'mobx';

import { ESource } from '@/globalData/modelManager';
import { IData } from '@/routes/Modeler/hooks/useModalMain';

const sourceManagerStore = createContext({});
const LEFTWIDTH = 240;
export default sourceManagerStore;

interface IPageFun {
  type: string;
}
export interface ISourceDetail {
  dataObjectId: number | string;
  dataObjectCode: number | string;
  dataObjectName: string | number;
  dataObjectCategory: string;
  assignPattern: string;
  isPublished: boolean;
  publishStatus: string;
  dataObjectOwnerType: string;
  extendsParentCode: string;
  extendsParentName: string;
  encryptId?: number | string;
}

interface IDataObject {
  level: 'platform' | 'tenant';
  tenantId: number | string; // 租户ID
  tenantNum: string | number; // 租户编码
  tenantName: string; //  租户名称
  isLeftShow: boolean;
  leftWidthStyle: number;
  menuLoading: boolean;
  dataRadio: string;
  dataObj: model.data.DataSourceTreeVO;
  dataObjParams: {
    page: number;
    size: number;
    dataObjectOwnerTypeList: string;
    dataObjectName: string;
    labelCodeList: string;
  };
  dataObjectTreeData: model.data.BaseDataObject;
  dataObjectDetail: ISourceDetail;
  refDataSourceType: string;
  dataObjectDetailType: string;
  dataSelectedKey: {
    modelSource: ISourceDetail;
    apiSource: ISourceDetail;
  };
  virtualFields: model.data.DataVirtualField[]; // 选中模型虚拟字段列表
  secondLeftData: model.data.BaseDataObjectField[]; // 第二步穿梭框左侧字段
  secondRightData: model.data.BaseDataObjectField[]; // 第二步穿梭框右侧字段
  checkedNodes: IData[]; // 数据对象选中节点List
  tabActiveKey: string;
}
interface ISetSourceDetailAll {
  dataObjectId: string | number;
  dataObjectName: string | number;
  dataObjectCode: string | number;
  dataObjectCategory: string;
  assignPattern: string;
  publishStatus: string;
  isPublished?: boolean;
  dataObjectOwnerType?: string;
  extendsParentCode: string;
  extendsParentName: string;
  encryptId?: string | number;
}
// store接口
export interface ISourceManagerStore {
  pageFun: IPageFun;
  dataObject: IDataObject;
  setTabActiveKey: (key: string) => void;
  setIsLeftShow: (flag: boolean) => void;
  setDataObject: (key: string, data: any, notStoreData?: boolean) => void; // fixme
  setDataObjectTreeData: (data: any) => void; // fixme
  getDataObject: (key: string) => any; // fixme
  getDataObjectDetailType: (key: string) => any; // fixme
  setDataObjectDetailAll: (item: ISetSourceDetailAll) => void;
  setPageType: (type: string) => void;
  setVirtualFields: (data: model.data.DataVirtualField[]) => void;
  virtualFields: Array<model.data.DataVirtualField>;
  dataObjectTreeDataToJs: model.data.BaseDataObject;
  setSecondLeftData: (data: model.data.BaseDataObjectField[]) => void;
  secondLeftData: model.data.BaseDataObjectField[]; // fixme
  setSecondRightData: (data: model.data.BaseDataObjectField[]) => void;
  secondRightData: model.data.BaseDataObjectField[];
  clearStoreAll: (storeDataType: string) => void;
  platformHidden: boolean;
  store?: any;
  ref?: any;
}
export function SourceManagerProvider(props) {
  const { children } = props;
  const ref = {
    // 模型设计器
    modelDetailRef: useRef(),
    listViewRef: useRef(),
    pageRef: useRef(),
    menuSelectRef: useRef(),
    modelRelationShipFormRef: useRef(),
    modelFormEditRef: useRef(), // 模型form操作表单
    // 数据对象
    seeSourceRef: useRef(),
    firstStepRef: useRef(),
    secondStepRef: useRef(),
    thirdStepRef: useRef(),
    secondStepCheckedRef: useRef(),
    createStepRef: useRef(),
  };
  const store = useLocalStore(
    // eslint-disable-next-line no-shadow
    ({ ref }) =>
      ({
        pageFun: { type: 'source' }, // tab页|授权tab页 source|authority
        // ////////////////////////////// 数据对象
        dataObject: {
          level: isTenantRoleLevel() ? 'tenant' : 'platform', // 层级 平台层|租户层 platform|tenant
          tenantId: isTenantRoleLevel() ? getCurrentOrganizationId() : '', // 租户ID
          tenantNum: '', // 租户编码
          tenantName: '', //  租户名称
          isLeftShow: true, // 左边是否展开
          leftWidthStyle: LEFTWIDTH, // 左边栏宽度
          menuLoading: false, // 数据源菜单Loading状态
          dataRadio: 'modelSource', // apiSource: api模型数据对象 modelSource: 表模型数据对象
          dataObj: {} as model.data.DataSourceTreeVO, // 数据对象，左侧列表数据
          dataObjParams: {
            page: 0,
            size: 20,
            dataObjectOwnerTypeList: '', // 模型类型， csv (PLATFORM / PLATFORM_SHARED)
            dataObjectName: '', // 逻辑模型名称
            labelCodeList: '', // 标签code筛选， csv
          }, // 数据对象，查询左边菜单栏
          dataObjectTreeData: {} as model.data.BaseDataObject, // treeData
          dataObjectDetail: {
            dataObjectId: '',
            dataObjectCode: '',
            dataObjectName: '',
            assignPattern: '',
            dataObjectCategory: '',
            publishStatus: '', // 发布状态编码
            isPublished: false, // 是否发布
            dataObjectOwnerType: '', // 平台类型 平台共享|平台自定义|租户自定义 PLATFORM_SHARED|PLATFORM|TENANT
            extendsParentCode: '',
            extendsParentName: '',
            encryptId: '',
          }, // 模型详情数据, // 数据对象，右边数据
          refDataSourceType: '', // 当前选中模型数据对象类型 (数据库名称 MySQL Oracle): '', // 当前选中模型数据对象类型 (数据库名称 MySQL Oracle)
          dataObjectDetailType: 'see', // eidt ,create// 当前数据对象详情的状态
          dataSelectedKey: {
            modelSource: {} as ISourceDetail, // 数据源菜单选中项
            apiSource: {} as ISourceDetail,
          },
          virtualFields: [], // 选中模型虚拟字段列表
          secondLeftData: [], // 第二步穿梭框左侧字段
          secondRightData: [], // 第二步穿梭框右侧字段

          assignPattern: '', // 授权名单模式
          checkedNodes: [], // 左侧菜单选中节点列表
          tabActiveKey: '1',
        },
        setTabActiveKey(key) {
          this.setDataObject('tabActiveKey', key);
        },
        setIsLeftShow(flag: boolean) {
          this.setDataObject('isLeftShow', flag);
          this.setDataObject('leftWidthStyle', flag ? LEFTWIDTH : 30);
        },
        setDataObject(key, data, notStoreData) {
          if (notStoreData) {
            this[key] = data;
          } else {
            set(this.dataObject, key, data);
          }
        },
        setDataObjectTreeData(data) {
          runInAction(() => {
            this.dataObject.dataObjectTreeData = data;
            this.dataObject.virtualFields = data?.virtualFieldList;
          });
        },
        getDataObject(key) {
          return toJS(this.dataObject[key]);
        },
        getDataObjectDetailType(key = 'dataObjectDetailType') {
          return this.dataObject[key];
        },
        setDataObjectDetailAll(item) {
          // 模型数据对象
          // eslint-disable-next-line prefer-destructuring
          // this.sourceData.sourceDetail.id = item.id ? Number(item.id) : null;
          this.dataObject.dataObjectDetail.dataObjectId = item.dataObjectId;
          this.dataObject.dataObjectDetail.dataObjectCode = item.dataObjectCode;
          this.dataObject.dataObjectDetail.dataObjectName = item.dataObjectName;
          this.dataObject.dataObjectDetail.dataObjectCategory = item.dataObjectCategory;
          this.dataObject.dataObjectDetail.assignPattern = item.assignPattern;
          this.dataObject.dataObjectDetail.publishStatus = item.publishStatus; // 发布状态字段 PUBLISHED
          this.dataObject.dataObjectDetail.isPublished =
            item.publishStatus === 'PUBLISHED' || item.publishStatus === 'MODIFIED'; // 是否发布
          if (item.dataObjectOwnerType) {
            this.dataObject.dataObjectDetail.dataObjectOwnerType = item.dataObjectOwnerType; // 平台共享|平台自定义
          }
          this.dataObject.dataObjectDetail.extendsParentCode = item?.extendsParentCode;
          this.dataObject.dataObjectDetail.extendsParentName = item?.extendsParentName;
          this.dataObject.dataObjectDetail.encryptId = item.encryptId;
        },
        // 设置当前页面为什么功能
        setPageType(type = ESource.source) {
          this.pageFun.type = type;
        },
        // 设置虚拟字段信息
        setVirtualFields(data) {
          runInAction(() => {
            this.dataObject.virtualFields = data;
          });
        },
        get virtualFields() {
          return toJS(this.dataObject.virtualFields);
        },
        // 设置第二步字段信息
        setSecondLeftData(data) {
          runInAction(() => {
            this.dataObject.secondLeftData = data;
          });
        },
        get secondLeftData() {
          return toJS(this.dataObject.secondLeftData);
        },
        // 设置第二步字段信息
        setSecondRightData(data) {
          runInAction(() => {
            this.dataObject.secondRightData = data;
          });
        },
        get secondRightData() {
          return toJS(this.dataObject.secondRightData);
        },
        // 清空所有 可扩展
        clearStoreAll(storeDataType) {
          runInAction(() => {
            this[storeDataType].virtualFields = []; // 目前只做了清空虚拟字段
          });
        },
        // 清空授权信息
        // resetAuthorization() {
        //   set(this.dataObject, 'tenantId', null);
        //   set(this.dataObject, 'tenantNum', null);
        //   set(this.dataObject, 'tenantName', null);
        // },
        ref,
        get dataObjectTreeDataToJs() {
          return toJS(this.dataObject.dataObjectTreeData);
        },
        get platformHidden() {
          return (
            (this.dataObject.level === 'tenant' && !!this.dataObject.tenantId) ||
            isTenantRoleLevel()
          );
        },
      } as ISourceManagerStore),
    { ref }
  );
  return (
    <sourceManagerStore.Provider
      value={{
        store,
        history: props.history,
      }}
    >
      {children}
    </sourceManagerStore.Provider>
  );
}
