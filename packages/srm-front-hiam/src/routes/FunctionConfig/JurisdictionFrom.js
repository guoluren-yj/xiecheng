/**
 * 功能定义-权限集
 * @date: 2022-05-22
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useCallback, useContext, useMemo } from 'react';
import { DataSet, Lov, Table, ModalProvider, Select, TextField } from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { enableRender, operatorRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import { getResponse, getPlatformVersionApi } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import { Tag, Alert } from 'choerodon-ui';
import { Store } from './store';
import { getPermissionDs, getLovDs } from './store/FunctionDs';
import styles from './index.less';

const { Column } = Table;
const { Option } = Select;

export default formatterCollections({
  code: ['hiam.menuConfig', 'hiam.roleManagement'],
})((props) => {
  const { jurisdictionDs, tenantId, customFlag, level, menuCode, menuName, labelName } = props;
  const { updateEnabledFlag } = useContext(Store);
  const permissionDs = useMemo(() => new DataSet(getPermissionDs(tenantId)), []);
  const lovDs = useMemo(() => new DataSet(getLovDs(tenantId)), []);
  const ModalPro = ModalProvider.useModal();

  const permissionType = useMemo(
    () => ({
      ps: intl.get('hzero.common.button.permissionSet').d('权限集'),
      api: intl.get('hzero.common.button.permissionSet').d('权限集'),
      button: intl.get('hiam.roleManagement.view.message.button').d('按钮'),
      table: intl.get('hiam.roleManagement.view.message.table').d('表格列'),
      formItem: intl.get('hiam.roleManagement.view.message.formItem').d('表单项'),
      formField: intl.get('hiam.roleManagement.view.message.formField').d('表单域'),
    }),
    []
  );

  const getQueryBody = (records, type) => {
    return records.map((record) => record.get(type === 'LOV' ? 'lovCode' : 'code'));
  };

  const assignPermissions = async (dataSet, records, type) => {
    try {
      const path = `menus/${dataSet.getQueryParameter(
        'id'
      )}/permission-set/assign-permissions?permissionType=${type}&tenantId=${tenantId}`;
      const res = await request(`${HZERO_IAM}/hzero/v1/${getPlatformVersionApi(path)}`, {
        method: 'POST',
        body: getQueryBody(records, type),
      });
      if (getResponse(res)) {
        dataSet.query();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // 权限集-权限
  const openPermissionModal = (record) => {
    const name = record.get('name');
    permissionDs.setQueryParameter('id', record.get('id'));
    permissionDs.query();
    ModalPro.open({
      title: intl
        .get('hiam.menuConfig.view.message.title.viewPermissions', { name })
        .d(`“${name}”的权限`),
      drawer: true,
      className: styles['permissions-modal'],
      children: (
        <>
          <Alert
            type="info"
            message={intl
              .get('hiam.menuConfig.view.message.permissionTips', { menu: menuName, label: labelName })
              .d(`"${menuName}"功能使用方为"${labelName}", 请正确维护使用方的接口/值集权限`)}
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSet={permissionDs}
            buttons={[
              <Lov
                dataSet={permissionDs}
                name="permission"
                mode="button"
                clearButton={false}
                icon="playlist_add"
                onBeforeSelect={(records) => assignPermissions(permissionDs, records, 'PERMISSION')}
              >
                {intl.get('hzero.common.button.add').d('新增')}
              </Lov>,
              'delete',
            ]}
          >
            <Column name="code" />
            <Column name="description" width={200} />
            <Column name="path" width={120} />
            <Column name="method" width={80} />
            <Column name="levelMeaning" width={80} />
            <Column name="labelCode" width={120} showHelp="tooltip" />
          </Table>
        </>
      ),
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 权限集-Lov
  const openLovModal = (record) => {
    const name = record.get('name');
    lovDs.setQueryParameter('id', record.get('id'));
    lovDs.query();
    ModalPro.open({
      title: intl.get('hiam.menuConfig.view.message.title.viewLovs', { name }).d(`“${name}”的Lov`),
      drawer: true,
      className: styles['lov-modal'],
      children: (
        <>
          <Alert
            type="info"
            message={intl
              .get('hiam.menuConfig.view.message.permissionTips', { menu: menuName, label: labelName })
              .d(`"${menuName}"功能使用方为"${labelName}", 请正确维护使用方的接口/值集权限`)}
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSet={lovDs}
            buttons={[
              <Lov
                dataSet={lovDs}
                name="lov"
                mode="button"
                clearButton={false}
                icon="playlist_add"
                onBeforeSelect={(records) => assignPermissions(lovDs, records, 'LOV')}
              >
                {intl.get('hzero.common.button.add').d('新增')}
              </Lov>,
              'delete',
            ]}
          >
            <Column name="lovCode" />
            <Column name="lovName" />
            <Column name="lovTypeCode" />
            <Column name="labelCode" width={120} />
            <Column name="tenantName" width={120} showHelp="tooltip" />
          </Table>
        </>
      ),
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 权限集-编辑
  const editJurisdiction = (record) => {
    record.setState('status', 'update');
  };

  // 权限集-保存
  const saveJurisdiction = (record) => {
    const type = record.get('permissionType');
    record.set({
      tenantId,
      customFlag,
      permissionType: type === 'ps' ? 'api' : type,
    });
    jurisdictionDs.setState('menuCode', menuCode);
    jurisdictionDs.submit().then((res) => {
      if (getResponse(res)) {
        record.setState('status', 'sync');
      }
    });
  };

  // 权限集-取消
  const cancelJurisdiction = (record) => {
    if (record.getState('status') === 'add') {
      jurisdictionDs.remove(record);
    } else {
      record.setState('status', 'sync');
    }
  };

  // 权限集-操作按钮
  const renderJurisdictionOpr = useCallback(
    ({ record }) => {
      const status = record.getState('status');
      const edit = status === 'add' || status === 'update';
      const operators = edit
        ? [
            {
              key: 'save',
              ele: (
                <a onClick={() => saveJurisdiction(record)}>
                  {intl.get('hzero.common.button.save').d('保存')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.save').d('保存'),
            },
            {
              key: 'cancel',
              ele: (
                <a onClick={() => cancelJurisdiction(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.cancel').d('取消'),
            },
          ]
        : [
            {
              key: 'edit',
              ele: (
                <a onClick={() => editJurisdiction(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            },
            {
              key: 'disable', // key
              ele: (
                <a onClick={() => updateEnabledFlag(record, jurisdictionDs, tenantId)}>
                  {record.get('enabledFlag')
                    ? intl.get('hzero.common.button.disable').d('禁用')
                    : intl.get('hzero.common.button.enable').d('启用')}
                </a>
              ),
              len: 2,
            },
            {
              key: 'permission', // key
              ele: (
                <a onClick={() => openPermissionModal(record)}>
                  {intl.get('hiam.menuConfig.view.message.title.permissions').d('权限')}
                </a>
              ),
              len: 2,
            },
            {
              key: 'lov', // key
              ele: (
                <a onClick={() => openLovModal(record)}>
                  {intl.get('hiam.menuConfig.view.message.title.lovs').d('Lov')}
                </a>
              ),
              len: 2,
            },
          ];

      return operatorRender(operators, record, {
        limit: 3,
        label: intl.get('hzero.common.button.option').d('更多'),
      });
    },
    [jurisdictionDs, permissionDs, lovDs]
  );

  // 启用/禁用
  const enableRenderer = useCallback(({ value }) => {
    return enableRender(value);
  }, []);

  // 权限集-标签
  const tagRenderer = useCallback(({ value = 'api', record }) => {
    const realValue = value === 'ps' ? 'api' : value;
    const status = record.getState('status');
    const valueList = value.split(',') || [];
    const text = valueList.map((item) => (permissionType[item] ? permissionType[item] : '')) || [];
    if (status === 'add') {
      return (
        <Select defaultValue={realValue} clearButton={false} record={record} name="permissionType">
          <Option value="api">{permissionType.api}</Option>
          <Option value="button">{permissionType.button}</Option>
        </Select>
      );
    }
    return <Tag color={realValue === 'api' ? 'green' : 'orange'}>{text.join()}</Tag>;
  }, []);

  const codeRenderer = useCallback(({ text, name, record }) => {
    if (record.getState('status') === 'add') {
      return (
        <TextField
          name={name}
          record={record}
          addonBefore={`${menuCode}.${record.get('permissionType')}`}
          style={{ height: 30, transform: 'tran' }}
        />
      );
    }
    return text;
  }, []);

  const addEditor = useCallback((record) => {
    return record.getState('status') === 'add';
  }, []);

  const editor = useCallback((record) => {
    const status = record.getState('status');
    return status === 'add' || status === 'update';
  }, []);

  const addJurisdiction = useCallback(
    (record) => {
      record.set({
        $form: {},
        type: 'ps',
        enabledFlag: 1,
        newSubnodeFlag: 1,
        editDetailFlag: 1,
        icon: 'link',
        permissionType: 'api',
        key: uuidv4(),
        level,
        parentId: jurisdictionDs.getQueryParameter('id'),
      });
      record.setState('status', 'add');
    },
    [jurisdictionDs]
  );

  return (
    <Table
      dataSet={jurisdictionDs}
      selectionMode="none"
      rowHeight="auto"
      buttons={[
        [
          'add',
          {
            afterClick: () => addJurisdiction(jurisdictionDs.current),
          },
        ],
      ]}
    >
      <Column name="permissionType" width={130} renderer={tagRenderer} />
      <Column name="code" width={350} renderer={codeRenderer} />
      <Column name="name" editor={editor} width={160} />
      <Column name="sort" editor={editor} width={80} />
      <Column name="controllerType" editor={addEditor} width={150} />
      <Column name="description" editor={editor} width={150} />
      <Column name="enabledFlag" width={80} renderer={enableRenderer} />
      <Column name="action" width={180} renderer={renderJurisdictionOpr} lock="right" />
    </Table>
  );
});
