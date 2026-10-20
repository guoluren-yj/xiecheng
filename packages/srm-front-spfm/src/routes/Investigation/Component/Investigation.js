/**
 * 调查表填写和预览
 * @date: 2018-8-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment } from 'react';
import { Spin, Modal, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import {
  isEmpty,
  forEach,
  camelCase,
  map,
  isArray,
  isFunction,
  isUndefined,
  round,
  head,
  isBoolean,
  last,
} from 'lodash';

import { getResponse, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import './index.less';
import {
  investigationTemplateHeaderQueryAll,
  fetchDataSource,
  saveData,
  submit,
  deleteData,
  checkBankAccount,
} from '@/services/investigationService';
import InvestigationTab from './index';
import OperatingRecord from '../../Invitation/components/OperatingRecord';

const language = getCurrentLanguage();

/**
 * 调查表填写和预览
 * @extends {Component} - React.Component
 * 需要传的值
 * @reactProps {Boolean} isQueryData true 查询调查表数据 fasle 不查询调查表数据
 * @reactProps {Boolean} isEdit true 可编辑 fasle 不可编辑
 * @reactProps {String} tabPosition 'bottom' | 'top' | 'left' | 'right' = 'right';
 * @reactProps {Number} investigateTemplateId 模板Id
 * @reactProps {Number} investgHeaderId 模板头Id
 * @reactProps {Number} organizationId 租户Id
 * @reactProps {Function} onChangeSaveLoading 改变保存按钮的loading
 * @reactProps {Function} onChangeSubmitLoading 改变提交按钮的loading
 * @reactProps {Function} onRefresh 保存后刷新的回调函数
 *
 *返回的值
 * @reactProps {Function} onSubmitHook 提交函数
 * @reactProps {Function} onSaveValidateDataHook 保存函数
 *
 *
 * @reactProps {Object} config tab配置信息
 * @reactProps {Object} dataSource 数据源
 * @return React.element
 */
