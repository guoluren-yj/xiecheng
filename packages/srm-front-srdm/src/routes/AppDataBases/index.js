import { TextField, Select, Form, Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import formatterCollections from 'utils/intl/formatterCollections';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, appEnvDSConfig, dataBasesDSConfig } from './extensionRule.js';
import getAppEnvDSProps from './appEnvDS.js';
import getDataBasesDSProps from './dataBasesDS.js';

@formatterCollections({ code: ['hpdm.app-databases', 'hpdm.app-env'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    const { params } = props.match;
    const { appEnvId } = params;
    this.setDs(
      'appEnvDS',
      new DataSet(appEnvDSConfig.bind(this)(getAppEnvDSProps.bind(this)({ appEnvId })))
    );
    this.setDs(
      'dataBasesDS',
      new DataSet(dataBasesDSConfig.bind(this)(getDataBasesDSProps.bind(this)({ appEnvId })))
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
        <Form record={record} useColon labelLayout="float">
          <Select name="schemaName" />
          <TextField name="schemaDesc" />
          <Select name="routeDsId" noCache />
          <Select name="enabledFlag" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('dataBasesDS').submit();
          this.getDs('dataBasesDS').query(this.getDs('dataBasesDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('dataBasesDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('dataBasesDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  createHandler() {
    this.openModal(
      this.getDs('dataBasesDS').create({ appEnvId: this.props.match.params.appEnvId }, 0),
      true
    );
  }

  async deleteOperation(record) {
    await this.getDs('dataBasesDS').delete(record);
    this.getDs('dataBasesDS').query();
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hpdm.app-databases.header.title').d('环境数据源')}
          backPath="/srdm/app-env"
        />
        <Content data-hcg_flag="Content_b511a">
          <Form
            label="表单"
            columns={3}
            useColon
            labelWidth={100}
            labelLayout="horizontal"
            dataSet={this.getDs('appEnvDS')}
          >
            <TextField name="environmentCode" />
            <TextField name="environmentName" />
            <TextField name="environmentDesc" />
            <Select name="prodFlag" />
            <Select name="verifyFlag" />
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
                name: 'schemaName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'schemaDesc',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'routeDsId',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                header: intl.get('hpdm.app-databases.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a onClick={() => this.editHandler(record)} style={{ marginRight: '0.1rem' }}>
                      {intl.get('hpdm.app-databases.operation.edit').d('编辑')}
                    </a>,
                    <a
                      onClick={() => this.deleteOperation(record)}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.app-databases.operation.delete').d('删除')}
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
                onClick={() => this.getDs('dataBasesDS').query()}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>,
            ]}
            dataSet={this.getDs('dataBasesDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
