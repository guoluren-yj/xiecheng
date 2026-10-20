import React, { PureComponent, Fragment } from 'react';
import { Tabs, Alert } from 'choerodon-ui';
import { DataSet, Table, Button, Dropdown, Icon, Menu, Form, Select } from 'choerodon-ui/pro';
import { Button as HzeroButton } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { API_HOST } from 'utils/config';
import { SRM_SSRC } from '_utils/config';
import { downloadFile } from 'hzero-front/lib/services/api';
import notification from 'utils/notification';
import { DEBOUNCE_TIME } from 'utils/constants';

import { queryFormDS } from './store';
import { queryStatus, validateData, importData, fetchData, } from './api';
import UploadExcel from './UploadExcel';
import { getImportStatusInfos} from '@/routes/components/QuotationDetailOfflineImport/utils';

const { TabPane } = Tabs;

export default class Import extends PureComponent {
  autoReloadTimer; // 自动刷新的 定时器

  constructor(props) {
    super(props);

    if (props.onRef) {
      props.onRef(this);
    }

    this.autoRefreshInterval = 5000;
    this.state = {
      batch: null, // 批次号
    };
  }

  queryFormDs = new DataSet(queryFormDS());

  componentWillUnmount() {
    if (!isNil(this.autoReloadTimer)) {
      clearInterval(this.autoReloadTimer);
    }
    this.handleToggleAutoRefresh.cancel();
  }

  /**
   * 获取导入的数据
   * @param {object} [pagination={}] 查询参数
   */
  @Bind()
  async getDataSource(options = {}) {
    const { batch } = this.state;
    const {
      tabList = [],
      tableDs = {},
      quotationHeaderId,
      sourceFrom = 'RFX',
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      sourceHeaderId,
      projectLineSectionId,
    } = this.props;
    const { tabActiveKey } = this.state;
    const { queryParams = {}, tabKey, } = options || {};

    if (batch) {
      const formValues = this.queryFormDs?.current?.toData();
      const importStatusResult = await getImportStatusInfos({
        templateCode,
        // sheetIndex: r.sheetIndex,
        quotationHeaderId,
        sourceHeaderId,
        sourceFrom,
        batch,
        projectLineSectionId,
        formValues,
        page: 0,
        size: 10,
      });
      if (!importStatusResult || isEmpty(importStatusResult)) {
        this.setState({
          errorStr: '',
        });
      }

      if (!isEmpty(tabList)) {
        tabList.forEach((r) => {
          const { dynamicSheetName, sheetIndex, } = r || {};
          const currentKey = tabKey || tabActiveKey || tabList[0]?.dynamicSheetName;

          if (currentKey && currentKey !== dynamicSheetName) {
            return;
          }

          const params = {
            templateCode,
            sheetIndex,
            quotationHeaderId,
            sourceHeaderId,
            sourceFrom,
            batch,
            projectLineSectionId,
            page: 0,
            size: 10,
            ...formValues,
            ...(queryParams || {}),
          };

          fetchData(params).then((res) => {
            const result = getResponse(res);
            if (result && !result.failed) {
              result.forEach((i) => {
                const { _templateCode = '', importDataPage = {} } = i || {};
                if (_templateCode) {
                  const data =
                    (importDataPage?.content || [])?.map((n) => JSON.parse(n._data)) || [];
                  tableDs[`${r.sheetIndex}#${_templateCode}`].loadData([]);
                  tableDs[`${r.sheetIndex}#${_templateCode}`].loadData(
                    data,
                    importDataPage?.totalElements || 0
                  );
                  params._templateCode = _templateCode;
                  tableDs[`${r.sheetIndex}#${_templateCode}`].setQueryParameter('params', params);
                }
              });
            }
          });
        });
      }
    } else {
      notification.warning({
        message: intl.get('ssrc.quoDeImport.view.message.tip.noImport').d('未导入数据'),
      });
    }
  }

