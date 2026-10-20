import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import CollapseForm from '_components/CollapseForm';
import { Output } from 'choerodon-ui/pro';

import { fetchRFContentConfig } from '@/services/inquiryHallService';
import { isJSON, fetchOfflineWholeConfig } from '@/utils/utils';

import { StoreContext } from '../store/StoreProvider';

// 寻源要求卡片
const SourceDemand = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const [rfFlag, setRFFlag] = useState(false); // 开启rf标识
  const [offlineWholeFlag, setOfflineWholeFlag] = useState(false); // 整单线下开启标识

  const { secondarySourceCategory, sourceConfig } =
    headerDs?.current?.get(['secondarySourceCategory', 'sourceConfig']) || {};

  useEffect(() => {
    fetchRFConfig();
    fetchWholeEntryConfig();
  }, []);

  // 查询RF配置
  const fetchRFConfig = async () => {
    const res = await fetchRFContentConfig();
    if (!isJSON(res)) {
      if (res) {
        setRFFlag(true);
      } else {
        setRFFlag(false);
      }
    } else {
      getResponse(JSON.parse(res));
    }
  };

  // 查询整单线下寻源是否开启
  const fetchWholeEntryConfig = async () => {
    const flag = await fetchOfflineWholeConfig();
    setOfflineWholeFlag(flag);
  };

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('sourceDemandForm'),
      dataSet: headerDs,
    },
    <CollapseForm
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      showLines={3}
      useWidthPercent
    >
      <Output
        name="secondarySourceCategoryMeaning"
        renderer={({ record }) => {
          return (
            record?.get('secondarySourceCategoryMeaning') ?? record?.get('sourceCategoryMeaning')
          );
        }}
      />
      {/* useRef开启 & 不是招标 */}
      {/* rf开启 & 不是招标 */}
      {rfFlag && !['NEW_BID', 'BID'].includes(secondarySourceCategory) && (
        <Output name="sourceConfig" />
      )}
      {/* 开启线下整单且仅当用户选择寻源类别=询价且RFX节点配置为空或包含RFQ才显示此字段 */}
      {offlineWholeFlag &&
        secondarySourceCategory === 'RFQ' &&
        (!sourceConfig || sourceConfig.indexOf('RFQ') > -1) && <Output name="sourceRequest" />}
      <Output name="currencyCode" />
      <Output name="paymentTypeName" />
      <Output name="paymentTermName" />
      <Output name="depositAmount" />
      <Output name="evalMethodName" />
      <Output name="methodRemark" />
    </CollapseForm>
  );
});

export default SourceDemand;
