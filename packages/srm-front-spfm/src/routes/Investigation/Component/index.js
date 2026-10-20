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
    onRemoves = {},
    rowKeys = {},
    onRefs = {},
    onRefsCurrent,
    onGetValidateDataSourceHooks = {},
    disableStyle,
    investgHeaderId,
    defaultBankInfo,
    purchaserTenantNum,
    referenceRangeMessage = [],
    referenceRangeErrorList = [],
  },
  parentTabTitle = ''
) {
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
            {({ dataSource, loading, curActiveKey, processStatus }) => {
              const { lines, ...other } = header;
              return (
                <ComposeForm
                  editable={edit}
                  fields={header.lines}
                  curActiveKey={curActiveKey}
                  onRefsCurrent={onRefsCurrent}
                  purchaserTenantNum={purchaserTenantNum}
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
                  processStatus={processStatus}
                  referenceRangeMessage={referenceRangeMessage[header.configName]}
                  referenceRangeErrorList={referenceRangeErrorList[header.configName]}
                  configName={header.configName || ''}
                  investigateTemplate={header.investigateTemplate || {}}
                />
              );
            }}
          </ComponentContext.Consumer>
        </TabPane>
      );
    // case 'sslmInvestgFinBranch': // 分支机构 // 财务状况
    // case 'sslmInvestgAddress': // 地址信息 // 联系人及地址信息
    // case 'sslmInvestgAuth': // 资质信息
    case 'sslmInvestgSupplierCate': // 供应商分类
    case 'sslmInvestgFin': // 近三年财务状况 // 财务状况
    case 'sslmInvestgContact': // 联系人信息 // 联系人及地址信息
    case 'sslmInvestgCustomer': // 主要客户情况 // 合作伙伴
    case 'sslmInvestgSubSupplier': // 分供方情况 // 合作伙伴
    case 'sslmInvestgEquipment': // 设备信息
      // case 'sslmInvestgAttachment': // 附件信息
      return (
        <TabPane tab={header.configDescription} key={header.configName}>
          <ComponentContext.Consumer>
            {({ dataSource, loading, curActiveKey, processStatus, onTableChange }) => {
              const { lines, ...other } = header;
              return (
                <ComposeTable
                  editModalTitle={header.configDescription}
                  fields={header.lines}
                  curActiveKey={curActiveKey}
                  onRefsCurrent={onRefsCurrent}
                  purchaserTenantNum={purchaserTenantNum}
                  dataSource={dataSource[header.configName] || []}
                  configName={header.configName || ''}
                  onTableChange={onTableChange}
                  addable={edit}
                  editable={edit}
                  removable={edit}
                  importable={edit}
                  rowKey={rowKeys[header.configName] || 'id'}
                  organizationId={organizationId}
                  onRemove={onRemoves[header.configName]}
                  onRef={onRefs[header.configName]}
                  onGetValidateDataSourceHook={onGetValidateDataSourceHooks[header.configName]}
                  fieldLabelWidth={150}
                  loading={loading}
                  templateData={other}
                  processStatus={processStatus}
                  investgHeaderId={investgHeaderId}
                  investigateTemplate={header.investigateTemplate || {}}
                  referenceRangeMessage={referenceRangeMessage[header.configName]}
                />
              );
            }}
          </ComponentContext.Consumer>
        </TabPane>
      );
    case 'sslmInvestgAuth': // 资质信息
    case 'sslmInvestgBankAccount': // 开户行信息
    case 'sslmInvestgFinBranch': // 分支机构 // 财务状况
    case 'sslmInvestgProservice': // 产品及服务
    case 'sslmInvestgAddress': // 地址信息 // 联系人及地址信息
    case 'sslmInvestgAttachment': // 附件信息
    case 'sslmInvestgReserve1': // 预留页签1
    case 'sslmInvestgReserve2': // 预留页签2
    case 'sslmInvestgReserve5': // 预留页签3
    case 'sslmInvestgReserve6': // 预留页签4
    case 'sslmInvestgReserve7': // 预留页签5
    case 'sslmInvestgReserve8': // 预留页签6
    case 'sslmInvestgReserve9': // 预留页签7
      return (
        <TabPane tab={header.configDescription} key={header.configName}>
          <ComponentContext.Consumer>
            {({ dataSource, loading, curActiveKey, processStatus, onTableChange }) => {
              const { lines, ...other } = header;
              return (
                <AddressWrapperComponent>
                  <ComposeTable
                    editModalTitle={header.configDescription}
                    fields={header.lines}
                    curActiveKey={curActiveKey}
                    onRefsCurrent={onRefsCurrent}
                    purchaserTenantNum={purchaserTenantNum}
                    dataSource={dataSource[header.configName] || []}
                    configName={header.configName || ''}
                    onTableChange={onTableChange}
                    addable={edit}
                    editable={edit}
                    removable={edit}
                    importable={edit}
                    rowKey={rowKeys[header.configName] || 'id'}
                    organizationId={organizationId}
                    onRemove={onRemoves[header.configName]}
                    onRef={onRefs[header.configName]}
                    onGetValidateDataSourceHook={onGetValidateDataSourceHooks[header.configName]}
                    fieldLabelWidth={150}
                    loading={loading}
                    templateData={other}
                    defaultBankInfo={defaultBankInfo}
                    processStatus={processStatus}
                    investgHeaderId={investgHeaderId}
                    investigateTemplate={header.investigateTemplate || {}}
                    referenceRangeMessage={referenceRangeMessage[header.configName]}
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
            {({ dataSource, loading, curActiveKey, processStatus }) => {
              const { lines, ...other } = header;
              return (
                <AddressWrapperComponent>
                  <ComposeForm
                    editable={edit}
                    fields={header.lines}
                    curActiveKey={curActiveKey}
                    onRefsCurrent={onRefsCurrent}
                    purchaserTenantNum={purchaserTenantNum}
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
                    configName={header.configName}
                    processStatus={processStatus}
                    investigateTemplate={header.investigateTemplate || {}}
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
  const { configName } = config;
  const { edit, remote } = nextProps;
  return (
    <TabPane tab={renderTabPaneTitle({ ...config, edit, remote })} key={configName}>
      <Tabs animated={false}>{getTabPane(config, nextProps)}</Tabs>
    </TabPane>
  );
}

function renderTabPaneTitle({
  configDescription,
  validated = false,
  edit,
  remote,
  investigateTemplate,
}) {
  const showFlag = !!edit;
  const remoteShowFlag = remote
    ? remote.process('SPFM_INVITATION_INVESTIGATION_TAB_SHOW_TAG', showFlag, {
        investigateTemplate,
      })
    : showFlag;
  return (
    <div>
      {configDescription}
      {remoteShowFlag && (
        <span
          style={{
            fontWeight: 500,
            fontSize: 12,
            padding: '2px 4px',
            marginLeft: 8,
            color: validated ? '#179454' : '#F06200',
            backgroundColor: validated ? 'rgba(71,184,129,0.10)' : 'rgba(252,160,0,0.10)',
          }}
        >
          {validated
            ? intl.get('hzero.common.button.finish').d('完成')
            : intl.get('sslm.common.view.message.notFinish').d('未完成')}
        </span>
      )}
    </div>
  );
}

@formatterCollections({
  code: ['sslm.supplyAbility', 'spfm.investigationDefinition', 'sslm.common'],
})
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
    // 近三年财务状况
    sslmInvestgFin: 'sslmInvestgFin',
    // 分支机构
    sslmInvestgFinBranch: 'sslmInvestgFinBranch',
    // 资质信息
    sslmInvestgAuth: 'sslmInvestgAuth',
    // 联系人及地址信息
    // sslmInvestgContactAddress: 'sslmInvestgContactAddress',
    // sslmInvestgContact: 'sslmInvestgContact', // 联系人信息 // 联系人及地址信息
    // sslmInvestgAddress: 'sslmInvestgAddress', // 地址信息 // 联系人及地址信息
    // 开户行信息
    sslmInvestgBankAccount: 'sslmInvestgBankAccount',
    // 主要客户情况
    sslmInvestgCustomer: 'sslmInvestgCustomer',
    // 分供方情况
    sslmInvestgSubSupplier: 'sslmInvestgSubSupplier',
    // 设备信息
    sslmInvestgEquipment: 'sslmInvestgEquipment',
    // 研发能力
    sslmInvestgRd: 'sslmInvestgRd',
    // 生产能力
    sslmInvestgProduce: 'sslmInvestgProduce',
    // 质保能力
    sslmInvestgQa: 'sslmInvestgQa',
    // 售后服务
    sslmInvestgCustservice: 'sslmInvestgCustservice',
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
    const { remote, config, edit, defaultBankInfo = {} } = nextProps;
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
      partnerCompanyName !== oldPartnerCompanyName
    ) {
      const configHeader = {};
      map(config, (h) => {
        configHeader[h.configName] = h;
      });
      // nextState.configHeader = configHeader;
      nextState.config = config;
      nextState.edit = edit;
      nextState.defaultBankInfo = defaultBankInfo;
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

      const productsAndServicesTabs = [];
      let productsAndServicesFirstTab = '';
      let proserviceValidated = true;
      let supplierCateValidated = true;
      if (configHeader.sslmInvestgProservice) {
        const { validated } = configHeader.sslmInvestgProservice;
        proserviceValidated = validated;
        productsAndServicesTabs.push(getTabPane(configHeader.sslmInvestgProservice, nextProps));
        productsAndServicesFirstTab = 'sslmInvestgProservice';
      }
      if (configHeader.sslmInvestgSupplierCate) {
        const { validated } = configHeader.sslmInvestgSupplierCate;
        supplierCateValidated = validated;
        productsAndServicesTabs.push(getTabPane(configHeader.sslmInvestgSupplierCate, nextProps));
        if (!productsAndServicesFirstTab) {
          productsAndServicesFirstTab = 'sslmInvestgSupplierCate';
        }
      }
      setChildTabKeys('sslmInvestgProservice', productsAndServicesFirstTab);
      if (productsAndServicesTabs.length > 0) {
        const configDescription = intl
          .get(`spfm.investigationDefinition.view.message.tab.proservice`)
          .d('产品及服务');
        tabs.push(
          <TabPane
            tab={renderTabPaneTitle({
              remote,
              configDescription,
              validated: proserviceValidated && supplierCateValidated,
              edit,
              investigateTemplate: (
                configHeader.sslmInvestgProservice || configHeader.sslmInvestgSupplierCate
              )?.investigateTemplate,
            })}
            key="sslmInvestgProservice"
          >
            <Tabs
              animated={false}
              onChange={(activeKey) => {
                handleChildTabKeyChange('sslmInvestgProservice', activeKey);
              }}
            >
              {productsAndServicesTabs}
            </Tabs>
          </TabPane>
        );
      }
      // 近三年财务状况
      if (configHeader.sslmInvestgFin) {
        const tabPane = renderTabPane(configHeader.sslmInvestgFin, nextProps);
        tabs.push(tabPane);
      }
      // 分支机构1
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
        const { validated } = configHeader.sslmInvestgContact;
        contactValidated = validated;
        contactAndAddressTabs.push(getTabPane(configHeader.sslmInvestgContact, nextProps));
        contactAndAddressFirstTab = 'sslmInvestgContact';
      }
      if (configHeader.sslmInvestgAddress) {
        const { validated } = configHeader.sslmInvestgAddress;
        addressValidated = validated;
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
              remote,
              configDescription,
              validated: contactValidated && addressValidated,
              edit,
              investigateTemplate: (
                configHeader.sslmInvestgContact || configHeader.sslmInvestgAddress
              )?.investigateTemplate,
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
      if (configHeader.sslmInvestgAttachment) {
        const { validated } = configHeader.sslmInvestgAttachment;
        const configDescription = intl
          .get(`spfm.investigationDefinition.view.message.tab.attachment`)
          .d('附件信息');
        tabs.push(
          <TabPane
            tab={renderTabPaneTitle({
              remote,
              configDescription,
              validated,
              edit,
              investigateTemplate: configHeader.sslmInvestgAttachment?.investigateTemplate,
            })}
            key="sslmInvestgAttachment"
          >
            <Tabs animated={false}>
              {getTabPane(configHeader.sslmInvestgAttachment, nextProps)}
            </Tabs>
          </TabPane>
        );
        // tabs.push(getTabPane(configHeader.sslmInvestgAttachment, nextProps));
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
      tabPosition = 'left',
      loading,
      curActiveKey,
      processStatus,
      onTableChange,
    } = this.props;
    return (
      <ComponentContext.Provider
        value={{ dataSource, loading, curActiveKey, processStatus, onTableChange }}
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
