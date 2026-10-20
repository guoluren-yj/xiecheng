/* eslint-disable no-unused-expressions */
import React, { useMemo, useContext, useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { Form, TextField, TextArea, Button, DataSet, Output, Icon } from 'choerodon-ui/pro';
import { Collapse, Tooltip } from 'choerodon-ui';
import notification from 'utils/notification';
import { LabelAlign, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import _store from '@/routes/Modeler/ModelDesigner/stores';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import DetailFormDataSet from './store/DetailFormDataSet';
import styles from './index.less';
import { IParams } from '..';
import { IModelManagerStore } from '../../../stores/index';

// eslint-disable-next-line prefer-destructuring
const Panel = Collapse.Panel;

const dataSourceTypeRenderer = ({ value }: { value?: any }) => {
  const dataSourceType = {
    TABLE: '数据表',
    API: 'API',
  };
  return dataSourceType[value];
};

export default observer(({ handleMenuQueryList }: IParams) => {
  const {
    setDataStore,
    ref: { modelFormEditRef },
    storeData: {
      modelDetail,
      modelRadio,
      redundantTableName,
      resourceUponRoleHierarchy,
      modelType,
    },
  }: IModelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const perHidden = false;

  // form表单
  const detailFormDataSet = useMemo(
    // form表单
    () => new DataSet(DetailFormDataSet(modelRadio)),
    [modelRadio]
  );
  useImperativeHandle(modelFormEditRef, () => ({
    detailFormReset: handleModelFormQuery, // 表单刷新
  }));
  const handleModelFormQuery = async () => {
    if (modelRadio === 'modelTable') {
      // eslint-disable-next-line no-self-compare
      if (!modelDetail.id || modelDetail.id !== modelDetail.id) return;
      detailFormDataSet?.current?.set('param', { id: modelDetail.id });
    } else {
      // eslint-disable-next-line no-self-compare
      if (!modelDetail.id || modelDetail.id !== modelDetail.id) return;
      detailFormDataSet?.current?.set('param', { id: modelDetail.id });
    }
    const res = await detailFormDataSet.query();
    if (res) {
      runInAction(() => {
        setDataStore('refTableCode', res.refTableCode); // 用于字段新建查询列表
        setDataStore('redundantTableName', res.redundantTableName); // 设置当前扩展表名 用于是否显示扩展表空tab页
        setDataStore('refDataSourceType', res.refDataSourceType); // 数据库名称
        setDataStore('refServiceCode', res.refServiceCode); // 服务名称
        setDataStore('refTableName', res.refTableName); // 引用表名称
      });
    }
  };

  // 切换过来及刷新
  useEffect(() => {
    if (modelRadio === 'modelTable' && !modelDetail.id) {
      return;
    }
    if (modelRadio === 'apiTable' && !modelDetail.id) {
      return;
    }
    // detailFormDataSet.setQueryParameter('modelRadio', modelRadio);
    handleModelFormQuery();
  }, [modelDetail.id, modelDetail.id, modelRadio, redundantTableName]);
  // 查询模型表单

  // 保存
  const modelFormSave = async (): Promise<void> => {
    const val = await detailFormDataSet?.current?.validate();
    if (val) {
      if (modelRadio === 'modelTable') {
        detailFormDataSet?.current?.set('param', { id: modelDetail.id });
        await detailFormDataSet.submit();
        handleMenuQueryList();
        setDataStore('modelDetail.name', detailFormDataSet?.current?.get('name'));
        detailFormDataSet.query();
      } else if (modelRadio === 'apiTable') {
        detailFormDataSet?.current?.set('param', { id: modelDetail.id });
        await detailFormDataSet.submit();
        handleMenuQueryList();
        setDataStore('modelDetail.name', detailFormDataSet?.current?.get('name'));
        detailFormDataSet.query();
      }
    } else {
      notification.error({ message: '错误', description: '校验未通过' });
    }
  };

  // 重置
  const handleReset = (): void => {
    if (modelRadio === 'modelTable') {
      detailFormDataSet?.current?.set('param', { id: modelDetail.id });
      detailFormDataSet.query();
    } else if (modelRadio === 'apiTable') {
      detailFormDataSet?.current?.set('param', { id: modelDetail.id });
      detailFormDataSet.query();
    }
  };

  return (
    <div className={`${styles['global-c7n-fields']} ${styles.form}`}>
      <div className={globalStyles.collapse}>
        <Collapse defaultActiveKey={['1', '2']}>
          <Panel header="物理模型" key="1">
            <Form
              dataSet={detailFormDataSet}
              className={styles.input}
              labelAlign={'left' as LabelAlign}
              // @ts-ignore
              showHelp="tooltip"
            >
              {/* <Select name="dataSourceType" disabled renderer={dataSourceTypeRenderer} /> */}
              {/* <TextField name="refServiceCode" disabled /> */}
              {/* <TextField name="refSchemaName" disabled /> */}
              {/* <TextField name="refTableName" disabled /> */}
              <Output name="dataSourceType" renderer={dataSourceTypeRenderer} />
              <Output
                name="refServiceCode"
                renderer={({ text }) => (
                  <Tooltip placement="top" title={text}>
                    <span>{text}</span>
                  </Tooltip>
                )}
              />
              {modelRadio !== 'apiTable' && [
                <Output
                  name="refSchemaName"
                  renderer={({ text }) => (
                    <Tooltip placement="top" title={text}>
                      <span>{`${text} (${modelManagerStore.storeData.refDataSourceType})`}</span>
                    </Tooltip>
                  )}
                />,
                <Output
                  name="refTableName"
                  renderer={({ text }) => (
                    <Tooltip
                      placement="top"
                      title={`${text} ${modelManagerStore.storeData.refTableCode}`}
                    >
                      <span>{text}</span>
                    </Tooltip>
                  )}
                />,
                // <Output
                //   name="redundantTableName"
                //   renderer={({ text }) => (
                //     <Tooltip placement="top" title={text}>
                //       <span>{text}</span>
                //     </Tooltip>
                //   )}
                // />,
              ]}
              {modelRadio !== 'apiTable' && !perHidden && (
                <Output
                  name="redundantTableName"
                  renderer={({ text }) => (
                    <Tooltip placement="top" title={text}>
                      <span>{text}</span>
                    </Tooltip>
                  )}
                />
              )}
            </Form>
          </Panel>
        </Collapse>
        <Collapse defaultActiveKey={['1', '2']}>
          <Panel header="逻辑模型" key="2">
            <Form
              dataSet={detailFormDataSet}
              labelLayout={'vertical' as LabelLayout}
              className={styles.input}
            >
              <TextField name="name" disabled={perHidden} />
              <TextArea name="description" disabled={perHidden} />
            </Form>
          </Panel>
        </Collapse>
      </div>
      <div className={styles['fields-edit-button']}>
        <Button
          color={'dark' as ButtonColor}
          onClick={handleReset}
          hidden={perHidden || detailFormDataSet.current?.get('type') === 'PREDEFINE'}
          disabled={
            (isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
            modelType === 'PLATFORM_SHARED'
          }
        >
          <Icon
            type="refresh"
            style={{
              marginRight: '8px',
              verticalAlign: 'sub',
            }}
          />
          重置
        </Button>
        {((isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
          modelType === 'PLATFORM_SHARED') || (
          <Button
            color={'primary' as ButtonColor}
            onClick={modelFormSave}
            style={{ float: 'right' }}
            hidden={perHidden || detailFormDataSet.current?.get('type') === 'PREDEFINE'}
          >
            <Icon
              type="save"
              style={{
                marginRight: '8px',
                verticalAlign: 'sub',
              }}
            />
            保存
          </Button>
        )}
      </div>
    </div>
  );
});
