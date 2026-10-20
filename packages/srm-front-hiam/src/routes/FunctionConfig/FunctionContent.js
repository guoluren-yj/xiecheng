/**
 * 功能定义-Content
 * @date: 2022-05-22
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useCallback, useMemo, useContext } from 'react';
import { DataSet, Table, ModalProvider } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import { enableRender, operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import { copyMenu } from '@/services/menuConfigService';
import { getJurisdictionDs, getCopyMenuDs } from './store/FunctionDs';
import { tenant } from '../MenuGroup/SrmMenuGroup';
import { Store } from './store';
import FunctionForm from './FunctionForm';
import JurisdictionFrom from './JurisdictionFrom';
import styles from './index.less';

const tenantRoleLevel = isTenantRoleLevel();
function FunctionContent() {
  const {
    activeTabKey,
    activeMenus,
    functionContentDs: dataSet,
    updateEnabledFlag,
    getLevel,
    labelMap,
  } = useContext(Store);
  const ModalPro = ModalProvider.useModal();
  const jurisdictionDs = useMemo(() => new DataSet(getJurisdictionDs()), []);
  const copyMenuDs = useMemo(() => new DataSet(getCopyMenuDs()), []);

  const onSave = async (isCopy, record) => {
    if (isCopy) {
      if (await record.validate()) {
        const upperCase = getLevel(activeTabKey).toUpperCase();
        const rootMenu = record.toJSONData();
        const res = await copyMenu({
          level: upperCase,
          organizationId: rootMenu.tenantId,
          data: {
            level: upperCase,
            rootMenu: { ...rootMenu },
            copyMenuIds: copyMenuDs.selected.map((item) => item.get('id')) || [],
            sourceTenantId: rootMenu.sourceTenantId,
          },
        });
        if (res && res.failed) {
          notification.error({
            message: res.message,
          });
          return false;
        }
        notification.success();
        dataSet.query();
        return true;
      }
      return false;
    }
    const res = await dataSet.submit();
    if (getResponse(res)) {
      dataSet.query();
    }
    return res;
  };

  const updateLabelCodeFields = (type, required) => {
    if (required && (type === 'copyAndCreate' || type === 'add')) {
      dataSet.getField('labelCode').set('required', true);
    } else {
      dataSet.getField('labelCode').set('required', false);
    }

    dataSet.getField('level').set('required', required);
  };

  // 功能-删除
  const deleteMenu = (record) => {
    dataSet.delete(record);
  };

  // 启用/禁用
  const enableRenderer = useCallback(({ value }) => {
    return enableRender(value);
  }, []);

  // 权限集-编辑
  const editJurisdiction = (record) => {
    const id = record.get('id');
    const name = record.get('name') || '';
    const tenantId = record.get('tenantId');
    const customFlag = record.get('customFlag') || 0;
    const menuCode = record.get('code');
    const labelCode = record.get('labelCode');
    const labelName = labelMap[labelCode] || '';
    jurisdictionDs.setQueryParameter('id', id);
    jurisdictionDs.setQueryParameter('tenantId', tenantId);
    jurisdictionDs.query();
    ModalPro.open({
      title: intl
        .get('hiam.menuConfig.view.message.title.permissionName', { name })
        .d(`"${name}"的权限集`),
      drawer: true,
      className: styles['jurisdiction-modal'],
      children: (
        <JurisdictionFrom
          jurisdictionDs={jurisdictionDs}
          tenantId={tenantId}
          customFlag={customFlag}
          level={getLevel(activeTabKey)}
          menuCode={menuCode}
          menuName={name}
          labelName={labelName}
        />
      ),
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 功能-弹窗(新建/编辑/复制)
  const openModal = (type, record, title) => {
    const isTenantLevel = activeTabKey === tenant;
    const isCopy = type === 'copyAndCreate';
    const level = getLevel(activeTabKey);
    if (type === 'add') {
      record.set({
        level,
      });
    }
    if (isCopy) {
      copyMenuDs.setQueryParameter('data', {
        level: level.toUpperCase(),
        rootMenuId: record.get('id'),
      });
      copyMenuDs.query();
    }
    updateLabelCodeFields(type, isTenantLevel);
    ModalPro.open({
      title,
      drawer: true,
      drawerBorder: false,
      style: { width: isCopy ? 620 : 520 },
      children: (
        <FunctionForm
          type={type}
          record={record}
          isTenantRoleLevel={isTenantLevel}
          copyMenuDs={copyMenuDs}
        />
      ),
      onOk: () => onSave(isCopy, record),
      onCancel: () => {
        dataSet.reset();
      },
    });
  };

  // 功能-name
  const renderName = useCallback(
    ({ record, value }) => {
      return (
        <a
          onClick={() => openModal('edit', record, intl.get('hzero.common.button.edit').d('编辑'))}
        >
          {value}
        </a>
      );
    },
    [dataSet, activeMenus, activeTabKey]
  );

  // 功能-操作按钮
  const renderOpr = useCallback(
    ({ record }) => {
      const enabledFlag = record.get('enabledFlag');
      const operators = [
        {
          key: 'jurisdiction', // key
          ele: (
            <a onClick={() => editJurisdiction(record)}>
              {intl.get('hiam.menuConfig.view.message.title.permissionSet').d('权限集')}
            </a>
          ), // 操作栏的按钮
          len: 3,
          title: intl.get('hiam.menuConfig.view.message.title.permissionSet').d('权限集'),
        },
        {
          key: 'copy', // key
          ele: (
            <a
              onClick={() =>
                openModal(
                  'copyAndCreate',
                  dataSet.create(
                    {
                      ...record.toData(),
                      code: '',
                      currentId: record.get('id'),
                      sourceTenantId: record.get('tenantId'),
                    },
                    0
                  ),
                  intl.get('hiam.menuConfig.view.message.title.copyCreate').d('复制并创建')
                )
              }
            >
              {intl.get(`hzero.common.button.copy`).d('复制')}
            </a>
          ), // 操作栏的按钮
          len: 2,
          title: intl.get(`hzero.common.button.copy`).d('复制'),
        },
        enabledFlag === 1 && {
          key: 'disable', // key
          ele: (
            <a onClick={() => updateEnabledFlag(record, dataSet, record.get('tenantId'))}>
              {intl.get(`hzero.common.status.disable`).d('禁用')}
            </a>
          ), // 操作栏的按钮
          len: 2,
          title: intl.get(`hzero.common.status.disable`).d('禁用'),
        },
        enabledFlag === 0 && {
          key: 'enabled', // key
          ele: (
            <a onClick={() => updateEnabledFlag(record, dataSet, record.get('tenantId'))}>
              {intl.get(`hzero.common.status.enable`).d('启用')}
            </a>
          ), // 操作栏的按钮
          len: 2,
          title: intl.get(`hzero.common.status.enable`).d('启用'),
        },
        !record.get('enabledFlag') &&
          ((tenantRoleLevel && record.get('customFlag') === 1) || !tenantRoleLevel) && {
            key: 'delete', // key
            ele: (
              <a onClick={() => deleteMenu(record)}>
                {intl.get('hzero.common.status.delete').d('删除')}
              </a>
            ), // 操作栏的按钮
            len: 2,
            title: intl.get('hzero.common.status.delete').d('删除'),
          },
      ];
      return operatorRender(operators, record, {
        limit: 3,
        label: intl.get('hzero.common.button.option').d('更多'),
      });
    },
    [dataSet, activeMenus, activeTabKey, copyMenuDs]
  );

  // 功能-列表信息
  const columns = useMemo(() => {
    return [
      { name: 'name', tooltip: 'overflow', renderer: renderName },
      { name: 'menuGroupName', tooltip: 'overflow' },
      { name: 'code', tooltip: 'overflow' },
      { name: 'description', tooltip: 'overflow' },
      { name: 'enabledFlag', tooltip: 'overflow', renderer: enableRenderer },
      { name: 'action', width: 180, renderer: renderOpr, lock: 'right' },
    ];
  }, [dataSet]);

  if (!dataSet) {
    return <div className={styles['function-content']} />;
  }

  return (
    <div className={styles['function-content']}>
      <Table
        dataSet={dataSet}
        selectionMode="none"
        buttons={[
          [
            'add',
            {
              afterClick: () =>
                openModal('add', dataSet.current, intl.get('hzero.common.button.create').d('新建')),
            },
          ],
        ]}
        columns={columns}
      />
    </div>
  );
}

export default formatterCollections({
  code: ['hiam.menuConfig', 'hptl.portalAssign', 'hiam.tenantMenu'],
})(FunctionContent);
