/*
 * Investiga - 调查表
 * @Date: 2023-04-06 10:19:06
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useEffect } from 'react';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
// import { getResponse } from 'utils/utils';

import { PERSONALIZE_COINCIDE_TABS } from '@/routes/components/utils';
import { useSetState } from '@/routes/components/Investigation/utils';
// import { queryInfoChangeApprovalDetail } from '@/services/enterpriseInformService';

import Investigation from './Investigation';

const Index = ({
  isEdit,
  investigRef,
  changeReqId,
  partnerTenantId,
  // setActiveKey,
  headerInfo,
  headerInfo: { defaultBankCompanyName, configNames = [] } = {},
  getFieldProps = () => {},
  viewUpdate = false,
  templateConfig: allTemplateConfig = {}, // 包含重合页签
}) => {
  const [state, setState] = useSetState({
    spinning: false,
    templateConfig: {},
  });
  const { templateConfig = {} } = state;

  useEffect(() => {
    if (changeReqId) {
      queryConfig();
    }
  }, [changeReqId, partnerTenantId, allTemplateConfig]);

  useEffect(() => {
    // 过滤变更调查表tab
    if (!isEmpty(templateConfig)) {
      if (viewUpdate) {
        const { investigateConfigHeaders = [] } = templateConfig;
        // 有变更的tab
        const updatedConfigHeaders = investigateConfigHeaders.filter(item =>
          configNames.includes(item.configName)
        );
        const newTemplateConfig = {
          ...templateConfig,
          investigateConfigHeaders: updatedConfigHeaders,
        };
        setState({ templateConfig: newTemplateConfig });
      } else {
        queryConfig();
      }
      // 激活选中
    }
  }, [viewUpdate]);

  // 查询调查表配置
  const queryConfig = () => {
    if (!isEmpty(allTemplateConfig)) {
      // 存储配置
      const { investigateConfigHeaders = [] } = allTemplateConfig;
      // 过滤重合页签
      const filterConfigHeaders = investigateConfigHeaders.filter(
        item => !PERSONALIZE_COINCIDE_TABS.includes(item.configName)
      );
      const newTemplateConfig = {
        ...allTemplateConfig,
        investigateConfigHeaders: filterConfigHeaders,
      };
      setState({ templateConfig: newTemplateConfig });
    }
    // setState({ spinning: true });
    // // 查询模板配置
    // const payload = {
    //   changeReqId,
    //   partnerTenantId,
    // };
    // queryInfoChangeApprovalDetail(payload)
    //   .then(response => {
    //     const config = getResponse(response);
    //     if (config) {
    //       // 存储配置
    //       setState({ templateConfig: config });
    //     }
    //   })
    //   .finally(() => setState({ spinning: false }));
  };

  return !isEmpty(headerInfo) && !isEmpty(templateConfig.investigateConfigHeaders) ? (
    <Card
      bordered={false}
      title={
        <div>
          {intl.get('sslm.enterpriseInform.view.title.supplementInfo').d('补充信息')}
          <div className="card-content-title-description">
            {intl
              .get('sslm.enterpriseInform.view.title.supplementInfoTips')
              .d('通过调查表补充收集的供应商主数据信息')}
          </div>
        </div>
      }
    >
      <Investigation
        changeReqId={changeReqId}
        partnerTenantId={partnerTenantId}
        showTag={false}
        ref={investigRef}
        editable={isEdit}
        showTabBar={false}
        defaultBankCompanyName={defaultBankCompanyName}
        allowDeleteAllLineFlag={false}
        templateConfig={templateConfig}
        getFieldProps={getFieldProps}
        configNames={configNames}
        viewUpdate={viewUpdate}
      />
    </Card>
  ) : null;
};

export default Index;
