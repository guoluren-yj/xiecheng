/* eslint-disable no-inner-declarations */
/**
 * index - 角色管理 - 分配权限
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Checkbox, Form, Input, Tag, Row, Col } from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';

import Table from 'components/VirtualTable';

import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getResponse,
} from 'utils/utils';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import { batchAssignPermissionSets, batchUnassignPermissionSets, queryPermissionMenus } from "@/services/roleManagementService";

import Drawer from '../Drawer';
import styles from './index.less';

// 折叠面板组件初始化
const FormItem = Form.Item;

const PermissionsQueryForm = ({ form = {}, search = (e) => e }) => {
  const { getFieldDecorator = (e) => e, resetFields = (e) => e } = form;
  return (
    <Form>
      <Row type="flex" gutter={24} align="bottom">
        <Col span={12}>
          <FormItem
            {...SEARCH_FORM_ITEM_LAYOUT}
            label={intl
              .get(`hiam.roleManagement.model.roleManagement.permissionName`)
              .d('权限名称')}
          >
            {getFieldDecorator('name')(<Input />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem {...SEARCH_FORM_ITEM_LAYOUT}>
            <Button onClick={() => resetFields()} style={{ marginRight: '8px' }}>
              {intl.get(`hzero.common.button.reset`).d('重置')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => {
                search();
              }}
            >
              {intl.get(`hzero.common.button.search`).d('查询')}
            </Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

const WrapperPermissionsQueryForm = Form.create({ fieldNameProp: null })(PermissionsQueryForm);

export default class CoreEnterprise extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    [
      'handleFetchDataSource',
      'handleClose',
      'operationRender',
      'onExpand',
      'collapseAll',
      'expandAll',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
    this.searchFormRef = React.createRef();
    this.state = {
      queryLoading: false,
      batchAssignLoading: false,
      batchRecyleLoading: false,
    };
  }

  state = {
    dataSource: [],
    expandedRowKeys: [],
    defaultExpandedRowKeys: [],
  };

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, roleId } = this.props;
    return visible && roleId !== prevProps.roleId;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleFetchDataSource();
    }
  }

  defaultTableRowKey = 'id';

  handleFetchDataSource() {
    const { roleId } = this.props;
    let params = {};
    if (this.searchFormRef.current) {
      // because of wrappedComponentRef doesn't get ref, so use ref directly
      params = this.searchFormRef.current.getFieldsValue();
    }
    if (!isNil(roleId)) {
      this.setState({ queryLoading: true });
      queryPermissionMenus(roleId, params).then((res) => {
        if (getResponse(res)) {
          const defaultExpandedRowKeys = [];
          function assignListData(collections = []) {
            return collections.map((n) => {
              const m = n;
              m.key = n.id;
              if (isEmpty(m.subMenus)) {
                m.subMenus = null;
              } else {
                m.subMenus = assignListData(m.subMenus);
                defaultExpandedRowKeys.push(m.id);
                const checkedCount = m.subMenus.filter((o) => o.checkedFlag === 'Y').length;
                const indeterminateCount = m.subMenus.filter((o) => o.checkedFlag === 'P').length;
                m.checkedFlag =
                  // eslint-disable-next-line no-nested-ternary
                  checkedCount === m.subMenus.length
                    ? 'Y'
                    : // eslint-disable-next-line no-nested-ternary
                    checkedCount === 0
                      ? indeterminateCount === 0
                        ? null
                        : 'P'
                      : 'P';
              }
              return m;
            });
          }
          this.setState({
            dataSource: assignListData(res || []),
            defaultExpandedRowKeys,
          });
        }
      }).finally(() => {
        this.setState({ queryLoading: false });
      });
    }
  }

  handleClose() {
    const { close = (e) => e } = this.props;
    this.setState({
      dataSource: [],
      expandedRowKeys: [],
    });
    close();
  }

  onCheckboxChange(record) {
    const {
      roleId,
    } = this.props;

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
    if (record.checkedFlag !== 'Y') {
      this.setState({ batchAssignLoading: true });
      batchAssignPermissionSets(roleId, setIdList, { onlyCoreEnterprise: true }).then(res => {
        if (res && res.failed) {
          notification.error({
            description: res.message,
          });
        } else {
          notification.success();
          this.handleFetchDataSource();
        }
      }).finally(() => {
        this.setState({ batchAssignLoading: false });
      });
    } else {
      this.setState({ batchRecyleLoading: true });
      batchUnassignPermissionSets(roleId, setIdList, { onlyCoreEnterprise: true }).then(res => {
        if (res && res.failed) {
          notification.error({
            description: res.message,
          });
        } else if (res) {
          notification.success();
          this.handleFetchDataSource();
        }
      }).finally(() => {
        this.setState({ batchRecyleLoading: false });
      });
    }
  }

  /**
   * expandAll - 全部展开
   */
  expandAll() {
    const { defaultExpandedRowKeys } = this.state;
    this.setState({
      expandedRowKeys: defaultExpandedRowKeys,
    });
  }

  /**
   * expandAll - 全部收起
   */
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  /**
   * onExpand - 展开树
   * @param {boolean} expanded - 是否展开
   * @param {record} record - 当前行数据
   */
  onExpand(expanded, record) {
    const { expandedRowKeys = [] } = this.state;
    this.setState({
      expandedRowKeys: expanded
        ? expandedRowKeys.concat(record.key)
        : expandedRowKeys.filter((o) => o !== record.key),
    });
  }

  operationRender({ rowData: record }) {
    const checkboxProps = {
      indeterminate: record.checkedFlag === 'P',
      checked: record.checkedFlag === 'Y',
      onChange: this.onCheckboxChange.bind(this, record),
    };
    return <Checkbox {...checkboxProps} />;
  }

  render() {
    const { prompt = {}, roleName, visible } = this.props;
    const { dataSource = [], expandedRowKeys = [], batchAssignLoading, batchRecyleLoading, queryLoading } = this.state;

    const drawerProps = {
      title: intl
        .get('hiam.roleManagement.view.title.assign', { name: roleName })
        .d(`给“${roleName}”分配权限`),
      visible,
      onCancel: this.handleClose,
      width: 620,
      anchor: 'right',
      wrapClassName: styles['hiam-role-permissions-editor'],
      footer: (
        <Button type="primary" onClick={this.handleClose}>
          {intl.get(`hzero.common.button.close`).d('关闭')}
        </Button>
      ),
    };
    const columns = [
      {
        title: intl.get(`hiam.roleManagement.model.roleManagement.permissionName`).d('权限名称'),
        dataIndex: 'name',
        width: 320,
      },
      {
        title: intl.get(`hiam.roleManagement.model.roleManagement.permission.Type`).d('权限类型'),
        dataIndex: 'permissionType',
        width: 150,
        render: ({ rowData: record, dataIndex }) => {
          const value = record[dataIndex];
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
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        render: this.operationRender,
      },
    ];
    const tableProps = {
      isTree: true,
      rowKey: 'key',
      columns,
      data: dataSource,
      loading: queryLoading || batchRecyleLoading || batchAssignLoading,
      bordered: true,
      childrenColumnName: 'subMenus',
      pagination: false,
      expandedRowKeys,
      onExpandChange: this.onExpand,
      height: 600,
    };
    return (
      <Drawer {...drawerProps}>
        <WrapperPermissionsQueryForm
          ref={this.searchFormRef}
          search={this.handleFetchDataSource}
          prompt={prompt}
        />
        <br />
        <div className="action" style={{ textAlign: 'right' }}>
          <Button onClick={this.collapseAll} style={{ marginRight: 8 }}>
            {intl.get(`hzero.common.button.collapseAll`).d('全部收起')}
          </Button>
          <Button onClick={this.expandAll}>
            {intl.get(`hzero.common.button.expandAll`).d('全部展开')}
          </Button>
        </div>
        <br />
        <Table {...tableProps} />
      </Drawer>
    );
  }
}
