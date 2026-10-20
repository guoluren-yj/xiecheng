/**
 * 编辑
 */
import React, { useContext, useEffect, useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { Header } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { message } from 'choerodon-ui';
import {
  Button,
  Form,
  Output,
  Select,
  TextArea,
  Lov,
  Switch,
  Modal,
  Icon,
} from 'choerodon-ui/pro/lib';
import Context, { IStore } from '@/routes/ScriptUtility/store';
import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { deleteScriptUtilityService } from '@/services/scriptUtilityService';
import { constructEidtScriptUtilityDataSet } from '@/routes/ScriptUtility/datasets/constructEidtScriptUtilityDataSet';
import { handleHistory } from '@/routes/ScriptUtility/FrontPage/Main/Card';
import ScriptParam from '@/routes/ScriptUtility/FrontPage/Main/Edit/ScriptParam';
import styles from '../index.less';

export default observer((props: any) => {
  const { history } = props;
  const { store } = useContext<{ store: IStore }>(Context as any);
  const selectedServicePoint: any = store.getState('selectedServicePoint');

  // on: init //
  const eidtScriptUtilityDataSet = useMemo(() => {
    return constructEidtScriptUtilityDataSet();
  }, []);

  useEffect(() => {
    const scriptUtilityInfo: any = store.getState('scriptUtilityInfo');

    // 执行脚本
    eidtScriptUtilityDataSet.setQueryParameter('pointScriptId', scriptUtilityInfo.pointScriptId);
    eidtScriptUtilityDataSet.setState('servicePointId', selectedServicePoint.servicePointId);
    eidtScriptUtilityDataSet.query().then((res) => {
      if (eidtScriptUtilityDataSet.current) {
        if (res && !res.failed) {
          // eslint-disable-next-line no-unused-expressions
          eidtScriptUtilityDataSet.current?.set('script', {
            scriptCode: res.scriptCode,
            scriptName: res.scriptName,
            tenantId: res.scriptTenantId,
            scriptCurrentVersion: res?.scriptCurrentVersion,
          });
        }
        eidtScriptUtilityDataSet.current.set(
          'servicePointCode',
          selectedServicePoint.servicePointCode
        );
        // eidtScriptUtilityDataSet.current.set('serviceName', selectedServicePoint.serviceName);
        eidtScriptUtilityDataSet.current.set('serviceName', store.getState('currentServiceName'));
        eidtScriptUtilityDataSet.current.set('servicePointId', selectedServicePoint.servicePointId);
        eidtScriptUtilityDataSet.current.set('tenant', {
          tenantId: scriptUtilityInfo.tenantId,
          tenantName: scriptUtilityInfo.tenantName,
        });
      }
    });
  }, [store.state.scriptUtilityInfo]);

  const handleScriptType = () => {
    const editRecord: any = eidtScriptUtilityDataSet.current;
    if (editRecord.get('script')) {
      editRecord.set('script', null);
    }
  };

  // 删除
  const handleDelete = async () => {
    const scriptUtilityInfo: any = store.getState('scriptUtilityInfo');
    const res = await request(deleteScriptUtilityService.url, {
      method: deleteScriptUtilityService.method,
      body: {
        pointScriptId: scriptUtilityInfo.pointScriptId,
        _token: scriptUtilityInfo._token,
        servicePointId: selectedServicePoint.servicePointId,
        tenantId: eidtScriptUtilityDataSet.current?.get('tenant')?.tenantId,
      },
    });

    if (getResponse(res)) {
      message.success('删除成功');
      store.setState('mainPage', 'detail');
    }
  };

  const handleSave = async () => {
    if (await eidtScriptUtilityDataSet.validate()) {
      const res = await eidtScriptUtilityDataSet.submit();
      if (res?.success) store.setState('mainPage', 'detail');
    }
  };

  // render //
  return (
    <div className={styles.edit}>
      <Header
        title="编辑脚本应用"
        backPath="/hmde/script-utility"
        onBack={() => store.setState('mainPage', 'detail')}
      >
        <div className={styles.operations}>
          <span style={{ fontSize: 14 }}>启用</span>
          <Switch
            dataSet={eidtScriptUtilityDataSet}
            name="enabledFlag"
            className={styles['edit-switch']}
          />
          <Button
            icon="delete"
            onClick={() => {
              Modal.confirm({
                title: '是否确认删除该条数据?',
              }).then((button) => {
                if (button === 'ok') handleDelete();
              });
            }}
          >
            {intl.get('hmde.script.utility.button.publish').d('删除')}
          </Button>
          <Button
            icon="schedule"
            onClick={() => {
              const scriptUtilityInfo: any = store.getState('scriptUtilityInfo');
              handleHistory({
                ...scriptUtilityInfo,
                servicePointCode: eidtScriptUtilityDataSet.current?.get('servicePointCode'),
                tenantName: eidtScriptUtilityDataSet.current?.get('tenant').tenantName,
              });
            }}
          >
            {intl.get('hmde.script.utility.button.publish').d('历史记录')}
          </Button>
          <Button icon="save" onClick={handleSave}>
            {intl.get('hmde.script.utility.button.publish').d('保存')}
          </Button>
        </div>
      </Header>
      <div className={styles.content}>
        <div className={styles['edit-content-title']}>基础信息</div>
        <Form dataSet={eidtScriptUtilityDataSet} columns={3} useColon={false} labelWidth={94}>
          <Output name="servicePointCode" />
          <Output name="serviceName" />
          <Lov name="tenant" disabled />
          <TextArea name="pointScriptDesc" colSpan={2} />
        </Form>
        <div className={styles['edit-content-title']}>执行脚本</div>
        <Form dataSet={eidtScriptUtilityDataSet} columns={2} useColon={false} labelWidth={94}>
          <Select name="scriptTypeCode" onChange={handleScriptType} />
          <Lov
            name="script"
            disabled={
              !(
                eidtScriptUtilityDataSet.current &&
                eidtScriptUtilityDataSet.current.get('scriptTypeCode')
              )
            }
          />
          <Output
            colSpan={2}
            renderer={() => {
              return (
                <Button
                  onClick={() => {
                    if (eidtScriptUtilityDataSet?.current?.get('scriptTypeCode') === 'FLOW') {
                      history.push('/hmde/definition');
                    } else {
                      history.push('/hmde/script-event');
                    }
                  }}
                  disabled={
                    !(
                      eidtScriptUtilityDataSet.current &&
                      eidtScriptUtilityDataSet.current.get('scriptTypeCode')
                    )
                  }
                  style={{ display: 'flex', border: 'none', float: 'right' }}
                >
                  <Icon style={{ fontSize: 16 }} type="add" />
                  <span>
                    {intl
                      .get('hmde.script.utility.button.newCreate')
                      .d('没有需要的脚本？点击去新建')}
                  </span>
                </Button>
              );
            }}
          />
          {eidtScriptUtilityDataSet?.current?.get('scriptCode') ? (
            <>
              <Output name="scriptCode" />
              {eidtScriptUtilityDataSet?.current?.get('scriptTypeCode') === 'FLOW' && (
                <Output name="scriptCurrentVersion" />
              )}
              <Output name="scriptRemark" colSpan={2} />
            </>
          ) : null}
        </Form>
        <div className={styles['edit-content-title']}>脚本出入参</div>
        {eidtScriptUtilityDataSet.current ? (
          <ScriptParam
            scriptCode={eidtScriptUtilityDataSet.current.get('scriptCode')}
            scriptTypeCode={eidtScriptUtilityDataSet.current.get('scriptTypeCode')}
            tenantId={eidtScriptUtilityDataSet.current.get('script')?.tenantId}
          />
        ) : null}
      </div>
    </div>
  );
});
