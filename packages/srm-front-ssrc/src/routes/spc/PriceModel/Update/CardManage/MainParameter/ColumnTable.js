import React, { useCallback, useContext, useMemo } from 'react';
import { Table, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import Store from '../../store/index';
import AttrChildren from './AttrChildren';

export default observer(function ColumnTable() {
  const {
    commonDs: { columnTableDs },
    routerParams: { modelId },
  } = useContext(Store);

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
        width: 742,
      },
      children: <AttrChildren {...attrProps} />,
    });
  };

  const handleAdd = useCallback(() => {
    columnTableDs.create(
      {
        modelId,
        moduleId: columnTableDs.getState('moduleId'),
      },
      0
    );
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'columnCode',
        width: 120,
        editor: true,
      },
      {
        name: 'columnName',
        width: 120,
        editor: true,
      },
      {
        name: 'columnSeq',
        width: 120,
        editor: true,
      },
      {
        name: 'componentType',
        width: 150,
        editor: true,
      },
      {
        name: 'lovCodeLov',
        width: 150,
        editor: true,
      },
      {
        name: 'calculateType',
        width: 150,
        editor: true,
      },
      {
        name: 'calculateRule',
        width: 200,
        editor: true,
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
        editor: true,
      },
    ];
  }, []);

  const buttons = useMemo(() => [['add', { onClick: handleAdd }], 'delete', 'save'], []);

  return (
    <Table
      customizable
      customizedCode="SRC.PRICE_MODEL.UPDATE.COLUMN"
      columns={columns}
      dataSet={columnTableDs}
      buttons={buttons}
      style={{ maxHeight: '430px' }}
    />
  );
});
