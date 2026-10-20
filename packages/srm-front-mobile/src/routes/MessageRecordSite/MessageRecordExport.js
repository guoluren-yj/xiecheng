import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Button, CodeArea, DataSet, Table } from 'choerodon-ui/pro';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import { Modal, Tag } from 'choerodon-ui';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { resendMessageRecordSite, ignoreMessageRecordSite } from '@/services/messageRecordService';
import formatterCollections from 'utils/intl/formatterCollections';
import MessageRecordExportDs from './stores/MessageRecordExportDs';
import './index.less';

@connect(() => ({
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smbl.messageRecord', 'hzero.common'] })
export default class MessageChannelManageList extends PureComponent {
  constructor(props) {
    super(props);
    const dataSet = new DataSet({
      ...MessageRecordExportDs(intl),
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
    return [
      <Button key="edit-value" funcType="flat" onClick={() => this.handleResend()}>
        {intl.get('smbl.messageRecord.button.reSend').d('重导')}
      </Button>,
      <Button key="edit-value" funcType="flat" onClick={() => this.handleIgnore()}>
        {intl.get('smbl.messageRecord.button.ignore').d('忽略')}
      </Button>,
    ];
  }

  getColumns() {
    return [
      { name: 'tenantName', align: 'center', width: 200 },
      { name: 'processInstanceId', align: 'center' },
      {
        name: 'sourceId',
        align: 'center',
        width: 300,
        // command: ({ record }) => {
        //   return record.data.messageContent?[
        //     <Button
        //       key="view-value"
        //       color="blue"
        //       funcType="flat"
        //       onClick={() => this.handleView(record.data.messageContent)}
        //     >
        //       {intl.get('hzero.common.view.title.view').d('查看')}
        //     </Button>,
        //   ]:["-"];
        // },
      },
      {
        name: 'receiver',
        width: 200,
        align: 'center',
      },
      { name: 'thirdPartyName', width: 200, align: 'center' },
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
        name: 'requestBody',
        align: 'center',
        command: ({ record }) => {
          return record.data.requestBody
            ? [
                <Button
                  key="view-value"
                  // color="blue"
                  funcType="flat"
                  onClick={() => this.handleView(record.data.requestBody)}
                >
                  {intl.get('hzero.common.view.title.view').d('查看')}
                </Button>,
              ]
            : ['-'];
        },
      },
      {
        name: 'responseBody',
        align: 'center',
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
        align: 'center',
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
      { name: 'requestDate', width: 200, align: 'center' },
      { name: 'responseDate', width: 200, align: 'center' },
    ];
  }

  /**
   * 重推操作
   */
  @Bind
  async handleResend() {
    const { dataSet } = this.state;
    const selectData = dataSet.selected.map((item) => item.toJSONData());
    if (!selectData.length) return;
    const res = await resendMessageRecordSite(selectData);
    if (getResponse(res)) {
      dataSet.query();
      notification.success();
    }
  }

  /**
   * 忽略操作
   */
  @Bind
  async handleIgnore() {
    const { dataSet } = this.state;
    const selectData = dataSet.selected.map((item) => item.toJSONData());
    if (!selectData.length) return;
    const res = await ignoreMessageRecordSite(selectData);
    if (getResponse(res)) {
      dataSet.query();
      notification.success();
    }
  }

  @Bind
  handleView(text) {
    this.setState({ modalText: text, sideBarVisible: true });
  }

  render() {
    const { dataSet } = this.state;
    return (
      <>
        {/* <Header
          title={intl
            .get('smbl.messageRecord.view.messageRecord.manageTitle')
            .d('消息发送记录管理')}
        /> */}
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
