/**
 * EditModal.js
 * index.js
 * @date: 2020-08-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect } from 'react';
import {
  Form,
  TextField,
  IntlField,
  Table,
  // Modal,
  // CodeArea,
  // DataSet,
  Select,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

// import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
// import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
// import { isJSON } from './util';
// import { importEntityDefineData } from '@/services/entityDefineService';
// 引入格式化器
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
import 'codemirror/theme/material.css';

// const importModalKey = Modal.key();
// const jsonOptions = { mode: { name: 'javascript', json: true } }; // 代码框的 json 的配置信息

function EditModal(props = {}) {
  const { dataSet, tableDs, isEditFlag = false, readOnly = false } = props;

  // const handleLabelValue = (record, value) => {
  //   record.getField('number').set('required', value === 'value');
  //   record.set('number', '');
  // };

  useEffect(() => {
    tableDs.addEventListener('update', handleUpdate);
  }, []);

  const handleUpdate = ({ record, name, value }) => {
    if (name === 'valueType') {
      record.set('pattern', value === 'number' ? '(\\-|\\+)?\\d+(\\.\\d+)?' : '');
      record.set('mockValue', '');
    }
  };

  // const importEntityDs = new DataSet({
  //   autoCreate: true,
  //   fields: [
  //     {
  //       name: 'importEntity',
  //       type: 'string',
  //     },
  //   ],
  // });

  /**
   * 设置导入字段数据
   * @param {Function} resolve
   * @param {Function} reject
   */
  // const setImportEntity = (resolve, reject) => {
  //   const { importEntity } = importEntityDs.current.toJSONData();
  //   if (isJSON(importEntity)) {
  //     importEntityDefineData(JSON.parse(importEntity)).then(res => {
  //       if (getResponse(res)) {
  //         tableDs.loadData(res);
  //         resolve();
  //       } else reject();
  //     });
  //   } else {
  //     reject();
  //   }
  // };

  /**
   * 导入
   */
  // const importEntity = () => {
  //   Modal.open({
  //     key: importModalKey,
  //     title: intl.get('spfm.entityDefine.view.modal.import.title').d('字段定义导入'),
  //     children: (
  //       <CodeArea
  //         dataSet={importEntityDs}
  //         name="importEntity"
  //         options={jsonOptions}
  //         format={JSONFormatter}
  //         style={{ height: 600 }}
  //       />
  //     ),
  //     onOk: () => new Promise((resolve, reject) => setImportEntity(resolve, reject)),
  //     closable: true,
  //     okCancel: true,
  //     destroyOnClose: true,
  //     style: { width: 800 },
  //   });
  // };
  const columns = [
    {
      name: 'valueType',
      width: 100,
      editor: true,
    },
    {
      name: 'name',
      width: 150,
      editor: record => !record?.get('structureId'),
    },
    {
      name: 'description',
      width: 150,
      editor: true,
    },
    {
      name: 'tableCode',
      width: 150,
      editor: true,
    },
    {
      name: 'tableFieldCode',
      width: 150,
      editor: true,
    },
    {
      name: 'pattern',
      width: 150,
      editor: true,
    },
    {
      name: 'mockValue',
      width: 150,
      editor: true,
    },
    {
      name: 'componentType',
      width: 200,
      editor: true,
    },
    {
      name: 'lov',
      width: 200,
      editor: true,
    },
    {
      name: 'lookup',
      width: 200,
      editor: true,
    },
    {
      name: 'textField',
      width: 200,
      editor: true,
    },
    {
      name: 'valueField',
      width: 200,
      editor: true,
    },
    {
      name: 'requiredFlag',
      width: 100,
      editor: true,
    },
    // 加密方式 暂时注释
    // {
    //   name: '_encryption',
    //   width: 200,
    //   editor: true,
    // },
  ];
  const buttons = ['add', 'delete'];

  return (
    <React.Fragment>
      {readOnly ? (
        <Table dataSet={tableDs} columns={columns} selectionMode="none" />
      ) : (
        <React.Fragment>
          <Form dataSet={dataSet}>
            <TextField
              label={intl.get('spfm.entityDefine.model.entityDefine.entityCode').d('结构编码')}
              name="entityCode"
              required
              disabled={readOnly || isEditFlag}
              autoFocus
            />
            <IntlField
              label={intl.get('spfm.entityDefine.model.entityDefine.entityName').d('结构名称')}
              name="entityName"
              required
              disabled={readOnly}
            />
            <IntlField
              label={intl.get('spfm.entityDefine.model.entityDefine.description').d('描述')}
              name="description"
              required
              disabled={readOnly}
            />
            <Select name="fieldSource" clearButton={false}>
              <Select.Option value="CONFIGURATION">
                {intl.get('spfm.entityDefine.model.entityDefine.configuration').d('字段配置')}
              </Select.Option>
              <Select.Option value="INTERFACE">
                {intl.get('spfm.entityDefine.model.entityDefine.interface').d('接口')}
              </Select.Option>
            </Select>
          </Form>
          {dataSet.current && dataSet.current.get('fieldSource') !== 'INTERFACE' && (
            <Card
              title={intl.get('spfm.entityDefine.view.edit.line.title').d('字段定义')}
              style={{ marginTop: 30 }}
              // extra={
              //   tableDs.toData().length <= 0 && (
              //     <a onClick={() => importEntity()}>
              //       <Icon type="redo" />
              //       {intl.get('hzero.common.import').d('导入')}
              //     </a>
              //   )
              // }
            >
              <Table
                dataSet={tableDs}
                columns={columns}
                buttons={buttons}
                queryFieldsLimit={2}
                // queryBar="comboBar"
                // queryBarProps={{ formProps: { labelAlign: 'left' } }}
                pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
              />
            </Card>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default observer(EditModal);
