import React, { useEffect, useMemo } from 'react';
import { Form, Lov, Switch, TextArea, TextField, IntlField } from 'choerodon-ui/pro/lib';
import styles from './index.less';
import { IStore } from '@/routes/ScriptEvent/store';
import constructCreateScriptEventDataSet from '../datasets/constructCreateScriptEventDataSet';

function ModalContent(props: { modal: any; store: IStore; isCreate: boolean }) {
  // on: init //
  const createScriptEventDataSet = useMemo(() => {
    return constructCreateScriptEventDataSet();
  }, []);

  useEffect(() => {
    props.modal.handleOk(async () => {
      const result = await createScriptEventDataSet.validate();
      if (result) {
        await createScriptEventDataSet.current?.set('params', { isCreate: props.isCreate });
        const submitRes = await createScriptEventDataSet.submit();
        if (submitRes && submitRes.success) {
          props.store.queryTableDS();
          props.modal.close();
        }
      }
      return false;
    });
    props.modal.handleCancel(() => {
      props.modal.close();
    });
  }, []);

  // on: update //
  useEffect(() => {
    if (!props.isCreate) {
      const currentDetails = props.store.state.currentSelectedScriptAbstract;

      if (currentDetails) {
        createScriptEventDataSet.loadData([
          {
            id: currentDetails.scriptId,
            scriptName: currentDetails.scriptName,
            code: currentDetails.scriptCode,
            // tenant: currentDetails.tenantName,
            // tenantId: currentDetails.tenantId,
            remark: currentDetails.remark,
            enabled: 1,
          },
        ]);
      }
    }
  }, [props.store.state.currentSelectedScriptAbstract]);

  // on: updates //
  return (
    <div className={styles['modal-create-script-event']}>
      <Form dataSet={createScriptEventDataSet}>
        <TextField name="code" placeholder="请输入" />
        <IntlField name="scriptName" placeholder="请输入" />
        <Lov name="tenant" noCache placeholder="请选择" />
        <TextArea name="remark" placeholder="请输入" />
        <Switch name="enabled" />
      </Form>
    </div>
  );
}

function ModalConfig(props: { store: IStore; isCreate: boolean }) {
  return {
    title: props.isCreate ? '新建脚本事件' : '复制脚本事件',
    okText: '确定',
    children: <ModalContent {...(props as { modal: any; store: IStore; isCreate: boolean })} />,
    okFirst: true,
  };
}

export default ModalConfig;
