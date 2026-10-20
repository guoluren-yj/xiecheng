import React, { useContext, useMemo } from 'react';
import { Table, useModal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import Store from '../store/index';
import AttrChildren from './MainParameter/AttrChildren';

export default function OtherParameter() {
  const {
    commonDs: { otherParameterDs },
  } = useContext(Store);

  const Modal = useModal();

  // 打开组件属性弹框
  const handleShowModal = (record) => {
    const { paramName, componentTypeMeaning, paramId } = record.get([
      'paramName',
      'componentTypeMeaning',
      'paramId',
    ]);

    const attrProps = {
      columnName: paramName,
      componentTypeMeaning,
      columnId: paramId,
      sourceFrom: 'PARAM',
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

  const columns = useMemo(() => {
    return [
      {
        name: 'paramCode',
        width: 150,
      },
      {
        name: 'paramName',
        width: 150,
      },
      {
        name: 'componentType',
        width: 120,
      },
      {
        name: 'calculateType',
        width: 200,
      },
      {
        name: 'calculateRule',
        width: 250,
      },
      {
        header: intl.get(`spc.priceModel.model.definition.attrs`).d('组件属性'),
        name: 'attrs',
        width: 120,
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
    ];
  }, []);

  return (
    <Table
      dataSet={otherParameterDs}
      columns={columns}
      style={{ maxHeight: '430px' }}
      customizable
      customizedCode="SRC.PRICE_MODEL.DETAIL.OTHER_PARAMETER"
    />
  );
}
