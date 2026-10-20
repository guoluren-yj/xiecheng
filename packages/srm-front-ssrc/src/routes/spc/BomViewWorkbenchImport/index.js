/**
 * 价格库批量创建
 * @date: 2020-08-13
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Table, Button, Dropdown, Icon, Menu, Form, Select } from 'choerodon-ui/pro';
import { Button as HzeroButton } from 'hzero-ui';
import { Tabs, Modal } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil } from 'lodash';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { TagRender, yesOrNoRender } from 'utils/renderer';
import { DEBOUNCE_TIME } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { API_HOST } from 'utils/config';
import { downloadFile, queryMapIdpValue } from 'hzero-front/lib/services/api';
import { updateTab } from 'utils/menuTab';
import { SRM_SPC } from '_utils/config';

import {
  queryStatus,
  validateData,
  importData,
  queryImportHistory,
  deleteImportHistory,
} from '@/services/priceLibBatchCreateService';
import { fetchBomLibHeaderConfig } from '@/services/bomViewWorkbenchService';
import { BusinessObject } from '@/routes/spc/BomDimConfig/enum';
import { renderFieldType } from '@/routes/spc/BomViewWorkbench/utils';

import { queryFormDS, BasicInfoDS, DetailInfoDS } from './lineDS';
import UploadExcel from './UploadExcel';
import DataImportHistory from './DataImportHistory';
import style from './index.less';

const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const { Sidebar } = Modal;

@formatterCollections({
  code: [
    'ssrc.priceLibBatchCreate',
    'himp.comment', 'hzero.common',
    'ssrc.priceLibDimension',
    'ssrc.priceLibrary',
    'ssrc.priceService',
    'spc.bomDimConfig',
    'spc.bomViewWorkbench',
    'spc.formulaManage',
  ],
})
export default class BomViewWorkbenchImport extends PureComponent {
  autoReloadTimer; // 自动刷新的 定时器

  commonColumn = [
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
        return <div>{TagRender(value, statusList, record.toData()?._dataStatusMeaning)}</div>;
      },
    },
    {
      name: '_info',
      tooltip: 'overflow',
    },
  ];

  // tableDs = new DataSet();
  tableDs = new DataSet(BasicInfoDS());

  detailTableDs = new DataSet(DetailInfoDS());

  constructor(props) {
    super(props);
    const {
      match: { params },
    } = props;
    const { bomTemplateCode } = params;

    this.autoRefreshInterval = 5000;
    this.state = {
      bomTemplateCode,
      columnList: [], // 动态列
      detailColumnList: [], // 明细动态列
      batch: null, // 批次号
      historyVisible: false, //
      status: null, // 状态
    };
  }

  queryFormDs = new DataSet(queryFormDS());

  componentDidMount() {
    // 请求配置头
    this.handleFetchBomLibHeaderConfig();
    this.init();
    this.updateTabName();
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
    }).then((res) => {
      const responseRes = getResponse(res);
      if (responseRes) {
        this.setState(responseRes);
      }
    });
  }

  @Bind()
  updateTabName() {
    const {
      bomTemplateCode,
    } = this.state;
    if (bomTemplateCode) {
      updateTab({
        key: `/spc/bom-view-workbench/${bomTemplateCode}/comment-import`,
        title: 'hzero.common.title.batchImport',
      });
    }
  }


  /**
   * 查询头
   */
  @Bind()
  async handleFetchBomLibHeaderConfig() {
    const { bomTemplateCode } = this.state;
    const res = await fetchBomLibHeaderConfig({ bomTemplateCode });
    if (getResponse(res)) {
      this.transformColumns(res);
    }
  };

  @Bind()
  transformColumns(data) {
    const columns = [];
    const detailColumns = [];
    data.filter(item => Number(item.bomDimensionVisible)).forEach((item) => {
      const {
        bomDimensionCode,
        bomDimensionName,
        bomDimensionWidth,
        businessObject,
      } = item;

      const dsFiedld = {
        name: bomDimensionCode,
        label: bomDimensionName,
        // ...renderFieldType(item),
      };
      if (businessObject === BusinessObject.HEADER) {
        this.tableDs.addField(bomDimensionCode, dsFiedld);
        columns.push({
          name: bomDimensionCode,
          width: bomDimensionWidth || 120,
          // ...this.extraColumnProps(item),
        });
      } else {
        this.detailTableDs.addField(bomDimensionCode, dsFiedld);
        // 单价单独处理
        if (bomDimensionCode === 'unitPrice') {
          detailColumns.push(
            {
              name: 'dimensionType',
            },
            {
              name: 'dimensionValue',
            },
          );
        } else {
          // 默认放入表格中
          detailColumns.push({
            name: bomDimensionCode,
            width: bomDimensionWidth || 120,
            // ...this.extraColumnProps(item),
          });
        }
      }
    });
    this.setState({
      columnList: [...columns], // 动态列
      detailColumnList: [...detailColumns], // 明细动态列
    });
  };

  extraColumnProps(field) {
    const { bomDimensionWidget } = field;
    if (bomDimensionWidget === 'CHECKBOX') {
      return {
        renderer: ({ value }) => isNil(value) ? '-' : yesOrNoRender(value),
      };
    }
  };


  /**
   * 获取导入的数据
   * @param {object} [pagination={}] 查询参数
   */
  @Bind()
  async getDataSource() {
    const { batch, bomTemplateCode } = this.state;
    if (batch) {
      const formValues = this.queryFormDs?.current?.toData();
      const params = {
        batch,
        templateCode: bomTemplateCode,
        ...formValues,
      };
      this.tableDs.setQueryParameter('params', params);
      this.tableDs.setQueryParameter('sheetIndex', 0);
      this.tableDs.query();
      this.detailTableDs.setQueryParameter('params', params);
      this.detailTableDs.setQueryParameter('sheetIndex', 2);
      this.detailTableDs.query();
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
    queryStatus(params)
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
          // 当状态是数据导入完成时，获取导入数据，如有定时器，清除定时器
          if (statusRes.status === 'IMPORTED') {
            if (!isNil(this.autoReloadTimer)) {
              clearInterval(this.autoReloadTimer);
              this.autoReloadTimer = null;
            }
            this.getDataSource();
          }
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
    const { batch, bomTemplateCode } = this.state;
    if (batch) {
      this.showLoading('validateDataLoading');
      validateData({
        bomTemplateCode,
        batch,
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
        bomTemplateCode: params.bomTemplateCode,
        batch,
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
    const {
      bomTemplateCode,
    } = this.state;
    const api = `${API_HOST}${SRM_SPC}/v1/${organizationId}/price-bom-workbenches/excel/bomTemplate`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'type', value: 'bpmn20' },
        { name: 'bomTemplateCode', value: bomTemplateCode },
      ],
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
    const {
      match: { params },
    } = this.props;
    return queryImportHistory({ templateCode: params.bomTemplateCode }, query);
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
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'batch', value: batch },
        { name: 'status', value: this.queryFormDs?.current?.toData()?.status },
        { name: 'bomTemplateCode', value: params.bomTemplateCode },
      ].filter((param) => param.value !== undefined && param.value !== null),
    });
  }

  /**
   * 获取table列
   */
  get columns() {
    if (this.state && this.state.columnList) {
      return [
        ...this.commonColumn,
        {
          name: 'bomViewCode',
        },
        {
          name: 'bomViewName',
        },
        {
          name: 'companyId',
        },
        {
          name: 'bomViewItemId',
        },
        {
          name: 'bomViewSupplierId',
        },
        {
          name: 'bomTemplateCode',
        },
        ...this.state.columnList,
      ];
    }
    return [];
  }

  /**
  * 获取table列
  */
  get detailColumns() {
    if (this.state && this.state.detailColumnList) {
      return [
        ...this.commonColumn,
        ...this.state.detailColumnList,
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
      status,
    } = this.state;
    const {
      match: { params },
    } = this.props;
    const uploadExcelProps = {
      bomTemplateCode: params.bomTemplateCode,
      success: this.uploadSuccess,
      tenantId,
    };

    const isAutoRefresh = !isNil(this.autoReloadTimer);

    const templateDownloadMenu = (
      <Menu
        onClick={this.handleDownloadTemplateClick}
        style={{ minWidth: '100px', textAlign: 'center' }}
      >
        <Menu.Item key="excel">
          {/* <Icon type="excel" /> */}
          {intl.get('ssrc.priceLibBatchCreate.view.button.templateExcel').d('EXCEL')}
        </Menu.Item>
      </Menu>
    );

    return (
      <Fragment>
        <Header
          title={intl.get(`spc.bomViewWorkbench.view.title.viewBomViewWorkbenchDetail`).d('价格BOM明细')}
          backPath="/spc/bom-view-workbench/list"
        >
          <Dropdown overlay={templateDownloadMenu}>
            <Button color="primary">
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
          <Button icon="event_note-o" onClick={this.handleHistoryBtnClick}>
            {intl.get('ssrc.priceLibBatchCreate.view.button.history').d('历史记录')}
          </Button>
        </Header>
        <Content>
          <Form
            dataSet={this.queryFormDs}
            // columns={2}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return this.getDataSource();
            }}
            style={{ flex: 'auto' }}
          >
            <div name="status" className={style['status-wrapper']}>
              <Select name="status" disabled={!status} onChange={this.getDataSource} />
              <Button
                disabled={!batch || status !== 'IMPORTED'}
                style={{ marginLeft: '16px' }}
                onClick={this.handleExportData}
              >
                {intl.get('himp.comment.view.button.export').d('数据导出')}
              </Button>
            </div>
          </Form>
          <Tabs animated={false}>
            <TabPane
              tab={intl.get('spc.bomDimConfig.view.message.basicInfos').d('基础信息')}
              key="basicInfos"
            >
              <Table columns={this.columns} dataSet={this.tableDs} />
            </TabPane>
            <TabPane
              tab={intl.get('spc.bomViewWorkbench.view.title.detailInfo').d(`明细信息`)}
              key="detailInfo"
            >
              <Table columns={this.detailColumns} dataSet={this.detailTableDs} />
            </TabPane>
          </Tabs>
          {/* <Sidebar
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
          </Sidebar> */}
        </Content>
      </Fragment>
    );
  }
}