export default class Investigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      spinning: true,
      isQueryData: props.isQueryData || true,
      isEdit: props.isEdit || false,
      tabPosition: props.tabPosition || 'left',
      investigateTemplateId: props.investigateTemplateId,
      investgHeaderId: props.investgHeaderId,
      defaultBankInfo: props.defaultBankInfo || {},
      onRefresh: props.onRefresh, // 刷新的方法
      config: [], // 调查表配置
      dataSource: {}, // 数据源
      activeKey: '', // tab的activeKey
      loadTab: {}, // 保存点击的Tab的key
      // saving: false,
      // submiting: false,
      saveType: props.saveType, // 保存类型 NO_CHECK 不校验
      organizationId: props.organizationId, // 租户Id
      rowKeys: {
        sslmInvestgProservice: 'investgProserviceId',
        sslmInvestgSupplierCate: 'investgSupplierCateId',
        sslmInvestgFin: 'investgFinId',
        sslmInvestgFinBranch: 'investgFinBranchId',
        sslmInvestgAuth: 'investgAuthId',
        sslmInvestgContact: 'investgContactId',
        sslmInvestgAddress: 'investgAddressId',
        sslmInvestgBankAccount: 'investgBankAccountId',
        sslmInvestgCustomer: 'investgCustomerId',
        sslmInvestgSubSupplier: 'investgSubSupplierId',
        sslmInvestgEquipment: 'investgEquipmentId',
        sslmInvestgAttachment: 'investgAttachmentId',
        sslmInvestgReserve1: 'investgReserve1Id',
        sslmInvestgReserve2: 'investgReserve2Id',
        sslmInvestgReserve5: 'investgReserve5Id',
        sslmInvestgReserve6: 'investgReserve6Id',
        sslmInvestgReserve7: 'investgReserve7Id',
        sslmInvestgReserve8: 'investgReserve8Id',
        sslmInvestgReserve9: 'investgReserve9Id',
      },
      operationRecordVisible: false,
    };
  }

  tabKeys = [
    // 基础信息
    'sslmInvestgBasic',
    // 业务信息
    'sslmInvestgBusiness',
    // 产品及服务
    'sslmInvestgProservice',
    'sslmInvestgSupplierCate',
    'sslmInvestgFin', // 近三年财务状况
    'sslmInvestgFinBranch', // 分支机构
    // 资质信息
    'sslmInvestgAuth',
    // 联系人及地址信息
    // sslmInvestgContactAddress: 'sslmInvestgContactAddress',
    'sslmInvestgContact', // 联系人信息 // 联系人及地址信息
    'sslmInvestgAddress', // 地址信息 // 联系人及地址信息
    // 开户行信息
    'sslmInvestgBankAccount',
    // 合作伙伴信息
    // sslmInvestgCustomerSupplier: 'sslmInvestgCustomerSupplier',
    'sslmInvestgCustomer', // 主要客户情况
    'sslmInvestgSubSupplier', // 分供方情况
    // 设备信息
    'sslmInvestgEquipment',
    // 研发与生产能力
    // sslmInvestgRdProduce: 'sslmInvestgRdProduce',
    'sslmInvestgRd', // 研发能力
    'sslmInvestgProduce', // 生产能力
    // 质保与售后服务
    // sslmInvestgQaCustService: 'sslmInvestgQaCustService',
    'sslmInvestgQa', // 质保能力
    'sslmInvestgCustservice', // 售后服务
    // 附件信息
    'sslmInvestgAttachment',
    // 预留表格页签1
    'sslmInvestgReserve1',
    // 预留表格页签2
    'sslmInvestgReserve2',
    // 预留表单页签1
    'sslmInvestgReserve3',
    // 预留表单页签2
    'sslmInvestgReserve4',
    // 预留表格页签3
    'sslmInvestgReserve5',
    // 预留表格页签4
    'sslmInvestgReserve6',
    // 预留表格页签5
    'sslmInvestgReserve7',
    // 预留表格页签6
    'sslmInvestgReserve8',
    // 预留表格页签7
    'sslmInvestgReserve9',
    // 预留表单页签3
    'sslmInvestgReserve10',
    // 预留表单页签4
    'sslmInvestgReserve11',
    // 预留表单页签5
    'sslmInvestgReserve12',
    // 预留表单页签6
    'sslmInvestgReserve13',
    // 预留表单页签7
    'sslmInvestgReserve14',
  ];

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const { investigateTemplateId, isEdit, isQueryData = true, investgHeaderId } = nextProps;
    if (investigateTemplateId !== prevState.investigateTemplateId) {
      nextState.investigateTemplateId = investigateTemplateId;
    }
    if (isEdit !== prevState.isEdit) {
      nextState.isEdit = isEdit;
    }
    if (isQueryData !== prevState.isQueryData) {
      nextState.isQueryData = isQueryData;
    }
    if (investgHeaderId !== prevState.investgHeaderId) {
      nextState.investgHeaderId = investgHeaderId;
    }
    if (!isQueryData) {
      nextState.dataSource = {};
    }
    return nextState;
  }

  async componentDidMount() {
    await this.loadCuxModule();
    this.fetchConfig();
    const { onSubmitHook, onSaveValidateDataHook } = this.props;
    if (isFunction(onSubmitHook)) {
      onSubmitHook(this.handleSubmit);
    }
    if (isFunction(onSaveValidateDataHook)) {
      onSaveValidateDataHook(this.handleSave);
    }
  }

  // 供应商加载采购方二开代码
  @Bind()
  async loadCuxModule() {
    const { purchaserTenantNum } = this.props;
    if (isFunction(window.loadTenantMicroConfig)) {
      await window.loadTenantMicroConfig(purchaserTenantNum);
    }
  }

  /**
   * 查询config配置(调查表配置)
   * saveFlag 点击保存按钮
   */
  @Bind()
  fetchConfig(saveFlag = false) {
    const { onChangeSubmitLoading = () => {} } = this.props;
    const {
      investigateTemplateId,
      organizationId,
      investgHeaderId,
      activeKey: currentActiveKey,
    } = this.state;
    if (investigateTemplateId && (organizationId || organizationId === 0)) {
      onChangeSubmitLoading(true);
      investigationTemplateHeaderQueryAll({
        investigateTemplateId,
        organizationId,
        investgHeaderId,
      })
        .then((response) => {
          this.setState({
            spinning: false,
          });
          const data = getResponse(response);
          if (!isEmpty(data)) {
            if (saveFlag) {
              if (!isUndefined(currentActiveKey)) {
                this.setState({ loadTab: { [currentActiveKey]: true }, dataSource: {} }, () => {
                  this.loadData(currentActiveKey);
                });
              }
              // 更新配置
              this.setState({ config: this.dealConfigData(data) });
            } else {
              // 旧调查表模版配置，重新按默认排序
              const allConfig = data.investigateConfigHeaders || [];
              // 排序之后的配置
              const finalConfig = [];
              // const
              this.tabKeys.forEach((item) => {
                const matchConfig = allConfig.find((i) => i.configName === item);
                if (matchConfig) {
                  finalConfig.push(matchConfig);
                }
              });
              const activeKey = finalConfig && finalConfig[0] && finalConfig[0].configName;
              this.setState({ config: this.dealConfigData(data), activeKey });
              if (activeKey) {
                this.handleChangeTab(activeKey);
              }
            }
          }
        })
        .finally(() => onChangeSubmitLoading(false));
    }
  }

  onRefs = {};

  onRefsCurrent = {};

  /**
   * 处理config
   */
  @Bind()
  dealConfigData(config) {
    const configHeaders = {};
    const configLines = {};
    const headers = [];
    // 处理头 处理 tab
    forEach(config.investigateConfigHeaders, (header) => {
      configHeaders[header.investgCfHeaderId] = header;
      configHeaders[header.investgCfHeaderId].lines = [];
      headers.push({
        ...header,
        investigateTemplate: config.investigateTemplate,
      });
      // 绑定每个页签的ref方法
      this.onRefs[header.configName] = (ref) => {
        this.onRefsCurrent[header.configName] = ref;
      };
    });

    // 处理行 处理字段
    forEach(config.investigateConfigLines, (line) => {
      const { fieldCode, componentType } = line;
      configLines[line.investgCfLineId] = line;
      configLines[line.investgCfLineId].fieldCode = camelCase(fieldCode);
      const lines =
        configHeaders[line.investgCfHeaderId] && configHeaders[line.investgCfHeaderId].lines;
      const formatFieldCode = camelCase(fieldCode);
      switch (formatFieldCode) {
        case 'attachmentType':
          if (componentType === 'ValueList') {
            configLines[line.investgCfLineId].componentType = 'Cascader';
          }
          break;
        default:
          break;
      }
      if (lines) {
        lines.push(line);
        configLines[line.investgCfLineId].props = [];
        configLines[line.investgCfLineId].fxProps = [];
      }
    });

    // 处理属性
    forEach(config.investigateConfigComponents, (componentProp) => {
      const props =
        configLines[componentProp.investgCfLineId] &&
        configLines[componentProp.investgCfLineId].props;
      if (props) {
        props.push(componentProp);
      }
      if (componentProp.attributeName === 'toValueListFlag' && componentProp.attributeValue) {
        const fieldCode =
          configLines[componentProp.investgCfLineId] &&
          configLines[componentProp.investgCfLineId].fieldCode;
        configLines[componentProp.investgCfLineId].componentType = 'ValueList';
        if (fieldCode === 'attachmentType') {
          configLines[componentProp.investgCfLineId].lovCode = 'SPFM.COMPANY.SUB_ATTACHMENT';
        }
        if (fieldCode === 'authenticationType') {
          configLines[componentProp.investgCfLineId].lovCode =
            'SSLM.QUALIFICATION_AUTHENTICATION_TYPE';
        }
      }
    });
    // 处理fx属性
    forEach(config.investigateConfigLineFXs, (componentProp) => {
      const props =
        configLines[componentProp.investgCfLineId] &&
        configLines[componentProp.investgCfLineId].fxProps;
      if (props) {
        props.push(componentProp);
      }
    });
    return headers;
  }

  /**
   * 切换Tab时执行/查询数据
   */
  @Bind()
  handleChangeTab(configName) {
    const { loadTab, isQueryData } = this.state;
    if (!loadTab[configName] && isQueryData) {
      this.loadData(configName);
    }
    loadTab[configName] = true;
    this.setState({ activeKey: configName, loadTab });
  }

  /**
   * 处理财务信息数据
   */
  @Bind()
  handleFinanceData(record = {}) {
    const {
      totalAssets,
      totalLiabilities,
      currentAssets,
      currentLiabilities,
      revenue,
      netProfit,
      ...others
    } = record;
    const obj = {
      totalAssets: language === 'en_US' ? totalAssets && round(totalAssets * 100, 2) : totalAssets,
      totalLiabilities:
        language === 'en_US'
          ? totalLiabilities && round(totalLiabilities * 100, 2)
          : totalLiabilities,
      currentAssets:
        language === 'en_US' ? currentAssets && round(currentAssets * 100, 2) : currentAssets,
      currentLiabilities:
        language === 'en_US'
          ? currentLiabilities && round(currentLiabilities * 100, 2)
          : currentLiabilities,
      revenue: language === 'en_US' ? revenue && round(revenue * 100, 2) : revenue,
      netProfit: language === 'en_US' ? netProfit && round(netProfit * 100, 2) : netProfit,
    };
    return {
      ...obj,
      ...others,
    };
  }

  // 存储【参考区间】的检验信息
  referenceRangeMessage = {};

  // 存储不合符【参考区间】的字段
  referenceRangeErrorList = {};

  /**
   * 校验后端返回的数据是否在指定区间内
   * @param {*} referenceRange 模板配置的区间值
   * @param {*} dataSourceRange 后端数据返回的区间值
   */
  @Bind()
  validateRange({ referenceRange, dataSourceRange }) {
    let validateFlag = true;
    // 区间值
    const rangeData = referenceRange.slice(1, -1) && referenceRange.slice(1, -1).split(',');
    const leftNum = Number(rangeData[0]);
    const rightNum = Number(rangeData[1]);
    // 后端返回值
    const dataSource = parseFloat(dataSourceRange);
    // 左操作符
    const leftOperator = referenceRange.substr(0, 1);
    // 右操作符
    const rightOperator = referenceRange.substr(-1, 1);
    switch (leftOperator) {
      case '(':
        if (rightOperator === ')') {
          validateFlag = dataSource > leftNum && dataSource < rightNum;
        }
        if (rightOperator === ']') {
          validateFlag = dataSource > leftNum && dataSource <= rightNum;
        }
        break;
      case '[':
        if (rightOperator === ')') {
          validateFlag = dataSource >= leftNum && dataSource < rightNum;
        }
        if (rightOperator === ']') {
          validateFlag = dataSource >= leftNum && dataSource <= rightNum;
        }
        break;
      default:
        break;
    }
    return validateFlag;
  }

  /**
   * 获取校验信息
   * @param {Boolean} validateFlag 是否在参考区间内
   * @param {String} fieldDescription 字段名称
   * @param {String} referenceRange 参考区间
   * @param {String} configName 当前页签名称
   */
  @Bind()
  getValidateMessage({ validateFlag, fieldCode, fieldDescription, referenceRange, configName }) {
    if (!validateFlag) {
      const message = `【${fieldDescription}】${intl
        .get(`sslm.investigCorrelat.model.validate.referenceRange`, {
          name: referenceRange,
        })
        .d(`维护的数值不在【${referenceRange}参考区间】内，请审核是否符合要求`)}`;
      if (!this.referenceRangeMessage[configName].includes(message)) {
        this.referenceRangeMessage[configName].push(message);
      }
      if (!this.referenceRangeErrorList[configName].includes(fieldCode)) {
        this.referenceRangeErrorList[configName].push(fieldCode);
      }
    } else {
      const message = `【${fieldDescription}】${intl
        .get(`sslm.investigCorrelat.model.validate.inRange`, {
          name: referenceRange,
        })
        .d(`的数值参考区间为【${referenceRange}】`)}`;
      if (!this.referenceRangeMessage[configName].includes(message)) {
        this.referenceRangeMessage[configName].push(message);
      }
    }
  }

  /**
   * 校验【数值】类型字段是否在模板设定的【参考区间】内
   * @param {*} data 当前页签数据源
   * @param {*} configName 当前页签的configName
   */
  @Bind()
  validateReferenceRange({ data, configName }) {
    const { config } = this.state;
    // 获取当前页签配置项
    const currentTabConfig = head(config.filter((n) => n.configName === configName)) || {};
    const { lines = [] } = currentTabConfig;
    // 存储当前页签的props属性
    const currentAttribute = {};
    for (const line of lines) {
      const { fieldCode, fieldDescription, props } = line;
      for (const prop of props) {
        currentAttribute[fieldCode] = {
          ...currentAttribute[fieldCode],
          fieldCode,
          fieldDescription,
          [prop.attributeName]: prop.attributeValue,
        };
      }
    }
    this.referenceRangeMessage[configName] = [];
    this.referenceRangeErrorList[configName] = [];
    // 属性维度的遍历
    for (const attribute in currentAttribute) {
      if (Object.hasOwnProperty.call(currentAttribute, attribute)) {
        const attributeElement = currentAttribute[attribute];
        const { referenceRange, validateRules, fieldCode, fieldDescription } = attributeElement;
        if (validateRules && referenceRange) {
          if (isArray(data)) {
            // 表格数据，有一行不满足区间范围就提示
            const fieldCodeData = data.map((n) => n[fieldCode]);
            const validateList = fieldCodeData.map((item) => {
              const validateFlag = this.validateRange({
                referenceRange,
                dataSourceRange: item,
              });
              return validateFlag;
            });
            const finallyValidateFlag = !validateList.includes(false);
            this.getValidateMessage({
              validateFlag: finallyValidateFlag,
              fieldCode,
              fieldDescription,
              referenceRange,
              configName,
            });
          } else if (data) {
            const validateFlag = this.validateRange({
              referenceRange,
              dataSourceRange: data[fieldCode],
            });
            this.getValidateMessage({
              validateFlag,
              fieldCode,
              fieldDescription,
              referenceRange,
              configName,
            });
          }
        }
      }
    }
  }

  /**
   * 查询数据
   * @param {*} configName - tab页的key, 后台接口名
   */
  @Bind()
  loadData(configName) {
    const { investgHeaderId, organizationId } = this.state;
    const { onChangeQueryInvestgLoading = (e) => e } = this.props;
    if (investgHeaderId && !isEmpty(configName)) {
      this.setState({ loading: true });
      onChangeQueryInvestgLoading(true);
      fetchDataSource({ configName, organizationId, investgHeaderId })
        .then((response) => {
          const data = getResponse(response);
          this.validateReferenceRange({ data, configName });
          // 更新dataSource
          this.setState((prevState) => {
            const { dataSource } = prevState;
            const newDataSource = this.updateDataSource(dataSource, data, configName);
            if (configName === 'sslmInvestgFin') {
              const financeData = newDataSource[configName];
              let newFinanceData = financeData;
              // 处理语言环境切换
              if (isArray(newFinanceData)) {
                newFinanceData = newFinanceData.map((n) => {
                  const {
                    totalAssets,
                    totalLiabilities,
                    currentAssets,
                    currentLiabilities,
                    revenue,
                    netProfit,
                  } = n;
                  const obj = {
                    totalAssets: language === 'en_US' ? round(totalAssets / 100, 4) : totalAssets,
                    totalLiabilities:
                      language === 'en_US' ? round(totalLiabilities / 100, 4) : totalLiabilities,
                    currentAssets:
                      language === 'en_US' ? round(currentAssets / 100, 4) : currentAssets,
                    currentLiabilities:
                      language === 'en_US'
                        ? round(currentLiabilities / 100, 4)
                        : currentLiabilities,
                    revenue: language === 'en_US' ? round(revenue / 100, 4) : revenue,
                    netProfit: language === 'en_US' ? round(netProfit / 100, 4) : netProfit,
                  };
                  return {
                    ...n,
                    ...obj,
                  };
                });
              }
              newDataSource[configName] = newFinanceData;
            }
            return {
              dataSource: newDataSource,
            };
          });
          this.setState({ loading: false });
        })
        .finally(() => {
          onChangeQueryInvestgLoading(false);
        });
    }
  }

  /**
   * 更新dataSource
   * @param {Object} dataSource 数据源
   * @param {Object} data 查询某页的信息
   * @param {String} configName tab的key
   */
  @Bind()
  updateDataSource(dataSource, data, configName) {
    return {
      ...dataSource,
      [configName]: data,
    };
  }

  /**
   * 获取和验证表单信息
   */
  onGetValidateDataSourceHooks = {
    sslmInvestgBasic: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgBasic = getBaseValidateDataSource;
    },
    sslmInvestgBusiness: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgBusiness = getBaseValidateDataSource;
    },
    sslmInvestgProservice: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgProservice = getBaseValidateDataSource;
    },
    sslmInvestgSupplierCate: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgSupplierCate = getBaseValidateDataSource;
    },
    sslmInvestgFin: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgFin = getBaseValidateDataSource;
    },
    sslmInvestgFinBranch: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgFinBranch = getBaseValidateDataSource;
    },
    sslmInvestgAuth: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgAuth = getBaseValidateDataSource;
    },
    sslmInvestgContact: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgContact = getBaseValidateDataSource;
    },
    sslmInvestgAddress: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgAddress = getBaseValidateDataSource;
    },
    sslmInvestgBankAccount: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgBankAccount = getBaseValidateDataSource;
    },
    sslmInvestgCustomer: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgCustomer = getBaseValidateDataSource;
    },
    sslmInvestgSubSupplier: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgSubSupplier = getBaseValidateDataSource;
    },
    sslmInvestgEquipment: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgEquipment = getBaseValidateDataSource;
    },
    sslmInvestgRd: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgRd = getBaseValidateDataSource;
    },
    sslmInvestgProduce: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgProduce = getBaseValidateDataSource;
    },
    sslmInvestgQa: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgQa = getBaseValidateDataSource;
    },
    sslmInvestgCustservice: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgCustservice = getBaseValidateDataSource;
    },
    sslmInvestgAttachment: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgAttachment = getBaseValidateDataSource;
    },
    sslmInvestgReserve1: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve1 = getBaseValidateDataSource;
    },
    sslmInvestgReserve2: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve2 = getBaseValidateDataSource;
    },
    sslmInvestgReserve3: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve3 = getBaseValidateDataSource;
    },
    sslmInvestgReserve4: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve4 = getBaseValidateDataSource;
    },
    sslmInvestgReserve5: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve5 = getBaseValidateDataSource;
    },
    sslmInvestgReserve6: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve6 = getBaseValidateDataSource;
    },
    sslmInvestgReserve7: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve7 = getBaseValidateDataSource;
    },
    sslmInvestgReserve8: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve8 = getBaseValidateDataSource;
    },
    sslmInvestgReserve9: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve9 = getBaseValidateDataSource;
    },
    sslmInvestgReserve10: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve10 = getBaseValidateDataSource;
    },
    sslmInvestgReserve11: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve11 = getBaseValidateDataSource;
    },
    sslmInvestgReserve12: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve12 = getBaseValidateDataSource;
    },
    sslmInvestgReserve13: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve13 = getBaseValidateDataSource;
    },
    sslmInvestgReserve14: (getBaseValidateDataSource) => {
      this.getValidateDataSources.sslmInvestgReserve14 = getBaseValidateDataSource;
    },
  };

  getValidateDataSources = {};

  /**
   *保存数据
   *
   * @param {Object} headerInfo 调查表头信息，可不传
   */
  @Bind()
  async handleSave(headerInfo) {
    try {
      const { organizationId, investgHeaderId, loadTab, saveType } = this.state;
      const getAllData = [];
      const getAllDataSeq = [];
      forEach(Object.keys(loadTab), (configName) => {
        getAllDataSeq.push(configName);
        getAllData.push(this.getValidateDataSources[configName](saveType));
      });
      const params = {}; // 保存的数据
      const data = await Promise.all(getAllData);
      forEach(getAllDataSeq, (configName, index) => {
        if (isArray(data[index])) {
          params[configName] = map(data[index], (record) => {
            if (configName === 'sslmInvestgAddress') {
              const { regionIdList = [], ...others } = record;
              return {
                ...others,
                regionId: last(regionIdList),
                tenantId: organizationId,
                investgHeaderId,
              };
            } else if (configName === 'sslmInvestgFin') {
              const newRecord = this.handleFinanceData(record);
              return {
                ...newRecord,
                tenantId: organizationId,
                investgHeaderId,
              };
            } else {
              return { ...record, tenantId: organizationId, investgHeaderId };
            }
          });
        } else {
          params[configName] = {
            ...data[index],
            tenantId: organizationId,
            investgHeaderId,
          };
        }
      });
      if (!isEmpty(headerInfo)) {
        params.headerInfo = headerInfo;
      }
      this.saveData(params);
    } catch (errObj) {
      const { tabTitle, err, parentTabTitle } = errObj;
      // 数据校验失败
      const messageElement = [];
      forEach(err, (value, index) => {
        messageElement.push(<div key={index}>{value.errors[0].message}</div>);
      });
      notification.warning({
        message: parentTabTitle ? `${parentTabTitle} - ${tabTitle}` : tabTitle,
        description: messageElement,
      });
    }
  }

  /**
   * 保存数据调用接口
   * @param {Object} payload 保存的数据
   */
  @Bind()
  saveData(payload) {
    const { investgHeaderId, organizationId, onRefresh } = this.state;
    const { onChangeSaveLoading = (e) => e, partnerTenantId } = this.props;
    onChangeSaveLoading(true);
    saveData(
      {
        ...payload,
        customizeUnitCode: 'SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
        customizeTenantId: partnerTenantId,
      },
      investgHeaderId,
      organizationId
    )
      .then((response) => {
        if (getResponse(response)) {
          // 重新查询调查表模板用于更新页签完成标识
          this.fetchConfig(true);
          notification.success();
          if (isFunction(onRefresh)) {
            onRefresh();
          }
        }
      })
      .finally(() => onChangeSaveLoading(false));
  }

  /**
   * 提交调查表
   * @param {Function} handleToList 提交成功后的回调函数(跳转页面)
   * @param {Object} headerInfo 调查表头
   */
  @Bind()
  async handleSubmit(handleToList, headerInfo) {
    const { investgHeaderId, organizationId, loadTab } = this.state;
    const { onChangeSubmitLoading = (e) => e } = this.props;
    try {
      const getAllData = [];
      const getAllDataSeq = [];
      forEach(Object.keys(loadTab), (configName) => {
        getAllDataSeq.push(configName);
        getAllData.push(this.getValidateDataSources[configName]());
      });
      const params = {};
      const data = await Promise.all(getAllData);
      forEach(getAllDataSeq, (configName, index) => {
        if (isArray(data[index])) {
          params[configName] = map(data[index], (record) => {
            if (configName === 'sslmInvestgAddress') {
              const { regionIdList = [], ...others } = record;
              return {
                ...others,
                regionId: last(regionIdList),
                tenantId: organizationId,
                investgHeaderId,
              };
            } else if (configName === 'sslmInvestgFin') {
              const newRecord = this.handleFinanceData(record);
              return {
                ...newRecord,
                tenantId: organizationId,
                investgHeaderId,
              };
            } else {
              return { ...record, tenantId: organizationId, investgHeaderId };
            }
          });
        } else {
          params[configName] = {
            ...data[index],
            tenantId: organizationId,
            investgHeaderId,
          };
        }
      });
      if (!isEmpty(headerInfo)) {
        params.headerInfo = headerInfo;
      }
      onChangeSubmitLoading(true);
      // 先校验银行账号
      this.handleCheckBankAccount({
        params,
        handleToList,
      });
    } catch (errObj) {
      const { tabTitle, err, parentTabTitle } = errObj;
      // 数据校验失败
      const messageElement = [];
      forEach(err, (value, index) => {
        messageElement.push(<div key={index}>{value.errors[0].message}</div>);
      });
      notification.warning({
        message: parentTabTitle ? `${parentTabTitle} - ${tabTitle}` : tabTitle,
        description: messageElement,
      });
    }
  }

  /**
   * 弱校验
   */
  @Bind()
  handleCheckBankAccount({ params = {}, handleToList = () => {} }) {
    const { investgHeaderId } = this.state;
    const { onChangeSubmitLoading = (e) => e } = this.props;
    const { checkMode } = params.headerInfo || {};
    const data = params.sslmInvestgBankAccount || [];
    const bankAccountList = data.map((n) => {
      const { investgBankAccountId, bankAccountName } = n;
      return {
        bankAccountId: investgBankAccountId,
        bankAccountName,
      };
    });
    checkBankAccount({
      bankAccountList,
      documentId: investgHeaderId,
      documentSource: 'INVESTIGATE',
    }).then((resp) => {
      const res = getResponse(resp);
      if (res) {
        const { bankDataFlag = true, bankNameFlag = true } = resp || {};
        const checkRepeat = isBoolean(bankDataFlag) && !bankDataFlag;
        // 银行名称不一致需要前端校验的场景
        const checkDifferent =
          isBoolean(bankNameFlag) && !bankNameFlag && checkMode === 'weakCheck';
        if (checkRepeat || checkDifferent) {
          const bankRepeatMsg = checkRepeat
            ? intl
                .get('sslm.common.view.message.bankDuplicateTips')
                .d('存在银行账户重复的数据，请检查数据，确认是否继续提交！')
            : '';
          const bankAccountDifferentMsg = checkDifferent
            ? intl
                .get('sslm.common.view.message.bankAccountDifferentTips')
                .d('银行账户名称与公司名称不一致，请确认是否继续提交！')
            : '';
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            content: (
              <Fragment>
                <div>{bankRepeatMsg}</div>
                <div>{bankAccountDifferentMsg}</div>
              </Fragment>
            ),
            onOk: () => {
              this.submitData({
                params,
                handleToList,
              });
            },
            onCancel: () => {
              onChangeSubmitLoading(false);
            },
          });
        } else {
          this.submitData({
            params,
            handleToList,
          });
        }
      } else {
        onChangeSubmitLoading(false);
      }
    });
  }

  /**
   * 提交数据
   */
  @Bind()
  submitData({ params = {}, handleToList = () => {} }) {
    const { investgHeaderId, organizationId, activeKey, onRefresh } = this.state;
    const { onChangeSubmitLoading = (e) => e, partnerTenantId } = this.props;
    submit(investgHeaderId, organizationId, {
      ...params,
      customizeUnitCode: 'SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
      customizeTenantId: partnerTenantId,
    }).then((response) => {
      if (response && response.failed === true) {
        onChangeSubmitLoading(false);
        return getResponse(response);
      } else {
        onChangeSubmitLoading(false);
        notification.success();
        if (isFunction(onRefresh)) {
          onRefresh();
        }
        if (isFunction(handleToList)) {
          handleToList();
        }
      }
      if (!isUndefined(activeKey)) {
        this.loadData(activeKey);
      }
    });
  }

  /**
   * 获取需要删除的rowKeys
   */
  onRemoves = {
    sslmInvestgProservice: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgProservice', rowKeys, { onOk, onFalse });
    },
    sslmInvestgSupplierCate: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgSupplierCate', rowKeys, { onOk, onFalse });
    },
    sslmInvestgFin: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgFin', rowKeys, { onOk, onFalse });
    },
    sslmInvestgFinBranch: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgFinBranch', rowKeys, { onOk, onFalse });
    },
    sslmInvestgAuth: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgAuth', rowKeys, { onOk, onFalse });
    },
    sslmInvestgContact: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgContact', rowKeys, { onOk, onFalse });
    },
    sslmInvestgAddress: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgAddress', rowKeys, { onOk, onFalse });
    },
    sslmInvestgBankAccount: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgBankAccount', rowKeys, { onOk, onFalse });
    },
    sslmInvestgCustomer: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgCustomer', rowKeys, { onOk, onFalse });
    },
    sslmInvestgSubSupplier: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgSubSupplier', rowKeys, { onOk, onFalse });
    },
    sslmInvestgEquipment: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgEquipment', rowKeys, { onOk, onFalse });
    },
    sslmInvestgAttachment: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgAttachment', rowKeys, { onOk, onFalse });
    },
    sslmInvestgReserve1: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgReserve1', rowKeys, { onOk, onFalse });
    },
    sslmInvestgReserve2: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgReserve2', rowKeys, { onOk, onFalse });
    },
    sslmInvestgReserve5: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgReserve5', rowKeys, { onOk, onFalse });
    },
    sslmInvestgReserve6: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgReserve6', rowKeys, { onOk, onFalse });
    },
    sslmInvestgReserve7: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgReserve7', rowKeys, { onOk, onFalse });
    },
    sslmInvestgReserve8: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgReserve8', rowKeys, { onOk, onFalse });
    },
    sslmInvestgReserve9: (rowKeys, rows, { onOk, onFalse }) => {
      this.deleteData('sslmInvestgReserve9', rowKeys, { onOk, onFalse });
    },
  };

  /**
   * 删除数据
   * @param {String} configName tab的key
   * @param {Object} rowKeys 勾选中的行
   * @param {Function} onOk 删除成功的函数
   */
  @Bind()
  deleteData(configName, rowKeys, { onOk, onFalse }) {
    const { organizationId } = this.state;
    deleteData(configName, rowKeys, organizationId).then((response) => {
      if (isEmpty(response)) {
        notification.success();
        onOk();
      } else {
        if (isFunction(onFalse)) {
          onFalse(); // 接口报错时的回调
        }
        return getResponse(response);
      }
    });
  }

  @Bind()
  showOperating() {
    this.setState({
      operationRecordVisible: true,
    });
  }

  @Bind()
  closeOperating() {
    this.setState({
      operationRecordVisible: false,
    });
  }

  render() {
    const {
      isEdit,
      config,
      dataSource,
      rowKeys,
      tabPosition,
      organizationId,
      loading,
      spinning,
      activeKey,
      operationRecordVisible,
      investgHeaderId,
    } = this.state;

    const {
      remote,
      isShowRecord = true,
      defaultBankInfo,
      processStatus,
      purchaserDisabled = false,
      purchaserTenantNum,
    } = this.props;

    const historyParams = {
      investgHeaderId,
      organizationId,
      operationRecordVisible,
      key: investgHeaderId,
      businessKeyList: [],
      closeOperating: this.closeOperating,
      isShowReviewRecord: false,
    };

    return (
      <Spin spinning={spinning}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            marginTop: '10px',
            marginBottom: '20px',
          }}
        >
          {isShowRecord && (
            <Button icon="clock-circle-o" onClick={this.showOperating}>
              {intl.get(`spfm.disposeInvite.view.message.operationRecord`).d('操作记录')}
            </Button>
          )}
        </div>
        <InvestigationTab
          remote={remote}
          onRefs={this.onRefs}
          curActiveKey={activeKey}
          edit={isEdit && !purchaserDisabled}
          tabPosition={tabPosition}
          organizationId={organizationId}
          // 当前页面的属性
          config={config}
          dataSource={dataSource}
          rowKeys={rowKeys}
          loading={loading}
          onTabChange={this.handleChangeTab}
          onTableChange={this.loadData}
          investgHeaderId={investgHeaderId}
          purchaserTenantNum={purchaserTenantNum}
          onGetValidateDataSourceHooks={this.onGetValidateDataSourceHooks}
          onRemoves={this.onRemoves}
          defaultBankInfo={defaultBankInfo}
          processStatus={processStatus}
          onRefsCurrent={this.onRefsCurrent}
          referenceRangeMessage={this.referenceRangeMessage}
          referenceRangeErrorList={this.referenceRangeErrorList}
        />
        {operationRecordVisible && <OperatingRecord {...historyParams} />}
      </Spin>
    );
  }
}
