/**
 * AdminLov - 管理员关联多选 LOV 组件
 * 自定义弹窗，包含 Tabs（角色 + 用户），支持多选、搜索、服务端分页
 * @date: 2026-05-20
 */
import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { DataSet, Table, Tabs, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_IAM } from 'utils/config';
import QueryBarMore from '../../components/QueryBarMore';
import styles from './AdminLov.less';

const { TabPane } = Tabs;

export const transAdminItem = (item, type) => {
  const valueField = type === 'ROLE' ? 'roleId' : 'userId';
  const textField = type === 'ROLE' ? 'roleName' : 'userName';
  const typeMeaning =
    type === 'ROLE'
      ? intl.get('spfm.digitalEmployee.view.role').d('角色')
      : intl.get('spfm.digitalEmployee.view.user').d('用户');
  const code = item[valueField];
  const name = item[textField];
  return {
    type,
    key: `${type}|${code}`,
    text: `${typeMeaning}:${name}`,
    code,
    name,
  };
};

// ============================================================
//  弹窗内容 - Tabs + 表格
// ============================================================

function AdminLovContent({ modal, defaultSelected, onOk }) {
  const organizationId = getCurrentOrganizationId();

  const renderQueryBar = prop => {
    return <QueryBarMore {...prop} />;
  };

  // --------------------------------------------------
  //  选中管理（用 ref 避免闭包陷阱）
  // --------------------------------------------------
  const selectedRef = useRef([]);
  const defaultSelectedRef = useRef([]);

  // 仅在首次挂载时初始化
  useEffect(() => {
    selectedRef.current = defaultSelected || [];
    defaultSelectedRef.current = defaultSelected || [];
  }, []);

  const getDataSetEvent = type => {
    const valueField = 'id';
    const textField = type === 'ROLE' ? 'name' : 'realName';
    const typeMeaning =
      type === 'ROLE'
        ? intl.get('spfm.digitalEmployee.view.role').d('角色')
        : intl.get('spfm.digitalEmployee.view.user').d('用户');
    const isSelected = record => {
      return selectedRef.current.some(s => s.type === type && record.get(valueField) === s.code);
    };
    const select = record => {
      if (!isSelected(record)) {
        const code = record.get(valueField);
        const name = record.get(textField);
        selectedRef.current.push({
          type,
          key: `${type}|${code}`,
          text: `${typeMeaning}:${name}`,
          code,
          name,
        });
      }
    };
    const unSelect = records => {
      selectedRef.current = selectedRef.current.filter(
        i => i.type !== type || !records.some(s => s.get(valueField) === i.code)
      );
    };
    return {
      load: ({ dataSet }) => {
        dataSet.forEach(record => {
          if (isSelected(record)) {
            dataSet.select(record);
          }
        });
      },
      select: ({ record }) => {
        select(record);
      },
      batchSelect: ({ records }) => {
        records.forEach(record => {
          select(record);
        });
      },
      unSelect: ({ record }) => {
        unSelect([record]);
      },
      batchUnSelect: ({ records }) => {
        unSelect(records);
      },
    };
  };

  // ========================= 角色 Tab =========================
  const roleDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: 'multiple',
        primaryKey: 'id',
        transport: {
          read: ({ params }) => ({
            url: isTenantRoleLevel()
              ? `${HZERO_IAM}/hzero/v1/${organizationId}/roles/paging`
              : `${HZERO_IAM}/hzero/v1/roles/paging`,
            method: 'GET',
            params: { ...params, isEnabled: 1 },
          }),
        },
        fields: [
          {
            name: 'code',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.roleCode').d('角色编码'),
          },
          {
            name: 'name',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.roleName').d('角色名称'),
          },
        ],
        queryFields: [
          {
            name: 'code',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.roleCode').d('角色编码'),
          },
          {
            name: 'name',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.roleName').d('角色名称'),
          },
        ],
        events: getDataSetEvent('ROLE'),
      }),
    [organizationId]
  );

  // ========================= 用户 Tab =========================
  const userDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: 'multiple',
        primaryKey: 'id',
        transport: {
          read: ({ params }) => ({
            url: isTenantRoleLevel()
              ? `${HZERO_IAM}/hzero/v1/${organizationId}/users/paging`
              : `${HZERO_IAM}/hzero/v1/users/paging/all`,
            method: 'GET',
            params,
          }),
        },
        fields: [
          {
            name: 'loginName',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.userLoginName').d('用户账号'),
          },
          {
            name: 'realName',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.userName').d('用户名称'),
          },
        ],
        queryFields: [
          {
            name: 'loginName',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.userLoginName').d('用户账号'),
          },
          {
            name: 'realName',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.model.userName').d('用户名称'),
          },
        ],
        events: getDataSetEvent('USER'),
      }),
    [organizationId]
  );

  // ========================= 弹窗 Footer =========================
  const handleConfirm = useCallback(() => {
    onOk(selectedRef.current);
    modal.close();
  }, [onOk, modal]);

  const handleCancel = useCallback(() => {
    modal.close();
  }, [modal]);

  useEffect(() => {
    modal.update({
      footer: () => (
        <div className={styles['modal-footer']}>
          <Button onClick={handleCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
          <Button color="primary" onClick={handleConfirm}>
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
        </div>
      ),
    });
  }, [modal, handleConfirm, handleCancel]);

  // ========================= 表格列定义 =========================
  const roleColumns = useMemo(
    () => [{ name: 'code', width: 200 }, { name: 'name', width: 200 }],
    []
  );

  const userColumns = useMemo(
    () => [{ name: 'loginName', width: 200 }, { name: 'realName', width: 200 }],
    []
  );

  // ========================= 渲染 =========================
  return (
    <div className={styles['modal-content']}>
      <Tabs defaultActiveKey="role" flex>
        <TabPane tab={intl.get('spfm.digitalEmployee.view.role').d('角色')} key="role">
          <Table dataSet={roleDs} columns={roleColumns} queryBar={renderQueryBar} />
        </TabPane>
        <TabPane tab={intl.get('spfm.digitalEmployee.view.user').d('用户')} key="user">
          <Table dataSet={userDs} columns={userColumns} queryBar={renderQueryBar} />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default observer(AdminLovContent);
