/**
 * MessageTabPane
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-06-13
 * @copyright 2019-06-13 © HAND
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Badge, Icon, Radio, Table, Modal } from 'hzero-ui';

import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender, TagRender, operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getEnvConfig } from 'utils/iocUtils';
import notification from 'utils/notification';

import { Button as ButtonPermission } from 'components/Permission';

import { downloadFileByAxios } from 'services/api';

import FilterForm from './FilterForm';
import styles from './index.less';

const { HZERO_PLATFORM, HZERO_FILE, BKT_PLATFORM } = getEnvConfig();
const organizationId = getCurrentOrganizationId();

function getRefFieldsValue(ref) {
  if (ref.current) {
    return ref.current.props.form.getFieldsValue();
  }
  return {};
}

export default class MessageTabPane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // prevDataSource: [], 之前的默认值
      // eslint-disable-next-line react/no-unused-state
      selectedRows: [],
      selectedRowKeys: [],
      readTypeValue: 'all',
      expand: false,
    };
    this.filterFormRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { dataSource } = nextProps;
    const { prevDataSource } = prevState;
    if (dataSource !== prevDataSource) {
      return {
        prevDataSource: dataSource,
        selectedRows: [],
        selectedRowKeys: [],
      };
    }
    return null;
  }

  componentDidMount() {
    const { pagination = {} } = this.props;
    this.handleFetch({ page: pagination });
  }

  // 加载数据
  handleFetch(payload = {}) {
    const { fetchMessage, type } = this.props;
    const { readTypeValue } = this.state;
    const fieldsValue = getRefFieldsValue(this.filterFormRef);
    fieldsValue.fromDate =
      fieldsValue.fromDate && fieldsValue.fromDate.format(DEFAULT_DATETIME_FORMAT);
    fieldsValue.toDate = fieldsValue.toDate && fieldsValue.toDate.format(DEFAULT_DATETIME_FORMAT);
    fieldsValue.creationDate = fieldsValue.creationDate
      ? fieldsValue.creationDate.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const allPayload = { ...payload, ...fieldsValue };
    switch (readTypeValue) {
      case '0':
        allPayload.readFlag = 0;
        break;
      case '1':
        allPayload.readFlag = 1;
        break;
      case 'all':
      default:
        break;
    }
    if (type === 'message') {
      allPayload.withContent = true;
    }
    fetchMessage(allPayload, type).then(res => {
      if (res) {
        const { selectedRows: prevSelectedRows = [] } = this.props;
        this.setState(
          {
            // eslint-disable-next-line react/no-unused-state
            selectedRows: [],
            selectedRowKeys: [],
          },
          () => {
            // 当 因为加载数据 导致 选中数据变化时, 父组件需要强制刷新
            // if (type !== 'announce') {
            if (prevSelectedRows.length !== 0) {
              const { indexForceUpdate } = this.props;
              indexForceUpdate();
            }
            // }
          }
        );
      }
    });
  }

  @Bind()
  handleFormSearch() {
    const fieldsValue = getRefFieldsValue(this.filterFormRef);
    fieldsValue.fromDate =
      fieldsValue.fromDate && fieldsValue.fromDate.format(DEFAULT_DATETIME_FORMAT);
    fieldsValue.toDate = fieldsValue.toDate && fieldsValue.toDate.format(DEFAULT_DATETIME_FORMAT);
    fieldsValue.creationDate = fieldsValue.creationDate
      ? fieldsValue.creationDate.format(DEFAULT_DATETIME_FORMAT)
      : null;
    this.handleFetch(fieldsValue);
  }

  @Bind()
  handleShowExportError(errorText) {
    Modal.warning({
      // title: intl.get('hzero.common	button.lastError').d('报错信息'),
      content: errorText,
    });
  }

  // Table
  getColumns() {
    const {
      type = 'message',
      statusList = [],
      platformNoticeTypeList = [],
      companyNoticeTypeList = [],
      path,
    } = this.props;
    if (type === 'importHistory') {
      return [
        {
          title: intl.get('hmsg.userMessage.model.userMessage.status').d('状态'),
          dataIndex: 'status',
          width: 200,
          render: value => {
            const status = [
              { status: 'UPLOADING', color: 'rgba(252,160,0,0.10)' /* , text: 'Excel导入' */ },
              { status: 'UPLOADED', color: 'rgba(252,160,0,0.10)' /* , text: '验证成功' */ },
              { status: 'CHECKING', color: 'rgba(252,160,0,0.10)' /* , text: '验证失败' */ },
              { status: 'CHECKED', color: 'rgba(71,184,129,0.10)' /* , text: '导入成功' */ },
              {
                status: 'CHECK_FAILED',
                color: 'rgba(245,99,73,0.10)' /* , text: '数据校验失败' */,
              },
              { status: 'IMPORTING', color: 'rgba(252,160,0,0.10)' /* , text: '导入失败' */ },
              { status: 'IMPORTED', color: 'rgba(71,184,129,0.10)' /* , text: '数据异常' */ },
              {
                status: 'IMPORT_FAILED',
                color: 'rgba(245,99,73,0.10)' /* , text: '数据导入失败' */,
              },
            ];
            const fontColor = [
              { status: 'UPLOADING', color: '#F88D10' /* , text: 'Excel导入' */ },
              { status: 'UPLOADED', color: '#F88D10' /* , text: '验证成功' */ },
              { status: 'CHECKING', color: '#F88D10' /* , text: '验证失败' */ },
              { status: 'CHECKED', color: 'rgba(71,184,129)' /* , text: '导入成功' */ },
              { status: 'CHECK_FAILED', color: 'rgba(245,99,73)' /* , text: '数据校验失败' */ },
              { status: 'IMPORTING', color: '#F88D10' /* , text: '导入失败' */ },
              { status: 'IMPORTED', color: 'rgba(71,184,129)' /* , text: '数据异常' */ },
              { status: 'IMPORT_FAILED', color: 'rgba(245,99,73)' /* , text: '数据导入失败' */ },
            ];
            const tagItem = status.find(t => t.status === value) || {};
            const item = statusList.find(t => t.value === value) || {};
            const tagFontColor = fontColor.find(t => t.status === value) || {};
            return (
              <div>
                {TagRender(
                  value,
                  [
                    {
                      status: value,
                      text: item?.meaning,
                      color: tagItem?.color,
                    },
                  ],
                  '',
                  tagFontColor.color
                )}
              </div>
            );
          },
        },
        {
          title: intl.get('hmsg.userMessage.model.userMessage.fileName').d('文件'),
          dataIndex: 'fileName',
        },
        {
          title: intl.get('hmsg.userMessage.model.userMessage.description').d('说明'),
          dataIndex: 'description',
          render: (_, record) => {
            const { dataCount: count = 0, successCount: ready = 0, status } = record;
            return status === 'IMPORT_FAILED'
              ? intl
                  .get('hzero.common.components.import.failed.description', { count })
                  .d(`导入${count}条数据，导入失败`)
              : '';
          },
        },
        {
          title: intl
            .get('hmsg.userMessage.model.userMessage.templateCategoryMeaning')
            .d('导入场景'),
          dataIndex: 'templateCategoryMeaning',
        },
        {
          title: intl.get('hmsg.userMessage.model.userMessage.creationDate').d('提交时间'),
          width: 200,
          dataIndex: 'creationDate',
          render: dateTimeRender,
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          width: 200,
          fixed: 'right',
          render: (_, record) => {
            const operators = [];
            if (record.templateSource === 'MODEL') {
              operators.push({
                key: 'downloadOrigin',
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.import.downloadOrigin`,
                        type: 'button',
                        meaning: '站内消息-导入-下载源文件',
                      },
                    ]}
                    onClick={() => {
                      this.handleDownloadSourceFile(record);
                    }}
                  >
                    {intl.get('hmsg.userMessage.view.button.downloadOrigin').d('下载源文件')}
                  </ButtonPermission>
                ),
                len: 5,
                title: intl.get('hmsg.userMessage.view.button.downloadOrigin').d('下载源文件'),
              });
              if (record.status === 'IMPORT_FAILED') {
                operators.push({
                  key: 'downloadFailure',
                  ele: (
                    <ButtonPermission
                      type="text"
                      permissionList={[
                        {
                          code: `${path}.button.import.downloadFailure`,
                          type: 'button',
                          meaning: '站内消息-导入-下载失败文件',
                        },
                      ]}
                      onClick={() => {
                        this.handleDownloadFailureFile(record);
                      }}
                    >
                      {intl.get('hmsg.userMessage.view.button.downloadFailure').d('下载失败文件')}
                    </ButtonPermission>
                  ),
                  len: 6,
                  title: intl.get('hebk.proxy.button.bank').d('银行'),
                });
              }
            }

            return operatorRender(operators);
          },
        },
      ];
    }
    if (type === 'exportHistory') {
      return [
        {
          title: intl.get('hmsg.userMessage.model.export.state').d('状态'),
          dataIndex: 'state',
          width: 200,
          render: value => {
            const status = [
              { status: 'DOING', color: 'rgba(71,184,129,0.10)' /* , text: '导出' */ },
              { status: 'DONE', color: 'rgba(71,184,129,0.10)' /* , text: '导出成功' */ },
              { status: 'FAILED', color: 'rgba(245,99,73,0.10)' /* , text: '导出失败' */ },
              { status: 'CANCELLED', color: 'rgba(0,0,0,0.08)' /* , text: 导出失败' */ },
              { status: 'HUGE_DOING', color: '#ebdfed' /* , text: 导出失败' */ },
            ];
            const fontColor = [
              { status: 'DOING', color: 'rgba(71,184,129)' /* , text: '导出' */ },
              { status: 'DONE', color: 'rgba(71,184,129)' /* , text: '导出成功' */ },
              { status: 'FAILED', color: 'rgba(245,99,73)' /* , text: '导出成功' */ },
              { status: 'CANCELLED', color: 'rgba(0,0,0,0.65)' /* , text: 导出失败' */ },
              { status: 'HUGE_DOING', color: '#8e44ad' /* , text: 导出失败' */ },
            ];
            const tagItem = status.find(t => t.status === value) || {};
            const tagFontColor = fontColor.find(t => t.status === value) || {};
            const item = statusList.find(t => t.value === value) || {};
            return (
              <div>
                {TagRender(
                  value,
                  [
                    {
                      status: value,
                      text: item?.meaning,
                      color: tagItem?.color,
                    },
                  ],
                  '',
                  tagFontColor.color
                )}
              </div>
            );
          },
        },
        {
          title: intl.get('hmsg.userMessage.model.export.fileName').d('文件'),
          dataIndex: 'filename',
        },
        {
          title: intl.get('hmsg.userMessage.model.export.taskName').d('导出任务'),
          dataIndex: 'taskName',
        },
        {
          title: intl.get('hmsg.userMessage.model.export.creationDate').d('提交时间'),
          width: 200,
          dataIndex: 'creationDate',
          render: dateTimeRender,
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          width: 200,
          fixed: 'right',
          render: (_, record) => {
            const operators = [];
            if (record?.downloadUrl) {
              operators.push({
                key: 'downloadOrigin',
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.export.download`,
                        type: 'button',
                        meaning: '站内消息-导出-下载源文件',
                      },
                    ]}
                    onClick={() => {
                      this.handleDownloadExportFile(record);
                    }}
                  >
                    {intl.get('hzero.common.button.download').d('下载')}
                  </ButtonPermission>
                ),
                len: 2,
                title: intl.get('hzero.common.button.download').d('下载'),
              });
            }
            if (record?.errorInfo) {
              operators.push({
                key: 'errorInfo1',
                ele: (
                  <a
                    onClick={() => {
                      this.handleShowExportError(record.errorInfo);
                    }}
                  >
                    {intl.get('hzero.common.button.lastError').d('报错信息')}
                  </a>
                ),
                len: 4,
                title: intl.get('hzero.common.button.lastError').d('报错信息'),
              });
            }
            return operatorRender(operators);
          },
        },
      ];
    }
    if (type === 'companyNotice' || type === 'platformNotice') {
      return [
        {
          title: intl.get('hmsg.userMessage.model.userMessage.noticTitle').d('公告标题'),
          dataIndex: 'title',
          render: (text, record) => {
            if (record.readFlag === 0) {
              return (
                <span>
                  <Badge status="processing" />
                  <span dangerouslySetInnerHTML={{ __html: text }} />
                </span>
              );
            } else {
              return (
                <span style={{ color: '#999' }}>
                  <Badge status="default" />
                  <span dangerouslySetInnerHTML={{ __html: text }} />
                </span>
              );
            }
          },
        },
        {
          title: intl.get('hmsg.userMessage.model.userMessage.noticeContent').d('内容'),
          dataIndex: 'noticeBody',
          width: 300,
          render: text => {
            return text ? text.replace(/(<\/?.+?>|&nbsp|&nbsp;|\n)/g, '') : '';
          },
        },
        type === 'platformNotice' && {
          title: intl.get('hmsg.userMessage.model.userMessage.noticeType').d('公告类型'),
          width: 200,
          dataIndex: 'noticeTypeCode',
          render: text => {
            return (platformNoticeTypeList.find(type => type.value === text) || {}).meaning;
          },
        },
        type === 'companyNotice' && {
          title: intl.get('hmsg.userMessage.model.userMessage.noticeType').d('公告类型'),
          width: 200,
          dataIndex: 'noticeTypeCode',
          render: text => {
            return (companyNoticeTypeList.find(type => type.value === text) || {}).meaning;
          },
        },
        {
          title: intl.get('hmsg.userMessage.model.userMessage.publishedDate').d('发布日期'),
          width: 200,
          dataIndex: 'publishedDate',
          render: dateTimeRender,
        },
      ].filter(Boolean);
    }
    return [
      {
        title: intl.get('hmsg.userMessage.model.userMessage.title').d('标题'),
        dataIndex: 'subject',
        width: 200,
        render: (text, record) => {
          if (record.readFlag === 0) {
            return (
              <span>
                <Badge status="processing" />
                <span dangerouslySetInnerHTML={{ __html: text }} />
              </span>
            );
          } else {
            return (
              <span style={{ color: '#999' }}>
                <Badge status="default" />
                <span dangerouslySetInnerHTML={{ __html: text }} />
              </span>
            );
          }
        },
      },
      {
        title: intl.get('hmsg.userMessage.model.userMessage.content').d('内容'),
        dataIndex: 'content',
        render: text => {
          return text ? <span className={styles['message-content']} dangerouslySetInnerHTML={{ __html: text }} /> : '';
        },
      },
      {
        title: intl.get('hmsg.userMessage.model.userMessage.creationDate').d('提交时间'),
        width: 200,
        fixed: 'right',
        dataIndex: 'creationDate',
        render: (text, record) => {
          if (record.readFlag === 0) {
            return dateTimeRender(text);
          } else {
            return <span style={{ color: '#999' }}>{dateTimeRender(text)}</span>;
          }
        },
      },
      {
        title: intl.get('hzero.common.model.common.type').d('类型'),
        width: 200,
        fixed: 'right',
        dataIndex: 'messageTypeCode',
        render: (text, record) => this.typeCodeRender(record),
      },
    ];
  }

  @Bind()
  handleRowSelectionChange(_, selectedRows = []) {
    const { type = 'message', indexForceUpdate } = this.props;
    this.setState(
      {
        // eslint-disable-next-line react/no-unused-state
        selectedRows,
        selectedRowKeys: selectedRows.map(r =>
          ['platformNotice', 'companyNotice'].includes(type) ? r.noticeId : r.userMessageId
        ),
      },
      () => {
        indexForceUpdate();
      }
    );
  }

  @Bind()
  handleTableChange(page, filter, sort) {
    const params = {
      page,
      sort,
    };
    this.handleFetch(params);
  }

  @Bind()
  handleDetails(record) {
    const { onGotoDetail, type } = this.props;
    onGotoDetail(record, type);
  }

  /**
   * 全部消息 已读消息 未读消息 切换
   * @param e
   */
  @Bind()
  handleType(e) {
    this.setState(
      {
        readTypeValue: e.target.value,
      },
      () => {
        this.handleFetch();
      }
    );
  }

  @Bind()
  handleUp() {
    this.setState({
      expand: false,
    });
  }

  @Bind()
  handleDown() {
    this.setState({
      expand: true,
    });
  }

  /**
   * 处理站内消息类型
   */
  @Bind()
  typeCodeRender(record = {}) {
    // const { messageCategoryMeaning, messageSubcategoryMeaning } = record;
    const { userMessageTypeMeaning } = record;
    // const array = [messageCategoryMeaning, messageSubcategoryMeaning].filter(o => o);
    if (record.readFlag === 0) {
      // return array.join('-');
      return userMessageTypeMeaning;
    } else {
      // return <span style={{ color: '#999' }}>{array.join('-')}</span>;
      return <span style={{ color: '#999' }}>{userMessageTypeMeaning}</span>;
    }
  }

  /**
   * 下载 excel 模板
   */
  @Bind()
  handleDownloadSourceFile(record) {
    const api = `${HZERO_PLATFORM}/v1/${organizationId}/import-tasks/download/${
      record.importTaskId
    }`;
    const queryParams = [];
    downloadFileByAxios({ requestUrl: api, queryParams });
  }

  @Bind()
  handleDownloadFailureFile(record) {
    const api = `${
      record.servicePath ? `/${record.servicePath}` : HZERO_PLATFORM
    }/v1/${organizationId}/import/data/model/export/excel`;
    const queryParams = [{ name: 'batch', value: record.batchNum }];
    downloadFileByAxios({ requestUrl: api, queryParams });
  }

  @Bind()
  handleDownloadExportFile(record) {
    const api = `${HZERO_FILE}/v1/${organizationId}/files/download`;
    const queryParams = [
      { name: 'url', value: encodeURIComponent(record.downloadUrl) },
      { name: 'bucketName', value: `${BKT_PLATFORM}` },
    ];
    downloadFileByAxios({ requestUrl: api, queryParams }).catch(e => {
      notification.error({ message: e.message });
    });
  }

  render() {
    const {
      dataSource = [],
      pagination = false,
      loading = false,
      type = 'message',
      statusList = [],
      platformNoticeTypeList = [],
      companyNoticeTypeList = [],
    } = this.props;
    const { selectedRowKeys = [], readTypeValue, expand } = this.state;

    const columns = this.getColumns();

    const rowSelection =
      type === 'announce'
        ? null
        : {
            selectedRowKeys,
            onChange: this.handleRowSelectionChange,
          };

    return (
      <>
        {['message', 'platformNotice', 'companyNotice'].includes(type) && (
          <div className="table-list-search">
            <Radio.Group buttonStyle="solid" onChange={this.handleType}>
              <Radio.Button value="all" checked={readTypeValue === 'all'}>
                {intl.get('hmsg.userMessage.view.option.allMessage').d('全部消息')}
              </Radio.Button>
              <Radio.Button value="0" checked={readTypeValue === '0'}>
                {intl.get('hmsg.userMessage.view.option.unReadMessage').d('未读消息')}
              </Radio.Button>
              <Radio.Button value="1" checked={readTypeValue === '1'}>
                {intl.get('hmsg.userMessage.view.option.readMessage').d('已读消息')}
              </Radio.Button>
            </Radio.Group>
            <a
              onClick={expand ? this.handleUp : this.handleDown}
              style={{ color: '#00CCFF', marginLeft: 8, cursor: 'pointer' }}
            >
              <span>
                {expand
                  ? intl.get(`hzero.common.button.up`).d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
              </span>
              <Icon type={expand ? 'up' : 'down'} style={{ fontSize: 16 }} />
            </a>
          </div>
        )}
        {(expand || ['announce', 'importHistory', 'exportHistory'].includes(type)) && (
          <FilterForm
            wrappedComponentRef={this.filterFormRef}
            type={type}
            onSearch={this.handleFormSearch}
            statusList={statusList}
            platformNoticeTypeList={platformNoticeTypeList}
            companyNoticeTypeList={companyNoticeTypeList}
          />
        )}
        <Table
          className={styles.content}
          bordered
          rowKey={
            // eslint-disable-next-line no-nested-ternary
            ['platformNotice', 'companyNotice'].includes(type)
              ? 'noticeId'
              : ['importHistory', 'exportHistory'].includes(type)
              ? 'importTaskId'
              : 'userMessageId'
          }
          style={['importHistory', 'exportHistory'].includes(type) ? {} : { cursor: 'pointer' }}
          loading={loading}
          onRow={record =>
            ['importHistory', 'exportHistory'].includes(type)
              ? {}
              : {
                  onClick: () => {
                    this.handleDetails(record);
                  },
                }
          }
          rowSelection={['importHistory', 'exportHistory'].includes(type) ? false : rowSelection}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={pagination}
          onChange={this.handleTableChange}
        />
      </>
    );
  }
}
