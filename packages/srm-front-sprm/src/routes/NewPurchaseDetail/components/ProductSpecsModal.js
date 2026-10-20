/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2022-04-07 17:32:55
 */

import React, { useMemo } from 'react';
import intl from 'utils/intl';
import { Table, Modal, useDataSet } from 'choerodon-ui/pro';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

const ProductListDs = () => {
  return {
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        label: intl.get(`${commonPrompt}.componentName`).d('属性名称'),
        name: 'componentName',
        width: 120,
      },
      {
        label: intl.get(`${commonPrompt}.cpValue`).d('属性值'),
        name: 'cpValue',
        width: 100,
      },
    ],
  };
};

const ProductList = function ProductList({ value }) {
  const productListDs = useDataSet(() => ProductListDs(), []);

  const columns = useMemo(() => {
    return [
      {
        name: 'pName',
      },
      {
        name: 'pValue',
      },
    ];
  });

  const openModal = () => {
    productListDs.loadData(value ? JSON.parse(value) : []);

    Modal.open({
      title: intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性'),
      closable: true,
      drawer: true,
      children: <Table dataSet={productListDs} columns={columns} />,
      footer: null,
    });
  };

  return (
    <>
      <a onClick={() => openModal()}>
        {intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性')}
      </a>
    </>
  );
};

export default ProductList;
