/*
 * @Date: 2022-06-30 12:34:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';

const WrapperComponent = ({ children, ...props }) => {
  // 处理模板配置extSetMap映射值
  const setExtMapToForm = useCallback(({ extSetMap, record, lovRecord }) => {
    if (extSetMap) {
      extSetMap.split(/\s*,\s*/g).forEach(entryStr => {
        const [recordField, formFieldTmp] = entryStr.split('->');
        const formField = formFieldTmp || recordField;
        if (record) {
          record.set(formField, lovRecord ? lovRecord[recordField] : null);
        }
      });
    }
  }, []);

  // 映射字段回调处理
  const handleCascadeChange = useCallback(({ extSetMap, record, lovRecord }) => {
    if (extSetMap) {
      setExtMapToForm({ extSetMap, record, lovRecord });
    }
  }, []);

  // 开户行联行行号回调
  const handleBankFirmChange = useCallback(({ extSetMap, record, lovRecord }) => {
    handleCascadeChange({ extSetMap, record, lovRecord });
  }, []);

  // 是否长期有效回调
  const handleLongEffectiveChange = useCallback(({ extSetMap, record }) => {
    handleCascadeChange({ extSetMap, record });
  }, []);

  // 国家改变时的回调
  const handleCountryChange = useCallback(({ extSetMap, record, lovRecord, configName }) => {
    let newExtSetMap = extSetMap;
    const lovFieldFlag = ['sslmInvestgProservice', 'sslmInvestgFinBranch'].includes(configName);
    if (lovFieldFlag && newExtSetMap) {
      newExtSetMap = newExtSetMap
        .replace(/regionId/g, 'regionIdLov')
        .replace(/cityId/g, 'cityIdLov');
    }
    handleCascadeChange({ extSetMap: newExtSetMap, record, lovRecord });
  }, []);

  // 产品及服务-服务物料回调
  const handleItemChange = useCallback(({ record, lovRecord }) => {
    record.set('productCategoryIdLov', lovRecord);
  }, []);

  // 产品及服务/分支机构-地区回调
  const handleRegionChange = useCallback(({ extSetMap, record, configName }) => {
    let newExtSetMap = extSetMap;
    const lovFieldFlag = ['sslmInvestgProservice', 'sslmInvestgFinBranch'].includes(configName);
    if (lovFieldFlag && newExtSetMap) {
      newExtSetMap = newExtSetMap.replace(/cityId/g, 'cityIdLov');
    }
    handleCascadeChange({ extSetMap: newExtSetMap, record });
  }, []);

  const context = {
    handleBankFirmChange,
    handleCascadeChange,
    handleLongEffectiveChange,
    handleCountryChange,
    handleItemChange,
    handleRegionChange,
  };

  return React.cloneElement(children, {
    context,
    ...props,
  });
};

export default WrapperComponent;
