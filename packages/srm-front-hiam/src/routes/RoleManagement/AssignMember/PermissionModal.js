/**
 * VisitPermission - 分配用户-分配权限
 * @date: 2019-11-22
 * @author: hulingfangzi <lingfangzi.hu01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { Tag } from 'hzero-ui';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import { action, runInAction } from 'mobx';
import { isEmpty, noop } from 'lodash';
import { Button as ButtonPermission } from 'components/Permission';
import { operatorRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

const PermissionModal = function (props) {
  const { fetchPermissionTree, member, roleId, onShield = noop, path } = props;
  const dataSet = useMemo(() => new DataSet({
    primaryKey: 'id',
    childrenField: 'subMenus',
  }), []);
  const texts = useMemo(() => ({
    api: intl.get('hiam.roleManagement.view.message.api').d('API'),
    button: intl.get('hiam.roleManagement.view.message.button').d('按钮'),
    table: intl.get('hiam.roleManagement.view.message.table').d('表格列'),
    formItem: intl.get('hiam.roleManagement.view.message.formItem').d('表单项'),
    formField: intl.get('hiam.roleManagement.view.message.formField').d('表单域'),
  }), []);
  const handleFetchList = useCallback(() => {
    if (fetchPermissionTree) {
      runInAction(() => {
        dataSet.status = 'loading';
      });
      return fetchPermissionTree(member).then(action((res) => {
        if (res) {
          const { dataSource = [] } = res;
          dataSet.loadData(dataSource);
          dataSet.status = 'ready';
        }
      }));
    }
    return Promise.resolve();
  }, [dataSet, fetchPermissionTree, member]);
  const handleShield = useCallback(action((record) => {
    const setIdList = [];
    const setId = (n) => {
      if (n.get('type') === 'ps') {
        setIdList.push(n.get('id'));
      }
      const subMenus = n.children;
      if (!isEmpty(subMenus)) {
        getSubSetIdList(subMenus);
      }
    };
    const getSubSetIdList = (collections = []) => {
      collections.forEach((n) => setId(n));
    };

    setId(record);
    const payload = {
      memberId: member.id,
      memberType: 'user',
      permissionIdList: setIdList,
      roleId,
      shieldFlag: record.get('shieldFlag'),
    };
    dataSet.status = 'submitting';
    onShield(payload).then((res) => {
      if (res) {
        return handleFetchList();
      }
    }).finally(action(() => {
      dataSet.status = 'ready';
    }));
  }), [dataSet, onShield, roleId, member, handleFetchList]);
  const columns = useMemo(() => [
    {
      title: intl.get(`hiam.roleManagement.model.roleManagement.permissionName`).d('权限名称'),
      name: 'name',
    },
    {
      title: intl.get(`hiam.roleManagement.model.roleManagement.permission.Type`).d('权限类型'),
      name: 'permissionType',
      width: 150,
      renderer: ({ value = '', record }) => (
        record.get('type') === 'ps' && (
          <Tag color={value === 'api' ? 'green' : 'orange'}>
            {
              value.split(',').reduce((text, item, index) => {
                if (index === 0) {
                  text = texts[text] ? texts[text] : '';
                }
                if (text && texts[item]) {
                  return `${text},${texts[item]}`;
                }
                return text;
              })
            }
          </Tag>
        )
      ),
    },
    {
      name: 'shieldFlag',
      title: intl.get('hiam.roleManagement.model.roleManagement.isShield').d('是否屏蔽'),
      width: 90,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      key: 'operator',
      title: intl.get('hzero.common.button.action').d('操作'),
      width: 100,
      lock: 'right',
      renderer: ({ record }) => {
        const shieldFlag = record.get('shieldFlag');
        const shieldBtn = [
          {
            key: 'shield',
            ele: (
              <ButtonPermission
                type="text"
                permissionList={[
                  {
                    code: `${path}.button.shield`,
                    type: 'button',
                    meaning: '角色管理-屏蔽访问权限',
                  },
                ]}
                onClick={() => handleShield(record)}
              >
                {shieldFlag
                  ? intl.get('hiam.roleManagement.view.button.cancelShield').d('取消屏蔽')
                  : intl.get('hiam.roleManagement.view.button.shield').d('屏蔽')}
              </ButtonPermission>
            ),
            len: shieldFlag ? 4 : 2,
            title: shieldFlag
              ? intl.get('hiam.roleManagement.view.button.cancelShield').d('取消屏蔽')
              : intl.get('hiam.roleManagement.view.button.shield').d('屏蔽'),
          },
        ];
        return operatorRender(shieldBtn);
      },
    },
  ], [texts, path]);
  const expandAll = useCallback(() => {
    dataSet.forEach(r => {
      r.isExpanded = true;
    });
  }, [dataSet]);
  const collapseAll = useCallback(() => {
    dataSet.forEach(r => {
      r.isExpanded = false;
    });
  }, [dataSet]);

  useEffect(() => {
    handleFetchList();
  }, [handleFetchList]);

  const tableProps = {
    dataSet,
    columns,
    virtual: true,
    mode: 'tree',
    style: {
      maxHeight: 'calc(100vh - 200px)',
    },
    selectionMode: 'none',
  };

  return (
    <>
      <div className="action" style={{ textAlign: 'right', marginBottom: '10px' }}>
        <Button onClick={collapseAll}>
          {intl.get(`hzero.common.button.collapseAll`).d('全部收起')}
        </Button>
        <Button onClick={expandAll}>
          {intl.get(`hzero.common.button.expandAll`).d('全部展开')}
        </Button>
      </div>
      <Table {...tableProps} />
    </>
  );
};

export default PermissionModal;
