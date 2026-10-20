/*
 * @Date: 2023-05-15 20:16:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tabs, Badge } from 'choerodon-ui';
import { head } from 'lodash';
import React, { useEffect, useCallback } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import inlt from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { investigationTemplateHeaderQueryAll } from '@/services/investigationService';
import { getTooltipShow } from '@/routes/components/utils';

import styles from '../index.less';
import CompareForm from './CompareForm';
import CompareTable from './CompareTable';
import { useSetState, dealConfigData } from '../utils';
import { getInvestigationDS } from './stores/getInvestigationDS';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

const Compare = ({
  configNames = [],
  setLoading = () => {},
  investgHeaderId,
  investigateTemplateId,
  tableStyle = { maxHeight: 'calc(100vh - 400px)' },
  handleInvestigateInfo = () => {}, // Promise类型
  pageSource = '',
}) => {
  const [state, setState] = useSetState({
    configList: [],
    currentDsList: {}, // 当前版本ds
    historyDsList: {}, // 历史版本ds
    activeKey: '',
    loadTab: {},
  });
  const { configList, currentDsList, historyDsList, activeKey, loadTab } = state;

  useEffect(() => {
    queryConfig();
  }, [investgHeaderId]);

  // 查询调查表配置
  const queryConfig = useCallback(() => {
    setLoading(true);
    investigationTemplateHeaderQueryAll({
      investigateTemplateId,
      organizationId,
      investgHeaderId,
    })
      .then(response => {
        const config = getResponse(response);
        if (config) {
          handleConfigData(config);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [investgHeaderId, investigateTemplateId]);

  // 处理调查表配置
  const handleConfigData = useCallback(config => {
    const { configList: newConfigList = [] } = dealConfigData(config) || {};
    const firstConfig = head(newConfigList) || {};
    const firstConfigName = firstConfig.configName;
    setState({
      configList: newConfigList,
      activeKey: firstConfigName,
    });
    dealDataSet(firstConfig);
  }, []);

  // 根据配置生成DataSet
  const dealDataSet = useCallback(
    config => {
      const { configName } = config;
      if (configName) {
        const newDsList = {}; // 当前版本ds
        const oldDsList = {}; // 历史版本ds
        newDsList[configName] = new DataSet(getInvestigationDS(config, false));
        oldDsList[configName] = new DataSet(getInvestigationDS(config, false));
        setState({
          currentDsList: { ...currentDsList, ...newDsList },
          historyDsList: { ...historyDsList, ...oldDsList },
        });
        setLoading(true);
        handleInvestigateInfo({
          newDataSet: newDsList[configName],
          oldDataSet: oldDsList[configName],
          configName,
        })
          .then(res => {
            if (res) {
              setState({ loadTab: { ...loadTab, [configName]: true } });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [loadTab, currentDsList, historyDsList]
  );

  // 渲染TabPane内容
  const getTabPaneContent = useCallback((config, dataSet) => {
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
        return <CompareForm columns={lines} dataSet={dataSet} />;
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
          <CompareTable
            columns={lines}
            dataSet={dataSet}
            configName={configName}
            tableStyle={tableStyle}
            pageSource={pageSource}
          />
        );
      default:
        break;
    }
  }, []);

  // tab发生改变时的回调
  const handleTabChange = useCallback(
    key => {
      if (!loadTab[key]) {
        const currentConfig = head(configList.filter(n => n.configName === key));
        dealDataSet(currentConfig);
      }
      setState({ activeKey: key });
    },
    [loadTab, activeKey, configList, currentDsList, historyDsList]
  );

  return (
    <div className={styles['investig-compare-tabs-wrap']}>
      <Tabs
        tabPosition="left"
        activeKey={activeKey}
        inkBarStyle={{ right: 2 }}
        onChange={handleTabChange}
      >
        {configList.map(config => (
          <TabPane
            tab={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'noWrap',
                  }}
                >
                  {getTooltipShow(config.configDescription, 14, 100)}
                </div>
                {configNames.includes(config.configName) && (
                  <Badge dot style={{ marginLeft: 10 }} />
                )}
              </div>
            }
            key={config.configName}
          >
            <div className="compare-container">
              <div className="compare-header">
                <div>{inlt.get('sslm.common.view.compare.currentVersion').d('当前版本')}</div>
                <div>{inlt.get('sslm.common.view.compare.historyVersion').d('历史版本')}</div>
              </div>
              <div className="compare-content">
                <div>
                  <div className="compare-content-detail">
                    <div className="compare-content-title">{config.configDescription}</div>
                    {getTabPaneContent(config, currentDsList[config.configName])}
                  </div>
                </div>
                <div>
                  <div className="compare-content-title">{config.configDescription}</div>
                  {getTabPaneContent(config, historyDsList[config.configName])}
                </div>
              </div>
            </div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default Compare;
