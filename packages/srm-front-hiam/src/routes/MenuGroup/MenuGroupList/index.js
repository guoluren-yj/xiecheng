/**
 * 菜单组配置-租户
 * @date: 2022-05-25
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useCallback, useMemo, memo, useEffect, useState } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Table, Button, Modal, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import pull from 'lodash/pull';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  isTenantRoleLevel,
  getPlatformVersionApi,
  getResponse,
  getCurrentOrganizationId,
  getCurrentRole,
  getCurrentUser,
} from 'utils/utils';
import request from 'utils/request';
import { Tag } from 'choerodon-ui';
import FilterBarTable from '_components/FilterBarTable';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import { getMenuDs, _SITE, getChildren } from '../store';
import EditMenuGroup from './EditMenuGroup';
import styles from '../index.less';

const { id } = getCurrentRole();
const { loginName } = getCurrentUser();
const { Item: MenuItem } = Menu;

export const getCodePrefix = (fdLevel, tenantId) => {
  return `${fdLevel === 'site' ? 'site.' : tenantId === '0' ? 'sta.' : 'cus.'}`;
};

const MenuGroupList = (props) => {
  const {
    groupCode = null,
    groupName = undefined,
    tenantId = getCurrentOrganizationId(),
    fdLevel = 'organization',
  } = props;
  const [expandKeys, setExpandKeys] = useState([]);
  const [pageStatus] = useState(isTenantRoleLevel() || (groupCode && tenantId));
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    const { dispatch } = props;
    if (!pageStatus) {
      dispatch(routerRedux.replace({ pathname: '/hiam/menu-group' }));
    }
    // srm平台级-目录组，是这个菜单组编码才查询
    if (tenantId === '0' && groupCode === 'SRM-default-function-group-new') {
      request(`${HZERO_PLATFORM}/v1/profile-value`, {
        method: 'GET',
        query: {
          roleId: id,
          profileName: 'HIAM_MENUGROUP_DETAIL_ACTION',
        },
        responseType: 'text',
      }).then((res) => {
        runInAction(() => {
          // 已配置的才有操作权限
          if (res) {
            const value = res.split(',');
            setPermission(Boolean(value.includes(loginName)));
          } else {
            setPermission(false);
          }
        });
      });
    } else {
      setPermission(true);
    }
  }, []);

  const dataSet = useMemo(() => {
    if (pageStatus) {
      return new DataSet(getMenuDs(groupCode, tenantId, fdLevel));
    }
  }, []);

  useEffect(() => {
    if (dataSet) {
      dataSet.addEventListener('load', initData);

      return () => {
        dataSet.removeEventListener('load', initData);
      };
    }
  }, [dataSet, expandKeys]);

  const initData = ({ dataSet: ds }) => {
    if (expandKeys.length) {
      runInAction(() => {
        ds.records.forEach((record) => {
          if (expandKeys.includes(record.get('code'))) {
            record.set('expand', true);
          }
        });
      });
    }
  };

  const onExpand = (expanded, record) => {
    const code = record.get('code');
    if (expanded) {
      setExpandKeys((pre) => [...pre, code]);
      dataSet.setState('expandAll', false);
    } else {
      setExpandKeys(pull(expandKeys, code));
      dataSet.setState('expandAll', true);
    }
  };

  const onExpandAll = () => {
    if (!dataSet.getState('expandAll')) {
      runInAction(() => {
        setExpandKeys([
          ...new Set(
            dataSet.map((record) => {
              record.set('expand', true);
              return record.get('code');
            })
          ),
        ]);
        dataSet.setState('expandAll', true);
      });
    }
  };

  const onCollapseAll = () => {
    if (dataSet.getState('expandAll')) {
      runInAction(() => {
        dataSet.forEach((record) => {
          record.set('expand', false);
        });
        setExpandKeys([]);
        dataSet.setState('expandAll', false);
      });
    }
  };

  const getQueryParams = () => {
    return isTenantRoleLevel() ? { tenantId } : { tenantId, groupCode };
  };

  // 移动菜单
  const moveMenu = (record, type) => {
    const targetRecord = type === 'up' ? record.previousRecord : record.nextRecord;
    if (targetRecord && targetRecord.get('parentId') === record.get('parentId')) {
      try {
        request(`${HZERO_IAM}/v1/${getPlatformVersionApi(`function/${_SITE}move`)}`, {
          method: 'POST',
          query: getQueryParams(),
          body: {
            code: record.get('code'),
            objectVersionNumber: record.get('objectVersionNumber'),
            targetFunctionCode: targetRecord.get('code'),
            targetFunctionVersion: targetRecord.get('objectVersionNumber'),
          },
        }).then((res) => {
          if (getResponse(res)) {
            dataSet.query();
          }
        });
      } catch (error) {
        return false;
      }
    }
  };

  // 启用/禁用 菜单
  const enabledMenu = (record, type) => {
    const currentData = record.toJSONData();
    try {
      request(`${HZERO_IAM}/v1/${getPlatformVersionApi(`function/toggle-status`)}`, {
        method: 'POST',
        query: getQueryParams(),
        body: {
          ...currentData,
          enabledFlag: type === 'enabled' ? 1 : 0,
        },
      }).then((res) => {
        if (getResponse(res)) {
          dataSet.query();
        }
      });
    } catch (error) {
      return false;
    }
  };

  // 删除菜单
  const deleteMenu = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        record.set({ groupCode, tenantId });
        dataSet.delete(record, false);
      },
    });
  };

  // 获取当前record
  const getEditRecord = (isNew, isRoot, type, parentRecord, readOnly) => {
    const data = { type, tenantId: readOnly ? parentRecord.get('tenantId') : tenantId, groupCode };
    let record = parentRecord;
    if (isNew) {
      if (isRoot) {
        record = dataSet.create({ ...data, parentCode: '' });
      } else {
        record = dataSet.create({
          ...data,
          parentName: parentRecord.get('name'),
          parentCode: parentRecord.get('code'),
          targetFunctionVersion: parentRecord.get('objectVersionNumber'),
        });
      }
    } else if (isRoot && type === 'dir') {
      record.set({ ...data, parentCode: '' });
      // record.status = 'sync';
    } else {
      const parentData = isRoot
        ? {
          parentCode: undefined,
        }
        : {
          parentName: record.parent?.get('name'),
          parentCode: record.parent?.get('code'),
          targetFunctionVersion: record.parent?.get('objectVersionNumber'),
        };
      const menuData =
        type === 'menu'
          ? {
            menuCodeObject: {
              ...record.get('menuCodeObject'),
              menuName: record.get('menuName'),
            },
          }
          : {};
      record.set({
        ...data,
        ...parentData,
        // ...menuData,
      });
      record.init({ ...menuData });
      // record.status = 'sync';
    }

    return record;
  };

  const updateRecord = async (record) => {
    if (record.status !== 'update') {
      return true;
    }
    try {
      const { childFunctions, ...body } = record.toJSONData();
      body.childFunctionVersions = getChildren(childFunctions);
      const res = await request(
        `${HZERO_IAM}/v1/${getPlatformVersionApi(`function/${_SITE}edit`)}`,
        {
          method: 'POST',
          query: getQueryParams(),
          body,
        }
      );
      if (getResponse(res)) {
        dataSet.query();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  /**
   * @function openMenuModal 新建/编辑弹窗
   * @param {isNew} - 是否为新建
   * @param {isRoot} - 是否为根节点
   * @param {type} - 类型：目录/菜单
   * @param {parentRecord} - 当前节点record
   */
  const openMenuModal = (isNew = true, isRoot = true, type = 'dir', parentRecord) => {
    const record = getEditRecord(isNew, isRoot, type, parentRecord);
    const dirOrMenuNew = {
      menu: intl.get(`hiam.menuConfig.modal.menu.add`).d('新建菜单'),
      dir: intl.get(`hiam.menuConfig.modal.dir.add`).d('新建目录'),
    };
    const dirOrMenuEdit = {
      menu: intl.get(`hiam.menuConfig.modal.menu.edit`).d('编辑菜单'),
      dir: intl.get(`hiam.menuConfig.modal.dir.edit`).d('编辑目录'),
    };
    const footerProps = permission
      ? {
        footer: (ok, cancel) => (
          <div>
            {ok}
            {cancel}
          </div>
        ),
      }
      : { footer: (ok, cancel) => [cancel] };
    Modal.open({
      title: isNew ? dirOrMenuNew[type] : dirOrMenuEdit[type],
      key: Modal.key(),
      drawer: true,
      style: { width: 380 },
      className: styles['edit-menu-group'],
      children: (
        <EditMenuGroup
          isNew={isNew}
          type={type}
          record={record}
          isRoot={isRoot}
          codePrefix={getCodePrefix(fdLevel, tenantId)}
          permission={permission}
        />
      ),
      onOk: async () => {
        // 数据较多，为节省提交时间，当前数据满足校验条件后可强制提交
        const validateRes = await record.validate();
        if (validateRes) {
          if (isNew) {
            return ((await dataSet.forceSubmit()) || {}).success;
          } else if (record.status === 'update') {
            return updateRecord(record);
          }
          record.reset();
          return true;
        }
        return false;
      },
      onCancel: () => {
        if (isNew) {
          dataSet.remove(record);
        } else {
          record.reset();
        }
      },
      ...footerProps,
    });
  };

  const renderHeader = useMemo(() => {
    return (
      <Header
        title={
          <span>
            {groupName}
            {groupCode ? <>({groupCode})</> : ''}
            {intl.get('hiam.menuConfig.view.title.header.menuGroup').d('目录组配置')}
          </span>
        }
        backPath={isTenantRoleLevel() ? false : '/hiam/menu-group/list'}
      >
        {permission && (
          <Button icon="add" color="primary" onClick={() => openMenuModal(true, true, 'dir')}>
            {intl.get('hiam.menuConfig.btn.create.rootDir').d('新建根目录')}
          </Button>
        )}
        <Button icon="expand_more" funcType="flat" onClick={onExpandAll}>
          {intl.get('hzero.common.button.expandAll').d('全部展开')}
        </Button>
        <Button icon="expand_less" funcType="flat" onClick={onCollapseAll}>
          {intl.get('hzero.common.button.collapseAll').d('全部收起')}
        </Button>
      </Header>
    );
  }, [groupName, groupCode, permission]);

  const renderName = useCallback(
    ({ record: currentRecord, value }) => {
      const isTenant = currentRecord.get('tenantId') !== 0;
      const type = currentRecord.get('type') || "menu";
      const dirOrMenuRead = {
        menu: intl.get(`hiam.menuConfig.modal.menu.readOnly`).d('查看菜单'),
        dir: intl.get(`hiam.menuConfig.modal.dir.readOnly`).d('查看目录'),
      };
      return (
        <a
          onClick={() => {
            const record = getEditRecord(
              false,
              currentRecord.get('parentCode') === '-1',
              currentRecord.get('type'),
              currentRecord,
              true
            );
            Modal.open({
              title: dirOrMenuRead[type],
              key: Modal.key(),
              drawer: true,
              style: { width: 380 },
              className: styles['edit-menu-group'],
              children: (
                <EditMenuGroup
                  isNew={false}
                  type={record.get('type')}
                  readOnly
                  record={record}
                  isRoot={record.get('parentCode') === '-1'}
                  codePrefix={getCodePrefix(fdLevel, tenantId)}
                  permission={permission}
                />
              ),
              okText: intl.get('hzero.common.status.closed').d('关闭'),
              footer: (okBtn) => okBtn,
            });
          }}
        >
          {value}
          {isTenant ? <span className={styles['hl-red']} /> : null}
        </a>
      );
    },
    [permission]
  );

  const renderOpr = useCallback(
    ({ record }) => {
      const isDir = record.get('type') === 'dir';
      const enabledFlag = record.get('enabledFlag');
      const operators = [
        {
          key: 'edit',
          child: intl.get('hzero.common.view.button.edit').d('编辑'),
          func: () =>
            openMenuModal(false, record.get('parentCode') === '-1', record.get('type'), record),
        },
        !enabledFlag &&
        isTenantRoleLevel() && {
          key: 'enabled',
          child: intl.get('hzero.common.button.enabled').d('启用'),
          func: () => enabledMenu(record, 'enabled'),
        },
        enabledFlag &&
        isTenantRoleLevel() && {
          key: 'disable',
          child: intl.get('hzero.common.button.disable').d('禁用'),
          func: () => enabledMenu(record, 'disable'),
        },
        {
          key: 'up',
          child: intl.get('hiam.menuConfig.view.button.up').d('上移'),
          func: () => moveMenu(record, 'up'),
        },
        {
          key: 'down',
          child: intl.get('hiam.menuConfig.view.button.down').d('下移'),
          func: () => moveMenu(record, 'down'),
        },
        isDir && {
          key: 'subdirectory',
          child: intl.get('hiam.menuConfig.view.button.create.subdirectory').d('新建下级目录'),
          func: () => openMenuModal(true, false, 'dir', record),
          len: 6,
        },
        isDir && {
          key: 'submenu',
          child: intl.get('hiam.menuConfig.view.button.create.submenu').d('新建下级功能'),
          func: () => openMenuModal(true, false, 'menu', record),
        },
        !isTenantRoleLevel() && {
          key: 'delete',
          child: intl.get('hzero.common.status.delete').d('删除'),
          func: () => deleteMenu(record),
        },
      ].filter(Boolean);
      if (operators.length <= 3) {
        return operators.map((e) => (
          <Button
            funcType="link"
            type="c7n-pro"
            onClick={e.func}
            className={styles['c7n-opra-col-btn']}
          >
            {e.child}
          </Button>
        ));
      } else {
        const [bt1, bt2, ...others] = operators;
        const menu = (
          <Menu>
            {others.map((item) => {
              const { name, child, func } = item;
              return (
                <MenuItem key={name} onClick={func}>
                  {child}
                </MenuItem>
              );
            })}
          </Menu>
        );
        return (
          <div>
            <Button
              funcType="link"
              type="c7n-pro"
              onClick={bt1.func}
              className={styles['c7n-opra-col-btn']}
            >
              {bt1.child}
            </Button>
            <Button
              funcType="link"
              type="c7n-pro"
              onClick={bt2.func}
              className={styles['c7n-opra-col-btn']}
            >
              {bt2.child}
            </Button>
            <Dropdown funcType="flat" overlay={menu}>
              <Button funcType="link" className={styles['c7n-opra-col-btn']}>
                {intl.get('hzero.common.button.more').d('更多')}
                <Icon type="expand_more" style={{ fontSize: 14 }} />
              </Button>
            </Dropdown>
          </div>
        );
      }
    },
    [permission]
  );

  // 列表信息
  const columns = useMemo(
    () =>
      [
        {
          name: 'enabledFlag',
          renderer: ({ value }) => (
            <Tag color={value ? 'green' : 'red'} style={{ border: 'none' }}>
              {value
                ? intl.get('hzero.common.status.alreadyEnabled').d('已启用')
                : intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
            </Tag>
          ),
        },
        {
          name: 'name',
          tooltip: 'overflow',
          renderer: renderName,
        },
        {
          name: 'menuQuickIndex',
        },
        {
          name: 'description',
          tooltip: 'overflow',
        },
        permission && {
          name: 'action',
          tooltip: 'overflow',
          renderer: renderOpr,
        },
      ].filter(Boolean),
    [permission]
  );

  return (
    <>
      {renderHeader}
      <Content>
        {isTenantRoleLevel() ? (
          <FilterBarTable
            dataSet={dataSet}
            columns={columns}
            selectionMode="none"
            mode="tree"
            onExpand={onExpand}
            virtual
            filterBarConfig={{
              checkDataSetStatus: false,
              autoQuery: false,
            }}
            className={styles['hiam_menu_tree_tb']}
            customizedCode="hiam-menu-group_list"
            style={{ height: 'calc(100vh - 205px)' }}
          />
        ) : (
          <Table
            dataSet={dataSet}
            columns={columns}
            selectionMode="none"
            mode="tree"
            onExpand={onExpand}
            virtual
            customizedCode="hiam-menu-group_list"
            style={{ height: 'calc(100% - 100px)' }}
          />
        )}
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['hiam.menuConfig'],
})(memo(MenuGroupList));
