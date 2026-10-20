/**
 * excelAsyncExport Excel异步导出
 * @date: 2019-8-7
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Table, Button, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { Content, Header } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import request from 'utils/request';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';
import notification from 'utils/notification';
import { HZERO_FILE, BKT_PLATFORM, HZERO_PLATFORM } from 'utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { tableScrollWidth, isTenantRoleLevel, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { downloadFile } from 'services/api';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@connect(({ excelAsyncExport, loading }) => ({
  excelAsyncExport,
  isSiteFlag: !isTenantRoleLevel,
  fetchListLoading: loading.effects['excelAsyncExport/fetchList'],
  cancelLoading: loading.effects['excelAsyncExport/cancel'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['hpfm.excelAsyncExport'],
})
export default class ExcelAsyncExport extends React.Component {
  constructor(props) {
    super(props);
    this.filterFormRef = React.createRef();
    this.state = {
      modalVisible: false,
      errorInfo: '',
      exportLoading: false,
      defaultStartTime: moment().subtract(6, 'M').startOf('day'),
    };
  }

  componentDidMount() {
    this.handleSearch();
    const { dispatch } = this.props;
    const lovCodes = { typeList: 'HPFM.ASYNC.TASK.STATE' };
    dispatch({
      type: 'excelAsyncExport/init',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * @function handleSearch - 获取单点登陆配置列表数据
   * @param {object} params - 查询参数
   */
  @Bind()
  handleSearch(params = {}) {
    const { dispatch } = this.props;
    const fieldsValue = this.filterFormRef.current.getFieldsValue();
    const { creationDateFrom, creationDateTo } = fieldsValue;
    fieldsValue.creationDateFrom = creationDateFrom
      ? moment(creationDateFrom).format(DEFAULT_DATETIME_FORMAT)
      : null;
    fieldsValue.creationDateTo = creationDateTo
      ? moment(creationDateTo).format(DEFAULT_DATETIME_FORMAT)
      : null;
    dispatch({
      type: 'excelAsyncExport/fetchList',
      payload: { ...fieldsValue, ...params },
    });
  }

  /**
   * @function handlePagination - 分页操作
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handlePagination(pagination = {}) {
    this.handleSearch({
      page: pagination,
    });
  }

  /**
   * 删除配置
   */
  @Bind()
  handleCancel(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'excelAsyncExport/cancel',
      payload: { taskCode: decodeURIComponent(record.taskCode) },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  @Bind()
  handleDownload(record) {
    const { isSiteFlag } = this.props;
    const organizationId = getCurrentOrganizationId();
    const api = `${HZERO_FILE}/v1/${isSiteFlag ? '' : `${organizationId}/`}files/download`;
    const queryParams = [{ name: 'url', value: encodeURIComponent(record.downloadUrl) }];
    queryParams.push({ name: 'bucketName', value: BKT_PLATFORM });
    queryParams.push({ name: 'directory', value: 'hpfm01' });
    downloadFile({
      requestUrl: api,
      queryParams,
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: !!flag });
  }

  /**
   * 打开模态框
   */
  @Bind()
  showModal(record = {}) {
    this.setState({ errorInfo: record.errorInfo });
    this.handleModalVisible(true);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  @Bind()
  handleExportLog() {
    const fieldsValue = this.filterFormRef.current ? this.filterFormRef.current.getFieldsValue() : {};
    const { creationDateFrom, creationDateTo } = fieldsValue;
    fieldsValue.creationDateFrom = creationDateFrom
      ? moment(creationDateFrom).format(DEFAULT_DATETIME_FORMAT)
      : null;
    fieldsValue.creationDateTo = creationDateTo
      ? moment(creationDateTo).format(DEFAULT_DATETIME_FORMAT)
      : null;

    this.setState({ exportLoading: true });
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/export-task-excel`, {
      method: 'GET',
      responseType: 'text',
      query: filterNullValueObject(fieldsValue),
    }).then((res) => {
      if (res && res.includes('failed')) {
        this.setState({ exportLoading: false });
        notification.error({ message: JSON.parse(res).message });
      } else {
        const tenantId = getCurrentOrganizationId();
        const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
        const queryParams = [
          { name: 'url', value: encodeURIComponent(res) },
          { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
        ];
        downloadFileByAxios({ requestUrl: api, queryParams }).finally(() => {
          this.setState({ exportLoading: false });
        });
      }
    });
  }

  render() {
    const {
      fetchListLoading = false,
      cancelLoading = false,
      match,
      excelAsyncExport: { pagination = {}, excelAsyncExportList = [], typeList = [] },
    } = this.props;
    const { modalVisible, errorInfo, exportLoading, defaultStartTime } = this.state;
    const columns = [
      {
        title: intl
          .get('hpfm.excelAsyncExport.model.excelAsyncExport.templateName')
          .d('导出模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.taskName').d('任务名称'),
        dataIndex: 'taskName',
      },
      {
        title: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.loginName').d('导出人账号'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.realName').d('导出人'),
        dataIndex: 'realName',
        width: 150,
      },
      {
        title: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.state').d('任务状态'),
        width: 120,
        dataIndex: 'state',
        render: (val, record) => {
          const statusColor = {
            DONE: 'green',
            CANCELLED: 'geekblue',
            FAILED: 'red',
          };
          return <Tag color={statusColor[val]}>{record.stateMeaning}</Tag>;
        },
      },
      {
        title: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.creationDate').d('提交时间'),
        dataIndex: 'creationDate',
        width: 200,
        render: dateTimeRender,
      },
      {
        title: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.exportCount').d('导出数量'),
        dataIndex: 'exportCount',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.errorInfo').d('异常信息'),
        dataIndex: 'errorInfo',
        width: 200,
        render: (_, record) => {
          return (
            <ButtonPermission
              type="text"
              permissionList={[
                {
                  code: `${match.path}.button.errorInfo`,
                  type: 'button',
                  meaning: 'Excel异步导出-异常信息',
                },
              ]}
              onClick={() => {
                this.showModal(record);
              }}
            >
              {record.errorInfo}
            </ButtonPermission>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('hpfm.excelAsyncExport.view.message.title.excelAsyncExport')
            .d('异步导出监控')}
        >
          <Button
            type="primary"
            icon="export"
            onClick={this.handleExportLog}
            loading={exportLoading}
          >
            {intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.exportLog').d('记录日志导出')}
          </Button>
        </Header>
        <Content>
          <FilterForm onSearch={this.handleSearch} ref={this.filterFormRef} typeList={typeList} defaultStartTime={defaultStartTime} />
          <Table
            bordered
            rowKey="taskId"
            loading={fetchListLoading || cancelLoading}
            dataSource={excelAsyncExportList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <Drawer
            title={intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.errorInfo').d('异常信息')}
            modalVisible={modalVisible}
            onCancel={this.hideModal}
            initData={errorInfo}
            tenantId={getCurrentOrganizationId()}
          />
        </Content>
      </React.Fragment>
    );
  }
}
