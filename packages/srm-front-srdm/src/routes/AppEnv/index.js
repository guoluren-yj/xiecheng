import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Button, Table, DataSet, Modal, Form, Select, TextField, Password } from 'choerodon-ui/pro';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react';
import { closeAndPush } from '@/utils/utils';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, appEnvDSConfig } from './extensionRule.js';
import getDataSourceDSProps from './appEnvDS.js';
import { dataSourceRefresh } from '../../services/dataSourceService';

@formatterCollections({ code: ['hpdm.app-env'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    this.setDs(
      'appEnvDS',
      new DataSet(appEnvDSConfig.bind(this)(getDataSourceDSProps.bind(this)({})))
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
          <TextField name="environmentCode" />
          <TextField name="environmentName" />
          <TextField name="environmentDesc" />
          <Select name="prodFlag" />
          <Select name="verifyFlag" />
          <Password name="decryptVerifyPassword" autoComplete="new-password" />
          <Select name="enabledFlag" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate(true)) {
          await this.getDs('appEnvDS').submit();
          this.getDs('appEnvDS').query(this.getDs('appEnvDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('appEnvDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('appEnvDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  createHandler() {
    this.openModal(this.getDs('appEnvDS').create({}, 0), true);
  }

  @Bind()
  async deleteOperation(record) {
    await this.getDs('appEnvDS').delete(record);
    this.getDs('appEnvDS').query();
  }

  handleDataBases(record) {
    closeAndPush('/srdm/app-databases/', {
      title: `${intl.get(`hpdm.app-env.header.databases`).d('环境数据源')} ${record.get(
        'environmentCode'
      )}`,
      key: `/srdm/app-databases/${record.get('appEnvId')}`,
      path: `/srdm/app-databases/${record.get('appEnvId')}`,
      icon: 'edit',
      closable: true,
    });
  }

  render() {
    return (
      <>
        <Header
          data-hcg_flag="Header_ae0e0"
          title={intl.get('hpdm.app-env.header.title').d('环境信息')}
        >
          <Button
            newLine={false}
            color="default"
            disabled={false}
            onClick={async () => {
              Modal.confirm({
                destroyOnClose: true,
                title: intl.get('hpdm.app-env.title.refresh').d('是否确认刷新环境？'),
                onOk: async () => {
                  const res = await dataSourceRefresh();
                  if (getResponse(res)) {
                    notification.success();
                  }
                },
              });
            }}
          >
            {intl.get('hpdm.app-env.button.refresh').d('刷新环境')}
          </Button>
          <Button
            data-hcg_flag="Button_7de03"
            newLine={false}
            color="primary"
            disabled={false}
            onClick={() => {
              this.createHandler();
            }}
          >
            {intl.get('hpdm.app-env.button.create').d('新建')}
          </Button>
        </Header>
        <Content data-hcg_flag="Content_87105">
          <Table
            data-hcg_flag="Table_85954"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_85954"
            border
            columns={[
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'environmentCode',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'environmentName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'environmentDesc',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'prodFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'verifyFlag',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'enabledFlag',
              },
              {
                header: intl.get('hpdm.app-env.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a onClick={() => this.editHandler(record)} style={{ marginRight: '0.1rem' }}>
                      {intl.get('hpdm.app-env.operation.edit').d('编辑')}
                    </a>,
                    <a onClick={() => this.handleDataBases(record)}>
                      {intl.get('hpdm.app-env.operation.dataBases').d('添加数据源')}
                    </a>
                  );
                  return btns;
                },
              },
            ]}
            buttons={[]}
            dataSet={this.getDs('appEnvDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
