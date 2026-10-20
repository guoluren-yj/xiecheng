import React from 'react';
import { observer } from 'mobx-react';
import { TextField, Select, Form, Button, Table, DataSet, Modal, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { configRule, configObjectDSConfig, tableStructureDSConfig } from './extensionRule.js';
import getConfigObjectContactDS from './configObjectContactDS';
import getTableStructerDSProps from '../ConfigObjectField/tableStructerDS';
import '../ConfigObjectTBL/index.less';

@formatterCollections({
  code: ['hpdm.config-object-tbl', 'srdm.config-object', 'hpdm.config-object-field'],
})
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    const { params } = props.match;
    const { objectId, objectTblId } = params;
    this.setDs(
      'configObjectContactFormDS',
      new DataSet(
        configObjectDSConfig.bind(this)(getTableStructerDSProps.bind(this)({ objectTblId }))
      )
    );
    this.setDs(
      'configObjectContactDS',
      new DataSet(
        tableStructureDSConfig.bind(this)(
          getConfigObjectContactDS.bind(this)({ objectId, objectTblId })
        )
      )
    );
  }

  @Bind()
  openModal(isNew, record) {
    const formDs = this.getDs('configObjectContactFormDS').current;
    const tableName = formDs.get('tableName');
    const objectTblId = formDs.get('objectTblId');
    const tenantId = getCurrentOrganizationId() || 0;
    let curRecord = record;
    if (isNew) {
      curRecord = this.getDs('configObjectContactDS').create(
        { tableName, objectTblId, tenantId },
        0
      );
    }
    Modal.open({
      title: isNew
        ? intl.get('hzero.common.button.create').d('新建')
        : intl.get('hpdm.config-object-tbl.operation.edit').d('编辑'),
      children: (
        <Form record={curRecord} labelLayout="float">
          <TextField name="tableName" disabled />
          <TextField name="fields" />
          <Lov name="referenceMainTable" />
          <TextField name="referenceFields" />
          <Select name="enabledFlag" />
        </Form>
      ),
      drawer: true,
      onOk: async () => {
        if (await curRecord.validate()) {
          await this.getDs('configObjectContactDS').submit();
          this.getDs('configObjectContactDS').query(
            this.getDs('configObjectContactDS').currentPage
          );
        } else {
          return false;
        }
        // await this.getDs('configObjectContactDS').submit();
        // this.getDs('configObjectContactDS').query(this.getDs('configObjectContactDS').currentPage);
      },
      onCancel: () => {
        this.getDs('configObjectContactDS').reset();
        if (isNew) {
          this.getDs('configObjectContactDS').remove(record);
        }
      },
    });
  }

  @Bind()
  async handleDelete(record) {
    await this.getDs('configObjectContactDS').delete(record);
    this.getDs('configObjectContactDS').query();
  }

  renderFlag({ value }) {
    return value
      ? intl.get('hzero.common.button.yes').d('是')
      : intl.get('hzero.common.button.no').d('否');
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hpdm.config-object-tbl.operation.contact').d('配置关联关系')}
          backPath={`/srdm/config-object-tbl/${this.props.match.params.objectId}`}
        >
          <Button color="primary" onClick={() => this.openModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Form dataSet={this.getDs('configObjectContactFormDS')} labelLayout="float" columns={3}>
            <TextField name="tableName" disabled />
            <TextField name="objectTblName" disabled />
            <TextField name="tblPriority" disabled />
            <TextField name="schemaName" disabled />
            <Select name="enabledFlag" disabled />
          </Form>
          <Table
            dataSet={this.getDs('configObjectContactDS')}
            columns={[
              { name: 'tableName', width: 110 },
              { name: 'fields', width: 160, tooltip: 'overflow' },
              { name: 'referenceTblName', tooltip: 'overflow' },
              { name: 'referenceFields', width: 320, tooltip: 'overflow' },
              { name: 'enabledFlag', width: 100, renderer: this.renderFlag },
              {
                name: intl.get('hpdm.config-object-tbl.title.operation').d('操作'),
                width: 320,
                lock: 'right',
                command: ({ record }) => {
                  return [
                    <a
                      onClick={() => this.openModal(false, record)}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.config-object-tbl.operation.edit').d('编辑')}
                    </a>,
                    <a onClick={() => this.handleDelete(record)}>
                      {intl.get('hzero.common.model.delete').d('删除')}
                    </a>,
                  ];
                },
              },
            ]}
          />
        </Content>
      </>
    );
  }
}

export default Page;
