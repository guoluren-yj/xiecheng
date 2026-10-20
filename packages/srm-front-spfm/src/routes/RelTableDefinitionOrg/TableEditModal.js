/**
 * TableEditModal.js
 * index.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import {
  Form,
  TextField,
  Lov,
  CheckBox,
  Table,
  Select,
  IntlField,
  Button,
  Modal,
  NumberField,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Card } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

function TableEditModal(props = {}) {
  const { dataSet, isEditFlag = false, tableDefineJsonDs = {} } = props;

  const DefaultValue = observer((propsParam) => {
    const { record, ...otherProps } = propsParam;
    const _component = record.get('_component');
    if (_component === 'lov') {
      return <Lov {...otherProps} />;
    } else if (_component === 'lookup' || _component === 'checkBox') {
      return <Select {...otherProps} />;
    } else if (_component === 'number') {
      return <NumberField {...otherProps} />;
    } else {
      return <TextField {...otherProps} />;
    }
  });

  const handleModal = (title, record) => {
    const _tls = record.get('_tls');
    const label = record.get('label');
    // 如果_tls不存在，则使用当前值自动创建
    if (!_tls) {
      record.set('_tls', {
        label: {
          zh_CN: label,
          en_US: label,
          ja_JP: label,
          ru_RU: label,
        },
      });
    }
    Modal.open({
      key: Modal.key(),
      title,
      closable: false,
      okCancel: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 800 },
      // onCancel: () => {
      //   if (record.status === 'add') {
      //     tableDefineJsonDs.delete(record, false);
      //   } else {
      //     record.reset();
      //   }
      // },
      children: (
        <Form record={record} labelLayout="float" disabled={isEditFlag}>
          <NumberField name="_priority" />
          <TextField
            name="name"
            help={intl
              .get('spfm.relTableDefinition.view.tooltip.name')
              .d('请输入字母与数字组合，且必须以字母开头！')}
            showHelp="tooltip"
          />
          {/* <Select name="type" /> */}
          <IntlField name="label" />
          <Select name="_component" />
          <Lov name="lov" />
          <Lov name="lookup" />
          <TextField name="textField" />
          <TextField name="valueField" />
          <CheckBox name="multiple" />
          <CheckBox name="required" />
          <CheckBox name="disabled" />
          <CheckBox name="__unique" />
          <CheckBox name="_conditionField" />
          <CheckBox name="__isHidden" />
          <TextField name="pattern" />
          <DefaultValue record={record} name="defaultValue" style={{ width: '100%' }} />
        </Form>
      ),
    });
  };

  const columns = [
    {
      name: 'action',
      width: 100,
      renderer: ({ record }) => (
        <a
          onClick={() => {
            // eslint-disable-next-line
            record.status = 'update';
            handleModal(intl.get('hzero.common.button.edit').d('编辑'), record);
          }}
        >
          {intl.get('hzero.common.button.edit').d('编辑')}
        </a>
      ),
    },
    {
      name: '_priority',
      width: 80,
    },
    {
      name: 'name',
      width: 150,
    },
    // {
    //   name: 'type',
    //   width: 120,
    // },
    {
      name: 'label',
      width: 150,
    },
    {
      name: '_component',
      width: 200,
      renderer: ({ text }) => {
        if (text === 'codeArea-json') {
          return 'JSON';
        } else if (text === 'codeArea-javascript') {
          return 'JavaScript';
        } else {
          return text;
        }
      },
    },
    {
      name: 'lov',
      width: 200,
    },
    {
      name: 'lookup',
      width: 200,
    },
    {
      name: 'textField',
      width: 200,
    },
    {
      name: 'valueField',
      width: 200,
    },
    {
      name: 'multiple',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value ? 1 : 0),
    },
    {
      name: 'required',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value ? 1 : 0),
    },
    {
      name: 'disabled',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value ? 1 : 0),
    },
    {
      name: '__unique',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value ? 1 : 0),
    },
    {
      name: '_conditionField',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value ? 1 : 0),
    },
    {
      name: '__isHidden',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value ? 1 : 0),
    },
    {
      name: 'pattern',
      width: 200,
    },
    {
      name: 'defaultValue',
      width: 200,
    },
  ];
  const renderAddBtn = () => {
    return (
      <Button
        funcType="flat"
        icon="add"
        onClick={() => {
          tableDefineJsonDs.create();
          handleModal(intl.get('hzero.common.button.add').d('新建'), tableDefineJsonDs.current);
        }}
      >
        {intl.get('hzero.common.button.add').d('新建')}
      </Button>
    );
  };

  const buttons = [renderAddBtn(), 'delete'];

  return (
    <React.Fragment>
      <Form dataSet={dataSet} columns={3} labelWidth={200} disabled={isEditFlag}>
        <TextField
          colSpan={1}
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.tableCode')
            .d('配置表编码')}
          name="tableCode"
          required
          disabled={dataSet.current && dataSet.current.get('id')}
        />
        <IntlField
          colSpan={1}
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.tableName')
            .d('配置表名')}
          labelWidth={150}
          name="tableName"
          required
        />
        <TextField
          colSpan={1}
          label={intl.get('spfm.relTableDefinition.model.relTableDefinition.description').d('描述')}
          name="description"
          required
        />
        <Select name="module" />
        <CheckBox
          colSpan={1}
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.supplierIsolation')
            .d('供应商隔离')}
          name="supplierIsolation"
          required
        />
      </Form>
      <Card
        title={intl
          .get('spfm.relTableDefinition.model.relTableDefinition.mappingJson')
          .d('表定义JSON数据')}
      >
        <Table
          buttons={isEditFlag ? [] : buttons}
          dataSet={tableDefineJsonDs}
          columns={columns}
          style={{ maxHeight: 'calc(100vh - 290px)' }}
        />
      </Card>
    </React.Fragment>
  );
}

export default TableEditModal;
