import React, { useEffect, useMemo, useImperativeHandle, useContext, FC } from 'react';
import { omit } from 'lodash';
import { Content } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { Tabs, Collapse, Button } from 'choerodon-ui';
import { DataSet, Modal, Form, Output, TextField } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { runInAction } from 'mobx';

import { isTenantRoleLevel } from 'utils/utils';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import { EModelType } from '@/globalData/modelManager';
import notification from 'utils/notification';
import { lowcodeRequest as request } from '@/utils/lowcodeRequest'; // 权限的APPID添加
import { lowcodeOrganizationURL } from '@/utils/common';
import { HZERO_HMDE } from '@/utils/config';

import FieldInformation from './FieldInformation';
import ModelRelationship from './ModelRelationShip';
import EditModelForm from './EditModelForm';
import RedundantTableDataSet from './store/RedundantTableDataSet';
import FieldInformationDataSet from './store/FieldInformationDataSet';
import ListModelRelationShipDataSet from './store/ListModelRelationShipDataSet';
import EditModelFromDataSet from './store/EditModelFormDataSet';
import EditModelTableDataSet from './store/EditModelTableDataSet';
import ModalFileHeaderDataSet from './store/ModalFileHeaderDataSet';
import { IHandleMenuQueryList } from '../../ListView';
import styles from './index.less';

const { TabPane } = Tabs;

enum EModelTable {
  fieldRadio = 'fieldRadio',
  relationRadio = 'relationRadio',
}
enum ERadioVal {
  fieldBtn = 'fieldBtn',
  redundantBtn = 'redundantBtn',
}

