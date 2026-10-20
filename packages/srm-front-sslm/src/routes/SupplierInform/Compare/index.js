/**
 * SupplierForm - 明细对比
 * @date: 2019-12-19
 * @author: xiongliang <liang.xiong@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import { forEach, camelCase, isArray, uniq } from 'lodash';
import React, { Fragment } from 'react';
import { Collapse, Row, Col, Icon, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';
import RegistInform from './RegistInform';
import BusinessInfo from './BusinessInfo';
import ContactInfo from './ContactInfo';
import AddressInfo from './AddressInfo';
import BankInfo from './BankInfo';
import InvoiceInfo from './InvoiceInfo';
import AttachmentInfo from './AttachmentInfo';
import SupplyCapacity from './SupplyCapacity';
import SupplierClassify from './SupplierClassify';
import LocationInfo from './LocationInfo';
import PurchaseInfo from './PurchaseInfo';
import OtherInfo from './OtherInfo';
import HeaderInfo from './HeaderInfo';
import { InvestigateTable } from './Investigate';
import '@/routes/index.less';

const { Panel } = Collapse;
const dataSource = 2; // 接口公用，区分企业信息变更（1），供应商信息变更（2）
@connect(({ supplierInformCompare, loading }) => ({
  supplierInformCompare,
  querySupplierLoading:
    loading.effects['supplierInformCompare/fetchEnterpriseInform'] ||
    loading.effects['supplierInformCompare/fetchSupplierInfo'] ||
    loading.effects['supplierInformCompare/queryInvestigateConfig'] ||
    loading.effects['supplierInformCompare/queryInvestigate'],
}))
@formatterCollections({
  code: [
    'sslm.supplierInform',
    'sslm.supplyAbility',
    'sslm.enterpriseInform',
    'spfm.enterprise',
    'spfm.importErp',
    'sslm.common',
    'spfm.bank',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER', // 基础信息
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COMPARE_SUPPLY_ABILITY', // 供货能力清单-明细对比
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.OTHER_INFO_FORM', // 其他信息
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_HEAD', // 采购财务头信息
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_INFO', // 采购财务行信息
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CONTACT_INFO', // 联系人
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ADDRESS_INFO', // 地址信息
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BANK_INFO', // 银行信息
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BUSINESS_INFO', // 业务信息
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY', // 供应商分类
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ATTACHMENT_INFO', // 附件信息
  ],
})
export default class SupplierInform extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseInfo: {}, // 基础信息
      enterpriseData: {}, // 企业信息数据源集合
      supplierData: {}, // 供应商数据源集合
      configs: {}, // 调查表配置
      configNameList: [], // 调查表configName集合
      investigateData: {}, // 调查表数据源集合
      collapseKeys: [],
    };
  }

  componentDidMount() {
    const { changeReqId } = this.props;
    if (changeReqId) {
      this.queryInvestigateConfig();
    }
  }

  /**
   * 查询调查表配置
   */
  @Bind()
  queryInvestigateConfig() {
    const { dispatch, changeReqId } = this.props;
    dispatch({
      type: 'supplierInformCompare/queryInvestigateConfig',
      payload: { changeReqId },
    }).then(res => {
      if (res) {
        const {
          investigateConfigHeaders,
          investigateConfigLines,
          investigateConfigComponents,
        } = res;
        const configHeaders = {};
        const configLines = {};
        const headers = {};
        const configNameList = [];
        // 处理头
        forEach(investigateConfigHeaders, (header = {}) => {
          configHeaders[header.investgCfHeaderId] = header;
          configHeaders[header.investgCfHeaderId].lines = [];
          configNameList.push(header.configName);
        });

        // 处理行
        forEach(investigateConfigLines, (line = {}) => {
          configLines[line.investgCfLineId] = line;
          configLines[line.investgCfLineId].fieldCode = camelCase(line.fieldCode);
          const lines =
            configHeaders[line.investgCfHeaderId] && configHeaders[line.investgCfHeaderId].lines;
          if (lines) {
            lines.push(line);
            configLines[line.investgCfLineId].props = [];
          }
        });

        // 处理属性
        forEach(investigateConfigComponents, (componentProp = {}) => {
          const props =
            configLines[componentProp.investgCfLineId] &&
            configLines[componentProp.investgCfLineId].props;
          if (props) {
            props.push(componentProp);
          }
        });

        forEach(configHeaders, (header = {}) => {
          headers[header.configName] = header;
        });
        this.setState({ configs: headers, configNameList });
        this.queryInvestigateDataList(configNameList);
        this.queryData(configNameList);
      }
    });
  }

  /**
   * 查询调查表数据
   */
  @Bind()
  queryInvestigateDataList(configNameList) {
    const { dispatch, changeReqId } = this.props;
    forEach(configNameList, configName => {
      dispatch({
        type: 'supplierInformCompare/queryInvestigate',
        payload: {
          configName,
          changeReqId,
          dataSource,
          desensitize: configName === 'sslmInvestgBankAccount' ? false : null,
        },
      }).then(result => {
        let curKey;
        switch (configName) {
          case 'sslmInvestgContact': // 联系人信息
            curKey = this.handleDataChange(result, 'contactInform');
            break;
          case 'sslmInvestgBankAccount': // 银行信息
            curKey = this.handleDataChange(result, 'bankInform');
            break;
          case 'sslmInvestgAddress': // 地址信息
            curKey = this.handleDataChange(result, 'addressInform');
            break;
          case 'sslmInvestgAttachment': // 附件信息
            curKey = this.handleDataChange(result, 'attachmentInform');
            break;
          default:
            break;
        }
        if (curKey) {
          this.updateCollapseKeys([curKey]);
        }
        this.setState(prevState => {
          const { investigateData } = prevState;
          return {
            investigateData: {
              ...investigateData,
              [configName]: result,
            },
          };
        });
      });
    });
  }

  // 判断供应商信息数据源是否有变更
  @Bind()
  handleDataChange(data, curKey) {
    let key = null;
    if (isArray(data)) {
      data.forEach(item => {
        if (isArray(item)) {
          item.forEach(n => {
            if (n && (n.objectFlag || n.changeFlag)) {
              key = curKey;
            }
          });
        }
      });
    }
    return key;
  }

  // 更新collapseKeys
  @Bind()
  updateCollapseKeys(defaultKeys = []) {
    this.setState(prevState => {
      const { collapseKeys } = prevState;
      return {
        collapseKeys: uniq([...collapseKeys, ...defaultKeys]),
      };
    });
  }

  /**
   * 查询数据源
   */
  @Bind()
  queryData(configNameList) {
    const { dispatch, changeReqId, companyId } = this.props;
    const defaultKeys = [];
    // 查询基础信息
    dispatch({
      type: 'supplierInformCompare/fetchBasicInfo',
      payload: {
        changeReqId,
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER',
      },
    }).then(res => {
      if (res) {
        if (res.newHeader.objectFlag || res.oldHeader.objectFlag) {
          defaultKeys.push('baseInform');
        }
        this.updateCollapseKeys(defaultKeys);
        this.setState({ baseInfo: res });
      }
    });
    // 查询企业信息
    dispatch({
      type: 'supplierInformCompare/fetchEnterpriseInform',
      payload: {
        changeReqId,
        companyId,
        dataSource,
        configNameList,
        desensitize: false,
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.OTHER_INFO_FORM',
      },
    }).then(res => {
      if (res) {
        for (const key in res) {
          if (Object.hasOwnProperty.call(res, key)) {
            const element = res[key];
            for (const elementKey in element) {
              if (Object.hasOwnProperty.call(element, elementKey)) {
                const curElement = element[elementKey];
                if (isArray(curElement)) {
                  curElement.forEach(n => {
                    if (n && (n.objectFlag || n.changeFlag)) {
                      defaultKeys.push(key);
                    }
                  });
                } else if (curElement && (curElement.objectFlag || curElement.changeFlag)) {
                  defaultKeys.push(key);
                }
              }
            }
          }
        }
        this.updateCollapseKeys(defaultKeys);
        this.setState({ enterpriseData: res });
      }
    });

    // 查询供应商信息
    dispatch({
      type: 'supplierInformCompare/fetchSupplierInfo',
      payload: {
        changeReqId,
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COMPARE_SUPPLY_ABILITY',
      },
    }).then(res => {
      if (res) {
        for (const key in res) {
          if (Object.hasOwnProperty.call(res, key)) {
            const element = res[key];
            let curKey;
            if (['purHeadInfo', 'purchaseList'].includes(key)) {
              curKey = this.handleDataChange(element, 'purchaseInform');
            } else {
              curKey = this.handleDataChange(element, key);
            }
            if (curKey) {
              defaultKeys.push(curKey);
            }
          }
        }
        this.updateCollapseKeys(defaultKeys);
        this.setState({ supplierData: res });
      }
    });
  }

  /**
   *  折叠面板onChange
   */
  @Bind()
  handleCollapseChange(collapseKeys) {
    this.setState({ collapseKeys });
  }

  /**
   * 渲染配置表折叠面板的Panel
   */
  @Bind()
  handleModelTable() {
    const { tableList = [], changeReqId } = this.props;
    const modelTableList =
      tableList &&
      tableList.map(item => {
        return {
          key: item.tableCode,
          title: item.tableName,
          componentList: [
            <DynamicTable
              modelTable={item}
              relationId={changeReqId}
              compareFlag
              pageFlag={false}
              compare={1}
              updateCollapseKeys={this.updateCollapseKeys}
              readOnly
            />,
            <DynamicTable
              modelTable={item}
              relationId={changeReqId}
              compareFlag
              pageFlag={false}
              compare={2}
              updateCollapseKeys={this.updateCollapseKeys}
              readOnly
            />,
          ],
        };
      });
    return modelTableList || [];
  }

  /**
   * 渲染对比信息
   */
  @Bind()
  renderCollapse(panel = {}) {
    const { collapseKeys } = this.state;
    const { key, title, componentList = [] } = panel;
    return (
      <Row gutter={24}>
        {componentList.map(component => (
          <Col span={12}>
            <div className="ued-detail-wrapper">
              <Collapse onChange={this.handleCollapseChange} activeKey={collapseKeys}>
                <Panel
                  key={key}
                  forceRender
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{title}</h3>
                      <a>
                        {collapseKeys.includes(key)
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                        <Icon type={collapseKeys.includes(key) ? 'up' : 'down'} />
                      </a>
                    </Fragment>
                  }
                >
                  {component}
                </Panel>
              </Collapse>
            </div>
          </Col>
        ))}
      </Row>
    );
  }

  render() {
    const {
      changeReqId,
      systemType,
      querySupplierLoading,
      customizeTable,
      siteFlag = 0,
      custLoading,
      customizeForm,
      collapseCodeList,
    } = this.props;
    const {
      baseInfo,
      enterpriseData: {
        registInform = {}, // 登记信息
        businessInform = {}, // 业务信息
        contactInform = {}, // 联系人
        addressInform = {}, // 地址
        bankInform = {}, // 银行信息
        invoiceInform = {}, // 开票信息
        attachmentInform = {}, // 附件信息
        otherInform = [], // 其他信息
      } = {},
      supplierData: {
        supplyCapacityInform = [], // 供货能力清单
        supplierClassify = [], // 供应商分类
        purHeadInfo = [], // 采购财务头信息
        purchaseList = [], // 采购财务Table
        locationInform = [], // 地点层
      } = {},
      configs,
      configNameList,
      investigateData,
    } = this.state;
    const commonProps = {
      custLoading,
      customizeForm,
      customizeTable,
    };

    const panelList = [
      {
        key: 'baseInform',
        title: intl.get('sslm.common.view.title.baseInfo').d('基础信息'),
        componentList: [
          <HeaderInfo detailHeader={baseInfo.oldHeader} customizeForm={customizeForm} />,
          <HeaderInfo detailHeader={baseInfo.newHeader} customizeForm={customizeForm} />,
        ],
      },
      {
        key: 'registInform',
        title: intl.get('sslm.enterpriseInform.view.model.companyInfo.title').d('登记信息'),
        componentList: [
          <RegistInform data={registInform.oldBasic} />,
          <RegistInform data={registInform.newBasic} />,
        ],
      },
      {
        key: 'businessInform',
        title: intl.get('sslm.enterpriseInform.view.message.businessTitle').d('基础业务信息'),
        componentList: [
          <BusinessInfo data={businessInform.oldBusiness} {...commonProps} />,
          <BusinessInfo data={businessInform.newBusiness} {...commonProps} />,
        ],
      },
      {
        key: 'contactInform',
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.title').d('联系人信息'),
        componentList: [
          configNameList.includes('sslmInvestgContact') ? (
            <InvestigateTable
              configData={configs.sslmInvestgContact}
              dataSource={(investigateData.sslmInvestgContact || {})[0]}
            />
          ) : (
            <ContactInfo dataSource={contactInform.oldContacts} customizeTable={customizeTable} />
          ),
          configNameList.includes('sslmInvestgContact') ? (
            <InvestigateTable
              configData={configs.sslmInvestgContact}
              dataSource={(investigateData.sslmInvestgContact || {})[1]}
            />
          ) : (
            <ContactInfo dataSource={contactInform.newContacts} customizeTable={customizeTable} />
          ),
        ],
      },
      {
        key: 'addressInform',
        title: intl.get('sslm.enterpriseInform.view.model.address.title').d('地址信息'),
        componentList: [
          configNameList.includes('sslmInvestgAddress') ? (
            <InvestigateTable
              configData={configs.sslmInvestgAddress}
              dataSource={(investigateData.sslmInvestgAddress || {})[0]}
            />
          ) : (
            <AddressInfo dataSource={addressInform.oldAddresses} customizeTable={customizeTable} />
          ),
          configNameList.includes('sslmInvestgAddress') ? (
            <InvestigateTable
              configData={configs.sslmInvestgAddress}
              dataSource={(investigateData.sslmInvestgAddress || {})[1]}
            />
          ) : (
            <AddressInfo dataSource={addressInform.newAddresses} customizeTable={customizeTable} />
          ),
        ],
      },
      {
        key: 'bankInform',
        title: intl.get('sslm.enterpriseInform.view.model.bank.title').d('银行信息'),
        componentList: [
          configNameList.includes('sslmInvestgBankAccount') ? (
            <InvestigateTable
              configData={configs.sslmInvestgBankAccount}
              dataSource={(investigateData.sslmInvestgBankAccount || {})[0]}
            />
          ) : (
            <BankInfo dataSource={bankInform.oldBankAccounts} {...commonProps} />
          ),
          configNameList.includes('sslmInvestgBankAccount') ? (
            <InvestigateTable
              configData={configs.sslmInvestgBankAccount}
              dataSource={(investigateData.sslmInvestgBankAccount || {})[1]}
            />
          ) : (
            <BankInfo dataSource={bankInform.newBankAccounts} {...commonProps} />
          ),
        ],
      },
      {
        key: 'invoiceInform',
        title: intl.get('sslm.enterpriseInform.view.model.invoice.title').d('开票信息'),
        componentList: [
          <InvoiceInfo data={invoiceInform.oldInvoice} />,
          <InvoiceInfo data={invoiceInform.newInvoice} />,
        ],
      },
      {
        key: 'attachmentInform',
        title: intl.get('sslm.enterpriseInform.view.model.attachmentInfo.title').d('附件信息'),
        componentList: [
          configNameList.includes('sslmInvestgAttachment') ? (
            <InvestigateTable
              configData={configs.sslmInvestgAttachment}
              dataSource={(investigateData.sslmInvestgAttachment || {})[0]}
            />
          ) : (
            <AttachmentInfo dataSource={attachmentInform.oldAttachments} {...commonProps} />
          ),
          configNameList.includes('sslmInvestgAttachment') ? (
            <InvestigateTable
              configData={configs.sslmInvestgAttachment}
              dataSource={(investigateData.sslmInvestgAttachment || {})[1]}
            />
          ) : (
            <AttachmentInfo dataSource={attachmentInform.newAttachments} {...commonProps} />
          ),
        ],
      },
      {
        key: 'supplyCapacityInform',
        title: intl
          .get(`sslm.supplierDetail.view.message.title.supplyCapacityList`)
          .d('供货能力清单'),
        componentList: [
          <SupplyCapacity
            dataSource={supplyCapacityInform[0]}
            attachment="old"
            customizeTable={customizeTable}
          />,
          <SupplyCapacity
            dataSource={supplyCapacityInform[1]}
            attachment="new"
            customizeTable={customizeTable}
          />,
        ],
      },
      {
        key: 'supplierClassify',
        title: intl.get(`sslm.supplyAbility.view.message.title.supplierClassify`).d('供应商分类'),
        componentList: [
          <SupplierClassify dataSource={supplierClassify[0]} {...commonProps} />,
          <SupplierClassify dataSource={supplierClassify[1]} {...commonProps} />,
        ],
      },
      {
        key: 'purchaseInform',
        title: intl.get(`sslm.supplierInform.view.fixCatalog.purchaseInform`).d('采购/财务信息'),
        componentList: [
          <PurchaseInfo formData={purHeadInfo[0]} dataSource={purchaseList[0]} {...commonProps} />,
          <PurchaseInfo formData={purHeadInfo[1]} dataSource={purchaseList[1]} {...commonProps} />,
        ],
      },
      ['EBS', 'BOTH'].includes(systemType) &&
        siteFlag !== 1 && {
          key: 'locationInform',
          title: intl.get(`sslm.supplierInform.view.fixCatalog.locationInform`).d('地点层信息'),
          componentList: [
            <LocationInfo changeReqId={changeReqId} dataSource={locationInform[0]} />,
            <LocationInfo changeReqId={changeReqId} dataSource={locationInform[1]} />,
          ],
        },
      {
        key: 'otherInform',
        title: intl.get(`sslm.supplierInform.view.fixCatalog.otherInform`).d('其他信息'),
        componentList: [
          <OtherInfo data={otherInform.oldOtherInfo} {...commonProps} />,
          <OtherInfo data={otherInform.newOtherInfo} {...commonProps} />,
        ],
      },
    ].filter(panel => collapseCodeList.includes(panel.key) || panel.key === 'baseInform');
    const modelTableList = this.handleModelTable();
    panelList.push(...modelTableList);

    return (
      <Spin spinning={querySupplierLoading || false}>
        <Row gutter={24} className="supplier-fixed">
          <Col span={12}>
            <h3 style={{ margin: '0 16px 16px' }}>
              {intl.get('sslm.enterpriseInform.view.title.beforeChange').d('变更前')}
            </h3>
          </Col>
          <Col span={12}>
            <h3 style={{ margin: '0 4px 16px' }}>
              {intl.get('sslm.enterpriseInform.view.title.afterChange').d('变更后')}
            </h3>
          </Col>
        </Row>
        <div style={{ marginTop: 26 }}>{panelList.map(panel => this.renderCollapse(panel))}</div>
      </Spin>
    );
  }
}
