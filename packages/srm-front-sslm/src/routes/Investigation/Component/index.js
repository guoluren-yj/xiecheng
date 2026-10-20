/**
 * Tabs - 预览的 tabs
 * @date Mon Aug 13 2018
 * @author WY  yang.wang06@hand-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import { Tabs } from 'hzero-ui';
import { map, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import ComposeForm from '@/routes/components/Compose/ComposeForm';
import ComposeTable from '@/routes/components/Compose/ComposeTable';
import { renderTabPaneTitle } from '@/routes/components/utils';
import styles from './index.less';
import AddressWrapperComponent from './AddressWrapperComponent';

const { TabPane } = Tabs;

const ComponentContext = React.createContext();

/**
 *
 * @param {Object} header - 头
 * @param {Number} organizationId
 * @param {Boolean} edit
 * @param {{[string]: Function}} onRemoves
 * @param {{[string]: String}} rowKeys
 * @param {{[string]: Function}} onRefs
 * @param {{[string]: Function}} onGetValidateDataSourceHooks
 * @param {String} disableStyle
 * @param {String} bucketName
 * @param {String} parentTabTitle
 */
function getTabPane(
  header,
  {
    organizationId,
    edit,
    isPub,
    investgRemote,
    remoteParams,
    _status: propsStatus,
    isImport = false,
    onRemoves = {},
    onSaves = {},
    rowKeys = {},
    onRefs = {},
    editProcessCode,
    onGetValidateDataSourceHooks = {},
    disableStyle,
    investgHeaderId,
    investigateTemplateId,
    defaultBankInfo,
    referenceRangeMessage = [],
    referenceRangeErrorList = [],
  },
  parentTabTitle = ''
) {
  const editProps = {
    isPub,
    investgHeaderId,
    curConfig: header,
    _status: propsStatus,
    ...remoteParams,
  };
  const newEdit = investgRemote ? investgRemote.process(editProcessCode, edit, editProps) : edit;
  const newRemovable = investgRemote
    ? investgRemote.process('SSLM_OLD_INVESTIGATION_TABLE_REMOVE_BTN', newEdit, editProps)
    : newEdit;
  switch (header.configName) {
    // case 'sslmInvestgBasic': // 基本信息
    case 'sslmInvestgBusiness': // 业务信息
    case 'sslmInvestgRd': // 研发能力 // 研发与生产能力
    case 'sslmInvestgProduce': // 生产能力 // 研发与生产能力
    case 'sslmInvestgQa': // 质保能力 // 质保与售后服务
    case 'sslmInvestgCustservice': // 售后服务 // 质保与售后服务
    case 'sslmInvestgReserve3': // 预留表单页签1
    case 'sslmInvestgReserve4': // 预留表单页签2
    case 'sslmInvestgReserve10': // 预留表单页签3
    case 'sslmInvestgReserve11': // 预留表单页签4
    case 'sslmInvestgReserve12': // 预留表单页签5
    case 'sslmInvestgReserve13': // 预留表单页签6
    case 'sslmInvestgReserve14': // 预留表单页签7
      return (
        <TabPane tab={header.configDescription} key={header.configName}>
          <ComponentContext.Consumer>
            {({ dataSource, loading, _status }) => {
              const { lines, ...other } = header;
              return (
                <ComposeForm
                  editable={edit}
                  fields={header.lines}
                  dataSource={dataSource[header.configName] || {}}
                  organizationId={organizationId}
                  onRef={onRefs[header.configName]}
                  onGetValidateDataSourceHook={onGetValidateDataSourceHooks[header.configName]}
                  fieldLabelWidth={150}
                  disableStyle={disableStyle}
                  loading={loading}
                  tabTitle={header.configDescription}
                  tabName={header.configName}
                  parentTabName={parentTabTitle}
                  templateData={other}
                  _status={_status}
                  investgRemote={investgRemote}
                  referenceRangeMessage={referenceRangeMessage[header.configName]}
                  referenceRangeErrorList={referenceRangeErrorList[header.configName]}
                  configName={header.configName || ''}
                />
              );
            }}
          </ComponentContext.Consumer>
        </TabPane>
      );
    // case 'sslmInvestgFinBranch': // 分支机构 // 财务状况
    // case 'sslmInvestgAddress': // 地址信息 // 联系人及地址信息
    // case 'sslmInvestgProservice': // 产品及服务
    // case 'sslmInvestgAuth': // 资质信息
    case 'sslmInvestgSupplierCate': // 分类 // 产品及服务
    case 'sslmInvestgFin': // 近三年财务状况 // 财务状况
    case 'sslmInvestgContact': // 联系人信息 // 联系人及地址信息
    case 'sslmInvestgCustomer': // 主要客户情况 // 合作伙伴
    case 'sslmInvestgSubSupplier': // 分供方情况 // 合作伙伴
    case 'sslmInvestgEquipment': // 设备信息
      // case 'sslmInvestgAttachment': // 附件信息
      return (
        <TabPane tab={header.configDescription} key={header.configName}>
          <ComponentContext.Consumer>
            {({
              dataSource,
              pagination,
              onTableChange,
              loading,
              supplierCateProps,
              fetchSupplierCate,
              _status,
              allowDeleteAllLineFlag = true,
            }) => {
              const { lines, ...other } = header;
              return (
                <ComposeTable
                  isPub={isPub}
                  editModalTitle={header.configDescription}
                  fields={header.lines}
                  dataSource={dataSource[header.configName] || []}
                  pagination={pagination[header.configName] || false}
                  configName={header.configName || ''}
                  onTableChange={onTableChange}
                  addable={newEdit}
                  editable={newEdit}
                  removable={newRemovable}
                  saveable={newEdit}
                  isImport={isImport}
                  investgRemote={investgRemote}
                  rowKey={rowKeys[header.configName] || 'id'}
                  organizationId={organizationId}
                  onRemove={onRemoves[header.configName]}
                  onSave={onSaves[header.configName]}
                  onRef={onRefs[header.configName]}
                  onGetValidateDataSourceHook={onGetValidateDataSourceHooks[header.configName]}
                  fieldLabelWidth={150}
                  loading={loading}
                  supplierCateProps={supplierCateProps}
                  fetchSupplierCate={fetchSupplierCate}
                  investgHeaderId={investgHeaderId}
                  investigateTemplateId={investigateTemplateId}
                  templateData={other}
                  _status={_status}
                  referenceRangeMessage={referenceRangeMessage[header.configName]}
                  allowDeleteAllLineFlag={allowDeleteAllLineFlag}
                />
              );
            }}
          </ComponentContext.Consumer>
        </TabPane>
      );
    case 'sslmInvestgProservice': // 产品及服务
    case 'sslmInvestgAuth': // 资质信息
    case 'sslmInvestgFinBranch': // 分支机构 // 财务状况
    case 'sslmInvestgAddress': // 地址信息 // 联系人及地址信息
    case 'sslmInvestgBankAccount': // 开户行信息
    case 'sslmInvestgAttachment': // 附件信息
    case 'sslmInvestgReserve1': // 预留表格页签1
    case 'sslmInvestgReserve2': // 预留表格页签2
    case 'sslmInvestgReserve5': // 预留表格页签3
    case 'sslmInvestgReserve6': // 预留表格页签4
    case 'sslmInvestgReserve7': // 预留表格页签5
    case 'sslmInvestgReserve8': // 预留表格页签6
    case 'sslmInvestgReserve9': // 预留表格页签7
      return (
        <TabPane tab={header.configDescription} key={header.configName}>
          <ComponentContext.Consumer>
            {({
              dataSource,
              pagination,
              onTableChange,
              loading,
              _status,
              allowDeleteAllLineFlag = true,
            }) => {
              const { lines, ...other } = header;
              return (
                <AddressWrapperComponent>
                  <ComposeTable
                    editModalTitle={header.configDescription}
                    fields={header.lines}
                    dataSource={dataSource[header.configName] || []}
                    pagination={pagination[header.configName] || false}
                    configName={header.configName || ''}
                    onTableChange={onTableChange}
                    addable={newEdit}
                    editable={newEdit}
                    removable={newRemovable}
                    saveable={newEdit}
                    rowKey={rowKeys[header.configName] || 'id'}
                    organizationId={organizationId}
                    onRemove={onRemoves[header.configName]}
                    onSave={onSaves[header.configName]}
                    onRef={onRefs[header.configName]}
                    onGetValidateDataSourceHook={onGetValidateDataSourceHooks[header.configName]}
                    fieldLabelWidth={150}
                    loading={loading}
                    _status={_status}
                    templateData={other}
                    defaultBankInfo={defaultBankInfo}
                    investgHeaderId={investgHeaderId}
                    referenceRangeMessage={referenceRangeMessage[header.configName]}
                    allowDeleteAllLineFlag={allowDeleteAllLineFlag}
                    investgRemote={investgRemote}
                    remoteParams={remoteParams}
                  />
                </AddressWrapperComponent>
              );
            }}
          </ComponentContext.Consumer>
        </TabPane>
      );
    case 'sslmInvestgBasic': // 基本信息
      return (
        <TabPane tab={header.configDescription} key={header.configName}>
          <ComponentContext.Consumer>
            {({ dataSource, loading, _status }) => {
              const { lines, ...other } = header;
              return (
                <AddressWrapperComponent>
                  <ComposeForm
                    editable={edit}
                    fields={header.lines}
                    dataSource={dataSource[header.configName] || {}}
                    organizationId={organizationId}
                    onRef={onRefs[header.configName]}
                    onGetValidateDataSourceHook={onGetValidateDataSourceHooks[header.configName]}
                    fieldLabelWidth={150}
                    disableStyle={disableStyle}
                    loading={loading}
                    tabTitle={header.configDescription}
                    tabName={header.configName}
                    parentTabName={parentTabTitle}
                    templateData={other}
                    configName={header.configName || ''}
                    _status={_status}
                    investgRemote={investgRemote}
                    referenceRangeMessage={referenceRangeMessage[header.configName]}
                    referenceRangeErrorList={referenceRangeErrorList[header.configName]}
                  />
                </AddressWrapperComponent>
              );
            }}
          </ComponentContext.Consumer>
        </TabPane>
      );
    default:
      return null;
  }
}

