import { Header, Content } from 'components/Page';
import {
  Button,
  Table,
  DataSet,
  Modal,
  Form,
  TextArea,
  Select,
  TextField,
  Password,
} from 'choerodon-ui/pro';
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
import { configRule, dataSourceDSConfig } from './extensionRule.js';
import getDataSourceDSProps from './dataSourceDS.js';
import { dataSourceRefresh } from '../../services/dataSourceService';

@formatterCollections({ code: ['hpdm.data-source'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    this.setDs(
      'dataSourceDS',
      new DataSet(dataSourceDSConfig.bind(this)(getDataSourceDSProps.bind(this)({})))
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
          <TextField disabled={!isNew} name="datasourceName" />
          <TextField name="driverClassName" />
          <TextField name="url" />
          <TextField name="username" />
          <Password name="decryptPassword" autoComplete="new-password" />
          <Select name="enabledFlag" />
          <TextArea rows={2} resize="both" name="comments" />
        </Form>
      ),
      onOk: async () => {
        if (await record.validate()) {
          await this.getDs('dataSourceDS').submit();
          this.getDs('dataSourceDS').query(this.getDs('dataSourceDS').currentPage);
        } else {
          return false;
        }
      },
      onCancel: () => {
        this.getDs('dataSourceDS').reset();
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.getDs('dataSourceDS').remove(record),
    });
  }

  editHandler(record) {
    this.openModal(record);
  }

  createHandler() {
    this.openModal(this.getDs('dataSourceDS').create({}, 0), true);
  }

  handleExtraParam(record) {
    closeAndPush('/srdm/extra-param/', {
      title: `${intl.get(`hpdm.data-source.header.extraParam`).d('额外参数')} ${record.get(
        'datasourceName'
      )}`,
      key: `/srdm/extra-param/${record.get('routeDsId')}`,
      path: `/srdm/extra-param/${record.get('routeDsId')}`,
      icon: 'edit',
      closable: true,
    });
  }

  render() {
    return (
      <>
        <Header
          data-hcg_flag="Header_ae0e0"
          title={intl.get('hpdm.data-source.header.title').d('数据源')}
        >
          <Button
            newLine={false}
            color="default"
            disabled={false}
            onClick={async () => {
              Modal.confirm({
                destroyOnClose: true,
                title: intl.get('hpdm.data-source.title.refresh').d('是否确认刷新环境？'),
                onOk: async () => {
                  const res = await dataSourceRefresh();
                  if (getResponse(res)) {
                    notification.success();
                  }
                },
              });
            }}
          >
            {intl.get('hpdm.data-source.button.refresh').d('刷新环境')}
          </Button>
          <Button
            newLine={false}
            color="primary"
            disabled={false}
            onClick={() => {
              this.createHandler();
            }}
          >
            {intl.get('hpdm.data-source.button.create').d('新建')}
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
                width: 200,
                name: 'datasourceName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'driverClassName',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                width: 200,
                name: 'url',
              },
              {
                hideable: true,
                titleEditable: true,
                tooltip: 'always',
                name: 'username',
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
              {
                header: intl.get('hpdm.data-source.title.operation').d('操作'),
                width: 200,
                lock: 'right',
                command: ({ record }) => {
                  const btns = [];
                  btns.push(
                    <a onClick={() => this.editHandler(record)} style={{ marginRight: '0.1rem' }}>
                      {intl.get('hpdm.data-source.operation.edit').d('编辑')}
                    </a>,
                    <a onClick={() => this.handleExtraParam(record)}>
                      {intl.get('hpdm.data-source.operation.extraParam').d('添加参数')}
                    </a>
                  );
                  return btns;
                },
              },
            ]}
            buttons={[]}
            dataSet={this.getDs('dataSourceDS')}
          />
        </Content>
      </>
    );
  }
}

export default Page;
