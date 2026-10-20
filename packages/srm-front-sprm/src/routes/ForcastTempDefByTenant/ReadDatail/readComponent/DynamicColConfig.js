/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2024-03-21 16:51:46
 */
import React, { useContext } from 'react';
import { Table, Form, Modal, Output, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { Tag } from 'choerodon-ui';
import { Store } from '../../Detail/stores';
import { paramsSetting } from '../../Detail/indexDs';

// const { TableRow } = Table;
const DynamicColConfig = function DynamicColConfig() {
  const { listDs, componetSetingDs, templateHeaderId } = useContext(Store);

  const handleParamsSetting = (record) => {
    const paramsDs = new DataSet(
      paramsSetting({ templateHeaderId, templateLineId: record.get('templateLineId') })
    );
    const cols = [{ name: 'lovParamName' }, { name: 'lovParamType' }, { name: 'lovValueCode' }];
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('hpfm.individual.view.message.title.valueParamsConfig').d('值集参数配置'),
      children: (
        <Table
          dataSet={paramsDs}
          columns={cols}
          customizedCode="sprm_forcast_temp_tenant_paramsCol"
          selectionMode="none"
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const openModal = (record) => {
    componetSetingDs.loadData([
      {
        sourceCode: record.get('sourceCode'),
        sourceCodeMeaning: record.get('sourceCodeMeaning'),
        type: record.get('fieldWidget'),
        fieldType: record.get('fieldType'),
      },
    ]);
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('sprm.forecastMgt.model.common.modalLovDetail').d('组件类型详情'),
      children: (
        <Form
          dataSet={componetSetingDs}
          columns={1}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          useColon={false}
          style={{ height: '100%' }}
        >
          <Output name="sourceCode" />
          <Output name="sourceCodeMeaning" />
          <Output
            name="paramsSetting"
            renderer={() => (
              <a onClick={() => handleParamsSetting(record)}>
                {intl.get('hzero.c7nProUI.Table.show_cached_records').d('查看')}
              </a>
            )}
          />
        </Form>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const lineColumns = [
    {
      name: 'enabledFlag',
      renderer: ({ value }) =>
        value === 1 ? (
          <Tag color="green" style={{ border: 'none' }}>
            {intl.get('hzero.common.status.alreadyEnabled').d('已启用')}
          </Tag>
        ) : (
          <Tag color="red" style={{ border: 'none' }}>
            {' '}
            {intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
          </Tag>
        ),
    },
    { name: 'fieldType', width: 120, lock: 'left' },
    { name: 'fieldCode', width: 140, lock: 'left' },
    { name: 'fieldName', width: 140, lock: 'left' },
    { name: 'gridSeq', width: 80 },
    { name: 'showFieldFlag', renderer: ({ value }) => yesOrNoRender(value) },
    { name: 'fieldEditable', renderer: ({ value }) => yesOrNoRender(value) },
    { name: 'fieldRequired', renderer: ({ value }) => yesOrNoRender(value) },
    { name: 'gridFixed', width: 120 },
    { name: 'fieldWidget' },
    {
      name: 'componentDetail',
      width: 150,
      renderer: ({ record }) =>
        ['LOV', 'SELECT'].includes(record.get('fieldWidget')) ? (
          <a onClick={() => openModal(record)}>
            {/* {intl.get('sprm.forecastMgt.model.common.modalLovDetail').d('组件类型详情')} */}
            {intl.get('hzero.c7nProUI.Table.show_cached_records').d('查看')}
          </a>
        ) : null,
    },
    { name: 'gridWidth', width: 150 },
    {
      name: 'supplierEditable',
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'supplierDisplayFlag',
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    { name: 'supplierRequired', renderer: ({ value }) => yesOrNoRender(value) },
  ];
  return (
    <Table
      dataSet={listDs}
      columns={lineColumns}
      style={{ maxHeight: `calc(100vh - 200px)` }}
      selectionMode="none"
      customizedCode="sprm_forcast_temp_tenant_dynamicCol"
    />
  );
};

export default DynamicColConfig;
