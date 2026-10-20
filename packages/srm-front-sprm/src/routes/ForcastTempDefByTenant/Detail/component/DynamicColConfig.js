/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:37:19
 */
import React, { useContext } from 'react';
import { Table, Lov, Form, Modal, TextField, DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { deleteTemplateLines, saveParamsSetting } from '@/services/forecastTemplateDefOrgService';
import { Store } from '../stores';
import { paramsSetting } from '../indexDs';
import styles from '../index.less';
// import '../index.less'

// const { TableRow } = Table;
const DynamicColConfig = function DynamicColConfig() {
  const { listDs, lookupAgain, componetSetingDs, changeFlag, templateHeaderId } = useContext(Store);

  // 删除采购申请行
  const handleLineDelete = () => {
    const { selected } = listDs;
    const deleUpdateArr = selected.filter((ele) => ele.get('templateLineId'));
    if (deleUpdateArr.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: (
          <div>
            {intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d('确认删除选中行？')}
          </div>
        ),
        onOk: async () => {
          const deleteLine = deleUpdateArr.map((ele) => ele.toJSONData());
          await deleteTemplateLines(deleteLine).then((res) => {
            if (res && !res.failed) {
              listDs.unSelectAll();
              listDs.clearCachedSelected();
              lookupAgain();
              notification.success();
            }
          });
        },
      });
    } else {
      listDs.remove(selected);
    }
  };

  const handleParamsSetting = (record) => {
    const paramsDs = new DataSet(
      paramsSetting({ templateHeaderId, templateLineId: record.get('templateLineId') })
    );
    const cols = [
      { name: 'lovParamName', editor: true },
      { name: 'lovParamType', editor: true },
      { name: 'lovValueCode', editor: true },
    ];
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('sprm.forecastMgt.model.common.modalLovDetail').d('组件类型详情'),
      children: (
        <Table
          dataSet={paramsDs}
          columns={cols}
          customizedCode="sprm_forcast_temp_tenant_paramsCol"
          buttons={[
            [
              'add',
              {
                name: 'add',
                onClick: () => {
                  paramsDs.create({}, 0);
                },
              },
            ],
            [
              'delete',
              {
                name: 'delete',
                onClick: () => {
                  const { selected } = paramsDs;
                  paramsDs.remove(selected, true);
                },
              },
            ],
          ]}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: async () => {
        const validateFlag = await paramsDs.validate();
        if (validateFlag) {
          const data = paramsDs.toJSONData();
          const result = getResponse(
            await saveParamsSetting({ data, templateLineId: record.get('templateLineId') })
          );
          if (result && result?.failed) {
            return false;
          }
        }
      },
      onCancel: () => { },
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
    // compon
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('hpfm.individual.view.message.title.valueParamsConfig').d('值集参数配置'),
      children: (
        <Form
          dataSet={componetSetingDs}
          showLines={6}
          columns={1}
          labelLayout="float"
          useColon={false}
        >
          <Lov name="sourceCode" />
          <TextField name="sourceCodeMeaning" />
          <div className={styles['sprm-output-edit-wrap']}>
            <span>{intl.get(`sprm.forecastMgt.model.common.paramsSetting`).d('值集参数')}</span>
            <a onClick={() => handleParamsSetting(record)} disabled={!record.get('templateLineId')}>
              {/* {intl.get('hzero.common.model.edit').d('编辑')} */}
              {intl.get(`sprm.forecastMgt.model.common.paramsSettingEdit`).d('值集参数编辑')}
            </a>
          </div>
        </Form>
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => handleSetComponet(record),
      onCancel: () => { },
    });
  };

  const handleSetComponet = (record) => {
    const data = componetSetingDs.toJSONData();
    const { sourceCode, sourceCodeMeaning } = data[0];
    record.set({ sourceCode, sourceCodeMeaning });
  };

  const lineColumns = [
    { name: 'enabledFlag', width: 150, editor: true },
    { name: 'fieldType', width: 120, editor: !changeFlag, lock: 'left' },
    { name: 'fieldCode', width: 140, editor: true, lock: 'left' },
    { name: 'fieldName', width: 140, editor: true, lock: 'left' },
    { name: 'gridSeq', width: 80, editor: true },
    { name: 'showFieldFlag', editor: true },
    { name: 'fieldEditable', editor: true },
    { name: 'fieldRequired', editor: true },
    { name: 'gridFixed', width: 120, editor: true },
    { name: 'fieldWidget', width: 150, editor: true },
    {
      name: 'componentDetail',
      width: 150,
      renderer: ({ record }) =>
        ['LOV', 'SELECT'].includes(record.get('fieldWidget')) ? (
          <a onClick={() => openModal(record)}>
            {intl.get('hzero.common.model.edit').d('编辑')}
            {/* {intl.get('sprm.forecastMgt.model.common.modalLovDetail').d('组件类型详情')} */}
          </a>
        ) : null,
    },
    { name: 'gridWidth', width: 150, editor: true },
    {
      name: 'supplierEditable',
      width: 150,
      editor: (record) => record.get('fieldType') === 'EXPAND',
    },
    {
      name: 'supplierDisplayFlag',
      width: 150,
      editor: true,
    },
    { name: 'supplierRequired', editor: true },
  ];

  const handleLineAdd = () => {
    listDs.create({}, 0);
  };

  return (
    <Table
      dataSet={listDs}
      columns={lineColumns}
      style={{ maxHeight: `calc(100vh - 230px)` }}
      customizedCode="sprm_forcast_temp_tenant_dynamicCol"
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