interface IIndex extends IHandleMenuQueryList {}
const Index: FC<IIndex> = observer(({ handleMenuQueryList }) => {
  const {
    ref: { modelDetailRef },
    setDataStore,
    storeData: {
      modelDetail,
      modelDetailRadio,
      modelRadio,
      refDataSourceType,
      radioVal,
      fieldAttribute,
      relationAttribute,
      modelType,
      refTableCode,
      selectedTenantId,
      resourceUponRoleHierarchy,
      modalFileBatchEditFlag,
      modalDetailHeaderEditFlag,
      relationshipEditId,
    },
  }: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  useImperativeHandle(modelDetailRef, () => ({
    fieldInformationDataSetReset, // 刷新字段列表
    redundantTableDataSetRest, // 刷新扩展字段列表
    listModelRelationDataSetReset, // 刷新关系列表
    fieldAttributeReset, // 右边字段编辑
    relationAttributeReset, // 右边关系编辑
  }));

  const headerModalDetailInfoDS: DataSet = useMemo(
    () => new DataSet(ModalFileHeaderDataSet(modelDetail.id) as DataSetProps),
    [modelDetail.id]
  );

  useEffect(() => {
    const value = resourceUponRoleHierarchy === 'tenant' ? 'ORGANIZATION' : 'SITE';
    headerModalDetailInfoDS.setQueryParameter(
      'resourceLevel',
      isTenantRoleLevel() ? undefined : value
    );
  }, [headerModalDetailInfoDS, resourceUponRoleHierarchy]);

  const redundantTableDataSet: DataSet = useMemo(
    // 扩展表ds
    // 字段列表ds
    () => new DataSet(RedundantTableDataSet(modelDetail.id, handleMenuQueryList) as DataSetProps),
    [modelDetail.id]
  );
  const fieldInformationDataSet: DataSet = useMemo(
    // 字段列表ds
    () =>
      new DataSet(
        FieldInformationDataSet(
          modelDetail.id,
          handleMenuQueryList,
          resourceUponRoleHierarchy,
          modelDetail.extendsParentCode
        ) as DataSetProps
      ),
    [modelDetail.id, resourceUponRoleHierarchy, modelDetail.extendsParentCode]
  );
  const editModelFromDataSet: DataSet = useMemo(
    () => new DataSet(EditModelFromDataSet(modelDetail.id) as DataSetProps),
    [modelDetail.id]
  );
  const editModelTableDataSet: DataSet = useMemo(
    () => new DataSet(EditModelTableDataSet(selectedTenantId, modelDetail.code) as DataSetProps),
    [selectedTenantId, modelDetail.code]
  );
  const listModelRelationShipDataSet: DataSet = useMemo(() => {
    // 关系列表ds
    const ds = new DataSet(ListModelRelationShipDataSet(modelDetail.id, '') as DataSetProps);
    ds.setState('selectedTenantId', selectedTenantId);
    return ds;
  }, [modelDetail.id]);

  useEffect(() => {
    refreshHeaderInfo();
  }, [modelDetail.id]);

  // 初始化模型详情
  const initTable = () => {
    if (!modelDetail.id) return;
    setDataStore('menuLoading', true, true);
    const promise1 = fieldInformationDataSet.query();
    const promise2 = redundantTableDataSet.query();
    const promise3 = listModelRelationDataSetReset();
    Promise.all([promise1, promise2, promise3]).finally(() => {
      setDataStore('menuLoading', false, true);
    });
    if (modelDetailRadio === 'relationRadio') {
      handleEditRelationShip(listModelRelationShipDataSet.current as Record);
    }
  };

  useEffect(() => {
    initTable();
  }, [modelDetail.id]);

  // 刷新关系列表
  const listModelRelationDataSetReset = () => {
    // 刷新关系列表
    listModelRelationShipDataSet.query();
  };

  // 刷新字段列表
  const fieldInformationDataSetReset = () => {
    return fieldInformationDataSet.query();
  };
  const redundantTableDataSetRest = () => {
    return redundantTableDataSet.query();
  };

  // 重置右边字段列表菜单
  type IFieldAttributeReset = (force: boolean) => void;
  const fieldAttributeReset: IFieldAttributeReset = (force = false) => {
    let recode;
    if (force) {
      // 强制刷新
      recode = fieldInformationDataSet.current;
    } else {
      if (!fieldAttribute) {
        return;
      }
      if (fieldAttribute.get('fieldType') === 'TABLE_FIELD') {
        recode = fieldInformationDataSet.find(
          (item) => item.get('id') === fieldAttribute.get('id')
        );
      } else if (fieldAttribute.get('fieldType') === 'REDUNDANT_FIELD') {
        recode = redundantTableDataSet.find((item) => item.get('id') === fieldAttribute.get('id'));
      }
    }
    handleEditField(recode);
  };

  // 重置右边关系列表菜单
  type IRelationAttributeReset = (force: boolean) => void;
  const relationAttributeReset: IRelationAttributeReset = (force = false) => {
    let recode;
    if (force) {
      recode = listModelRelationShipDataSet.current;
    } else {
      if (!relationAttribute) {
        return;
      }
      recode = listModelRelationShipDataSet.find(
        (item) => item.get('id') === relationAttribute.get('id')
      );
    }
    handleEditRelationShip(recode);
  };

  const handleSave = (formDs: DataSet, tableDs: DataSet) => {
    const record = formDs?.current?.toJSONData();
    return request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/model-fields/${record.id}`, {
      method: 'PUT',
      body: {
        ...record,
        sourceLogicModelId: modelDetail.id,
        modelFieldGroupList: tableDs
          .toData()
          ?.map((data) => omit(data, ['targetLogicModel', 'targetModelField'])),
      },
    });
  };

  /**
   * 展开侧弹框编辑
   * @param record Record
   */
  const showModelEditData = (record: Record) => {
    editModelFromDataSet.create(record.toData());
    editModelTableDataSet.loadData(record.toData().modelFieldGroupList || []);
    const { extendsParentCode } = modelDetail;
    // 1. extendsParentCode 为空则字段都需要可编辑
    // 2. extendsParentCode 不为空，并且 subCanEditFlag = 1，能编辑
    // 3. extendsParentCode 不为空，并且 subCanAddFlag = 1，能编辑
    const tenantEditable =
      !!extendsParentCode && !(record.get('subCanEditFlag') || record.get('subCanAddFlag'));
    Modal.open({
      lowcodeSize: 'biggest',
      title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>编辑字段</div>,
      key: Modal.key(),
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      drawer: true,
      children: (
        <EditModelForm
          modelDetail={modelDetail}
          modelRadio={modelRadio}
          refDataSourceType={refDataSourceType}
          formDs={editModelFromDataSet}
          tableDs={editModelTableDataSet}
          resourceUponRoleHierarchy={resourceUponRoleHierarchy}
          tenantEditable={tenantEditable}
        />
      ),
      onOk: async () => {
        const res = await handleSave(editModelFromDataSet, editModelTableDataSet);
        if (res && !res.failed) {
          if (radioVal === ERadioVal.fieldBtn) {
            fieldInformationDataSetReset();
          } else if (radioVal === ERadioVal.redundantBtn) {
            redundantTableDataSetRest();
          }
        } else {
          notification.error({ message: '错误', description: res.message });
        }
      },
    });
  };

  /**
   * 字段到详情
   */
  const handleEditField = (recode: Record) => {
    // if (!nameList.includes(recode.get('fieldName'))) {
    showModelEditData(recode);
    // setRightEditData('field', recode);
    // }
  };

  /**
   * 关系到详情
   */
  const handleEditRelationShip = (recode: Record) => {
    setDataStore('modalFileBatchEditFlag', false);
    setDataStore('relationshipEditId', recode?.id || '');
  };

  // 刷新顶部信息
  const refreshHeaderInfo = async () => {
    const res = await headerModalDetailInfoDS.query();
    if (res) {
      runInAction(() => {
        setDataStore('refTableCode', res.refTableCode); // 用于字段新建查询列表
        setDataStore('redundantTableName', res.redundantTableName); // 设置当前扩展表名 用于是否显示扩展表空tab页
        setDataStore('redundantMode', res?.redundantMode); // 设置当前扩展表扩展模式
        setDataStore('refDataSourceType', res.refDataSourceType); // 数据库名称
        setDataStore('refServiceCode', res.refServiceCode); // 服务名称
        setDataStore('refTableName', res.refTableName); // 引用表名称
      });
    }
  };

  // 保存
  const modelFormSave = async (): Promise<void> => {
    const val = await headerModalDetailInfoDS?.current?.validate();
    if (val) {
      if (modelRadio === 'modelTable') {
        if (headerModalDetailInfoDS?.current?.set) {
          headerModalDetailInfoDS.current.set('param', { id: modelDetail.id });
        }
        await headerModalDetailInfoDS.submit();
        handleMenuQueryList();
        setDataStore('modalDetailHeaderEditFlag', false);
        setDataStore('modelDetail.name', headerModalDetailInfoDS?.current?.get('name'));
        headerModalDetailInfoDS.query();
      } else if (modelRadio === 'apiTable') {
        if (headerModalDetailInfoDS?.current?.set) {
          headerModalDetailInfoDS.current.set('param', { id: modelDetail.id });
        }
        await headerModalDetailInfoDS.submit();
        handleMenuQueryList();
        setDataStore('modelDetail.name', headerModalDetailInfoDS?.current?.get('name'));
        headerModalDetailInfoDS.query();
      }
    } else {
      notification.error({ message: '错误', description: '校验未通过' });
    }
  };

  const FieldInformationProps = {
    // id,
    redundantTableDataSet,
    fieldInformationDataSet,
    handleMenuQueryList, // 左边菜单查询
    handleEditField, // 点击编辑跳转最右边编辑页
    refTableCode,
    refreshHeaderInfo,
    headerModalDetailInfoDS,
  };

  const modelRelationshipProps = {
    handleMenuQueryList, // 左边菜单查询
    listModelRelationShipDataSet,
    handleEditRelationShip, // 点击到详情
    headerModalDetailInfoDS,
  };

  // 切换中间面板，控制右边显示
  const handleTabsClick = (key: string) => {
    setDataStore('modelDetailRadio', key);
  };

  const dataSourceTypeRenderer = ({ value }: { value?: any }) => {
    const dataSourceType = {
      TABLE: '数据表',
      API: 'API',
    };
    return dataSourceType[value];
  };

  // 渲染顶部内容
  const renderEditHeaderInfo = () => {
    if (modalDetailHeaderEditFlag) {
      return (
        <Form
          columns={4}
          useColon={false}
          dataSet={headerModalDetailInfoDS}
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
                      setDataStore('modalDetailHeaderEditFlag', false);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    style={{ margin: '0 12px' }}
                    funcType="raised"
                    type="ghost"
                    onClick={() => {
                      headerModalDetailInfoDS.reset();
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

    // 渲染编辑按钮
    const renderHeaderEditBtn = () => {
      // 如果是租户级：能编辑【自定义】
      // 如果是平台级：能编辑【自定义】【租户共享】
      // 【预定义】的都不能编辑

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
            disabled={modalFileBatchEditFlag || !!relationshipEditId}
            onClick={() => setDataStore('modalDetailHeaderEditFlag', true)}
          >
            编辑
          </Button>
        );
      }
    };

    return (
      <div className={styles['modal-edit-header-info']}>
        <div className={styles['title-wrap']}>
          <h4 className={styles['model-manager-title']}>{modelDetail.name}</h4>
          {renderHeaderEditBtn()}
        </div>
        <Form
          columns={4}
          useColon
          dataSet={headerModalDetailInfoDS}
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
            useColon
            dataSet={headerModalDetailInfoDS}
            labelAlign={'right' as any}
            labelWidth={100}
          >
            <Output name="dataSourceType" renderer={dataSourceTypeRenderer} />
            <Output name="refServiceCode" />
            <Output
              name="refSchemaName"
              renderer={({ text }) => (
                <span>{`${text} (${modelManagerStore.storeData.refDataSourceType})`}</span>
              )}
            />
            <Output name="refTableName" renderer={({ text }) => <span>{text}</span>} />
            <Output name="redundantTableName" renderer={({ text }) => text || '暂无'} />
            <Output
              name="redundantMode"
              renderer={({ text, record }) => (record?.get('redundantTableName') ? text : '暂无')}
            />
          </Form>
        </Collapse.Panel>
      </Collapse>
    );
  };

  return (
    <Content className={`${styles['model-detail']} tabs`}>
      {renderEditHeaderInfo()}
      <div className={styles['model-manager-collapse-wrap']}>{renderHeaderModalInfoCollapse()}</div>
      {modelType !== EModelType.PREDEFINE ? (
        <Tabs
          className={`${styles['model-detail-tabs']}`}
          defaultActiveKey={EModelTable.fieldRadio}
          onTabClick={handleTabsClick}
        >
          <TabPane tab="字段信息" key={EModelTable.fieldRadio}>
            <FieldInformation {...FieldInformationProps} />
          </TabPane>
          <TabPane tab="模型关系" key={EModelTable.relationRadio}>
            <ModelRelationship {...modelRelationshipProps} />
          </TabPane>
        </Tabs>
      ) : (
        <FieldInformation {...FieldInformationProps} />
      )}
    </Content>
  );
});
export default Index;
