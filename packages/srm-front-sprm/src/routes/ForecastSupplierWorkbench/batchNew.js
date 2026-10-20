/**
 * 价格库批量创建
 * @date: 2020-08-13
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Table, Button, Dropdown, Icon, Menu, Select } from 'choerodon-ui/pro';
import { Button as HzeroButton } from 'hzero-ui';
import { Modal } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil } from 'lodash';
import querystring from 'querystring';
import moment from 'moment';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { TagRender } from 'utils/renderer';
import { DEBOUNCE_TIME } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { API_HOST } from 'utils/config';
import {
  downloadFileByAxios,
  queryMapIdpValue,
  initiateAsyncExport,
} from 'hzero-front/lib/services/api';
import { updateTab } from 'utils/menuTab';
import { SRM_SPC, SRM_SPRM } from '_utils/config';

import {
  queryImportTemplate,
  queryStatus,
  validateData,
  importData,
  queryImportHistory,
  deleteImportHistory,
} from '@/services/forecastTemplateDefOrgService';
import { importDs, searchDS } from './indexDs';
import UploadExcel from './UploadExcel';
import DataImportHistory from './DataImportHistory';
// import style from './index.less';

const tenantId = getCurrentOrganizationId();
const { Sidebar } = Modal;

@cuxRemote(
  {
    code: 'SPRM_FORECAST_BATCHNEW_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {},
  }
)
@formatterCollections({ code: ['ssrc.priceLibBatchCreate', 'himp.comment'] })
export default class PriceLibBatchCreate extends PureComponent {
  autoReloadTimer; // 自动刷新的 定时器

  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.autoRefreshInterval = 5000;
    this.state = {
      routerParams,
      columnList: [], // 动态列
      batch: null, // 批次号
      historyVisible: false, //
      status: null, // 状态
    };
  }

  // queryFormDs = new DataSet(queryFormDS());

  tableDs = new DataSet(importDs());

  searchDs = new DataSet(searchDS());

  componentDidMount() {
    console.log(23323223, 23233);
    // 请求配置头
    this.queryImportTemplate();
    // 查询已发布的模板编码
    this.queryTemplateCode();
    this.init();
    this.updateTabName();

  }

  // getSnapshotBeforeUpdate(prevProps, preState) {
  //   const { lotNum } = preState;
  //   const {
  //     location: { search },
  //   } = this.props;
  //   const { lotNum: nextLotNum } = parse(search.substr(1));
  //   if (nextLotNum && lotNum !== nextLotNum) {
  //     return nextLotNum;
  //   } else {
  //     return false;
  //   }

  getSnapshotBeforeUpdate(preProps, preState) {
    const updateRouters = querystring.parse(this.props.location.search.substr(1));
    const { templateHeaderId } = updateRouters;
    if ((templateHeaderId !== preState?.routerParams.templateHeaderId)) {
      // this.setState({ routerParams: querystring.parse(this?.props.location.search.substr(1)) }, () => { })
      return true;
    }
    return false;
  }

  componentDidUpdate(pre, prestate, snapshot) {
    if (snapshot) {
      this.setState({ routerParams: querystring.parse(this?.props.location.search.substr(1)) }, () => { })
      // return true;
    }
  }



  componentWillUnmount() {
    if (!isNil(this.autoReloadTimer)) {
      clearInterval(this.autoReloadTimer);
    }
    this.handleToggleAutoRefresh.cancel();
  }

  init() {
    queryMapIdpValue({
      importStatus: 'HIMP.DATA_STATUS',
      dataImportStatus: 'HIMP.IMPORT_STATUS',
    }).then(res => {
      const responseRes = getResponse(res);
      if (responseRes) {
        this.setState(responseRes);
      }
    });
  }

  @Bind()
  updateTabName() {
    const {
      match: { params = {} },
    } = this.props;
    if (params.templateCode) {
      updateTab({
        key: `/ssrc/price-library-new/${params.templateCode}/comment-import`,
        title: 'hzero.common.button.priceImport',
      });
    }
  }

  /**
   * 渲染时间日期渲染格式
   */
  @Bind()
  renderDateFormat(dateFormat) {
    let format;
    switch (dateFormat) {
      case 'yyyy-MM-dd':
        format = 'YYYY-MM-DD';
        break;
      case 'yyyy/MM/dd':
        format = 'YYYY/MM/DD';
        break;
      case 'yyyy-MM-dd hh:mm:ss':
        format = 'YYYY-MM-DD hh:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD hh:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  /**
   * 渲染fieldType
   */
  @Bind()
  renderFieldType(field) {
    let fieldConfig = {};
    switch (field.fieldType) {
      case 'UPLOAD':
      case 'LINK':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'INPUT':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          // multiple: Number(field.multipleFlag) === 1 ? ',' : false,
        };
        break;
      case 'LOV':
        fieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          textField: field.displayField,
          valueField: field.valueField,
          // multiple: Number(field.multipleFlag) === 1,
          // transformRequest: value => (isObject(value) ? value[field.valueField] : value),
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
          step:
            field.numberPrecision || field.numberPrecision === 0
              ? 1 / 10 ** field.numberPrecision
              : null,
          min: field.numberMin !== null ? field.numberMin : undefined,
          max: field.numberMax !== null ? field.numberMax : undefined,
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
          transformRequest: val =>
            val &&
            moment(val).format(
              field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                ? 'YYYY-MM-DD hh:mm:ss'
                : 'YYYY-MM-DD 00:00:00'
            ),
        };
        break;
      case 'SWITCH':
        fieldConfig = {
          type: 'string',
          // trueValue: 1,
          // falseValue: 0,
        };
        break;
      default:
        fieldConfig = {
          type: 'string',
        };
        break;
    }
    return fieldConfig;
  }

  @Bind()
  async queryTemplateCode() {
    const { routerParams } = this.state;
    const { templateCode } = routerParams;
    this.tableDs.setQueryParameter('templateCode', templateCode);
  }

  /**
   * 查询头
   */
  @Bind()
  async queryImportTemplate() {
    const { routerParams } = this.state;
    const { templateHeaderId } = routerParams;
    const { remote } = this.props;
    const params = remote.process('SPRM_FORECAST_BATCHNEW_IMPORT_TEMPLATE', { templateHeaderId }, {remotThis: this});
    const result = getResponse(await queryImportTemplate(params));
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const columnList = [];
      list.forEach(item => {
        if (item.fieldType) {
          this.tableDs.addField(item.fieldCode, {
            name: item.fieldCode,
            label: item.fieldName,
            ...this.renderFieldType(item),
          });
        }
        if (item.fieldType) {
          columnList.push({
            name: item.fieldCode,
            tooltip: 'overflow',
          });
        }
      });
      this.setState({ columnList });
    }
  }

  /**
   * 获取导入的数据
   * @param {object} [pagination={}] 查询参数
   */
  @Bind()
  async getDataSource() {
    const { batch } = this.state;
    if (batch) {
      const formValues = this.queryFormDs?.current?.toData();
      const params = {
        batch,
        ...formValues,
      };
      this.tableDs.setQueryParameter('params', params);
      this.tableDs.setQueryParameter('sheetIndex', 0);
      this.tableDs.query();
    } else {
      notification.warning({
        message: intl.get('ssrc.priceLibBatchCreate.view.message.tip.noImport').d('未导入数据'),
      });
    }
  }

  /**
   * 获取当前状态
   * @param {object} params
   * @param {object} options - 配置
   * @param {boolean} [options.showMessage=true] - 是否显示信息
   */
  @Bind()
  fetchStatus(params = {}, options = { showMessage: true }) {
    const { routerParams } = this.state;
    const { templateHeaderId, templateCode } = routerParams;
    queryStatus({ ...params, templateCode, templateHeaderId })
      .then(res => {
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
              message: intl
                .get('ssrc.priceLibBatchCreate.view.message.title.refreshSuccess')
                .d('刷新成功'),
              description: intl
                .get('ssrc.priceLibBatchCreate.view.message.title.currentStatus', {
                  name: res.statusMeaning,
                })
                .d(`当前数据状态：${res.statusMeaning}`),
            });
          }
          this.getDataSource();
        }
        // 当状态是数据导入完成时，获取导入数据，如有定时器，清除定时器
        if (statusRes?.status === 'IMPORTED') {
          if (!isNil(this.autoReloadTimer)) {
            clearInterval(this.autoReloadTimer);
            this.autoReloadTimer = null;
          }
          this.getDataSource();
        }
      })
      .finally(() => {
        this.hiddenLoading('queryStatusLoading');
      });
  }

  /**
   * 刷行状态和数据
   * @param {object} options - fetchStatus 的配置
   */
  @Bind()
  refresh(options) {
    const { batch } = this.state;
    if (batch) {
      this.fetchStatus({ batch }, options);
    }
  }

  /**
   * 切换 自动刷新
   */
  @Debounce(DEBOUNCE_TIME)
  @Bind()
  handleToggleAutoRefresh() {
    if (isNil(this.autoReloadTimer)) {
      this.autoReloadTimer = setInterval(() => {
        this.refresh();
      }, this.autoRefreshInterval);
      // 直接先刷新一遍
      this.refresh();
    } else {
      clearInterval(this.autoReloadTimer);
      this.autoReloadTimer = null;
      // 强制更新状态
      this.forceUpdate();
    }
  }

  /**
   * 上传excel成功后设置批次号
   * 成功后自动刷新状态 和 数据
   * @param {string} batch - 批次号
   */
  @Bind()
  uploadSuccess(batch) {
    this.setState({ batch }, () => {
      this.refresh();
    });
  }

  /**
   * 校验数据
   */
  @Bind()
  validateData() {
    const {
      match: { params },
    } = this.props;
    const { batch } = this.state;
    if (batch) {
      this.showLoading('validateDataLoading');
      validateData({
        templateCode: params.templateCode,
        batch,
        tenantId,
      })
        .then(res => {
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
          .get(`ssrc.priceLibBatchCreate.view.message.error.ImportFile`)
          .d('请上传导入文件'),
      });
    }
  }

  /**
   * 导入数据
   */
  @Bind()
  importData() {
    const {
      match: { params },
    } = this.props;
    const { batch } = this.state;
    if (batch) {
      this.showLoading('importDataLoading');
      importData({
        templateCode: params.templateCode,
        batch,
        tenantId,
      })
        .then(res => {
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
          .get(`ssrc.priceLibBatchCreate.view.message.error.ImportFile`)
          .d('请上传导入文件'),
      });
    }
  }

  /**
   * 模板下载 菜单点击
   */
  @Bind()
  handleDownloadTemplateClick(e) {
    if (e.key === 'excel') {
      this.handleDownloadTemplateExcel();
    }
  }

  /**
   * 下载 excel 模板
   */
  @Bind()
  handleDownloadTemplateExcel() {
    const organizationId = getCurrentOrganizationId();
    // const {
    //   match: { params },
    // } = this.props;
    // /v1/{organizationId}/fcst-headers/excel/export  exportType=DATA
    const { routerParams } = this.state;
    const { remote } = this.props;
    const { templateHeaderId } = routerParams;
    const api = `${API_HOST}${SRM_SPRM}/v1/${organizationId}/fcst-headers/excel/export`;
    const queryData = remote.process('SPRM_FORECAST_BATCHNEW_EXCEL', { templateHeaderId }, {remoteThis: this});
    initiateAsyncExport({
      requestUrl: api,
      method: 'POST',
      queryParams: [
        { name: 'type', value: 'bpmn20' },
        { name: 'templateHeaderId', value: templateHeaderId },
      ],
      queryData,
    });
  }

  @Bind()
  handleRefresh() {
    this.refresh();
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
    const { templateCode } = this.state;
    return queryImportHistory({ templateCode }, query);
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
    return deleteImportHistory([record]);
  }

  /**
   * 临时数据导出
   */
  @Bind()
  handleExportData() {
    const {
      match: { params },
    } = this.props;
    const { batch } = this.state;
    const organizationId = getCurrentOrganizationId();
    const api = `${API_HOST}${SRM_SPC}/v1/${organizationId}/lib-mains-import/export/excel`;
    downloadFileByAxios({
      requestUrl: api,
      queryParams: [
        { name: 'batch', value: batch },
        { name: 'status', value: this.queryFormDs?.current?.get('status') },
        { name: 'templateCode', value: params.templateCode },
      ].filter(param => param.value !== undefined && param.value !== null),
    });
  }

  /**
   * 返回路由
   */
  @Bind()
  renderBackPath() {
    const url = `/sprm/forecast-supplier-workbench/list`;
    // const url = `/ssrc/price-library-new/${params.templateCode}`;
    return url;
  }

  @Bind()
  seachHandleChange(val) {
    this.tableDs.setQueryParameter('status', val);
    this.tableDs.query();
  }

  /**
   * 获取table列
   */
  get columns() {
    if (this.state && this.state.columnList) {
      return [
        {
          name: '_dataStatus',
          width: 120,
          renderer: ({ value, record }) => {
            const statusList = [
              { status: 'NEW', color: 'blue' /* , text: 'Excel导入' */ },
              { status: 'VALID_SUCCESS', color: 'green' /* , text: '验证成功' */ },
              { status: 'VALID_FAILED', color: 'red' /* , text: '验证失败' */ },
              { status: 'IMPORT_SUCCESS', color: 'green' /* , text: '导入成功' */ },
              { status: 'IMPORT_FAILED', color: 'red' /* , text: '导入失败' */ },
              { status: 'ERROR', color: 'red' /* , text: '数据异常' */ },
            ];
            return <div>{TagRender(value, statusList, record.get('_dataStatusMeaning'))}</div>;
          },
        },
        {
          name: '_info',
          tooltip: 'overflow',
        },
        ...this.state.columnList,
      ];
    }
    return [];
  }

  render() {
    const {
      batch,
      // validateDataLoading,
      // importDataLoading,
      queryStatusLoading,
      historyVisible,
      dataImportStatus = [],
      routerParams,
    } = this.state;
    const { templateHeaderId } = routerParams;
    const {
      match: { params },
      remote,
    } = this.props;
    const { templateCode } = params;
    const uploadExcelProps = {
      remote,
      success: this.uploadSuccess,
      tenantId,
      templateHeaderId,
      routerParams,
    };

    const isAutoRefresh = !isNil(this.autoReloadTimer);

    const templateDownloadMenu = (
      <Menu onClick={this.handleDownloadTemplateClick}>
        <Menu.Item key="excel">
          <Icon type="export" />
          {intl.get('ssrc.priceLibBatchCreate.view.button.templateExcel').d('EXCEL')}
        </Menu.Item>
      </Menu>
    );

    // const statusList = [
    //   { status: 'NEW', color: 'blue' /* , text: 'Excel导入' */ },
    //   { status: 'VALID_SUCCESS', color: 'green' /* , text: '验证成功' */ },
    //   { status: 'VALID_FAILED', color: 'red' /* , text: '验证失败' */ },
    //   { status: 'IMPORT_SUCCESS', color: 'green' /* , text: '导入成功' */ },
    //   { status: 'IMPORT_FAILED', color: 'red' /* , text: '导入失败' */ },
    //   { status: 'ERROR', color: 'red' /* , text: '数据异常' */ },
    // ];

    return (
      <Fragment>
        <Header
          title={intl.get('ssrc.priceLibBatchCreate.view.message.batchNumCreate').d('批量创建')}
          backPath={this.renderBackPath()}
        >
          <Dropdown overlay={templateDownloadMenu}>
            <Button color="primary">
              <Icon type="export" />
              {intl.get('ssrc.priceLibBatchCreate.view.button.downloadTemplate').d('下载模板')}
              <Icon type="keyboard_arrow_down" />
            </Button>
          </Dropdown>
          {/* auto 直接使用数据上传 */}
          <UploadExcel {...uploadExcelProps} />
          {/* <Button
              key="validate"
              icon="finished"
              onClick={this.validateData}
              disabled={!batch || status !== 'UPLOADED'}
              loading={validateDataLoading}
            >
              {intl.get('ssrc.priceLibBatchCreate.view.button.validateData').d('数据验证')}
            </Button>
            <Button
              key="import"
              icon="file_upload"
              onClick={this.importData}
              disabled={!batch || status !== 'CHECKED'}
              loading={importDataLoading}
            >
              {intl.get('ssrc.priceLibBatchCreate.view.button.importData').d('数据导入')}
            </Button> */}
          <Button
            key="refresh"
            icon="sync"
            onClick={this.handleRefresh}
            disabled={!batch}
            loading={queryStatusLoading}
          >
            {intl.get('ssrc.priceLibBatchCreate.view.button.refresh').d('重新加载')}
          </Button>
          <HzeroButton
            key="auto-refresh"
            icon={isAutoRefresh ? 'loading' : 'sync'}
            onClick={this.handleToggleAutoRefresh}
            disabled={!batch}
            loading={queryStatusLoading}
          >
            {isAutoRefresh
              ? intl.get('hzero.common.button.cancelAutoReload').d('取消自动刷新')
              : intl.get('hzero.common.button.autoReload').d('自动刷新')}
          </HzeroButton>
          {templateCode && (
            <Button icon="event_note-o" onClick={this.handleHistoryBtnClick}>
              {intl.get('ssrc.priceLibBatchCreate.view.button.history').d('历史记录')}
            </Button>
          )}
          <Select
            dataSet={this.searchDs}
            name="status"
            placeholder={intl
              .get('ssrc.priceLibBatchCreate.view.title.selectDataStatus')
              .d('请选择数据状态')}
            style={{ fontSize: '12px' }}
            onChange={this.seachHandleChange}
          />
        </Header>
        <Content>
          <Table
            columns={this.columns}
            dataSet={this.tableDs}
            virtual
            virtualCell
            virtualSpin
            style={{ maxHeight: `calc(100vh - 400px)` }}
          />
          <Sidebar
            destroyOnClose
            width={1000}
            wrapClassName="ant-modal-sidebar-right"
            transitionName="move-right"
            title={intl.get('ssrc.priceLibBatchCreate.view.title.history').d('导入历史')}
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
          </Sidebar>
        </Content>
      </Fragment>
    );
  }
}
