import React, { useCallback, useContext, useMemo, useEffect } from 'react';
import Context, { IStore } from '@/routes/ScriptUtility/store';
import intl from 'srm-front-boot/lib/utils/intl';

import { Anchor, Icon } from 'choerodon-ui';
import {
  Button,
  Row,
  Col,
  Form,
  Output,
  Select,
  TextArea,
  Lov,
  Switch,
} from 'choerodon-ui/pro/lib';
import { Content, Header } from 'components/Page';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import styles from './index.less';
import { constructEidtScriptUtilityDataSet } from '@/routes/ScriptUtility/datasets/constructEidtScriptUtilityDataSet';
import ScriptParam from '@/routes/ScriptUtility/FrontPage/Main/Edit/ScriptParam';

const { Link } = Anchor;

export default observer((props: any) => {
  const { history } = props;
  const { store } = useContext<{ store: IStore }>(Context as any);
  const selectedServicePoint: any = store.getState('selectedServicePoint');

  // on: init //
  const eidtScriptUtilityDataSet = useMemo(() => {
    return constructEidtScriptUtilityDataSet();
  }, []);

  const onCancel = useCallback(() => {
    store.setState('currentPage', 'front');
  }, []);

  const handleScriptType = () => {
    const editRecord: any = eidtScriptUtilityDataSet.current;
    if (editRecord.get('script')) {
      editRecord.set('script', null);
    }
  };

  const onSave = useCallback(async () => {
    // 执行脚本
    if (await eidtScriptUtilityDataSet.validate()) {
      const res = await eidtScriptUtilityDataSet.submit();
      if (res?.success) store.setState('currentPage', 'front');
    }
  }, []);

  useEffect(() => {
    if (!selectedServicePoint) return;
    // 基础信息
    eidtScriptUtilityDataSet.create(
      {
        servicePointCode: selectedServicePoint.servicePointCode,
        // serviceName: selectedServicePoint.serviceName,
        serviceName: store.getState('currentServiceName'),
        servicePointId: selectedServicePoint.servicePointId,
      },
      0
    );

    eidtScriptUtilityDataSet.setState('servicePointId', selectedServicePoint.servicePointId);
  }, []);

  return (
    <div className={`script-utility ${styles['edit-page']}`}>
      <Header
        title="新建脚本应用"
        backPath="/hmde/script-utility"
        onBack={() => {
          onCancel();
        }}
      >
        <Button color={ButtonColor.primary} onClick={() => onSave()}>
          <Icon type="save-o" style={{ marginRight: '4px', fontSize: 14 }} />
          保存
        </Button>
      </Header>
      <Content>
        <Row className={styles['edit-content']}>
          <Col span={18}>
            <div className={styles['edit-content-title']} id="edit-base-info">
              基础信息
            </div>
            <Form dataSet={eidtScriptUtilityDataSet} columns={2} useColon={false} labelWidth={94}>
              <Output name="servicePointCode" />
              <Output name="serviceName" />
              <Lov name="tenant" onChange={handleScriptType} />
              <Switch name="enabledFlag" />
              <TextArea name="pointScriptDesc" colSpan={2} />
            </Form>
            <div className={styles['edit-content-title']} id="edit-script">
              执行脚本
            </div>
            <Form dataSet={eidtScriptUtilityDataSet} columns={2} useColon={false} labelWidth={94}>
              <Select name="scriptTypeCode" onChange={handleScriptType} />
              <Lov
                name="script"
                disabled={
                  !(
                    eidtScriptUtilityDataSet.current &&
                    eidtScriptUtilityDataSet.current.get('scriptTypeCode') &&
                    eidtScriptUtilityDataSet.current.get('tenant')?.tenantId
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
                          eidtScriptUtilityDataSet.current.get('scriptTypeCode') &&
                          eidtScriptUtilityDataSet.current.get('tenant')?.tenantId
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
            <div className={styles['edit-content-title']} id="edit-script-params">
              脚本出入参
            </div>
            {eidtScriptUtilityDataSet.current ? (
              <ScriptParam
                scriptCode={eidtScriptUtilityDataSet.current.get('scriptCode')}
                scriptTypeCode={eidtScriptUtilityDataSet.current.get('scriptTypeCode')}
                tenantId={eidtScriptUtilityDataSet.current.get('script')?.tenantId}
              />
            ) : null}
          </Col>
          <Col span={2} />
          <Col span={4}>
            <Anchor className={styles['edit-content-anchor']}>
              <Link href="#edit-base-info" title="基础信息" />
              <Link href="#edit-script" title="执行脚本" />
              <Link href="#edit-script-params" title="脚本出入参" />
            </Anchor>
          </Col>
        </Row>
      </Content>
    </div>
  );
});
