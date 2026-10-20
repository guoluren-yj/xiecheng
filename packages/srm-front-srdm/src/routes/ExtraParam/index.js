import { TextField, Select, Form, Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import formatterCollections from 'utils/intl/formatterCollections';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, dataSourceDSConfig, extraParamDSConfig } from './extensionRule.js';
import getDataSourceDSProps from './dataSourceDS.js';
import getExtraParamDSProps from './extraParamDS.js';

@formatterCollections({ code: ['hpdm.extra-param', 'hpdm.data-source'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    const { params } = props.match;
    const { routeDsId } = params;
    this.setDs(
      'dataSourceDS',
      new DataSet(dataSourceDSConfig.bind(this)(getDataSourceDSProps.bind(this)({ routeDsId })))
    );
    this.setDs(
      'extraParamDS',
      new DataSet(extraParamDSConfig.bind(this)(getExtraParamDSProps.bind(this)({ routeDsId })))
    );
    initComponent.bind(this)();
  }

  componentDidMount() {
    componentDidMount.bind(this)();
  }

  openModal(record, isNew) {
    let isCancel = false;
    Modal.open({
      drawer: true,
      children: (
        <Form record={record} useColon>
          <Select name="configCategory" />
          <TextField name="configName" />
          <TextField name="configValue" />
          <Select name="configType" />
          <Select name="enabledFlag" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('extraParamDS').submit();
          this.getDs('extraParamDS').query(this.getDs('extraParamDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('extraParamDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('extraParamDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  createHandler() {
    this.openModal(
      this.getDs('extraParamDS').create({ routeDsId: this.props.match.params.routeDsId }, 0),
      true
    );
  }

  async deleteOperation(record) {
    await this.getDs('extraParamDS').delete(record);
    this.getDs('extraParamDS').query();
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hpdm.extra-param.header.title').d('额外参数')}
          backPath="/srdm/data-source"
        />
        <Content data-hcg_flag="Content_b511a">
          <Form
            label="表单"
            columns={3}
            useColon
            labelWidth={100}
            labelLayout="horizontal"
            dataSet={this.getDs('dataSourceDS')}
          >
            <TextField name="datasourceName" />
            <TextField name="driverClassName" />
            <TextField name="url" />
            <TextField name="username" />
            <TextField name="comments" />
            <Select name="enabledFlag" />
          </Form>
          <Table
            data-hcg_flag="Table_9edfa"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnHideable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_9edfa"
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'configCategory',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'configName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'configValue',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'configType',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                header: intl.get('hpdm.extra-param.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a onClick={() => this.editHandler(record)} style={{ marginRight: '0.1rem' }}>
                      {intl.get('hpdm.extra-param.operation.edit').d('编辑')}
                    </a>,
                    <a
                      onClick={() => this.deleteOperation(record)}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.extra-param.operation.delete').d('删除')}
                    </a>
                  );
                  return btns;
                },
              },
            ]}
            buttons={[
              <Button funcType="raised" color="primary" onClick={() => this.createHandler()}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>,
              <Button
                funcType="raised"
                color="default"
                onClick={() => this.getDs('extraParamDS').query()}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>,
            ]}
            dataSet={this.getDs('extraParamDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