// 渲染TabPane
function renderTabPane(config, nextProps) {
  const { configDescription, configName } = config;
  const { _status, tabValidate = {} } = nextProps;
  return (
    <TabPane
      key={configName}
      tab={renderTabPaneTitle({
        configDescription,
        showTag: _status === 'write',
        validated: tabValidate[configName],
      })}
    >
      <Tabs animated={false} activeKey={configName}>
        {getTabPane(config, nextProps)}
      </Tabs>
    </TabPane>
  );
}

@formatterCollections({ code: ['spfm.investigationDefinition', 'sslm.common'] })
export default class InvestigationTab extends React.Component {
  state = {
    // 为了在静态生命周期时,将实例方法绑定到子组件的事件
    handleChildTabKeyChange: this.handleChildTabKeyChange,
    // 为了设置 子标签页的初始 activeKey
    setChildTabKeys: this.setChildTabKeys,
  };

  tabKeys = {
    // 基础信息
    sslmInvestgBasic: 'sslmInvestgBasic',
    // 业务信息
    sslmInvestgBusiness: 'sslmInvestgBusiness',
    // 产品及服务
    // sslmInvestgProservice: 'sslmInvestgProservice',
    sslmInvestgFin: 'sslmInvestgFin', // 近三年财务状况
    sslmInvestgFinBranch: 'sslmInvestgFinBranch', // 分支机构
    // 资质信息
    sslmInvestgAuth: 'sslmInvestgAuth',
    // 联系人及地址信息
    // sslmInvestgContactAddress: 'sslmInvestgContactAddress',
    // sslmInvestgContact: 'sslmInvestgContact', // 联系人信息 // 联系人及地址信息
    // sslmInvestgAddress: 'sslmInvestgAddress', // 地址信息 // 联系人及地址信息
    // 开户行信息
    sslmInvestgBankAccount: 'sslmInvestgBankAccount',
    // 合作伙伴信息
    // sslmInvestgCustomerSupplier: 'sslmInvestgCustomerSupplier',
    sslmInvestgCustomer: 'sslmInvestgCustomer', // 主要客户情况
    sslmInvestgSubSupplier: 'sslmInvestgSubSupplier', // 分供方情况
    // 设备信息
    sslmInvestgEquipment: 'sslmInvestgEquipment',
    // 研发与生产能力
    // sslmInvestgRdProduce: 'sslmInvestgRdProduce',
    sslmInvestgRd: 'sslmInvestgRd', // 研发能力
    sslmInvestgProduce: 'sslmInvestgProduce', // 生产能力
    // 质保与售后服务
    // sslmInvestgQaCustService: 'sslmInvestgQaCustService',
    sslmInvestgQa: 'sslmInvestgQa', // 质保能力
    sslmInvestgCustservice: 'sslmInvestgCustservice', // 售后服务
    // 附件信息
    sslmInvestgAttachment: 'sslmInvestgAttachment',
    // 预留表格页签1
    sslmInvestgReserve1: 'sslmInvestgReserve1',
    // 预留表格页签2
    sslmInvestgReserve2: 'sslmInvestgReserve2',
    // 预留表格页签3
    sslmInvestgReserve5: 'sslmInvestgReserve5',
    // 预留表格页签4
    sslmInvestgReserve6: 'sslmInvestgReserve6',
    // 预留表格页签5
    sslmInvestgReserve7: 'sslmInvestgReserve7',
    // 预留表格页签6
    sslmInvestgReserve8: 'sslmInvestgReserve8',
    // 预留表格页签7
    sslmInvestgReserve9: 'sslmInvestgReserve9',
    // 预留表单页签1
    sslmInvestgReserve3: 'sslmInvestgReserve3',
    // 预留表单页签2
    sslmInvestgReserve4: 'sslmInvestgReserve4',
    // 预留表单页签3
    sslmInvestgReserve10: 'sslmInvestgReserve10',
    // 预留表单页签4
    sslmInvestgReserve11: 'sslmInvestgReserve11',
    // 预留表单页签5
    sslmInvestgReserve12: 'sslmInvestgReserve12',
    // 预留表单页签6
    sslmInvestgReserve13: 'sslmInvestgReserve13',
    // 预留表单页签7
    sslmInvestgReserve14: 'sslmInvestgReserve14',
  };

