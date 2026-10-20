import { Header, Content } from 'components/Page';
import { Button, Table, DataSet, Form, TextField, Modal, Select } from 'choerodon-ui/pro';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import formatterCollections from 'utils/intl/formatterCollections';
import { isAdministrator, closeAndPush } from '@/utils/utils';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, migrateGroupsDSConfig } from './extensionRule.js';
import getMigrateGroupsDSProps from './migrateGroupsDS.js';

@formatterCollections({ code: ['hpdm.migrate-groups'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    this.setDs(
      'migrateGroupsDS',
      new DataSet(migrateGroupsDSConfig.bind(this)(getMigrateGroupsDSProps.bind(this)({})))
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
          <TextField disabled={!isNew} name="mgGroupNum" />
          <TextField name="mgGroupName" />
          <Select name="enabledFlag" />
          <TextField name="mgGroupDesc" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('migrateGroupsDS').submit();
          this.getDs('migrateGroupsDS').query(this.getDs('migrateGroupsDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('migrateGroupsDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('migrateGroupsDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  createHandler() {
    this.openModal(this.getDs('migrateGroupsDS').create({}, 0), true);
  }

  handleDistObject(record) {
    closeAndPush('/srdm/migrate-groups/object/', {
      title: `${intl.get(`hpdm.migrate-groups.header.distObject`).d('组别对象')} ${record.get(
        'mgGroupNum'
      )}`,
      key: `/srdm/migrate-groups/object/${record.get('mgGroupId')}`,
      path: `/srdm/migrate-groups/object/${record.get('mgGroupId')}`,
      icon: 'edit',
      closable: true,
    });
  }

  render() {
    return (
      <>
        <Header
          data-hcg_flag="Header_a8fb4"
          title={intl.get('hpdm.migrate-groups.header.message').d('配置迁移组')}
        >
          {isAdministrator ? (
            <Button
              color="primary"
              onClick={() => {
                this.createHandler();
              }}
            >
              {intl.get('hpdm.migrate-groups.button.create').d('新建')}
            </Button>
          ) : null}
        </Header>
        <Content>
          <Table
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
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
                name: 'mgGroupNum',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'mgGroupName',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'mgGroupDesc',
                type: 'string',
              },
              {
                header: intl.get('hpdm.migrate-groups.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [
                    isAdministrator ? (
                      <a onClick={() => this.editHandler(record)} style={{ marginRight: '0.1rem' }}>
                        {intl.get('hpdm.migrate-groups.operation.edit').d('编辑')}
                      </a>
                    ) : null,
                    <a onClick={() => this.handleDistObject(record)}>
                      {intl.get('hpdm.migrate-groups.operation.distObject').d('分配对象')}
                    </a>,
                  ];
                  return btns;
                },
              },
            ]}
            buttons={[]}
            dataSet={this.getDs('migrateGroupsDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
