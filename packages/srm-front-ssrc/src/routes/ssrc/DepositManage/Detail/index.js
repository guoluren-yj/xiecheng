/**
 * DepositManageDetail - 保证金详情容器组件
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Collapse, Spin, Icon } from 'hzero-ui';
import { Modal, Form, Select, DataSet } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';
import classnames from 'classnames';
import queryString from 'querystring';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import remote from 'hzero-front/lib/utils/remote';
import {
  getEditTableData,
  getResponse,
  getCurrentOrganizationId,
  getCurrentTenant,
} from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import { saveBatchMaintain } from '@/services/depositManageService';
import { fetchConfigSheet, fetchCurrencyIsExist } from '@/services/inquiryHallNewService';

import HeaderInfo from './HeaderInfo';
import LineTable from './LineTable';
import ServiceLineTable from './ServiceLineTable';

const { Panel } = Collapse;
const promptCode = 'ssrc.depositManage';

/**
 * DepositManageDetail - 业务组件 - 寻源费用管理列表
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [depositManage={}] - 数据源
 * @reactProps {!Object} [loading={}] - dva http请求是否完成标识
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [queryLoading=false] - 查询操作记录处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['ssrc.depositManage', 'ssrc.inquiryHall', 'ssrc.common', 'scux.ssrc'],
})
@connect(({ depositManage, loading }) => ({
  depositManage,
  fetchHeaderLoading: loading.effects['depositManage/fetchQueryRfxHeaderInfo'], // 获取头信息loading
  fetchSupplierListLoading: loading.effects['depositManage/fetchQuerySupplierListWithDeposit'], // 获取保证金列表loading
  saveLoading:
    loading.effects['depositManage/fetchQueryRfxHeaderInfo'] ||
    loading.effects['depositManage/fetchSaveDepositInfo'],
}))
@remote(
  {
    code: 'SSRC_DEPOSITMANAGE_DETAIL',
    name: 'processRemote',
  },
  {
    events: {
      handleChangeStatusEvent(props = {}) {
        const { setFieldsValue = () => {} } = props || {};
        setFieldsValue({
          expensesAmount: null,
          paymentName: '',
          paymentAccount: '',
          paymentBank: '',
        });
      },
    },
  }
)
export default class DepositManageDetail extends Component {
  /**
   * 组件内部状态
   */
  state = {
    collapseKeys: ['headerInfo', 'bidFileExpense', 'bidBond', 'serviceCharge'],
    loading: {},
    rowsSelected: {},
    serviceChargeFlag: false,
    currencyIsCNY: false,
    currencyIsRMB: false,
    tableBtnLoading: {
      bidBondLoading: false,
    }, // 表格按钮loading，ps：最开始一版用于二开，若标准需要也可以使用
    cuxLovOptions: {}, // 查询二开值集 - 勿动！！！
  };

  batchMaintainDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'expenseStatus',
        lookupCode: 'SSRC.EXPENSES_STATUS',
        required: true,
      },
    ],
  });

  /**
   * 组件创建完成
   */
  componentDidMount() {
    this.handleQueryLov();
    this.handleQueryRfxHeaderInfo();
    this.handleQuerySupplierList({}, 'DEPOSIT');
    this.handleQuerySupplierList({}, 'TENDER_FEE');
    this.initCuxLovCode();
  }

  /**
   * 查询固定值集
   */
  @Bind()
  handleQueryLov() {
    const { dispatch } = this.props;
    dispatch({
      type: 'depositManage/fetchLov',
    });
  }

  /**
   * 查询二开值集-勿动
   * @returns
   * @protected
   */
  @Bind()
  async initCuxLovCode() {
    const { processRemote } = this.props;
    // 值集编码
    const code = {};

    const lovCode = processRemote
      ? processRemote.process('SSRC_DEPOSITMANAGE_DETAIL_PROCESS_FETCH_LOV_CODES', code)
      : code;

    if (isEmpty(lovCode)) return;

    try {
      let result = await queryMapIdpValue(lovCode);
      result = getResponse(result);
      if (!result) {
        return;
      }
      this.setState({
        cuxLovOptions: result || {},
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 查询头信息数据
   */
  @Bind()
  handleQueryRfxHeaderInfo() {
    const {
      dispatch,
      match: { params = {} },
      location: { search },
    } = this.props;
    const { sourceId } = params;
    const { sourceFrom, tenantId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'depositManage/fetchQueryRfxHeaderInfo',
      payload: {
        sourceId,
        tenantId,
        sourceType: sourceFrom,
        customizeUnitCode: 'SSRC.EXPENSE_MANAGEMENT.BASE_INFO',
      },
    });
    this.fetchServiceChargeConfig();
    this.fetchCurrencyIsExist();
  }

  // 查询配置表--是否展示标书下载节点
  @Bind()
  async fetchServiceChargeConfig() {
    let data = null;

    try {
      data = await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!(!isEmpty(data) && isArray(data) && data[0].id)) {
        // 即接口返回空就展示标书下载节点，有值则不显示
        this.handleQuerySupplierList({}, 'SERVICE_FEE');
        this.setState({
          serviceChargeFlag: true,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 查询CNY币种默认值是否被禁用
   */
  @Bind()
  async fetchCurrencyIsExist() {
    const result = await fetchCurrencyIsExist({
      organizationId,
      currencyCode: 'CNY',
      enabledFlag: 1,
    });
    if (getResponse(result) && !isEmpty(result.content)) {
      this.setState({
        currencyIsCNY: true,
      });
    }
    const resultRMB = await fetchCurrencyIsExist({
      organizationId,
      currencyCode: 'RMB',
      enabledFlag: 1,
    });
    if (getResponse(resultRMB) && !isEmpty(resultRMB.content)) {
      this.setState({
        currencyIsRMB: true,
      });
    }
  }

  /**
   * 查询行信息数据
   */
  @Bind()
  handleQuerySupplierList(page = {}, expensesType) {
    const {
      dispatch,
      match: { params = {} },
      location: { search },
    } = this.props;
    const { sourceId } = params;
    const { sourceFrom } = queryString.parse(search.substring(1));
    const dataType =
      expensesType === 'DEPOSIT'
        ? 'bidBond'
        : expensesType === 'TENDER_FEE'
        ? 'bidFileExpense'
        : 'serviceCharge';
    this.setState({
      loading: {
        ...this.state.loading,
        [dataType]: true,
      },
    });
    dispatch({
      type: 'depositManage/fetchQuerySupplierListWithDeposit',
      payload: {
        page,
        sourceId,
        sourceType: sourceFrom,
        expensesType,
        dataType,
        customizeUnitCode:
          dataType === 'bidBond'
            ? 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_MARGIN_DETAILS'
            : dataType === 'bidFileExpense'
            ? 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_BIDDING_DOCUMENTS'
            : 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_SERVICE_CHARGE_TABLE',
      },
    }).then(() => {
      this.setState({
        loading: {
          ...this.state.loading,
          [dataType]: false,
        },
      });
    });
  }

  /**
   * handleCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  handleCollapseChange(collapseKeys) {
    this.setState({ collapseKeys });
  }

  /**
   * getPanelHeader - 获取 Panel 的 Header 信息
   * @param {*} title - 标题信息
   * @param {string} panelKey - 当前panel的key
   */
  @Bind()
  getPanelHeader(title, panelKey) {
    const { collapseKeys = [] } = this.state;
    const isExpand = collapseKeys.includes(panelKey);
    return (
      <Fragment>
        <h3>{title}</h3>
        <a>
          {isExpand
            ? intl.get('hzero.common.button.up').d('收起')
            : intl.get('hzero.common.button.expand').d('展开')}
        </a>
        <Icon type={isExpand ? 'up' : 'down'} />
      </Fragment>
    );
  }

  /**
   * 保存保证金行记录
   * @param {Object} record - 保证金行
   */
  @Bind()
  handleSaveDepositInfo(dataSource, expensesType, dataIndex) {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { sourceFrom } = queryString.parse(search.substring(1));
    const newParams = getEditTableData(dataSource, ['expensesRelDocId']);
    if (!isEmpty(newParams)) {
      dispatch({
        type: 'depositManage/fetchSaveDepositInfo',
        payload: {
          expensesRelDocDTOS: newParams,
          sourceType: sourceFrom,
          customizeUnitCode:
            dataIndex === 'bidBond'
              ? 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_MARGIN_DETAILS'
              : dataIndex === 'bidFileExpense'
              ? 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_BIDDING_DOCUMENTS'
              : 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_SERVICE_CHARGE_TABLE',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleUpdateSelectedRows(dataIndex);
          this.handleQuerySupplierList(
            this.props?.depositManage?.[`${dataIndex}Pagination`],
            expensesType
          );
        }
      });
    }
  }

  /**
   * 批量维护
   * @param {Object} record - 保证金行
   */
  @Bind()
  handleBatchMaintain(dataIndex, expensesType) {
    const {
      match: { params = {} },
      location: { search },
      depositManage = {},
    } = this.props;
    const { sourceId } = params;
    const { sourceFrom, tenantId } = queryString.parse(search.substring(1));
    const { rowsSelected = {} } = this.state;
    const message =
      rowsSelected[dataIndex]?.length > 0
        ? intl
            .get(`ssrc.depositManage.view.message.batchMaintenance.chooseTip`, {
              length: rowsSelected[dataIndex]?.length,
            })
            .d('已勾选{length}条数据进行批量编辑')
        : intl
            .get('ssrc.depositManage.view.message.batchMaintenance.tip')
            .d('针对全部数据进行批量维护');
    const style = {
      position: 'absolute',
      width: '100%',
      left: 0,
      top: '55px',
      border: 0,
      color: '#3091f2',
    };
    Modal.open({
      title: intl.get('ssrc.depositManage.view.message.batchMaintenance').d('批量维护'),
      drawer: true,
      style: {
        width: '380px',
      },
      children: (
        <>
          <Alert message={message} type="info" showIcon style={style} />
          <Form dataSet={this.batchMaintainDs} labelLayout="float" style={{ marginTop: '32px' }}>
            <Select name="expenseStatus" />
          </Form>
        </>
      ),
      onOk: async () => {
        const validateFlag = await this.batchMaintainDs.validate();
        if (validateFlag) {
          const param = {
            tenantId,
            expensesType,
            sourceId,
            sourceType: sourceFrom,
            expenseStatus: this.batchMaintainDs?.current?.get('expenseStatus'),
            expensesRelDocIds: rowsSelected[dataIndex]?.map?.((r) => r.expensesRelDocId),
          };
          return saveBatchMaintain(param).then((res) => {
            if (getResponse(res)) {
              notification.success();
              // eslint-disable-next-line no-unused-expressions
              depositManage[`${dataIndex}Data`]?.forEach((item) => item.$form?.resetFields());
              this.handleUpdateSelectedRows(dataIndex);
              this.handleQuerySupplierList(
                this.props?.depositManage?.[`${dataIndex}Pagination`],
                expensesType
              );
            }
          });
        } else {
          return false;
        }
      },
      afterClose: () => this.batchMaintainDs?.reset(),
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows, dataType) {
    this.setState({
      rowsSelected: {
        ...this.state.rowsSelected,
        [dataType]: selectedRows,
      },
    });
  }

  /**
   * 更新选中行
   */
  @Bind()
  handleUpdateSelectedRows(dataType) {
    this.setState({
      rowsSelected: {
        ...this.state.rowsSelected,
        [dataType]: [],
      },
    });
  }

  /**
   * 保证金表格复选框配置
   */
  getCheckboxProps(record) {
    const {
      processRemote,
      depositManage: { headerInfo = {} },
    } = this.props;
    const { serviceChargeFlag = false } = this.state;
    const checkProps = {
      disabled: serviceChargeFlag && record._status !== 'create',
    };
    return processRemote
      ? processRemote.process('SSRC_DEPOSITMANAGE_DETAIL_PROCESS_TABLE_CHECK_PROPS', checkProps, {
          record,
          headerInfo,
        })
      : checkProps;
  }

  /**
   * 设置按钮loading
   * @returns
   */
  @Bind()
  setTableBtnLoading(loadingName, loading) {
    const { tableBtnLoading } = this.state;
    this.setState({
      tableBtnLoading: {
        ...tableBtnLoading,
        [loadingName]: loading ?? !tableBtnLoading[loadingName],
      },
    });
  }

  /**
   * 获取按钮loading
   * @returns
   */
  @Bind()
  getTableBtnLoading(loadingName) {
    if (!loadingName) return false;
    return this.state.tableBtnLoading[loadingName];
  }

  render() {
    const {
      dispatch,
      saveLoading,
      depositManage: { headerInfo = {}, expensesStatus = [], paymentRuleStatus = [] },
      fetchHeaderLoading = false,
      match: { params = {} },
      processRemote,
    } = this.props;
    const { sourceId } = params;
    const {
      collapseKeys = [],
      rowsSelected = {},
      serviceChargeFlag = false,
      currencyIsCNY = false,
      currencyIsRMB = false,
      cuxLovOptions = {},
    } = this.state;
    const lineTableProps = {
      dispatch,
      expensesStatus,
      saveLoading,
      header: headerInfo,
      onChange: this.handleQuerySupplierList,
      onSave: this.handleSaveDepositInfo,
      onBatchMaintain: this.handleBatchMaintain,
      sourceId,
      serviceChargeFlag,
      paymentRuleStatus,
      currencyIsCNY,
      currencyIsRMB,
      processRemote,
      handleUpdateSelectedRows: this.handleUpdateSelectedRows,
      setTableBtnLoading: this.setTableBtnLoading,
      getTableBtnLoading: this.getTableBtnLoading,
      cuxLovOptions,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.sourcingCostManagement`)
            .d('寻源费用管理')}
          backPath="/ssrc/deposit-manage/list"
        />
        <Spin spinning={fetchHeaderLoading} wrapperClassName={classnames('ued-detail-wrapper')}>
          <Content>
            <Collapse
              defaultActiveKey={collapseKeys}
              onChange={this.handleCollapseChange}
              className="form-collapse"
            >
              <Panel
                header={this.getPanelHeader(
                  intl.get(`${promptCode}.model.depositManage.baseInfo`).d('基本信息'),
                  'headerInfo'
                )}
                showArrow={false}
                key="headerInfo"
              >
                <HeaderInfo headerInfo={headerInfo} />
              </Panel>
              {headerInfo.bidFileExpense ? (
                <Panel
                  header={this.getPanelHeader(
                    intl
                      .get(`${promptCode}.model.depositManage.bidFileExpenseInfo`)
                      .d('招标文件费详情'),
                    'bidFileExpense'
                  )}
                  showArrow={false}
                  key="bidFileExpense"
                >
                  <LineTable
                    expensesType="TENDER_FEE"
                    dataIndex="bidFileExpense"
                    title={intl
                      .get(`${promptCode}.model.depositManage.bidFileExpense`)
                      .d('招标文件费(元)')}
                    dataSource={this.props?.depositManage?.bidFileExpenseData}
                    pagination={this.props?.depositManage?.bidFileExpensePagination}
                    loading={this.state.loading?.bidFileExpense}
                    selectedRows={rowsSelected?.bidFileExpense}
                    rowSelection={{
                      selectedRowKeys: rowsSelected?.bidFileExpense?.map?.(
                        (r) => r.expensesRelDocId
                      ),
                      onChange: (selectedRowKeys, selectedRows) =>
                        this.onSelectChange(selectedRowKeys, selectedRows, 'bidFileExpense'),
                      getCheckboxProps: (record) => ({
                        disabled: serviceChargeFlag && record._status !== 'create',
                      }),
                    }}
                    updateSelectedRows={this.handleUpdateSelectedRows}
                    {...lineTableProps}
                  />
                </Panel>
              ) : (
                ''
              )}
              {headerInfo.bidBond ? (
                <Panel
                  header={this.getPanelHeader(
                    intl.get(`${promptCode}.model.depositManage.bondDetailInfo`).d('保证金详情'),
                    'bidBond'
                  )}
                  showArrow={false}
                  key="bidBond"
                >
                  <LineTable
                    expensesType="DEPOSIT"
                    dataIndex="bidBond"
                    title={intl.get(`${promptCode}.model.depositManage.bidBond`).d('保证金(元)')}
                    dataSource={this.props?.depositManage?.bidBondData}
                    pagination={this.props?.depositManage?.bidBondPagination}
                    loading={this.state.loading?.bidBond}
                    selectedRows={rowsSelected?.bidBond}
                    rowSelection={{
                      selectedRowKeys: rowsSelected?.bidBond?.map?.((r) => r.expensesRelDocId),
                      onChange: (selectedRowKeys, selectedRows) =>
                        this.onSelectChange(selectedRowKeys, selectedRows, 'bidBond'),
                      getCheckboxProps: (record) => this.getCheckboxProps(record),
                    }}
                    updateSelectedRows={this.handleUpdateSelectedRows}
                    {...lineTableProps}
                  />
                </Panel>
              ) : (
                ''
              )}
              {serviceChargeFlag && (
                <Panel
                  header={this.getPanelHeader(
                    intl
                      .get(`${promptCode}.model.depositManage.serviceChargeDetails`)
                      .d('服务费详情'),
                    'serviceCharge'
                  )}
                  showArrow={false}
                  key="serviceCharge"
                >
                  <ServiceLineTable
                    expensesType="SERVICE_FEE"
                    dataIndex="serviceCharge"
                    dataSource={this.props?.depositManage?.serviceChargeData}
                    pagination={this.props?.depositManage?.serviceChargePagination}
                    loading={this.state.loading?.serviceCharge}
                    selectedRows={rowsSelected?.serviceCharge}
                    rowSelection={{
                      selectedRowKeys: rowsSelected?.serviceCharge?.map?.(
                        (r) => r.expensesRelDocId
                      ),
                      onChange: (selectedRowKeys, selectedRows) =>
                        this.onSelectChange(selectedRowKeys, selectedRows, 'serviceCharge'),
                      getCheckboxProps: (record) => ({
                        disabled: serviceChargeFlag && record._status !== 'create',
                      }),
                    }}
                    updateSelectedRows={this.handleUpdateSelectedRows}
                    {...lineTableProps}
                  />
                </Panel>
              )}
            </Collapse>
          </Content>
        </Spin>
      </React.Fragment>
    );
  }
}
