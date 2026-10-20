/**
 * 价格库手工创建&更新 - 大数据表格优化
 * @date: 2020-12-08
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import moment from 'moment';
import querystring from 'querystring';
import { Bind, throttle, debounce } from 'lodash-decorators';
import {
  isEmpty,
  isObject,
  uniqWith,
  isEqual,
  differenceWith,
  filter,
  isNil,
  noop,
  map,
  isArray,
  omit,
  compose,
} from 'lodash';
import BigNumber from 'bignumber.js';
import { observable, runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { math, Record } from 'choerodon-ui/dataset';

import React, { PureComponent, Fragment } from 'react';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Output,
  Form,
  TextField,
  TextArea,
  PerformanceTable,
  NumberField,
  Select,
  DateTimePicker,
  DatePicker,
  Lov,
  Tooltip,
  Pagination,
  CheckBox,
  Attachment,
  Progress,
  Select as C7nSelect,
} from 'choerodon-ui/pro';
import { Popover, notification as notificationC7n, Icon as IconC7n } from 'choerodon-ui';

import { openTab, getActiveTabKey, updateTab } from 'utils/menuTab';

import uuid from 'uuid/v4';
import intl from 'utils/intl';
import remote from 'utils/remote';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getResponse,
  filterNullValueObject,
  getCurrentUserId,
} from 'utils/utils';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { SRM_SPC, PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';
import webSocketManagener from 'utils/webSoket';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { Button as PermissionButton } from 'components/Permission';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import ExportDynamicExcel from '@/routes/components/ExportDynamicExcel';
import configImg from '@/assets/config.svg';
import SearchBar from '@/routes/components/SearchBar';
import {
  fetchPriceLibHeaderConfig,
  savePriceLib,
  releasePriceLib,
  fetchScopeTabs,
  fetchApproveMethod,
  fetchPriceLibUpdateData,
  deleteLines,
  fetchQueryReleasedProgress,
  fetchRepublishPrice,
  fetchClearProgress,
  releaseAllPriceLib,
  preReleaseValidate,
  saveViewSwitch,
  fetchNewFunctionWhiteList,
  getAttachmentCount,
  fetchCreatedUnitName,
} from '@/services/priceLibraryNewService';
import {
  createC7nPagination,
  getEditPerformanceTableData,
  getCustomizeEditPerformanceTableData,
} from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import ApplicationScope from './ApplicationScope';
import {
  queryFormDS,
  listLineDS,
  ladderQuotationTableDS,
  ladderQuotationFormDS,
  scopeTableDS,
  releaseConfirmDs,
  exportTemplateDS,
} from './lineDS';
import commonStyle from '../common.less';
import BatchMaintainItemForm from './BatchMaintainItemForm';

import {
  renderValidStatu,
  batchCheckBtnPermission,
  getRuleDefinition,
  getPriceEditField,
} from '../util';
import style from './index.less';
import ReleaseHistory from './ReleaseHistory';

const organizationId = getCurrentOrganizationId();
const userId = getCurrentUserId();
let scopeModal;

class PriceLibraryNew extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(location.search.substr(1));
    this.state = {
      routerParams,
      ruleDefinition: [], // 含税单价业务规则定义
      queryFields: [], // 查询组件
      hidden: true, // 查询表单更多隐藏
      columnList: [], // 动态列
      tableData: [], // 表格数据
      pagination: {}, // 表格分页
      pagesize: ['10', '20', '50', '100', '200'],
      queryLoading: false,
      saveLoading: false,
      releaseLoading: false,
      checkData: [], // 选中数据
      checkValues: [], // 选中值
      ladderQuotationFields: [], // 阶梯报价form列
      activeKey: 'itemPriceMaintain', // 当前激活的tabKey
      aggregation: true,
      releasedProgressMap: {}, // 发布进度列表, 以批次号做为key
      templateCode: props.match.params.templateCode,
      initialQueryFlag: 1, // 初始化查询flag
      currencyCodeFlag: true, // 是否有币种
      cacheData: {},
      checkedAll: false, // 全选
      commonDefaultInfo: {}, // 个人中心查询到的数据。
    };
    this.renderFieldType.bind(this);
  }

  queryFormDs = new DataSet(queryFormDS());

  tableDs = new DataSet(
    listLineDS(
      { templateCode: this.props.match.params.templateCode, remote: this.props.ssrcRemote },
      []
    )
  );

  ladderQuotationFormDs = new DataSet(ladderQuotationFormDS());

  ladderQuotationTableDs = new DataSet(ladderQuotationTableDS());

  scopeTableDs = new DataSet(scopeTableDS());

  exportTemplateDs = new DataSet(exportTemplateDS());

  releaseConfirm = new DataSet(releaseConfirmDs());

  searchBarRef = null; // 筛选器ref

  batchMaintainButtonVisible = false; // 批量编辑按钮Visible

  releaseAllParams = {};

  @observable queryData = {}; // 在查询时, 拿到最新的数据, 保持同步

  componentDidMount() {
    this.queryRuleDefinition();
    this.queryDefaultCommonInfo();
    this.queryReleasedProgress();
    this.initWebSoketConnect();
    this.registerReleasedListSocketConnect();
    // 迁移至筛选器中处理
    // this.fetchPriceLibHeaderConfig();
  }

  componentWillUnmount() {
    this.setState({
      queryFields: [], // 查询组件
      hidden: true, // 查询表单更多隐藏
      columnList: [], // 动态列
      tableData: [], // 表格数据
      pagination: {}, // 表格分页
      queryLoading: false,
      checkData: [], // 选中数据
      checkValues: [], // 选中值
      ladderQuotationFields: [],
    });
    if (this.sockertUrl && webSocketManagener.removeListener && this.handleSocketEvent) {
      webSocketManagener.removeListener(this.sockertUrl, this.handleSocketEvent);
    }
    // 关闭 webSocket 连接
    webSocketManagener.destroyWebSocket();
  }

  @Bind()
  async queryRuleDefinition() {
    getRuleDefinition().then((res) => {
      this.setState({ ruleDefinition: res });
      // 触发fieldType的重新渲染
      this.tableDs.setState({
        ruleDefinition: res,
      });
    });
  }

  /**
   * 查询个人中心默认值配置
   */
  @Bind()
  async queryDefaultCommonInfo() {
    let needDefault = false;
    const tenantList = await fetchNewFunctionWhiteList('PRICE_MANUAL_ADD_DEFAULT_FILL');
    if (tenantList && !tenantList.failed && tenantList.length === 1) {
      needDefault = tenantList?.[0]?.enableFlag === '1';
    }
    if (needDefault) {
      const res = await fetchCreatedUnitName();
      if (!res?.failed) {
        this.setState({ commonDefaultInfo: res || {} });
      }
    }
  }

  /**
   * 查询发布进度列表
   */
  @Bind()
  async queryReleasedProgress() {
    const { templateCode } = this.state;
    const res = getResponse(await fetchQueryReleasedProgress({ templateCode }));
    if (res) {
      // 每次刷新, 重新查询存储
      const releasedProgressMap = {};
      map(res, (item) => {
        releasedProgressMap[item.releaseBatch] = item;
      });
      this.setState({ releasedProgressMap });
    }
  }

  /**
   * 全部/部分清空
   * @param {?string} releaseBatch - 批次号
   */
  @Bind()
  async handleDeleteReleasedHistory(releaseBatch) {
    const { templateCode, releasedProgressMap } = this.state;
    const res = getResponse(await fetchClearProgress({ templateCode, releaseBatch }));
    if (res) {
      // 每次刷新, 重新查询存储
      const tempReleasedProgressMap = { ...releasedProgressMap };
      map(res, (item) => {
        releasedProgressMap[item.releaseBatch] = item;
      });
      if (!isNil(releaseBatch)) {
        delete tempReleasedProgressMap[releaseBatch];
      }
      this.setState({ releasedProgressMap: tempReleasedProgressMap });
    }
    return res;
  }

  /**
   * 重新发布
   * @param {!string} releaseBatch - 批次号
   */
  @Bind()
  async handleRepublish(releaseBatch) {
    const { templateCode } = this.state;
    const res = getResponse(
      await fetchRepublishPrice({
        releaseBatch,
        templateCode,
      })
    );
    return res;
  }

  /**
   * 初始化webSoket连接
   */
  initWebSoketConnect() {
    if (webSocketManagener.socketStatus !== 32) {
      webSocketManagener.initWebSocket();
    }
  }

  sockertUrl = '';

  /**
   * 注册发布列表连接
   */
  registerReleasedListSocketConnect() {
    const {
      match: { params },
    } = this.props;
    this.sockertUrl = `/topic/price-release/${organizationId}/${params.templateCode}`;
    webSocketManagener.addListener(this.sockertUrl, (messageData) => {
      const { releasedProgressMap } = this.state;
      // eslint-disable-next-line no-unused-vars
      const message = JSON.parse(messageData.message);
      // 更新
      this.handleSocketEvent(message, releasedProgressMap);
    });
  }

  handleSocketEvent = (message = {}, releasedProgressMap = {}) => {
    this.setState({
      releasedProgressMap: {
        ...releasedProgressMap,
        [message.releaseBatch]: message,
      },
    });
  };

  @Bind()
  handleRef(vnode) {
    this.searchBarRef = vnode;
  }

  /**
   * 查询价格库表格数据
   */
  @Bind()
  async fetchPriceLibData(page = {}) {
    const { routerParams, initialQueryFlag, pagination = {}, cacheData = {} } = this.state;
    const {
      match: { params },
      ssrcRemote,
    } = this.props;
    let isPost = false;
    if (routerParams?.priceLibIds) {
      const tenantList = await fetchNewFunctionWhiteList('PRICE_LIST_POST_QUERY_WAY');
      if (tenantList && !tenantList.failed && tenantList.length === 1) {
        isPost = tenantList?.[0]?.enableFlag === '1';
      }
    }
    if (ssrcRemote?.event) {
      const res = await ssrcRemote.event.fireEvent('cuxFetchPriceLibData', {
        current: this,
        history,
        page,
      });
      if (!res) {
        return false;
      }
    }
    // const queryData = filterNullValueObject(this.queryFormDs.toData()[0]);
    const queryData = filterNullValueObject(this.searchBarRef?.getQueryParameter()) || {};
    const queryParams = {};
    for (const key in queryData) {
      // 日期数字 特殊处理
      // if (queryData[key]?.start || queryData[key]?.end) {
      if (key.includes('_range')) {
        Object.assign(queryParams, {
          [key.split('_')?.[0]]: JSON.stringify({
            from: queryData[key].split(',')?.[0],
            to: queryData[key].split(',')?.[1],
          }),
        });
      } else if (Array.isArray(queryData[key])) {
        // 下拉框 值集 多选处理
        Object.assign(queryParams, { [key]: queryData[key].toString() });
      } else if (!isObject(queryData[key])) {
        Object.assign(queryParams, { [key]: queryData[key] });
      }
    }
    runInAction(() => {
      this.queryData = queryParams;
    });
    // 当改变pageSize后, 需要手动的更新page
    if (!isEmpty(pagination) && !isEmpty(page)) {
      const { pageSize: prePageSize } = pagination;
      const { pageSize } = page;
      if (prePageSize !== pageSize) {
        Object.assign(page, {
          page: 1,
        });
      }
    }
    // 查询参数
    const param = {
      pagination: { ...page, pageSize: page?.pageSize || 20 }, // 默认分页20
      priceLibIds: routerParams?.priceLibIds,
      templateCode: params.templateCode,
      from: routerParams?.viewCode !== 'ALL_VIEW' ? 'VIEW_EDIT' : 'EDIT',
      isPost,
      ...routerParams,
      ...queryParams,
    };

    this.releaseAllParams = { ...param, priceLibIds: null };

    this.setState({ queryLoading: true });
    await fetchPriceLibUpdateData(param)
      .then((res) => {
        const result = getResponse(res);
        if (result && Array.isArray(result.content)) {
          // const newCheckData = [];
          // eslint-disable-next-line no-unused-expressions
          result?.content?.forEach((r) => {
            if (cacheData[r.priceLibId]) {
              Object.assign(r, cacheData[r.priceLibId]);
            }
          });
          // 更新checkData数据,原本编辑数据更新成列表数据，避免列表和checkData数据不一致
          // if (!isEmpty(checkData)) {
          //   newCheckData = checkData.map((r) => {
          //     if (priceLibIdList.includes(r.priceLibId) && r.record && r._status) {
          //       return result?.content?.find((item) => item.priceLibId === r.priceLibId);
          //     } else {
          //       return r;
          //     }
          //   });
          // }
          this.setState({
            tableData: result.content,
            pagination: createC7nPagination(result),
          });
          // 第一次查询成功后，路由上去除priceLibIds参数
          if (initialQueryFlag && routerParams?.priceLibIds && history) {
            history.replaceState(null, '', `update?viewCode=${routerParams?.viewCode}`);
            updateTab({
              key: getActiveTabKey(),
              search: `viewCode=${routerParams?.viewCode}`,
            });
            const { priceLibIds, ...others } = routerParams;
            this.setState({
              routerParams: others,
              initialQueryFlag: 0,
            });
          }
        }
      })
      .finally(() => {
        this.setState({ queryLoading: false });
      });
  }

  /**
   * 全量发布
   */
  @Bind()
  handleReleaseAll() {
    const { pagination } = this.state;
    const { total } = pagination;
    if (total > 30000) {
      notification.error({
        message: intl
          .get('ssrc.priceLibraryNew.excess.releaseAll')
          .d('发布数量超过30000条，不支持全量发布'),
      });
      return false;
    } else if (!total) {
      notification.error({ message: intl.get('ssrc.common.view.message.emptyData').d('暂无数据') });
      return false;
    }
    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('ssrc.priceLibraryNew.confirm.releaseAll', {
          total,
        })
        .d(`当前页面共有${total}条价格，请确认是否全量发布`),
      onOk: () => {
        Modal.open({
          ...this.releaseConfirmModalProps(),
          onOk: () => this.releaseConfirmMethod([{}], this.releaseAllParams),
          onCancel: () => this.releaseConfirm.current?.reset(),
        });
      },
    });
  }

  // 新建阶梯报价
  @Bind()
  createLadderPriceLine() {
    const { length = 0 } = this.ladderQuotationTableDs || {};
    const newLine = {};

    if (length) {
      // 上一行的至作为下行的从
      const lastLineRecord = this.ladderQuotationTableDs.get(length - 1);
      const nextLineLadderFrom = lastLineRecord ? lastLineRecord.get('ladderTo') : null;
      newLine.ladderFrom = nextLineLadderFrom;
    }

    this.ladderQuotationTableDs.create(newLine, length);
  }

  // 删除阶梯报价
  @Bind()
  deleteLadderPrice() {
    const { selected = {} } = this.ladderQuotationTableDs || {};

    const unAddSelectedLines = selected.filter((line) => line.status !== 'add');
    if (!unAddSelectedLines?.length) {
      this.ladderQuotationTableDs.remove(selected);
    }

    const unAddAllLines = this.ladderQuotationTableDs.filter((line) => line.status !== 'add');
    const endSelectedLine = unAddAllLines.slice(unAddAllLines.length - unAddSelectedLines.length);

    let matchFlag = 1;
    endSelectedLine.forEach((line) => {
      const priceLibLadderId = line.get('priceLibLadderId');
      const matchSelectedLine = unAddSelectedLines.find(
        (selectedLine) => selectedLine.get('priceLibLadderId') === priceLibLadderId
      );
      if (!matchSelectedLine) {
        matchFlag = 0;
      }
    });

    if (!matchFlag) {
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.model.supQuo.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
      return;
    }

    this.ladderQuotationTableDs.delete(unAddSelectedLines);
  }

  /**
   * 展示阶梯报价
   */
  @Bind()
  showLadderQuotation(rowData) {
    const {
      customizeTable = () => {},
      match: { params },
    } = this.props;
    const { ladderQuotationFields = [], currencyCodeFlag, ruleDefinition } = this.state;
    // 默认都不可编辑
    let benchmarkPriceType = 'NO_PRICE';
    const { record: rec } = rowData;
    benchmarkPriceType = getPriceEditField(rec || rowData, ruleDefinition, {
      templateCode: params.templateCode,
    });

    // 取头benchmarkPriceType
    this.ladderQuotationFormDs.create(rowData);

    this.ladderQuotationTableDs.setQueryParameter('priceLibId', rowData.priceLibId);
    this.ladderQuotationTableDs.setQueryParameter('benchmarkPriceType', benchmarkPriceType);
    this.ladderQuotationTableDs.setQueryParameter('taxRate', rowData.taxRate);
    this.ladderQuotationTableDs.setQueryParameter('taxIncludedFlag', rowData.taxIncludedFlag);
    this.ladderQuotationTableDs.query();
    this.ladderQuotationTableDs.setState('taxPricePrecision', rowData.taxPricePrecision);
    this.ladderQuotationTableDs.setState('netPricePrecision', rowData.netPricePrecision);

    const columns = [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 100,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'ladderTo',
        width: 100,
        tooltip: 'overflow',
        editor: true,
      },
      {
        name: 'ladderPrice',
        width: 100,
        tooltip: 'overflow',
        editor: (record) =>
          benchmarkPriceType === 'TAX_INCLUDED_PRICE' ? (
            currencyCodeFlag ? (
              <C7nPrecisionInputNumber
                name="ladderPrice"
                record={record}
                headerRecord={rowData.record || rowData}
                currency="currencyCode"
                precision={rowData.taxPricePrecision}
              />
            ) : (
              true
            )
          ) : (
            false
          ),
        renderer: ({ value, dataSet }) =>
          numberSeparatorRender(value, dataSet.getState('currency_precision')),
      },
      {
        name: 'ladderNetPrice',
        width: 100,
        tooltip: 'overflow',
        editor: (record) =>
          benchmarkPriceType === 'NET_PRICE' ? (
            currencyCodeFlag ? (
              <C7nPrecisionInputNumber
                name="ladderNetPrice"
                record={record}
                headerRecord={rowData.record || rowData}
                currency="currencyCode"
                precision={rowData.netPricePrecision}
              />
            ) : (
              true
            )
          ) : (
            false
          ),
        renderer: ({ value, dataSet }) =>
          numberSeparatorRender(value, dataSet.getState('currency_precision')),
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        editor: true,
      },
      {
        name: 'ladderPriceRemark',
        width: 150,
        tooltip: 'overflow',
        editor: true,
      },
    ];
    const buttons = [
      <Button icon="playlist_add" onClick={this.createLadderPriceLine} key="add">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      'save',
      ['delete', { onClick: this.deleteLadderPrice }],
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: '1090px',
      },
      drawer: true,
      children: (
        <React.Fragment>
          <Form
            dataSet={this.ladderQuotationFormDs}
            columns={2}
            labelLayout="vertical"
            useColon={false}
            className="c7n-pro-vertical-form-display"
          >
            {ladderQuotationFields}
            <Output name="taxRate" />
          </Form>
          {customizeTable(
            {
              code: 'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_EDIT_LIST',
              dataSet: this.ladderQuotationTableDs,
            },
            <Table
              style={{ marginTop: '16px', maxHeight: '420px' }}
              dataSet={this.ladderQuotationTableDs}
              columns={columns}
              buttons={buttons}
              rowKey="priceLibLadderId"
            />
          )}
        </React.Fragment>
      ),
      onOk: () => this.ladderQuotationTableDs.submit(),
      afterClose: () => {
        this.ladderQuotationTableDs.loadData([]);
        this.ladderQuotationFormDs.reset();
      },
    });
  }

  /**
   * 查询tab页数据
   */
  @Bind()
  async fetchScopeTabs(params, dimensionCode) {
    const scopeProps = {
      tableDs: this.scopeTableDs,
      priceLibId: params.priceLibId,
      templateId: params.templateId,
      fetchScopeTabs: this.fetchScopeTabs,
      onRef: (node) => {
        this.applicationScope = node;
      },
    };
    // 查询tab标签页
    const param = { priceLibId: params.priceLibId };
    const result = getResponse(await fetchScopeTabs(param));
    if (result && !result.failed) {
      // 设置tab的activeKey
      if (!this.applicationScope.state.activeKey) {
        this.applicationScope.setState({
          activeKey: result[0].dimensionCode,
        });
      }
      // 更新弹框内容
      scopeModal.update({
        children: <ApplicationScope tabsData={result} {...scopeProps} />,
      });
      // 查询第一个tab对应表格的数据
      const queryParams = omit(params, 'record'); // 忽略 `record` 属性
      this.scopeTableDs.setQueryParameter('params', {
        ...queryParams,
        dimensionCode: dimensionCode || (result[0] && result[0].dimensionCode),
      });
      this.scopeTableDs.query();
    }
  }

  /**
   * 展示适用范围
   */
  @Bind()
  async showApplicationScope(rowData) {
    const scopeProps = {
      tableDs: this.scopeTableDs,
      priceLibId: rowData.priceLibId,
      templateId: rowData.templateId,
      fetchScopeTabs: this.fetchScopeTabs,
      onRef: (node) => {
        this.applicationScope = node;
      },
    };

    // 打开弹框
    scopeModal = Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.title.maintenanceScope').d('编辑适用范围'),
      drawer: true,
      style: {
        width: '1090px',
      },
      children: <ApplicationScope tabsData={[]} {...scopeProps} />,
      afterClose: () => {
        this.applicationScope.setState({ activeKey: '' });
      },
      bodyStyle: { padding: 0 },
    });

    // 查询tab页数据
    this.fetchScopeTabs(rowData);
  }

  /**
   * 展示链接页面
   * @param {Object} rowData - 行记录
   * @param {Object} field - 列配置
   */
  @Bind()
  handleShowLinkTargetPage(rowData, field) {
    const title = rowData[field.dimensionCode];
    const iframeUrl = rowData[`${field.dimensionCode}Href`];
    const width = rowData[`${field.dimensionCode}WindowWidth`];
    const wrapperStyle = {
      border: 'none',
      height: '100%',
      width: '100%',
    };

    if (this.linkModal) {
      this.linkModal.update({
        children: <iframe title={title} style={wrapperStyle} src={iframeUrl} />,
      });
      this.linkModal.open();
    } else {
      // 打开弹框
      this.linkModal = Modal.open({
        key: Modal.key(),
        title,
        drawer: true,
        closable: true,
        maskClosable: true,
        className: commonStyle['c7n-modal-wrapper'],
        style: {
          width: width ? `${width}%` : 'calc(100vw - 520px)',
        },
        children: <iframe title={title} style={wrapperStyle} src={iframeUrl} />,
        footer: null,
      });
    }
  }

  /**
   * 新增-价格库行
   */
  @Bind()
  async handleAdd() {
    const { ssrcRemote } = this.props;
    if (ssrcRemote?.event) {
      const res = await ssrcRemote.event.fireEvent('handleCuxAdd', {
        current: this,
      });
      if (!res) {
        return;
      }
    }
    this.setState({
      tableData: [
        { record: this.tableDs.create({}, 0), priceLibId: uuid(), _status: 'create' },
        ...this.state.tableData,
      ],
    });
  }

  /**
   * 删除未保存数据
   */
  @Bind()
  deleteLocalData() {
    const { checkValues = [], tableData = [] } = this.state;
    const newTableData = filter(tableData, (item) => {
      return checkValues.indexOf(item.priceLibId) < 0;
    });
    this.setState({ tableData: newTableData, checkData: [], checkValues: [] });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { checkValues = [], checkData = [], pagination, cacheData = {} } = this.state;
    if (!checkData.some((item) => item._status !== 'create')) {
      this.deleteLocalData();
      return;
    }
    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get(`ssrc.priceLibraryNew.view.modal.deleteLineNotification`)
        .d('确定要删除该行吗?'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        checkData.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          } else {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          // 过滤出勾选数据的剩下数据
          this.deleteLocalData();
        } else {
          // 真数据删除后若存在假数据，查询后会丢失，c7n也是这样的
          const data = checkData
            .filter((item) => item._status !== 'create')
            .map((item) => {
              const { record, ...otherItem } = item;
              return otherItem;
            });
          deleteLines(data).then((res) => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              // this.fetchPriceLibData(pagination);
              checkValues.forEach((item) => {
                delete cacheData[item];
              });
              this.setState({ checkData: [], checkValues: [], cacheData }, () => {
                this.fetchPriceLibData(pagination);
              });
            }
          });
        }
      },
    });
  }

  /**
   * 编辑
   * record 行信息
   */
  @Bind()
  handelEdit(rowData, rowIndex) {
    const { tableData = [], checkData = [], cacheData = {} } = this.state;
    // 取到所有field的name，LOV,MapList,benchmarkPriceType取defaultValue，其他field给null ，绕开rowData中没有的ds中的field，在create时，field会给到defaultValue
    const fields = this.tableDs.fields.toJS();
    let fieldsValue = {};
    for (const [index] of fields) {
      if (!index.includes('LOV') && !index.includes('MapList') && index !== 'benchmarkPriceType') {
        fieldsValue = { ...fieldsValue, [index]: null };
      }
    }
    const row = { ...fieldsValue, ...rowData };
    let newCheckData = [];
    if (!rowData.record) {
      const record = this.tableDs.create(row, rowIndex);
      Object.assign(rowData, { record });
    }
    const updateData = { ...rowData, _status: 'update' };
    // 更新勾选框中的数据
    newCheckData = checkData.map((r) => {
      if (r.priceLibId === rowData.priceLibId) {
        return updateData;
      }
      return r;
    });
    const newTableData = tableData;
    newTableData[rowIndex] = updateData;
    this.setState(
      {
        tableData: newTableData,
        checkData: newCheckData,
        cacheData: { ...cacheData, [rowData.priceLibId]: updateData },
      },
      () => this.forceUpdate()
    );
  }

  /**
   * 取消 - 编辑
   * record 行信息
   */
  @Bind()
  handelCancel(rowData, rowIndex) {
    const { tableData = [], checkData = [], checkValues = [], cacheData = {} } = this.state;
    const newTableData = tableData;
    let newCheckData = [];
    // 更新勾选框中的数据
    if (checkValues.includes(rowData.priceLibId)) {
      newCheckData = checkData.map((r) => {
        if (r.priceLibId === rowData.priceLibId) {
          return { ...rowData, _status: undefined };
        }
        return r;
      });
    }
    newTableData[rowIndex] = {
      ...rowData,
      record: undefined,
      _status: undefined,
    };
    // eslint-disable-next-line no-unused-expressions
    rowData.record?.reset();
    delete cacheData[rowData.priceLibId];
    this.setState(
      {
        tableData: newTableData,
        checkData: newCheckData,
        cacheData,
      },
      () => this.forceUpdate()
    );
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
        format = 'YYYY-MM-DD HH:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD HH:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  /**
   * field 编辑必输的条件渲染
   */
  @Bind()
  conditionRender(item = {}, record = {}) {
    let condition = false;
    let subject;
    switch (item.fieldWidget) {
      case 'DATE_PICKER':
        subject =
          record.get(item.dimensionCode) &&
          moment(record.get(item.dimensionCode)).format(this.renderDateFormat(item.dateFormat));
        break;
      default:
        subject =
          record.toData()[item.dimensionCode] || record.toData()[item.dimensionCode] === 0
            ? String(record.toData()[item.dimensionCode])
            : undefined;
        break;
    }

    const object = item.appointValue;
    const newObject = item.newAppointValue; // 处理接口查询值为明文的情况
    switch (item.ruleExpression) {
      case 'EQUAL':
        condition = [object, newObject].includes(subject);
        break;
      case 'NOT_EQUAL':
        condition = ![object, newObject].includes(subject);
        break;
      case 'IS_NULL':
        condition = !subject;
        break;
      case 'NOT_NULL':
        condition = !!subject;
        break;
      case 'BE_CONTAIN':
        condition = object
          ? object.split(',').includes(subject) || newObject?.split(',').includes(subject)
          : false;
        break;
      case 'NOT_CONTAIN':
        condition = !(object
          ? object.split(',').includes(subject) || newObject?.split(',').includes(subject)
          : false);
        break;
      default:
        condition = false;
        break;
    }
    return condition;
  }

  /**
   * 格式化表达式
   */
  @Bind()
  formatCombExpression(combExpression, priceLibRuleLineList, record) {
    let combExpression1 = '';
    combExpression1 = combExpression.replace(/\s/g, '');
    combExpression1 = combExpression.replace(/AND|and/g, '&&');
    combExpression1 = combExpression1.replace(/OR|or/g, '||');
    const arr = combExpression1.split('');
    let newCombExpression = ``;
    arr.forEach((item) => {
      const currentLineNum = item.replace(/\(|\)|/g, '');
      if (currentLineNum && isFinite(currentLineNum)) {
        const currentLineNumObject = priceLibRuleLineList.find(
          (n) => n.lineNum === Number(currentLineNum)
        );
        newCombExpression += item.replace(/\d/, this.conditionRender(currentLineNumObject, record));
      } else {
        newCombExpression += item;
      }
    });
    return newCombExpression;
  }

  /**
   * 执行字符串中的代码
   * @memberof priceLibrary
   */
  @Bind()
  evalExpression = (fn) => {
    const Fn = Function;
    return new Fn(`return  ${fn}`)();
  };

  /**
   * 设置编辑项
   */
  @Bind()
  renderEditable(field, record) {
    // 未设置必填条件
    if (isEmpty(field.editPriceLibRuleHeader)) {
      return Number(field.fieldEditable) === 0;
    } else if (field?.editPriceLibRuleHeader?.priceLibRuleCombList) {
      // 组合条件有值
      if (field.editPriceLibRuleHeader.priceLibRuleCombList?.[0]?.combExpression) {
        const { combExpression } = field.editPriceLibRuleHeader.priceLibRuleCombList[0];
        const conditionExpression = this.formatCombExpression(
          combExpression,
          field.editPriceLibRuleHeader.priceLibRuleLineList,
          record
        );
        const conditionFlag = this.evalExpression(conditionExpression);
        return (
          (Number(field.fieldEditable) === 0 && conditionFlag) ||
          (Number(field.fieldEditable) === 1 && !conditionFlag)
        );
      } else {
        return Number(field.fieldEditable) === 0;
      }
    }
  }

  /**
   * 设置必输项
   */
  // @Bind()
  renderRequired(field, record) {
    // 未设置必填条件
    if (isEmpty(field.requiredPriceLibRuleHeader)) {
      return Number(field.fieldRequired) === 1;
    } else if (field.requiredPriceLibRuleHeader?.priceLibRuleCombList) {
      // 组合条件有值
      if (field.requiredPriceLibRuleHeader.priceLibRuleCombList?.[0]?.combExpression) {
        const { combExpression } = field.requiredPriceLibRuleHeader.priceLibRuleCombList[0];
        const conditionExpression = this.formatCombExpression(
          combExpression,
          field.requiredPriceLibRuleHeader.priceLibRuleLineList,
          record
        );
        const conditionFlag = this.evalExpression(conditionExpression);
        return Number(field.fieldRequired) === 1 ? conditionFlag : !conditionFlag;
      } else {
        return Number(field.fieldRequired) === 1;
      }
    }
  }

  /**
   * 设置lov,select查询参数
   */
  @Bind()
  renderQueryParams(field, record) {
    let queryParams = {};
    if (!isEmpty(field.priceLibLovParamList)) {
      field.priceLibLovParamList.forEach((item) => {
        if (item.paramType === 'FIXED_VALUE') {
          queryParams = { ...queryParams, [item.paramName]: item.paramValue };
        } else if (item.paramType === 'DIMENSION') {
          queryParams = { ...queryParams, [item.paramName]: record.get(`${item.paramValue}`) };
        }
      });
    }
    return queryParams;
  }

  /**
   * 设置供应商lov props
   */
  @Bind()
  getSupplierLovProps = (field = {}, record) => {
    const queryData = {
      srmFlag: 1,
      ...(this.renderQueryParams(field, record) || {}),
    };

    const supplierLovProps = {
      clearButton: false,
      modalProps: {
        style: { maxWidth: '1500px', width: '1000px' },
      },
    };

    return {
      // queryParams: {}, // 初始化查询参数 url
      queryData, // 初始化查询参数 body payload
      ...supplierLovProps,
    };
  };

  // 渲染编辑组件
  @Bind()
  renderEditorField(field, rowData) {
    const { currencyCodeFlag } = this.state;
    const { fieldWidget, dimensionCode, sourceCode } = field;
    const { record } = rowData;
    const displayValue = rowData[dimensionCode];
    switch (fieldWidget) {
      case 'INPUT_NUMBER':
        // 含税未税，每一含税未税，全球化
        if (
          ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
            dimensionCode
          )
        ) {
          // 如果有币种，用币种的精度(前提币种存在)，不然就是维度配置的
          const expandProps =
            currencyCodeFlag && record.get('currencyCode')
              ? {}
              : {
                  precision: field.numberPrecision,
                };
          return (
            <C7nPrecisionInputNumber
              name={dimensionCode}
              record={record}
              currency="currencyCode"
              precisionPropIsFirst={false}
              {...expandProps}
            />
          );
        }
        return (
          <NumberField name={dimensionCode} record={record} precision={field.numberPrecision} />
        );
      case 'LOV':
        // 供应商组件
        if (
          dimensionCode === 'supplierCompanyId' &&
          ['SSLM.SUPPLIER', 'SPRM.SUPPLIER_FOR_SPC'].includes(sourceCode)
        ) {
          // 固定值
          const { ...resetProps } = this.getSupplierLovProps(field, record);
          return (
            <SupplierLov {...resetProps} name={`${dimensionCode}LOV`} dataSet={this.tableDs} />
          );
        }
        return <Lov name={`${dimensionCode}LOV`} record={record} />;
      case 'SELECT':
        return <Select name={dimensionCode} record={record} />;
      case 'SWITCH':
        return <CheckBox name={dimensionCode} record={record} />;
      case 'DATE_PICKER':
        if (
          field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
          field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
        ) {
          return <DateTimePicker name={dimensionCode} record={record} />;
        }
        return <DatePicker name={dimensionCode} record={record} />;
      case 'INPUT':
        return <TextField name={dimensionCode} record={record} />;
      case 'LINK':
        switch (field.dimensionCode) {
          case 'ladderQuotation': // 阶梯报价
            return <a onClick={() => this.showLadderQuotation(rowData)}>{displayValue}</a>;
          case 'applicationScope': // 适用范围
            return <a onClick={() => this.showApplicationScope(rowData)}>{displayValue}</a>;
          default:
            if (rowData[`${field.dimensionCode}OpenMethod`] === 'POPUP_WINDOW') {
              // 弹窗
              return (
                <a onClick={() => this.handleShowLinkTargetPage(rowData, field)}>{displayValue}</a>
              );
            } else {
              return (
                <a
                  href={rowData[`${field.dimensionCode}Href`]}
                  title={rowData[`${field.dimensionCode}Title`]}
                  target={
                    rowData[`${field.dimensionCode}OpenMethod`] === 'NEW_WINDOW'
                      ? '_blank'
                      : '_self'
                  }
                >
                  {displayValue}
                </a>
              );
            }
        }
      case 'LONG_INPUT':
        return (
          <TextArea
            name={dimensionCode}
            record={record}
            resize
            rows={1}
            valueChangeAction="input"
          />
        );
      case 'UPLOAD':
        return this.renderEditable(field, record) ? (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={rowData[field.dimensionCode]}
            filePreview
            viewOnly
          />
        ) : (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={rowData[field.dimensionCode] || record.get(`${field.dimensionCode}`)}
            afterOpenUploadModal={(attUuid) => {
              record.set(`${field.dimensionCode}`, attUuid);
            }}
            fileSize={FIlESIZE}
            filePreview
          />
        );
      default:
        return <Output name={dimensionCode} record={record} />;
    }
  }

  // 处理显示单元格,9种类型
  @Bind()
  renderEditorDisplay(field, rowData) {
    const { fieldWidget, dimensionCode } = field;
    const { record } = rowData;
    const displayValue = rowData[dimensionCode];
    let display;
    switch (fieldWidget) {
      case 'INPUT_NUMBER':
      case 'SELECT':
      case 'INPUT':
      case 'LONG_INPUT':
        display = <Output name={dimensionCode} record={record} />;
        break;
      case 'LOV':
        display = <Output name={`${dimensionCode}LOV`} record={record} />;
        break;
      case 'SWITCH':
        display = (
          <Output
            name={dimensionCode}
            record={record}
            renderer={({ value }) => yesOrNoRender(value)}
          />
        );
        break;
      case 'DATE_PICKER':
        display = (
          <Output
            name={dimensionCode}
            record={record}
            renderer={({ value }) =>
              value && moment(value).format(this.renderDateFormat(field.dateFormat))
            }
          />
        );
        break;
      case 'UPLOAD':
        display = (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={displayValue}
            filePreview
            viewOnly
          />
        );
        break;
      case 'LINK':
        switch (field.dimensionCode) {
          case 'ladderQuotation': // 阶梯报价
            display = <a onClick={() => this.showLadderQuotation(rowData)}>{displayValue}</a>;
            break;
          case 'applicationScope': // 适用范围
            display = <a onClick={() => this.showApplicationScope(rowData)}>{displayValue}</a>;
            break;
          default:
            if (rowData[`${field.dimensionCode}OpenMethod`] === 'POPUP_WINDOW') {
              // 弹窗
              display = (
                <a onClick={() => this.handleShowLinkTargetPage(rowData, field)}>{displayValue}</a>
              );
            } else {
              display = (
                <a
                  href={rowData[`${field.dimensionCode}Href`]}
                  title={rowData[`${field.dimensionCode}Title`]}
                  target={
                    rowData[`${field.dimensionCode}OpenMethod`] === 'NEW_WINDOW'
                      ? '_blank'
                      : '_self'
                  }
                >
                  {displayValue}
                </a>
              );
            }
            break;
        }
        break;
      default:
        display = <Output name={dimensionCode} record={record} />;
    }
    return display;
  }

  // 处理显示单元格
  @Bind()
  renderDisplay(field, rowData) {
    const { fieldWidget, dimensionCode } = field;
    const displayValue = rowData[dimensionCode];
    let display;
    if (isNil(displayValue) && fieldWidget !== 'SWITCH') {
      return '-';
    }
    switch (fieldWidget) {
      case 'LOV':
      case 'SELECT':
        display = (
          <Tooltip placement="bottomLeft" title={rowData[`${dimensionCode}Meaning`]}>
            {dimensionCode === 'approvalStatus' || dimensionCode === 'priceLibraryStatus'
              ? renderValidStatu(rowData[dimensionCode], rowData[`${dimensionCode}Meaning`])
              : rowData[`${dimensionCode}Meaning`]}
          </Tooltip>
        );
        break;
      case 'SWITCH':
        display = yesOrNoRender(displayValue);
        break;
      case 'DATE_PICKER':
        display = (
          <Tooltip
            placement="bottomLeft"
            title={moment(displayValue).format(this.renderDateFormat(field.dateFormat))}
          >
            {displayValue && moment(displayValue).format(this.renderDateFormat(field.dateFormat))}
          </Tooltip>
        );
        break;
      case 'UPLOAD':
        display = (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={displayValue}
            filePreview
            viewOnly
          />
        );
        break;
      case 'LINK':
        switch (field.dimensionCode) {
          case 'ladderQuotation': // 阶梯报价
            display = <a onClick={() => this.showLadderQuotation(rowData)}>{displayValue}</a>;
            break;
          case 'applicationScope': // 适用范围
            display = <a onClick={() => this.showApplicationScope(rowData)}>{displayValue}</a>;
            break;
          default:
            if (rowData[`${field.dimensionCode}OpenMethod`] === 'POPUP_WINDOW') {
              // 弹窗
              display = (
                <a onClick={() => this.handleShowLinkTargetPage(rowData, field)}>{displayValue}</a>
              );
            } else {
              display = (
                <a
                  href={rowData[`${field.dimensionCode}Href`]}
                  title={rowData[`${field.dimensionCode}Title`]}
                  target={
                    rowData[`${field.dimensionCode}OpenMethod`] === 'NEW_WINDOW'
                      ? '_blank'
                      : '_self'
                  }
                >
                  {displayValue}
                </a>
              );
            }
            break;
        }
        break;
      default:
        display = (
          // 含税单价未税单价，千分位分割
          <Tooltip
            placement="bottomLeft"
            title={
              ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
                dimensionCode
              )
                ? numberSeparatorRender(displayValue)
                : displayValue
            }
          >
            {['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
              dimensionCode
            )
              ? numberSeparatorRender(displayValue)
              : displayValue}
          </Tooltip>
        );
    }
    return display;
  }

  /**
   * 编辑render
   */
  @Bind()
  editCell({ field = {}, rowData = {} }) {
    const { ssrcRemote } = this.props;
    if (rowData._status === 'create' || rowData._status === 'update') {
      if (rowData.record) {
        return ssrcRemote
          ? ssrcRemote.process(
              'SSRC_PRICE_LIBRARY_NEW_MATERIAL_EDIT_EDITOR_FIELD',
              this.renderEditorField(field, rowData),
              {
                current: this,
                field,
                rowData,
              }
            )
          : this.renderEditorField(field, rowData);
      } else {
        return this.renderEditorDisplay(field, rowData);
      }
    } else {
      return this.renderDisplay(field, rowData);
    }
  }

  /**
   * 渲染fieldType
   */
  // @Bind()
  renderFieldType(field = {}, currencyCodeFlag) {
    let fieldConfig = {};
    const {
      match: { params },
    } = this.props;
    const dynamicProps = {
      dynamicProps: {
        required: ({ record }) => this.renderRequired(field, record),
        disabled: ({ record, dataSet }) => {
          const { dimensionCode } = field;
          const ruleDefinition = dataSet.getState('ruleDefinition');
          if (['netPrice', 'taxIncludedPrice'].includes(dimensionCode)) {
            const editField = getPriceEditField(record, ruleDefinition, {
              templateCode: params.templateCode,
            });
            // 业务规则定义维护的哪个字段，哪个字段就走fx
            if (
              (editField === 'TAX_INCLUDED_PRICE' && dimensionCode === 'taxIncludedPrice') ||
              (dimensionCode === 'netPrice' && editField === 'NET_PRICE')
            ) {
              return this.renderEditable(field, record);
            }
            return true;
            // return (
            //   (dimensionCode === 'netPrice' && editField !== 'NET_PRICE') ||
            //   (dimensionCode === 'taxIncludedPrice' && editField !== 'TAX_INCLUDED_PRICE')
            // );
          }
          return this.renderEditable(field, record);
        },
      },
    };

    const { dimensionCode } = field;

    const displayField = field.priceLibDimMapList?.find(
      (n) => n.targetDimensionCode === dimensionCode
    )?.sourceFromFieldMeaning;
    const valueField = field.priceLibDimMapList?.find(
      (n) => n.targetDimensionCode === dimensionCode
    )?.sourceFromFieldName;

    switch (field.fieldWidget) {
      case 'UPLOAD':
      case 'LINK':
        fieldConfig = {
          type: 'string',
          ...dynamicProps,
        };
        break;
      case 'INPUT':
        fieldConfig = {
          type: 'string',
          maxLength: field.textMaxLength,
          minLength: field.textMinLength,
          ...dynamicProps,
        };
        break;
      case 'LONG_INPUT':
        fieldConfig = {
          type: 'string',
          ...dynamicProps,
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          // multiple: Number(field.multipleFlag) === 1 ? ',' : false,
          dynamicProps: {
            // 设置下拉框查询参数
            lovPara: ({ record }) => this.renderQueryParams(field, record),
            required: ({ record }) => this.renderRequired(field, record),
            disabled: ({ record }) => this.renderEditable(field, record),
          },
        };
        break;
      case 'LOV':
        fieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          textField: displayField || field.displayField,
          valueField: valueField || field.valueField,
          dynamicProps: {
            // 设置lov查询参数
            lovPara: ({ record }) => this.renderQueryParams(field, record),
            required: ({ record }) => this.renderRequired(field, record),
            disabled: ({ record }) => this.renderEditable(field, record),
          },
          // multiple: Number(field.multipleFlag) === 1,
          // transformRequest: value => (isObject(value) ? value[field.valueField] : value),
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
          nonStrictStep: true,
          min: field.numberMin !== null ? new BigNumber(field.numberMin) : undefined,
          max: field.numberMax !== null ? new BigNumber(field.numberMax) : undefined,
          dynamicProps: {
            step: ({ record }) => {
              return currencyCodeFlag &&
                record.get('currencyCode') &&
                ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
                  dimensionCode
                )
                ? null
                : field.numberPrecision || field.numberPrecision === 0
                ? math.div(1, math.pow(10, field.numberPrecision))
                : null;
            },
            ...dynamicProps.dynamicProps,
          },
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
          transformRequest: (val) =>
            val &&
            moment(val).format(
              field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                ? 'YYYY-MM-DD HH:mm:ss'
                : 'YYYY-MM-DD 00:00:00'
            ),
          ...dynamicProps,
        };
        break;
      case 'SWITCH':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (val) => (isNil(val) ? val : Number(val)),
          ...dynamicProps,
        };
        break;
      default:
        fieldConfig = {
          type: 'string',
          ...dynamicProps,
        };
        break;
    }
    return fieldConfig;
  }

  /**
   * 渲染列居左居中居右
   */
  @Bind()
  renderAlign(field) {
    let align = 'left';
    switch (field.fieldWidget) {
      case 'INPUT_NUMBER':
        align = 'right';
        break;
      default:
        align = 'left';
        break;
    }
    return align;
  }

  /**
   * 渲染queryField,查询表单列
   * 链接，上传，不可作查询条件
   */
  @Bind()
  renderQueryField(field) {
    let queryField;
    switch (field.fieldWidget) {
      case 'INPUT':
        queryField = <TextField name={field.dimensionCode} />;
        break;
      case 'INPUT_NUMBER':
        queryField = <NumberField name={field.dimensionCode} />;
        break;
      case 'SELECT':
        queryField = <Select name={field.dimensionCode} />;
        break;
      case 'LOV':
        queryField = <Lov name={field.dimensionCode} />;
        break;
      case 'DATE_PICKER':
        queryField =
          field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
          field.dateFormat === 'yyyy-MM-dd hh:mm:ss' ? (
            <DateTimePicker name={field.dimensionCode} />
          ) : (
            <DatePicker name={field.dimensionCode} />
          );
        break;
      case 'SWITCH':
        queryField = <Select name={field.dimensionCode} />;
        break;
      default:
        queryField = <TextField name={field.dimensionCode} />;
        break;
    }
    return queryField;
  }

  /**
   * 渲染queryFieldType
   * 链接，上传，不可作查询条件
   */
  @Bind()
  renderQueryFieldType(field) {
    let queryFieldConfig = {};
    switch (field.fieldWidget) {
      case 'INPUT':
        queryFieldConfig = {
          type: 'string',
        };
        break;
      case 'INPUT_NUMBER':
        queryFieldConfig = {
          type: 'number',
          range: ['start', 'end'],
        };
        break;
      case 'SELECT':
        queryFieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1,
          // 设置下拉框查询参数
          lovPara: this.renderQueryFieldParams(field),
        };
        break;
      case 'LOV':
        queryFieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1,
          // 设置下拉框查询参数
          lovPara: this.renderQueryFieldParams(field),
          transformRequest: (value) =>
            value &&
            (Number(field.multipleFlag) === 1
              ? value.map((item) => item[field.valueField])
              : value[field.valueField]),
        };
        break;
      case 'DATE_PICKER':
        queryFieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          range: ['start', 'end'],
          format: this.renderDateFormat(field.dateFormat),
          transformRequest: (val) => {
            if (val) {
              Object.assign(val, {
                start: val.start && moment(val.start).format('YYYY-MM-DD 00:00:00'),
                end: val.end && moment(val.end).format('YYYY-MM-DD 23:59:59'),
              });
            }
            return val;
          },
        };
        break;
      case 'SWITCH':
        queryFieldConfig = {
          type: 'string',
          lookupCode: 'HPFM.FLAG',
        };
        break;
      default:
        queryFieldConfig = {
          type: 'string',
        };
        break;
    }
    return queryFieldConfig;
  }

  /**
   * 渲染查询列配置, 设置lov,select查询参数
   */
  @Bind()
  renderQueryFieldParams(field) {
    let queryParams = {};
    if (!isEmpty(field.priceLibLovParamList)) {
      field.priceLibLovParamList.forEach((item) => {
        if (item.applyQueryFlag) {
          queryParams = { ...queryParams, [item.paramName]: item.paramValue };
        }
      });
    }
    return queryParams;
  }

  /**
   * 查询头
   */
  @Bind()
  async fetchPriceLibHeaderConfig() {
    const {
      match: { params },
    } = this.props;
    this.setState({ queryLoading: true });
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: params.templateCode,
        dimensionType: 'BASIC',
        from: 'EDIT',
        ...this.state.routerParams,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const columnList = [];
      const queryFields = [];
      const ladderQuotationFields = [];
      list.forEach((item) => {
        // 显示或者基准价维度,添加dsField
        if (Number(item.fieldVisible) || item.dimensionCode === 'benchmarkPriceType') {
          // 组件类型是lov
          if (item.fieldWidget === 'LOV') {
            const displayField = item.priceLibDimMapList?.find(
              (n) => n.targetDimensionCode === item.dimensionCode
            )?.sourceFromFieldMeaning;
            const valueField = item.priceLibDimMapList?.find(
              (n) => n.targetDimensionCode === item.dimensionCode
            )?.sourceFromFieldName;

            this.tableDs.addField(`${item.dimensionCode}LOV`, {
              name: `${item.dimensionCode}LOV`,
              label: item.dimensionName,
              ignore: 'always',
              ...this.renderFieldType(item),
            });
            this.tableDs.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${valueField || item.valueField}`,
              defaultValue: item.defaultValue,
            });
            this.tableDs.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              bind: `${item.dimensionCode}LOV.${displayField || item.displayField}`,
              defaultValue: item.defaultValueMeaning,
            });
            // 设置值集映射关系
            this.tableDs.addField(`${item.dimensionCode}MapList`, {
              name: `${item.dimensionCode}MapList`,
              defaultValue: item.priceLibDimMapList,
              ignore: 'always',
            });
          } else {
            this.tableDs.addField(`${item.dimensionCode}`, {
              name: `${item.dimensionCode}`,
              label: item.dimensionName,
              // required: Number(item.fieldRequired) === 1,
              defaultValue:
                item.fieldWidget === 'SWITCH' ? Number(item.defaultValue) : item.defaultValue,
              ...this.renderFieldType(item),
            });
          }
          // 阶梯报价动态增加field
          if (
            item.dimensionCode === 'itemId' ||
            item.dimensionCode === 'itemCategoryId' ||
            item.dimensionCode === 'currencyCode'
          ) {
            this.ladderQuotationFormDs.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              label: item.dimensionName,
            });
            ladderQuotationFields.push(<Output name={`${item.dimensionCode}Meaning`} />);
          }
        }
        // 查询条件
        if (item.queryFlag) {
          this.queryFormDs.addField(item.dimensionCode, {
            name: item.dimensionCode,
            label: item.dimensionName,
            ...this.renderQueryFieldType(item),
          });
          queryFields.push(this.renderQueryField(item));
        }

        // table column
        if (Number(item.fieldVisible)) {
          columnList.push({
            dataIndex:
              item.fieldWidget === 'LOV' ? `${item.dimensionCode}LOV` : `${item.dimensionCode}`,
            key: item.fieldWidget === 'LOV' ? `${item.dimensionCode}LOV` : `${item.dimensionCode}`,
            title: item.dimensionName,
            width: item.gridWidth,
            resizable: true,
            align: this.renderAlign(item),
            hideable: false, // 无法隐藏列
            render: ({ rowData }) => {
              return this.editCell({
                rowData,
                field: item,
              });
            },
          });
        }
      });

      this.setState({ columnList, queryFields, ladderQuotationFields });
      this.fetchPriceLibData({}, 1);
    } else {
      this.setState({ queryLoading: false });
    }
  }

  // 校验附件是否上传
  @Bind()
  async checkAttachment(validateData, params) {
    let validateFlag = true;
    if (!isEmpty(this.state.configList)) {
      // 获取表格数据源
      const dataSource = await getEditPerformanceTableData(validateData, ['priceLibId'], {
        templateCode: params.templateCode,
      });
      if (!isEmpty(dataSource)) {
        // 获取类型为附件的字段
        const uploadConfigs = this.state.configList.filter((item) => item.fieldWidget === 'UPLOAD');
        // 存储需校验的uuid
        const uploadData = [];
        dataSource.forEach((data) => {
          uploadConfigs.forEach((config) => {
            // 判断附件是否必输
            const requiredFlag = this.renderRequired(config, new Record(data));
            if (requiredFlag) {
              uploadData.push({ ...config, uuid: data[config.dimensionCode] });
            }
          });
        });
        if (!isEmpty(uploadData)) {
          const countList = await getResponse(getAttachmentCount(uploadData));
          if (countList) {
            // 当前报错的对象
            let curErrorObj = null;
            uploadData.forEach((data) => {
              if (!countList[data.uuid]) {
                curErrorObj = data;
                return false;
              }
            });
            if (curErrorObj) {
              notification.warning({
                message: intl
                  .get('ssrc.priceLibraryNew.view.attachment.requiredMsg', {
                    title: curErrorObj.title,
                  })
                  .d(`${curErrorObj.title}未上传`),
              });
              validateFlag = false;
            }
          }
        }
      }
    }
    return validateFlag;
  }

  /**
   * 保存-保存新增项或编辑项
   */
  @throttle(1000)
  @Bind()
  savePriceLib() {
    const {
      match: { params },
    } = this.props;
    const { tableData = [], cacheData = {}, pagination = {} } = this.state;
    const filterObject = {};
    tableData.forEach((n) => {
      if (n.record) {
        filterObject[n.priceLibId] = n;
      }
    });
    // eslint-disable-next-line guard-for-in
    for (const key in cacheData) {
      if (cacheData[key].record) {
        filterObject[key] = cacheData[key];
      }
    }
    const validateData = Object.values(filterObject);
    // 校验新增或编辑项，绕开用this.tableDs.validate()
    Promise.all([
      ...validateData?.map((r) => r?.record?.validate(true, true)),
      this.checkAttachment(validateData, params),
    ]).then(async (results) => {
      if (results.every((result) => result)) {
        const dataSource = await getEditPerformanceTableData(validateData, ['priceLibId'], {
          templateCode: params.templateCode,
        });
        if (!isEmpty(dataSource)) {
          this.setState({ saveLoading: true });
          savePriceLib(dataSource)
            .then((res) => {
              const result = getResponse(res);
              if (result) {
                notification.success();
                // this.fetchPriceLibData(pagination); // 由于引用了checkData, 接口回调中的 checkData还是有值的, 导致清空无效
                this.setState({ checkData: [], checkValues: [], cacheData: {} }, () =>
                  this.fetchPriceLibData(pagination)
                );
              }
            })
            .finally(() => {
              this.setState({ saveLoading: false });
            });
        }
      }
    });
  }

  /**
   * 发布确认弹框数据
   */
  @Bind()
  releaseConfirmModalProps() {
    const { customizeForm } = this.props;
    return {
      drawer: true,
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.message.releaseConfirm').d('发布确认'),
      style: {
        width: 380,
      },
      children: customizeForm(
        {
          code: 'SSRC.PRICE_LIB_NEW.REQ_EDIT',
          dataSet: this.releaseConfirm,
        },
        <Form dataSet={this.releaseConfirm} columns={1} labelLayout="float">
          <TextArea name="remark" resize="vertical" />
          <Attachment
            fileSize={FIlESIZE}
            label={intl.get('ssrc.priceLibraryNew.model.library.attachmentUpload').d('附件上传')}
            name="attachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="price-center"
            data={{
              tenantId: organizationId,
            }}
          />
        </Form>
      ),
    };
  }

  /**
   * 发布 - 支持跨页勾选发布
   */
  @debounce(500, { leading: true, trailing: false })
  @Bind()
  releasePriceLibrary() {
    const {
      match: { params },
    } = this.props;
    let flag = true;
    const { checkData = [], routerParams } = this.state;
    if (!isEmpty(checkData)) {
      const validateData = checkData.filter((n) => n.record);
      Promise.all(validateData?.map((r) => r?.record?.validate(true, true))).then(
        async (results) => {
          if (results.every((result) => result)) {
            // add by Goku ---- 按照后端优化, 需要删除过滤字段, `ladderQuotation|applicationScope|relevantPrice|{variable}meaning`, 增加修改flag `changeFlag`
            const dataSource = await getCustomizeEditPerformanceTableData(
              checkData,
              ['priceLibId'],
              ['applicationScope', 'ladderQuotation', 'relevantPrice'],
              {
                templateCode: params.templateCode,
                reqType: 'RELEASE',
                viewCode: routerParams.viewCode,
              }
            );
            if (!isEmpty(dataSource)) {
              this.setState({ releaseLoading: true });
              const validateRes = await this.handlePreReleaseValidate(dataSource);
              if (!validateRes) {
                this.setState({ releaseLoading: false });
                return;
              }
              // 需要带出弹窗里的值
              const { releaseFormData } = validateRes;
              getResponse(
                fetchApproveMethod({ dataSource, customizeUnitCode: 'SSRC.PRICE_LIB_NEW.REQ_EDIT' })
              )
                .then((res) => {
                  const result = getResponse(res);
                  if (result && !result.failed) {
                    // 保存审批方式，方便后续二开判断是否需要赋值
                    if (this.releaseConfirm.current) {
                      this.releaseConfirm.current.set({
                        _approveMethod: result,
                      });
                    }
                    if (result.includes('WFL') || result.includes('EXT')) {
                      Modal.open({
                        ...this.releaseConfirmModalProps(),
                        onOk: () => {
                          return this.releaseConfirmMethod(dataSource);
                        },
                        onCancel: () => this.releaseConfirm.current?.reset(),
                      });
                      // 将弹窗默认值带到表单中
                      if (isObject(releaseFormData) && this.releaseConfirm?.current) {
                        this.releaseConfirm.current.set({
                          ...releaseFormData,
                        });
                      }
                    } else {
                      this.releaseConfirmMethod(dataSource);
                      flag = false;
                    }
                  }
                })
                .finally(() => {
                  if (flag) {
                    this.setState({
                      releaseLoading: false,
                    });
                  }
                });
            }
          } else {
            notification.warning({
              message: intl
                .get('ssrc.priceLibraryNew.view.notification.validate.required')
                .d('存在必填项未填写，请重新维护!'),
            });
          }
        }
      );
    } else {
      notification.warning({
        message: intl
          .get('ssrc.priceLibraryNew.view.notification.chooseOne')
          .d('请至少勾选一条数据'),
      });
    }
  }

  /**
   * 发布前预校验
   */
  @Bind()
  async handlePreReleaseValidate(dataSource) {
    const response = await preReleaseValidate(dataSource).catch(() => {
      this.setState({ releaseLoading: false });
    });
    if (getResponse(response)) {
      return response;
    }
    return false;
  }

  /**
   * 确认发布
   */
  // @throttle(1000)
  @Bind()
  async releaseConfirmMethod(data = [], params) {
    const {
      ssrcRemote,
      match: { params: matchParams },
    } = this.props;
    const { pagination = {}, routerParams } = this.state;
    if (!(await this.releaseConfirm.validate())) {
      return false;
    }
    if (ssrcRemote && ssrcRemote.event) {
      const remoteFlag = await ssrcRemote.event.fireEvent('handleCuxRelease', {
        current: this,
        reqType: 'RELEASE',
        viewCode: routerParams.viewCode,
        templateCode: matchParams.templateCode,
      });
      if (!remoteFlag) return false;
    }
    const { remark, attachmentUuid, _approveMethod, ...others } =
      this.releaseConfirm.toData()[0] || {};
    // 由于偶尔有端侧bug，有重复数据，因此做兜底逻辑，传参前进行去重
    const dataSource = [];
    const priceLibIdMap = {}; // 唯一键priceLibId
    data.forEach((item) => {
      if (item.priceLibId === undefined || !priceLibIdMap[item.priceLibId]) {
        dataSource.push(item);
        priceLibIdMap[item.priceLibId] = true;
      }
    });
    if (!isEmpty(dataSource)) {
      dataSource[0]._attachmentUuid = attachmentUuid;
      dataSource[0]._remark = remark;
      // Object.assign(dataSource[0], others);
      // 审批方式为工作流
      if (_approveMethod?.includes('WFL') || _approveMethod?.includes('EXT')) {
        Object.assign(dataSource[0], {
          releaseFormData: others,
        });
      }
      this.setState({ releaseLoading: true });
      this.handleShowReleaseHistory();
      const releasePrice = params ? releaseAllPriceLib : releasePriceLib;
      releasePrice({ ...params, dataSource, customizeUnitCode: 'SSRC.PRICE_LIB_NEW.REQ_EDIT' })
        .then((res) => {
          const result = getResponse(res);
          if (result && !result.failed) {
            notification.success();
            this.setState({ checkData: [], checkValues: [], cacheData: {} });
            this.fetchPriceLibData(pagination);
            this.queryReleasedProgress();
          }
        })
        .finally(() => {
          // eslint-disable-next-line no-unused-expressions
          this.releaseConfirm.current?.reset();
          this.setState({
            releaseLoading: false,
          });
        });
    }
  }

  /**
   * 批量创建
   */
  @Bind()
  handleBatchCreate() {
    const {
      match: { params },
    } = this.props;
    const { routerParams } = this.state;
    openTab({
      key: `/ssrc/price-library-new/${params.templateCode}/comment-import`,
      path: `/ssrc/price-library-new/${params.templateCode}/comment-import`,
      title: 'hzero.common.button.priceImport',
      closable: true,
      search: `viewCode=${routerParams.viewCode}`,
      // search: querystring.stringify({
      //   key: `/ssrc/price-library-new/${params.templateCode}/comment-import`,
      //   title: 'hzero.common.button.priceImport',
      //   action: intl.get('hzero.common.button.priceImport').d('批量创建'),
      //   args: JSON.stringify({
      //     priceLibIds: routerParams.priceLibIds,
      //     viewCode: routerParams.viewCode,
      //   }),
      // }),
    });
  }

  /**
   * 更多查询
   */
  @Bind()
  handleToggle() {
    this.setState({
      hidden: !this.state.hidden,
    });
  }

  /**
   * 全选-反选
   */
  @Bind()
  handleCheckAllChange(value) {
    const { checkValues = [], checkData = [], tableData = [] } = this.state;
    let newCheckValues = [];
    let newCheckData = [];
    if (value) {
      // 去除当前页勾选重复数据
      newCheckValues = uniqWith([...checkValues, ...tableData.map((i) => i.priceLibId)], isEqual);
      newCheckData = uniqWith([...checkData, ...tableData], isEqual);
    } else {
      // 去除当前页全选数据
      newCheckValues = differenceWith(
        checkValues,
        tableData.map((i) => i.priceLibId),
        isEqual
      );
      newCheckData = differenceWith(checkData, tableData, isEqual);
    }
    this.setState({
      checkValues: newCheckValues,
      checkData: newCheckData,
      checkedAll: value,
    });
  }

  /**
   * change勾选框
   */
  @Bind()
  handleChange(value, oldValue, rowData) {
    const { checkValues = [], checkData = [] } = this.state;
    let newCheckValues = [];
    let newCheckData = [];
    if (value) {
      newCheckValues = [...checkValues, value];
      newCheckData = [...checkData, rowData];
    } else {
      newCheckValues = checkValues.filter((item) => item !== oldValue);
      newCheckData = checkData.filter((item) => item.priceLibId !== rowData.priceLibId);
    }
    this.setState({
      checkValues: newCheckValues,
      checkData: newCheckData,
    });
    this.forceUpdate();
  }

  /**
   * 获取table列
   */
  get columns() {
    const { checkValues = [], tableData = [], columnList = [] } = this.state;
    const currentPriceLibIds = tableData.map((item) => item.priceLibId);
    return [
      {
        title: () => (
          <CheckBox
            name="controlled"
            checked={
              !isEmpty(currentPriceLibIds) &&
              currentPriceLibIds.every((item) => checkValues.includes(item))
            }
            onChange={this.handleCheckAllChange}
          />
        ),
        dataIndex: 'priceLibId',
        key: 'priceLibId',
        width: 60,
        align: 'center',
        fixed: 'left',
        verticalAlign: 'middle',
        render: ({ rowData }) => {
          return (
            <CheckBox
              name="controlled"
              value={rowData.priceLibId}
              checked={checkValues.indexOf(rowData.priceLibId) !== -1}
              onChange={(value, oldValue) => this.handleChange(value, oldValue, rowData)}
            />
          );
        },
      },
      ...columnList,
      {
        title: intl.get('hzero.common.edit').d('编辑'),
        dataIndex: 'edit',
        key: 'edit',
        width: 100,
        fixed: 'right',
        align: 'left',
        render: ({ rowData, rowIndex }) => {
          if (rowData._status === 'create') {
            return '';
          } else if (rowData._status === 'update') {
            return (
              <a onClick={() => this.handelCancel(rowData, rowIndex)}>
                {intl.get('hzero.common.view.button.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a onClick={() => this.handelEdit(rowData, rowIndex)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
  }

  @Bind()
  handleAggregationChange(aggregation) {
    this.setState({ aggregation });
  }


  /**
   * 开启白名单之后，采购方信息优先取个人信息维护的数据
   * @param {*} param0
   * @returns
   */
  @Bind()
  getDefaultValue({ name, field }) {
    const { commonDefaultInfo } = this.state || {};
    if (isEmpty(commonDefaultInfo)) {
      return null;
    } else if (
      [
        'companyId',
        'companyIdMeaning',
        'ouId',
        'ouIdMeaning',
        'purchaseAgentId',
        'purchaseAgentIdMeaning',
      ].includes(name)
    ) {
      return commonDefaultInfo?.[`${field}`];
    } else if (name === 'purOrganizationId') {
      return commonDefaultInfo?.purOrganizationId;
    } else if (name === 'purOrganizationIdMeaning') {
      return commonDefaultInfo?.buyOrganizationName;
    } else if (name === 'invOrganizationId') {
      return commonDefaultInfo?.organizationId;
    } else if (name === 'invOrganizationIdMeaning') {
      return commonDefaultInfo?.organizationName;
    } else {
      return null;
    }
  }

  /**
   * 发布历史
   */
  @Bind()
  handleShowReleaseHistory() {
    notificationC7n.open({
      placement: 'bottomRight',
      description: (
        <span className={style['releasing-notification-desc']}>
          <IconC7n type="check_circle" style={{ color: '#47B881', marginRight: 11 }} />{' '}
          {`${intl.get(`ssrc.priceLibraryNew.view.message.releasing`).d('正在发布中')}...`}
        </span>
      ),
      style: {
        width: 180,
        padding: 0,
      },
      duration: 1,
      className: style['releasing-notification-container'],
    });
  }

  /*
   * 设置表格动态列 - 类比 antd table selectRows
   */
  @Bind()
  handleAfterQueryFields(list = []) {
    this.columnList = list;
    if (!isArray(list) || isEmpty(list)) return [];
    const columnList = [];
    const ladderQuotationFields = [];
    // 判断是否有币种
    const currencyCodeFlag = list.some(
      (item) => item.dimensionCode === 'currencyCode' && item.fieldVisible
    );
    list.forEach((item) => {
      // 显示或者基准价维度,添加dsField
      if (item.fieldBatchEditable) {
        this.batchMaintainButtonVisible = true;
      }
      if (Number(item.fieldVisible) || item.dimensionCode === 'benchmarkPriceType') {
        // // 如果含税或者不含税单价中有维护了fx，则记录下来
        // const { dimensionCode } = item;
        // if (item?.editPriceLibRuleHeader?.priceLibRuleCombList) {
        //   // 分别设置获取含税单价和不含税单价方法
        //   if (dimensionCode === 'netPrice') {
        //     this.tableDs.setState({
        //       fxPrice: true,
        //       getFxNetPrice: (record) => this.renderEditable(item, record),
        //     });
        //   }
        //   if (dimensionCode === 'taxIncludedPrice') {
        //     this.tableDs.setState({
        //       fxPrice: true,
        //       getFxTaxIncludedPrice: (record) => this.renderEditable(item, record),
        //     });
        //   }
        // }
        // 组件类型是lov
        if (item.fieldWidget === 'LOV') {
          const displayField = item.priceLibDimMapList?.find(
            (n) => n.targetDimensionCode === item.dimensionCode
          )?.sourceFromFieldMeaning;
          const valueField = item.priceLibDimMapList?.find(
            (n) => n.targetDimensionCode === item.dimensionCode
          )?.sourceFromFieldName;

          this.tableDs.addField(`${item.dimensionCode}LOV`, {
            name: `${item.dimensionCode}LOV`,
            label: item.dimensionName,
            ignore: 'always',
            ...this.renderFieldType(item, currencyCodeFlag),
          });
          this.tableDs.addField(`${item.dimensionCode}`, {
            name: `${item.dimensionCode}`,
            type: 'string',
            bind: `${item.dimensionCode}LOV.${valueField || item.valueField}`,
            defaultValue:
              this.getDefaultValue({
                name: `${item.dimensionCode}`,
                field: valueField || item.valueField,
              }) || item.defaultValue,
          });
          this.tableDs.addField(`${item.dimensionCode}Meaning`, {
            name: `${item.dimensionCode}Meaning`,
            type: 'string',
            bind: `${item.dimensionCode}LOV.${displayField || item.displayField}`,
            defaultValue:
              this.getDefaultValue({
                name: `${item.dimensionCode}Meaning`,
                field: displayField || item.displayField,
              }) || item.defaultValueMeaning,
          });
          // 设置值集映射关系
          this.tableDs.addField(`${item.dimensionCode}MapList`, {
            name: `${item.dimensionCode}MapList`,
            defaultValue: item.priceLibDimMapList,
            ignore: 'always',
          });
        } else {
          this.tableDs.addField(`${item.dimensionCode}`, {
            name: `${item.dimensionCode}`,
            label: item.dimensionName,
            // required: Number(item.fieldRequired) === 1,
            defaultValue:
              item.fieldWidget === 'SWITCH' ? Number(item.defaultValue) : item.defaultValue,
            ...this.renderFieldType(item, currencyCodeFlag),
          });
        }
        // 阶梯报价动态增加field
        if (
          item.dimensionCode === 'itemId' ||
          item.dimensionCode === 'itemCategoryId' ||
          item.dimensionCode === 'currencyCode'
        ) {
          this.ladderQuotationFormDs.addField(`${item.dimensionCode}Meaning`, {
            name: `${item.dimensionCode}Meaning`,
            type: 'string',
            label: item.dimensionName,
          });
          ladderQuotationFields.push(<Output name={`${item.dimensionCode}Meaning`} />);
        }
      }

      // table column
      if (Number(item.fieldVisible)) {
        columnList.push({
          dataIndex:
            item.fieldWidget === 'LOV' ? `${item.dimensionCode}LOV` : `${item.dimensionCode}`,
          key: item.fieldWidget === 'LOV' ? `${item.dimensionCode}LOV` : `${item.dimensionCode}`,
          title: item.dimensionName,
          width: item.gridWidth,
          resizable: true,
          align: this.renderAlign(item),
          hideable: false, // 无法隐藏列
          render: ({ rowData }) => {
            return this.editCell({
              rowData,
              field: item,
            });
          },
        });
      }
    });
    this.setState({ configList: list, columnList, ladderQuotationFields, currencyCodeFlag });
  }

  /**
   * 批量导出适用范围模板-侧弹框
   */
  @Bind()
  showExportTemplateModal() {
    const {
      match: { params },
    } = this.props;
    const { routerParams } = this.state;

    const queryParams = {
      templateCode: params?.templateCode,
      viewCode: routerParams?.viewCode,
      userId,
      pageCode: 'NEW',
    };

    this.exportTemplateDs.setQueryParameter('queryParams', queryParams);
    this.exportTemplateDs.query();

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.title.advancedSettings').d('高级设置'),
      drawer: true,
      closable: true,
      children: (
        <React.Fragment>
          <Form dataSet={this.exportTemplateDs} columns={1}>
            <C7nSelect name="exportAppScopeMethod" />
          </Form>
        </React.Fragment>
      ),
      onOk: async () => {
        if (await this.exportTemplateDs.validate()) {
          const res = await getResponse(
            saveViewSwitch({ ...this.exportTemplateDs?.current?.toData(), userId, pageCode: 'NEW' })
          );
          if (res && !res.failed) {
            this.DynamicColDS.query();
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      afterClose: () => {
        this.exportTemplateDs.reset();
      },
    });
  }

  /**
   * 此方法被 [凯撒易食] 二开, 严禁他人, 删除/修改 此方法名
   * @protected
   */
  getButtons() {
    const {
      match: { params },
      customizeBtnGroup,
      ssrcRemote,
    } = this.props;
    const {
      saveLoading = false,
      releaseLoading = false,
      activeKey,
      queryLoading = false,
      releasedProgressMap = {},
      checkData,
      routerParams,
      checkValues,
      // releaseAllLoading,
    } = this.state;
    // 发布历史查询loading
    const queryReleaseHistoryLoading = Object.values(releasedProgressMap).some(
      (value) => value.progress !== 100
    );
    const releaseHistoryProps = {
      dataSource: releasedProgressMap,
      onRepublish: this.handleRepublish,
      onQueryReleasedProgress: this.queryReleasedProgress,
      onDeleteReleasedHistory: this.handleDeleteReleasedHistory,
    };
    const renderProps = {
      current: this,
      ...this.state,
      tableDs: this.tableDs,
      formDs: this.releaseConfirm,
      onSave: this.savePriceLib,
      onQuery: this.fetchPriceLibData,
      onRelease: this.releasePriceLibrary,
    };
    const ResponsiveComponent = observer(({ queryData, ...other }) => {
      // 需要把查询参数传递给导出组件
      const newQueryData = toJS(queryData);
      return (
        <ExportDynamicExcel
          requestUrl={`${SRM_SPC}/v1/${organizationId}/price-lib-mains/excel/export/column`}
          queryParams={{
            viewCode: routerParams?.viewCode,
            templateCode: params?.templateCode,
            selectedRowKeys: checkValues,
            queryData: newQueryData,
            pageCode: 'NEW',
          }}
          buttonName={
            checkValues.length ? intl.get(`hzero.common.checkedExport`).d('勾选导出') : undefined
          }
          configNode={
            <span className={style['config-icon']} onClick={this.showExportTemplateModal}>
              <img src={configImg} alt="" />
            </span>
          }
          getDynamicColDS={(ds) => {
            this.DynamicColDS = ds;
          }}
          {...other}
        />
      );
    });
    const buttonGroup = [
      <Button
        key="release"
        data-name="release"
        icon="publish2"
        color="primary"
        disabled={isEmpty(checkData)}
        onClick={this.releasePriceLibrary}
        loading={releaseLoading || queryLoading}
      >
        {intl.get('hzero.common.button.release').d('发布')}
      </Button>,
      <Button
        key="save"
        data-name="save"
        icon="save"
        onClick={this.savePriceLib}
        loading={saveLoading || queryLoading}
        funcType="flat"
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <PermissionButton
        key="batchCreate"
        data-name="batchCreate"
        onClick={() => this.handleBatchCreate()}
        type="c7n-pro"
        icon="archive"
        funcType="flat"
        wait={1000}
        waitType="debounce"
        permissionList={[
          {
            code: `${params.templateCode?.toLocaleLowerCase()}.button.batchcreate`,
            type: 'button',
            meaning:
              intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
              intl.get(`ssrc.priceLibraryNew.view.message.batchCreate`).d('批量创建'),
          },
        ]}
      >
        {intl.get(`ssrc.priceLibraryNew.view.message.batchCreate`).d('批量创建')}
      </PermissionButton>,
      <PermissionButton
        key="releaseAll"
        data-name="releaseAll"
        onClick={this.handleReleaseAll}
        type="c7n-pro"
        icon="publish"
        funcType="flat"
        wait={1000}
        waitType="debounce"
        loading={releaseLoading || queryLoading}
        //   permissionList={[
        //   {
        //     code: `${params.templateCode}.button.largeDataVolumeRelease`,
        //     type: 'button',
        //     meaning:
        //       intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
        //       intl.get(`ssrc.priceLibraryNew.view.message.releaseAll`).d('全量发布'),
        //   },
        // ]}
      >
        {intl.get(`ssrc.priceLibraryNew.view.message.releaseAll`).d('全量发布')}
      </PermissionButton>,
      <Popover
        key="releaseHistory"
        data-name="releaseHistory"
        trigger="hover"
        placement="bottomRight"
        onMouseEnter={this.queryReleasedProgress}
        content={<ReleaseHistory {...releaseHistoryProps} />}
      >
        {queryReleaseHistoryLoading && <Progress key="loading" type="loading" size="small" />}
        <Button icon="operation_service_request" funcType="flat">
          {intl.get(`ssrc.priceLibraryNew.view.button.releaseHistory`).d('发布历史')}
        </Button>
      </Popover>,
      <ResponsiveComponent
        data-name="batchExport"
        name="batchExport"
        funcType="flat"
        queryData={this.queryData}
      />,
    ];
    batchCheckBtnPermission(params.templateCode, buttonGroup);
    return activeKey === 'itemPriceMaintain'
      ? customizeBtnGroup(
          {
            code: 'SSRC.PRICE_LIBRARY_NEW.MATERIAL_EDIT_LIST.HEADER_BUTTONS',
          },
          ssrcRemote
            ? ssrcRemote.process('SSRC_MATERIAL_EDIT_LIST_HEADER_BUTTONS', buttonGroup, renderProps)
            : buttonGroup
        )
      : [];
  }

  @Bind()
  getTableButtons() {
    const {
      match: { params },
      ssrcRemote,
    } = this.props;
    const { queryLoading = false, checkValues } = this.state;

    const props = {
      current: this,
      ...this.state,
      tableDs: this.tableDs,
    };
    const buttonGroup = [
      <PermissionButton
        onClick={() => this.handleAdd()}
        type="c7n-pro"
        icon="playlist_add"
        funcType="flat"
        key="add"
        color="primary"
        permissionList={[
          {
            code: `${params.templateCode?.toLocaleLowerCase()}.button.tablecreate`,
            type: 'button',
            meaning:
              intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
              intl.get('hzero.common.button.add').d('新增'),
          },
        ]}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </PermissionButton>,
      <Button
        icon="delete_sweep"
        color="primary"
        funcType="flat"
        onClick={() => this.handleDelete()}
        key="delete"
        disabled={checkValues.length === 0}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
      <Button
        icon="mode_edit"
        color="primary"
        key="batchMaintenanceCheck"
        funcType="flat"
        onClick={() => this.batchMaintainItemForm()}
        disabled={!this.batchMaintainButtonVisible}
        loading={queryLoading}
      >
        {intl.get('ssrc.priceLibraryNew.view.button.batchMaintenanceCheck').d('批量编辑')}
      </Button>,
    ];
    batchCheckBtnPermission(params.templateCode, buttonGroup);
    return ssrcRemote
      ? ssrcRemote.process('SSRC_MATERIAL_EDIT_LIST_TABLE_BUTTONS', buttonGroup, props)
      : buttonGroup;
  }

  @Bind()
  batchMaintainItemForm() {
    const { routerParams, checkData = [], tableData = [] } = this.state;
    const {
      match: { params },
    } = this.props;
    let createLine = tableData.filter((item) => item._status === 'create');
    if (checkData.length > 0 && checkData.some((item) => item._status === 'create')) {
      // notification.warning({
      //   message: intl
      //     .get('ssrc.priceLibraryNew.view.message.tip.batchMaintainItem')
      //     .d('无法操作批量编辑，新建的数据行还未生成价格编码，请先操作保存'),
      // });
      // return;
      createLine = checkData.filter((item) => item._status === 'create');
    }

    // const queryData = filterNullValueObject(this.queryFormDs.toData()[0]);
    const queryData = filterNullValueObject(this.searchBarRef?.getQueryParameter()) || {};
    const queryParams = {};
    for (const key in queryData) {
      // 日期数字 特殊处理
      // if (queryData[key]?.start || queryData[key]?.end) {
      if (key.includes('_range')) {
        Object.assign(queryParams, {
          [key.split('_')?.[0]]: JSON.stringify({
            from: queryData[key].split(',')?.[0],
            to: queryData[key].split(',')?.[1],
          }),
        });
      } else if (Array.isArray(queryData[key])) {
        // 下拉框 值集 多选处理
        Object.assign(queryParams, { [key]: queryData[key].toString() });
      } else if (!isObject(queryData[key])) {
        Object.assign(queryParams, { [key]: queryData[key] });
      }
    }

    // 查询参数
    const param = {
      templateCode: params.templateCode,
      from: routerParams?.viewCode !== 'ALL_VIEW' ? 'VIEW_EDIT' : 'EDIT',
      ...routerParams,
      ...queryParams,
    };

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.button.batchMaintenanceCheck').d('批量编辑'),
      drawer: true,
      onOk: () => {
        const batchMaintainItem =
          filterNullValueObject(this.BatchMaintainItemForm?.tableDs?.current?.toData() || {}) || {};
        // const newCreateLine = createLine.map((item) => ({ ...item, ...batchMaintainItem }));
        return this.BatchMaintainItemForm?.tableDs?.submit().then(() => {
          this.setState({ checkData: [], checkValues: [], cacheData: {} }, async () => {
            await this.fetchPriceLibData();
            const newTableData = createLine.map((line) => {
              // 去除多余字段，record,priceLibId,_status
              const { record, priceLibId, _status, ...ohterData } = line;
              const newRecord = this.tableDs.create(
                { ...(record?.toJSONData() || {}), ...ohterData },
                0
              );
              // 手动修改，触发ds update事件，处理映射关系
              Object.keys(batchMaintainItem).map((key) =>
                newRecord.set(key, batchMaintainItem[key])
              );
              return {
                priceLibId,
                _status,
                record: newRecord,
              };
            });
            this.setState({
              tableData: [...newTableData, ...this.state.tableData],
            });
          });
        });
      },
      children: (
        <BatchMaintainItemForm
          checkData={checkData}
          columnList={this.columnList}
          renderDateFormat={this.renderDateFormat}
          renderQueryParams={this.renderQueryParams}
          getSupplierLovProps={this.getSupplierLovProps}
          ref={(node) => {
            if (!this.BatchMaintainItemFormDs) {
              this.BatchMaintainItemForm = node;
            }
          }}
          param={param}
        />
      ),
      style: { width: '380px' },
    });
  }

  render() {
    const {
      match: { params },
      customizeVTable = noop,
    } = this.props;
    const {
      queryLoading = false,
      tableData = [],
      pagination = {},
      pagesize,
      checkValues,
      checkData,
      cacheData = {},
    } = this.state;
    const searchBarProps = {
      templateCode: params.templateCode,
      queryFilterConfig: {
        dimensionType: 'BASIC',
        from: 'EDIT',
        ...this.state.routerParams,
      },
      onQuery: this.fetchPriceLibData,
      onRef: this.handleRef,
      onAfterQueryFields: this.handleAfterQueryFields,
      cacheData,
      checkValues,
      checkData,
      setState: this.setState.bind(this),
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get('ssrc.priceLibraryNew.view.title.materialPriceMaintenance')
            .d('物料价格信息维护')}
          backPath={`/ssrc/price-library-new/${params.templateCode}/list`}
        >
          {this.getButtons()}
        </Header>
        <Content>
          <SearchBar {...searchBarProps} />
          {/* <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
            <Form
              style={{ flex: 'auto' }}
              columns={3}
              dataSet={this.queryFormDs}
              onKeyDown={(e) => {
                if (e.keyCode === 13) return this.fetchPriceLibData();
              }}
            >
              {hidden ? queryFields.slice(0, 3) : queryFields}
            </Form>
            <div
              style={{
                marginTop: '10px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {queryFields.length > 3 && (
                <Button onClick={this.handleToggle}>
                  {hidden
                    ? intl.get('hzero.common.button.viewMore').d('更多查询')
                    : intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              )}
              <Button onClick={() => this.queryFormDs.current?.reset()}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                dataSet={null}
                color="primary"
                onClick={() => {
                  this.fetchPriceLibData({}, 0);
                }}
                loading={queryLoading}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div> */}
          <div style={{ paddingBottom: '10px' }}>{this.getTableButtons()}</div>
          <div className={style['performance-table-wrapper']}>
            {customizeVTable(
              {
                code: 'SSRC.PRICE_LIBRARY_NEW.MATERIAL_EDIT_LIST',
                dataSet: this.tableDs,
              },
              <PerformanceTable
                virtualized
                cellBordered
                customizable
                columnDraggable
                columnTitleEditable
                bordered={false}
                rowKey="priceLibId"
                customizedCode="SSRC.PRICE_LIBRARY_NEW.MATERIAL_EDIT_LIST" // 个性化暂时还未适配, 同步个性化code, 给聚合表格
                headerHeight={36}
                // height={370}
                autoHeight={{ type: 'minHeight', diff: 80 }}
                loading={queryLoading}
                columns={this.columns}
                data={tableData}
                rowHeight={38}
              />
            )}
            <Pagination
              {...pagination}
              className={style['performanceTable-pagination']}
              pageSizeOptions={pagesize}
              onChange={(page, pageSize) =>
                this.fetchPriceLibData({ page, pageSize, isPage: true })
              }
            />
          </div>
        </Content>
      </Fragment>
    );
  }
}

const HOCComponent = (Comp) =>
  compose(
    remote(
      {
        code: 'SSRC_PRICE_LIBRARY_NEW_MATERIAL_EDIT',
        name: 'ssrcRemote',
      },
      {
        events: {
          // 新增方法二开
          handleCuxAdd() {},
          cuxFetchPriceLibData() {}, // 查询数据二开
          handleCuxRelease() {
            return true;
          }, // 发布前置二开
        },
      }
    ),
    WithCustomizeC7N({
      unitCode: [
        'SSRC.PRICE_LIB_NEW.REQ_EDIT', // 工作流发布申请页面
        'SSRC.PRICE_LIBRARY_NEW.MATERIAL_EDIT_LIST', // 物料价格信息维护列表
        'SSRC.PRICE_LIBRARY_NEW.MATERIAL_EDIT_LIST.HEADER_BUTTONS', // 物料价格信息维护列表-头按钮组
        'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_EDIT_LIST',
      ],
    }),
    formatterCollections({ code: ['ssrc.priceLibraryNew', 'ssrc.common'] })
  )(Comp);

export default HOCComponent(PriceLibraryNew);

export { PriceLibraryNew, HOCComponent };
