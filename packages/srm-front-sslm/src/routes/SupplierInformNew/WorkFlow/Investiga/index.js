/*
 * Investiga - 调查表
 * @Date: 2023-09-28 10:19:06
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import Investigation from './Investigation';
import { fieldReflection, fieldReflectionCom } from '../SupplierBasicInfo/utils';

const Index = ({ commonProps }) => {
  const {
    isEdit,
    changeReqId,
    getFieldProps = () => {},
    viewUpdate = false,
    headerInfo,
    templateConfig,
    setLoading = () => {},
  } = commonProps;
  const [templateConfigs, setTemplateConfigs] = useState([]);

  const { configNames = [] } = headerInfo;

  useEffect(() => {
    // 过滤变更调查表tab
    if (!isEmpty(templateConfig)) {
      if (viewUpdate) {
        const { investigateConfigHeaders = [] } = templateConfig;
        // 有变更的tab
        const updatedConfigHeaders = investigateConfigHeaders.filter(
          item =>
            configNames.includes(fieldReflection[item.configName]) ||
            configNames.includes(fieldReflectionCom[item.configName])
        );
        const newTemplateConfig = {
          ...templateConfig,
          investigateConfigHeaders: updatedConfigHeaders,
        };
        setTemplateConfigs(newTemplateConfig);
      } else {
        setTemplateConfigs(templateConfig);
      }
    }
  }, [viewUpdate, templateConfig]);

  return !isEmpty(templateConfigs.investigateConfigHeaders) ? (
    <div className="card-wrap">
      <div className="enterprise-title">
        <div className="card-detail-title">
          {intl.get('sslm.common.view.tab.supplementaryInfo').d('补充信息')}
          <span className="card-detail-title-tips">
            {intl
              .get('sslm.common.view.tabTips.supplementaryInfoTips')
              .d('通过调查表补充收集的供应商主数据信息')}
          </span>
        </div>
      </div>
      <Investigation
        changeReqId={changeReqId}
        showTag={false}
        editable={isEdit}
        showTabBar={false}
        allowDeleteAllLineFlag={false}
        templateConfig={templateConfigs}
        getFieldProps={getFieldProps}
        configNames={configNames}
        viewUpdate={viewUpdate}
        setLoading={setLoading}
      />
    </div>
  ) : null;
};

export default Index;
