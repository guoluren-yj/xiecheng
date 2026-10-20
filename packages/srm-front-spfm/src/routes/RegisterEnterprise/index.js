/**
 * RegisterEnterprise --注册企业查询
 * @date: 2020-12-2
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Table, Form, Input, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import moment from 'moment';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import { getDateFormat, tableScrollWidth, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_PLATFORM } from '_utils/config';
import {
  DATETIME_MIN,
  DATETIME_MAX,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';

const FormItem = Form.Item;
// const RadioButton = Radio.Button;
// const RadioGroup = Radio.Group;
@connect(({ loading, registerEnterprise }) => ({
  registerEnterprise,
  fetchLoading: loading.effects['registerEnterprise/fetchEnterprise'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['spfm.common', 'spfm.registerEnterprise'] })
export default class Notice extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isExpendSearch: false,
      sortedInfo: null,
    };
  }

  componentDidMount() {
    this.fetchEnterprise();
  }

  /**
   * @function fetchEmail - 获取注册企业公司
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 页数
   */
  fetchEnterprise(params = {}) {
    const {
      dispatch,
      form,
      registerEnterprise: { pagination = {} },
    } = this.props;
    // 格式化时间
    const { creationDateFrom, creationDateTo } = form.getFieldsValue();
    const dateParams = {
      creationDateFrom: creationDateFrom && moment(creationDateFrom).format(DATETIME_MIN),
      creationDateTo: creationDateTo && moment(creationDateTo).format(DATETIME_MAX),
    };
    dispatch({
      type: 'registerEnterprise/fetchEnterprise',
      payload: {
        page: pagination,
        ...form.getFieldsValue(),
        ...dateParams,
        ...params,
      },
    });
  }

  /**
   * 表格变化时，分页切换
   * @param {object} pagination 分页信息
   * @param {object} filters 条件过滤
   * @param {object} sorter  排序规则
   */
  @Bind()
  handlePagination(pagination, _, sorter = {}) {
    const { field, order } = sorter;
    this.fetchEnterprise({
      page: pagination,
      sort:
        field === undefined || field === undefined
          ? {}
          : {
              field,
              order,
            },
    });
  }

  /**
   * @function handleExpendSearch - 显示高级查询条件
   * @param {boolean} flag - 显示高级查询标识
   */
  @Bind()
  handleExpendSearch() {
    const { isExpendSearch } = this.state;
    this.setState({ isExpendSearch: !isExpendSearch });
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * @function handleSearch - 搜索
   */
  @Bind()
  handleSearch() {
    this.fetchEnterprise({ page: {} });
  }

  /**
   * @function renderFilterForm - 渲染筛选查询表单
   */
  @Bind()
  renderFilterForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { isExpendSearch } = this.state;
    return (
      <Form>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.registerEnterprise.model.view.companyName').d('企业名称')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyName')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.registerEnterprise.model.view.phone').d('手机号码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('phone')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.registerEnterprise.model.view.email').d('邮箱')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('email')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: isExpendSearch ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.common.model.view.unifiedSocialCode').d('统一社会信用码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('unifiedSocialCode')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spfm.common.model.view.organizingInstitutionCode')
                    .d('组织机构代码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('organizingInstitutionCode')(
                    <Input style={{ width: '100%' }} />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.common.model.view.dunsCode').d('邓白氏编码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('dunsCode')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spfm.common.model.view.businessRegistrationNumber')
                    .d('商业注册登记号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('businessRegistrationNumber')(
                    <Input style={{ width: '100%' }} />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('spfm.registerEnterprise.model.view.loginName').d('子账户账号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('loginName')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spfm.registerEnterprise.model.view.creationDateFrom')
                    .d('注册日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('creationDateTo') &&
                        moment(form.getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('spfm.registerEnterprise.model.view.creationDateTo')
                    .d('注册日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        form.getFieldValue('creationDateFrom') &&
                        moment(form.getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleExpendSearch}>
                {isExpendSearch
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return {
      ...filterValues,
      creationDateFrom: filterValues.creationDateFrom
        ? filterValues.creationDateFrom.format(DATETIME_MIN)
        : undefined,
      creationDateTo: filterValues.creationDateTo
        ? filterValues.creationDateTo.format(DATETIME_MAX)
        : undefined,
    };
  }

  render() {
    const {
      fetchLoading,
      registerEnterprise: { enterpriseList = [], pagination = {} },
    } = this.props;
    const { sortedInfo } = this.state;
    const otherButtonProps = {
      icon: 'export',
      type: 'default',
    };
    const columns = [
      {
        title: intl.get('spfm.common.model.view.processStatus').d('处理状态'),
        dataIndex: 'processStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.companyName').d('企业名称'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.loginName').d('子账户账号'),
        width: 100,
        dataIndex: 'loginName',
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.realName').d('用户名称'),
        width: 100,
        dataIndex: 'realName',
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.countryName').d('注册国家'),
        width: 100,
        dataIndex: 'countryName',
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.phone').d('手机号码'),
        width: 140,
        dataIndex: 'phone',
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.email').d('邮箱'),
        width: 160,
        dataIndex: 'email',
      },

      {
        title: intl.get('spfm.common.model.view.unifiedSocialCode').d('统一社会信用码'),
        width: 180,
        dataIndex: 'unifiedSocialCode',
      },
      {
        title: intl.get('spfm.common.model.view.organizingInstitutionCode').d('组织机构代码'),
        width: 120,
        dataIndex: 'organizingInstitutionCode',
      },
      {
        title: intl.get('spfm.common.model.view.dunsCode').d('邓白氏编码'),
        width: 120,
        dataIndex: 'dunsCode',
      },
      {
        title: intl.get('spfm.common.model.view.businessRegistrationNumber').d('商业注册登记号'),
        width: 120,
        dataIndex: 'businessRegistrationNumber',
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.creationDate').d('企业注册时间'),
        width: 150,
        sorter: (a, b) => a.creationDate - b.creationDate,
        sortOrder: sortedInfo === 'creationDate' && sortedInfo.order,
        dataIndex: 'creationDate',
      },
      {
        title: intl.get('spfm.registerEnterprise.model.view.tenantName').d('注册域名所属租户'),
        width: 200,
        dataIndex: 'tenantName',
      },
      {
        title: intl.get(`spfm.common.model.createDate`).d('创建时间'),
        width: 150,
        dataIndex: 'basicCreationDate',
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.registerEnterprise.view.message.title').d('注册企业查询')}>
          <ExcelExport
            requestUrl={`${SRM_PLATFORM}/v1/guest-user/export`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={otherButtonProps}
          />
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            bordered
            loading={fetchLoading}
            dataSource={enterpriseList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
        </Content>
      </React.Fragment>
    );
  }
}
