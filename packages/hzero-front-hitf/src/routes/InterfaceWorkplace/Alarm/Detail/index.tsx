import React, { useMemo, useState, useEffect } from 'react';
import { omit } from 'lodash';
import { DataSet, Button, Form, Row, Col, Select, TextField, TextArea, Modal, Spin, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { Header } from 'hzero-front/lib/components/Page';


import {
  getAppDetailFormInfo,
  giveAnAlarmHeader,
} from '@/services/alarmapplicationManageService';

import OperationRecord from '@/components/alarmOperationRecord';
import { detailFormDS, apiTableDS, addApiDS } from './ApplicationManageDS';

import ApiInfo from './ApiInfo';

import styles from './index.less';

const Detail: React.FC<any> = ({ history }) => {
  const flag = window.location.href.includes('create-detail');
  const headerId = window.location.href.split('interface-configuration-workbench/detail/')[1];
  // 详情页form表单
  const formDs = useMemo(() => new DataSet(detailFormDS()), []);
  // api信息表格
  const tableDs = useMemo(() => new DataSet(apiTableDS(headerId)), [headerId]);
  // api信息弹窗
  const addApiDs = useMemo(() => new DataSet(addApiDS(headerId)), [headerId]);

  const [state, setState] = useState({
    authInfo: { externalSystemCode: '', clientId: '' },
    createFlag: true,
    deleteFlag: false,
    publishFlag: false,
    appType: '',
    saveLoading: false,
    dataSource: '',
    selectList: {
      appTypeList: [],
      systemType: [],
      interfaceStatus: [],
      requestMethod: [],
    },
  });


  useEffect(() => {
    setState(preState => ({
      ...preState,
      createFlag: flag,
    }));
    if (!flag) {
      getFormDetail();
    }
  }, []);

  const getFormDetail = () => {
    // 查询表格数据
    tableDs.query();
    // 查询表单数据
    getAppDetailFormInfo(headerId).then(res => {
      const result = getResponse(res);
      const {
        externalSystemCode,
        clientId,
        status,
        applicationTypeCode,
        dataSource,
      } = result;
      formDs.loadData([result]);
      setState(preState => ({
        ...preState,
        deleteFlag: status !== 'NEW',
        publishFlag: status === 'APPROVED',
        authInfo: { externalSystemCode, clientId },
        appType: applicationTypeCode,
        dataSource,
      }));
    }).finally(() => {
        setState(preState => ({
          ...preState,
          saveLoading: false,
        }));
      },
    );
  };

  // 基本信息
  const renderBasicForm = useMemo(() => (
    <Form labelLayout={LabelLayout.float} dataSet={formDs}>
      <Row>
        <Col span={6}>
          <TextField
            name='warnCode'
            restrict='a-zA-Z0-9-_./'
            disabled={headerId !== undefined}
            style={{ width: 'calc(100% - 16px)' }}
          />
        </Col>
        <Col span={6}>
          <TextField
            name='warnName'
            style={{ width: 'calc(100% - 16px)' }}
          />
        </Col>
        <Col span={6}>
          <Select name='status' style={{ width: 'calc(100% - 16px)' }} />
        </Col>
      </Row>
      <Row>
        {
          !flag && (
            <Col span={6}>
              <TextField name='applicationHeaders' disabled style={{ width: 'calc(100% - 16px)' }} />
            </Col>
          )}
        <Col span={6}>
          <TextField name='creationName' disabled style={{ width: 'calc(100% - 16px)' }} />
        </Col>
        <Col span={6}>
          <TextField name='creationDate' disabled style={{ width: 'calc(100% - 16px)' }} />
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <TextArea name='remark' style={{ width: 'calc(100% - 16px)' }} />
        </Col>
      </Row>
    </Form>
  ), [formDs, state.selectList, state.publishFlag]);

  // 回到列表页
  const goBack = () => {
    history.push({
      pathname: '/hitf/interface-configuration-workbench/list',
      state: {
        active: '3',
      },
    });
  };

  // 保存
  const handleSave = async () => {
    const validate = await formDs.validate();
    const inputValidate = await tableDs.validate();
    if (!validate || !inputValidate) {
      return;
    }
    let formValue: any = formDs.toData()[0];
    formValue = omit(formValue, ['tenantLov']);
    const tableValue = tableDs.toData();
    const newCon: any = [];
    // eslint-disable-next-line array-callback-return
    tableValue.map((res: any) => {
      if (res) {
        const {
          email,
        } = res;
        const emailLists = email.split(',');
        const item = {
          ...res,
          emailList: emailLists,
        };
        newCon.push(item);
      }
    });
    const params = {
      status: formValue.status,
      remark: formValue.remark,
      warnCode: formValue.warnCode,
      warnName: formValue.warnName,
      applicationIdList: formValue.applicationIdList,
      // ...formValue,
      openWarnRuleLineList: newCon,
    };
    const updateParams = {
      status: formValue.status,
      warnCode: formValue.warnCode,
      remark: formValue.remark,
      warnName: formValue.warnName,
      applicationIdList: formValue.applicationIdList,
      warnRuleId: headerId,
      openWarnRuleLineList: newCon,
    };
    setState(preState => ({
      ...preState,
      saveLoading: true,
    }));
    if (state.createFlag) {
      giveAnAlarmHeader(params).then(res => {
        const result = getResponse(res);
        if (!result) {
          setState(preState => ({
            ...preState,
            saveLoading: false,
          }));
        } else {
          notification.success({});
          const { warnRuleId } = result;
          if (flag) {
            // 新建保存后，路由更新为带id的地址
            history.push({
              pathname: `/hitf/interface-configuration-workbench/detail/${warnRuleId}`,
            });
          } else {
            // 编辑保存后，重新查询
            getFormDetail();
          }
        }
      });
    } else {
      giveAnAlarmHeader(updateParams).then(res => {
        const result = getResponse(res);
        if (!result) {
          setState(preState => ({
            ...preState,
            saveLoading: false,
          }));
        } else {
          notification.success({});
          const { applicationHeaderId } = result;
          if (flag) {
            // 新建保存后，路由更新为带id的地址
            history.push({
              pathname: `/hitf/interface-configuration-workbench/detail/${applicationHeaderId}`,
            });
          } else {
            // 编辑保存后，重新查询
            getFormDetail();
          }
        }
      });
    }
  };

  // 操作记录
  const getOperationRecord = () => {
    const modal = Modal.open({
      title: intl.get('hzero.common.status.historys').d('操作记录'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <OperationRecord id={headerId} />,
      footer: <Button color={ButtonColor.primary} onClick={closeModal}>{intl.get('hzero.common.btn.close').d('关闭')}</Button>,
      className: 'operation-record-drawer',
      style: { width: 742 },
    });

    function closeModal() {
      modal.close();
    }
  };

  const headerRender = useMemo(() => (
    <Header
      title={
        <>
          <Icon onClick={goBack} type='arrow_back' style={{ marginRight: '5px' }} />
          <span>
            {intl.get('hitf.application.give.an.alarm').d('告警详情')}
          </span>
        </>
      }
    >
      <Button
        icon='save'
        funcType={FuncType.flat}
        onClick={handleSave}
        loading={state.saveLoading}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
      <Button
        icon='wysiwyg'
        funcType={FuncType.flat}
        onClick={getOperationRecord}
        disabled={flag}
      >
        {intl.get('hzero.common.button.record').d('操作记录')}
      </Button>
    </Header>
  ), [flag, state.deleteFlag, state.publishFlag, state.saveLoading]);

  const renderApiInfo = useMemo(() => {
    return (
      <ApiInfo
        selectList={state.selectList}
        tableDs={tableDs}
        addApiDs={tableDs}
        appType={state.appType}
        dataSource={state.dataSource}
        publishFlag={state.publishFlag}
      />

    );
  }, [state.selectList, state.appType, state.dataSource, state.publishFlag, tableDs, addApiDs]);

  return (
    <Spin spinning={state.saveLoading}>
      {headerRender}
      <div className={styles['page-content']}>
        <div className={styles['card-container']}>
          <div className={styles['card-title']}>
            {intl.get('hzero.common.view.title.baseInfo').d('基础信息')}
          </div>
          <div className={styles['card-content']}>
            {renderBasicForm}
          </div>
        </div>
        {headerId ?
          (
            <div className={styles['card-container']}>
              <div className={styles['card-title']}>
                {intl.get('hitf.application.view.title.alarm').d('告警规则')}
              </div>
              <div className={styles['card-content']}>
                {renderApiInfo}
              </div>
            </div>
          )
          : null
        }
      </div>
    </Spin>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(Detail));
