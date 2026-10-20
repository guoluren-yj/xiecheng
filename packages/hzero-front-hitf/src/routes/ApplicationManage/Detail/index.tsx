import React, { useMemo, useState, useEffect } from 'react';
import { omit } from 'lodash';
import { DataSet, Button, Form, Row, Col, Select, TextField, TextArea, Lov, Modal, Spin } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import intl from 'hzero-front/lib/utils/intl';
import { getResponse, isTenantRoleLevel, getCurrentTenant } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { Header } from 'hzero-front/lib/components/Page';

import { detailFormDS, apiTableDS, addApiDS } from '@/stores/ApplicationManage/ApplicationManageDS';
import {
  getAppDetailFormInfo,
  saveApplication,
  publishApplication,
  deleteApplication,
} from '@/services/applicationManageService';
import OperationRecord from '@/components/OperationRecord';
import ApiInfo from './ApiInfo';

import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();

const Detail: React.FC<any> = ({ history }) => {
  const flag = window.location.href.includes('create-detail');
  const headerId = window.location.href.split('application-manage/detail/')[1];
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
    updateFlag: false,
    ebTenantFlag: false,
    appType: '',
    tenantId: '',
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
    } else if (isTenant && formDs.current) {
      // 租户下的新建，租户默认设置为当前租户
      const tenantInfo = getCurrentTenant();
      formDs.current.set('tenantLov', tenantInfo);
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
        tenantId,
        dataSource,
      } = result;
      formDs.loadData([result]);
      setState(preState => ({
        ...preState,
        deleteFlag: status !== 'NEW',
        publishFlag: status === 'APPROVED',
        updateFlag: status === 'UPDATE',
        ebTenantFlag: status === 'UPDATE' || status === 'APPROVING' || status === 'APPROVED',
        authInfo: { externalSystemCode, clientId },
        appType: applicationTypeCode,
        tenantId,
        dataSource,
      }));
    }).finally(() => {
      setState(preState => ({
        ...preState,
        saveLoading: false,
      }));
    }
    );
  };

  // 应用类型
  const changeAppType = (value) => {
    setState(preState => ({
      ...preState,
      appType: value || '',
      tenantId: formDs.current ? formDs.current.get('tenantId') : null,
    }));
  };

  // 基本信息
  const renderBasicForm = useMemo(() => (
    <Form labelLayout={LabelLayout.float} dataSet={formDs}>
      <Row>
        <Col span={6}>
          <TextField name="applicationCode" disabled style={{ width: 'calc(100% - 16px)' }} />
        </Col>
        <Col span={6}>
          <TextField name="applicationName" style={{ width: 'calc(100% - 16px)' }} />
        </Col>
        <Col span={6}>
          <TextField name="statusMeaning" disabled style={{ width: 'calc(100% - 16px)' }} />
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <Lov name="tenantLov" style={{ width: 'calc(100% - 16px)' }} disabled={state.publishFlag || state.updateFlag || isTenant} />
        </Col>
        <Col span={6}>
          <Select
            name="applicationTypeCode"
            style={{ width: 'calc(100% - 16px)' }}
            disabled={state.publishFlag || !flag}
            onChange={changeAppType}
          />
        </Col>
        <Col span={6}>
          <TextField name="dataSourceMeaning" disabled style={{ width: 'calc(100% - 16px)' }} />
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          {
            state.appType === 'EB_PUNCHOUT' || state.appType === 'EB_API' ?
              (<Lov name="ebTypeLov" disabled={state.ebTenantFlag} style={{ width: 'calc(100% - 16px)' }} />) :
              (<Select name="systemTypeCode" style={{ width: 'calc(100% - 16px)' }} />)
          }
        </Col>
        <Col span={6}>
          <TextField name="creationName" disabled style={{ width: 'calc(100% - 16px)' }} />
        </Col>
        <Col span={6}>
          <TextField name="creationDate" disabled style={{ width: 'calc(100% - 16px)' }} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <TextArea name="comments" style={{ width: 'calc(100% - 16px)' }} />
        </Col>
      </Row>
    </Form>
  ), [formDs, state.selectList, state.publishFlag, state.updateFlag, state.appType, state.ebTenantFlag]);

  // 授权信息
  const renderAuthorizeForm = useMemo(() => (
    <Row>
      {!(state.appType === 'EB_PUNCHOUT' || state.appType === 'EB_API') && (
        <Col span={6}>
          <div className={styles['field-name']}>
            {intl.get('hitf.application.view.externalSystemCode').d('外部系统编码')}
          </div>
          <div
            className={styles['field-value']}
          >
            {state.authInfo.externalSystemCode}
          </div>
        </Col>
      )}
      <Col span={6}>
        <div className={styles['field-name']}>
          {intl.get('hitf.application.model.application.clientId').d('客户端ID')}
        </div>
        <div
          className={styles['field-value']}
        >
          {state.authInfo.clientId}
        </div>
      </Col>
    </Row>
  ), [state.authInfo, state.appType]);

  // 回到列表页
  const goBack = () => {
    if (isTenant) {
      // 租户级，回到接口配置工作台
      history.push({
        pathname: `/hitf/interface-configuration-workbench/list`,
        state: {
          active: 'appManage',
        },
      });
    } else {
      history.push({
        pathname: `/hitf/application-manage/list`,
      });
    }
  };

  // 发布
  const handlePublish = () => {
    // tableDs.length  record.length--待修改
    if (tableDs.toData().length === 0) {
      notification.warning({
        message: intl.get('hitf.common.publish.warning').d('请先添加API信息'),
      });
      return;
    }
    publishApplication(headerId).then(res => {
      const result = getResponse(res);
      if (result) {
        notification.success({});
        goBack();
      }
    });
  };

  // 保存
  const handleSave = async () => {
    const validate = await formDs.validate();
    if (!validate) {
      return;
    }
    // formDs.current-待修改
    let formValue: any = formDs.toData()[0];
    formValue = omit(formValue, ['tenantLov', 'ebTypeLov']);
    const tableRecords: { [x: string]: any } = tableDs.toData();
    const params = {
      ...formValue,
      applicationLineList: tableRecords,
    };
    setState(preState => ({
      ...preState,
      saveLoading: true,
    }));
    saveApplication(params).then(res => {
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
            pathname: `/hitf${isTenant ? '/interface-configuration-workbench' : ''}/application-manage/detail/${applicationHeaderId}`,
          });
        } else {
          // 编辑保存后，重新查询
          getFormDetail();
        }
      }
    });
  };

  // 删除
  // function callback-待修改
  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      maskClosable: true,
      destroyOnClose: true,
      children: <div>{intl.get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm').d('确认删除吗')}</div>,
      onOk: handleConfirmDelete,
    });
    function handleConfirmDelete() {
      deleteApplication(headerId).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success({});
          goBack();
        }
      });
    }
  };

  // 操作记录
  const getOperationRecord = () => {
    Modal.open({
      title: intl.get('hzero.common.status.historys').d('操作记录'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <OperationRecord id={headerId} />,
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelButton: false,
      className: styles['operation-record-drawer'],
    });
  };

  const headerRender = useMemo(() => (
    <Header
      backPath='/hitf/application-manage/list'
      customBack={goBack}
      title={
        <span>
          {intl.get('hitf.application.view.title.editor.edit').d('编辑应用')}
        </span>
      }
    >
      <Button
        icon="near_me"
        color={ButtonColor.primary}
        disabled={flag || state.publishFlag}
        onClick={handlePublish}
      >
        {intl.get('hzero.common.button.publish').d('发布')}
      </Button>
      <Button
        icon="save"
        funcType={FuncType.flat}
        onClick={handleSave}
        loading={state.saveLoading}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
      <Button
        icon="delete"
        funcType={FuncType.flat}
        disabled={flag || state.deleteFlag || state.publishFlag}
        onClick={handleDelete}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
      <Button
        icon="wysiwyg"
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
        addApiDs={addApiDs}
        appType={state.appType}
        tenantId={state.tenantId}
        dataSource={state.dataSource}
        history={history}
        id={headerId}
      />
    );
  }, [state.selectList, state.appType, state.tenantId, state.dataSource, tableDs, addApiDs, headerId]);

  return (
    <div className={styles['app-detail']}>
      <Spin spinning={state.saveLoading}>
        {headerRender}
        <div className={styles['page-content']}>
          <div className={styles['card-container']}>
            <div className={styles['card-title']}>
              {intl.get('hzero.common.view.title.baseInfo').d('基本信息')}
            </div>
            <div className={styles['card-content']}>
              {renderBasicForm}
            </div>
          </div>
          {!state.createFlag && (
            <div className={styles['card-container']}>
              <div className={styles['card-title']}>
                {intl.get('hitf.application.view.title.authInfo').d('授权信息')}
              </div>
              <div className={styles['card-content']}>
                {renderAuthorizeForm}
              </div>
            </div>
          )}
          <div className={styles['card-container']}>
            <div className={styles['card-title']}>
              {intl.get('hitf.application.view.title.apiInfo').d('API信息')}
            </div>
            <div className={styles['card-content']}>
              {renderApiInfo}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(Detail));
