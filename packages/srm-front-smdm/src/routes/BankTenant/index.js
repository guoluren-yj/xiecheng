/**
 * BankOrg - 银行定义 租户级
 * @description
 * @author WY yang.wang06@hand-china.com
 * @date 2018/10/18
 */

import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Button, Select, Row, Col, Input } from 'hzero-ui';
import { map, filter, isFunction } from 'lodash';
import { debounce, Bind } from 'lodash-decorators';
import qs from 'querystring';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_MDM } from '_utils/config';

import { Header, Content } from 'components/Page';
// import OptionInput from 'components/OptionInput';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Button as PermissionButton } from 'components/Permission';

import CacheComponent from 'components/CacheComponent';
import EditTable from 'components/EditTable';

import {
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  isTenantRoleLevel,
  // getCurrentUser,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEBOUNCE_TIME, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { openTab } from 'utils/menuTab';
import BankForm from './BankForm';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const tenantRoleFlag = isTenantRoleLevel();

@withCustomize({
  unitCode: ['SMDM.BANK_TENANT.FILTER', 'SMDM.BANK_TENANT.TABLE'],
})
@connect(({ loading, bankTenant }) => ({
  bankTenant,
  saving: loading.effects['bankTenant/updateBankHeadList'],
  fetching: loading.effects['bankTenant/fetchBankHeadList'],
  importing: loading.effects['bankTenant/importManual'],
  createBank: loading.effects['bankTenant/createBank'],
  syncBankInfoLoding: loading.effects['bankTenant/syncBankOrgInfo'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['smdm.bank', 'smdm.commom', 'hpfm.bank'] })
@CacheComponent({ cacheKey: '/smdm/bank-org/list' })
export default class BankTenant extends React.Component {
  state = {
    // // 存放修改的数据
    // dataMap: {},
    // 有可能需要在用户 翻页/查询 的时候阻止 翻页/查询
    // table 的 pagination 改变 不一定会触发页面的重绘,但是 table 的pagination更改了
    // displayFlag: false,
    pagination: {},
    // list 存着以便判断 list 是否更改
    list: {},
    modalVisible: false,
    expandForm: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = {};
    const { list } = nextProps.bankTenant;
    if (list && list !== prevState.list) {
      nextState.list = list;
      nextState.tablePagination = createPagination(list);
      // 重新查询后, 需要清空编辑的数据
      nextState.dataSource = map(list.content, (record) => {
        // eslint-disable-next-line
        record._status = 'update';
        return record;
      });
    }
    return nextState;
  }

  /**
   * 组件加载完成后, 加载枚举和数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    // if (getCurrentOrganizationId() === 0) {
    //   this.setState({
    //     displayFlag: false,
    //   });
    // } else {
    //   this.setState({
    //     displayFlag: true,
    //   });
    // }
    this.fetchEnum(['HPFM.BANK_TYPE']);
    // 查询配置表-租户级银行启用租户清单
    dispatch({
      type: 'bankTenant/queryConfigSetting',
    });
    const { pagination = {} } = this.state;
    this.queryList(pagination);
  }

  /**
   * 拉取快码值 todo 将 值集 移入 model
   */
  @Bind()
  fetchEnum() {
    this.props.dispatch({
      type: 'bankTenant/fetchEnums',
    });
  }

  /**
   * 查询按钮点击
   */
  @Bind()
  handleQueryBtnClick(e) {
    if (e && isFunction(e.preventDefault)) {
      e.preventDefault();
    }
    this.checkUpdateData().then(() => {
      this.queryList();
    });
  }

  /**
   * 重置按钮点击
   */
  @Bind()
  handleResetBtnClick() {
    this.props.form.setFieldsValue({
      bankCode: undefined,
      bankName: undefined,
      bankShortName: undefined,
      option: undefined,
      bankTypeCode: undefined,
      enabledFlag: undefined,
    });
  }

  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 渲染查询表单
   */
  @Bind()
  renderForm() {
    const { customizeFilterForm, form } = this.props;
    const { getFieldDecorator } = form;
    const { bankType = [], flag = [] } = this.props.bankTenant.enumMap;
    const { expandForm } = this.state;
    // const queryArray = [
    //   {
    //     queryLabel: intl.get('smdm.bank.model.bank.bankCode').d('银行代码'),
    //     queryName: 'bankCode',
    //     inputProps: {
    //       inputChinese: false,
    //     },
    //   },
    //   {
    //     queryLabel: intl.get('smdm.bank.model.bank.bankName').d('银行名称'),
    //     queryName: 'bankName',
    //   },
    //   {
    //     queryLabel: intl.get('smdm.bank.model.bank.bankShortName').d('银行简称'),
    //     queryName: 'bankShortName',
    //   },
    // ];
    return customizeFilterForm(
      {
        code: 'SMDM.BANK_TENANT.FILTER',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.bank.model.bank.bankCode').d('银行代码')}
                >
                  {getFieldDecorator('bankCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.bank.model.bank.bankName').d('银行名称')}
                >
                  {getFieldDecorator('bankName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.bank.model.bank.bankType').d('银行类型')}
                >
                  {getFieldDecorator('bankTypeCode')(
                    <Select className={styles['form-type']} allowClear>
                      {map(bankType, (item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`smdm.bank.model.bank..enabledFlag`).d('是否启用')}
                >
                  {getFieldDecorator('enabledFlag', { initialValue: '1' })(
                    <Select allowClear>
                      {flag.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleResetBtnClick}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                htmlType="submit"
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={this.handleQueryBtnClick}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 查询数据
   * @param {Object} pagination={pagination: {}} 所有的查询信息
   */
  @Bind()
  queryList(pagination = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldsValue = this.props.form.getFieldsValue();
    const values = fieldsValue;
    const formData = {
      ...values,
      bankTypeCode: values.bankTypeCode,
      enabledFlag: values.enabledFlag,
      customizeUnitCode: 'SMDM.BANK_TENANT.TABLE,SMDM.BANK_TENANT.FILTER',
    };
    this.setState({
      pagination,
    });
    dispatch({
      type: 'bankTenant/fetchBankHeadList',
      payload: { pagination, query: formData, organizationId },
    });
  }

  /**
   * 跳转到分行界面
   * @param {Object} record 挑战的银行
   */
  @Bind()
  handleGoToBranch(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/smdm/bank-org/branch/${record.bankId}`,
        search: qs.stringify({
          bankName: record.bankName,
          bankCode: record.bankCode,
        }),
      })
    );
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

  /**
   * 记录修改的数据
   * @param {Object} updateRecord 被更新的数据
   */
  @Bind()
  handleFlagRecordChange(updateRecord) {
    // eslint-disable-next-line
    updateRecord.isEdit = true;
  }

  /**
   * 导入云级数据点击
   */
  @Bind()
  handleImportDataBtnClick() {
    this.checkUpdateData().then(() => {
      const { dispatch, organizationId } = this.props;
      dispatch({
        type: 'bankTenant/importManual',
        payload: {
          organizationId,
        },
      }).then((res) => {
        if (res) {
          notification.success({
            message: intl.get('smdm.bank.view.message.refSiteSuccess').d('导入银行云级数据成功'),
          });
          const { pagination } = this.state;
          this.queryList(pagination);
        }
      });
    });
  }

  /**
   * 保存按钮点击
   */
  @Bind()
  @debounce(DEBOUNCE_TIME)
  handleSaveBtnClick() {
    const { dataSource = [] } = this.state;
    const editDataSource = filter(dataSource, (r) => r.isEdit);
    if (editDataSource.length === 0) {
      notification.warning({
        message: intl.get('smdm.bank.view.message.noDataModified').d('数据没有修改'),
      });
    } else {
      this.realSaveBtnClickTrigger(editDataSource);
    }
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport(code) {
    const retitle = 'hzero.common.bank.branchImport'; // 分行导入的多语言编码
    openTab({
      key: `/smdm/bank-org/import/${code}`,
      search: qs.stringify({
        key: `/smdm/bank-org/import/${code}`,
        title: retitle,
        action: retitle,
      }),
    });
  }

  /**
   * 保存 数据
   */
  @Bind()
  realSaveBtnClickTrigger(list) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bankTenant/updateBankHeadList',
      payload: {
        list: getEditTableData(list, ['isEdit']),
        organizationId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        const { pagination } = this.state;
        this.queryList(pagination);
      }
    });
  }

  @Bind()
  showCreateForm() {
    this.setState({
      modalVisible: true,
      flag: 1,
    });
  }

  @Bind()
  hideModal() {
    this.setState({
      modalVisible: false,
    });
  }

  @Bind()
  handleAdd(fieldsValue) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bankTenant/createBank',
      payload: {
        tenantId: organizationId,
        ...fieldsValue,
      },
    }).then((response) => {
      if (response) {
        this.hideModal();
        notification.success();
        this.reloadList();
      }
    });
  }

  @Bind()
  reloadList() {
    const { pagination } = this.state;
    this.queryList(pagination);
  }

  /**
   * 检查是否有修改的数据 并提示是否继续后续操作
   * @async
   * @return Promise<null>
   */
  @Bind()
  checkUpdateData() {
    return Promise.resolve();
  }

  @Bind()
  handleSync() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bankTenant/syncBankOrgInfo',
    }).then((res) => {
      if (res) {
        this.queryList();
      }
    });
  }

  @Bind()
  getQueryParams() {
    const fieldsValue = this.props.form.getFieldsValue();
    const values = fieldsValue;
    const formData = {
      ...values,
      bankTypeCode: values.bankTypeCode,
      enabledFlag: values.enabledFlag,
      customizeUnitCode: 'SMDM.BANK_TENANT.TABLE,SMDM.BANK_TENANT.FILTER',
    };
    return formData;
  }

  /**
   * 如果 columns 不依赖别的变量, 则可以单独拿出来 直接写 columns 或者 getColumns()
   * @returns {Object[]}
   */
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
          title: intl.get('smdm.bank.model.bank.bankName').d('银行名称'),
          dataIndex: 'bankName',
        },
        {
          title: intl.get('smdm.bank.model.bank.bankShortName').d('银行简称'),
          dataIndex: 'bankShortName',
          width: 250,
        },
        {
          title: intl.get('smdm.bank.model.bank.bankType').d('银行类型'),
          dataIndex: 'bankTypeMeaning',
          width: 200,
        },
        {
          title: intl.get('smdm.bank.model.bank.enabledFlag').d('启用标志'),
          dataIndex: 'enabledFlag',
          align: 'left',
          width: 100,
          render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
        },
        {
          title: intl.get('smdm.bank.model.bank.zeroPaymentFlag').d('允许零付款'),
          dataIndex: 'zeroPaymentFlag',
          width: 100,
          align: 'left',
          render: yesOrNoRender,
        },
        {
          title: intl.get('smdm.bank.view.option.branch').d('分行'),
          key: 'bankTenantDetail',
          width: 100,
          align: 'left',
          render: (_, record) => {
            return (
              <a
                onClick={() => {
                  this.handleGoToBranch(record);
                }}
              >
                {intl.get('smdm.bank.view.option.branch').d('分行')}
              </a>
            );
          },
        },
      ];
    }
    return this.columns;
  }

  render() {
    const { dataSource = [], modalVisible, flag } = this.state;
    const {
      fetching = false,
      syncBankInfoLoding = false,
      bankTenant,
      createBank = false,
      customizeTable,
      organizationId,
    } = this.props;
    const columns = this.getColumns();
    const { enableTenantBankFlag = false } = bankTenant || {};
    return (
      <React.Fragment>
        <Header title={intl.get('smdm.bank.view.message.title.bank').d('银行定义')}>
          {enableTenantBankFlag && tenantRoleFlag && (
            <PermissionButton
              icon="sync"
              onClick={this.handleSync}
              loading={syncBankInfoLoding || fetching}
              permissionList={[
                {
                  code: 'srm.fin.branch.button.syncData',
                  type: 'button',
                },
              ]}
            >
              {intl.get('hpfm.bank.view.message.syncBackInfo').d('引用云级数据')}
            </PermissionButton>
          )}
          {/* {this.state.displayFlag ? (
            <Button
              icon="fork"
              type="primary"
              loading={importing}
              onClick={this.handleImportDataBtnClick}
            >
              {intl.get('smdm.bank.view.option.refSite').d('引入云级数据')}
            </Button>
          ) : null} */}
          {/* <Button icon="plus" type="primary" onClick={this.showCreateForm}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" loading={saving} onClick={this.handleSaveBtnClick}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button> */}
          <CommonImport
            prefixPatch="/smdm"
            buttonProps={{
              permissionList: [
                {
                  code: !tenantRoleFlag
                    ? 'hzero.site.mdm.branch.bank.ps.new.bank-branch.import'
                    : `srm.fin.branch.button.new.import`,
                  type: 'button',
                  meaning: '(新)分行导入',
                },
              ],
            }}
            businessObjectTemplateCode="SMDM.BANK_BRANCH"
            buttonText={intl.get('smdm.bank.view.option.branchImport.new').d('(新)分行导入')}
          />
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={() => this.handleBatchImport('SMDM.BANK_BRANCH')}
            permissionList={[
              {
                code: !tenantRoleFlag
                  ? `hzero.site.mdm.branch.bank.ps.bank-branch.import`
                  : `srm.fin.branch.button.import`,
                type: 'button',
                meaning: '分行导入',
              },
            ]}
          >
            {intl.get('smdm.bank.view.option.branchImport').d('分行导入')}
          </PermissionButton>
          <ExcelExportPro
            queryParams={() => this.getQueryParams()}
            requestUrl={`${SRM_MDM}/v1/${organizationId}/banks/export`}
            templateCode="SRM_C_SRM_SMDM_BANK_EXPORT"
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            otherButtonProps={{
              type: 'c7n-pro',
              icon: 'unarchive',
            }}
          />
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          {customizeTable(
            {
              code: 'SMDM.BANK_TENANT.TABLE',
            },
            <EditTable
              loading={fetching}
              rowKey="bankId"
              dataSource={dataSource}
              columns={columns}
              bordered
              pagination={this.state.tablePagination}
              onChange={this.handleStandardTableChange}
            />
          )}
        </Content>
        {modalVisible && (
          <BankForm
            sideBar
            title={intl.get('hpfm.bank.view.message.newBank').d('新建银行')}
            flag={flag}
            bankTenant={bankTenant}
            loading={createBank}
            handleAdd={this.handleAdd}
            modalVisible={modalVisible}
            hideModal={this.hideModal}
          />
        )}
      </React.Fragment>
    );
  }
}
