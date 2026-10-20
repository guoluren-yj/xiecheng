import { Header, Content } from 'components/Page';
import { Button, TextField, Select, Form, Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import formatterCollections from 'utils/intl/formatterCollections';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { initComponent, componentDidMount } from './pageLogic.js';
import {
  configRule,
  migrateGroupsObjDSConfig,
  migrateGroupsTableDSConfig,
} from './extensionRule.js';
import getMigrateGroupsObjDSProps from './migrateGroupsObjDS.js';
import getMigrateGroupsTableDSProps from './migrateGroupsTableDS.js';

@formatterCollections({
  code: ['hpdm.migrate-groups-table', 'hpdm.migrate-groups-obj', 'hpdm.migrate-groups'],
})
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    initComponent.bind(this)();
    const { params } = this.props.match;
    const { mgGrObjId } = params;
    this.setDs(
      'migrateGroupsObjDS',
      new DataSet(
        migrateGroupsObjDSConfig.bind(this)(getMigrateGroupsObjDSProps.bind(this)({ mgGrObjId }))
      )
    );
    this.setDs(
      'migrateGroupsTableDS',
      new DataSet(
        migrateGroupsTableDSConfig.bind(this)(
          getMigrateGroupsTableDSProps.bind(this)({
            mgGrObjId,
          })
        )
      )
    );
  }

  componentDidMount() {
    componentDidMount.bind(this)();
    this.getDs('migrateGroupsObjDS').query();
  }

  openModal(record, isNew) {
    let isCancel = false;
    Modal.open({
      drawer: true,
      children: (
        <Form record={record} columns={1} useColon>
          <Select disabled={!isNew} name="tableName" />
          <TextField name="objectTblName" />
          <TextField name="comments" />
          <Select name="enabledFlag" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('migrateGroupsTableDS').submit();
          this.getDs('migrateGroupsTableDS').query(this.getDs('migrateGroupsTableDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('migrateGroupsTableDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('migrateGroupsTableDS').remove(record),
    });
  }

  editGroupTable(record) {
    this.openModal(record);
  }

  @Bind()
  createGroupTable() {
    this.openModal(
      this.getDs('migrateGroupsTableDS').create(
        {
          mgGroupId: this.props.match.params.mgGroupId,
          mgGrObjId: this.props.match.params.mgGrObjId,
          objectId: this.getDs('migrateGroupsObjDS').current.get('objectId'),
        },
        0
      ),
      true
    );
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hpdm.migrate-groups-table.header.title').d('配置迁移组别表')}
          backPath={`/srdm/migrate-groups/object/${this.props.match.params.mgGroupId}`}
        />
        <Content>
          <Form
            label="表单"
            columns={3}
            useColon
            labelWidth={100}
            labelLayout="horizontal"
            dataSet={this.getDs('migrateGroupsObjDS')}
          >
            <TextField colSpan={1} name="objectCode" disabled clearButton />
            <TextField colSpan={1} name="objectName" disabled clearButton />
            <TextField colSpan={1} name="comments" disabled clearButton />
            <Select disabled name="enabledFlag" clearButton colSpan={1} />
          </Form>
          <Table
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnHideable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'tableName',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'objectTblName',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'comments',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                header: intl.get('hpdm.migrate-groups-table.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a
                      onClick={() => this.editGroupTable(record)}
                      style={{ marginRight: '0.1rem' }}
                    >
                      {intl.get('hpdm.migrate-groups-table.operation.edit').d('编辑')}
                    </a>
                  );
                  return btns;
                },
              },
            ]}
            buttons={[
              <Button funcType="raised" color="primary" onClick={() => this.createGroupTable()}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>,
              <Button
                funcType="raised"
                color="default"
                onClick={() => this.getDs('migrateGroupsTableDS').query()}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>,
            ]}
            dataSet={this.getDs('migrateGroupsTableDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
