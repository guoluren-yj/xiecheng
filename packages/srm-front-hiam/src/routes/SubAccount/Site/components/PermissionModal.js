/**
 * VisitPermission - 分配用户-分配权限
 * @date: 2019-11-22
 * @author: hulingfangzi <lingfangzi.hu01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Button, Tag, Modal } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { Button as ButtonPermission } from 'components/Permission';
import { operatorRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

export default class PermissionModal extends Component {
  constructor(props) {
    super(props);
    this.defaultExpandedRowKeys = [];
    this.state = {
      expandedRowKeys: [],
      dataSource: [],
      loading: false,
      defaultExpandedRowKeys: [],
    };
  }

  componentDidMount() {
    this.handleFetchList();
  }

  @Bind()
  handleFetchList() {
    const { fetchPermissionTree = (e) => e, roleId } = this.props;
    this.setState({
      loading: true,
    });
    fetchPermissionTree(roleId).then((res) => {
      if (res) {
        const { dataSource = [], defaultExpandedRowKeys = [] } = res;
        this.setState({
          dataSource,
          defaultExpandedRowKeys,
          loading: false,
        });
      }
    });
  }

  /**
   * expandAll - 全部展开
   */
  @Bind()
  expandAll() {
    const { defaultExpandedRowKeys } = this.state;
    this.setState({
      expandedRowKeys: defaultExpandedRowKeys,
    });
  }

  /**
   * 全部收起
   */
  @Bind()
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  /**
   * 展开树
   * @param {boolean} expanded - 是否展开
   * @param {record} record - 当前行数据
   */
  @Bind()
  onExpand(expanded, record) {
    const { expandedRowKeys = [] } = this.state;
    this.setState({
      expandedRowKeys: expanded
        ? expandedRowKeys.concat(record.key)
        : expandedRowKeys.filter((o) => o !== record.key),
    });
  }

  /**
   * 屏蔽/取消屏蔽安全组权限
   * @param {object} record - 屏蔽数据
   * @param {function} callBack - 查询回调
   */
  @Bind()
  handleShield(record) {
    const { onShield = (e) => e, roleId, memberId } = this.props;
    const setIdList = [];
    const getSubSetIdList = (collections = []) => {
      collections.forEach((n) => {
        if (n.type === 'ps') {
          setIdList.push(n.id);
        }
        if (!isEmpty(n.subMenus)) {
          getSubSetIdList(n.subMenus);
        }
      });
    };

    if (record.type === 'ps') {
      setIdList.push(record.id);
    }

    if (!isEmpty(record.subMenus)) {
      getSubSetIdList(record.subMenus);
    }
    const payload = {
      roleId,
      memberType: 'user',
      permissionIdList: [record.id],
      memberId,
      shieldFlag: record.shieldFlag,
    };
    this.setState({
      loading: true,
    });
    onShield(payload, this.handleFetchList);
  }

  get columns() {
    const { path } = this.props;
    return [
      {
        title: intl.get(`hiam.roleManagement.model.roleManagement.permissionName`).d('权限名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get(`hiam.roleManagement.model.roleManagement.permission.Type`).d('权限类型'),
        dataIndex: 'permissionType',
        width: 150,
        render: (value = '', record) => {
          const texts = {
            api: intl.get('hiam.roleManagement.view.message.api').d('API'),
            button: intl.get('hiam.roleManagement.view.message.button').d('按钮'),
            table: intl.get('hiam.roleManagement.view.message.table').d('表格列'),
            formItem: intl.get('hiam.roleManagement.view.message.formItem').d('表单项'),
            formField: intl.get('hiam.roleManagement.view.message.formField').d('表单域'),
          };
          const valueList = value.split(',') || [];
          const text = valueList.map((item) => (texts[item] ? texts[item] : '')) || [];
          return (
            record.type === 'ps' && (
              <Tag color={value === 'api' ? 'green' : 'orange'}>{text.join()}</Tag>
            )
          );
        },
      },
      {
        dataIndex: 'shieldFlag',
        title: intl.get('hiam.roleManagement.model.roleManagement.isShield').d('是否屏蔽'),
        width: 90,
        render: yesOrNoRender,
      },
      {
        key: 'operator',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        fixed: 'right',
        render: (_, record) => {
          if (record?.type === 'ps') {
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
                    onClick={() => this.handleShield(record)}
                  >
                    {record?.shieldFlag
                      ? intl.get('hiam.roleManagement.view.button.cancelShield').d('取消屏蔽')
                      : intl.get('hiam.roleManagement.view.button.shield').d('屏蔽')}
                  </ButtonPermission>
                ),
                len: record?.shieldFlag ? 4 : 2,
                title: record?.shieldFlag
                  ? intl.get('hiam.roleManagement.view.button.cancelShield').d('取消屏蔽')
                  : intl.get('hiam.roleManagement.view.button.shield').d('屏蔽'),
              },
            ];
            return operatorRender(shieldBtn);
          }
        },
      },
    ];
  }

  render() {
    const { visible, handleClose } = this.props;
    const { expandedRowKeys, dataSource, loading } = this.state;
    const tableProps = {
      rowKey: 'id',
      columns: this.columns,
      bordered: true,
      dataSource,
      loading,
      childrenColumnName: 'subMenus',
      pagination: false,
      expandedRowKeys,
      scroll: { x: tableScrollWidth(this.columns) },
      onExpand: this.onExpand,
    };

    return (
      <Modal
        width={800}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        destroyOnClose
        visible={visible}
        title={intl.get('hiam.roleManagement.view.button.assignPermission').d('分配权限')}
        onCancel={handleClose}
        footer={
          <Button type="primary" onClick={handleClose}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        }
      >
        <div className="action" style={{ textAlign: 'right', marginBottom: '10px' }}>
          <Button onClick={this.collapseAll} style={{ marginRight: 8 }}>
            {intl.get(`hzero.common.button.collapseAll`).d('全部收起')}
          </Button>
          <Button onClick={this.expandAll}>
            {intl.get(`hzero.common.button.expandAll`).d('全部展开')}
          </Button>
        </div>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
