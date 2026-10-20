import React, { useContext, useEffect, useState } from 'react';
import { Lov, Select, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import CollapseForm from '_components/CollapseForm';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { fetchRFContentConfig } from '@/services/inquiryHallService';
import { isJSON, fetchOfflineWholeConfig } from '@/utils/utils';

import { StoreContext } from '../store/StoreProvider';

// 寻源要求卡片
const SourceDemand = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const [rfFlag, setRFFlag] = useState(false); // 开启rf标识
  const [rfType, setRFType] = useState('ALL'); // 开启了i\p类型
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
        if (['RFI', 'RFP'].includes(res)) {
          setRFType(res);
        } else {
          setRFType('ALL');
        }
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

  // 过滤sourceConfig节点配置
  const filterSourceConfigOption = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    if (rfFlag) {
      if (rfType === 'RFI') {
        return optionValue.indexOf('RFP') <= -1;
      } else if (rfType === 'RFP') {
        return optionValue.indexOf('RFI') <= -1;
      }
      return optionValue;
    } else {
      return optionValue.indexOf('RFI') <= -1 && optionValue.indexOf('RFP') <= -1;
    }
  };

  // 改变评标办法
  const handleChangeEvaluateMethod = (value) => {
    if (!headerDs?.current) return;
    headerDs.current.set({
      methodRemark: value?.remark || null,
    });
  };

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('sourceDemandForm'),
      dataSet: headerDs,
    },
    <CollapseForm dataSet={headerDs} columns={3} labelLayout="float" useWidthPercent>
      <Select name="secondarySourceCategory" />
      {/* rf开启 & 不是招标 */}
      {rfFlag && !['NEW_BID', 'BID'].includes(secondarySourceCategory) && (
        <Select name="sourceConfig" optionsFilter={filterSourceConfigOption} />
      )}
      {/* 开启线下整单且仅当用户选择寻源类别=询价且RFX节点配置为空或包含RFQ才显示此字段 */}
      {offlineWholeFlag &&
        secondarySourceCategory === 'RFQ' &&
        (!sourceConfig || sourceConfig.indexOf('RFQ') > -1) && (
          <Select name="sourceRequest" clearButton={false} />
        )}
      <Lov name="currencyCode" />
      <Lov name="paymentTypeId" />
      <Lov name="paymentTermId" />
      <C7nPrecisionInputNumber
        name="depositAmount"
        record={headerDs.current}
        dataSet={headerDs}
        financial="currencyCode"
      />
      <Lov name="methodId" onChange={handleChangeEvaluateMethod} />
      <TextArea name="methodRemark" resize="vertical" cols={20} />
    </CollapseForm>
  );
});

export default SourceDemand;
