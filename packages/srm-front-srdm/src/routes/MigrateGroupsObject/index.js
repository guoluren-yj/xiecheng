import { Header, Content } from 'components/Page';
import { Button, TextField, Select, Form, Table, DataSet, Modal } from 'choerodon-ui/pro';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import formatterCollections from 'utils/intl/formatterCollections';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react';
import { closeAndPush, isAdministrator } from '@/utils/utils';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, migrateGroupsDSConfig, migrateGroupsObjDSConfig } from './extensionRule.js';
import getMigrateGroupsDSProps from './migrateGroupsDS.js';
import getMigrateGroupsObjDSProps from './migrateGroupsObjDS.js';
import AddObjectPage from './addObjectPage.js';
import { groupAddObject } from '../../services/migrateGroupsObjService';

@formatterCollections({ code: ['hpdm.migrate-groups-obj', 'hpdm.migrate-groups'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    const { params } = props.match;
    const { mgGroupId } = params;
    this.setDs(
      'migrateGroupsDS',
      new DataSet(
        migrateGroupsDSConfig.bind(this)(getMigrateGroupsDSProps.bind(this)({ mgGroupId }))
      )
    );
    this.setDs(
      'migrateGroupsObjDS',
      new DataSet(
        migrateGroupsObjDSConfig.bind(this)(getMigrateGroupsObjDSProps.bind(this)({ mgGroupId }))
      )
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
        <Form record={record} columns={1}>
          <TextField disabled={!isNew} name="objectCode" />
          <TextField disabled={!isNew} name="objectName" />
          <TextField disabled={!isNew} name="comments" />
          <Select name="enabledFlag" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('migrateGroupsObjDS').submit();
          this.getDs('migrateGroupsObjDS').query(this.getDs('migrateGroupsObjDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('migrateGroupsObjDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('migrateGroupsObjDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  handleDistTable(record) {
    closeAndPush('/srdm/migrate-groups/table/', {
      title: `${intl.get(`hpdm.migrate-groups-obj.header.title`).d('组别表')} ${record.get(
        'objectCode'
      )}`,
      key: `/srdm/migrate-groups/table/${record.get('mgGroupId')}/${record.get('mgGrObjId')}`,
      path: `/srdm/migrate-groups/table/${record.get('mgGroupId')}/${record.get('mgGrObjId')}`,
      icon: 'edit',
      closable: true,
    });
  }

  async addObjectHandler() {
    const { params } = this.props.match;
    const { mgGroupId } = params;
    const props = { mgGroupId };
    Modal.open({
      key: 'modal_1',
      title: intl.get(`hpdm.migrate-groups-obj.title.addObject`).d('添加对象'),
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
      },
      children: (
        <AddObjectPage
          onRef={(ref) => {
            this.addObjectRef = ref;
          }}
          {...props}
        />
      ),
      onOk: async () => {
        if (this.addObjectRef.tableDS.selected.length > 0) {
          // 调用接口
          const res = getResponse(
            await groupAddObject({
              dataMigrateObjs: this.addObjectRef.tableDS.selected.map((item) => {
                const data = {
                  ...item.toData(),
                  mgGroupId: this.props.match.params.mgGroupId,
                };
                return data;
              }),
              mgGroupId: this.props.match.params.mgGroupId,
            })
          );
          if (res && !res.failed) {
            this.getDs('migrateGroupsObjDS').query();
            notification.success();
          } else {
            return false;
          }
        } else {
          notification.info({
            message: intl.get(`hpdm.migrate-groups-obj.select.one`).d('请选择一条记录'),
          });
          return false;
        }
      },
    });
  }

  render() {
    return (
      <>
        <Header
          title={intl.get('hpdm.migrate-groups-obj.header.message').d('配置迁移组别对象')}
          backPath="/srdm/migrate-groups/list"
        >
          {isAdministrator ? (
            <Button color="primary" onClick={() => this.addObjectHandler()}>
              {intl.get('hpdm.migrate-groups-obj.button.addObj').d('添加对象')}
            </Button>
          ) : null}
        </Header>
        <Content>
          <Form
            label="表单"
            columns={3}
            useColon
            labelWidth={100}
            labelLayout="horizontal"
            dataSet={this.getDs('migrateGroupsDS')}
          >
            <TextField colSpan={1} newLine={false} name="mgGroupNum" disabled clearButton />
            <TextField colSpan={1} newLine={false} name="mgGroupName" disabled clearButton />
            <Select colSpan={1} newLine={false} disabled name="enabledFlag" />
            <TextField colSpan={1} newLine={false} name="mgGroupDesc" disabled clearButton />
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
                name: 'objectCode',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'objectName',
                type: 'string',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'comments',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              isAdministrator && {
                header: intl.get('hpdm.migrate-groups-obj.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a onClick={() => this.editHandler(record)} style={{ marginRight: '0.1rem' }}>
                      {intl.get('hpdm.migrate-groups-obj.operation.edit').d('编辑')}
                    </a>,
                    <a onClick={() => this.handleDistTable(record)}>
                      {intl.get('hpdm.migrate-groups-obj.operation.distTable').d('分配表')}
                    </a>
                  );
                  return btns;
                },
              },
            ]}
            buttons={[
              <Button
                funcType="raised"
                color="default"
                onClick={() => this.getDs('migrateGroupsObjDS').query()}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>,
            ]}
            dataSet={this.getDs('migrateGroupsObjDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
