/**
 * DocFlowPermission/index.js
 * 单据流权限分配页面
 * @date: 2021-08-24
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Badge, Tag } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getDocFlowRoleDs, getDocFlowPermissionDs } from './store/docFlowPermissionDs';
import IconTree from './component/IconTree';

@formatterCollections({
  code: ['spfm.docFlowPermission', 'hzero.common'],
})
export default class DocFlowPermission extends React.Component {
  constructor() {
    super();
    this.userDs = new DataSet(getDocFlowRoleDs());
    this.treeDs = new DataSet(getDocFlowPermissionDs());
  }

  // 显示角色权限
  showAuthority = (currentRecord) => {
    const roleId = currentRecord.get('roleId');
   const modal = Modal.open({
      drawer: true,
      style: { width: "380px" },
      title: intl.get('spfm.docFlowPermission.model.authority.distribute').d('权限分配'),
      drawerTransitionName: 'slide-right',
      children: <IconTree roleId={roleId} treeDs={this.treeDs} />,
      footer: (onOk, onClose) => (
        <div>
          <Button color="primary" onClick={() => {
            this.treeDs.submit().then(() => {
              modal?.close();
            })
          }}>
            {intl.get('hzero.common.button.sure').d('确定')}
          </Button>
          {onClose}
        </div>
      ),
      onCancel: () => this.treeDs.reset(),
    });
  };

  /**
   * 状态颜色控制
   */
   colorRender = (_value) => {
    const value = String(_value);
    if (['1'].includes(value)) {
      // 绿色: 启用
      return (
        <Tag style={{ border: 'none' }} color="green">
          <span>{intl.get('hzero.common.bomViewStatus.enable').d('启用')}</span>
        </Tag>
      );
    } else if (['0'].includes(value)) {
      //  灰色: 禁用
      return (
        <Tag style={{ border: 'none' }} color="red">
          <span>{intl.get('hzero.common.status.disabled').d('禁用')}</span>
        </Tag>
      );
    } else {
      return '-';
    }
  };

  render() {
    const columns = [
      {
        name: 'status',
        width: 90,
        renderer: ({ value }) => this.colorRender(value),
      },
      {
        name: 'roleName',
        // width: 320,
      },
      {
        name: 'roleCode',
        // width: 300,
      },
      {
        name: 'tenantName',
        // width: 300,
      },
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.showAuthority(record)}>
              {intl.get('spfm.docFlowPermission.model.view.permissions').d('查看权限')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <>
        <Header
          title={intl
            .get('spfm.docFlowPermission.model.documentFlow.permissionAllocation')
            .d('单据流权限分配')}
        />
        <Content>
          <div style={{ height: 'calc(100vh - 185px)' }}>
            <FilterBarTable
              columns={columns}
              dataSet={this.userDs}
              boxSizing='wrapper'
              style={{ maxHeight: `calc(100% - 22px)` }}
              customizable
              customizedCode="new-workbench"
              filterBarConfig={{
                autoQuery: false,
                expandable: true,
                checkDataSetStatus: false,
                fields: [
                  {
                    name: 'roleName',
                    type: 'string',
                    label: intl.get('spfm.docFlowPermission.model.role.name').d('角色名称'),
                    display: true,
                    merge: true,
                  },
                ],
              }}
            />
          </div>
        </Content>
      </>
    );
  }
}
