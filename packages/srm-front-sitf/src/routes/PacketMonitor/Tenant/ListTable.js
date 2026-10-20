/**
 * PacketMonitor -table 接口请求报文监控-表格部分
 * @date: 2018-11-30
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Modal, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import CodeMirror from 'components/CodeMirror';

export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modelVisible: false,
      errorRecord: '',
      title: '',
    };
  }

  /**
   * 请求头
   * @param {object} record 行记录
   */
  @Bind()
  requestHeader(record = {}, type = '') {
    const { dispatch, modelName, organizationId } = this.props;
    const { requestRecordId } = record;
    dispatch({
      type: `${modelName}/fetchRequestRecord`,
      payload: {
        requestRecordId,
        tenantId: organizationId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          modelVisible: true,
          errorRecord: res[`${type}`],
          title: intl
            .get(`sitf.PacketMonitor.view.modal.title.${type}`)
            .d(
              type === 'requestHeader'
                ? '请求header'
                : type === 'requestBody'
                ? '请求Body'
                : '反馈报文'
            ),
        });
      }
    });
  }

  /**
   * 请求参数
   * @param {object} record 行记录
   */
  @Bind()
  requestParameter(record = {}) {
    this.setState({
      modelVisible: true,
      errorRecord: record.requestParameter,
      title: intl.get('sitf.PacketMonitor.view.modal.title.requestParameter').d('请求参数'),
    });
  }

  @Bind()
  handleOk() {
    this.setState({
      modelVisible: false,
      errorRecord: '',
    });
  }

  render() {
    const { loading, list, pagination, organizationId, onFetchPacketMonitor } = this.props;
    const { modelVisible, errorRecord } = this.state;
    const otherColums = {
      title: intl.get('sitf.PacketMonitor.model.PacketMonitor.tenantName').d('租户名称'),
      dataIndex: 'tenantName',
      align: 'left',
      width: 150,
    };
    const columnsOrg = [
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.externalSystemCode').d('外部系统'),
        dataIndex: 'externalSystemCode',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.batchNum').d('批次号'),
        dataIndex: 'batchNum',
        align: 'left',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.interfaceCode').d('接口编码'),
        dataIndex: 'interfaceCode',
        align: 'left',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestUri').d('请求URI'),
        dataIndex: 'requestUri',
        align: 'left',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestUrl').d('请求URL'),
        dataIndex: 'requestUrl',
        align: 'left',
        width: 180,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestMethod').d('请求方法'),
        dataIndex: 'requestMethod',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestFunction').d('调用方法'),
        dataIndex: 'requestFunction',
        align: 'left',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestHeader').d('请求header'),
        dataIndex: 'requestHeader',
        align: 'left',
        width: 120,
        render: (val, record) => {
          return (
            <a onClick={() => this.requestHeader(record, 'requestHeader')}>
              {intl.get('sitf.PacketMonitor.model.PacketMonitor.requestHeader').d('请求header')}
            </a>
          );
        },
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestBody').d('请求body'),
        dataIndex: 'requestBody',
        align: 'left',
        width: 100,
        render: (val, record) => {
          return (
            <a onClick={() => this.requestHeader(record, 'requestBody')}>
              {intl.get('sitf.PacketMonitor.model.PacketMonitor.requestBody').d('请求body')}
            </a>
          );
        },
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.responseBody').d('反馈报文'),
        dataIndex: 'responseBody',
        align: 'left',
        width: 100,
        render: (val, record) => {
          return (
            <a onClick={() => this.requestHeader(record, 'responseBody')}>
              {intl.get('sitf.PacketMonitor.model.PacketMonitor.responseBody').d('反馈报文')}
            </a>
          );
        },
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestParameter').d('请求参数'),
        dataIndex: 'requestParameter',
        align: 'left',
        width: 100,
        render: (val, record) => {
          return (
            <a onClick={() => this.requestParameter(record)}>
              {intl.get('sitf.PacketMonitor.model.PacketMonitor.requestParameter').d('请求参数')}
            </a>
          );
        },
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.requestDate').d('请求时间'),
        dataIndex: 'requestDate',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.clientPort').d('客户端端口'),
        dataIndex: 'clientPort',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get('sitf.PacketMonitor.model.PacketMonitor.clientIp').d('客户端IP'),
        dataIndex: 'clientIp',
        align: 'left',
        width: 120,
      },
    ];
    const listColumn = [otherColums, ...columnsOrg];
    return (
      <React.Fragment>
        <Table
          bordered
          pagination={pagination}
          rowKey="requestRecordId"
          columns={organizationId === 0 ? listColumn : columnsOrg}
          loading={loading}
          onChange={(page) => onFetchPacketMonitor(page)}
          scroll={{ x: organizationId === 0 ? 1470 : 1570 }}
          dataSource={list.content || []}
        />
        <Modal
          width={800}
          title={this.state.title}
          visible={modelVisible}
          destroyOnClose
          onCancel={this.handleOk}
          footer={false}
        >
          <CodeMirror
            codeMirrorProps={{
              value: errorRecord,
              options: {
                mode: 'application/json',
                autoFocus: false,
                readOnly: true,
                lineNumbers: true,
              },
            }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
