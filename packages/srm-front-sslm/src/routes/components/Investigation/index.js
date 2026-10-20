/*
 * Index - 调查表
 * @Date: 2022-06-16 09:57:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useEffect, useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import { forEach, camelCase, head, isEmpty, isArray, isFunction, cloneDeep } from 'lodash';
import { DataSet, Tabs, Spin } from 'choerodon-ui/pro';
import classnames from 'classnames';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import { renderTabPaneTitle } from '@/routes/components/utils';
import { investigationTemplateSiteHeaderQueryAll } from '@/services/investigationDefinitionOrgService';
import {
  queryTabValidate,
  queryFilterInvestigationTemplate,
  queryPurchaserAttachment,
} from '@/services/investigationService';

import styles from './index.less';
import ComposeFrom from './Compose/ComposeForm';
import ComposeTable from './Compose/ComposeTable';
import {
  dealConfigData,
  questionnaireForm,
  useSetState,
  handleFinanceData,
  getButtonPermissionList,
} from './utils';
import WrapperComponent from './components/WrapperComponent';
import { getInvestigationDS } from './stores/getInvestigationDS';

const { TabPane } = Tabs;

const currentOrganizationId = getCurrentOrganizationId();

const TabBarExtra = ({ remoteHiddenTips }) => {
  return (
    <div className={styles['investigation-tabs-extra']}>
      <div className={styles['investigation-tabs-extra-title']}>
        {intl.get('sslm.common.view.message.investigInfo').d('调查表信息')}
      </div>
      {!remoteHiddenTips && (
        <div className={styles['investigation-tabs-extra-help']}>
          {intl.get('sslm.common.view.message.investigInfoMsg').d('可以快速切换调查表选项')}
        </div>
      )}
    </div>
  );
};

const Index = (curProps, ref) => {
  const {
    source = '', // 来源页面
    configNames = [], // 变更过的页签集合
    investgHeaderId = null,
    investigateTemplateId,
    organizationId = currentOrganizationId,
    editable = true, // 页面编辑标识和展示完成未完成标识
    defaultCountry,
    _status = '', // 显示页签提示信息
    tableStyle = { maxHeight: '400px' }, // 表格样式
    type = 'org',
    previewFlag = false, // 仅预览标识
    showTabBar = true, // 展示TabBar
    showTag = editable, // 展示完成、未完成标识
    userInfo = {},
    investigateSource = '',
    isModalFlag = false, // 是否弹窗展示调查表
    defaultBankCompanyName, // 银行默认带出公司名称
    buttonPermissions = {},
    addPermissionCode = {}, // 表格新建按钮权限集
    deletePermissionCode = {}, // 表格删除按钮权限集
    setParentActiveKey, // 处理父级tab的activeKey
    allowDeleteAllLineFlag = true, // 允许删除所有表格行
    fullQueryFlag = false, // 是否查询所有页签数据
    setLoading = () => {}, // 父页面的loading
    // aiApproveFlag = false, // 是否展示AI审批
    filertDuplicateTabFlag = 0, // 调查表不展示重合页签标识 0 展示重合 1 不展示
    investgRemote, // 埋点
    otherRemoteProps = {}, // 其他埋点参数 格式 {type: '' // 来源页面标识, otherProps: {}};
    remoteHiddenTips = false,
  } = curProps;
  const [state, setState] = useSetState({
    configList: [],
    dataSetList: {},
    activeKey: '',
    loadTab: {},
    spinning: false,
    tabValidate: {}, // 页签的校验状态
    tabDescription: {}, // 页签名称
    allTabReactionFields: {},
    templateConfig: {}, // 模版配置
  });
  const [permissionState, setPermissionState] = useSetState({
    addPermissionObj: {},
    deletePermissionObj: {},
  });
  const [referenceRangeMessage, setReferenceRangeMessage] = useState({});
  const {
    configList,
    dataSetList,
    activeKey,
    loadTab,
    spinning,
    tabValidate,
    tabDescription,
    allTabReactionFields,
    templateConfig,
  } = state;
  const { addPermissionObj, deletePermissionObj } = permissionState;

  useEffect(() => {
    queryConfig();
    getTableBtnPermission();
    if (investgRemote && investgRemote.event) {
      investgRemote.event.fireEvent('cuxInit', {
        ...curProps,
      });
    }
  }, [investgHeaderId]);

  useImperativeHandle(ref, () => {
    return {
      handleQuery,
      handleIsChange,
      handleSaveParams,
      getExposeData,
      handleSaveParamsWithoutValidate,
    };
  });

  // 暴露给父组件获取内部参数
  const getExposeData = useCallback(() => {
    return {
      templateConfig,
    };
  }, [investgHeaderId, investigateTemplateId]);

  // 查询tab的校验状态
  const handleTabValidate = useCallback(
    (configName) => {
      setState({ spinning: true });
      queryTabValidate({
        configName,
        investgHeaderId,
        investigateTemplateId,
        tenantId: organizationId,
      })
        .then((response) => {
          const res = getResponse(response);
          if (res) {
            setState({
              tabValidate: { ...tabValidate, [configName]: res.validated },
            });
          }
        })
        .finally(() => {
          setState({ spinning: false });
        });
    },
    [organizationId, investgHeaderId, investigateTemplateId, tabValidate]
  );

  // 查询调查表配置
  const queryConfig = useCallback(() => {
    setState({ spinning: true });
    setLoading(true);
    // 区分平台级，租户级模板预览配置
    const queryPromise =
      type === 'org'
        ? queryFilterInvestigationTemplate({
            investigateTemplateId,
            organizationId,
            investgHeaderId,
            delTmplFlag: filertDuplicateTabFlag,
          })
        : investigationTemplateSiteHeaderQueryAll(investigateTemplateId);
    queryPromise
      .then((response) => {
        const config = getResponse(response);
        if (config) {
          handleConfigData(config);
          setState({ templateConfig: config });
        }
      })
      .finally(() => {
        setState({ spinning: false });
        setLoading(false);
      });
  }, [investgHeaderId, investigateTemplateId]);

  // 处理调查表配置
  const handleConfigData = (config) => {
    const {
      configList: newConfigList = [],
      tabValidate: validates = {},
      tabDescription: newTabDescription = {},
    } = dealConfigData(config) || {};
    // 处理配置默认值公式
    const tabsReactionFields = handleFormulaDefaultValue(newConfigList);
    const firstConfig = head(newConfigList) || {};
    const firstConfigName = firstConfig.configName;
    // 初次查询是查询所有页签还是第一个页签
    const firstQuery = fullQueryFlag ? newConfigList : firstConfig;
    handleDataSet(firstQuery, config);
    setState({
      configList: newConfigList,
      activeKey: firstConfigName,
      tabValidate: validates,
      loadTab: { [firstConfigName]: true },
      allTabReactionFields: tabsReactionFields,
      tabDescription: newTabDescription,
    });
  };

  const handleDataSet = (config, temptConfig) => {
    const dsList = {};
    if (isArray(config)) {
      forEach(config, (item) => {
        const { configName } = item;
        const { dataSet } = dealDataSet(item, temptConfig, dsList) || {};
        dsList[configName] = dataSet;
      });
      setState({
        dataSetList: dsList,
      });
    } else {
      const { configName } = config;
      const { dataSet } = dealDataSet(config, temptConfig, dataSetList) || {};
      dsList[configName] = dataSet;
      setState({
        dataSetList: { ...dataSetList, ...dsList },
      });
    }
  };

  // 根据配置生成DataSet
  const dealDataSet = (config, temptConfig, dsList) => {
    const { configName } = config;
    if (configName) {
      // 获取调查表模版头信息
      const { investigateTemplate } = temptConfig || {};
      const dsProps = getInvestigationDS({ config, previewFlag, allowDeleteAllLineFlag });
      // 埋点其他入参
      const remoteParams = {
        ...otherRemoteProps,
        dsList,
        temptConfig: {
          ...config,
          temptHeaderConfig: investigateTemplate,
        },
      };
      // 埋点修改后的ds属性
      const finalDsProps = investgRemote
        ? investgRemote.process('SSLM_INVESTIGATION_DATASET_PROPS_PROCESS', dsProps, remoteParams)
        : dsProps;
      const dataSet = new DataSet(finalDsProps);
      // 模板预览页面不查询页签数据
      if (!previewFlag) {
        setLoading(true);
        dataSet.setQueryParameter('queryParam', {
          investgHeaderId,
          tenantId: organizationId,
        });
        dataSet
          .query()
          .then((res) => {
            const result = getResponse(res);
            if (result && !isEmpty(result)) {
              validateReferenceRange({ data: result, config });
            }
            if (result) {
              // src-9159 认证调查表-联系人没有行时自动新建一行
              const contactCreateFlag = configName === 'sslmInvestgContact' && isEmpty(result);
              if (contactCreateFlag) {
                if (investigateSource === 'certification') {
                  const { realName, phone, email, internationalTelCode } = userInfo;
                  dataSet.create({
                    name: realName,
                    mail: email,
                    mobilephone: phone,
                    defaultContactFlag: 1,
                    enabled: 1,
                    internationalTelCode,
                  });
                }
              }
              // H-SAAS-2445 认证、录入调查表-地址没有行时自动新建一行
              const addressCreateFlag = configName === 'sslmInvestgAddress' && isEmpty(result);
              if (addressCreateFlag) {
                if (['certification', 'supplierEntry'].includes(investigateSource)) {
                  const { otherProps: { companyBaseInfo = {}, companyBasic = {} } = {} } =
                    otherRemoteProps || {};
                  const addressSourceData = companyBaseInfo || companyBasic;
                  const {
                    registeredCountryCode,
                    registeredCountryId,
                    registeredCountryName,
                    regionPathName,
                    registeredRegionId,
                    addressDetail,
                    _tls: { addressDetail: addressDetailTls = {} } = {},
                  } = addressSourceData || {};
                  dataSet.create({
                    countryIdLov: {
                      countryId: registeredCountryId,
                      countryCode: registeredCountryCode,
                      countryName: registeredCountryName,
                    },
                    regionId: registeredRegionId,
                    regionPathName,
                    address: addressDetail,
                    _tls: {
                      address: addressDetailTls,
                    },
                  });
                }
              }
              if (investgRemote && investgRemote.event) {
                investgRemote.event.fireEvent('cuxInvestgTabInit', {
                  config,
                  dataSet,
                  editable,
                  data: result,
                  otherRemoteProps,
                  temptConfig,
                });
              }
            }
          })
          .finally(() => setLoading(false));
      }
      // 附件页签启用且为预览，将采购方预定义的附件放到附件信息上预览
      else if (previewFlag && configName === 'sslmInvestgAttachment') {
        setState({ spinning: true });
        setLoading(true);
        queryPurchaserAttachment({ investigateTemplateId })
          .then((response) => {
            const res = getResponse(response);
            if (res) {
              const attachmentList = res.map((n) => ({
                ...n,
                purchaserAttachmentUuid: n.purchaseTemplUuid,
                attachmentDesc: n.description,
                previewFlag: true,
              }));
              dataSet.loadData(attachmentList);
            }
          })
          .finally(() => {
            setState({ spinning: false });
            setLoading(false);
          });
      }
      return { dataSet };
    }
  };

  // tab发生改变时的回调
  const handleFormulaDefaultValue = useCallback((allConfig) => {
    const tabsReactionFields = {};
    // 遍历页签
    allConfig.forEach((tabConfig) => {
      const { configName, lines = [] } = tabConfig;
      // 单页签字段关系{fieldName: ['a','b']}
      const reactionFields = {};
      // 遍历字段
      lines.forEach((fieldConfig) => {
        const { defaultValueType, express, fieldCode } = fieldConfig;
        if (defaultValueType === 'EXPRESSION') {
          // 处理公式配置
          if (express) {
            const {
              expressionLinesObj,
              expressionConfig: { customizeConditionCombination },
            } = JSON.parse(express);
            let defaultValueStr = customizeConditionCombination;
            const reactionFieldList = [];
            defaultValueStr = defaultValueStr.replace(/\b\w+\b/g, (item) => {
              const caseFieldName = expressionLinesObj[item]
                ? camelCase(expressionLinesObj[item].fieldName)
                : `#${item}`;
              reactionFieldList.push(caseFieldName);
              return caseFieldName;
            });
            const reactionConfig = {
              reactionFieldList,
              defaultValueStr,
            };
            reactionFields[fieldCode] = reactionConfig;
          }
        }
      });
      tabsReactionFields[configName] = reactionFields;
    });
    return tabsReactionFields;
  }, []);

  // tab发生改变时的回调
  const handleTabChange = (key) => {
    if (!loadTab[key] && !fullQueryFlag) {
      const currentConfig = head(configList.filter((n) => n.configName === key));
      handleDataSet(currentConfig, templateConfig);
    }
    setState({ loadTab: { ...loadTab, [key]: true }, activeKey: key });
  };

  // 重新查询
  const handleQuery = useCallback(() => {
    return new Promise((resolve, reject) => {
      setState({ spinning: true });
      // 查询配置,更新页签完成标识
      queryFilterInvestigationTemplate({
        investigateTemplateId,
        organizationId,
        investgHeaderId,
        delTmplFlag: filertDuplicateTabFlag,
      })
        .then((response) => {
          const config = getResponse(response);
          if (config) {
            const { investigateConfigHeaders = [] } = config;
            const newTabValidate = {};
            forEach(investigateConfigHeaders, (header) => {
              const { configName, validated } = header;
              newTabValidate[configName] = validated;
            });
            const queryPromiseList = [];
            forEach(dataSetList, (dataSet) => {
              dataSet.setQueryParameter('queryParam', {
                investgHeaderId,
                tenantId: organizationId,
              });
              queryPromiseList.push(dataSet.query());
            });
            setState({
              tabValidate: newTabValidate,
            });
            Promise.all(queryPromiseList).finally(() => {
              resolve();
            });
          } else {
            resolve();
          }
        })
        .catch(() => reject())
        .finally(() => setState({ spinning: false }));
    });
  }, [dataSetList, investgHeaderId, investigateTemplateId, organizationId]);

  // 判断页签数据是否发生改变
  const handleIsChange = () => {
    const allDsList = []; // 根据返回的配置排序后的ds
    forEach(configList, (config) => {
      const dataSet = dataSetList[config.configName];
      if (dataSet) {
        allDsList.push(dataSet);
      }
    });
    const isChange = allDsList.some((ds) => ds.dirty);
    return isChange;
  };

  // dataSet校验
  const validateDataSet = useCallback(
    (dataSet, configName) => {
      if (dataSet) {
        return new Promise(async (resolve, reject) => {
          const validateFlag = await dataSet.validate();
          const errorList = head(dataSet.getValidationErrors())?.errors;
          const errorRecordData = head(dataSet.getValidationErrors())?.record?.toData() || {};
          const errorMsg = [];
          if (!isEmpty(errorList) && !validateFlag) {
            (errorList || []).forEach((curent) => {
              const { validationMessage, validationProps = {} } = head(curent?.errors) || {};
              if (validationMessage) {
                let message = validationMessage;
                // 埋点 修改校验提示内容
                if (investgRemote) {
                  message = investgRemote.process(
                    'SSLM_INVESTIGATION_VALIDATE_MSG_PROCESS',
                    validationMessage,
                    {
                      validationProps,
                      errorRecordData,
                    }
                  );
                }
                errorMsg.push(<div>{message}</div>);
              }
            });
            reject({ errorMsg, configName, configDescription: tabDescription[configName] }); // eslint-disable-line
          } else {
            const isForm = questionnaireForm[configName];
            // 表单传全量数据，用于后端校验
            const curDataSetData = isForm ? dataSet.toData() : dataSet.toJSONData();
            const data = curDataSetData.map((n) => {
              return { ...n, investgHeaderId, tenantId: organizationId };
            });
            resolve({ [configName]: isForm ? head(data) : data });
          }
        });
      }
    },
    [tabDescription, investgHeaderId]
  );

  // 获取需校验的ds
  const getValidateDataSet = useCallback(() => {
    const sortDsList = []; // 根据返回的配置排序后的ds
    forEach(configList, (config) => {
      const dataSet = dataSetList[config.configName];
      if (dataSet) {
        if (config.configName === activeKey) {
          sortDsList.unshift({ [config.configName]: dataSet });
        } else {
          sortDsList.push({ [config.configName]: dataSet });
        }
      }
    });
    return sortDsList;
  }, [dataSetList, activeKey]);

  // 获取需保存的数据（不带校验）
  const handleSaveParamsWithoutValidate = () => {
    const saveParams = {};
    for (const configName in dataSetList) {
      if (Object.prototype.hasOwnProperty.call(dataSetList, configName)) {
        const dataSet = dataSetList[configName];
        const isForm = questionnaireForm[configName];
        const dataSetData = dataSet?.toJSONData() || [];
        const data = dataSetData.map((n) => {
          return { ...n, investgHeaderId, tenantId: organizationId };
        });
        if (configName === 'sslmInvestgFin') {
          if (isArray(data) && !isEmpty(data)) {
            saveParams[configName] = data.map((item) => {
              return handleFinanceData(item);
            });
          }
        } else {
          saveParams[configName] = isForm ? head(data) : data;
        }
      }
    }
    return saveParams;
  };

  // 获取需保存的数据（带校验）
  const handleSaveParams = useCallback(async () => {
    const validateResult = [];
    const needValidateDs = getValidateDataSet();
    if (isEmpty(needValidateDs)) {
      // src-49401 行配置为空直接返回空对象
      return {};
    }
    forEach(needValidateDs, (validateDs) => {
      for (const dsKey in validateDs) {
        if (Object.hasOwnProperty.call(validateDs, dsKey)) {
          const dataSet = validateDs[dsKey];
          const errorMsg = validateDataSet(dataSet, dsKey);
          validateResult.push(errorMsg);
        }
      }
    });
    const dataList = await Promise.allSettled(validateResult);
    let saveData = null;
    const dataObj = {};
    forEach(dataList, (data) => {
      const { status, value, reason } = data;
      if (status === 'rejected') {
        saveData = null;
        const { errorMsg, configName, configDescription } = reason;
        notification.warning({
          message: intl
            .get('sslm.common.view.warn.infoNotFilled', {
              name: configDescription,
            })
            .d(`【${configDescription}】页签信息未填写`),
          description: errorMsg,
        });
        setState({ activeKey: configName });
        if (isFunction(setParentActiveKey)) {
          setParentActiveKey();
        }
        return false;
      } else {
        for (const key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            const tabData = value[key];
            if (key === 'sslmInvestgFin') {
              if (isArray(tabData) && !isEmpty(tabData)) {
                dataObj[key] = tabData.map((item) => {
                  return handleFinanceData(item);
                });
              }
            } else {
              dataObj[key] = tabData;
            }
          }
        }
        saveData = dataObj;
      }
    });
    return saveData;
  }, [dataSetList, getValidateDataSet]);

  // 提取【数值】类型字段在模板中设定的【参考区间】
  const validateReferenceRange = useCallback(({ data, config }) => {
    const { lines = [], configName } = config;
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
    const newReferenceRangeMessage = {};
    newReferenceRangeMessage[configName] = [];
    // 属性维度的遍历
    for (const attribute in currentAttribute) {
      if (Object.hasOwnProperty.call(currentAttribute, attribute)) {
        const attributeElement = currentAttribute[attribute];
        const { referenceRange, validateRules, fieldDescription, fieldCode } = attributeElement;
        if (validateRules && referenceRange) {
          let validateFlag = true;
          if (_status === 'approval') {
            if (isArray(data)) {
              // 表格数据，有一行不满足区间范围就提示
              const fieldCodeData = data.map((n) => n[fieldCode]);
              const validateList = fieldCodeData.map((item) => {
                const itemValidateFlag = validateRange({
                  referenceRange,
                  dataSourceRange: item,
                });
                return itemValidateFlag;
              });
              const finallyValidateFlag = !validateList.includes(false);
              validateFlag = finallyValidateFlag;
            } else if (data) {
              const newValidateFlag = validateRange({
                referenceRange,
                dataSourceRange: data[fieldCode],
              });
              validateFlag = newValidateFlag;
            }
          }
          getValidateMessage({
            validateFlag,
            fieldCode,
            fieldDescription,
            referenceRange,
            configName,
            newReferenceRangeMessage,
          });
        }
      }
    }
    setReferenceRangeMessage((prevState) => ({
      ...prevState,
      ...newReferenceRangeMessage,
    }));
  }, []);

  /**
   * 校验后端返回的数据是否在指定区间内
   * @param {*} referenceRange 模板配置的区间值
   * @param {*} dataSourceRange 后端数据返回的区间值
   */
  const validateRange = useCallback(({ referenceRange, dataSourceRange }) => {
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
  }, []);

  /**
   * 获取校验信息
   * @param {Boolean} validateFlag 是否在参考区间内
   * @param {String} fieldDescription 字段名称
   * @param {String} referenceRange 参考区间
   * @param {String} configName 当前页签名称
   */
  const getValidateMessage = useCallback(
    ({ validateFlag, fieldDescription, referenceRange, configName, newReferenceRangeMessage }) => {
      if (!validateFlag) {
        const message = `【${fieldDescription}】${intl
          .get(`sslm.common.model.validate.referenceRange`, {
            name: referenceRange,
          })
          .d(`存在维护的数值不在【${referenceRange}参考区间】内，请审核是否符合要求`)}`;
        if (!newReferenceRangeMessage[configName].includes(message)) {
          newReferenceRangeMessage[configName].push(message);
        }
      } else {
        const message = `【${fieldDescription}】${intl
          .get(`sslm.common.model.validate.inRange`, {
            name: referenceRange,
          })
          .d(`的数值参考区间为【${referenceRange}】`)}`;
        if (!newReferenceRangeMessage[configName].includes(message)) {
          newReferenceRangeMessage[configName].push(message);
        }
      }
    },
    []
  );

  // 获取表格按钮权限集
  const getTableBtnPermission = useCallback(() => {
    const addObj = getButtonPermissionList(addPermissionCode, 'add');
    const deleteObj = getButtonPermissionList(deletePermissionCode, 'delete');
    setPermissionState({
      addPermissionObj: addObj,
      deletePermissionObj: deleteObj,
    });
  }, []);

  const getTabPaneContent = (config) => {
    const { configName, lines, remark } = config;
    let referenceRangeMessageObj = referenceRangeMessage;
    // 埋点修改remark展示逻辑
    const newRemark = investgRemote
      ? investgRemote.process('SSLM_INVESTIGATION_TABPANE_REMARK', remark, {
          config,
          dataSetList,
          otherRemoteProps,
        })
      : remark;
    // 埋点 修改提示内容
    if (investgRemote) {
      const newMessage = cloneDeep(referenceRangeMessage);
      const message = investgRemote.process(
        'SSLM_INVESTIGATION_TIPS_PROCESS',
        newMessage,
        otherRemoteProps
      );
      referenceRangeMessageObj = message;
    }
    // 埋点修改可编辑逻辑(表格)
    const newEditable = investgRemote
      ? investgRemote.process('SSLM_INVESTIGATION_EDITABLE', editable, {
          config,
          source,
          ...otherRemoteProps,
        })
      : editable;
    // 埋点修改可编辑逻辑(表单)
    const formEditable = investgRemote
      ? investgRemote.process('SSLM_INVESTIGATION_FORM_EDITABLE', editable, {
          config,
          source,
          ...otherRemoteProps,
        })
      : editable;
    switch (configName) {
      case 'sslmInvestgBasic': // 基本信息
      case 'sslmInvestgBusiness': // 业务信息
      case 'sslmInvestgRd': // 研发能力
      case 'sslmInvestgProduce': // 生产能力
      case 'sslmInvestgQa': // 质保能力
      case 'sslmInvestgCustservice': // 售后服务
      case 'sslmInvestgReserve3': // 预留表单1
      case 'sslmInvestgReserve4': // 预留表单2
      case 'sslmInvestgReserve10': // 预留表单3
      case 'sslmInvestgReserve11': // 预留表单4
      case 'sslmInvestgReserve12': // 预留表单5
      case 'sslmInvestgReserve13': // 预留表单6
      case 'sslmInvestgReserve14': // 预留表单7
        return (
          <WrapperComponent>
            <ComposeFrom
              reactionFields={allTabReactionFields[configName]}
              columns={lines}
              remark={newRemark}
              editable={formEditable}
              configName={configName}
              dataSet={dataSetList[configName]}
              _status={_status}
              // aiApproveFlag={aiApproveFlag}
              referenceRangeMessage={referenceRangeMessageObj[configName]}
            />
          </WrapperComponent>
        );
      case 'sslmInvestgProservice': // 产品及服务
      case 'sslmInvestgSupplierCate': // 供应商分类
      case 'sslmInvestgFin': // 近三年财务状况
      case 'sslmInvestgFinBranch': // 分支机构
      case 'sslmInvestgAuth': // 资质信息
      case 'sslmInvestgContact': // 联系人信息
      case 'sslmInvestgAddress': // 地址信息
      case 'sslmInvestgBankAccount': // 开户行信息
      case 'sslmInvestgCustomer': // 主要客户情况
      case 'sslmInvestgSubSupplier': // 分供方情况
      case 'sslmInvestgEquipment': // 设备信息
      case 'sslmInvestgAttachment': // 附件信息
      case 'sslmInvestgReserve1': // 预留表格1
      case 'sslmInvestgReserve2': // 预留表格2
      case 'sslmInvestgReserve5': // 预留表格3
      case 'sslmInvestgReserve6': // 预留表格4
      case 'sslmInvestgReserve7': // 预留表格5
      case 'sslmInvestgReserve8': // 预留表格6
      case 'sslmInvestgReserve9': // 预留表格7
        return (
          <WrapperComponent>
            <ComposeTable
              remark={newRemark}
              columns={lines}
              source={source}
              editable={newEditable}
              dataSet={dataSetList[configName]}
              configName={configName}
              investgHeaderId={investgHeaderId}
              organizationId={organizationId}
              defaultCountry={defaultCountry}
              _status={_status}
              tableStyle={tableStyle}
              // aiApproveFlag={aiApproveFlag}
              investgRemote={investgRemote}
              onTabValidate={handleTabValidate}
              defaultBankCompanyName={defaultBankCompanyName}
              referenceRangeMessage={referenceRangeMessageObj[configName]}
              reactionFields={allTabReactionFields[configName]}
              buttonPermissions={buttonPermissions}
              addPermissionObj={addPermissionObj}
              deletePermissionObj={deletePermissionObj}
              otherRemoteProps={otherRemoteProps}
            />
          </WrapperComponent>
        );
      default:
        break;
    }
  };

  const renderTabsContent = () => {
    const showTagFlag = previewFlag ? false : showTag;
    const remoteShowTagFlag = investgRemote
      ? investgRemote.process('SSLM_INVESTIGATION_TAB_SHOW_TAG', showTagFlag, {
          investigateTemplate: templateConfig.investigateTemplate,
        })
      : showTagFlag;

    return configList.map((config) => {
      const { configName, configDescription } = config;
      return (
        <TabPane
          key={configName}
          forceRender={fullQueryFlag} // 解决附件校验问题
          tab={renderTabPaneTitle({
            editable,
            configName,
            configNames,
            configDescription,
            showTag: remoteShowTagFlag,
            validated: tabValidate[configName],
          })}
        >
          {/* <div className={styles['investigation-tabs-config-name']}>{configDescription}</div> */}
          {getTabPaneContent(config)}
        </TabPane>
      );
    });
  };

  return (
    <Spin spinning={spinning}>
      <Tabs
        tabPosition="left"
        activeKey={activeKey}
        onChange={handleTabChange}
        inkBarStyle={{ right: 2 }}
        className={classnames(styles['investigation-tabs-container'], {
          [styles['investigation-tabs']]: showTabBar,
          [styles['investigation-tabs-inner-modal']]: isModalFlag,
        })}
        tabBarExtraContent={showTabBar ? <TabBarExtra remoteHiddenTips={remoteHiddenTips} /> : null}
      >
        {renderTabsContent()}
      </Tabs>
    </Spin>
  );
};

const IndexWrapper = forwardRef(Index);

export default IndexWrapper;
