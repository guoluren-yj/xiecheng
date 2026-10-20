import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Button, CodeArea, DataSet, Table } from 'choerodon-ui/pro';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { Modal, Tag } from 'choerodon-ui';
import { Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import MessageRecordDS from './stores/MessageRecordDS';
import './index.less';

@connect(() => ({
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smbl.messageRecord'] })
export default class MessageChannelManageList extends PureComponent {
  constructor(props) {
    super(props);
    const dataSet = new DataSet({
      ...MessageRecordDS(intl),
      autoQuery: false,
    });
    this.state = {
      dataSet,
      modalText: '',
      sideBarVisible: false,
    };
  }

  componentDidMount() {
    const { dataSet } = this.state;
    dataSet.query();
  }

  getButtons() {
    return [];
  }

  getColumns() {
    return [
      { name: 'tenantName', align: 'center', width: 200 },
      { name: 'messageTitle', align: 'center', width: 200 },
      {
        name: 'receiver',
        width: 200,
        align: 'center',
      },
      {
        name: 'messageContent',
        align: 'center',
        command: ({ record }) => {
          return [
            <Button
              key="view-value"
              // color="blue"
              funcType="flat"
              onClick={() => this.handleView(record.data.messageContent)}
            >
              {intl.get('hzero.common.view.title.view').d('查看')}
            </Button>,
          ];
        },
      },
      { name: 'thirdPartyName', align: 'center', width: 200 },
      { name: 'thirdPartyAccount', align: 'center', width: 200 },
      {
        name: 'successFlag',
        align: 'center',
        renderer: ({ value, text }) => {
          let color = 'green';
          switch (value) {
            case '1':
              color = 'green';
              break;
            case '0':
              color = 'red';
              break;
            default:
              color = 'orange';
              break;
          }
          return (
            <Tag className="record-tag-frameless" color={color}>
              {text}
            </Tag>
          );
        },
      },
      {
        name: 'responseBody',
        command: ({ record }) => {
          return [
            <Button
              key="view-value"
              // color="blue"
              funcType="flat"
              onClick={() => this.handleView(record.data.responseBody)}
            >
              {intl.get('hzero.common.view.title.view').d('查看')}
            </Button>,
          ];
        },
      },
      {
        name: 'errorMessage',
        command: ({ record }) => {
          return [
            <Button
              key="view-value"
              // color="blue"
              funcType="flat"
              onClick={() => this.handleView(record.data.errorMessage)}
            >
              {intl.get('hzero.common.view.title.view').d('查看')}
            </Button>,
          ];
        },
      },
      { name: 'requestDate', align: 'center', width: 200 },
      { name: 'responseDate', align: 'center', width: 200 },
    ];
  }

  @Bind
  handleView(text) {
    this.setState({ modalText: text, sideBarVisible: true });
  }

  render() {
    const { dataSet } = this.state;
    return (
      <>
        <Content>
          <Table
            queryFieldsLimit={3}
            dataSet={dataSet}
            buttons={this.getButtons()}
            columns={this.getColumns()}
          />
          <Modal
            destroyOnClose
            title={intl.get('hzero.common.view.title.view').d('查看')}
            visible={this.state.sideBarVisible}
            onCancel={() => this.setState({ sideBarVisible: false })}
            closable
            width={800}
            footer={null}
          >
            <CodeArea
              style={{ width: '100%', height: 600 }}
              readOnly
              value={this.state.modalText}
              options={{ theme: 'neat', lineWrapping: true }}
              formatter={JSONFormatter}
            />
          </Modal>
        </Content>
      </>
    );
  }
}
