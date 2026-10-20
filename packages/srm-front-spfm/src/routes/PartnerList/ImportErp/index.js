/**
 * ImportErp - 导入Erp入口
 * @date: 2019-1-8
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { stringify } from 'querystring';
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Modal, Form, Input, Tabs, Select } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isUndefined, isEmpty, isNumber, sum } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CacheComponent from 'components/CacheComponent';
import { Header, Content } from 'components/Page';
import { Button } from 'components/Permission';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getEditTableData, getCurrentOrganizationId } from 'utils/utils';

import FilterFormSap from './FilterFormSap';
import FilterFormEbs from './FilterFormEbs';
import PurchaseFinance from './Tables/PurchaseFinance';
import SupplierAddress from './Tables/SupplierAddress';
import SupplierAccount from './Tables/SupplierAccount';
import SupplierContact from './Tables/SupplierContact';

const { TabPane } = Tabs;
const { Option } = Select;

const organizationId = getCurrentOrganizationId();

/**
 * 导入Erp入口
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} CreateIndex - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@connect(({ importErp, loading }) => ({
  importErp,
  loading: loading.effects['importErp/queryErp'],
  saving: loading.effects['importErp/saveErp'],
  importing: loading.effects['importErp/importData'],
  importEbsLoading: loading.effects['importErp/importEbsData'],
  queryEbsLoading: loading.effects['importErp/queryEbs'],
  hangLoading: loading.effects['importErp/hang'],
  hangEbsLoading: loading.effects['importErp/hangEbs'],
  importAgainLoading: loading.effects['importErp/batchImportAgain'],
  queryInterfaceLoading: loading.effects['importErp/handleInterfaceQuery'],
  reloadInterfaceLoading: loading.effects['importErp/handleReloadQuery'],
}))
@formatterCollections({
  code: ['entity.company', 'entity.supplier', 'spfm.importErp', 'spfm.supplier'],
})
@withCustomize({
  unitCode: [
    'SPFM.PARTNER_LIST_IMPORT_SAP.LIST',
    'SPFM.PARTNER_LIST_IMPORT_SAP.PURCHASE_FINANCE',
    'SPFM.PARTNER_LIST_IMPORT_SAP.FILTER',
    'SPFM.PARTNER_LIST_IMPORT_EBS.LIST',
    'SPFM.PARTNER_LIST_IMPORT_EBS.FILTER',
    'SPFM.PARTNER_LIST_IMPORT_SAP.SUPPLIER_ACCOUNT',
    'SPFM.PARTNER_LIST_INTERFACE_QUERY.LIST',
    'SPFM.PARTNER_LIST_INTERFACE_QUERY.FILTER',
  ],
})
@CacheComponent({ cacheKey: '/spfm/partner-list/import-erp' })
export default class ImportErp extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectedRowKeys: [], // 选中SAP数据
      ebsSelectedRowkeys: [], // 选中EBS数据
      dispalayName: undefined,
      modalRecord: {},
      isRefresh: false,
      accountGroup: undefined,
      schemeGroup: undefined,
      tabActiveKey: 'importSap', // 切换tab时对应的key
    };
  }

  form; // 导入SAP

  ebsForm; // 导入ebs

  componentDidMount() {
    const {
      importErp: { erpPagination = {}, interfacePagination = {} },
    } = this.props;
    this.queryValueCode();
    this.handleSearchErp(erpPagination);
    this.handleInterfaceQuery(interfacePagination);
    // this.handleSearchEbs(ebsPagination); // 查询tab EBS数据
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        erpList: [],
        erpPagination: {},
        ebsList: [],
        ebsPagination: {},
      },
    });
  }

  componentDidUpdate() {
    if (!this.custFlag && !this.props.custLoading) {
      this.handleSearchEbs();
      this.custFlag = true;
    }
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    const payload = {
      syncStatusList: 'SSLM.SYNC_STATUS',
      planGroups: 'SSLM.PROGRAMME_GROUPS',
      paymentFrozen: 'SSLM.PAYMENT_FROZEN',
      tradeTerms: 'SSLM.TRADE_TERMS',
      billPeriodMap: 'SSLM.EBS_OU_BILL_PERIOD', // 账期值集
      importStatusList: 'SSLM.SUPPLIER_SYNC_STATUS', // 接口查询的导入状态
      triggerEventList: 'SSLM.SUPPLIER_SYNCHRONIZATION_SERVICE', // 触发事件
      eventClassifyList: 'SSLM.SUPPLIER_SYNC_CATEGORY', // 触发事件分类
    };
    dispatch({
      type: 'importErp/queryValueCode',
      payload,
    });
  }

  /**
   * 查询导入SAP数据
   * @param {Object} payload 分页参数
   */
  @Bind()
  handleSearchErp(payload = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'importErp/queryErp',
      payload: {
        page: payload,
        ...filterValues,
        customizeUnitCode: 'SPFM.PARTNER_LIST_IMPORT_SAP.LIST',
      },
    });
  }

  /**
   * 查询导入EBS数据
   * @param {Object} payload 分页参数
   */
  @Bind()
  handleSearchEbs(payload = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.ebsForm)
      ? {}
      : filterNullValueObject(this.ebsForm.getFieldsValue());
    dispatch({
      type: 'importErp/queryEbs',
      payload: {
        page: payload,
        ...filterValues,
        customizeUnitCode: 'SPFM.PARTNER_LIST_IMPORT_EBS.LIST',
        supplierCompanyName: undefined,
      },
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  @Bind()
  onSelectChangeEbs(ebsSelectedRowkeys) {
    this.setState({ ebsSelectedRowkeys });
  }

  /**
   * 控制 Modal显隐
   * @param {String} dispalayName 判断modal类型
   */
  @Bind()
  @Debounce(200)
  handleModalDisplay(dispalayName, record, refresh) {
    const {
      importErp: { erpPagination = {} },
    } = this.props;
    const { visible, isRefresh } = this.state;
    this.setState({ visible: !visible, isRefresh: refresh }, () => {
      if (dispalayName) this.setState({ dispalayName, modalRecord: record });
      // 可修改modal隐藏时刷新页面
      if (visible && isRefresh) this.handleSearchErp(erpPagination);
    });
  }

  /**
   * 批量编辑行
   * @param {object} record 每行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      importErp: { erpList = [] },
      dispatch,
    } = this.props;
    const newErpList = erpList.map((item) =>
      record.supplierSyncId === item.supplierSyncId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'importErp/updateState',
      payload: { erpList: newErpList },
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      importErp: { erpList = [] },
      dispatch,
    } = this.props;
    const newErpList = erpList.map((item) => {
      if (item.supplierSyncId === record.supplierSyncId) {
        record.$form.resetFields();
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'importErp/updateState',
      payload: { erpList: newErpList },
    });
  }

  /**
   *保存编辑的数据
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      importErp: { erpList = [], erpPagination = {} },
    } = this.props;
    const payloadData = getEditTableData(erpList, ['supplierSyncPfId']);
    if (isEmpty(payloadData)) {
      // this.handleScrollTo();
      return;
    }
    dispatch({
      type: 'importErp/saveErp',
      payload: payloadData,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ selectedRowKeys: [] });
        this.handleSearchErp(erpPagination);
      }
    });
  }

  /**
   * 暂不处理勾选数据
   */
  @Bind()
  handleHang() {
    const {
      dispatch,
      importErp: { erpPagination = {}, ebsPagination = {} },
    } = this.props;
    const { selectedRowKeys, tabActiveKey, ebsSelectedRowkeys } = this.state;
    if (tabActiveKey === 'importEbs') {
      dispatch({
        type: 'importErp/hangEbs',
        payload: ebsSelectedRowkeys,
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ ebsSelectedRowkeys: [] });
          this.handleSearchEbs(ebsPagination);
        }
      });
    } else {
      dispatch({
        type: 'importErp/hang',
        payload: selectedRowKeys,
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ selectedRowKeys: [] });
          this.handleSearchErp(erpPagination);
        }
      });
    }
  }

  /**
   * 导入SAP和EBS
   */
  @Bind()
  handleImport() {
    const {
      dispatch,
      importErp: { erpPagination = {}, ebsPagination = {} },
    } = this.props;
    const { selectedRowKeys, tabActiveKey, ebsSelectedRowkeys } = this.state;
    if (tabActiveKey === 'importEbs') {
      dispatch({
        type: 'importErp/importEbsData',
        payload: ebsSelectedRowkeys,
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ ebsSelectedRowkeys: [] });
          this.handleSearchEbs(ebsPagination);
        }
      });
    } else {
      dispatch({
        type: 'importErp/importData',
        payload: {
          selectedRowKeys,
          customizeUnitCode:
            'SPFM.PARTNER_LIST_IMPORT_SAP.LIST,SPFM.PARTNER_LIST_IMPORT_SAP.PURCHASE_FINANCE,SPFM.PARTNER_LIST_IMPORT_SAP.SUPPLIER_ACCOUNT',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ selectedRowKeys: [] });
          this.handleSearchErp(erpPagination);
        }
      });
    }
  }

  /**
   * 跳转至供应商详情页信息
   */
  @Bind()
  onRedirectMess(record) {
    const { history } = this.props;
    const {
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId,
      tenantId,
      spfmCompanyId,
      supplierSyncEbsId,
      syncStatus,
    } = record;
    history.push(
      `/spfm/partner-list/import-erp-list?companyId=${companyId}&partnerCompanyId=${partnerCompanyId}&partnerTenantId=${partnerTenantId}&spfmPartnerCompanyId=${spfmPartnerCompanyId}&tenantId=${tenantId}&spfmCompanyId=${spfmCompanyId}&supplierSyncEbsId=${supplierSyncEbsId}&syncStatus=${syncStatus}`
    );
  }

  /**
   * 修改横向滚动条位置
   */
  // @Bind()
  // handleScrollTo() {
  //   const dom = this.rowDom.querySelector('.ant-table-body');
  //   dom.scrollTo(0, 0);
  // }

  @Bind()
  changeTabs(key) {
    this.setState({ tabActiveKey: key });
  }

  // FilterForm绑定
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  @Bind()
  bindEbsForm(form) {
    this.ebsForm = form;
  }

  /**
   *
   * @author  姚格格
   * @date    2020-06-01 16:03
   */

  @Bind()
  handleBatchImport() {
    const { history } = this.props;
    const { tabActiveKey } = this.state;
    history.push({
      pathname:
        tabActiveKey === 'importEbs'
          ? '/spfm/partner-list/ebs-import/SSLM.IMPORT_EBS_ADD_OU'
          : '/spfm/partner-list/sap-import/SSLM.SYNC_SAP_PF',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/spfm/partner-list/import-erp`,
      }),
    });
  }

  /**
   * 查询“接口查询”
   */
  @Bind()
  handleInterfaceQuery(page = {}) {
    const { dispatch } = this.props;
    const formValues = isUndefined(this.interfaceRef)
      ? {}
      : this.interfaceRef.props.form.getFieldsValue();
    const { supplierCompanyName, ...newFormValues } = formValues;
    const syncDateFrom =
      newFormValues.syncDateFrom && moment(newFormValues.syncDateFrom).format(DATETIME_MIN);
    const syncDateTo =
      newFormValues.syncDateTo && moment(newFormValues.syncDateTo).format(DATETIME_MAX);
    dispatch({
      type: 'importErp/handleInterfaceQuery',
      payload: {
        page,
        ...newFormValues,
        syncDateFrom,
        syncDateTo,
        customizeUnitCode:
          'SPFM.PARTNER_LIST_INTERFACE_QUERY.LIST,SPFM.PARTNER_LIST_INTERFACE_QUERY.FILTER',
      },
    });
  }

  render() {
    const {
      loading,
      saving,
      importing,
      importEbsLoading,
      hangLoading,
      hangEbsLoading,
      queryEbsLoading,
      customizeTable = () => {},
      custLoading,
      importErp: {
        erpList = [],
        erpPagination = {},
        ebsList = [],
        ebsPagination = {},
        code: { syncStatusList = [], planGroups = [], paymentFrozen = [], tradeTerms = [] },
      },
      customizeFilterForm,
    } = this.props;

    const {
      visible,
      selectedRowKeys,
      ebsSelectedRowkeys,
      dispalayName,
      modalRecord,
      accountGroup,
      schemeGroup,
      tabActiveKey,
    } = this.state;
    const isSave = erpList.filter((o) => o._status === 'create' || o._status === 'update');

    const filterProps = {
      organizationId,
      customizeFilterForm,
      syncStatusList,
      loading,
      onSearch: this.handleSearchErp,
      bindForm: this.bindForm,
    };
    const ebsFilterProps = {
      organizationId,
      customizeFilterForm,
      syncStatusEbsList: syncStatusList,
      queryEbsLoading,
      onSearch: this.handleSearchEbs,
      bindForm: this.bindEbsForm,
    };
    const columnsSAP = [
      {
        title: intl.get('spfm.importErp.model.importErp.syncStatus').d('导入状态'),
        width: 120,
        dataIndex: 'syncStatusMeaning',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.errorRemark').d('错误信息'),
        width: 120,
        dataIndex: 'errorRemark',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.planGroups').d('计划组'),
        width: 150,
        dataIndex: 'programmeGroups',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('programmeGroups', {
                initialValue: record.programmeGroups,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {planGroups.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            <span>{record.programmeGroupsMeaning}</span>
          ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.planGroup').d('方案组'),
        width: 150,
        dataIndex: 'schemeGroup',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('schemeGroup', {
                  initialValue: schemeGroup || record.schemeGroup,
                  rules: [
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                    {
                      // pattern: /^\d+$/,
                      pattern: /^[A-Za-z0-9]*$/,
                      message: intl
                        .get('spfm.importErp.view.message.patternValidate')
                        .d('请输入正整数'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.accountGroup').d('账户组'),
        width: 150,
        dataIndex: 'accountGroupMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('accountGroup', {
                  initialValue: accountGroup || record.accountGroup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.accountGroup').d('账户组'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.SYNC_ACCOUNT_GROUP"
                    queryParams={{ tenantId: organizationId }}
                    textValue={val}
                    lovOptions={{
                      displayField: 'meaning',
                      valueField: 'value',
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.reconciliationAccount`).d('统驭科目'),
        width: 150,
        dataIndex: 'reconciliationAccountMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('reconciliationAccount', {
                  initialValue: record.reconciliationAccount,
                })(
                  <Lov
                    code="SSLM.RECONCILIATION_ACCOUNT"
                    queryParams={{ tenantId: organizationId }}
                    textValue={val}
                    lovOptions={{
                      displayField: 'meaning',
                      valueField: 'value',
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.ouCode').d('ERP公司代码'),
        width: 120,
        dataIndex: 'ouCode',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('ouId', {
                  initialValue: record.ouId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.ouCode').d('ERP公司代码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPFM.USER_AUTH.OU_CODE"
                    queryParams={{ tenantId: organizationId }}
                    textValue={val}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('entity.company.code').d('公司编码'),
        width: 120,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        width: 120,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        width: 200,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.unifySocialCode').d('统一社会信用码'),
        width: 160,
        dataIndex: 'supplierUnifiedSocialCode',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.erpSupplierNum').d('ERP供应商编码'),
        width: 150,
        dataIndex: 'erpSupplierNum',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status) && !record.successFlag) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('erpSupplierNum', {
                  initialValue: record.erpSupplierNum,
                })(<Input inputChinese={false} typeCase="upper" />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.srmKeep').d('是否已导入'),
        width: 120,
        dataIndex: 'srmKeep',
        render: yesOrNoRender,
      },
      {
        title: intl.get('spfm.importErp.model.importErp.frozenFlag').d('记账冻结'),
        width: 100,
        dataIndex: 'frozenFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('frozenFlag', {
                  initialValue: record.frozenFlag,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.paymentFreezeCode').d('付款冻结代码'),
        width: 150,
        dataIndex: 'paymentFrozen',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('paymentFrozen', {
                initialValue: record.paymentFrozen,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {paymentFrozen.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            <span>{record.paymentFrozenMeaning}</span>
          ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.stageDescription').d('供应商生命周期'),
        width: 130,
        dataIndex: 'stageDescription',
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.termName`).d('付款条件'),
        width: 150,
        dataIndex: 'termName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('termId', {
                  initialValue: record.termId,
                })(
                  <Lov
                    code="SMDM.PAYMENT.TERM"
                    textValue={record.termName}
                    queryParams={{ tenantId: organizationId }}
                    // textValue={record.termName || purchaseAccountData.termName}
                    lovOptions={{
                      displayField: 'termName',
                      valueField: 'termId',
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.purchaseFinance').d('采购/财务'),
        width: 100,
        dataIndex: 'purchaseFinance',
        render: (val, record) => (
          <a
            disabled={record._status === 'update'}
            onClick={() => this.handleModalDisplay('PurchaseFinance', record, true)}
          >
            {intl.get('spfm.importErp.model.importErp.purchaseFinance').d('采购/财务')}
          </a>
        ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.supplierAddress').d('供应商地址'),
        width: 120,
        dataIndex: 'supplierAddress',
        render: (val, record) => (
          <a
            disabled={record._status === 'update'}
            onClick={() => this.handleModalDisplay('SupplierAddress', record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.supplierAccount').d('供应商账户'),
        width: 120,
        dataIndex: 'supplierAccount',
        render: (val, record) => (
          <a
            disabled={record._status === 'update'}
            onClick={() => this.handleModalDisplay('SupplierAccount', record, true)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.supplierContact').d('供应商联系人'),
        width: 130,
        dataIndex: 'supplierContact',
        render: (val, record) => (
          <a
            disabled={record._status === 'update'}
            onClick={() => this.handleModalDisplay('SupplierContact', record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        className: 'table-action',
        fixed: 'right',
        width: 100,
        dataIndex: 'edit',
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                disabled={record.syncStatus === 'PENDING'}
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];

    const columnsEBS = [
      {
        title: intl.get('spfm.importErp.model.importErp.syncStatus').d('导入状态'),
        width: 120,
        dataIndex: 'syncStatusMeaning',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.errorRemark').d('错误信息'),
        width: 140,
        dataIndex: 'errorRemark',
      },
      {
        title: intl.get('entity.company.code').d('公司编码'),
        width: 120,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        width: 160,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        width: 200,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.unifySocialCode').d('统一社会信用码'),
        width: 160,
        dataIndex: 'supplierUnifiedSocialCode',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.erpSupplierNum').d('ERP供应商编码'),
        width: 160,
        dataIndex: 'erpSupplierNum',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.srmKeep').d('是否已导入'),
        width: 120,
        dataIndex: 'srmKeep',
        render: yesOrNoRender,
      },
      {
        title: intl.get('spfm.importErp.model.importErp.stageDescription').d('供应商生命周期'),
        width: 160,
        dataIndex: 'stageDescription',
      },
      {
        title: intl.get('spfm.importErp.model.importErp.locationLayer').d('地点层'),
        width: 160,
        dataIndex: 'locationLayer',
        render: (val, record) => {
          return (
            <a onClick={() => this.onRedirectMess(record)}>
              {intl.get('spfm.importErp.model.importErp.locationLayer').d('地点层')}
            </a>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const rowSelections = {
      selectedRowKeys: ebsSelectedRowkeys,
      onChange: this.onSelectChangeEbs,
    };
    const scrollXSAP = sum(columnsSAP.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollXEBS = sum(columnsEBS.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <Header
          backPath="/spfm/partner-list/supplier"
          title={intl.get('spfm.importErp.view.button.importErp').d('导入ERP')}
        >
          {tabActiveKey !== 'interfaceQuery' && (
            <React.Fragment>
              <Button
                type="primary"
                icon="to-top"
                disabled={
                  tabActiveKey === 'importEbs'
                    ? isEmpty(ebsSelectedRowkeys)
                    : isEmpty(selectedRowKeys)
                }
                loading={importing || importEbsLoading}
                onClick={this.handleImport}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.my-partner.ps.button.importerp',
                    type: 'button',
                    meaning: '我的合作伙伴-导入ERP-导入',
                  },
                ]}
              >
                {intl.get('hzero.common.button.import').d('导入')}
              </Button>
              <Button
                icon="save"
                loading={saving}
                onClick={this.handleSave}
                disabled={isEmpty(isSave)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                icon="pushpin"
                disabled={
                  tabActiveKey === 'importEbs'
                    ? isEmpty(ebsSelectedRowkeys)
                    : isEmpty(selectedRowKeys)
                }
                loading={hangLoading || hangEbsLoading}
                onClick={this.handleHang}
              >
                {intl.get('spfm.importErp.view.button.untreat').d('暂不处理')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs animated={false} activeKey={tabActiveKey} onChange={this.changeTabs}>
            <TabPane
              tab={intl.get('spfm.importErp.view.button.importSap').d('导入SAP')}
              key="importSap"
            >
              <FilterFormSap {...filterProps} />
              <div className="table-list-search" style={{ textAlign: 'right' }}>
                <Button
                  onClick={this.handleBatchImport}
                  permissionList={[
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.sap.excl.import.old',
                      type: 'button',
                      meaning: '导入SAP-批量导入',
                    },
                  ]}
                  style={{ marginRight: 8 }}
                >
                  {intl.get('hzero.common.button.batchImport').d('批量导入')}
                </Button>
                <CommonImport
                  data-name="commonImport"
                  businessObjectTemplateCode="SSLM.SYNC_SAP_PF"
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonProps={{
                    icon: '',
                    type: 'h0',
                    color: 'primary',
                    permissionList: [
                      {
                        code: 'srm.partner.my-partner.my-partner.ps.sap.excl.import.model',
                        type: 'button',
                        meaning: '导入SAP-批量导入',
                      },
                    ],
                  }}
                  buttonText={intl.get('hzero.common.title.batchImport.new').d('(新)批量导入')}
                  successCallBack={() => {
                    this.handleSearchErp();
                  }}
                />
              </div>
              {customizeTable(
                {
                  code: 'SPFM.PARTNER_LIST_IMPORT_SAP.LIST',
                },
                <EditTable
                  bordered
                  rowKey="supplierSyncId"
                  loading={loading}
                  columns={columnsSAP}
                  dataSource={erpList}
                  pagination={erpPagination}
                  onChange={this.handleSearchErp}
                  rowSelection={rowSelection}
                  scroll={{ x: scrollXSAP }}
                />
              )}
            </TabPane>
            <TabPane
              tab={intl.get('spfm.importErp.view.button.importEbs').d('导入EBS')}
              key="importEbs"
              forceRender
            >
              <FilterFormEbs {...ebsFilterProps} />
              <div className="table-list-search" style={{ textAlign: 'right' }}>
                <Button
                  onClick={this.handleBatchImport}
                  permissionList={[
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.ebs.excl.import.old',
                      type: 'button',
                      meaning: '导入EBS-批量导入',
                    },
                  ]}
                  style={{ marginRight: 8 }}
                >
                  {intl.get('hzero.common.button.batchImport').d('批量导入')}
                </Button>
                <CommonImport
                  data-name="commonImport"
                  businessObjectTemplateCode="SSLM.IMPORT_EBS_ADD_OU"
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonProps={{
                    icon: '',
                    type: 'h0',
                    color: 'primary',
                    permissionList: [
                      {
                        code: 'srm.partner.my-partner.my-partner.ps.ebs.excl.import.model',
                        type: 'button',
                        meaning: '导入EBS-批量导入',
                      },
                    ],
                  }}
                  buttonText={intl.get('hzero.common.title.batchImport.new').d('(新)批量导入')}
                  successCallBack={() => {
                    this.handleSearchEbs();
                  }}
                />
              </div>
              {customizeTable(
                {
                  code: 'SPFM.PARTNER_LIST_IMPORT_EBS.LIST',
                },
                <EditTable
                  bordered
                  rowKey="supplierSyncEbsId"
                  loading={queryEbsLoading}
                  columns={columnsEBS}
                  dataSource={ebsList}
                  pagination={ebsPagination}
                  onChange={this.handleSearchEbs}
                  scroll={{ x: scrollXEBS }}
                  rowSelection={rowSelections}
                />
              )}
            </TabPane>
          </Tabs>
        </Content>
        <Modal width={1000} visible={visible} onCancel={this.handleModalDisplay} footer={null}>
          {dispalayName === 'PurchaseFinance' && (
            <PurchaseFinance
              modalRecord={modalRecord}
              tradeTerms={tradeTerms}
              custLoading={custLoading}
              customizeTable={customizeTable}
            />
          )}
          {dispalayName === 'SupplierAddress' && <SupplierAddress modalRecord={modalRecord} />}
          {dispalayName === 'SupplierAccount' && (
            <SupplierAccount
              modalRecord={modalRecord}
              custLoading={custLoading}
              customizeTable={customizeTable}
            />
          )}
          {dispalayName === 'SupplierContact' && <SupplierContact modalRecord={modalRecord} />}
        </Modal>
      </React.Fragment>
    );
  }
}
