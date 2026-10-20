/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:39:40
 */
import React, { useContext } from 'react';
import { Table, Lov, Form, Modal, TextField } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { Store } from '../stores';
import { deleteTemplateLines } from '@/services/forecastTemplateDefService';

const DynamicColConfig = function DynamicColConfig() {
  const { listDs, lookupAgain, componetSetingDs } = useContext(Store);

  // 删除采购申请行
  const handleLineDelete = () => {
    const { selected } = listDs;
    const deleUpdateArr = selected.filter(ele => ele.get('templateLineId'));
    if (deleUpdateArr.length > 0) {
      const deleteLine = deleUpdateArr?.map(ele => ele.toJSONData());
      deleteTemplateLines(deleteLine).then(res => {
        if (res && !res.failed) {
          listDs.unSelectAll();
          listDs.clearCachedSelected();
          lookupAgain();
          notification.success();
        }
      });
    } else {
      listDs.remove(selected);
    }
  };

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
          <Lov name="sourceCode" />
          <TextField name="sourceCodeMeaning" />
        </Form>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      // onOk: () => {},
      // okText: intl.get('hzero.common.status.closed').d('关闭'),
      // footer: (okBtn) => okBtn,
      onOk: () => handleSetComponet(record),
      onCancel: () => {},
    });
  };

  const handleSetComponet = record => {
    const data = componetSetingDs.toJSONData();
    const { sourceCode, sourceCodeMeaning } = data[0];
    record.set({ sourceCode, sourceCodeMeaning });
  };

  // const fieldCodeSelector = []

  const lineColumns = [
    { name: 'fieldType', width: 120, editor: true, lock: 'left' },
    { name: 'fieldCode', width: 140, editor: true, lock: 'left' },
    { name: 'fieldName', width: 140, editor: true, lock: 'left' },
    { name: 'gridSeq', width: 80, editor: true },
    { name: 'showFieldFlag', width: 150, editor: true },
    { name: 'fieldEditable', width: 150, editor: true },
    { name: 'fieldRequired', width: 150, editor: true },
    { name: 'gridFixed', width: 120, editor: true },
    { name: 'enabledFlag', width: 150, editor: true },
    { name: 'fieldWidget', width: 150, editor: true },
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
    { name: 'gridWidth', width: 150, editor: true },
    {
      name: 'supplierEditable',
      editor: true,
      width: 150,
    },
    {
      name: 'supplierDisplayFlag',
      editor: true,
      width: 150,
    },
    { name: 'supplierRequired', width: 150, editor: true },
  ];

  const handleLineAdd = () => {
    listDs.create({}, 0);
  };

  return (
    <Table
      dataSet={listDs}
      columns={lineColumns}
      style={{ maxHeight: `calc(100vh - 400px)` }}
      buttons={[
        ['add', { name: 'add', onClick: () => handleLineAdd() }],
        [
          'delete',
          {
            name: 'delete',
            onClick: () => handleLineDelete(),
          },
        ],
      ]}
    />
  );
};

export default DynamicColConfig;
