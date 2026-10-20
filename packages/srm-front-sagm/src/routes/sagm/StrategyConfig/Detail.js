import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Form,
  Table,
  Spin,
  TextField,
  Lov,
  Select,
  Switch,
  Tabs,
  IntlField,
  // Button,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
// import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { CODE } from 'utils/regExp';

import { saveStrategy } from './api';

export default class Detail extends Component {
  constructor(props) {
    super(props);

    const { modal } = props;

    modal.handleOk(() => {
      return this.handleSave();
    });
  }

  formDs = new DataSet({
    fields: [
      {
        name: 'strategyDimensionCode',
        type: 'string',
        required: true,
        pattern: CODE,
        defaultValidationMessages: {
          patternMismatch: intl
            .get('hzero.common.validation.code')
            .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
        },
        label: intl.get('sagm.strategy.view.dimensionCode').d('维度编码'),
        computedProps: {
          disabled: ({ record }) => record.get('strategyDimensionId'),
        },
      },
      {
        name: 'strategyDimensionName',
        type: 'intl',
        required: true,
        label: intl.get('sagm.strategy.view.dimensionName').d('维度名称'),
      },
      {
        name: 'strategyType',
        type: 'string',
        required: true,
        lookupCode: 'SAGM.STRATEGY_TYPE',
        label: intl.get('sagm.strategy.view.dimensionCategory').d('维度分类'),
      },
      {
        name: 'componentType',
        type: 'string',
        required: true,
        lookupCode: 'SAGM.COMPONENT_TYPE',
        label: intl.get('sagm.common.view.componentType').d('组件类型'),
      },
      {
        name: 'lovCode',
        type: 'object',
        required: true,
        lovCode: 'HPFM.LOV_VIEW',
        textField: 'viewCode',
        label: intl.get('sagm.common.view.valueCode').d('值集编码'),
        transformResponse: (_, record) => {
          return record.strategyDimensionId
            ? {
                viewCode: record.lovCode,
              }
            : null;
        },
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hzero.common.status.isEnable').d('是否启用'),
      },
    ],
    transport: {
      read: {
        url: '/sagm/v1/strategy-dimensions',
        method: 'GET',
      },
    },
  });

  tableDs = new DataSet({
    autoQuery: false,
    fields: [
      {
        name: 'sourceCode',
        type: 'string',
        label: intl.get('sagm.common.view.fieldSource').d('字段来源'),
        lookupCode: 'SAGM.SOURCE_CODE',
        required: true,
      },
      {
        name: 'fieldName',
        type: 'string',
        required: true,
        label: intl.get('sagm.common.view.fieldName').d('字段名'),
      },
      {
        name: 'fieldDesc',
        type: 'string',
        required: true,
        label: intl.get('sagm.common.view.fieldDesc').d('字段描述'),
      },
    ],
    transport: {
      read: {
        url: '/sagm/v1/strategy-field-mappings',
        method: 'GET',
      },
      destroy: {
        url: '/sagm/v1/strategy-field-mappings',
        method: 'DELETE',
      },
    },
  });

  columns = [
    { name: 'sourceCode', width: 120, editor: true },
    { name: 'fieldName', width: 200, editor: true },
    { name: 'fieldDesc', editor: true },
  ];

  buttons = ['add', ['delete', { color: 'red' }]];

  componentDidMount() {
    const { type = 'create' } = this.props;
    if (type === 'create') {
      this.formDs.create({});
    } else {
      this.initData();
    }
  }

  @Bind
  initData() {
    const { type } = this.props;
    this.formDs.setQueryParameter('strategyDimensionId', type);
    this.tableDs.setQueryParameter('strategyDimensionId', type);
    this.formDs.query();
    this.tableDs.query();
  }

  @Bind
  async handleSave() {
    const { onFetchList = (e) => e, type } = this.props;
    const formData = this.formDs.current;
    const headerFlag = await formData.validate();
    const mapFlag = await this.tableDs.validate();
    if (headerFlag && mapFlag) {
      const header = formData.toData();
      const { lovCode, ...other } = header;
      const mapList = [];
      this.tableDs.forEach((record) => {
        if (record.status === 'add' || record.status === 'update') {
          mapList.push(record.toData());
        }
      });
      const params = [
        {
          ...other,
          lovCode: lovCode.viewCode,
          strategyFieldMappings: mapList,
        },
      ];
      const res = await saveStrategy(params);
      const result = getResponse(res);
      if (result) {
        onFetchList(type);
        notification.success();
        return true;
      }
    }
    return false;
  }

  render() {
    return (
      <Fragment>
        <Spin dataSet={this.formDs}>
          <Form dataSet={this.formDs} columns={2}>
            <TextField name="strategyDimensionCode" />
            <IntlField name="strategyDimensionName" />
            <Select name="strategyType" />
            <Switch name="enabledFlag" />
            <Select name="componentType" />
            <Lov name="lovCode" />
          </Form>
        </Spin>
        <Tabs>
          <Tabs.TabPane tab={intl.get('sagm.common.view.mapLink').d('映射关系')}>
            <Table dataSet={this.tableDs} columns={this.columns} buttons={this.buttons} />
          </Tabs.TabPane>
        </Tabs>
      </Fragment>
    );
  }
}
