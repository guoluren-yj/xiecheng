import React, { useContext } from 'react';
import { Table, Form, Modal, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { Store } from '../../Detail/stores';

const DynamicColConfig = function DynamicColConfig() {
  const { listDs, componetSetingDs } = useContext(Store);

  const openModal = record => {
    componetSetingDs.current.init({
      sourceCode: record.get('sourceCode'),
      sourceCodeMeaning: record.get('sourceCodeMeaning'),
      type: record.get('fieldWidget'),
    });
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('sprm.forecastMgt.model.common.modalLovDetail').d('组件类型详情'),
      children: (
        <Form
          dataSet={componetSetingDs}
          showLines={6}
          columns={1}
          labelLayout="float"
          useColon={false}
          style={{ height: '100%' }}
        >
          <Output name="sourceCode" />
          <Output name="sourceCodeMeaning" />
        </Form>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  const lineColumns = [
    { name: 'fieldType', width: 120, lock: 'left' },
    { name: 'fieldCode', width: 140, lock: 'left' },
    { name: 'fieldName', width: 140, lock: 'left' },
    { name: 'gridSeq', width: 80 },
    { name: 'showFieldFlag', width: 150 },
    { name: 'fieldEditable', width: 150 },
    { name: 'fieldRequired', width: 150 },
    { name: 'gridFixed', width: 120 },
    { name: 'enabledFlag', width: 150 },
    { name: 'fieldWidget', width: 150 },
    {
      name: 'componentDetail',
      width: 150,
      renderer: ({ record }) =>
        ['LOV', 'SELECT'].includes(record.get('fieldWidget')) && (
          <a onClick={() => openModal(record)}>
            {intl.get('sprm.forecastMgt.model.common.modalLovDetail').d('组件类型详情')}
          </a>
        ),
    },
    { name: 'gridWidth', width: 150 },
    {
      name: 'supplierEditable',
      width: 150,
    },
    {
      name: 'supplierDisplayFlag',
      width: 150,
    },
    { name: 'supplierRequired', width: 150 },
  ];
  return (
    <Table dataSet={listDs} columns={lineColumns} style={{ maxHeight: `calc(100vh - 400px)` }} />
  );
};

export default DynamicColConfig;