  static defaultProps = {
    edit: false,
    onRemoves: {},
    onSaves: {},
    dataSource: {},
    config: [],
    rowKeys: {},
    // 获取 ComposeTable 或者 ComposeForm 的 方法
    // onRefs: {},
    // 获取 获取校验数据的方法
    // onGetValidateDataSourceHooks: {},
    // tab 切换
    // onTabChange: function(configName),
    disableStyle: 'value',
    tabPosition: 'top',
    loading: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { config, edit, defaultBankInfo = {}, _status, tabValidate = {} } = nextProps;
    const {
      handleChildTabKeyChange = () => {},
      setChildTabKeys = () => {},
      defaultBankInfo: oldDefaultBankInfo = {},
    } = prevState;
    const { partnerCompanyName } = defaultBankInfo;
    const { partnerCompanyName: oldPartnerCompanyName } = oldDefaultBankInfo;
    const nextState = {};
    if (
      config !== prevState.config ||
      prevState.edit !== edit ||
      partnerCompanyName !== oldPartnerCompanyName ||
      tabValidate !== prevState.tabValidate
    ) {
      const configHeader = {};
      map(config, (h) => {
        configHeader[h.configName] = h;
      });
      // nextState.configHeader = configHeader;
      nextState.config = config;
      nextState.edit = edit;
      nextState.defaultBankInfo = defaultBankInfo;
      nextState.tabValidate = tabValidate;
      const tabs = [];
      // 基础信息
      if (configHeader.sslmInvestgBasic) {
        const tabPane = renderTabPane(configHeader.sslmInvestgBasic, nextProps);
        tabs.push(tabPane);
      }
      // 业务信息
      if (configHeader.sslmInvestgBusiness) {
        const tabPane = renderTabPane(configHeader.sslmInvestgBusiness, nextProps);
        tabs.push(tabPane);
      }

      const proserviceAndSupplierCateTabs = [];
      let proserviceAndSupplierCateFirstTab = '';
      let proserviceValidated = true;
      let supplierCateValidated = true;
      if (configHeader.sslmInvestgProservice) {
        proserviceValidated = tabValidate.sslmInvestgProservice;
        proserviceAndSupplierCateTabs.push(
          getTabPane(configHeader.sslmInvestgProservice, nextProps)
        );
        proserviceAndSupplierCateFirstTab = 'sslmInvestgProservice';
      }
      if (configHeader.sslmInvestgSupplierCate) {
        supplierCateValidated = tabValidate.sslmInvestgSupplierCate;
        proserviceAndSupplierCateTabs.push(
          getTabPane(configHeader.sslmInvestgSupplierCate, nextProps)
        );
        if (!proserviceAndSupplierCateFirstTab) {
          proserviceAndSupplierCateFirstTab = 'sslmInvestgSupplierCate';
        }
      }
      setChildTabKeys('sslmInvestgProserviceSupplierCate', proserviceAndSupplierCateFirstTab);
      if (proserviceAndSupplierCateTabs.length > 0) {
        const configDescription = intl
          .get(`spfm.investigationDefinition.view.message.tab.proservice`)
          .d('产品及服务');
        tabs.push(
          <TabPane
            key="sslmInvestgProserviceSupplierCate"
            tab={renderTabPaneTitle({
              configDescription,
              validated: proserviceValidated && supplierCateValidated,
              showTag: _status === 'write',
            })}
          >
            <Tabs
              animated={false}
              onChange={(activeKey) => {
                handleChildTabKeyChange('sslmInvestgProserviceSupplierCate', activeKey);
              }}
            >
              {proserviceAndSupplierCateTabs}
            </Tabs>
          </TabPane>
        );
      }
      // 近三年财务状况
      if (configHeader.sslmInvestgFin) {
        const tabPane = renderTabPane(configHeader.sslmInvestgFin, nextProps);
        tabs.push(tabPane);
      }
      // 分支机构
      if (configHeader.sslmInvestgFinBranch) {
        const tabPane = renderTabPane(configHeader.sslmInvestgFinBranch, nextProps);
        tabs.push(tabPane);
      }
      // 资质信息
      if (configHeader.sslmInvestgAuth) {
        const tabPane = renderTabPane(configHeader.sslmInvestgAuth, nextProps);
        tabs.push(tabPane);
      }
      const contactAndAddressTabs = [];
      let contactAndAddressFirstTab = '';
      let contactValidated = true;
      let addressValidated = true;
      if (configHeader.sslmInvestgContact) {
        contactValidated = tabValidate.sslmInvestgContact;
        contactAndAddressTabs.push(getTabPane(configHeader.sslmInvestgContact, nextProps));
        contactAndAddressFirstTab = 'sslmInvestgContact';
      }
      if (configHeader.sslmInvestgAddress) {
        addressValidated = tabValidate.sslmInvestgAddress;
        contactAndAddressTabs.push(getTabPane(configHeader.sslmInvestgAddress, nextProps));
        if (!contactAndAddressFirstTab) {
          contactAndAddressFirstTab = 'sslmInvestgAddress';
        }
      }
      setChildTabKeys('sslmInvestgContactAddress', contactAndAddressFirstTab);
      if (contactAndAddressTabs.length > 0) {
        const configDescription = intl
          .get(`spfm.investigationDefinition.view.message.tab.contactAddress`)
          .d('联系人及地址');
        tabs.push(
          <TabPane
            key="sslmInvestgContactAddress"
            tab={renderTabPaneTitle({
              configDescription,
              validated: contactValidated && addressValidated,
              showTag: _status === 'write',
            })}
          >
            <Tabs
              animated={false}
              onChange={(activeKey) => {
                handleChildTabKeyChange('sslmInvestgContactAddress', activeKey);
              }}
            >
              {contactAndAddressTabs}
            </Tabs>
          </TabPane>
        );
      }
      // 开户行信息
      if (configHeader.sslmInvestgBankAccount) {
        const tabPane = renderTabPane(configHeader.sslmInvestgBankAccount, nextProps);
        tabs.push(tabPane);
      }
      // 主要客户情况
      if (configHeader.sslmInvestgCustomer) {
        const tabPane = renderTabPane(configHeader.sslmInvestgCustomer, nextProps);
        tabs.push(tabPane);
      }
      // 分供方情况
      if (configHeader.sslmInvestgSubSupplier) {
        const tabPane = renderTabPane(configHeader.sslmInvestgSubSupplier, nextProps);
        tabs.push(tabPane);
      }
      // 设备信息
      if (configHeader.sslmInvestgEquipment) {
        const tabPane = renderTabPane(configHeader.sslmInvestgEquipment, nextProps);
        tabs.push(tabPane);
      }
      // 研发能力
      if (configHeader.sslmInvestgRd) {
        const tabPane = renderTabPane(configHeader.sslmInvestgRd, nextProps);
        tabs.push(tabPane);
      }
      // 生产能力
      if (configHeader.sslmInvestgProduce) {
        const tabPane = renderTabPane(configHeader.sslmInvestgProduce, nextProps);
        tabs.push(tabPane);
      }
      // 质保能力
      if (configHeader.sslmInvestgQa) {
        const tabPane = renderTabPane(configHeader.sslmInvestgQa, nextProps);
        tabs.push(tabPane);
      }
      // 售后服务
      if (configHeader.sslmInvestgCustservice) {
        const tabPane = renderTabPane(configHeader.sslmInvestgCustservice, nextProps);
        tabs.push(tabPane);
      }
      // 附件信息
      if (configHeader.sslmInvestgAttachment) {
        const tabPane = renderTabPane(configHeader.sslmInvestgAttachment, nextProps);
        tabs.push(tabPane);
      }
      // 预留表格页签1
      if (configHeader.sslmInvestgReserve1) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve1, nextProps);
        tabs.push(tabPane);
      }
      // 预留表格页签2
      if (configHeader.sslmInvestgReserve2) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve2, nextProps);
        tabs.push(tabPane);
      }
      // 预留表格页签3
      if (configHeader.sslmInvestgReserve5) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve5, nextProps);
        tabs.push(tabPane);
      }
      // 预留表格页签4
      if (configHeader.sslmInvestgReserve6) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve6, nextProps);
        tabs.push(tabPane);
      }
      // 预留表格页签5
      if (configHeader.sslmInvestgReserve7) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve7, nextProps);
        tabs.push(tabPane);
      }
      // 预留表格页签6
      if (configHeader.sslmInvestgReserve8) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve8, nextProps);
        tabs.push(tabPane);
      }
      // 预留表格页签7
      if (configHeader.sslmInvestgReserve9) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve9, nextProps);
        tabs.push(tabPane);
      }
      // 预留表单页签1
      if (configHeader.sslmInvestgReserve3) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve3, nextProps);
        tabs.push(tabPane);
      }
      // 预留表单页签2
      if (configHeader.sslmInvestgReserve4) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve4, nextProps);
        tabs.push(tabPane);
      }
      // 预留表单页签3
      if (configHeader.sslmInvestgReserve10) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve10, nextProps);
        tabs.push(tabPane);
      }
      // 预留表单页签4
      if (configHeader.sslmInvestgReserve11) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve11, nextProps);
        tabs.push(tabPane);
      }
      // 预留表单页签5
      if (configHeader.sslmInvestgReserve12) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve12, nextProps);
        tabs.push(tabPane);
      }
      // 预留表单页签6
      if (configHeader.sslmInvestgReserve13) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve13, nextProps);
        tabs.push(tabPane);
      }
      // 预留表单页签7
      if (configHeader.sslmInvestgReserve14) {
        const tabPane = renderTabPane(configHeader.sslmInvestgReserve14, nextProps);
        tabs.push(tabPane);
      }
      nextState.tabs = tabs;
    }
    return nextState;
  }

  @Bind()
  handleParentTabKeyChange(activeKey) {
    if (!isEmpty(this.tabKeys[activeKey])) {
      const { onTabChange } = this.props;
      if (isFunction(onTabChange)) {
        onTabChange(this.tabKeys[activeKey]);
      }
    }
  }

  @Bind()
  handleChildTabKeyChange(pActiveKey, activeKey) {
    this.tabKeys[pActiveKey] = activeKey;
    const { onTabChange } = this.props;
    if (isFunction(onTabChange)) {
      onTabChange(activeKey);
    }
  }

  @Bind()
  setChildTabKeys(pTabKey, cTabKey) {
    if (isEmpty(this.tabKeys[pTabKey])) {
      this.tabKeys[pTabKey] = cTabKey;
    }
  }

  render() {
    const { tabs } = this.state;
    const {
      dataSource = {},
      pagination = {},
      tabPosition = 'left',
      loading,
      _status,
      supplierCateProps,
      fetchSupplierCate,
      onTableChange,
      allowDeleteAllLineFlag = true,
    } = this.props;
    return (
      <ComponentContext.Provider
        value={{
          dataSource,
          pagination,
          onTableChange,
          loading,
          _status,
          supplierCateProps,
          fetchSupplierCate,
          allowDeleteAllLineFlag,
        }}
      >
        <Tabs
          animated={false}
          tabPosition={tabPosition}
          onChange={this.handleParentTabKeyChange}
          className={styles['component-wrapper']}
        >
          {tabs}
        </Tabs>
      </ComponentContext.Provider>
    );
  }
}
