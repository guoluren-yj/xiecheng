/**
 * 调查表填写和预览
 * @date: 2018-8-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment } from 'react';
import { Spin, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import {
  isEmpty,
  forEach,
  camelCase,
  map,
  isArray,
  isFunction,
  isUndefined,
  head,
  round,
  isBoolean,
  last,
} from 'lodash';

import { getResponse, createPagination, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import './index.less';
import {
  investigationTemplateHeaderQueryAll,
  fetchDataSource,
  saveData,
  submit,
  deleteData,
  singleSaveData,
  queryTabValidate,
  fetchSupplierCate,
  queryPurchaserAttachment,
} from '@/services/investigationService';
import { checkBankAccountCommon } from '@/services/commonService';
import { getBankAccountTips, BANK_ACCOUNT_CONSTANT } from '@/routes/components/utils';
import InvestigationTab from './index';

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
      isPub: props.isPub || false,
      isQueryData: props.isQueryData || true,
      isEdit: props.isEdit || false,
      isImport: props.isImport || false,
      tabPosition: props.tabPosition || 'left',
      investigateTemplateId: props.investigateTemplateId,
      investgHeaderId: props.investgHeaderId,
      configIgnore: props.configIgnore,
      onRefresh: props.onRefresh, // 刷新的方法
      config: [], // 调查表配置
      dataSource: {}, // 数据源
      pagination: {}, // 分页信息
      activeKey: '', // tab的activeKey
      loadTab: {}, // 保存点击的Tab的key
      tabValidate: {}, // tab的校验状态
      _status: props._status,
      saveType: props.saveType, // 保存类型 NO_CHECK 不校验
      // saving: false,
      // submiting: false,
      organizationId: props.organizationId, // 租户Id
      rowKeys: {
        sslmInvestgProservice: 'investgProserviceId',
        sslmInvestgSupplierCate: 'investgSupplierCateId', // 供应商分类
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
    // 预留表单页签1
    'sslmInvestgReserve3',
    // 预留表单页签2
    'sslmInvestgReserve4',
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
    const {
      investigateTemplateId,
      isEdit,
      isQueryData = true,
      investgHeaderId,
      configIgnore,
    } = nextProps;
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
    if (configIgnore !== prevState.configIgnore) {
      nextState.configIgnore = configIgnore;
    }
    if (!isQueryData) {
      nextState.dataSource = {};
    }
    return nextState;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { investgHeaderId } = this.props;
    return investgHeaderId !== prevState.investgHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    const { configIgnore } = this.state;
    if (snapshot) {
      // 处理重新进入页面时，已激活的tab不查询
      this.fetchConfig(true);
    }
    // 处理调查表要过滤的页签
    if (configIgnore !== rest[1].configIgnore) {
      this.fetchConfig();
    }
  }

  componentDidMount() {
    this.fetchConfig();
    const { onSubmitHook, onSaveValidateDataHook, onSaveDataHook } = this.props;
    if (isFunction(onSubmitHook)) {
      onSubmitHook(this.handleSubmit);
    }
    if (isFunction(onSaveValidateDataHook)) {
      onSaveValidateDataHook(this.handleSave);
    }
    if (isFunction(onSaveDataHook)) {
      onSaveDataHook(this.getSaveData);
    }
  }

  /**
   * 查询config配置(调查表配置)
   * saveFlag 点击保存按钮
   */
  @Bind()
  fetchConfig(activeFlag = false, saveFlag = false) {
    const {
      investigateTemplateId,
      organizationId,
      investgHeaderId,
      activeKey: currentActiveKey,
      pagination,
    } = this.state;
    const { previewFlag = false } = this.props;
    if (investigateTemplateId && (organizationId || organizationId === 0)) {
      this.setState({ spinning: true });
      investigationTemplateHeaderQueryAll({
        investigateTemplateId,
        organizationId,
        investgHeaderId,
      }).then(response => {
        this.setState({
          spinning: false,
        });
        const data = getResponse(response);
        if (!isEmpty(data)) {
          const attachmentFlag = data.investigateConfigHeaders.some(
            n => n.configName === 'sslmInvestgAttachment'
          );
          // 附件页签启用且为预览，将采购方预定义的附件放到附件信息上预览
          if (previewFlag && attachmentFlag) {
            queryPurchaserAttachment({ investigateTemplateId }).then(attachmentResponse => {
              const res = getResponse(attachmentResponse);
              if (res) {
                const attachmentList = res.map(n => ({
                  ...n,
                  purchaserAttachmentUuid: n.purchaseTemplUuid,
                  attachmentDesc: n.description,
                }));
                this.setState(prevState => {
                  const { dataSource, pagination: prevPagination } = prevState;
                  const newDataSource = this.updateDataSource(
                    dataSource,
                    attachmentList,
                    'sslmInvestgAttachment'
                  );
                  const newPagination = this.updatePagination(
                    prevPagination,
                    attachmentList,
                    'sslmInvestgAttachment'
                  );
                  return {
                    dataSource: newDataSource,
                    pagination: newPagination,
                  };
                });
              }
            });
          }
          if (saveFlag) {
            if (!isUndefined(currentActiveKey)) {
              this.setState({ loadTab: { [currentActiveKey]: true }, dataSource: {} }, () => {
                this.loadData(pagination[currentActiveKey], currentActiveKey);
              });
            }
            const config = this.dealConfigData(data);
            this.setState({ config: config.headers, tabValidate: config.tabValidate });
          } else {
            // 旧调查表模版配置，重新按默认排序
            const allConfig = data.investigateConfigHeaders || [];
            // 排序之后的配置
            const finalConfig = [];
            // const
            this.tabKeys.forEach(item => {
              const matchConfig = allConfig.find(i => i.configName === item);
              if (matchConfig) {
                finalConfig.push(matchConfig);
              }
            });
            const activeKey = finalConfig && finalConfig[0] && finalConfig[0].configName;
            const config = this.dealConfigData(data);
            this.setState({ activeKey, config: config.headers, tabValidate: config.tabValidate });
            if (activeKey) {
              this.handleChangeTab(activeKey, activeFlag);
            }
          }
        }
      });
    }
  }

  /**
   * 处理config
   */
  @Bind()
  dealConfigData(config) {
    const { configIgnore = '' } = this.state;
    const configHeaders = {};
    const configLines = {};
    const headers = [];
    const tabValidate = {};
    // 处理头 处理 tab
    forEach(config.investigateConfigHeaders, header => {
      if (header.configName !== configIgnore) {
        configHeaders[header.investgCfHeaderId] = header;
        configHeaders[header.investgCfHeaderId].lines = [];
        tabValidate[header.configName] = header.validated;
        headers.push(header);
      }
    });

    // 处理行 处理字段
    forEach(config.investigateConfigLines, line => {
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
    forEach(config.investigateConfigComponents, componentProp => {
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
        if (configLines[componentProp.investgCfLineId]) {
          configLines[componentProp.investgCfLineId].componentType = 'ValueList';
        }
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
    forEach(config.investigateConfigLineFXs, componentProp => {
      const props =
        configLines[componentProp.investgCfLineId] &&
        configLines[componentProp.investgCfLineId].fxProps;
      if (props) {
        props.push(componentProp);
      }
    });
    return { headers, tabValidate };
  }

  /**
   * 切换Tab时执行/查询数据
   */
  @Bind()
  handleChangeTab(configName, activeFlag = false) {
    const { loadTab, isQueryData } = this.state;
    if ((!loadTab[configName] || activeFlag) && isQueryData) {
      this.loadData({}, configName);
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
    const rangeData = referenceRange.slice(1, -1)?.split(',');
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
        .d(`存在维护的数值不在【${referenceRange}参考区间】内，请审核是否符合要求`)}`;
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
    const { config, _status } = this.state;
    // 获取当前页签配置项
    const currentTabConfig = head(config.filter(n => n.configName === configName)) || {};
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
          if (_status === 'approval') {
            if (isArray(data)) {
              // 表格数据，有一行不满足区间范围就提示
              const fieldCodeData = data.map(n => n[fieldCode]);
              const validateList = fieldCodeData.map(item => {
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
          } else {
            this.getValidateMessage({
              validateFlag: true,
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
  loadData(page = {}, configName) {
    const { investgHeaderId, organizationId } = this.state;
    const { onChangeQueryInvestgLoading = e => e } = this.props;
    if (investgHeaderId && !isEmpty(configName)) {
      this.setState({ loading: true });
      onChangeQueryInvestgLoading(true);
      fetchDataSource({ page, configName, organizationId, investgHeaderId })
        .then(response => {
          const data = getResponse(response);
          if (data) {
            // 产品及服务分页
            const newData = data.content || data;
            // 校验数值参考区间
            this.validateReferenceRange({ data: newData, configName });
            // 更新dataSource
            this.setState(prevState => {
              const { dataSource, pagination } = prevState;
              const newDataSource = this.updateDataSource(dataSource, data, configName);
              const newPagination = this.updatePagination(pagination, data, configName);
              if (configName === 'sslmInvestgFin') {
                const financeData = newDataSource[configName];
                let newFinanceData = financeData;
                // 处理语言环境切换
                if (isArray(newFinanceData)) {
                  newFinanceData = newFinanceData.map(n => {
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
                pagination: newPagination,
              };
            });
          }
        })
        .finally(() => {
          this.setState({ loading: false });
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
  updateDataSource(dataSource, data = [], configName) {
    return {
      ...dataSource,
      [configName]: configName === 'sslmInvestgProservice' ? data.content : data,
    };
  }

  /**
   * 更新pagination
   * @param {Object} pagination 分页
   * @param {Object} data 查询某页的信息
   * @param {String} configName tab的key
   */
  @Bind()
  updatePagination(pagination, data, configName) {
    return {
      ...pagination,
      [configName]: configName === 'sslmInvestgProservice' ? createPagination(data) : false,
    };
  }

  /**
   * 获取和验证表单信息
   */
  onGetValidateDataSourceHooks = {
    sslmInvestgBasic: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgBasic = getBaseValidateDataSource;
    },
    sslmInvestgBusiness: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgBusiness = getBaseValidateDataSource;
    },
    sslmInvestgProservice: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgProservice = getBaseValidateDataSource;
    },
    sslmInvestgSupplierCate: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgSupplierCate = getBaseValidateDataSource;
    }, // 供应商分类
    sslmInvestgFin: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgFin = getBaseValidateDataSource;
    },
    sslmInvestgFinBranch: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgFinBranch = getBaseValidateDataSource;
    },
    sslmInvestgAuth: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgAuth = getBaseValidateDataSource;
    },
    sslmInvestgContact: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgContact = getBaseValidateDataSource;
    },
    sslmInvestgAddress: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgAddress = getBaseValidateDataSource;
    },
    sslmInvestgBankAccount: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgBankAccount = getBaseValidateDataSource;
    },
    sslmInvestgCustomer: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgCustomer = getBaseValidateDataSource;
    },
    sslmInvestgSubSupplier: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgSubSupplier = getBaseValidateDataSource;
    },
    sslmInvestgEquipment: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgEquipment = getBaseValidateDataSource;
    },
    sslmInvestgRd: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgRd = getBaseValidateDataSource;
    },
    sslmInvestgProduce: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgProduce = getBaseValidateDataSource;
    },
    sslmInvestgQa: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgQa = getBaseValidateDataSource;
    },
    sslmInvestgCustservice: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgCustservice = getBaseValidateDataSource;
    },
    sslmInvestgAttachment: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgAttachment = getBaseValidateDataSource;
    },
    sslmInvestgReserve1: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve1 = getBaseValidateDataSource;
    },
    sslmInvestgReserve2: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve2 = getBaseValidateDataSource;
    },
    sslmInvestgReserve5: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve5 = getBaseValidateDataSource;
    },
    sslmInvestgReserve6: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve6 = getBaseValidateDataSource;
    },
    sslmInvestgReserve7: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve7 = getBaseValidateDataSource;
    },
    sslmInvestgReserve8: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve8 = getBaseValidateDataSource;
    },
    sslmInvestgReserve9: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve9 = getBaseValidateDataSource;
    },
    sslmInvestgReserve3: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve3 = getBaseValidateDataSource;
    },
    sslmInvestgReserve4: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve4 = getBaseValidateDataSource;
    },
    sslmInvestgReserve10: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve10 = getBaseValidateDataSource;
    },
    sslmInvestgReserve11: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve11 = getBaseValidateDataSource;
    },
    sslmInvestgReserve12: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve12 = getBaseValidateDataSource;
    },
    sslmInvestgReserve13: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve13 = getBaseValidateDataSource;
    },
    sslmInvestgReserve14: getBaseValidateDataSource => {
      this.getValidateDataSources.sslmInvestgReserve14 = getBaseValidateDataSource;
    },
  };

  getValidateDataSources = {};

  // 获取需保存的数据
  @Bind()
  async getSaveData() {
    try {
      const { organizationId, investgHeaderId, loadTab } = this.state;
      const getAllData = [];
      const getAllDataSeq = [];
      forEach(Object.keys(loadTab), configName => {
        getAllDataSeq.push(configName);
        getAllData.push(this.getValidateDataSources[configName]());
      });
      const params = {}; // 保存的数据
      const data = await Promise.all(getAllData);
      forEach(getAllDataSeq, (configName, index) => {
        if (isArray(data[index])) {
          params[configName] = map(data[index], record => {
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
          params[configName] = { ...data[index], tenantId: organizationId, investgHeaderId };
        }
      });
      return params;
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
      forEach(Object.keys(loadTab), configName => {
        getAllDataSeq.push(configName);
        getAllData.push(this.getValidateDataSources[configName](saveType));
      });
      const params = {}; // 保存的数据
      const data = await Promise.all(getAllData);
      forEach(getAllDataSeq, (configName, index) => {
        if (isArray(data[index])) {
          params[configName] = map(data[index], record => {
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
          params[configName] = { ...data[index], tenantId: organizationId, investgHeaderId };
        }
      });
      if (!isEmpty(headerInfo)) {
        params.headerInfo = headerInfo;
      }
      const res = await this.saveData(params);
      return res;
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
  async saveData(payload) {
    const { investgHeaderId, organizationId, onRefresh } = this.state;
    const { onChangeSaveLoading = e => e } = this.props;
    onChangeSaveLoading(true);
    let response = await saveData(
      {
        ...payload,
        customizeUnitCode: 'SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
        customizeTenantId: organizationId,
      },
      investgHeaderId,
      organizationId
    );
    if (getResponse(response)) {
      response = true;
      // 重新查询调查表模板用于更新页签完成标识
      this.fetchConfig(true, true);
      onChangeSaveLoading(false);
      notification.success();
      if (isFunction(onRefresh)) {
        onRefresh();
      }
    } else {
      onChangeSaveLoading(false);
      response = false;
    }
    return response;
  }

  /**
   * 提交调查表
   * @param {Function} handleToList 提交成功后的回调函数(跳转页面)
   * @param {Object} headerInfo 调查表头
   */
  @Bind()
  async handleSubmit(handleToList, headerInfo = {}) {
    const { investgHeaderId, organizationId, loadTab } = this.state;
    const { onChangeSubmitLoading = e => e } = this.props;
    try {
      const getAllData = [];
      const getAllDataSeq = [];
      forEach(Object.keys(loadTab), configName => {
        getAllDataSeq.push(configName);
        getAllData.push(this.getValidateDataSources[configName]());
      });
      const params = {};
      const data = await Promise.all(getAllData);
      forEach(getAllDataSeq, (configName, index) => {
        if (isArray(data[index])) {
          params[configName] = map(data[index], record => {
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
          params[configName] = { ...data[index], tenantId: organizationId, investgHeaderId };
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
    const { onChangeSubmitLoading = e => e } = this.props;
    const { checkMode } = params.headerInfo || {};
    const data = params.sslmInvestgBankAccount || [];
    const bankAccountList = data.map(n => {
      const { investgBankAccountId, bankAccountName, bankAccountNum, enabledFlag } = n;
      return {
        bankAccountId: investgBankAccountId,
        bankAccountName,
        bankAccountNum,
        enabledFlag,
      };
    });
    checkBankAccountCommon({
      bankAccountList,
      documentId: investgHeaderId,
      documentSource: 'INVESTIGATE',
    }).then(resp => {
      if (getResponse(resp)) {
        const { bankDataFlag = true, bankNameFlag = true } = resp || {};
        const checkRepeat = isBoolean(bankDataFlag) && !bankDataFlag;
        // 银行名称不一致需要前端校验的场景
        const checkDifferent =
          isBoolean(bankNameFlag) && !bankNameFlag && checkMode === 'weakCheck';
        const bankRepeatMsg = checkRepeat
          ? getBankAccountTips(BANK_ACCOUNT_CONSTANT.DUPLICATE)
          : '';
        const bankAccountDifferentMsg = checkDifferent ? getBankAccountTips() : '';
        if (checkRepeat || checkDifferent) {
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
    const { investgHeaderId, organizationId, activeKey, onRefresh, pagination } = this.state;
    const { onChangeSubmitLoading = e => e } = this.props;
    submit(investgHeaderId, organizationId, {
      ...params,
      customizeUnitCode: 'SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
      customizeTenantId: organizationId,
    }).then(response => {
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
        this.loadData(pagination[activeKey], activeKey);
      }
    });
  }

  /**
   * 获取需要删除的rowKeys
   */
  onRemoves = {
    sslmInvestgProservice: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgProservice', rowKeys, { onOk });
    },
    sslmInvestgSupplierCate: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgSupplierCate', rowKeys, { onOk });
    }, // 供应商分类
    sslmInvestgFin: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgFin', rowKeys, { onOk });
    },
    sslmInvestgFinBranch: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgFinBranch', rowKeys, { onOk });
    },
    sslmInvestgAuth: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgAuth', rowKeys, { onOk });
    },
    sslmInvestgContact: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgContact', rowKeys, { onOk });
    },
    sslmInvestgAddress: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgAddress', rowKeys, { onOk });
    },
    sslmInvestgBankAccount: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgBankAccount', rowKeys, { onOk });
    },
    sslmInvestgCustomer: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgCustomer', rowKeys, { onOk });
    },
    sslmInvestgSubSupplier: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgSubSupplier', rowKeys, { onOk });
    },
    sslmInvestgEquipment: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgEquipment', rowKeys, { onOk });
    },
    sslmInvestgAttachment: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgAttachment', rowKeys, { onOk });
    },
    sslmInvestgReserve1: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgReserve1', rowKeys, { onOk });
    },
    sslmInvestgReserve2: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgReserve2', rowKeys, { onOk });
    },
    sslmInvestgReserve5: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgReserve5', rowKeys, { onOk });
    },
    sslmInvestgReserve6: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgReserve6', rowKeys, { onOk });
    },
    sslmInvestgReserve7: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgReserve7', rowKeys, { onOk });
    },
    sslmInvestgReserve8: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgReserve8', rowKeys, { onOk });
    },
    sslmInvestgReserve9: (rowKeys, rows, { onOk }) => {
      this.deleteData('sslmInvestgReserve9', rowKeys, { onOk });
    },
  };

  /**
   * 删除数据
   * @param {String} configName tab的key
   * @param {Object} rowKeys 勾选中的行
   * @param {Function} onOk 删除成功的函数
   */
  @Bind()
  deleteData(configName, rowKeys, { onOk }) {
    const { organizationId, activeKey, pagination } = this.state;
    deleteData(configName, rowKeys, organizationId).then(response => {
      if (isEmpty(response)) {
        notification.success();
        onOk();
        this.handleTabValidate(configName);
        this.loadData(pagination[activeKey], configName);
      } else {
        this.handleTabValidate(configName);
        this.loadData(pagination[activeKey], configName);
        onOk();
        return getResponse(response);
      }
    });
  }

  // 获取需保存的数据
  onSaves = {
    sslmInvestgProservice: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgProservice', rows, { onOk });
    },
    sslmInvestgSupplierCate: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgSupplierCate', rows, { onOk });
    },
    sslmInvestgFin: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgFin', rows, { onOk });
    },
    sslmInvestgFinBranch: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgFinBranch', rows, { onOk });
    },
    sslmInvestgAuth: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgAuth', rows, { onOk });
    },
    sslmInvestgContact: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgContact', rows, { onOk });
    },
    sslmInvestgAddress: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgAddress', rows, { onOk });
    },
    sslmInvestgBankAccount: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgBankAccount', rows, { onOk });
    },
    sslmInvestgCustomer: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgCustomer', rows, { onOk });
    },
    sslmInvestgSubSupplier: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgSubSupplier', rows, { onOk });
    },
    sslmInvestgEquipment: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgEquipment', rows, { onOk });
    },
    sslmInvestgAttachment: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgAttachment', rows, { onOk });
    },
    sslmInvestgReserve1: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgReserve1', rows, { onOk });
    },
    sslmInvestgReserve2: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgReserve2', rows, { onOk });
    },
    sslmInvestgReserve5: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgReserve5', rows, { onOk });
    },
    sslmInvestgReserve6: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgReserve6', rows, { onOk });
    },
    sslmInvestgReserve7: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgReserve7', rows, { onOk });
    },
    sslmInvestgReserve8: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgReserve8', rows, { onOk });
    },
    sslmInvestgReserve9: (rows, { onOk }) => {
      this.handleSingleSave('sslmInvestgReserve9', rows, { onOk });
    },
  };

  @Bind()
  getTabSave() {
    const { previewFlag = false } = this.props;
    // 预览页面不允许保存
    if (previewFlag) {
      return {};
    }
    return this.onSaves;
  }

  @Bind()
  getTabRemoves() {
    const { previewFlag = false } = this.props;
    // 预览页面不允许删除
    if (previewFlag) {
      return {};
    }
    return this.onRemoves;
  }

  /**
   * 单页签保存数据
   * @param {String} configName tab的key
   * @param {Object} rows 需保存的行数据
   * @param {Function} onOk 保存成功的回调
   */
  @Bind()
  handleSingleSave(configName, rows, { onOk }) {
    const { activeKey, pagination } = this.state;
    let saveRows = rows;
    if (configName === 'sslmInvestgAddress') {
      saveRows = rows.map(data => {
        const { regionIdList = [], ...others } = data;
        return {
          ...others,
          regionId: last(regionIdList),
        };
      });
    } else if (configName === 'sslmInvestgFin') {
      saveRows = rows.map(data => {
        const newData = this.handleFinanceData(data);
        return newData;
      });
    }
    singleSaveData(configName, saveRows)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          this.handleTabValidate(configName);
          this.loadData(pagination[activeKey], configName);
        }
        return res;
      })
      .finally(() => {
        onOk();
      });
  }

  // 查询tab的校验状态
  @Bind()
  handleTabValidate(configName) {
    const { investgHeaderId, investigateTemplateId, organizationId } = this.state;
    this.setState({ spinning: true });
    queryTabValidate({
      configName,
      investgHeaderId,
      investigateTemplateId,
      tenantId: organizationId,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          this.setState(prevState => {
            const { tabValidate } = prevState;
            return {
              tabValidate: {
                ...tabValidate,
                [configName]: res.validated,
              },
            };
          });
        }
      })
      .finally(() => {
        this.setState({ spinning: false });
      });
  }

  /**
   * 查询供应商分类
   */
  @Bind()
  fetchSupplierCate(page = {}, filterValues = {}) {
    this.setState({ loading: true });
    const { organizationId, config } = this.state;
    const tenantId = head(config.map(n => n.tenantId));
    fetchSupplierCate({
      organizationId,
      page,
      tenantId,
      ...filterValues,
      enabledFlag: 1,
    }).then(response => {
      const data = getResponse(response);
      if (data) {
        this.setState({
          supplierCateProps: {
            dataSource: data.content,
            pagination: createPagination(data),
          },
          loading: false,
        });
      }
    });
  }

  render() {
    const {
      isPub,
      isEdit,
      isImport,
      config,
      dataSource,
      pagination,
      rowKeys,
      tabPosition,
      organizationId,
      loading,
      spinning,
      _status,
      tabValidate,
      supplierCateProps,
      investgHeaderId,
      investigateTemplateId,
    } = this.state;
    const {
      defaultBankInfo,
      allowDeleteAllLineFlag = true,
      investgRemote,
      editProcessCode,
      remoteParams,
    } = this.props;
    return (
      <Spin spinning={spinning}>
        <InvestigationTab
          edit={isEdit}
          isPub={isPub}
          investgRemote={investgRemote}
          isImport={isImport}
          editProcessCode={editProcessCode}
          tabPosition={tabPosition}
          organizationId={organizationId}
          // 当前页面的属性
          config={config}
          dataSource={dataSource}
          pagination={pagination}
          rowKeys={rowKeys}
          loading={loading}
          tabValidate={tabValidate}
          onTabChange={this.handleChangeTab}
          onTableChange={this.loadData}
          onGetValidateDataSourceHooks={this.onGetValidateDataSourceHooks}
          onRemoves={this.getTabRemoves()}
          onSaves={this.getTabSave()}
          _status={_status}
          supplierCateProps={supplierCateProps}
          fetchSupplierCate={this.fetchSupplierCate}
          investgHeaderId={investgHeaderId}
          investigateTemplateId={investigateTemplateId}
          defaultBankInfo={defaultBankInfo}
          referenceRangeMessage={this.referenceRangeMessage}
          referenceRangeErrorList={this.referenceRangeErrorList}
          allowDeleteAllLineFlag={allowDeleteAllLineFlag}
          remoteParams={remoteParams}
        />
      </Spin>
    );
  }
}
