/*
 * Index - 企业信息变更调查表组件
 * @Date: 2023-04-06 10:19:06
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useEffect, useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import { forEach, camelCase, head, isEmpty, isArray } from 'lodash';
import { DataSet, Tabs, Spin, Button } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import { renderStatus, getTooltipShow } from '@/routes/components/utils';

import ComposeFrom from '@/routes/components/Investigation/Compose/ComposeForm';
import ComposeTable from '@/routes/components/Investigation/Compose/ComposeTable';
import ReadOnlyForm from '@/routes/components/Investigation/Compare/CompareForm';
import ReadOnlyTable from '@/routes/components/Investigation/Compare/CompareTable';
import {
  dealConfigData,
  questionnaireForm,
  useSetState,
  handleFinanceData,
  getButtonPermissionList,
} from '@/routes/components/Investigation/utils';
import WrapperComponent from '@/routes/components/Investigation/components/WrapperComponent';
import { getInvestigationDS as getEditDS } from '@/routes/components/Investigation/stores/getInvestigationDS';
import { getInvestigationDS as getViewDS } from '@/routes/components/Investigation/Compare/stores/getInvestigationDS';

import styles from '@/routes/components/Investigation/index.less';

import { getDataSetProps } from '../../utils';

const { TabPane } = Tabs;

const currentOrganizationId = getCurrentOrganizationId();

// Table表格配置表
const isTable = {
  sslmInvestgFinBranch: true, // 分支机构
  sslmInvestgProservice: true, // 产品及服务
  sslmInvestgAuth: true, // 资质信息
  sslmInvestgBankAccount: true, // 开户行信息
  sslmInvestgCustomer: true, // 主要客户情况
  sslmInvestgSubSupplier: true, // 分供方情况
  sslmInvestgEquipment: true, // 设备信息
  sslmInvestgReserve1: true, // 预留表格页签1
  sslmInvestgReserve2: true, // 预留表格页签2
  sslmInvestgReserve5: true, // 预留表格页签3
  sslmInvestgReserve6: true, // 预留表格页签4
  sslmInvestgReserve7: true, // 预留表格页签5
  sslmInvestgReserve8: true, // 预留表格页签6
  sslmInvestgReserve9: true, // 预留表格页签7
};

const Index = (
  {
    // source = '', // 来源页面
    changeReqId = null,
    partnerTenantId,
    organizationId = currentOrganizationId,
    editable = true, // 页面编辑标识和展示完成未完成标识
    defaultCountry,
    _status = '', // 显示页签提示信息
    tableStyle = {}, // 表格样式
    previewFlag = false, // 仅预览标识
    showTabBar = true, // 展示TabBar
    isModalFlag = false, // 是否弹窗展示调查表
    defaultBankCompanyName, // 银行默认带出公司名称
    buttonPermissions = {},
    addPermissionCode = {}, // 表格新建按钮权限集
    deletePermissionCode = {}, // 表格删除按钮权限集
    allowDeleteAllLineFlag = false, // 允许删除所有表格行
    fullQueryFlag = true, // 是否查询所有页签数据
    setLoading = () => {}, // 父页面的loading
    templateConfig = {}, // 模版配置
    getFieldProps = () => {},
    configNames = [],
    viewUpdate = false,
  },
  ref
) => {
  const [state, setState] = useSetState({
    configList: [],
    dataSetList: {},
    activeKey: '',
    loadTab: {},
    spinning: false,
    tabValidate: {}, // 页签的校验状态
    tabDescription: {}, // 页签名称
    allTabReactionFields: {},
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
  } = state;
  const { addPermissionObj, deletePermissionObj } = permissionState;

  useEffect(() => {
    if (changeReqId) {
      handleConfigData(templateConfig);
    }
  }, [changeReqId, templateConfig]);

  useEffect(() => {
    getTableBtnPermission();
  }, [changeReqId]);

  useImperativeHandle(ref, () => {
    return {
      handleQuery,
      handleSaveParams,
    };
  });

  // 查询tab的校验状态
  const handleTabValidate = useCallback(() => {}, [organizationId, changeReqId, tabValidate]);

  // 处理调查表配置
  const handleConfigData = useCallback(
    config => {
      const {
        configList: newConfigList = [],
        tabValidate: validates = {},
        tabDescription: newTabDescription = {},
      } = dealConfigData(config) || {};
      // 处理配置默认值公式
      const tabsReactionFields = handleFormulaDefaultValue(newConfigList);
      let finalConfigList = newConfigList;
      // 查看单据多增加一列
      if (!editable) {
        finalConfigList = newConfigList.map(item => {
          const { configName, lines } = item;
          const newLine = [...lines];
          if (isTable[configName]) {
            newLine.unshift({
              componentType: 'SELECT',
              fieldCode: 'firmChangeBeanStateFlag',
              renderer: renderStatus,
              fieldType: 'cuz',
              fieldDescription: intl.get('sslm.common.model.common.changeType').d('变更类型'),
              props: [],
            });
          }
          return {
            ...item,
            lines: newLine,
          };
        });
      }
      const firstConfig = head(finalConfigList) || {};
      const firstConfigName = firstConfig.configName;
      // 初次查询是查询所有页签还是第一个页签
      const firstQuery = fullQueryFlag ? finalConfigList : firstConfig;
      handleDataSet(firstQuery);
      setState({
        configList: finalConfigList,
        activeKey: firstConfigName,
        tabValidate: validates,
        loadTab: { [firstConfigName]: true },
        allTabReactionFields: tabsReactionFields,
        tabDescription: newTabDescription,
      });
    },
    [changeReqId, viewUpdate, editable]
  );

  const handleDataSet = config => {
    const dsList = {};
    if (isArray(config)) {
      forEach(config, item => {
        const { configName } = item;
        const { dataSet } = dealDataSet(item) || {};
        dsList[configName] = dataSet;
      });
      setState({
        dataSetList: dsList,
      });
    } else {
      const { configName } = config;
      const { dataSet } = dealDataSet(config) || {};
      dsList[configName] = dataSet;
      setState({
        dataSetList: { ...dataSetList, ...dsList },
      });
    }
  };

  // 根据配置生成DataSet
  const dealDataSet = useCallback(
    config => {
      const { configName } = config;
      if (configName) {
        const dsProps = editable
          ? getEditDS({ config, previewFlag, allowDeleteAllLineFlag })
          : getViewDS(config);
        // 处理数据
        const newDsProps = getDataSetProps({ dsProps, configName, readOnlyFlag: !editable });
        const dataSet = new DataSet(newDsProps);
        dataSet.setQueryParameter('queryParam', {
          changeReqId,
          purchaserTenantId: partnerTenantId,
          dataSource: 1,
          tenantId: organizationId,
          changeType: viewUpdate ? 'MODIFY' : '',
        });
        if (editable) {
          setLoading(true);
          dataSet
            .query()
            .then(res => {
              const result = getResponse(res);
              if (result && !isEmpty(result)) {
                validateReferenceRange({ data: result, config });
              }
            })
            .finally(() => setLoading(false));
        } else {
          setLoading(true);
          dataSet
            .query()
            .then(res => {
              const result = getResponse(res);
              if (result && !isEmpty(result)) {
                // 处理只读表单数据取值
                const tableFlag = isTable[configName];
                if (!tableFlag) {
                  const data = result[1];
                  if (!isEmpty(data)) {
                    dataSet.loadData(data);
                  } else {
                    dataSet.loadData([]);
                  }
                }
                validateReferenceRange({ data: result, config });
              }
            })
            .finally(() => setLoading(false));
        }
        return { dataSet };
      }
    },
    [dataSetList, changeReqId, editable, viewUpdate]
  );

  // tab发生改变时的回调
  const handleFormulaDefaultValue = useCallback(allConfig => {
    const tabsReactionFields = {};
    // 遍历页签
    allConfig.forEach(tabConfig => {
      const { configName, lines = [] } = tabConfig;
      // 单页签字段关系{fieldName: ['a','b']}
      const reactionFields = {};
      // 遍历字段
      lines.forEach(fieldConfig => {
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
            defaultValueStr = defaultValueStr.replace(/\b\w+\b/g, item => {
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
  const handleTabChange = useCallback(
    key => {
      if (!loadTab[key] && !fullQueryFlag) {
        const currentConfig = head(configList.filter(n => n.configName === key));
        handleDataSet(currentConfig);
      }
      setState({ loadTab: { ...loadTab, [key]: true }, activeKey: key });
    },
    [activeKey, configList, fullQueryFlag]
  );

  // 重新查询
  const handleQuery = useCallback(() => {
    return new Promise(resolve => {
      setState({ spinning: true });
      const queryPromiseList = [];
      forEach(dataSetList, dataSet => {
        queryPromiseList.push(dataSet.query());
      });
      Promise.all(queryPromiseList).finally(() => {
        resolve();
        setState({ spinning: false });
      });
    });
  }, [dataSetList, changeReqId]);

  // dataSet校验
  const validateDataSet = useCallback(
    (dataSet, configName) => {
      if (dataSet) {
        return new Promise(async (resolve, reject) => {
          const validateFlag = await dataSet.validate();
          const errorList = head(dataSet.getValidationErrors())?.errors;
          const errorMsg = [];
          if (!isEmpty(errorList) && !validateFlag) {
            (errorList || []).forEach(curent => {
              const { validationMessage } = head(curent?.errors) || {};
              if (validationMessage) {
                errorMsg.push(<div>{validationMessage}</div>);
              }
            });
            reject({ errorMsg, configName, configDescription: tabDescription[configName] }); // eslint-disable-line
          } else {
            const isForm = questionnaireForm[configName];
            // 表单传全量数据，用于后端校验
            const curDataSetData = isForm ? dataSet.toData() : dataSet.toJSONData();
            const data = curDataSetData.map(n => {
              return { ...n, tenantId: organizationId };
            });
            resolve({ [configName]: isForm ? head(data) : data });
          }
        });
      }
    },
    [tabDescription, changeReqId]
  );

  // 获取需校验的ds
  const getValidateDataSet = useCallback(() => {
    const sortDsList = []; // 根据返回的配置排序后的ds
    forEach(configList, config => {
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

  // 获取需保存的参数
  const handleSaveParams = useCallback(async () => {
    const validateResult = [];
    const needValidateDs = getValidateDataSet();
    forEach(needValidateDs, validateDs => {
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
    forEach(dataList, data => {
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
        return false;
      } else {
        for (const key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            const tabData = value[key];
            if (key === 'sslmInvestgFin') {
              if (isArray(tabData) && !isEmpty(tabData)) {
                dataObj[key] = tabData.map(item => {
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
      const { fieldCode, fieldDescription, props = [] } = line;
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
              const fieldCodeData = data.map(n => n[fieldCode]);
              const validateList = fieldCodeData.map(item => {
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
    setReferenceRangeMessage(prevState => ({
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
  }, [changeReqId]);

  // 表格新建
  const handleAddBtn = useCallback(
    ({ dataSet: ds }) => {
      return (
        <Button
          icon="playlist_add"
          onClick={() => {
            ds.create(
              {
                tenantId: partnerTenantId,
                changeReqId,
              },
              0
            );
          }}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      );
    },
    [changeReqId]
  );

  const getTabPaneContent = config => {
    const { configName, lines, remark } = config;
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
        return editable ? (
          <WrapperComponent>
            <ComposeFrom
              reactionFields={allTabReactionFields[configName]}
              columns={lines}
              remark={remark}
              editable={editable}
              dataSet={dataSetList[configName]}
              _status={_status}
              referenceRangeMessage={referenceRangeMessage[configName]}
            />
          </WrapperComponent>
        ) : (
          <ReadOnlyForm
            columns={lines}
            dataSet={dataSetList[configName]}
            getFieldProps={getFieldProps}
          />
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
        return editable ? (
          <WrapperComponent>
            <ComposeTable
              remark={remark}
              columns={lines}
              source="enterpriseInform"
              editable={editable}
              dataSet={dataSetList[configName]}
              configName={configName}
              organizationId={organizationId}
              defaultCountry={defaultCountry}
              _status={_status}
              tableStyle={tableStyle}
              onTabValidate={handleTabValidate}
              defaultBankCompanyName={defaultBankCompanyName}
              referenceRangeMessage={referenceRangeMessage[configName]}
              reactionFields={allTabReactionFields[configName]}
              buttonPermissions={buttonPermissions}
              addPermissionObj={addPermissionObj}
              deletePermissionObj={deletePermissionObj}
              getAddBtn={handleAddBtn}
            />
          </WrapperComponent>
        ) : (
          <ReadOnlyTable
            columns={lines}
            dataSet={dataSetList[configName]}
            configName={configName}
            getFieldProps={getFieldProps}
            pageSource="enterpriseInform"
          />
        );
      default:
        break;
    }
  };

  const getUpdateTabFlag = useCallback(
    key => {
      const updateTabFlag = configNames.includes(key) && !editable;
      return updateTabFlag;
    },
    [JSON.stringify(configNames), editable]
  );

  const renderTabsContent = () => {
    return configList.map(config => {
      const { configName, configDescription } = config;
      return (
        <TabPane
          key={configName}
          forceRender={fullQueryFlag} // 解决附件校验问题
          tab={
            <div>
              {getTooltipShow(configDescription, 14, 120)}
              {getUpdateTabFlag(configName) && (
                <Badge dot style={{ marginTop: -3, marginLeft: 3 }} />
              )}
            </div>
          }
        >
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
      >
        {renderTabsContent()}
      </Tabs>
    </Spin>
  );
};

const IndexWrapper = forwardRef(Index);

export default IndexWrapper;
