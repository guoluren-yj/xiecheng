/* eslint-disable no-unused-expressions */
/*
 * 接口定义table
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useMemo, useState, useEffect, useContext, useRef } from 'react';
import { Collapse, Icon, Tooltip } from 'choerodon-ui';
import { DataSet, Table, Select, Output, Spin } from 'choerodon-ui/pro';
import ImgIcon from '@/utils/ImgIcon';
import notification from 'utils/notification';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import Lov from '@/components/LowcodeLov';
import Modal from '@/components/LowcodeModal';
import _store from '@/routes/Modeler/ModelDesigner/stores';
import { searchMatcher } from '@/utils/common';
import MethodIcon from '@/routes/Modeler/component/MethodIcon';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import {
  getApiFieldsService,
  saveApiInterfaceService,
  deleteApiInterfaceService,
} from '@/services/modelListService';
import isFailureResponse from '@/utils/isFailureResponse';

import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import apiNameDs from './apiNameDs';
import TableDs from './paramsInfoTableDs';
import styles from '../index.less';
import { IModelManagerStore } from '../../../stores/index';

const { confirm } = Modal;
const { Panel } = Collapse;
const { Option } = Select;

interface IParams {
  initApiInterfaceList: () => Promise<boolean | void>;
  perHidden: boolean;
}

export default observer(function index({ initApiInterfaceList, perHidden }: IParams) {
  const {
    ref: { listViewRef },
    setApiInterfaceList,
    getApiInterfaceList,
    setDataStore,
    storeData: { modelDetail, apiDetailTab, refServiceCode, resourceUponRoleHierarchy, modelType },
  }: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;
  const thisHeadInfo: any = useRef();
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const [fieldNameList, setFieldNameList] = useState<any[]>([]); // FIXME: 这个数据结构不知道是啥
  const [loading, setLoading] = useState<boolean>(false);

  // lov 选择事件
  const lovDataChange = async (obj): Promise<false | undefined> => {
    if (!thisHeadInfo.current) {
      return false;
    }
    // 先查询 后展开
    if (thisHeadInfo.current) {
      const { action } = thisHeadInfo.current;
      setActiveKey([`${action}#${obj.apiCode ? obj.apiCode : ''}`]);
      const str = `${action}#${obj.apiCode ? obj.apiCode : ''}`;
      let res = [];
      if (str) {
        const arr = str ? str.split('#') : [];
        if (arr[0] && arr[1] && modelDetail.id) {
          const tableDs: DataSet = getTableDs({ action: arr[0] }) as DataSet;
          tableDs.setQueryParameter('action', arr[0]);
          tableDs.setQueryParameter('apiCode', arr[1]);
          res = await tableDs.query();
        }
        const newList = getApiInterfaceList().map((item) => {
          if (item.action === action) {
            return {
              ...item,
              ...obj, // 更新头信息
              modelFieldMappings: res, // 更新行信息
            };
          }
          return item;
        });
        runInAction(() => {
          setApiInterfaceList(newList); // 更新store数据
        });
      }
    }
  };

  const listTableDs = useMemo(() => new DataSet(TableDs(modelDetail.id)), [modelDetail.id]);
  const pageTableDs = useMemo(() => new DataSet(TableDs(modelDetail.id)), [modelDetail.id]);
  const queryTableDs = useMemo(() => new DataSet(TableDs(modelDetail.id)), [modelDetail.id]);
  const createTableDs = useMemo(() => new DataSet(TableDs(modelDetail.id)), [modelDetail.id]);
  const updateTableDs = useMemo(() => new DataSet(TableDs(modelDetail.id)), [modelDetail.id]);
  const deleteTableDs = useMemo(() => new DataSet(TableDs(modelDetail.id)), [modelDetail.id]);
  const saveTableDs = useMemo(() => new DataSet(TableDs(modelDetail.id)), [modelDetail.id]);

  // 接口名称LOVds
  const listDs = useMemo(() => new DataSet(apiNameDs(refServiceCode)), [refServiceCode]);
  const pageDs = useMemo(() => new DataSet(apiNameDs(refServiceCode)), [refServiceCode]);
  const queryDs = useMemo(() => new DataSet(apiNameDs(refServiceCode)), [refServiceCode]);
  const createDs = useMemo(() => new DataSet(apiNameDs(refServiceCode)), [refServiceCode]);
  const updateDs = useMemo(() => new DataSet(apiNameDs(refServiceCode)), [refServiceCode]);
  const deleteDs = useMemo(() => new DataSet(apiNameDs(refServiceCode)), [refServiceCode]);
  const saveDs = useMemo(() => new DataSet(apiNameDs(refServiceCode)), [refServiceCode]);

  // 初始化模型字段名下拉值集
  const initFieldNameList = async (): Promise<void> => {
    if (modelDetail.id) {
      const list: (model.BaseModelField & { code: string | number })[] = await getApiFieldsService(
        modelDetail.id
      );

      const data = (list || [])?.map?.((item) => ({
        modelFieldName: item.fieldName,
        modelFieldCode: item.code,
      }));
      setFieldNameList(data || []);
    }
  };

  // 初始化
  const init = async (): Promise<void> => {
    setDataStore('menuLoading', true, true);
    let promise1 = new Promise(() => {});
    if (apiDetailTab === 'interfaceDefinition' || modelDetail.id) {
      promise1 = initFieldNameList();
    }
    const promise2: Promise<any> = initApiInterfaceList();
    Promise.all([promise1, promise2]).then(() => {
      setDataStore('menuLoading', false, true);
    });
    setActiveKey([]); // 初始化后关闭所有折叠面板
  };

  useEffect(() => {
    init();
  }, [apiDetailTab, modelDetail.id]);

  const getLovDs = (record, type?: string): DataSet | null => {
    let ds: DataSet | null = null;
    switch (record.action) {
      case 'list':
        ds = listDs;
        break;
      case 'page':
        ds = pageDs;
        break;
      case 'query':
        ds = queryDs;
        break;
      case 'create':
        ds = createDs;
        break;
      case 'update':
        ds = updateDs;
        break;
      case 'delete':
        ds = deleteDs;
        break;
      case 'save':
        ds = saveDs;
        break;
      default:
        break;
    }
    if (type === 'init') {
      if (ds && ds.current && record.apiCode) {
        ds.current.set('api', record);
      } else if (ds && ds.current) {
        ds.current.reset();
      }
    }
    return ds;
  };

  const getTableDs = (item): DataSet | null => {
    let ds: DataSet | null = null;
    const { action = [] } = item;
    switch (action) {
      case 'list':
        ds = listTableDs;
        break;
      case 'page':
        ds = pageTableDs;
        break;
      case 'query':
        ds = queryTableDs;
        break;
      case 'create':
        ds = createTableDs;
        break;
      case 'update':
        ds = updateTableDs;
        break;
      case 'delete':
        ds = deleteTableDs;
        break;
      case 'save':
        ds = saveTableDs;
        break;
      default:
        break;
    }
    return ds;
  };

  const resetCurrentTableDs = (record = {} as model.baseStructure.ModelApiBind) => {
    const ds: DataSet = getTableDs(record) as DataSet;
    ds.reset();
  };

  /**
   * 保存 头行数据
   */
  const handleSave = async (
    rawRecord: model.baseStructure.ModelApiBind = {} as model.baseStructure.ModelApiBind
  ): Promise<boolean | undefined> => {
    const record = JSON.parse(JSON.stringify(rawRecord)) as typeof rawRecord;

    const ds: DataSet = getLovDs(record) as DataSet;
    const tableDs = getTableDs(record);
    const val1 = await ds?.current?.validate();
    const val2 = await tableDs?.validate();
    if (!val1 || !val2) {
      // 没有更改行数据 或 更改未通过校验 保存失败
      return false;
    }
    if (!tableDs?.dirty) {
      notification.error({
        title: '错误',
        description: '当前数据未变更，请修改后保存',
      } as any);
      return false;
    }
    const headData = ds.toData();
    const lineData = tableDs.toData();

    const params = {
      query: { logicModelId: modelDetail.id },
      body: {
        ...record,
        ...headData[0],
        _token: record.logicModelApiBindId ? record._token : null,
        action: record.action,
        modelFieldMappings: lineData,
      },
    };
    setLoading(true);
    const res = await saveApiInterfaceService(params);
    if (isFailureResponse(res)) {
      notification.error({ title: '错误', description: res.message } as any);
      setLoading(false);
      return false;
    }
    notification.success({ title: '提示', message: '保存成功' } as any);
    setLoading(false);
    resetCurrentTableDs(record);
    setActiveKey([]);
    initApiInterfaceList();
    listViewRef.current?.handleMenuQueryList(); // 刷新左侧菜单
  };

  /**
   * 删除 Api接口定义头行
   */
  const handleDelete = async (
    record: model.baseStructure.ModelApiBind
  ): Promise<boolean | undefined> => {
    console.log(record);

    const submitOk =
      (await confirm(
        '该操作将会解除已选接口与预置方法的绑定，同时将会删除其下所有参数名与模型字段的映射关系，您确定删除该接口吗？',
        'small'
      )) === 'ok'
        ? 'ok'
        : 'cancel';
    if (submitOk === 'ok') {
      if (record.apiCode) {
        if (!record.logicModelApiBindId) {
          const newList: model.baseStructure.ModelApiBind[] = getApiInterfaceList().map((item) => {
            if (item.action === record.action) {
              return {
                ...item,
                apiId: '',
                apiName: '',
                apiCode: '',
                apiPath: '',
                apiMethod: '',
                logicModelApiBindId: '',
              };
            }
            return item;
          });
          runInAction(() => {
            setApiInterfaceList(newList); // 更新store数据
          });
        } else {
          const param = {
            logicModelId: modelDetail.id,
            body: record,
          };
          const res: common.Message = await deleteApiInterfaceService(param);
          if (isFailureResponse(res)) {
            notification.error({ title: '错误', message: res.message } as any);
            return false;
          }
          initApiInterfaceList(); // 初始化
          listViewRef.current.handleMenuQueryList(); // 刷新左侧菜单
        }
      }
    }
  };

  /**
   * 折叠面板头
   * @param {*} record
   */
  const reactNode = (record: model.baseStructure.ModelApiBind): JSX.Element[] => [
    <span style={{ width: '150px', paddingLeft: '5px' }}>
      <Tooltip title={record.text}>{record.text}</Tooltip>
    </span>,
    <span style={{ width: '24%' }}>
      <span
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <span
          onClick={() => {
            thisHeadInfo.current = record;
          }}
        >
          <Lov
            name="api"
            modalProps={{ style: { width: 800 } }}
            dataSet={getLovDs(record, 'init')}
            onChange={lovDataChange}
            noCache
            clearButton={false}
            disabled={
              (isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
              modelType === 'PLATFORM_SHARED'
            }
          />
        </span>
      </span>
    </span>,
    <span style={{ width: '39%' }}>
      <MethodIcon method={record.apiMethod} />
      <span
        style={{
          paddingLeft: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <Tooltip title={record.apiPath}>
          {/* {record.apiPath} */}
          <Output
            name="apiPath"
            dataSet={getLovDs(record) as DataSet}
            // onClick={() => handleCopy(record.apiPath)}
          />
        </Tooltip>
      </span>
    </span>,
    <div
      hidden={perHidden}
      style={{ width: '100px', display: 'flex', justifyContent: 'space-evenly', padding: '0 16px' }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {((isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
        modelType === 'PLATFORM_SHARED') || (
        <>
          <ImgIcon name="save-2.svg" size={16} onClick={() => handleSave(record)} />
          <ImgIcon name="delete-assembly.svg" size={16} onClick={() => handleDelete(record)} />
        </>
      )}
    </div>,
  ];

  const thisColumns = [
    {
      tooltip: 'overflow',
      name: 'mappingFieldName',
      align: 'left',
      width: '25%',
    },
    {
      tooltip: 'overflow',
      name: 'modelField',
      align: 'left',
      editor: () => (
        <Select
          searchable
          clearButton={false}
          searchMatcher={(obj) => searchMatcher(obj)}
          name="modelField"
        >
          {(fieldNameList || []).map((item) => (
            <Option key={item.modelFieldCode} value={item.modelFieldCode}>
              {item.modelFieldName}
            </Option>
          ))}
        </Select>
      ),
    },
  ];
  return (
    <div className={styles['interface-definition-wrapper']}>
      <div className={styles['table-head']}>
        <span style={{ width: '150px', paddingLeft: '6px' }}>预置方法</span>
        <span style={{ width: '24%', paddingLeft: '12px' }}>接口名称</span>
        <span style={{ width: '39%' }}>接口属性</span>
        <span hidden={perHidden} style={{ width: '100px', textAlign: 'center' }}>
          操作
        </span>
      </div>
      <Spin spinning={loading}>
        <Collapse
          bordered={false}
          activeKey={activeKey}
          expandIcon={() => (
            <Icon type="navigate_next" style={{ marginLeft: 10, transition: 'all .3s' }} />
          )}
          onChange={async (val) => {
            const i = val.length - 1;
            const str = val[i];
            if (str) {
              const arr = str ? str.split('#') : [];
              let tableDs: DataSet | null = null;
              tableDs = getTableDs({ action: arr[0] });
              if (arr[1] && modelDetail.id) {
                tableDs?.setQueryParameter('action', arr[0]);
                tableDs?.setQueryParameter('apiCode', arr[1]);
                tableDs?.query();
              }
              tableDs?.loadData([]);
            }
            setActiveKey([str]);
          }}
        >
          {(getApiInterfaceList() || []).map((item) => (
            // @ts-ignore
            <Panel
              key={`${item.action}#${item.apiCode ? item.apiCode : ''}`}
              extra={reactNode(item)}
              className={`${item.key}`}
            >
              {/* 参数信息table */}
              <div className={styles['table-wrapper']}>
                <div className={styles['table-title']}>参数名-模型字段映射</div>
                <Table
                  queryBar={'none' as TableQueryBarType}
                  rowHeight={26}
                  dataSet={getTableDs(item) as DataSet}
                  columns={thisColumns as ColumnProps[]}
                  className={`${styles.btnFloatRight} ${globalStyles['table-style']}`}
                />
              </div>
            </Panel>
          ))}
        </Collapse>
      </Spin>
    </div>
  );
});
