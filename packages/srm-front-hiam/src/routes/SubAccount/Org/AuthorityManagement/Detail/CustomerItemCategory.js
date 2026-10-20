/**
 * SupplierType - 租户级权限维护tab页 - 公司
 * @date: 2018-7-31
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Button, Form, Input, Row, Col, Tooltip, Switch } from 'hzero-ui';
import Table from '@/components/VirtualTable';

import notification from 'utils/notification';
// import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import Lov from 'components/Lov';

import styles from './index.less';
/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 租户级权限管理 - 供应商分类
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityCustomerItemCategory - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityCustomerItemCategory = {}, loading }) => ({
  authorityCustomerItemCategory,
  updateLoading: loading.effects['authorityCustomerItemCategory/updateSupplierCategory'],
  refreshLoading: loading.effects['authorityCustomerItemCategory/queryCustomerItemCategory'],
  fetchLoading: loading.effects['authorityCustomerItemCategory/fetchHeader'],
  updateFlagLoading: loading.effects['authorityPurorg/addAuthorityPurorg'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
export default class SupplierType extends PureComponent {
  /**
   *Creates an instance of Company.
   * @param {Object} props 属性
   * @memberof Company
   */
  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      queryParams: {},
      collapsed: false,
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (
      this.preAuthRoleId !== authRoleId &&
      activeKey === 'CUSTOMER_ITEM_CATEGORY' &&
      !isNil(userId)
    ) {
      this.preAuthRoleId = authRoleId;
      this.fetchLov().then((res) => {
        if (res) {
          this.queryValue();
        }
      });
    }
  }

  componentDidUpdate() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (
      this.preAuthRoleId !== authRoleId &&
      activeKey === 'CUSTOMER_ITEM_CATEGORY' &&
      !isNil(userId)
    ) {
      this.preAuthRoleId = authRoleId;
      this.fetchLov().then((res) => {
        if (res) {
          this.queryValue();
        }
      });
    }
  }

  @Bind()
  fetchLov() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'authorityCustomerItemCategory/fetchLov',
      payload: {
        lovCode: 'SPFM.CUSTOMER_TENANT',
        tenantId: getCurrentOrganizationId(),
      },
    });
  }

  /**
   *刷新数据
   */
  @Bind()
  refreshValue() {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { queryParams } = this.state;
    dispatch({
      type: 'authorityCustomerItemCategory/queryCustomerItemCategory',
      payload: {
        userId,
        authRoleId,
        ...queryParams,
      },
    });
  }

  /**
   *保存
   */
  @Bind()
  campanySave() {
    const {
      dispatch,
      authorityCustomerItemCategory: { checkList = [], originList = [] },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { customerTenantId = -1 } = this.state;
    dispatch({
      type: 'authorityCustomerItemCategory/updateCustomerItemCategory',
      payload: {
        checkList: originList.filter((item) => checkList.includes(item.dataId)),
        userId,
        customerTenantId,
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.queryValue();
        notification.success();
      }
    });
  }

  /**
   *查询数据
   */
  @Bind()
  queryValue() {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.setState({
          queryParams: fieldsValue,
          expanded: false,
        });
        dispatch({
          type: 'authorityCustomerItemCategory/fetchHeader',
          payload: {
            authorityTypeCode: 'CUSTOMER_ITEM_CATEGORY',
            userId,
          },
        });
        dispatch({
          type: 'authorityCustomerItemCategory/queryCustomerItemCategory',
          payload: {
            ...fieldsValue,
            userId,
            authRoleId,
          },
        }).then((res) => {
          if (res) {
            const { customerTenantId } = fieldsValue;
            this.setState({ customerTenantId });
          }
        });
      }
    });
  }

  /**
   *设置选中
   *
   * @param {*Array} rows 选中的行
   */
  @Bind()
  setSelectRows(rows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'authorityCustomerItemCategory/updateCheckList',
      payload: rows,
    });
  }

  /**
   *表格选中事件
   *
   * @param {*} _ 占位
   * @param {*Array} rows 选中行数据
   */
  @Bind()
  handleSelectRows(selectedRowKeys) {
    this.setSelectRows(selectedRowKeys);
  }

  /**
   *点击展开节点触发方法
   *
   * @param {*Boolean} expanded 展开收起标志
   * @param {*Object} record 行记录
   */
  @Bind()
  onExpand(expanded, record = {}) {
    const {
      dispatch,
      authorityCustomerItemCategory: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'authorityCustomerItemCategory/updateExpanded',
      payload: expanded
        ? expandedRowKeys.concat(record.dataId)
        : expandedRowKeys.filter((o) => o !== record.dataId),
    });
  }

  /**
   *全部展开和收起
   */
  @Bind()
  handleExpand() {
    const {
      dispatch,
      authorityCustomerItemCategory: { originList = [] },
    } = this.props;
    const { expanded } = this.state;
    dispatch({
      type: 'authorityCustomerItemCategory/updateExpanded',
      payload: expanded ? originList.map((list) => list.dataId) : [],
    });
    this.setState({
      expanded: !expanded,
    });
  }

  /**
   *选中父级后同时选中子集
   *
   * @param {*Object} record 当前操作的行
   * @param {*boolean} selected 选中标记
   * @param {*Array} selectedRows 已经选中行数据
   */
  @Bind()
  selectChilds(record = {}, selected) {
    let { parentCategoryId = -1 } = record;
    const { children = [], dataId = -1 } = record;
    const selectArr = [dataId];
    const { authorityCustomerItemCategory = {} } = this.props;
    const { originList = [], checkList = [] } = authorityCustomerItemCategory;
    (function pushAll(arr) {
      if (arr && arr.length) {
        arr.forEach((element) => {
          selectArr.push(element.dataId);
          if (element.children) {
            pushAll(element.children);
          }
        });
      }
    })(children);
    if (selected) {
      while (parentCategoryId > 0) {
        const temporaryList = originList.filter(
          // eslint-disable-next-line no-loop-func
          (item) => item.dataId === parentCategoryId
        );
        if (temporaryList.length >= 1) {
          selectArr.push(parentCategoryId);
          parentCategoryId = temporaryList[0].parentCategoryId || -1;
        } else {
          break;
        }
      }
      this.setSelectRows([...checkList, ...selectArr]);
    } else {
      this.setSelectRows(checkList.filter((item) => !selectArr.includes(item)));
    }
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
      authorityCustomerItemCategory: { header = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPurorg/addAuthorityPurorg',
      payload: {
        authorityTypeCode: 'CUSTOMER_ITEM_CATEGORY',
        userId,
        userAuthority: {
          ...header,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then((response) => {
      if (response) {
        dispatch({
          type: 'authorityCustomerItemCategory/fetchHeader',
          payload: {
            authorityTypeCode: 'CUSTOMER_ITEM_CATEGORY',
            userId,
          },
        });
        notification.success();
      }
    });
  }

  /**
   * 展开或收起表单
   * @memberof Search
   */
  @Bind()
  toggleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form, authorityCustomerItemCategory = {} } = this.props;
    const { firstTenant } = authorityCustomerItemCategory;
    const { tenantId: firstTenantId = -1, tenantName } = firstTenant;
    form.resetFields();
    form.setFieldsValue({ customerTenantId: firstTenantId, tenantName });
  }

  /**
   *渲染查询结构
   *
   * @returns
   */
  renderForm() {
    const {
      updateLoading,
      authorityCustomerItemCategory,
      form,
      fetchLoading,
      updateFlagLoading,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { collapsed } = this.state;
    const { firstTenant, header = {} } = authorityCustomerItemCategory;
    const { tenantId: firstTenantId = -1, tenantName = '' } = firstTenant;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('hiam.authorityManagement.model.authorityCustomer.customerTenantName')
                    .d('客户租户')}
                >
                  {getFieldDecorator('customerTenantId', {
                    initialValue: firstTenantId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(
                              'hiam.authorityManagement.model.authorityCustomer.customerTenantName'
                            )
                            .d('客户租户'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      code="SPFM.CUSTOMER_TENANT"
                      textField="tenantName"
                      textValue={tenantName}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.customerItemCategory.customerItemCategory')
                    .d('客户物料品类')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('dataName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.customerItemCategory.code')
                    .d('品类编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('dataCode')(
                    <Input trim inputChinese={false} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: collapsed ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.customerItemCategory.companyName')
                    .d('客户公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('customerCompanyId')(
                    <Lov
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        customerTenantId: getFieldValue('customerTenantId'),
                      }}
                      code="SPFM.PARTNER_TENANT_COMPANY"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleCollapse}>
                {collapsed
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.queryValue}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <FormItem className={styles.rightbtn}>
            {/* <Button onClick={() => this.handleExpand()}>
              {expanded
                ? intl.get('hzero.common.button.expand').d('展开')
                : intl.get('hzero.common.button.up').d('收起')}
            </Button> */}
            <Button type="primary" loading={updateLoading} onClick={() => this.campanySave()}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <div style={{ display: 'inline-block', margin: '0 8px 16px' }}>
              <span style={{ marginRight: '8px' }}>
                {intl.get('hiam.authority.view.message.label').d('加入全部:')}
              </span>
              <Tooltip
                title={intl
                  .get('hiam.authority.view.message.title.tooltip.includeAllCustomerItemCategory')
                  .d('“加入全部”即将所有客户物料品类权限自动添加至当前账户，无需再手工添加。')}
                placement="right"
              >
                <Switch
                  loading={updateLoading || fetchLoading || updateFlagLoading}
                  checked={!!header.includeAllFlag}
                  disabled={updateFlagLoading}
                  onChange={this.includeAllFlag}
                />
              </Tooltip>
            </div>
          </FormItem>
        </Row>
      </Form>
    );
  }

  /**
   *渲染方法
   *
   * @returns
   */
  render() {
    // const {
    // queryParams: { userId },
    // } = this.props;
    // if (isNil(userId)) {
    //   return (
    //     <h3 style={{ color: 'gray', marginTop: '10%', textAlign: 'center' }}>
    //       {intl
    //         .get('hiam.authorityManagement.model.authorityManagement.noSupport')
    //         .d('此功能不适用')}
    //     </h3>
    //   );
    // }
    const {
      fetchLoading = false,
      refreshLoading = false,
      authorityCustomerItemCategory = {},
    } = this.props;
    const { data = [], expandedRowKeys = [], checkList = [] } = authorityCustomerItemCategory;
    const columns = [
      {
        title: intl.get('hiam.authorityManagement.model.customerItemCategory.code').d('品类编码'),
        dataIndex: 'dataCode',
        flexGrow: 1,
      },
      {
        title: intl.get('hiam.authorityManagement.model.customerItemCategory.name').d('品类名称'),
        dataIndex: 'dataName',
        width: 300,
        resizable: true,
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.customerItemCategory.companyName')
          .d('客户公司'),
        dataIndex: 'companyName',
        width: 400,
        resizable: true,
      },
    ];
    const rowSelection = {
      selectedRowKeys: checkList,
      onChange: this.handleSelectRows,
      onSelect: this.selectChilds,
    };
    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          bordered
          rowKey="dataId"
          pagination={false}
          loading={fetchLoading || refreshLoading}
          data={data}
          rowSelection={rowSelection}
          expandedRowKeys={expandedRowKeys}
          columns={columns}
          height={600}
          // scroll={{ x: tableScrollWidth(columns) }}
          // rowClassName={(record) =>
          //   checkList.find((list) => list.dataId === record.dataId) ? 'row-active' : 'row-noactive'
          // }
          onExpandChange={this.onExpand}
        />
      </div>
    );
  }
}
