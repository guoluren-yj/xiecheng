/* RegionCascade 地区级联框
 * @Date: 2022-06-29 14:06:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useCallback } from 'react';
import { last, isEmpty, isObject } from 'lodash';
import { Cascader } from 'choerodon-ui';
import { TextField, Icon } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';

import { loadCityData } from '@/services/supplierWarehouseService';

const RegionCascade = ({
  record = {},
  required,
  editable,
  formFlag = false,
  name,
  hidden = false,
  regionAlias = 'regionId',
  countryAlias = 'countryId',
  disabled = false,
}) => {
  const { data: { regionPathName = '' } = {} } = record;

  // 存储省市区
  const [cityData, setCityData] = useState([]);

  // 选择地区拼接
  const handleSelectRegion = (value = [], selectedOptions = []) => {
    const regionList = selectedOptions.map(region => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('|');
    const regionId = last(value);
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    record.set('isLeaf', isLeaf);
    record.set(regionAlias, regionId);
    record.set('regionPathName', region);
  };

  // 初始化查询地区第一级
  const fetchProvinceCity = () => {
    if (!disabled) {
      setCityData([]);
      const countryId = isObject(record.get(countryAlias))
        ? record.get(countryAlias).countryId
        : record.get(countryAlias);
      loadCityData({ countryId }).then(response => {
        const res = getResponse(response);
        if (res) {
          const newCityData = res.map(n => {
            const { regionId, regionName } = n;
            return { ...n, label: regionName, value: regionId, isLeaf: false };
          });
          setCityData(newCityData);
        }
      });
    }
  };

  // 地区级联下拉框动态加载数据
  const handleQueryCity = useCallback(
    selectedOptions => {
      const lastOption = selectedOptions[selectedOptions.length - 1] || [];
      const { countryId, regionId } = lastOption;
      lastOption.loading = true;
      loadCityData({ countryId, regionId }).then(response => {
        const res = getResponse(response);
        if (res) {
          lastOption.loading = false;
          // 是否是最后一级地区
          if (!isEmpty(res)) {
            const newCityData = res.map(n => {
              const { regionId: newRegionId, regionName } = n;
              const isLeaf = !!Number(n.isLeaf);
              return { ...n, label: regionName, value: newRegionId, isLeaf };
            });
            lastOption.children = newCityData;
          }
          setCityData(preCityData => [...preCityData]);
        }
      });
    },
    [cityData]
  );

  // 省市区级联后缀
  const handleCascader = () => {
    return (
      <Cascader
        onClick={fetchProvinceCity}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        options={cityData}
        disabled={disabled}
        onChange={(value, selectedOptions) => handleSelectRegion(value, selectedOptions)}
        loadData={selectedOptions => handleQueryCity(selectedOptions)}
      >
        <Icon type="expand_more" className="regist-icon" />
      </Cascader>
    );
  };

  return editable ? (
    formFlag ? (
      <TextField
        name={name}
        readOnly
        addonAfter={handleCascader()}
        hidden={hidden}
        disabled={disabled}
      />
    ) : (
      <TextField
        value={regionPathName}
        readOnly
        addonAfter={handleCascader()}
        required={required}
        disabled={disabled}
      />
    )
  ) : (
    <span>{regionPathName || '-'}</span>
  );
};

export default RegionCascade;