  getCurrentStatus = async () => {
    const { batch, } = this.state;
    let result = {};

    if (!batch) {
      return result;
    }

    const data = { batch };
    try {
      result = await queryStatus(data);
      result = getResponse(result);
    } catch (e) {
      throw e;
    }

    return result;
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
              message: intl.get('ssrc.quoDeImport.view.message.title.refreshSuccess').d('刷新成功'),
              description: intl
                .get('ssrc.quoDeImport.view.message.title.currentStatus', {
                  name: res.statusMeaning,
                })
                .d(`当前数据状态：${res.statusMeaning}`),
            });
          }
        }
        // 查询数据
        if (statusRes?.status) {
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
    this.setState({ batch }, () => {
      this.refresh();
    });
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
   * 校验数据
   */
  @Bind()
  validateData() {
    const { batch } = this.state;
    const {
      quotationHeaderCurrentId = undefined,
      sourceFrom = 'RFX',
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      sourceHeaderId = undefined,
      projectLineSectionId,
      operationType = undefined,
    } = this.props;
    if (batch) {
      this.showLoading('validateDataLoading');
      validateData({
        templateCode,
        quotationHeaderCurrentId,
        sourceHeaderId,
        sourceFrom,
        batch,
        projectLineSectionId,
        operationType,
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
        description: intl.get(`ssrc.quoDeImport.view.message.error.ImportFile`).d('请上传导入文件'),
      });
    }
  }

  /**
   * 导入数据
   */
  @Bind()
  importData() {
    const {
      quotationHeaderCurrentId = undefined,
      sourceFrom = 'RFX',
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      sourceHeaderId = undefined,
      projectLineSectionId,
      operationType = undefined,
    } = this.props;
    const { batch } = this.state;
    if (batch) {
      this.showLoading('importDataLoading');
      importData({
        templateCode,
        quotationHeaderCurrentId,
        sourceHeaderId,
        sourceFrom,
        batch,
        projectLineSectionId,
        operationType,
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
        message: intl.get(`ssrc.quoDeImport.view.message.error.ImportFile`).d('请上传导入文件'),
      });
    }
  }

  /**
   * 模板下载 菜单点击
   */
  @Bind()
  handleDownloadTemplateClick(e) {
    const { remote } = this.props;
    if (e.key === 'excel') {
      this.handleDownloadTemplateExcel();
    } else {
      if (remote?.event) {
        const eventProps = {
          e,
          that: this,
        };
        remote.event.fireEvent('handleRemoteMenuItemEvent', eventProps);
      }
    }
  }

  /**
   * 下载 excel 模板
   */
  @Bind()
  async handleDownloadTemplateExcel() {
    const {
      quotationHeaderCurrentId = undefined,
      sourceFrom = 'RFX',
      sourceHeaderId = undefined,
      projectLineSectionId,
      remote,
    } = this.props;
    const headerName = quotationHeaderCurrentId ? 'quotationHeaderCurrentId' : 'sourceHeaderId';
    const organizationId = getCurrentOrganizationId();
    const api = `${API_HOST}${SRM_SSRC}/v2/${organizationId}/rfx/sup-dtl/export-excel`;
    const queryParams = [
      { name: 'type', value: 'bpmn20' },
      { name: headerName, value: quotationHeaderCurrentId || sourceHeaderId },
      { name: 'sourceFrom', value: sourceFrom },
      projectLineSectionId && { name: 'projectLineSectionId', value: projectLineSectionId },
    ].filter(Boolean);

    try {
      if (remote?.event) {
        const eventProps = {
          headerName,
          queryParams,
          that: this,
        };
        const res = await remote.event.fireEvent('handleRemoteBeforeExcelDownload', eventProps);
        if (res === false || res === 0) {
          this.hiddenLoading('downloadTemplateLoading');
          return;
        }
      }

      downloadFile({
        requestUrl: api,
        queryParams,
      });
    } catch (e) {
      this.hiddenLoading('downloadTemplateLoading');
      throw e;
    } finally {
      this.hiddenLoading('downloadTemplateLoading');
    }
  }

  // 重置
  @Bind()
  resetCurrentPageQuery() {
    const { current } = this.queryFormDs || {};
    if (current) {
      current.reset();
    }
  }

  updateActiveKey = (key) => {
    this.setState({
      tabActiveKey: key,
    });
  }

  tabsOnChange = (key) => {
    this.updateActiveKey(key);

    this.getDataSource({
      tabKey: key,
    });
  }

  render() {
    const {
      tabList = [],
      tableDs = {},
      column = {},
      quotationHeaderCurrentId = undefined,
      sourceHeaderId = undefined,
      sourceFrom = 'RFX',
      templateCode,
      projectLineSectionId,
      operationType = undefined,
      remote,
    } = this.props;

    const { batch, validateDataLoading, importDataLoading, queryStatusLoading, tabActiveKey, } = this.state;

    let menuList = [
      <Menu.Item key="excel">
        <Icon type="excel" />
        {intl.get('ssrc.quoDeImport.view.button.templateExcel').d('EXCEL')}
      </Menu.Item>,
    ];

    menuList = remote ? remote.process(
      'SSRC_RFSUPPLIER_QUOTATION_DETAIL_IMPORT_PROCESS_MENU_ITEM_LIST',
      menuList,
      {
        that: this,
      }
    ) : menuList;
    menuList = menuList.filter(Boolean);

    const templateDownloadMenu = (
      <Menu onClick={this.handleDownloadTemplateClick}>
        {menuList}
      </Menu>
    );

    const uploadExcelProps = {
      quotationHeaderCurrentId,
      sourceHeaderId,
      sourceFrom,
      templateCode,
      projectLineSectionId,
      operationType,
      success: this.uploadSuccess,
    };
    const isAutoRefresh = !isNil(this.autoReloadTimer);

    return (
      <React.Fragment>
        <Header
          title={intl.get('ssrc.quoDeImport.view.title.quotationDetailImport').d('报价明细导入')}
        >
          <Dropdown overlay={templateDownloadMenu}>
            <Button color="primary">
              {intl.get('ssrc.quoDeImport.view.button.downloadTemplate').d('下载模板')}
              <Icon type="keyboard_arrow_down" />
            </Button>
          </Dropdown>
          {/* auto 直接使用数据上传 */}
          <UploadExcel {...uploadExcelProps} />
          <Button
            key="validate"
            icon="finished"
            onClick={this.validateData}
            disabled={!batch}
            loading={validateDataLoading}
          >
            {intl.get('ssrc.quoDeImport.view.button.validateData').d('数据验证')}
          </Button>
          <Button
            key="import"
            icon="vertical_align_bottom"
            onClick={this.importData}
            disabled={!batch}
            loading={importDataLoading}
          >
            {intl.get('ssrc.quoDeImport.view.button.importData').d('数据导入')}
          </Button>
          <Button
            key="refresh"
            icon="sync"
            onClick={this.handleRefresh}
            disabled={!batch}
            loading={queryStatusLoading}
          >
            {intl.get('ssrc.quoDeImport.view.button.refresh').d('刷新')}
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
        </Header>
        <Content>
          <div>
            <Alert
              message={
                <div>
                  <Icon type="icon icon-help" />
                  &nbsp;&nbsp;
                  {intl
                    .get('ssrc.quoDeImport.view.title.importModuleWarningText')
                    .d(
                      '注意：导入报价明细存在分模块数据时，若新增行数据，需与下一模块的数据间隔一行进行导入。'
                    )}
                </div>
              }
              showIcon={false}
              type="warning"
              closable
              style={{
                border: 'none',
                margin: '-8px -16px 0px',
                background: 'rgb(230, 242, 253)',
                fontSize: '13px',
                color: 'rgb(48, 145, 242)',
              }}
            />
          </div>
          <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
            <Form
              dataSet={this.queryFormDs}
              columns={3}
              onKeyDown={(e) => {
                if (e.keyCode === 13) return this.getDataSource();
              }}
              style={{ flex: 'auto' }}
            >
              <Select name="status" />
            </Form>
            <div
              style={{ marginTop: '10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <Button onClick={this.resetCurrentPageQuery}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button dataSet={null} color="primary" onClick={this.getDataSource}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <Tabs animated={false} activeKey={tabActiveKey || tabList[0]?.dynamicSheetName} onChange={this.tabsOnChange}>
            {tabList.map((item) => {
              const { detailTemplateDTOList = [] } = item;
              const node = detailTemplateDTOList?.map((n) => {
                return (
                  <Fragment>
                    <h4
                      style={{ borderLeft: 'solid #29bece', paddingLeft: '4px', margin: '8px 0' }}
                    >
                      {n.title}
                    </h4>
                    <Table
                      columns={column[`${item.sheetIndex}#${n.templateNum}`]}
                      dataSet={tableDs[`${item.sheetIndex}#${n.templateNum}`]}
                    />
                  </Fragment>
                );
              });
              return (
                <TabPane tab={item.dynamicSheetName} key={item.dynamicSheetName}>
                  {node}
                </TabPane>
              );
            })}
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
