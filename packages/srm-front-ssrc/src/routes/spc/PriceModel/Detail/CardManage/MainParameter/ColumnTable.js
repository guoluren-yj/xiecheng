import React, { useMemo } from 'react';
import { Table, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import AttrChildren from './AttrChildren';

export default observer(function ColumnTable(props) {
  const { dataSet } = props;

  const Modal = useModal();

  // 打开组件属性弹框
  const handleShowModal = (record) => {
    const { columnName, componentTypeMeaning, columnId } = record.get([
      'columnName',
      'componentTypeMeaning',
      'columnId',
    ]);

    const attrProps = {
      columnName,
      componentTypeMeaning,
      columnId,
      sourceFrom: 'COLUMN',
    };

    return Modal.open({
      title: intl.get(`spc.priceModel.model.definition.attrs`).d('组件属性'),
      drawer: true,
      style: {
        width: 1000,
      },
      children: <AttrChildren {...attrProps} />,
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'columnCode',
        width: 120,
      },
      {
        name: 'columnName',
        width: 120,
      },
      {
        name: 'columnSeq',
        width: 120,
      },
      {
        name: 'componentType',
        width: 150,
      },
      {
        name: 'lovCode',
        width: 150,
      },
      {
        name: 'calculateType',
        width: 150,
      },
      {
        name: 'calculateRule',
        width: 200,
      },
      {
        header: intl.get(`spc.priceModel.model.definition.attrs`).d('组件属性'),
        name: 'attrs',
        renderer: ({ record }) =>
          record.get('objectVersionNumber') && (
            <a
              disabled={record.get('componentType') !== 'InputNumber'}
              onClick={() => handleShowModal(record)}
            >
              {intl.get(`spc.priceModel.model.definition.attrs`).d('组件属性')}
            </a>
          ),
      },
      {
        name: 'calculateFlag',
        width: 120,
      },
    ];
  }, []);

  return (
    <Table
      columns={columns}
      dataSet={dataSet}
      style={{ maxHeight: '430px' }}
      customizable
      customizedCode="SRC.PRICE_MODEL.DETAIL.COLUMN"
    />
  );
});
