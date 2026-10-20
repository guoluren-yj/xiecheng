/*
 * CustomSpecsModal - 属性弹窗
 * @date: 2021/08/11 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useEffect, useMemo } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { customSpecs, productSpecs } from './store/customSpecsModalDs';

const CustomSpecsModal = (props) => {
  const { type, data } = props;
  const typeList = useMemo(() => [
    {
      type: 'customSpecs',
      dsConfig: customSpecs,
      title: intl.get('slod.orderExecution.model.common.customSpecsJson').d('定制品属性'),
      columns: [
        {
          name: 'componentName',
          width: 150,
        },
        {
          name: 'cpValue',
          width: 150,
          renderer: ({ value }) => {
            return value && value.indexOf('http') !== -1 ? (
              <a href={String(value)} target="_blank" rel="noopener noreferrer">
                {value}
              </a>
            ) : (
              value
            );
          },
        },
      ],
    },
    {
      type: 'productSpecs',
      dsConfig: productSpecs,
      title: intl.get('slod.orderExecution.model.common.productSpecsJson').d('商品属性'),
      columns: [
        {
          name: 'pName',
          width: 150,
        },
        {
          name: 'pValue',
          width: 150,
        },
      ],
    },
  ]);
  const config = typeList.find((i) => i.type === type);
  const currentDataSet = useMemo(() => new DataSet(config.dsConfig()), []);

  useEffect(() => {
    currentDataSet.loadData(data);
  }, []);

  const handleCustomSpecs = () => {
    Modal.open({
      drawer: true,
      title: config.title,
      style: { width: 380 },
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
      children: <Table selectionMode="none" dataSet={currentDataSet} columns={config.columns} />,
    });
  };
  return <a onClick={handleCustomSpecs}>{config.title}</a>;
};

export default CustomSpecsModal;
