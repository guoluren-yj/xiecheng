/**
 * index - 角色管理 - 分配权限
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Checkbox } from 'choerodon-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Button, Form, Input, Tag, Row, Col } from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import notification from 'utils/notification';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import { assignPermission } from '@/services/roleManagementServiceNew';

import Drawer from '../Drawer';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();
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

export default class Permissions extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['handleFetchDataSource', 'handleClose', 'handleSave', 'collapseAll', 'expandAll'].forEach(
      (method) => {
        this[method] = this[method].bind(this);
      }
    );
    this.searchFormRef = React.createRef();
  }

  state = {
    listDs: new DataSet({
      selection: false,
      autoQuery: false,
      paging: false,
      cacheSelection: true,
      cacheModified: true,
      primaryKey: 'primaryKey',
      parentField: 'parentPrimaryKey',
      idField: 'primaryKey',
      fields: [
        {
          name: 'name',
          type: 'string',
          label: intl.get(`hiam.roleManagement.model.roleManagement.permissionName`).d('权限名称'),
        },
        {
          name: 'permissionType',
          type: 'string',
          label: intl.get(`hiam.roleManagement.model.roleManagement.permission.Type`).d('权限类型'),
        },
        {
          name: 'action',
          type: 'string',
          label: intl.get('hzero.common.button.action').d('操作'),
        },
        {
          name: 'checkedFlag',
          type: 'boolean',
          trueValue: 'Y',
          falseValue: 'N',
        },
      ],
      queryFields: [],
      transport: {
        read: ({ data }) => {
          const { roleId } = data;
          if (roleId) {
            return {
              url: organizationRoleLevel
                ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-set-tree`
                : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-set-tree`,
              method: 'GET',
              data,
              transformResponse: (value) => {
                const newValue = [];
                const listData = value ? JSON.parse(value) : [];
                listData.forEach((ele) => {
                  const primaryKey = newValue.length;
                  const getSubList = (collections = [], parentPrimaryKey, subList) => {
                    collections.forEach((n) => {
                      const newPrimaryKey = newValue.length;
                      if (isEmpty(n.subMenus)) {
                        if(n.type === 'ps'){
                          subList.push({
                            ...n,
                            primaryKey: newPrimaryKey,
                            parentPrimaryKey,
                            subMenus: undefined,
                          });
                        }
                        newValue.push({
                          ...n,
                          primaryKey: newPrimaryKey,
                          parentPrimaryKey,
                          subMenus: undefined,
                        });
                      }else{
                        const curObj = {
                          ...n,
                          primaryKey: newPrimaryKey,
                          parentPrimaryKey,
                          subMenus: undefined,
                        };
                        newValue.push(curObj);
                        const curSubBtnList = getSubList(n.subMenus, newPrimaryKey, []);
                        subList.push(...curSubBtnList);
                        if(new Set(curSubBtnList.map(item => item.checkedFlag)).size === 2){
                          // eslint-disable-next-line no-unused-expressions
                          curObj.checkedFlag ='';
                        }
                      }
                    });
                    return subList;
                  };
                  if (isEmpty(ele.subMenus)) {
                    newValue.push({
                      ...ele,
                      primaryKey,
                      parentPrimaryKey: undefined,
                      parentId: undefined,
                      subMenus: undefined,
                    });
                  }else{
                    const curtObj = {
                      ...ele,
                      primaryKey,
                      parentPrimaryKey: undefined,
                      parentId: undefined,
                      subMenus: undefined,
                    };
                    newValue.push(curtObj);
                    const curSubBtnList = getSubList(ele.subMenus, primaryKey, []);
                    if(new Set(curSubBtnList.map(item => item.checkedFlag)).size === 2){
                      // eslint-disable-next-line no-unused-expressions
                      curtObj.checkedFlag = '';
                    }
                  }
                });
                console.log(newValue);
                return [...newValue];
              },
            };
          }
        },
      },
      events: {
        load: ({ dataSet }) => {
          const name = dataSet?.queryDataSet?.current?.get('name');
          console.log(name, dataSet?.queryDataSet?.toData());
          if (name) {
            dataSet.forEach((ele) => {
              if (ele.get('name') && ele.get('name').includes(name)) {
                const getParentData = (data) => {
                  // eslint-disable-next-line no-param-reassign
                  data.isExpanded = true;
                  if (data.parent) {
                    getParentData(data.parent);
                  }
                };

                if (ele.parent) {
                  getParentData(ele.parent);
                }
              }
            });
          }
        },
      },
    }),
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
      const { listDs } = this.state;
      listDs.setQueryParameter('roleId', roleId);
      // eslint-disable-next-line no-unused-expressions
      listDs.queryDataSet?.loadData([
        {
          ...params,
        },
      ]);
      listDs.query();
    }
  }

  handleClose() {
    const { close } = this.props;
    close();
  }

  handleSave() {
    const { roleId, close } = this.props;
    const { listDs } = this.state;
    const assignPermissionSetIds = [];
    const recyclePermissionSetIds = [];
    listDs.forEach((record) => {
      if (record.dirty) {
        if (record.get('type') === 'ps') {
          if (record.get('checkedFlag') === 'Y') {
            assignPermissionSetIds.push(record.get('id'));
          } else {
            recyclePermissionSetIds.push(record.get('id'));
          }
        }
      }
    });
    assignPermission({
      roleId,
      assignPermissionSetIds,
      recyclePermissionSetIds,
    }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        close();
      }
    });
  }

  onCheckboxChange(record) {
    if (record.get('checkedFlag') === 'Y') {
      record.set({
        checkedFlag: 'N',
      });
    } else {
      record.set({
        checkedFlag: 'Y',
      });
    }
    if (record.get('type') !== 'ps' && record.children) {
      const getSubList = (collections = []) => {
        collections.forEach((n) => {
          if (record.get('checkedFlag') === 'Y') {
            n.set({
              checkedFlag: 'Y',
            });
          } else {
            n.set({
              checkedFlag: 'N',
            });
          }

          if (!isEmpty(n.children)) {
            getSubList(n.children);
          }
        });
      };

      getSubList(record.children);
    }

    const getParent = (parent) => {

      const statusSet = new Set(parent?.children?.map(item => item.get('checkedFlag')));

      if(statusSet.size > 1){
        // eslint-disable-next-line no-unused-expressions
        parent?.set({
          checkedFlag: '',
        });
      }else if(statusSet.size === 1 && statusSet.has('Y')){
        // eslint-disable-next-line no-unused-expressions
        parent?.set({
          checkedFlag: 'Y',
        });
      }else{
        // eslint-disable-next-line no-unused-expressions
        parent?.set({
          checkedFlag: 'N',
        });
      }

      console.log(parent, statusSet);

      if(parent.parent){
        getParent(parent.parent);
      }
    };

    if(record.parent){
      getParent(record.parent);
    }

  }

  /**
   * expandAll - 全部展开
   */
  expandAll() {
    const { listDs } = this.state;
    listDs.forEach((record) => {
      if (record.get('type') !== 'ps') {
        // eslint-disable-next-line no-param-reassign
        record.isExpanded = true;
      }
    });
  }

  /**
   * expandAll - 全部收起
   */
  collapseAll() {
    const { listDs } = this.state;
    listDs.forEach((record) => {
      if (record.get('type') !== 'ps') {
        // eslint-disable-next-line no-param-reassign
        record.isExpanded = false;
      }
    });
  }

  render() {
    const { prompt = {}, roleName, visible } = this.props;
    const { listDs } = this.state;

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
        <>
          <Button type="primary" onClick={this.handleSave}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button onClick={this.handleClose}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </>
      ),
    };
    const columns = [
      {
        name: 'name',
        width: 320,
      },
      {
        name: 'permissionType',
        width: 150,
        renderer: ({ record, value }) => {
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
            record?.get('type') === 'ps' && (
              <Tag color={value === 'api' ? 'green' : 'orange'}>{text.join()}</Tag>
            )
          );
        },
      },
      {
        // title: intl.get('hzero.common.button.action').d('操作'),
        name: 'action',
        width: 85,
        renderer: ({ record }) => {
          return (
            <Checkbox
              indeterminate={record.get('checkedFlag') === ''}
              checked={record.get('checkedFlag') === 'Y'}
              onChange={() => this.onCheckboxChange(record)}
            />
          );
        },
      },
    ];
    const tableProps = {
      queryBar: 'none',
      style: { maxHeight: '600px' },
      mode: 'tree',
      dataSet: listDs,
      virtual: true,
      virtualCell: true,
      virtualSpin: true,
      columns,
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
