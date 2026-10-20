import React, { useContext, useRef, useImperativeHandle, useMemo, useState } from 'react';
import { Content } from 'components/Page';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Tabs, Spin, Button, Collapse } from 'choerodon-ui';
import { DataSet, Form, TextField, Output } from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import notification from 'utils/notification';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

import _store from '@/routes/Modeler/ModelDesigner/stores';
import { getInterfaceInfoService } from '@/services/modelListService';

import ModelFields from './ModelFields';
import InterfaceDefinition from './InterfaceDefinition';
import modelFieldTableDS from './ModelFields/modelFieldTableDS';
import apiFieldTableDS from './ModelFields/apiFieldTableDS';
import { IModelManagerStore } from '../../stores/index';
import styles from './index.less';

const { TabPane } = Tabs;

const presetMethodList = [
  ['list', { key: 'list', text: '列表查询：list' }],
  ['query', { key: 'query', text: '单条查询：query' }],
  ['page', { key: 'page', text: '分页查询：page' }],
  ['create', { key: 'create', text: '创建数据：create' }],
  ['update', { key: 'update', text: '更新数据：update' }],
  ['delete', { key: 'delete', text: '删除数据：delete' }],
  ['save', { key: 'save', text: '批量保存数据：save' }],
];

export default observer(({ handleMenuQueryList }: any) => {
  const {
    setDataStore,
    setRightEditData,
    setApiInterfaceList,
    ref: { apiDetailRef },
    storeData: {
      modelDetail,
      fieldAttribute,
      apiDetailTab,
      resourceUponRoleHierarchy,
      apiDetailHeaderEditFlag,
      apiFileBatchEditFlag,
      modelType,
    },
  }: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const thisMap: Map<string, any> = useMemo(() => new Map(presetMethodList as any), []);
  const tableDs: DataSet = useMemo(() => new DataSet(modelFieldTableDS(modelDetail.id)), [
    modelDetail.id,
  ]);
  const apiHeaderInfoDS = useMemo(() => {
    return new DataSet(apiFieldTableDS(modelDetail.id) as any);
  }, [modelDetail.id]);
  const [loading, setLoading] = useState<boolean>(false);

  const modelFieldDataSetReset = () => {
    return tableDs.query();
  };
  useImperativeHandle(apiDetailRef, () => ({
    modelFieldDataSetReset,
    fieldAttributeReset, // 右边字段编辑
  }));

  const fieldNameList: React.MutableRefObject<any[]> = useRef([]);

  // 初始化接口定义
  const initApiInterfaceList = async (): Promise<boolean | void> => {
    if (modelDetail.id) {
      setLoading(true);
      const res:
        | model.baseStructure.BaseModelApiBind[]
        | common.Message = await getInterfaceInfoService({ logicModelId: modelDetail.id });
      setLoading(false);
      if (res && (res as common.Message).failed) {
        notification.error({ title: '错误', description: (res as common.Message).message } as any);
        return false;
      }
      ((res || []) as model.baseStructure.BaseModelApiBind[]).forEach((item) => {
        if (item.action) {
          const obj = thisMap.get(item.action.toLowerCase());
          Object.assign(item, obj);
        }
      });
      runInAction(() => {
        setApiInterfaceList(res as model.baseStructure.BaseModelApiBind[]);
      });
    }
  };

  /**
   * 字段到详情
   */
  const handleEditField = (recode: Record | undefined): void => {
    setRightEditData('field', recode);
  };

  const dataSourceTypeRenderer = ({ value }: { value?: any }) => {
    const dataSourceType = {
      TABLE: '数据表',
      API: 'API',
    };
    return dataSourceType[value];
  };

  // 保存
  const modelFormSave = async (): Promise<void> => {
    const val = await apiHeaderInfoDS?.current?.validate();
    if (val) {
      if (apiHeaderInfoDS?.current?.set) {
        apiHeaderInfoDS.current.set('param', { id: modelDetail.id });
      }
      await apiHeaderInfoDS.submit();
      handleMenuQueryList();
      setDataStore('apiDetailHeaderEditFlag', false);
      setDataStore('modelDetail.name', apiHeaderInfoDS?.current?.get('name'));
      apiHeaderInfoDS.query();
    } else {
      notification.error({ message: '错误', description: '校验未通过' });
    }
  };

  // 重置右边字段列表菜单
  const fieldAttributeReset = (force: boolean = false): void => {
    let recode: Record | undefined;
    if (force) {
      // 强制刷新
      recode = tableDs.current;
    }
    if (fieldAttribute && fieldAttribute.get('fieldType') === 'API_FIELD') {
      recode = tableDs.find((item) => item.get('id') === fieldAttribute.get('id'));
    }
    handleEditField(recode);
  };

  const modelFieldProps = {
    tableDs,
    handleEditField,
  };

  const interfaceDefinitionProps = {
    // activeKey,
    // perHidden,
    perHidden: false,
    handleEditField,
    initApiInterfaceList,
    fieldNameList: fieldNameList.current,
  };

  // 渲染编辑按钮
  const renderHeaderEditBtn = () => {
    const tenantFlag = isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant';
    if (modelType === 'PREDEFINE') {
      return null;
    } else if (tenantFlag && modelType === 'PLATFORM_SHARED') {
      return null;
    } else {
      return (
        <Button
          funcType="raised"
          type="primary"
          disabled={apiFileBatchEditFlag}
          onClick={() => setDataStore('apiDetailHeaderEditFlag', true)}
        >
          编辑
        </Button>
      );
    }
  };

  // 渲染顶部内容
  const renderEditHeaderInfo = () => {
    if (apiDetailHeaderEditFlag) {
      return (
        <Form
          columns={4}
          useColon={false}
          dataSet={apiHeaderInfoDS}
          labelAlign={'right' as any}
          labelWidth={100}
          className={styles['modal-edit-header-info-editing']}
        >
          <TextField colSpan={2} name="name" />
          <Output
            colSpan={2}
            renderer={() => {
              return (
                <div className={styles['btn-list']}>
                  <Button
                    funcType="raised"
                    type="ghost"
                    onClick={() => {
                      setDataStore('apiDetailHeaderEditFlag', false);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    style={{ margin: '0 12px' }}
                    funcType="raised"
                    type="ghost"
                    onClick={() => {
                      apiHeaderInfoDS.reset();
                    }}
                  >
                    重置
                  </Button>
                  <Button type="primary" funcType="raised" onClick={modelFormSave}>
                    保存
                  </Button>
                </div>
              );
            }}
          />
          <TextField colSpan={2} name="description" />
        </Form>
      );
    }

    return (
      <div className={styles['modal-edit-header-info']}>
        <div className={styles['title-wrap']}>
          <h4 className={styles['model-manager-title']}>{modelDetail.name}</h4>
          {renderHeaderEditBtn()}
        </div>
        <Form
          columns={4}
          useColon={false}
          dataSet={apiHeaderInfoDS}
          labelAlign={'right' as any}
          labelWidth={100}
        >
          <Output colSpan={2} name="code" />
          <Output colSpan={2} name="description" renderer={({ text }) => text || '暂无'} />
        </Form>
      </div>
    );
  };

  // 渲染顶部物理模型信息
  const renderHeaderModalInfoCollapse = () => {
    return (
      <Collapse bordered={false}>
        <Collapse.Panel header="物理模型信息" key="1">
          <Form
            columns={4}
            useColon={false}
            dataSet={apiHeaderInfoDS}
            labelAlign={'right' as any}
            labelWidth={100}
          >
            <Output colSpan={2} name="dataSourceType" renderer={dataSourceTypeRenderer} />
            <Output colSpan={2} name="refServiceCode" />
          </Form>
        </Collapse.Panel>
      </Collapse>
    );
  };

  return (
    <Content className={`${styles['api-detail']} tabs`}>
      {renderEditHeaderInfo()}
      <div className={styles['model-manager-collapse-wrap']}>{renderHeaderModalInfoCollapse()}</div>
      <Tabs
        className={styles['tabs-style']}
        activeKey={apiDetailTab}
        onChange={(val) => setDataStore('apiDetailTab', val)}
      >
        <TabPane tab="模型字段定义" key="fieldDefinition">
          <ModelFields {...modelFieldProps} />
        </TabPane>
        <TabPane tab="接口定义" key="interfaceDefinition">
          <Spin spinning={loading}>
            <InterfaceDefinition {...interfaceDefinitionProps} />
          </Spin>
        </TabPane>
      </Tabs>
    </Content>
  );
});
