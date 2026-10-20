/**
 * DefaultValueConfig - 默认值配置
 * @date: 2018-11-22
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Switch } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUserId, getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';

const FormItem = Form.Item;

@connect(({ userInfo, loading }) => ({
  userInfo,
  searchLoading: loading.effects['userInfo/getDefaultValue'],
  saveLoading:
    loading.effects['userInfo/createDefaultValue'] ||
    loading.effects['userInfo/updateDefaultValue'],
  tenantId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
@formatterCollections({ code: ['hiam.defaultValueConfig'] })
export default class DefaultValueConfig extends Component {
  /**
   * state初始化
   * @param {object} props 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  getDefaultValue() {
    const { userId, dispatch } = this.props;
    dispatch({
      type: 'userInfo/getDefaultValue',
      payload: {
        userId,
      },
    });
  }

  /**
   * 渲染行
   * @returns
   */
  @Bind()
  getColumns() {
    const { userId, tenantId } = this.props;
    return [
      {
        title: intl.get('hiam.defaultValueConfig.view.model.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`companyId`, {
                initialValue: record.companyId,
              })(
                <Lov
                  code="HIAM.USER_MAINTAIN_COMPANY"
                  textValue={record.companyName}
                  queryParams={{ userId, tenantId }}
                  onChange={(_, lovRecord) => {
                    record.$form.registerField('companyName');
                    record.$form.setFieldsValue({
                      companyName: lovRecord.companyName,
                      organizationName: null,
                      organizationId: null,
                      ouId: null,
                      ouName: null,
                      inventoryId: null,
                      inventoryName: null,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hiam.defaultValueConfig.view.model.operationUnit').d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`ouId`, {
                initialValue: record.ouId,
              })(
                <Lov
                  code="HIAM.USER_MAINTAIN_OU"
                  textValue={record.ouName}
                  queryParams={{
                    userId,
                    tenantId,
                    companyId: record.$form.getFieldValue('companyId'),
                  }}
                  onChange={(_, lovRecord) => {
                    record.$form.registerField('ouName');
                    record.$form.setFieldsValue({
                      ouName: lovRecord.ouName,
                      organizationName: null,
                      organizationId: null,
                      inventoryId: null,
                      inventoryName: null,
                    });
                  }}
                  disabled={!record.$form.getFieldValue('companyId')}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hiam.defaultValueConfig.view.model.purchaseOrg').d('采购组织'),
        dataIndex: 'buyOrganizationName',
        width: 150,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseOrgId`, {
                initialValue: record.purchaseOrgId,
              })(
                <Lov
                  code="HIAM.USER_MAINTAIN_PURORGS"
                  textValue={record.buyOrganizationName}
                  queryParams={{ userId, tenantId }}
                  onChange={(_, lovRecord) => {
                    record.$form.registerField('buyOrganizationName');
                    record.$form.setFieldsValue({
                      buyOrganizationName: lovRecord.buyOrganizationName,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hiam.defaultValueConfig.view.model.purchaseAgentName').d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseAgentId`, {
                initialValue: record.purchaseAgentId,
              })(
                <Lov
                  code="HIAM.USER_MAINTAIN_PURAGENTS"
                  textValue={record.purchaseAgentName}
                  queryParams={{ userId, tenantId }}
                  onChange={(_, lovRecord) => {
                    record.$form.registerField('purchaseAgentName');
                    record.$form.setFieldsValue({
                      purchaseAgentName: lovRecord.purchaseAgentName,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hiam.defaultValueConfig.view.model.inventoryOrg').d('库存组织'),
        dataIndex: 'organizationName',
        width: 150,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`organizationId`, {
                initialValue: record.organizationId,
              })(
                <Lov
                  code="HIAM.USER_MAINTAIN_INVORG"
                  textValue={record.organizationName}
                  queryParams={{ userId, tenantId, ouId: record.$form.getFieldValue('ouId') }}
                  onChange={(_, lovRecord) => {
                    record.$form.registerField('organizationName');
                    record.$form.registerField('inventoryName');
                    record.$form.setFieldsValue({
                      organizationName: lovRecord.organizationName,
                      inventoryId: null,
                      inventoryName: null,
                    });
                  }}
                  disabled={!record.$form.getFieldValue('ouId')}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        // inventoryId, inventoryCode, inventoryName
        title: intl.get('hiam.defaultValueConfig.view.model.inventoryId').d('库房'),
        dataIndex: 'inventoryName',
        width: 150,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`inventoryId`, {
                initialValue: record.inventoryId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.INVENTORY"
                  textValue={record.inventoryName}
                  queryParams={{ userId, tenantId, invOrganizationId: record.$form.getFieldValue('organizationId') }}
                  onChange={(_, lovRecord) => {
                    record.$form.registerField('inventoryName');
                    record.$form.setFieldsValue({
                      inventoryName: lovRecord.inventoryName,
                    });
                  }}
                  disabled={!record.$form.getFieldValue('organizationId')}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 150,
        align: 'left',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag,
              })(<Switch checkedValue={1} unCheckedValue={0} />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
  }

  // 新建行
  @Bind()
  addData() {
    const { dispatch, userId, tenantId } = this.props;
    dispatch({
      type: 'userInfo/updateState',
      payload: {
        defaultValueArr: [
          {
            userId,
            tenantId,
            enabledFlag: 1,
            _status: 'create',
          },
        ],
      },
    });
  }

  // 保存
  @Bind()
  handleSave() {
    const { dispatch, userInfo } = this.props;
    const { defaultValueArr } = userInfo;
    const params = getEditTableData(defaultValueArr);
    if (params) {
      if (params[0]._status === 'create') {
        dispatch({
          type: 'userInfo/createDefaultValue',
          payload: params[0],
        }).then((data) => {
          if (data && data.id) {
            notification.success();
          }
          this.getDefaultValue();
        });
      } else if (params[0]._status === 'update') {
        dispatch({
          type: 'userInfo/updateDefaultValue',
          payload: params[0],
        }).then((data) => {
          if (data && data.id) {
            notification.success();
          }
          this.getDefaultValue();
        });
      }
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { searchLoading = false, saveLoading = false, userInfo } = this.props;
    const columns = this.getColumns();
    const { defaultValueArr = [] } = userInfo;
    return (
      <div>
        <div style={{ marginBottom: '24px', textAlign: 'right' }}>
          {defaultValueArr.length !== 0 ? (
            <Button onClick={() => this.handleSave()}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : null}
          <Button disabled={defaultValueArr.length} color="primary" onClick={() => this.addData()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          rowKey="id"
          loading={searchLoading || saveLoading}
          dataSource={defaultValueArr}
          columns={columns}
          pagination={false}
          bordered
        />
      </div>
    );
  }
}
