/**
 * Purcat - 租户级权限维护tab页 - 采购品类
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch, Table, Checkbox, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil, isArray, isObject } from 'lodash';
import { DataSet, Table as CTable, Modal as CModal, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import notification from 'utils/notification';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { transformTreeToArr } from '@/utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 采购品类
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityPurcatSrm - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@connect(({ authorityPurcatSrm, loading }) => ({
  authorityPurcatSrm,
  addLoading: loading.effects['authorityPurcatSrm/addAuthorityPurcat'],
  fetchLoading: loading.effects['authorityPurcatSrm/fetchAuthorityPurcat'],
  fetchModalLoading: loading.effects['authorityPurcatSrm/fetchModalData'],
}))
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
export default class Purcat extends PureComponent {
  purcatRef;

  /**
   *Creates an instance of Purcat.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      selectRows: [],
      switchLoading: false,
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'PURCHASE_CATEGORY' && !isNil(userId)) {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  componentDidUpdate() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'PURCHASE_CATEGORY' && !isNil(userId)) {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  /**
   *查询数据
   *
   * @param {*Object} pageData
   */
  @Bind()
  fetchData(pageData = {}) {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const staticData = {
      userId,
      authorityTypeCode: 'PURCHASE_CATEGORY',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityPurcatSrm/fetchAuthorityPurcat',
          payload: {
            authRoleId,
            ...fieldsValue,
            ...staticData,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 添加数据
   * @param {Aarray} addRows 选择的数据
   */
  @Bind()
  addPurcat(tableDs) {
    const { updated } = tableDs;
    const {
      dispatch,
      authorityPurcatSrm: { head = {} },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityPurcatSrm/addAuthorityPurcat',
      payload: {
        authorityTypeCode: 'PURCHASE_CATEGORY',
        userId,
        userAuthority: head,
        userAuthorityLineList: updated.map((ele) => ({ ...ele.toData(), children: undefined })),
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        CModal.destroyAll();
        this.refresh();
      }
    });
  }

  /**
   *删除方法
   */
  @Bind()
  remove() {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { selectRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'authorityPurcatSrm/deleteAuthorityPurcat',
        payload: {
          userId,
          deleteRows: selectRows,
          authRoleId,
        },
      }).then((response) => {
        if (response) {
          this.refresh();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   *刷新
   */
  @Bind()
  refresh() {
    this.fetchData();
    this.setState({
      selectRows: [],
    });
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectRows: selectedRows });
  }

  /**
   * 查询弹出框数据
   * @param {Object} queryData 查询数据
   */
  @Bind()
  fetchModalData(queryData = {}) {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityPurcatSrm/fetchModalData',
      payload: {
        userId,
        authRoleId,
        ...queryData,
      },
    });
  }

  @Bind()
  handleTransformResponse(resp) {
    let data = [];
    try {
      const result = JSON.parse(resp);
      if (isObject(result) && isArray(result.content) && result.content.length > 0) {
        result.content = this.transformResponseData(result.content);
        data = result;
      } else if (isArray(result) && result.length > 0) {
        data = this.transformResponseData(result);
      } else {
        data = result;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return data;
    }
  }

  @Bind()
  transformResponseData(response) {
    let data = response;
    data = transformTreeToArr(data, 'dataId', 'children', 'dataId', 'parentDataId');
    return data;
  }

  /**
   * 展示弹出框
   */
  @Bind()
  onShowAddModal() {
    const {
      queryParams: { userId },
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    const tableDs = new DataSet({
      pageSize: 20,
      autoQuery: true,
      cacheSelection: true,
      cacheModified: true,
      paging: 'server',
      idField: 'dataId',
      primaryKey: 'dataId',
      parentField: 'parentDataId',
      treeCheckStrictly: false,
      selectionStrategy: 'SHOW_CHILD',
      fields: [
        {
          name: 'dataCode',
          type: 'string',
          label: intl.get('hiam.authorityManagement.model.authorityPurcat.dataCode').d('品类代码'),
        },
        {
          name: 'dataName',
          type: 'string',
          label: intl.get('hiam.authorityManagement.model.authorityPurcat.dataName').d('品类名称'),
        },
      ],
      queryFields: [
        {
          name: 'dataCode',
          type: 'string',
          label: intl.get('hiam.authorityManagement.model.authorityPurcat.dataCode').d('品类代码'),
        },
        {
          name: 'dataName',
          type: 'string',
          label: intl.get('hiam.authorityManagement.model.authorityPurcat.dataName').d('品类名称'),
        },
        // {
        //   name: 'customerTenantId',
        //   type: 'object',
        //   lovCode: 'SPFM.CUSTOMER_TENANT',
        //   transformRequest: (value) => value && value?.tenantId,
        //   label: intl.get(`hiam.roleManagement.model.roleManagement.tenant`).d('所属租户'),
        // },
      ],
      record: {
        dynamicProps: {
          selectable: (record) => String(record.get('editFlag')) === '1',
          isSelected: (record) => String(record.get('checkedFlag')) === '1',
        },
      },
      transport: {
        read: () => {
          return {
            url: `${SRM_MDM}/v1/${organizationId}/item-categories/category-user-authority/${userId}?userId=${userId}`,
            method: 'GET',
            transformResponse: this.handleTransformResponse,
          };
        },
      },
      events: {
        batchSelect: ({ dataSet, records }) => {
          console.log('aaa');
          if (dataSet.getState('autoSelectChliren') === 1 && records.length === 1) {
            records.forEach((record) => {
              record.set({
                checkedFlag: 1,
              });
            });
            const recordArr = [];
            const autoAllchildRecord = (record) => {
              if (record.children) {
                recordArr.push(...record.children);
                record.children.forEach((data) => {
                  autoAllchildRecord(data);
                });
              }
            };
            autoAllchildRecord(records[0]);
            dataSet.batchSelect(recordArr);
          } else {
            records.forEach((record) => {
              record.set({
                checkedFlag: 1,
              });
            });
          }
        },
        batchUnSelect: ({ dataSet, records }) => {
          console.log('bbb');
          if (dataSet.getState('autoSelectChliren') === 1 && records.length === 1) {
            records.forEach((record) => {
              record.set({
                checkedFlag: 0,
              });
            });
            records.forEach((record) => {
              if (record.children) {
                dataSet.treeUnSelect(record);
              }
            });
          } else {
            records.forEach((record) => {
              record.set({
                checkedFlag: 0,
              });
            });
          }
        },
        load: ({ dataSet }) => {
          dataSet.forEach((record) => {
            if (record.getPristineValue('checkedFlag') === 1) {
              // eslint-disable-next-line no-param-reassign
              record.isSelected = true;
            }
          });
        },
      },
    });
    const formDs = new DataSet({
      autoQuery: false,
      dataKey: null,
      fields: [
        {
          name: 'autoSelectChliren',
          label: intl
            .get('hiam.authorityManagement.view.title.modal.autoSelectChliren')
            .d('是否默认勾选子级'),
          type: 'boolean',
          defaultValue: 0,
          trueValue: 1,
          falseValue: 0,
        },
      ],
      events: {
        update: ({ value }) => {
          tableDs.setState({
            autoSelectChliren: value,
          });
        },
      },
    });
    formDs.loadData([]);
    formDs.create({ autoSelectChliren: 0 });
    const columns = [
      {
        name: 'dataName',
      },
      {
        name: 'dataCode',
      },
    ];
    CModal.open({
      key: CModal.key(),
      title: intl.get('hiam.authorityManagement.view.title.modal.purcat').d('选择采购品类'),
      children: (
        <CTable
          mode="tree"
          dataSet={tableDs}
          virtual
          columns={columns}
          buttons={[
            <CheckBox dataSet={formDs} name="autoSelectChliren">
              {intl
                .get('hiam.authorityManagement.view.title.modal.autoSelectChliren')
                .d('是否默认勾选子级')}
            </CheckBox>,
          ]}
          queryFieldsLimit={2}
          style={{ maxHeight: '500px' }}
        />
      ),
      closable: true,
      maskClosable: true,
      onOk: () => this.addPurcat(tableDs),
      style: { width: '750px' },
      onCancel: () => {},
    });
  }

  /**
   *点击查询按钮事件
   */
  @Bind()
  queryValue() {
    this.fetchData();
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    this.fetchData({
      page: pagination,
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   *点击包含空值后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    const {
      dispatch,
      queryParams: { userId },
      authorityPurcatSrm: { head = {} },
      authRoleId,
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPurcatSrm/addAuthorityPurcat',
      payload: {
        authorityTypeCode: 'PURCHASE_CATEGORY',
        userId,
        userAuthority: {
          ...head,
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.refresh();
        notification.success();
        this.setState({
          switchLoading: false,
        });
      }
    });
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked) {
    const {
      dispatch,
      queryParams: { userId },
      authorityPurcatSrm: { head = {} },
      authRoleId,
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPurcatSrm/addAuthorityPurcat',
      payload: {
        authorityTypeCode: 'PURCHASE_CATEGORY',
        userId,
        userAuthority: {
          ...head,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.refresh();
        notification.success();
        this.setState({
          switchLoading: false,
        });
      }
    });
  }

  /**
   *渲染查询结构
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityPurcat.dataName').d('品类名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityPurcat.dataCode').d('品类代码')}
        >
          {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
        </FormItem>
        <FormItem>
          <Button style={{ marginRight: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.purcatRef = ref;
  }

  /**
   *渲染事件
   *
   * @returns
   */
  render() {
    const {
      queryParams: { userId },
    } = this.props;
    if (isNil(userId)) {
      return (
        <h3 style={{ color: 'gray', marginTop: '10%', textAlign: 'center' }}>
          {intl
            .get('hiam.authorityManagement.model.authorityManagement.noSupport')
            .d('此功能不适用')}
        </h3>
      );
    }
    const {
      authorityPurcatSrm: { list = [], head = {}, pagination = {} },
      fetchLoading,
    } = this.props;
    const { switchLoading, selectRows } = this.state;
    const columns = [
      {
        title: intl.get('hiam.authorityManagement.model.authorityPurcat.dataName').d('品类名称'),
        dataIndex: 'dataName',
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityPurcat.dataCode').d('品类代码'),
        dataIndex: 'dataCode',
        width: 300,
      },
    ];

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectRows.map((n) => n.authorityLineId),
    };

    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', margin: '0 24px 16px 0' }}>
            <Tooltip
              title={intl
                .get('hiam.authority.view.message.nullValue.tooltip')
                .d('勾选后，单据中该维度字段为空该用户可查询到')}
            >
              <span style={{ marginRight: '8px' }}>
                {intl.get('hiam.authority.view.message.nullValue').d('包含空值')}
                <Icon type="question-circle" style={{ margin: '0 4px' }} />:
              </span>
              <Checkbox onChange={this.includeNullFlag} checked={head.includeNullFlag || 0} />
            </Tooltip>
          </div>
          {!head.includeAllFlag && (
            <React.Fragment>
              <Button style={{ margin: '0 8px 16px 0' }} onClick={() => this.onShowAddModal()}>
                {intl
                  .get('hiam.authorityManagement.view.button.table.create.purcat')
                  .d('新建采购品类权限')}
              </Button>
              <Button
                style={{ margin: '0 8px 16px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.purcat')
                  .d('删除采购品类权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip')
                .d('“加入全部”即将所有品类权限自动添加至当前账户，无需再手工添加。')}
              placement="right"
            >
              <Switch
                switchLoading={switchLoading}
                checked={!!head.includeAllFlag}
                onChange={this.includeAllFlag}
              />
            </Tooltip>
          </div>
        </div>
        <Table
          bordered
          rowKey="authorityLineId"
          loading={fetchLoading}
          dataSource={list}
          columns={columns}
          rowSelection={rowSelection}
          pagination={pagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}
