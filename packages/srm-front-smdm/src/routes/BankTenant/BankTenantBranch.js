import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Input, Button, Checkbox, Modal, Form, Select, Row, Col } from 'hzero-ui';
import { map, filter } from 'lodash';
import { Bind, debounce } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import uuid from 'uuid/v4';
import qs from 'querystring';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
// import OptionInput from 'components/OptionInput';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';
import { enableRender } from 'utils/renderer';
import {
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEBOUNCE_TIME, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import styles from './index.less';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@withCustomize({
  unitCode: ['SMDM.BANK_TENANT_BRANCH.TABLE', 'SMDM.BANK_TENANT_BRANCH.FILTER'],
})
@connect(({ loading, bankTenant }) => ({
  saving:
    loading.effects['bankTenant/updateBankBranchList'] ||
    loading.effects['bankTenant/fetchBankBranchList'],
  fetching:
    loading.effects['bankTenant/initBankBranch'] ||
    loading.effects['bankTenant/fetchBankBranchList'],
  bankTenant,
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smdm.bank', 'smdm.commom'] })
@Form.create({ fieldNameProp: null })
export default class BankTenantBranch extends React.Component {
  state = {
    // 有可能需要在用户 翻页/查询 的时候阻止 翻页/查询
    // table 的 pagination 改变 不一定会触发页面的重绘,但是 table 的pagination更改了
    pagination: { current: 1, page: 10, total: 0 },
    // list 存着以便判断 list 是否更改
    list: {},
    expandForm: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = {};
    const { list } = nextProps.bankTenant.branch;
    // 经过查询后 list 会不同, 使用新的 dataSource 和 tablePagination
    if (list && list !== prevState.list) {
      nextState.list = list;
      nextState.tablePagination = createPagination(list);
      nextState.dataSource = list.content || [];
    }
    return nextState;
  }

  /**
   * 组件加载完成后, 加载枚举和数据
   */
  componentDidMount() {
    const { bankId } = this.props.match.params;
    if (bankId === undefined) {
      // 不是通过正规途径跳转到分行页面
      Modal.error({
        content: intl.get('smdm.bank.view.message.safeAccess').d('请保证正确的银行'),
        onOk: () => {
          this.props.dispatch(routerRedux.push('/smdm/bank-tenant/list'));
        },
      });
      return;
    }
    // this.init(bankId);
    this.fetchEnum();
    this.queryList();
  }

  @Bind()
  fetchEnum() {
    this.props.dispatch({
      type: 'bankTenant/fetchEnums',
    });
  }

  /**
   * 查询数据
   * @param {Object} pagination={} 分页信息
   */
  @Bind()
  queryList(pagination = {}) {
    const {
      dispatch,
      form,
      organizationId,
      match: {
        params: { bankId },
      },
    } = this.props;
    this.setState({ pagination });
    const formValues = form.getFieldsValue();
    dispatch({
      type: 'bankTenant/fetchBankBranchList',
      payload: {
        pagination,
        bankId,
        organizationId,
        params: {
          ...formValues,
          address: formValues.address,
          enabledFlag: formValues.enabledFlag,
          customizeUnitCode: 'SMDM.BANK_TENANT_BRANCH.TABLE,SMDM.BANK_TENANT_BRANCH.FILTER',
        },
      },
    });
  }

  /**
   * table 分页改变触发
   */
  @Bind()
  handleStandardTableChange(pagination, filtersArg, sorter) {
    this.checkUpdateData().then(
      () => {
        this.realStandardTableChange(pagination, filtersArg, sorter);
      },
      () => {
        // 因为 需要还原 Table 的 分页信息
        this.forceUpdate();
      }
    );
  }

  /**
   * 真正的触发 Table 分页改变的查询
   * @param {Object} pagination Antd Table 改变的 分页信息
   * @param {Object} filtersArg Hzero 标准Table 过滤参数
   * @param {Object} sorter Antd Table 排序的字段
   */
  @Bind()
  realStandardTableChange(pagination, filtersArg, sorter) {
    this.queryList({ page: pagination, filter: filtersArg, sort: sorter });
  }

  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  renderSearchForm() {
    const { form, customizeFilterForm } = this.props;
    const { flag = [] } = this.props.bankTenant.enumMap;
    const { expandForm } = this.state;
    // const queryArray = [
    //   {
    //     queryLabel: intl.get('smdm.bank.model.bank.branchBankCode').d('分行代码'),
    //     queryName: 'bankBranchCode',
    //     inputProps: {
    //       inputChinese: false,
    //     },
    //   },
    //   {
    //     queryLabel: intl.get('smdm.bank.model.bank.branchBankName').d('分行名称'),
    //     queryName: 'bankBranchName',
    //   },
    //   {
    //     queryLabel: intl.get('smdm.bank.model.bank.bankFirm').d('联行行号'),
    //     queryName: 'bankFirm',
    //   },
    // ];
    return customizeFilterForm(
      {
        code: 'SMDM.BANK_TENANT_BRANCH.FILTER',
        form,
        expand: expandForm,
      },
      <Form layout="inline">
        <Row {...SEARCH_FORM_ROW_LAYOUT} className="more-fields-search-form">
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.bank.model.bank.branchBankName').d('分行名称')}
                >
                  {form.getFieldDecorator('bankBranchName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.bank.model.bank.bankFirm').d('联行行号')}
                >
                  {form.getFieldDecorator('bankFirm')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.bank.model.bank.branchBankCode').d('分行代码')}
                >
                  {form.getFieldDecorator('bankBranchCode')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            {/* <Form.Item>
          {form.getFieldDecorator('option')(<OptionInput queryArray={queryArray} />)}
        </Form.Item> */}
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.bank.model.bank.address').d('地址')}
                >
                  {form.getFieldDecorator('address')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.bank.model.bank.enabledFlag`).d('是否启用')}
                >
                  {form.getFieldDecorator('enabledFlag', { initialValue: '1' })(
                    <Select allowClear>
                      {flag.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6}>
            <Form.Item className="table-list-operator">
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleResetBtnClick}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-buttons"
                onClick={this.handleSearchBtnClick}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  handleSearchBtnClick() {
    this.queryList();
  }

  @Bind()
  handleResetBtnClick() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 新增按钮点击
   */
  @Bind()
  handleAddBtnClick() {
    const { bankId } = this.props.match.params;
    const { organizationId } = this.props;
    const { tablePagination = {}, dataSource } = this.state;
    const { bankCode } = this.getBankInfo();
    const newRecord = {
      bankId,
      bankCode,
      isCreate: true,
      bankBranchId: `createBranch#${uuid()}`,
      enabledFlag: 1,
      tenantId: organizationId,
      _status: 'create',
    };
    const newDataSource = [newRecord, ...dataSource];
    const nextState = {
      dataSource: newDataSource,
      tablePagination: addItemToPagination(newDataSource.length, tablePagination),
    };

    this.setState(nextState);
  }

  /**
   * 保存按钮点击
   */
  @Bind()
  @debounce(DEBOUNCE_TIME)
  handleSaveBtnClick() {
    const { dataSource = [] } = this.state;
    const editDataSource = filter(dataSource, (r) => r._status);
    if (editDataSource.length === 0) {
      notification.warning({
        message: intl.get('smdm.bank.view.message.noDataModified').d('数据没有修改'),
      });
    } else {
      this.realSaveBtnClickTrigger(editDataSource);
    }
  }

  /**
   * 保存 数据
   */
  @Bind()
  realSaveBtnClickTrigger(editDataSource) {
    const { dispatch } = this.props;
    const saveDataSource = getEditTableData(editDataSource, ['bankBranchId']);
    if (saveDataSource.length === 0) {
      return; // 校验出现错误
    }
    dispatch({
      type: 'bankTenant/updateBankBranchList',
      payload: saveDataSource,
    }).then((res) => {
      if (res) {
        notification.success();
        const { pagination } = this.state;
        this.queryList(pagination);
      }
    });
  }

  /**
   * 检查是否有修改的数据 并提示是否继续后续操作
   * @async
   * @return Promise<null>
   */
  @Bind()
  checkUpdateData() {
    // 不提示信息 直接翻页或者刷新
    return Promise.resolve();
  }

  /**
   * 将记录放入 dataMap 且 变为 编辑
   * @param {Object} record 要改为编辑状态的记录
   */
  @Bind()
  handleChangeRecordEdit(record) {
    const { dataSource = [] } = this.state;
    this.setState({
      dataSource: map(dataSource, (r) => {
        if (r === record) {
          return {
            ...r,
            _status: 'update',
          };
        }
        return r;
      }),
    });
  }

  /**
   * 将 record 变为 非编辑状态
   * @param {Object} record 要取消编辑状态的记录
   */
  @Bind()
  handleChangeRecordCancelEdit(record) {
    const { dataSource = [] } = this.state;
    this.setState({
      dataSource: map(dataSource, (r) => {
        if (r === record) {
          const { _status: _, ...re } = r;
          return re;
        }
        return r;
      }),
    });
  }

  /**
   * 移除新增的分行
   * @param {Object} record 要移除新增的分行信息
   */
  @Bind()
  handleChangeRecordRemoveCreate(record) {
    const { dataSource = [], tablePagination = {} } = this.state;
    if (record._status === 'create') {
      const newDataSource = filter(dataSource, (r) => r !== record);
      this.setState({
        dataSource: newDataSource,
        tablePagination: delItemToPagination(newDataSource.length, tablePagination),
      });
    }
  }

  @Bind()
  getColumns() {
    if (!this.columns) {
      this.columns = [
        {
          title: intl.get('smdm.bank.model.bank.bankCode').d('银行代码'),
          dataIndex: 'bankCode',
          width: 120,
        },
        {
          title: intl.get('smdm.bank.model.bank.branchBankCode').d('分行代码'),
          dataIndex: 'bankBranchCode',
          width: 120,
          render: (item, record) => {
            if (record._status) {
              const { $form } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('bankBranchCode', {
                    initialValue: item,
                    rules: [
                      {
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('smdm.bank.model.bank.branchBankCode').d('分行代码'),
                        }),
                      },
                      {
                        pattern: TRIM,
                        message: intl.get('hzero.common.validate.trim').d('前后不能为空'),
                      },
                    ],
                  })(<Input disabled={!record.isCreate} inputChinese={false} />)}
                </Form.Item>
              );
            }
            return item;
          },
        },
        {
          title: intl.get('smdm.bank.model.bank.bankFirm').d('联行行号'),
          dataIndex: 'bankFirm',
          width: 120,
          render: (item, record) => {
            if (record._status) {
              const { $form } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('bankFirm', {
                    initialValue: item,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('smdm.bank.model.bank.bankFirm').d('联行行号'),
                        }),
                      },
                    ],
                  })(<Input disabled={!!item} />)}
                </Form.Item>
              );
            }
            return item;
          },
        },
        {
          title: intl.get('smdm.bank.model.bank.branchBankName').d('分行名称'),
          dataIndex: 'bankBranchName',
          width: 150,
          render: (item, record) => {
            if (record._status) {
              const { $form, _token } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('bankBranchName', {
                    initialValue: item,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('smdm.bank.model.bank.branchBankName').d('分行名称'),
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get(`smdm.bank.model.bank.branchBankName`).d('分行名称')}
                      field="bankBranchName"
                      token={_token}
                      trim
                    />
                  )}
                </Form.Item>
              );
            }
            return item;
          },
        },
        {
          title: intl.get('smdm.bank.model.bank.address').d('地址'),
          dataIndex: 'address',
          width: 200,
          render: (item, record) => {
            if (record._status) {
              const { $form, _token } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('address', {
                    initialValue: item,
                  })(
                    <TLEditor
                      label={intl.get('smdm.bank.model.bank.address').d('地址')}
                      field="address"
                      token={_token}
                      trim
                    />
                  )}
                </Form.Item>
              );
            }
            return item;
          },
        },
        {
          title: intl.get('smdm.bank.model.bank.contact').d('联系人'),
          dataIndex: 'contact',
          width: 150,
          render: (item, record) => {
            if (record._status) {
              const { $form, _token } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('contact', {
                    initialValue: item,
                  })(
                    <TLEditor
                      label={intl.get('smdm.bank.model.bank.contact').d('联系人')}
                      field="contact"
                      token={_token}
                      trim
                    />
                  )}
                </Form.Item>
              );
            }
            return item;
          },
        },
        {
          title: intl.get('smdm.bank.model.bank.email').d('邮箱'),
          dataIndex: 'email',
          width: 200,
          render: (item, record) => {
            if (record._status) {
              const { $form } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('email', {
                    initialValue: item,
                    rules: [
                      {
                        pattern: EMAIL,
                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              );
            }
            return item;
          },
        },
        {
          title: intl.get('smdm.bank.model.bank.phone').d('电话'),
          dataIndex: 'phone',
          width: 120,
          render: (item, record) => {
            if (record._status) {
              const { $form } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('phone', {
                    initialValue: item,
                    rules: [
                      {
                        pattern: PHONE,
                        message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              );
            }
            return item;
          },
        },
        {
          title: intl.get('smdm.bank.model.bank.enabledFlag').d('启用标志'),
          dataIndex: 'enabledFlag',
          width: 100,
          align: 'center',
          render: (item, record) => {
            if (record._status) {
              const { $form } = record;
              return (
                <Form.Item>
                  {$form.getFieldDecorator('enabledFlag', {
                    initialValue: item !== 0 ? 1 : 0,
                  })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
                </Form.Item>
              );
            }
            return enableRender(item);
          },
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          key: 'operator',
          width: 100,
          align: 'center',
          fixed: 'right',
          noFormItem: true,
          render: (_, record) => {
            let actions = [];
            if (record._status) {
              // 编辑状态
              actions = record.isCreate ? (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.handleChangeRecordRemoveCreate(record);
                  }}
                >
                  {intl.get('hzero.common.button.clean').d('清除')}
                </span>
              ) : (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.handleChangeRecordCancelEdit(record);
                  }}
                >
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </span>
              );
            } else {
              // 非编辑状态
              actions = (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.handleChangeRecordEdit(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </span>
              );
            }
            return <span className="action-link">{actions}</span>;
          },
        },
      ];
    }
    return this.columns;
  }

  /**
   * 获取银行头信息
   */
  @Bind()
  getBankInfo() {
    const {
      location: { search = '' },
    } = this.props;
    const bankInfo = qs.parse(search.substr(1)) || {}; // 需要去掉 search 的 ?
    if (!bankInfo.bankCode) {
      const { dispatch } = this.props;
      notification.warn({
        message: intl.get('smdm.bank.view.message.safeAccess').d('请保证正确的银行'),
      });
      dispatch(
        routerRedux.push({
          pathname: '/smdm/bank-org/list',
        })
      );
    }
    return bankInfo;
  }

  render() {
    const { dataSource = [], tablePagination = false } = this.state;
    const { saving, fetching, customizeTable } = this.props;
    const { bankName } = this.getBankInfo();
    const columns = this.getColumns();
    return (
      <React.Fragment>
        <Header
          title={
            bankName ? `${bankName}-${intl.get('smdm.bank.view.message.branch').d('分行')}` : ' '
          }
          backPath="/smdm/bank-org/list"
        >
          <Button icon="plus" type="primary" onClick={this.handleAddBtnClick}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" loading={saving} onClick={this.handleSaveBtnClick}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderSearchForm()}</div>
          {customizeTable(
            {
              code: 'SMDM.BANK_TENANT_BRANCH.TABLE',
            },
            <EditTable
              bordered
              loading={fetching}
              rowKey="bankBranchId"
              dataSource={dataSource}
              columns={columns}
              pagination={tablePagination}
              onChange={this.handleStandardTableChange}
              className={styles['editable-table']}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
