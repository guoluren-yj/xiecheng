/*
 * EnterpriseBasicInfo - 企业基础信息
 * @Date: 2023-08-16 13:55:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import { isEmpty } from 'lodash';
import { Tabs } from 'choerodon-ui/pro';
import React, {
  useMemo,
  useCallback,
  useState,
  useContext,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

import { Context } from '@/routes/SupplierDetailNew/Context';
import { tabModelTable } from '@/routes/components/C7nDynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { getEnterpriseBasicInfoTab } from '../utils';

const { TabPane } = Tabs;

const EnterpriseBasicInfo = (_, ref) => {
  const [activeKey, setActiveKey] = useState('basic');
  const [tableList, setTableList] = useState([]);
  const [reQueryFlag, handleReQueryFlag] = useState(false);
  const tabList = useMemo(() => getEnterpriseBasicInfoTab(), []);

  const context = useContext(Context);
  const { basic = {}, companyId, supplierCompanyId, customizeTabPane } = context;

  const handleTabsChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  useImperativeHandle(ref, () => ({
    onTabsChange: handleTabsChange,
    modelTableConfig: tableList,
  }));

  useEffect(() => {
    // relationId的取值依赖basic，需等basic加载完成
    if (!isEmpty(basic)) {
      // 查询配置表
      queryRelTableConfig('sslm_life_cycle_summary').then(resp => {
        if (!isEmpty(resp)) {
          const list = resp.map(item => {
            return {
              ...item,
              companyId,
              supplierCompanyId,
              relationId: (basic || {})[item.pageRelationField],
            };
          });
          setTableList(list);
          handleReQueryFlag(!reQueryFlag);
        }
      });
    }
  }, [JSON.stringify(basic)]);
  const modelTableProps = {
    reQueryFlag,
    tableList,
    showTitle: false,
    queryParams: {
      companyId,
      supplierCompanyId,
      relationId: basic.supplierCompanyId,
    },
  };

  return (
    <div className="supplier-detail-content" id="enterpriseBasicInfo">
      {customizeTabPane(
        {
          code: 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.TABS',
          custDefaultActive: key => handleTabsChange(key),
        },
        <Tabs tabPosition="left" activeKey={activeKey} onChange={handleTabsChange}>
          {tabList.map(tab => (
            <TabPane key={tab.key} tab={tab.lable}>
              <tab.component />
            </TabPane>
          ))}
          {tabModelTable(modelTableProps)}
        </Tabs>
      )}
    </div>
  );
};

export default forwardRef(EnterpriseBasicInfo);
