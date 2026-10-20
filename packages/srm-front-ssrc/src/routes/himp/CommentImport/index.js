/**
 * 通用导入模块
 * 由于 需要被几个页面用到, 所以需要将 model 换成 state
 * @since 2018-9-12
 * @version 0.0.1
 * @author  fushi.wang <fushi.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { isEmpty, isNil, toSafeInteger } from 'lodash';
import queryString from 'query-string';
import { Button, Dropdown, Form, Icon, Menu, Select, Progress, Modal, Tooltip } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { withRouter } from 'dva/router';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { API_HOST, HZERO_IMP } from 'utils/config';
import { updateTab, closeTab } from 'utils/menuTab';
import { createPagination, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DEBOUNCE_TIME } from 'utils/constants';
import { isPubPage } from '@/utils/utils';

import { downloadFile, queryMapIdpValue } from 'hzero-front/lib/services/api';

import {
  importData,
  loadDataSource,
  loadTemplate,
  queryStatus,
  updateOne,
  validateData,
  queryImportHistory,
  deleteImportHistory,
} from '../services/commentImportService';

import UploadExcel from './UploadExcel';
import List from './List';
import './index.less';
import DataImportHistory from './DataImportHistory';

const AUTO_REFRESH_DEBOUNCE = 5000;

@formatterCollections({ code: ['himp.comment', 'himp.commentImport'] })
@withRouter
export default class CommentImport extends PureComponent {
  autoReloadTimer; // 自动刷新的 定时器

  constructor(props) {
    super(props);

    const {
      location: { search = '' },
    } = props;
    const isDisabled = this.props.location.pathname.includes(
      'ssrc/offline-result-entry/comment-import'
    );
    const {
      sync = false,
      auto = false,
      prefixPatch,
      args = 'null',
      autoRefreshInterval,
      backPath,
      routerPath,
      tenantId = getCurrentOrganizationId(),
    } = queryString.parse(search);
    this.autoRefreshInterval = toSafeInteger(autoRefreshInterval) || AUTO_REFRESH_DEBOUNCE;
    this.state = {
      dynamicColumns: [], // 动态列
      dataSource: [], // 数据源
      pagination: false, // 后端分页
      batch: null, // 批次号
      status: null, // 状态
      defaultSheet: '', // 默认sheet
      templateTargetList: [], // 模板sheet数据
      sync: sync === 'true', // 是否是同步的接口
      auto: auto === 'true', // 是否是 同步自动的接口
      // 兼容 两个模式, 1: 使用者指定前缀, 2: 前缀由服务端确认
      backPath: backPath || undefined, // 返回地址, 如果返回地址为空, 设置为 undefined
      prefixPatch, // 客户端路径前缀
      importStatus: [], // 数据导入状态
      // searchDataImportStatus: '', // 数据导入状态查询条件
      // // count: 0, // 导入数据总数
      // // ready: 0, // 已完成导入数据条数
      args: JSON.parse(args), // 上传文件时传递的数据
      historyVisible: false, //
      tenantId, // 租户id, 是可配置的
      routerPath, // 成功导入以后的跳转
      isDisabled, // 判断是否是从线下寻源结果录入页面跳转过来的导入
    };
  }

  init() {
    queryMapIdpValue({
      importStatus: 'HIMP.DATA_STATUS',
      dataImportStatus: 'HIMP.IMPORT_STATUS',
    }).then((res) => {
      const responseRes = getResponse(res);
      if (responseRes) {
        this.setState(responseRes);
      }
    });
  }

  componentDidMount() {
    const { match = {}, location } = this.props;
    const { params } = match;
    if (params.code) {
      this.getTemplate();
    }
    this.init();
    const { search } = location;
    // FIXME: 如果其他地方也需要通用导入
    const { action, key } = queryString.parse(search);
    // 更新 tab 的标题
    updateTab({
      key,
      title: action,
    });
  }

  componentWillUnmount() {
    this.handleToggleAutoRefresh.cancel();
  }

  /**
   * 获取模板(动态列, 客户端前缀)
   */
  @Bind()
  getTemplate() {
    const { match = {} } = this.props;
    const { params = {} } = match;
    const { prefixPatch = '', tenantId } = this.state;
    this.showLoading('loadTemplateLoading');
    loadTemplate({ code: params.code, prefixPatch, tenantId })
      .then((res) => {
        const parsedRes = getResponse(res);
        if (parsedRes) {
          const { prefixPatch: newPrefixPatch = '', templateType, templateTargetList = [] } = res;
          const { templateLineList = [] } = templateTargetList[0] || {};
          const defaultSheet = templateTargetList[0] && templateTargetList[0].sheetIndex;
          this.setState({
            prefixPatch: newPrefixPatch || prefixPatch || (templateType === 'C' ? '' : HZERO_IMP),
            templateTargetList,
            defaultSheet,
            dynamicColumns: templateLineList.map((n) => ({
              title: n.columnName,
              dataIndex: n.columnCode,
              width: n.columnName.length * 16 + 32,
              columnType: n.columnType,
              required: n.nullable,
              editable: true, // 可编辑控制
            })),
          });
        }
      })
      .finally(() => {
        this.hiddenLoading('loadTemplateLoading');
      });
  }

  /**
   * 导入状态查询状态改变
   */
  @Bind()
  handleDataImportStatusChange(value) {
    this.setState(
      {
        searchDataImportStatus: value,
      },
      () => {
        this.getDataSource();
      }
    );
  }

  /**
   * 切换sheet页
   * @param {string} value - sheet页code
   */
  @Bind()
  handleChangeSheet(value) {
    const { templateTargetList = [] } = this.state;
    const selectSheet =
      templateTargetList.find((item) => {
        return item.sheetIndex === value;
      }) || {};
    const { templateLineList = [] } = selectSheet;
    // 获取不同sheet页的模板列
    if (templateLineList) {
      this.setState({
        dynamicColumns: templateLineList.map((n) => ({
          title: n.columnName,
          dataIndex: n.columnCode,
          width: n.columnName.length * 25,
          columnType: n.columnType,
          required: n.nullable,
          editable: true, // 可编辑控制
        })),
      });
    } else {
      this.setState({
        dynamicColumns: [],
      });
    }
    this.setState(
      {
        defaultSheet: value,
      },
      () => {
        this.getDataSource();
      }
    );
  }

  /**
   * 设置loading
   * 将 [loadingStateStr] 置为 true
   * @param {string} loadingStateStr
   */
  @Bind()
  showLoading(loadingStateStr) {
    this.setState({
      [loadingStateStr]: true,
    });
  }

  /**
   * 取消loading
   * 将 [loadingStateStr] 置为 false
   * @param {string} loadingStateStr
   */
  @Bind()
  hiddenLoading(loadingStateStr) {
    this.setState({
      [loadingStateStr]: false,
    });
  }

  /**
   * 上传excel成功后设置批次号
   * 成功后自动刷新状态 和 数据
   * @param {string} batch - 批次号
   */
  @Bind()
  uploadSuccess(batch) {
    this.setState({ batch });
    this.refresh('', 'true');
  }

  /**
   * 获取导入的数据
   * @param {object} [pagination={}] 查询参数
   */
  @Bind()
  getDataSource(pagination = {}, jumpFlag) {
    const { match: { params: { code } = {}, path = null } = {}, location } = this.props;
    const {
      prefixPatch,
      batch,
      sync,
      searchDataImportStatus,
      defaultSheet,
      tenantId,
      routerPath,
    } = this.state;
    const { search } = location;
    const { key } = queryString.parse(search);
    this.setState({
      loadDataSourceLoading: true,
      cachePagination: pagination,
    });
    loadDataSource(
      { sync, templateCode: code, batch, prefixPatch, tenantId },
      {
        sheetIndex: defaultSheet,
        status: searchDataImportStatus,
        ...pagination,
      }
    )
      .then((res) => {
        const dataSource = getResponse(res);
        if (dataSource) {
          const { content = [] } = dataSource;
          const formatData = content.map((item) => {
            const { _data = '{}', ...reset } = item;
            const newData = JSON.parse(_data);
            return { ...newData, ...reset };
          });
          this.setState({
            dataSource: formatData,
            pagination: createPagination(dataSource),
          });
          if (
            content[0] &&
            content.every((item) => item._dataStatus === 'IMPORT_SUCCESS') &&
            jumpFlag &&
            routerPath
          ) {
            this.props.history.push(isPubPage(path, routerPath));
            closeTab(key);
          }
        }
      })
      .finally(() => {
        this.hiddenLoading('loadDataSourceLoading');
      });
  }

  /**
   * 获取当前状态
   * @param {object} params
   * @param {object} options - 配置
   * @param {boolean} [options.showMessage=true] - 是否显示信息
   */
  @Bind()
  fetchStatus(params = {}, options = { showMessage: true }, jumpFlag) {
    const { prefixPatch, sync, tenantId } = this.state;
    queryStatus({ sync, prefixPatch, tenantId }, params)
      .then((res) => {
        this.showLoading('queryStatusLoading');
        const statusRes = getResponse(res);
        if (statusRes) {
          this.setState({
            status: statusRes.status,
            count: statusRes.count,
            ready: statusRes.ready,
          });
          if (options.showMessage) {
            notification.success({
              message: intl.get('himp.comment.view.message.title.refreshSuccess').d('刷新成功'),
              description: intl
                .get('himp.comment.view.message.title.currentStatus', { name: res.statusMeaning })
                .d(`当前数据状态：${res.statusMeaning}`),
            });
          }
        }
        // 当状态是数据导入完成时，获取导入数据
        if (statusRes?.status) {
          const { cachePagination } = this.state;
          this.getDataSource(cachePagination, jumpFlag);
        }
      })
      .finally(() => {
        this.hiddenLoading('queryStatusLoading');
      });
  }

  /**
   * 模板下载 菜单点击
   */
  @Bind()
  handleDownloadTemplateClick(e) {
    if (e.key === 'excel') {
      this.handleDownloadTemplateExcel();
    } else if (e.key === 'csv') {
      this.handleDownloadTemplateCSV();
    }
  }

  /**
   * 下载 excel 模板
   */
  @Bind()
  handleDownloadTemplateExcel() {
    const {
      match: { params },
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    const { prefixPatch } = this.state;
    const api = `${API_HOST}${prefixPatch}/v1/${organizationId}/import/template/${params.code}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'type', value: 'bpmn20' }] });
  }

  /**
   * 下载 CSV 模板
   */
  @Bind()
  handleDownloadTemplateCSV() {
    const {
      match: { params },
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    const { prefixPatch } = this.state;
    const api = `${API_HOST}${prefixPatch}/v1/${organizationId}/import/template/${params.code}/csv`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'type', value: 'bpmn20' }] });
  }

  /**
   * 校验数据
   */
  @Bind()
  validateData() {
    const { match } = this.props;
    const { prefixPatch, batch, sync, tenantId } = this.state;
    const { params } = match;
    if (batch) {
      if (!isEmpty(prefixPatch)) {
        this.showLoading('validateDataLoading');
        validateData({
          sync,
          templateCode: params.code,
          batch,
          prefixPatch,
          tenantId,
        })
          .then((res) => {
            const validateRes = getResponse(res);
            if (validateRes) {
              this.refresh();
            }
          })
          .finally(() => {
            this.hiddenLoading('validateDataLoading');
          });
      } else {
        notification.error({
          description: intl
            .get(`himp.comment.view.message.error.notConfigured`)
            .d('模板客户端路径前缀未配置'),
        });
      }
    } else {
      notification.error({
        description: intl.get(`himp.comment.view.message.error.ImportFile`).d('请上传导入文件'),
      });
    }
  }

  /**
   * 导入数据
   */
  @Bind()
  importData() {
    const { match } = this.props;
    const { prefixPatch, batch, sync, tenantId } = this.state;
    const { params } = match;
    if (batch) {
      if (!isEmpty(prefixPatch)) {
        this.showLoading('importDataLoading');
        importData({
          templateCode: params.code,
          sync,
          batch,
          prefixPatch,
          tenantId,
        })
          .then((res) => {
            const importDataRes = getResponse(res);
            if (importDataRes) {
              this.refresh();
            }
          })
          .finally(() => {
            this.hiddenLoading('importDataLoading');
          });
      } else {
        notification.error({
          message: intl
            .get(`himp.comment.view.message.error.notConfigured`)
            .d('模板客户端路径前缀未配置'),
        });
      }
    } else {
      notification.error({
        message: intl.get(`himp.comment.view.message.error.ImportFile`).d('请上传导入文件'),
      });
    }
  }

  /**
   * 保存单条编辑数据
   * @param {object} form - 表单
   * @param {number} _id - 导入数据记录的id
   * @param {Function} cb - 关闭编辑模式
   */
  @Bind()
  save(form, _id, cb = (e) => e) {
    const { prefixPatch, sync, tenantId } = this.state;
    this.showLoading('updateOneLoading');
    form.validateFields((error, row) => {
      if (!isEmpty(error)) {
        this.hiddenLoading('updateOneLoading');
        return;
      }
      updateOne({
        sync,
        _id,
        prefixPatch,
        data: row,
        tenantId,
      })
        .then((res) => {
          const updateOneRes = getResponse(res);
          if (updateOneRes) {
            cb();
            this.refresh();
          }
        })
        .finally(() => {
          this.hiddenLoading('updateOneLoading');
        });
    });
  }

  /**
   * 刷行状态和数据
   * @param {object} options - fetchStatus 的配置
   */
  @Bind()
  refresh(options, jumpFlag) {
    const { batch } = this.state;
    if (batch) {
      this.fetchStatus({ batch }, options, jumpFlag);
    }
  }

  @Bind()
  handleRefresh() {
    this.refresh();
  }

  /**
   * 切换 自动刷新
   */
  @Debounce(DEBOUNCE_TIME)
  @Bind()
  handleToggleAutoRefresh() {
    if (isNil(this.autoReloadTimer)) {
      this.autoReloadTimer = setInterval(() => {
        this.refresh({ showMessage: false });
      }, this.autoRefreshInterval);
      // 直接先刷新一遍
      this.refresh({ showMessage: false });
    } else {
      clearInterval(this.autoReloadTimer);
      this.autoReloadTimer = null;
      // 强制更新状态
      this.forceUpdate();
    }
  }

  // Table
  @Bind()
  handleTableChange(page, filter, sort) {
    this.getDataSource({ page, sort });
  }

  // SearchForm

  /**
   * 临时数据导出
   * @param e
   */
  @Bind()
  handleTemporaryDataExportClick(e) {
    const {
      match: {
        params: { code: templateCode },
      },
    } = this.props;
    const { prefixPatch, batch, defaultSheet, searchDataImportStatus } = this.state;
    const organizationId = getCurrentOrganizationId();
    if (['excel', 'csv'].includes(e.key)) {
      const api = `${API_HOST}${prefixPatch}/v1/${organizationId}/import/manager/export/${e.key}`;
      downloadFile({
        requestUrl: api,
        queryParams: [
          { name: 'sheetIndex', value: defaultSheet },
          { name: 'batch', value: batch },
          { name: 'status', value: searchDataImportStatus },
          { name: 'templateCode', value: templateCode },
        ].filter((param) => {
          return param.value !== undefined && param.value !== null;
        }),
      });
    }
  }

  @Bind()
  handleHistoryBtnClick() {
    this.setState({
      historyVisible: true,
    });
  }

  @Bind()
  handleHistoryModalOk() {
    // TODO: 确认
    this.setState({
      historyVisible: false,
    });
  }

  @Bind()
  handleHistoryModalCancel() {
    this.setState({
      historyVisible: false,
    });
  }

  /**
   * 查询历史记录
   * @param query
   * @return {Promise<void>}
   */
  @Bind()
  async handleQueryImportHistory(query) {
    const {
      match: {
        params: { code: templateCode },
      },
    } = this.props;
    const { prefixPatch, tenantId } = this.state;
    const res = await queryImportHistory({ templateCode, prefixPatch, tenantId }, query);
    return res;
  }

  /**
   * 恢复导入批次
   * @return {Promise<void>}
   */
  @Bind()
  async handleHistoryRecordRestore(record) {
    // 恢复 还需要清空其他数据
    if (!isNil(this.autoReloadTimer)) {
      clearInterval(this.autoReloadTimer);
      this.autoReloadTimer = null;
    }
    this.setState(
      {
        batch: record.batch,
        historyVisible: false,
      },
      () => {
        this.refresh();
      }
    );
  }

  /**
   * 删除批次
   * @return {Promise<void>}
   */
  @Bind()
  async handleHistoryRecordDelete(record) {
    const { prefixPatch, tenantId } = this.state;
    return deleteImportHistory({ prefixPatch, tenantId }, [record]);
  }

  render() {
    const { match = {}, location } = this.props;
    const { params, path = null } = match;
    const { search } = location;
    const { action } = queryString.parse(search);
    const {
      defaultSheet,
      dynamicColumns = [],
      templateTargetList = [],
      dataSource = [],
      pagination,
      prefixPatch,
      batch,
      status,
      loadTemplateLoading,
      validateDataLoading,
      importDataLoading,
      queryStatusLoading,
      loadDataSourceLoading,
      updateOneLoading,
      sync,
      auto,
      importStatus = [],
      dataImportStatus,
      searchDataImportStatus,
      count,
      ready,
      args,
      historyVisible = false,
      backPath,
      tenantId,
      isDisabled, // 如果从线下寻源结果录入来的，隐藏下载模板按钮
    } = this.state;

    const uploadExcelProps = {
      args,
      sync,
      auto,
      prefixPatch,
      templateCode: params.code,
      success: this.uploadSuccess,
      tenantId,
    };
    const listProps = {
      dynamicColumns,
      dataSource,
      pagination,
      importStatus,
      onChange: this.handleTableChange,
      processing: {
        queryColumns: loadTemplateLoading,
        loading:
          loadTemplateLoading ||
          validateDataLoading ||
          importDataLoading ||
          loadDataSourceLoading ||
          updateOneLoading,
      },
      save: this.save,
    };

    const isAutoRefresh = !isNil(this.autoReloadTimer);

    const templateDownloadMenu = (
      <Menu onClick={this.handleDownloadTemplateClick}>
        <Menu.Item key="excel">
          <Icon type="excel" />
          {intl.get('himp.comment.view.button.templateExcel').d('EXCEL')}
        </Menu.Item>
        <Menu.Item key="csv">
          <Icon type="csv" />
          {intl.get('himp.comment.view.button.templateCSV').d('CSV')}
        </Menu.Item>
      </Menu>
    );

    const temporaryDataExportMenu = (
      <Menu onClick={this.handleTemporaryDataExportClick}>
        <Menu.Item key="excel">
          <Icon type="excel" />
          {intl.get('himp.comment.view.button.templateExcel').d('EXCEL')}
        </Menu.Item>
        <Menu.Item key="csv">
          <Icon type="csv" />
          {intl.get('himp.comment.view.button.templateCSV').d('CSV')}
        </Menu.Item>
      </Menu>
    );

    const isProcessing = ['UPLOADING', 'CHECKING', 'IMPORTING'].includes(status);

    const processElement = isProcessing ? (
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          flexShrink: 0,
          fontSize: 12,
          alignItems: 'center',
          width: 150,
        }}
      >
        <Progress
          size="small"
          percent={count === 0 ? 0 : (ready * 100) / count}
          status={count === 0 || count !== ready ? 'active' : 'success'}
        />
      </div>
    ) : null;

    return (
      <React.Fragment>
        <Header backPath={isPubPage(path, backPath)} title={action}>
          <Dropdown overlay={templateDownloadMenu}>
            <Button type="primary" style={{ display: isDisabled ? 'none' : 'block' }}>
              {intl.get('himp.comment.view.button.downloadTemplate').d('下载模板')}
              <Icon type="down" />
            </Button>
          </Dropdown>
          <UploadExcel {...uploadExcelProps} disabled={!!batch} />
          {!auto && (
            <React.Fragment key="noAutoSync">
              <Button
                key="validate"
                icon="check-circle-o"
                onClick={this.validateData}
                disabled={status !== 'UPLOADED' && status !== 'CHECKED'}
                loading={validateDataLoading}
              >
                {intl.get('himp.comment.view.button.validateData').d('数据验证')}
              </Button>
              <Button
                key="import"
                icon="to-top"
                onClick={this.importData}
                disabled={updateOneLoading || status !== 'CHECKED'}
                loading={importDataLoading}
              >
                {intl.get('himp.comment.view.button.importData').d('数据导入')}
              </Button>
            </React.Fragment>
          )}
          <Button
            key="refresh"
            icon="sync"
            onClick={this.handleRefresh}
            disabled={updateOneLoading || !batch}
            loading={queryStatusLoading || loadDataSourceLoading}
          >
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button>
          <Button
            key="auto-refresh"
            icon={isAutoRefresh ? 'loading' : 'sync'}
            onClick={this.handleToggleAutoRefresh}
            disabled={updateOneLoading || !batch}
            loading={queryStatusLoading || loadDataSourceLoading}
          >
            {isAutoRefresh
              ? intl.get('hzero.common.button.cancelAutoReload').d('取消自动刷新')
              : intl.get('hzero.common.button.autoReload').d('自动刷新')}
          </Button>
          <Button icon="profile" onClick={this.handleHistoryBtnClick}>
            {intl.get('himp.commentImport.view.button.history').d('历史记录')}
          </Button>
        </Header>
        <Content>
          <Form layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item
              label={intl.get('himp.commentImport.model.commentImport.sheetIndex').d('Sheet')}
            >
              <Select
                disabled={!batch}
                style={{ minWidth: 100 }}
                value={defaultSheet}
                onChange={this.handleChangeSheet}
              >
                {templateTargetList.map((item) => {
                  return (
                    <Select.Option value={item.sheetIndex} key={item.sheetIndex}>
                      {item.sheetIndexMeaning}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              label={intl.get('himp.commentImport.model.commentImport.status').d('导入状态')}
            >
              <Select
                allowClear
                disabled={!status}
                value={searchDataImportStatus}
                style={{ minWidth: 150 }}
                onChange={this.handleDataImportStatusChange}
              >
                {importStatus.map((item) => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item>
              <Dropdown
                disabled={!batch || !status || status === 'UPLOADING'}
                overlay={temporaryDataExportMenu}
              >
                <Button>{intl.get('himp.comment.view.button.export').d('数据导出')}</Button>
              </Dropdown>
            </Form.Item>
            {isProcessing ? (
              <Form.Item
                label={
                  <span>
                    {intl.get('himp.commentImport.view.title.process').d('进度')}&nbsp;
                    <Tooltip
                      title={intl
                        .get('himp.commentImport.view.message.processHelp')
                        .d('需要刷新，才能更新进度')}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
                style={{ textAlign: 'right' }}
              >
                {processElement}
              </Form.Item>
            ) : null}
          </Form>
          <List {...listProps} />
          <Modal
            destroyOnClose
            width={1000}
            wrapClassName="ant-modal-sidebar-right"
            transitionName="move-right"
            title={intl.get('himp.commentImport.view.title.history').d('导入历史')}
            visible={historyVisible}
            onCancel={this.handleHistoryModalCancel}
            onOk={this.handleHistoryModalOk}
          >
            <DataImportHistory
              dataImportStatus={dataImportStatus}
              queryImportHistory={this.handleQueryImportHistory}
              onRecordRestore={this.handleHistoryRecordRestore}
              onRecordDelete={this.handleHistoryRecordDelete}
            />
          </Modal>
        </Content>
      </React.Fragment>
    );
  }
}
