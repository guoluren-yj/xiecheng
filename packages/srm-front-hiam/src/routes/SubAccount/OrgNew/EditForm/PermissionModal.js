/**
 * VisitPermission - 分配用户-分配权限
 * @date: 2019-11-22
 * @author: hulingfangzi <lingfangzi.hu01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { Tag } from 'hzero-ui';
import { Button, DataSet, Table, Modal } from 'choerodon-ui/pro';
import { action, runInAction } from 'mobx';
import { isArray, noop } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Button as ButtonPermission } from 'components/Permission';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

const PermissionModal = function (props) {
  const { fetchPermissionTree, memberId, roleId, onShield = noop, path } = props;
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
      return fetchPermissionTree({ roleId, memberId }).then(action((res) => {
        if (res) {
          const { dataSource = [] } = res;
          dataSet.loadData(dataSource);
          dataSet.status = 'ready';
          dataSet.forEach(ele => {
            if ((ele.get('type') !== 'ps')) {
              // eslint-disable-next-line no-param-reassign
              ele.selectable = false;
            }
          });
        }
      }));
    }
    return Promise.resolve();
  }, [dataSet, fetchPermissionTree, roleId, memberId]);
  const handleShield = useCallback(action(async () => {
    const { selected = [] } = dataSet
    const permissionIdList = selected.map(e => e.get('id'));
    const shieldFlag = isArray(selected) ? selected[0]?.get('shieldFlag') : null;
    const payload = {
      memberId,
      memberType: 'user',
      permissionIdList,
      roleId,
      shieldFlag,
    };
    dataSet.status = 'submitting';
    // 屏蔽按钮需要校验调用原接口校验数据。校验接口中会返回
    if (shieldFlag === 0) {
      const res = await onShield({ ...payload, checkShieldFlag: 1 });
      if (res?.shieldFlag === 0) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: `${res?.tipMessage}`,
          onOk: () => onShield({ ...payload, checkShieldFlag: 0 }).then((res) => {
            if (res) {
              return handleFetchList();
            }
          }).finally(action(() => {
            dataSet.status = 'ready';
          })),
          onCancel: () => {
            dataSet.status = 'ready';
          }
        });
      } else if (res && res?.shieldFlag !== 0) {
        onShield({ ...payload, checkShieldFlag: 0 }).then((res) => {
          if (res) {
            return handleFetchList();
          }
        }).finally(action(() => {
          dataSet.status = 'ready';
        }));
      } else {
        dataSet.status = 'ready';
      }
    }
    else {
      onShield(payload).then((res) => {
        if (res) {
          return handleFetchList();
        }
      }).finally(action(() => {
        dataSet.status = 'ready';
      }));
    }
  }), [dataSet, onShield, roleId, memberId, handleFetchList]);
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
    // {
    //   key: 'operator',
    //   title: intl.get('hzero.common.button.action').d('操作'),
    //   width: 100,
    //   lock: 'right',
    //   renderer: ({ record }) => {
    //     if (record.get('type') === 'ps') {
    //       const shieldFlag = record.get('shieldFlag');
    //       const shieldBtn = [
    //         {
    //           key: 'shield',
    //           ele: (
    //             <ButtonPermission
    //               type="text"
    //               permissionList={[
    //                 {
    //                   code: `${path}.button.shield`,
    //                   type: 'button',
    //                   meaning: '角色管理-屏蔽访问权限',
    //                 },
    //               ]}
    //               onClick={() => handleShield(record)}
    //             >
    //               {shieldFlag
    //                 ? intl.get('hiam.roleManagement.view.button.cancelShield').d('取消屏蔽')
    //                 : intl.get('hiam.roleManagement.view.button.shield').d('屏蔽')}
    //             </ButtonPermission>
    //           ),
    //           len: shieldFlag ? 4 : 2,
    //           title: shieldFlag
    //             ? intl.get('hiam.roleManagement.view.button.cancelShield').d('取消屏蔽')
    //             : intl.get('hiam.roleManagement.view.button.shield').d('屏蔽'),
    //         },
    //       ];
    //       return operatorRender(shieldBtn);
    //     }
    //   },
    // },
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
    // selectionMode: 'none',
  };

  const ShieldBtn = observer(() => {
    const { selected = [] } = dataSet;
    const shieldAllFlag = useMemo(() => {
      const allShieldList = Array.from(new Set(selected.map(e => e.get('shieldFlag'))));
      return allShieldList || [];
    }, [selected]);

    return (
      <ButtonPermission
        permissionList={[
          {
            code: `${path}.button.shield`,
            type: 'button',
            meaning: '角色管理-屏蔽访问权限',
          },
        ]}
        wait={500}
        loading={['submitting', 'loading'].includes(dataSet?.status)}
        type="c7n-pro"
        disabled={shieldAllFlag?.length !== 1}
        onClick={() => handleShield()}
      >
        {shieldAllFlag?.length === 1 && shieldAllFlag[0] === 1
          ? intl.get('hiam.roleManagement.view.button.cancelShield').d('取消屏蔽')
          : intl.get('hiam.roleManagement.view.button.shield').d('屏蔽')}
      </ButtonPermission>
    );
  }, [dataSet]);

  return (
    <>
      <div className="action" style={{ textAlign: 'right', marginBottom: '10px' }}>
        <ShieldBtn />
        <Button onClick={collapseAll}>
          {intl.get(`hzero.common.button.collapseAll`).d('全部收起')}
        </Button>
        <Button onClick={expandAll}>
          {intl.get(`hzero.common.button.expandAll`).d('全部展开')}
        </Button>
        {/* <Button onClick={handleShield}>
          {intl.get('hiam.roleManagement.view.button.shield').d('屏蔽')}
        </Button> */}
      </div>
      <Table {...tableProps} />
    </>
  );
};

export default PermissionModal;
