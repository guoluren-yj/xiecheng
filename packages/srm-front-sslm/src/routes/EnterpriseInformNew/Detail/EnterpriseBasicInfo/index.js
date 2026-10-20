/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tabs, Card, Badge, Button } from 'choerodon-ui';
import { head, isEmpty, forEach } from 'lodash';
import React, { useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { getResponse } from 'utils/utils';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { getDefaultBankCountryInfo } from '@/services/enterpriseInformService';

const { TabPane } = Tabs;

const Index = (
  {
    remote,
    isEdit = false,
    changeReqId,
    custLoading,
    customizeForm,
    customizeTable,
    customizeTabPane,
    headerInfo = {},
    panelList = [],
    isAllPlatform,
    partnerTenantId,
    getFieldProps = () => {},
    handleFieldRender = () => {},
    wfParams = {},
    pageSource = '',
    tabCode = '',
    mustLineTabObj = {},
    custConfig = {},
  },
  ref
) => {
  const {
    reqStatus,
    countryCode,
    domesticForeignRelation,
    configNames = [],
    partnerTenantNum,
  } = headerInfo;
  const [activeKey, setActiveKey] = useState('basicInfo');

  const [bankDefaultInfo, setBankDefaultInfo] = useState({});
  const registerDs = (panelList.find(panel => panel.key === 'basicInfo') || {}).dataSet;
  const companyName = registerDs?.current?.get('companyName');

  // 公共属性
  const commonProps = {
    remote,
    partnerTenantNum,
    mustLineTabObj,
  };

  // 获取组件属性
  const componentProps = {
    isEdit,
    isAllPlatform,
    partnerTenantId,
    countryCode,
    custLoading,
    customizeForm,
    customizeTable,
    tableMaxHeight: { maxHeight: '400px' },
    domesticForeignRelation,
    changeReqId,
    getFieldProps,
    handleFieldRender,
    pageSource,
    // 银行页签参数
    bankDefaultInfo,
    registerDS: registerDs,
    custConfig,
    headerInfo,
  };

  // 调查表组件属性
  const investgComponentProps = (configName = '') =>
    isEdit
      ? {
          getAddBtn: ({ dataSet }) => handleAddBtn({ dataSet, configName }),
          editable: isEdit,
          tableStyle: { maxHeight: '400px' }, // 表格样式
        }
      : {
          getFieldProps,
          tableStyle: { maxHeight: '400px' }, // 表格样式
        };

  useImperativeHandle(ref, () => {
    return {
      handleQuery,
      handleSaveParams,
      setActiveKey,
    };
  });

  useEffect(() => {
    handleBankTabCreateData();
  }, []);

  // 获取银行页签新建默认带出数据
  const handleBankTabCreateData = useCallback(() => {
    getDefaultBankCountryInfo().then(res => {
      if (getResponse(res)) {
        setBankDefaultInfo(res);
      }
    });
  }, []);

  // 大查询
  const handleQuery = useCallback(() => {
    const dsList = [];
    forEach(panelList, panel => {
      const { dataSet } = panel;
      dsList.push(dataSet);
    });
    if (!isEmpty(headerInfo)) {
      forEach(dsList, ds => {
        // 工作流审批参数
        ds.setState('wfParams', wfParams);
        // 获取参数不太稳定
        ds.setState('dsState', headerInfo);
      });
      return Promise.all(dsList.map(ds => ds.query()));
    }
  }, [panelList, reqStatus, changeReqId]);

  // 处理校验问题
  const handleValidate = useCallback(({ tab, dataSet, isForm, key, saveParamKey }) => {
    if (dataSet) {
      return new Promise(async (resolve, reject) => {
        const errorsMsg = [];
        const validateFlag = await dataSet.validate();
        const { errors = [] } = head(dataSet.getValidationErrors()) || {};
        if (!validateFlag && !isEmpty(errors)) {
          forEach(errors, curent => {
            const { validationMessage } = head(curent?.errors) || {};
            if (validationMessage) {
              errorsMsg.push(<div>{validationMessage}</div>);
            }
          });
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ tab, key, errorsMsg });
        } else {
          const data = isForm ? dataSet.current?.toJSONData() : dataSet.toJSONData();
          resolve({ [saveParamKey]: data });
        }
      });
    }
  }, []);

  // 获取需校验的tab
  const getValidatePanel = useCallback(() => {
    const validatePanel = [];
    forEach(panelList, panel => {
      // 当前页签作为第一个需校验的页签，其他页签按顺序校验
      if (panel.key === activeKey) {
        validatePanel.unshift(panel);
      } else {
        validatePanel.push(panel);
      }
    });
    return validatePanel;
  }, [panelList, activeKey]);

  // 获取需保存的参数
  const handleSaveParams = useCallback(async () => {
    const validateResult = [];
    const validatePanel = getValidatePanel();
    forEach(validatePanel, panel => {
      const { tab, key, isForm, dataSet, saveParamKey } = panel;
      const errorMsg = handleValidate({ tab, dataSet, isForm, key, saveParamKey });
      validateResult.push(errorMsg);
    });

    // 使用Promise.allSettled处理reject
    const dataList = await Promise.allSettled(validateResult);
    let saveData = null;
    const dataObj = {};
    forEach(dataList, data => {
      const { status, value, reason } = data;
      if (status === 'rejected') {
        saveData = null;
        const { tab, key, errorsMsg } = reason;
        notification.warning({
          message: intl
            .get('sslm.common.view.warn.infoNotFilled', {
              name: tab,
            })
            .d(`【${tab}】页签信息未填写`),
          description: errorsMsg,
        });
        setActiveKey(key);
        return false;
      } else {
        for (const key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            const element = value[key];
            dataObj[key] = element;
          }
        }
        saveData = dataObj;
      }
    });
    return saveData;
  }, [getValidatePanel]);

  const handleTabsChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  const getUpdateTabFlag = useCallback(
    key => {
      const updateTabFlag = configNames.includes(key) && !isEdit;
      return updateTabFlag;
    },
    [JSON.stringify(configNames)]
  );

  // 调查表-表格新建
  const handleAddBtn = useCallback(
    ({ dataSet: ds, configName = '' }) => {
      let rowDefaultInfo = {
        tenantId: partnerTenantId,
        changeReqId,
      };
      if (['bankInfo'].includes(configName)) {
        rowDefaultInfo = {
          ...rowDefaultInfo,
          bankAccountName: companyName,
        };
      }
      return (
        <Button
          icon="playlist_add"
          onClick={() => {
            ds.create(
              {
                ...rowDefaultInfo,
              },
              0
            );
          }}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      );
    },
    [companyName, partnerTenantId, changeReqId]
  );

  return !isEmpty(panelList) ? (
    <Card
      bordered={false}
      title={intl.get('sslm.enterpriseInform.view.title.enterpriseInfo').d('企业信息')}
    >
      {customizeTabPane(
        {
          code: tabCode,
          custDefaultActive: key => handleTabsChange(key || activeKey),
        },
        <Tabs
          tabPosition="left"
          customizable={false}
          activeKey={activeKey}
          onChange={handleTabsChange}
        >
          {panelList.map(panel => {
            const { dataSet, code, investgProps = {}, key, tab } = panel;
            const platformTabFlag = isEmpty(investgProps);
            const newInvestgProps = { ...investgComponentProps(key), ...investgProps, registerDs };
            const compProps = platformTabFlag ? componentProps : newInvestgProps;
            return (
              <TabPane
                forceRender
                tab={tab}
                key={key}
                count={1}
                countRenderer={() =>
                  getUpdateTabFlag(panel.key) && (
                    <Badge dot style={{ marginTop: -3, marginLeft: 3 }} />
                  )
                }
              >
                <panel.component
                  {...compProps}
                  {...commonProps}
                  dataSet={dataSet}
                  code={code}
                  tabName={tab}
                />
              </TabPane>
            );
          })}
        </Tabs>
      )}
    </Card>
  ) : null;
};

const EnterpriseBasic = forwardRef(Index);

export default EnterpriseBasic;
