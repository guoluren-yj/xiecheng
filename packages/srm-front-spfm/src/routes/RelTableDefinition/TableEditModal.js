/**
 * TableEditModal.js
 * index.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect } from 'react';
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
  CodeArea,
  Icon,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Card, Tooltip } from 'choerodon-ui';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';

// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
// import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import { JSHINT } from 'jshint';
import 'codemirror/addon/lint/javascript-lint';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/sql-hint.js';
import 'codemirror/theme/material.css';

window.JSHINT = JSHINT;

const jsonOptions = { mode: { name: 'javascript', json: true }, theme: 'material' }; // 代码框的 json 的配置信息
const jsOptions = { name: 'javascript', theme: 'material' }; // 代码框的 js 的配置信息
const sqlOptions = { mode: { name: 'text/x-mysql' }, theme: 'material' }; // 代码框的 sql 配置信息

function TableEditModal(props = {}) {
  const {
    dataSet,
    isEditFlag = false,
    tableDefineJsonDs = {},
    tenantFlag = false,
    tenantDataSourceFlag = false,
    indexStatusFlag = false,
    defaultShowSyncMultiCloud = false,
  } = props;
  const [showTenant, handleShowTenant] = useState(tenantFlag);
  const { loginName } = getCurrentUser();
  const currentOrganizationId = getCurrentOrganizationId();
  const [showSyncMultiCloud, setShowSyncMultiCloud] = useState(defaultShowSyncMultiCloud);

  useEffect(() => {
    if (isEditFlag && tenantDataSourceFlag) {
      tableDefineJsonDs.setState('tenantFlag', 'tenant');
    } else {
      tableDefineJsonDs.setState('tenantFlag', '');
    }
  }, [isEditFlag, tenantDataSourceFlag]);

  const changePermission = (value) => {
    if (value === '0') {
      dataSet.current.set('syncMultiCloudFlag', false);
    } else {
      // 清理同步到多云数据
      dataSet.current.set('syncMultiCloudFlag', undefined);
    }
    setShowSyncMultiCloud(value === '0');
    handleShowTenant(value === '2');
    if (value === '2' && !isEditFlag) {
      tableDefineJsonDs.setState('tenantFlag', 'tenant');
    } else {
      tableDefineJsonDs.setState('tenantFlag', '');
    }
  };

  const DefaultValue = observer((propsParam) => {
    const { record, ...otherProps } = propsParam;
    const _component = record.get('_component');
    if (_component === 'lov') {
      return <Lov {...otherProps} />;
    } else if (_component === 'lookup' || _component === 'checkBox') {
      return <Select {...otherProps} />;
    } else if (_component === 'number') {
      return <NumberField {...otherProps} />;
    } else if (_component === 'codeAreaJson') {
      return <CodeArea {...otherProps} options={jsonOptions} format={JSONFormatter} />;
    } else if (_component === 'codeAreaJavaScript') {
      return <CodeArea {...otherProps} options={jsOptions} format={JSFormatter} />;
    } else if (_component === 'codeAreaSql') {
      return <CodeArea {...otherProps} options={sqlOptions} />;
    } else if (_component === 'upload') {
      return '';
    } else {
      return <TextField {...otherProps} />;
    }
  });

  const handleModal = (title, record, dataSets) => {
    if (showTenant && tenantDataSourceFlag && !record.get('labelType')) {
      record.set('labelType', 'longvalue');
    }
    if (!showTenant && indexStatusFlag && !record.get('labelType')) {
      record.set('labelType', 'longvalue');
    }
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
      destroyOnClose: true,
      drawer: true,
      style: { width: 800 },
      okCancel: true,
      onCancel: () => {
        if (record.status === 'add') {
          tableDefineJsonDs.delete(record, false);
        } else {
          record.reset();
        }
      },
      onOk: async () => {
        const recordValidateResult = await record.validate();
        if (!recordValidateResult) {
          notification.warning({
            message: intl.get('hzero.common.validation.format').d('数据格式校验不通过	'),
          });
          return false;
        }
        if (dataSets && dataSets.records) {
          const currentNumber = record.get('number');
          const allRecord = dataSets.records.filter((item) => item.get('number') === currentNumber);
          if (allRecord.length > 1) {
            const longValueRecord = allRecord.filter(
              (item) => item.get('labelType') === 'longvalue'
            );
            const valueRecord = allRecord.filter((item) => item.get('labelType') === 'value');

            if (longValueRecord.length > 1) {
              notification.warning({
                message: intl
                  .get('spfm.relTableDefinition.view.message.waring.longvalue')
                  .d('存在序号相同的长值，请使用不同的序号'),
              });
              return false;
            }
            if (valueRecord.length > 1) {
              notification.warning({
                message: intl
                  .get('spfm.relTableDefinition.view.message.waring.value')
                  .d('存在序号相同的值，请使用不同的序号'),
              });
              return false;
            }
          }
        }
      },
      children: (
        <Form record={record} labelLayout="float">
          <NumberField name="_priority" />
          {!((showTenant && tenantDataSourceFlag) || (!showTenant && indexStatusFlag)) && (
            <Select name="labelType" />
          )}
          <NumberField name="number" />
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
          {currentOrganizationId === 0 && loginName === 'admin' && (
            <CodeArea
              name="computedProps"
              options={jsOptions}
              format={JSFormatter}
              style={{ height: 300 }}
              help="⚠️ 🚫此功能为试验阶段，除特殊人员外禁止使用！"
            />
          )}
        </Form>
      ),
    });
  };

  const columns = [
    {
      name: 'action',
      width: 100,
      renderer: ({ record, dataSet: recordDataSet }) => (
        <a
          onClick={() => {
            // eslint-disable-next-line
            record.status = 'update';
            handleModal(intl.get('hzero.common.button.edit').d('编辑'), record, recordDataSet);
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
    ...((showTenant && tenantDataSourceFlag) || (!showTenant && indexStatusFlag)
      ? []
      : [
          {
            name: 'labelType',
            width: 100,
          },
        ]),
    {
      name: 'number',
      width: 100,
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
      width: 120,
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
    // 加密方式 暂时注释
    // {
    //   name: '_encryption',
    //   width: 200,
    // },
  ];
  const renderAddBtn = () => {
    return (
      <Button
        funcType="flat"
        icon="add"
        onClick={() => {
          tableDefineJsonDs.create();
          handleModal(
            intl.get('hzero.common.button.add').d('新建'),
            tableDefineJsonDs.current,
            tableDefineJsonDs
          );
        }}
      >
        {intl.get('hzero.common.button.add').d('新建')}
      </Button>
    );
  };

  const buttons = [renderAddBtn(), 'delete'];

  return (
    <React.Fragment>
      <Form dataSet={dataSet} columns={3} labelWidth={200}>
        <TextField
          colSpan={1}
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.tableCode')
            .d('配置表编码')}
          name="tableCode"
          required
          disabled={isEditFlag}
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
        <Select name="permission" onChange={changePermission} disabled={isEditFlag} />
        <Select name="module" />
        {showTenant && <Lov name="tenant" colSpan={1} disabled={isEditFlag} />}
        {/* <CheckBox
          colSpan={1}
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.platformOnly')
            .d('是否仅平台可用')}
          disabled={editEnableFlag || isEditFlag}
          name="platformOnly"
          required
        /> */}
        {/* <Select
          colSpan={1}
          name="dataSource"
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.datasource')
            .d('数据源')}
        /> */}
        <CheckBox
          newLine
          colSpan={1}
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.noCreation')
            .d('租户无法新建行数据')}
          name="noCreation"
          required
        />
        <CheckBox
          colSpan={1}
          label={
            <span>
              {intl
                .get('spfm.relTableDefinition.model.relTableDefinition.saveHistory')
                .d('历史记录')}
              <Tooltip
                title={intl
                  .get('spfm.relTableDefinition.model.saveHistory.help')
                  .d('历史记录仅留存20条，另有需求，请联系管理员')}
              >
                <Icon type="help" />
              </Tooltip>
            </span>
          }
          name="saveHistory"
          required
        />
        {showTenant && (
          <CheckBox
            colSpan={1}
            label={intl
              .get('spfm.relTableDefinition.model.relTableDefinition.supplierIsolation')
              .d('供应商隔离')}
            name="supplierIsolation"
            required
          />
        )}
        {/* {showPlatformOnly && (
          <CheckBox
            colSpan={1}
            label={intl
              .get('spfm.relTableDefinition.model.relTableDefinition.platformOnly')
              .d('是否仅平台可见')}
            name="platformOnly"
            required
          />
        )} */}
        {/* <CodeArea
          dataSet={dataSet}
          name="mappingJson"
          label={intl
            .get('spfm.relTableDefinition.model.relTableDefinition.mappingJson')
            .d('表定义JSON数据')}
          options={options}
          formatter={JSONFormatter}
          style={style}
          movable={false}
          required
        /> */}
        {showSyncMultiCloud && (
          <CheckBox
            name="syncMultiCloudFlag"
            required
            label={
              <span>
                {intl
                  .get('spfm.relTableDefinition.model.relTableDefinition.syncMultiCloudFlag')
                  .d('同步表数据至多云环境')}
                <Tooltip
                  title={intl
                    .get('spfm.relTableDefinition.model.relTableDefinition.syncMultiCloudFlag.help')
                    .d(
                      '当前配置替代原"同步到多云环境配置表清单"功能，勾选此配置表示当前配置表存储的数据需要同步至多云环境，和配置表定义是否同步至多云无关，新建配置表的技术请慎重评估或与组长沟通是否勾选此选项'
                    )}
                >
                  <Icon type="help" />
                </Tooltip>
              </span>
            }
          />
        )}
      </Form>
      <Card
        title={intl
          .get('spfm.relTableDefinition.model.relTableDefinition.mappingJson')
          .d('表定义JSON数据')}
      >
        <Table
          buttons={buttons}
          dataSet={tableDefineJsonDs}
          columns={columns}
          style={{ maxHeight: 'calc(100vh - 290px)' }}
        />
      </Card>
    </React.Fragment>
  );
}

export default TableEditModal;
