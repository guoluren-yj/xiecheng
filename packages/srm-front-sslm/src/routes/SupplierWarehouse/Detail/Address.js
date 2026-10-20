/**
 * Address - 地址
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { isArray } from 'lodash';
import React, { useState, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';


import '../index.less';
import { fetchLovData } from '@/services/commonService';
import RegionCascade from '@/routes/components/RegionCascade';

const Address = ({ dataSet, isEdit, custLoading, customizeTable, code = '', buttonCode = '' }) => {
  const [addressData, setAddressData] = useState({});

  useEffect(() => {
    handleQueryCityAddress();
  }, []);

  const handleQueryCityAddress = () => {
    // 境内个人需默认带值中国
    let firstData = {};
    fetchLovData().then(lovData => {
      if (getResponse(lovData)) {
        if (lovData && isArray(lovData.content)) {
          const content = lovData.content[0] || {};
          firstData = {
            countryCode: content.countryCode,
            countryId: content.countryId,
            countryName: content.countryName,
          };
          // 新注册带出注册时的企业信息
          setAddressData(firstData);
        }
      }
    });
  };

  const columns = [
    {
      name: 'countryLov',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'regionPathName',
      width: 240,
      className: 'region-td',
      renderer: ({ record }) => <RegionCascade record={record} editable={isEdit} />,
    },
    {
      name: 'addressDetail',
      editor: isEdit,
    },
    {
      name: 'postCode',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'remark',
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
            afterClick: () => {
              const obj = {
                ...addressData,
                countryIdMeaning: addressData.countryName,
                enabledFlag: 1,
              };
              dataSet.current.set(obj);
            },
          },
        ],
        'delete',
      ]
    : [];
  return customizeTable(
    {
      code, // 单元编码，必传
      readOnly: !isEdit,
      buttonCode,
    },
    <Table dataSet={dataSet} columns={columns} buttons={buttons} custLoading={custLoading} />
  );
};

export default Address;
