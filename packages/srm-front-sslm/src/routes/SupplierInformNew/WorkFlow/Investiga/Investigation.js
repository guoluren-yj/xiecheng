/*
 * @Date: 2023-10-10
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useEffect, useCallback, forwardRef } from 'react';
import { forEach, camelCase, head, isEmpty, isArray } from 'lodash';
import { DataSet, Tabs, Spin } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import classnames from 'classnames';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';

import ReadOnlyForm from '@/routes/components/Investigation/Compare/CompareForm';
import ReadOnlyTable from '@/routes/components/Investigation/Compare/CompareTable';
import { dealConfigData, useSetState } from '@/routes/components/Investigation/utils';
import { getInvestigationDS as getViewDS } from '@/routes/components/Investigation/Compare/stores/getInvestigationDS';
import styles from '@/routes/components/Investigation/index.less';
import { fieldReflection, fieldReflectionCom } from '../SupplierBasicInfo/utils';

import { getDataSetProps } from './utils';

const { TabPane } = Tabs;

const currentOrganizationId = getCurrentOrganizationId();

// Table表格配置表
const isTable = {
  sslmInvestgFinBranch: true, // 分支机构
  sslmInvestgProservice: true, // 产品及服务
  sslmInvestgSupplierCate: true, // 供应商分类
  sslmInvestgFin: true, // 财务状况
  sslmInvestgAuth: true, // 资质信息
  sslmInvestgContact: true, // 联系人
  sslmInvestgAddress: true, // 地址
  sslmInvestgBankAccount: true, // 开户行信息
  sslmInvestgCustomer: true, // 主要客户情况
  sslmInvestgSubSupplier: true, // 分供方情况
  sslmInvestgEquipment: true, // 设备信息
  sslmInvestgAttachment: true, // 附件信息
  sslmInvestgReserve1: true, // 预留表格页签1
  sslmInvestgReserve2: true, // 预留表格页签2
  sslmInvestgReserve5: true, // 预留表格页签3
  sslmInvestgReserve6: true, // 预留表格页签4
  sslmInvestgReserve7: true, // 预留表格页签5
  sslmInvestgReserve8: true, // 预留表格页签6
  sslmInvestgReserve9: true, // 预留表格页签7
};

const Index = ({
  changeReqId = null,
  partnerTenantId,
  organizationId = currentOrganizationId,
  showTabBar = true, // 展示TabBar
  isModalFlag = false, // 是否弹窗展示调查表
  fullQueryFlag = true, // 是否查询所有页签数据
  setLoading = () => {}, // 父页面的loading
  templateConfig = {}, // 模版配置
  getFieldProps = () => {},
  configNames = [],
  viewUpdate = false,
}) => {
  const editable = false;

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
  const { configList, dataSetList, activeKey, loadTab, spinning } = state;

  useEffect(() => {
    if (changeReqId) {
      handleConfigData(templateConfig);
    }
  }, [changeReqId, templateConfig]);

  // 处理调查表配置
  const handleConfigData = useCallback(
    async config => {
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
      await handleDataSet(firstQuery);
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
            });
          }
          return {
            ...item,
            lines: newLine,
          };
        });
      }
      setState({
        configList: finalConfigList,
        activeKey: firstConfigName,
        tabValidate: validates,
        loadTab: { [firstConfigName]: true },
        allTabReactionFields: tabsReactionFields,
        tabDescription: newTabDescription,
      });
    },
    [changeReqId, viewUpdate]
  );

  const handleDataSet = async config => {
    const dsList = {};
    if (isArray(config)) {
      forEach(config, async item => {
        const { configName } = item;
        const { dataSet } = (await dealDataSet(item)) || {};
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
      setState({
        spinning: true,
      });
      const { configName } = config;
      if (configName) {
        const dsProps = getViewDS(config);
        // 处理数据
        const newDsProps = getDataSetProps({ dsProps, configName, readOnlyFlag: !editable });
        const dataSet = new DataSet(newDsProps);
        dataSet.setQueryParameter('queryParam', {
          changeReqId,
          purchaserTenantId: partnerTenantId,
          dataSource: 2,
          tenantId: organizationId,
          changeType: viewUpdate ? 'MODIFY' : '',
        });

        setLoading(true);
        dataSet
          .query()
          .then(res => {
            const result = getResponse(res);
            if (result && !isEmpty(result)) {
              // 处理旧版接口，数据返回[0]：表示旧数据 [1]：表示最新数据
              if (
                [
                  'sslmInvestgSupplierCate',
                  'sslmInvestgBasic',
                  'sslmInvestgBusiness',
                  'sslmInvestgRd',
                  'sslmInvestgProduce',
                  'sslmInvestgQa',
                  'sslmInvestgCustservice',
                  'sslmInvestgFin',
                  'sslmInvestgContact',
                  'sslmInvestgAddress',
                  'sslmInvestgBankAccount',
                  'sslmInvestgAttachment',
                ].includes(configName)
              ) {
                // 处理只读表单数据取值
                const tableFlag = isTable[configName];
                if (!tableFlag) {
                  const data = result[1];
                  if (!isEmpty(data)) {
                    dataSet.loadData(data);
                  } else {
                    dataSet.loadData([]);
                  }
                } else if (configName === 'sslmInvestgSupplierCate') {
                  dataSet.loadData(res.newFirmChangeCates);
                } else {
                  dataSet.loadData(result[1] || []);
                }
              } else {
                // 处理新版接口，直接返回最新数据
                // eslint-disable-next-line no-lonely-if
                if (isArray(result)) {
                  dataSet.loadData(result);
                } else {
                  dataSet.loadData([result]);
                }
              }
            }
          })
          .finally(() => {
            setLoading(false);
            setState({
              spinning: false,
            });
          });

        return { dataSet };
      }
    },
    [dataSetList, changeReqId, viewUpdate]
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

  const getTabPaneContent = config => {
    const { configName, lines } = config;
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
        return (
          <ReadOnlyTable
            columns={lines}
            dataSet={dataSetList[configName]}
            configName={configName}
            getFieldProps={getFieldProps}
            // 供应商信息变更工作流取得是信息变更的接口，这里先和企业信息变更穿一样的
            pageSource="enterpriseInform"
          />
        );
      default:
        break;
    }
  };

  const getUpdateTabFlag = useCallback(
    key => {
      const updateTabFlag =
        (configNames.includes(fieldReflection[`${key}`]) ||
          configNames.includes(fieldReflectionCom[`${key}`])) &&
        !editable;
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
          tab={configDescription}
          forceRender={fullQueryFlag} // 解决附件校验问题
          count={1}
          countRenderer={() =>
            getUpdateTabFlag(configName) &&
            !viewUpdate && <Badge dot style={{ marginTop: -3, marginLeft: 3 }} />
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
