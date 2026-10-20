/**
 * Address - 地址
 * @date: 2021-11-25
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { Cascader } from 'choerodon-ui';
import { isEmpty, last } from 'lodash';
import React, { useState, useCallback } from 'react';
import { Table, TextField, Icon } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import { loadCityData } from '@/services/legalService';
import styles from './index.less';

const AddressInfo = ({ dataSet, isEdit, legalDS, defaultBankInfo }) => {
  // useEffect(() => {
  //   if (companyId) {
  //     dataSet.setQueryParameter('companyId', companyId);
  //     dataSet.query();
  //   }
  // }, [companyId]);
  // 存储省市区
  const [cityData, setCityData] = useState([]);
  const handleAdd = useCallback(() => {
    const legalData = legalDS.current.toData() || {};
    const { domesticForeignRelation } = legalData;
    const currentRow = dataSet.current || {};
    if (domesticForeignRelation === '1') {
      currentRow.set(defaultBankInfo);
    }
  }, []);
  // 初始化查询地区第一级
  const fetchProvinceCity = (record) => {
    setCityData([]);
    const countryId = record.get('countryId');
    loadCityData({ countryId }).then((response) => {
      const res = getResponse(response);
      if (res) {
        const newCityData = res.map((n) => {
          const { regionId, regionName } = n;
          return { ...n, label: regionName, value: regionId, isLeaf: false };
        });
        setCityData(newCityData);
      }
    });
  };

  // 地区级联下拉框动态加载数据
  const handleQueryCity = useCallback(
    (selectedOptions) => {
      const lastOption = selectedOptions[selectedOptions.length - 1] || [];
      const { countryId, regionId } = lastOption;
      lastOption.loading = true;
      loadCityData({ countryId, regionId }).then((response) => {
        const res = getResponse(response);
        if (res) {
          lastOption.loading = false;
          // 是否是最后一级地区
          if (!isEmpty(res)) {
            const newCityData = res.map((n) => {
              const { regionId: newRegionId, regionName } = n;
              const isLeaf = !!Number(n.isLeaf);
              return { ...n, label: regionName, value: newRegionId, isLeaf };
            });
            lastOption.children = newCityData;
          }
          setCityData((preCityData) => [...preCityData]);
        }
      });
    },
    [cityData]
  );

  // 选择地区拼接
  const handleSelectRegion = (value = [], selectedOptions = [], record) => {
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('|');
    const regionId = last(value);
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    record.set('isLeaf', isLeaf);
    record.set('regionId', regionId);
    record.set('regionPathName', region);
  };

  // 省市区级联后缀
  const handleCascader = (record) => {
    return (
      <Cascader
        onClick={() => fetchProvinceCity(record)}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        options={cityData}
        onChange={(value, selectedOptions) => handleSelectRegion(value, selectedOptions, record)}
        loadData={(selectedOptions) => handleQueryCity(selectedOptions)}
      >
        <Icon type="expand_more" className="regist-icon" />
      </Cascader>
    );
  };

  const columns = [
    {
      name: 'countryObj',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'regionPathName',
      width: 240,
      className: styles['region-td'],
      renderer: ({ record }) => {
        const {
          data: { regionPathName },
        } = record;
        return isEdit ? (
          <TextField value={regionPathName} readOnly addonAfter={handleCascader(record)} />
        ) : (
          regionPathName
        );
      },
    },
    {
      name: 'addressDetail',
      editor: isEdit,
    },
    {
      name: 'postCode',
      width: 150,
      // editor: isEdit && <TextField restrict="0-9" maxLength={6} />,
      editor: isEdit && <TextField />,
    },
    {
      name: 'description',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'enabledFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];
  const buttons = isEdit
    ? [
        [
          'add',
          {
            afterClick: handleAdd,
          },
        ],
        [
          'delete',
          {
            onClick: () =>
              dataSet.delete(dataSet.selected, {
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      selectionMode={isEdit ? 'rowbox' : 'click'}
    />
  );
};

export default AddressInfo;
