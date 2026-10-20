import React, { useContext, useCallback, useMemo, useEffect } from 'react';
import { Table, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import Store from '../store/index';
import AttrChildren from './MainParameter/AttrChildren';

export default observer(function OtherParameter() {
  const Modal = useModal();
  const {
    commonDs: { otherParameterDs },
    routerParams: { modelId },
    commonRef: { countFormulaRef },
  } = useContext(Store);

  useEffect(() => {
    otherParameterDs.setState('fetchParamsAll', countFormulaRef.current?.fetchParamsAll);
  }, [countFormulaRef.current?.fetchParamsAll]);

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

  const handleClick = useCallback(() => {
    otherParameterDs.create(
      {
        modelId,
      },
      0
    );
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'paramCode',
        width: 150,
        editor: true,
      },
      {
        name: 'paramName',
        width: 150,
        editor: true,
      },
      {
        name: 'componentType',
        width: 120,
        editor: true,
      },
      {
        name: 'calculateType',
        width: 200,
        editor: true,
      },
      {
        name: 'calculateRule',
        width: 250,
        editor: true,
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

  const buttons = useMemo(() => [['add', { onClick: handleClick }], 'save', 'delete'], []);

  return (
    <Table
      customizable
      customizedCode="SRC.PRICE_MODEL.UPDATE.OTHER_PARAMETER"
      dataSet={otherParameterDs}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: '430px' }}
    />
  );
});
