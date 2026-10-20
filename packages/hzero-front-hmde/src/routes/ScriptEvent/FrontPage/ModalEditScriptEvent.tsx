import React, { useEffect, useMemo } from 'react';
import { Form, Output, Switch, TextArea, IntlField } from 'choerodon-ui/pro/lib';
import styles from './index.less';
import { IStore } from '@/routes/ScriptEvent/store';
import constructEditScriptEventDataSet from '../datasets/constructEditScriptEventDataSet';

function ModalContent(props: { modal: any; store: IStore }) {
  // on: init //
  const editScriptEventDataSet = useMemo(() => {
    return constructEditScriptEventDataSet();
  }, []);

  useEffect(() => {
    props.modal.handleOk(async () => {
      const res = await editScriptEventDataSet.validate();
      if (res) {
        editScriptEventDataSet.submit().then(() => {
          props.store.queryTableDS();
        });
        return true;
      } else {
        return false;
      }
    });
    props.modal.handleCancel(() => {
      props.modal.close();
    });
  }, []);

  // on: update //
  useEffect(() => {
    const currentDetails = props.store.state.currentSelectedScriptAbstract;

    if (currentDetails) {
      editScriptEventDataSet.loadData([
        {
          scriptName: currentDetails.scriptName,
          code: currentDetails.scriptCode,
          id: currentDetails.scriptId,
          tenant: currentDetails.tenantName,
          tenantId: currentDetails.tenantId,
          remark: currentDetails.remark,
          enabled: currentDetails.enabledFlag,
          _token: currentDetails._token,
          objectVersionNumber: currentDetails.objectVersionNumber,
        },
      ]);
    }
  }, [props.store.state.currentSelectedScriptAbstract]);

  return (
    <div className={styles['modal-create-script-event']}>
      <Form dataSet={editScriptEventDataSet}>
        <IntlField name="scriptName" />
        <Output name="code" />
        <TextArea name="remark" />
        <Output name="tenant" />
        <Switch name="enabled" />
      </Form>
    </div>
  );
}

function ModalConfig(props: { store: IStore }) {
  return {
    title: '编辑脚本事件',
    okText: '确定',
    children: <ModalContent {...(props as { modal: any; store: IStore })} />,
    okFirst: true,
    drawer: true,
  };
}

export default ModalConfig;
