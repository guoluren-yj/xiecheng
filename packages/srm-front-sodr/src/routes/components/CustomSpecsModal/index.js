/*
 * CustomSpecsModal - 属性弹窗
 * @date: 2021/08/11 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useEffect, useMemo } from 'react';
import { DataSet, Modal, Table, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { customSpecs, productSpecs } from './store/customSpecsModalDs';

const CustomSpecsModal = (props) => {
  const { type, data } = props;
  const typeList = useMemo(() => [
    {
      type: 'customSpecs',
      dsConfig: customSpecs,
      title: intl.get('sodr.workspace.model.common.customSpecsJson').d('定制品属性'),
      columns: [
        {
          name: 'componentName',
          width: 150,
        },
        {
          name: 'cpValue',
          width: 150,
          renderer: ({ value, record }) => {
            return ['IMAGE', 'UPLOAD'].includes(record.get('componentType')) ? (
              <Attachment
                readOnly
                labelLayout="float"
                viewMode="popup"
                value={value}
                bucketName="private-bucket"
              />
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
      title: intl.get('sodr.workspace.model.common.productSpecsJson').d('商品属性'),
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
      style: { width: 742 },
      drawer: true,
      title: config.title,
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('sodr.workspace.view.button.close').d('关闭'),
      children: <Table selectionMode="none" dataSet={currentDataSet} columns={config.columns} />,
    });
  };
  return <a onClick={handleCustomSpecs}>{config.title}</a>;
};

export default CustomSpecsModal;
