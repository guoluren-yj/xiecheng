/**
 * 价格库新-大数据表格优化
 * @date: 2020-10-30
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { observable, runInAction, toJS } from 'mobx';
import {
  DataSet,
  Table,
  Button,
  Modal,
  Tooltip,
  TextField,
  NumberField,
  Lov,
  Select as C7nSelect,
  DatePicker,
  DateTimePicker,
  Form,
  PerformanceTable,
  Pagination,
  CheckBox,
  Spin,
} from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import Upload from 'srm-front-boot/lib/components/Upload';
import moment from 'moment';
import {
  isEmpty,
  uniqWith,
  isEqual,
  differenceWith,
  isObject,
  noop,
  isArray,
  isNil,
  compose,
} from 'lodash';
import querystring from 'querystring';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { deleteCache } from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
  filterNullValueObject,
} from 'utils/utils';
import notification from 'utils/notification';
import { EventManager } from '_utils/utils';
import { SRM_SPC, PRIVATE_BUCKET } from '_utils/config';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';

import ExportDynamicExcel from '@/routes/components/ExportDynamicExcel';
import SearchBar from '@/routes/components/SearchBar';
import configImg from '@/assets/config.svg';
import DynamicComponent from '@/routes/components/DynamicComponent';
import { FIlESIZE } from '@/utils/SsrcRegx';
import {
  fetchPriceLibHeaderConfig,
  fetchPriceLibData,
  deactivatePriceLib,
  fetchImportToERP,
  fetchScopeTabs,
  fetchViewSwitchData,
  saveViewSwitch,
  fetchApproveMethod,
  fetchEnableTemplate,
} from '@/services/priceLibraryNewService';
import ExportBtn from '@/routes/spc/components/OperationRecord/ExportBtn';
import { numberIntervalRender, numberSeparatorRender } from '@/utils/renderer';
import { createC7nPagination } from '@/utils/utils';
import ApplicationScope from './ApplicationScope';
import RelevantPrice from './RelevantPrice';
import { operationDS } from './operationDS';
import { listLineDS } from './Update/lineDS';
import PriceDistribution from './PriceDistribution';
import OperationRecord from './OperationRecord/index';
// import OprationRecordTimeLIne from './OprationRecordTimeLIne';
import { ladderQuotationDS, scopeTableDS, exportTemplateDS, deactivateDS } from './lineDS';
import style from './index.less';
import commonStyle from './common.less';

import { renderValidStatu, batchCheckBtnPermission } from './util';
import { renderAlign } from './renderer';

// const { useModal } = ModalProvider;
const organizationId = getCurrentOrganizationId();
const userId = getCurrentUserId();
let _modal;

class PriceLibraryNew extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = this.props.match.params;
    this.state = {
      viewCode: '', // 当前视图
      routerParams,
      hidden: true, // 查询表单更多隐藏
      columnList: [], // 动态列
      tableData: [], // 表格数据
      pagination: {}, // 表格分页
      viewSwitchData: [], // 切换视图数据
      queryLoading: false,
      checkData: [], // 选中数据
      checkValues: [], // 选中值
      relevantColumnList: [], // 相关价格动态列
      distribueColumnList: [], // 下发价格行
      invalidLoading: false,
      // exportErpLoding: false,
      currentRecord: {}, // 当前操作行
      relevantPriceFieldConfig: {}, // 相关价格field配置
      enableTemplate: 0, // 价格库是否禁用 0-禁用 1-启用
    };
    deleteCache('/ssrc/price-library-new/:templateCode/update');
  }

  searchBarRef = null; // 筛选器ref

  relevantSearchBarRef = null; // 相关价格筛选器ref

  // queryFormDs = new DataSet(queryFormDS()); // 重构为取自筛选器内部创建生成

  // relevantQueryFormDs = new DataSet(relevantQueryFormDS());

  operationDs = new DataSet(operationDS());

  ladderQuotationDs = new DataSet(ladderQuotationDS());

  scopeTableDs = new DataSet(scopeTableDS());

  exportTemplateDs = new DataSet(exportTemplateDS());

  deactivateDs = new DataSet(deactivateDS());

  tableDs = new DataSet(); // 大数据表格ds

  @observable queryData = {}; // 在查询时, 拿到最新的数据, 保持同步

  @observable relevantQueryData = {}; // 在查询时, 拿到最新的相关价格数据, 保持同步

  componentDidMount() {
    // 查询视图配置
    this.fetchViewSwitch();
    // 查询价格库是否禁用
    this.fetchEnableTemplate();
    const { remote } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('handlePriceLibraryNewMount', {
        current: this,
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      viewCode: '', // 当前视图
      hidden: true, // 查询表单更多隐藏
      columnList: [], // 动态列
      tableData: [], // 表格数据
      pagination: {}, // 表格分页
      viewSwitchData: [], // 切换视图数据
      queryLoading: false,
      checkData: [], // 选中数据
      checkValues: [], // 选中值
    });
  }

  /**
   * 通用列逻辑处理
   * @param {*} list - 查询列集合
   */
  handleCommonColumns(list = []) {
    if (!isArray(list) || isEmpty(list)) return [];
    const columnList = [];
    list.forEach((item) => {
      const name =
        item.fieldWidget === 'LOV' || item.fieldWidget === 'SELECT'
          ? `${item.dimensionCode}Meaning`
          : item.dimensionCode;
      // 表格列
      if (Number(item.fieldVisible)) {
        // 当前日期距离有效期至小于等于30天时，报价有效期从和至标红显示
        if (
          item.fieldWidget === 'UPLOAD' ||
          item.fieldWidget === 'LINK' ||
          item.fieldWidget === 'SWITCH' ||
          item.fieldWidget === 'DATE_PICKER'
          // ||
          // item.dimensionCode === 'validDateFrom' ||
          // item.dimensionCode === 'validDateTo'
        ) {
          columnList.push({
            dataIndex: name,
            key: name,
            title: item.dimensionName,
            width: item.gridWidth,
            resizable: true,
            align: renderAlign(item),
            render: ({ rowData }) => this.renderDisplay(rowData, item),
          });
        } else {
          columnList.push({
            dataIndex: name,
            key: name,
            title: item.dimensionName,
            width: item.gridWidth,
            resizable: true,
            align: renderAlign(item),
            render: ({ rowData }) =>
              // 含税单价未税单价，千分位分割
              this.renderTextDisplay(rowData, item, name),
          });
        }
      }
    });
    return columnList;
  }

  /**
   * 设置表格动态列 - 类比 antd table selectRows
   */
  @Bind()
  handleAfterQueryFields(list = []) {
    const columnList = this.handleCommonColumns(list);
    // 筛选价格下发的行
    const distribueColumnList = list.filter((item) => item.priceDistributionFlag === 1);
    this.setState({
      columnList,
      distribueColumnList,
    });
  }

  @Bind()
  handleRelevantAfterQueryFields(list = []) {
    const { remote } = this.props;
    const columnList = this.handleCommonColumns(list);
    const _columnList = [
      ...columnList,
      {
        title: intl.get('hzero.common.action').d('操作'),
        resizable: true,
        width: 120,
        // flexGrow: 1,
        // with: 180,
        dataIndex: 'operation',
        key: 'operation',
        render: ({ rowData }) => (
          <a onClick={() => this.showOperation(rowData, 'APPLICATION_SCOPE')}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ];
    const relevantColumnList = remote
      ? remote.process('SSRC_PRICE_LIBRARY_NEW_PROCESS_RELEVANT_TABLE_COLUMNS', _columnList, {
          current: this,
          templateCode: this.state.routerParams.templateCode,
        })
      : _columnList;
    this.setState({ relevantColumnList });
  }

  @Bind()
  handleRef(vnode) {
    this.searchBarRef = vnode;
  }

  // 相关价格
  @Bind()
  handleRelevantRef(vnode) {
    this.relevantSearchBarRef = vnode;
  }

  // 查询视图配置选项
  @Bind()
  async fetchViewSwitch() {
    const result = getResponse(
      await fetchViewSwitchData({
        templateCode: this.state.routerParams.templateCode,
        userId,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      this.setState({
        viewSwitchData: result,
        viewCode:
          result.find((item) => item.currentViewFlag) &&
          result.find((item) => item.currentViewFlag).viewCode,
      });
      // 请求配置头 --- 迁移至筛选器中处理
      /**
       * 初始化逻辑
       * a.通过筛选器内部去查询 `HeaderConfig`, 然后查询完后再设置动态列
       */
      // this.fetchPriceLibHeaderConfig(this.queryFormDs);
    }
  }

  /**
   * 查询价格库是否禁用
   */
  @Bind()
  async fetchEnableTemplate() {
    const res = getResponse(
      await fetchEnableTemplate({ templateCode: this.state.routerParams.templateCode })
    );
    if (res) {
      this.setState({ enableTemplate: res });
    }
  }

  /**
   * 查询价格库表格数据
   */
  @Bind()
  async fetchPriceLibData(page = {}) {
    const { viewCode, pagination } = this.state;
    const { remote } = this.props;
    if (remote?.event) {
      const res = await remote.event.fireEvent('cuxFetchPriceLibData', {
        current: this,
        page,
      });
      if (!res) {
        return false;
      }
    }
    // 构建查询数据
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
    const params = {
      viewCode,
      pagination: { ...page, pageSize: page?.pageSize || 20 }, // 默认分页20
      templateCode: this.state.routerParams.templateCode,
      from: viewCode && viewCode !== 'ALL_VIEW' ? 'VIEW_LIST' : 'LIST',
      asyncCountFlag: 'Y',
      ...queryParams,
    };
    this.setState({ queryLoading: true });
    fetchPriceLibData(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && Array.isArray(result.content)) {
          this.setState({
            tableData: result.content,
            pagination: createC7nPagination(result),
          });
          if (result?.needCountFlag === 'Y') {
            this.setState({ queryPageSizeLoading: true });
            const resForCount = await fetchPriceLibData({ ...params, onlyCountFlag: 'Y' });
            const pageCount = getResponse(resForCount);
            this.setState({
              queryPageSizeLoading: false,
              tableData: result.content,
              pagination: createC7nPagination(pageCount),
            });
          }
        }
      })
      .finally(() => {
        this.setState({ queryLoading: false });
      });
  }

  /**
   * 查询价格库相关价格表格数据
   */
  @Bind()
  async fetchPriceLibRelevantData(page = {}) {
    const {
      viewCode,
      relevantColumnList = [],
      currentRecord = {},
      relevantPriceFieldConfig = {},
    } = this.state;
    const { remote } = this.props;
    const { priceLibId } = currentRecord;
    const { dimensionId } = relevantPriceFieldConfig;
    // const queryData = this.relevantQueryFormDs.toData()[0];
    // 获取相关价格筛选器数据
    const queryData = filterNullValueObject(this.relevantSearchBarRef?.getQueryParameter()) || {};
    const queryParams = {};
    let queryLoading = false;
    let result = {};

    const relevantProps = {
      remote,
      templateCode: this.state.routerParams.templateCode,
      onQuery: this.fetchPriceLibRelevantData,
      onRef: this.handleRelevantRef,
      columnList: relevantColumnList,
      onAfterQueryFields: this.handleRelevantAfterQueryFields,
    };

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
      this.relevantQueryData = queryParams;
    });
    const params = {
      viewCode,
      priceLibId,
      dimensionId,
      pagination: { ...page, pageSize: page?.pageSize || 20 }, // 默认分页20
      shieldDimCodes: 'relevantPrice',
      templateCode: this.state.routerParams.templateCode,
      from: viewCode && viewCode !== 'ALL_VIEW' ? 'VIEW_LIST_RELEVANT_PRICE' : 'RELEVANT_PRICE',
      ...queryParams,
    };
    queryLoading = true;
    fetchPriceLibData(params)
      .then((res) => {
        if (res && Array.isArray(res.content)) {
          result = res;
          // 更新相关价格model
          _modal.update({
            children: (
              <RelevantPrice
                tableData={res.content}
                pagination={createC7nPagination(res)}
                queryLoading={queryLoading}
                {...relevantProps}
              />
            ),
          });
        }
      })
      .finally(() => {
        queryLoading = false;
        // 更新相关价格model
        _modal.update({
          children: (
            <RelevantPrice
              tableData={result.content}
              pagination={createC7nPagination(result)}
              queryLoading={queryLoading}
              {...relevantProps}
            />
          ),
        });
      });
  }

  /**
   * 查询阶梯报价
   */
  @Bind()
  fetchLadderQuotation(record) {
    const { viewCode = '' } = this.state;

    this.ladderQuotationDs.setQueryParameter('priceLibId', record.priceLibId);
    this.ladderQuotationDs.setQueryParameter('viewCode', viewCode);
    this.ladderQuotationDs.query();
    Modal.open({
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      children: this.renderLadderQuotation(),
      drawer: true,
      style: { width: '742px' },
      footer: (_okBtn) => _okBtn,
      closable: true,
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
    });
  }

  /**
   * 渲染阶梯报价
   */
  renderLadderQuotation() {
    const { customizeTable } = this.props;
    const columns = [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ record }) =>
          numberIntervalRender(record.toData().ladderFrom, record.toData().ladderTo),
      },
      {
        name: 'ladderPrice',
        width: 160,
        tooltip: 'overflow',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'ladderNetPrice',
        width: 160,
        tooltip: 'overflow',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'ladderPriceRemark',
        width: 150,
        tooltip: 'overflow',
      },
    ];
    return customizeTable(
      {
        code: 'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_LIST',
        dataSet: this.ladderQuotationDs,
      },
      <Table
        style={{ maxHeight: 'calc(100% - 220px)' }}
        dataSet={this.ladderQuotationDs}
        columns={columns}
      />
    );
  }

  /**
   * 展示相关价格弹框
   */
  @Bind()
  showRelevantPrice(record, field) {
    const { remote } = this.props;
    const { relevantColumnList = [] } = this.state;
    const relevantProps = {
      remote,
      templateCode: this.state.routerParams.templateCode,
      onQuery: this.fetchPriceLibRelevantData,
      onRef: this.handleRelevantRef,
      onAfterQueryFields: this.handleRelevantAfterQueryFields,
      columnList: relevantColumnList,
    };
    this.setState(
      {
        currentRecord: record,
        relevantPriceFieldConfig: field,
      },
      () => {
        _modal = Modal.open({
          key: Modal.key(),
          title: intl
            .get('ssrc.priceLibraryNew.view.title.relevantPrice')
            .d(
              `物品编码-${record.itemIdMeaning ? record.itemIdMeaning : ''}（${
                record.supplierIdMeaning ? record.supplierIdMeaning : ''
              }供应商）相关价格`
            ), // to do
          drawer: true,
          style: {
            width: '1090px',
          },
          footer: (_okBtn) => _okBtn,
          closable: true,
          okText: intl.get('ssrc.common.view.button.close').d('关闭'),
          children: <RelevantPrice {...relevantProps} />,
          afterClose: () => {
            this.setState({
              relevantColumnList: [],
              currentRecord: {},
            });
          },
        });
      }
    );

    // this.fetchPriceLibHeaderConfig(this.relevantQueryFormDs, {
    //   priceLibId: record.priceLibId,
    //   dimensionId: field.dimensionId,
    // });
  }

  /**
   * 展示适用范围
   */
  @Bind()
  async showApplicationScope(record) {
    const { viewCode = '', routerParams } = this.state;

    const scopeProps = {
      viewCode,
      templateCode: routerParams.templateCode,
      tableDs: this.scopeTableDs,
      priceLibId: record.priceLibId,
    };

    // 打开弹框
    const scopeModal = Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.title.viewScope').d('查看适用范围'),
      drawer: true,
      style: {
        width: '1090px',
      },
      footer: (_okBtn) => _okBtn,
      closable: true,
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      bodyStyle: { padding: 0 },
      children: <ApplicationScope tabsData={[]} {...scopeProps} />,
    });

    // 查询tab标签页
    const params = { priceLibId: record.priceLibId, viewCode };
    const result = getResponse(await fetchScopeTabs(params));
    if (result && !result.failed) {
      // 更新弹框内容
      scopeModal.update({
        children: <ApplicationScope tabsData={result} {...scopeProps} />,
      });
      // 查询第一个tab对应表格的数据
      this.scopeTableDs.setQueryParameter('params', {
        ...params,
        dimensionCode: result[0].dimensionCode,
      });
      this.scopeTableDs.query();
    }
  }

  /**
   * 展示链接页面
   * @param {Object} record - 行记录
   * @param {Object} field - 列配置
   */
  @Bind()
  handleShowLinkTargetPage(record, field) {
    const title = record[field.dimensionCode];
    const linkHref = record[`${field.dimensionCode}Href`];
    const width = record[`${field.dimensionCode}WindowWidth`];
    const wrapperStyle = {
      border: 'none',
      height: '100%',
      width: '100%',
    };

    let children = null;
    if (record[`${field.dimensionCode}OpenMethod`] === 'POPUP_WINDOW_COMP') {
      // 使用路由, 动态加载组件
      children = <DynamicComponent record={record} linkHref={linkHref} />;
    } else {
      // 外部链接/加载整个系统网站, 使用iframe
      children = <iframe title={title} style={wrapperStyle} src={linkHref} />;
    }
    Modal.open({
      key: Modal.key(),
      title,
      drawer: true,
      closable: true,
      maskClosable: true,
      className: commonStyle['c7n-modal-wrapper'],
      style: {
        width: width ? `${width}%` : 'calc(100vw - 520px)',
      },
      children,
      footer: null,
    });
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

  @Bind()
  renderTextDisplay(rowData, item, name) {
    const dimensionCode = item?.dimensionCode;
    const rowDataValue = rowData[name];
    let value;
    switch (dimensionCode) {
      case 'netPrice':
      case 'taxIncludedPrice':
      case 'perTaxIncludedPrice':
      case 'perNetPrice':
        value = numberSeparatorRender(rowDataValue);
        break;
      case 'approvalStatus':
      case 'priceLibraryStatus':
        value = renderValidStatu(rowData[dimensionCode], rowDataValue);
        break;
      default:
        value = rowDataValue;
    }
    return isNil(value) || isEmpty(value) ? (
      value
    ) : (
      <Tooltip placement="bottomLeft" title={value}>
        {value}
      </Tooltip>
    );
  }

  /**
   * 渲染组件显示
   */
  @Bind()
  renderDisplay(record, field) {
    const { remote, history } = this.props;
    const display = record[field.dimensionCode];
    let displayValue;
    switch (field.fieldWidget) {
      case 'SWITCH':
        displayValue = yesOrNoRender(display);
        break;
      case 'UPLOAD':
        displayValue = (
          <Upload
            tenantId={organizationId}
            bucketName={field.bucketName}
            bucketDirectory={field.bucketDirectory}
            attachmentUUID={display}
            filePreview
            viewOnly
          />
        );
        break;
      case 'LINK':
        switch (field.dimensionCode) {
          case 'relevantPrice': // 相关价格
            displayValue = <a onClick={() => this.showRelevantPrice(record, field)}>{display}</a>;
            break;
          case 'ladderQuotation': // 阶梯报价
            displayValue = <a onClick={() => this.fetchLadderQuotation(record)}>{display}</a>;
            break;
          case 'applicationScope': // 适用范围
            displayValue = <a onClick={() => this.showApplicationScope(record)}>{display}</a>;
            break;
          default:
            if (
              ['POPUP_WINDOW', 'POPUP_WINDOW_COMP'].includes(
                record[`${field.dimensionCode}OpenMethod`]
              )
            ) {
              // 弹窗
              displayValue = (
                <a onClick={() => this.handleShowLinkTargetPage(record, field)}>{display}</a>
              );
            } else {
              displayValue = (
                <a
                  href={record[`${field.dimensionCode}Href`]}
                  title={record[`${field.dimensionCode}Title`]}
                  target={
                    record[`${field.dimensionCode}OpenMethod`] === 'NEW_WINDOW' ? '_blank' : '_self'
                  }
                >
                  {display}
                </a>
              );
            }
            break;
        }
        break;
      case 'DATE_PICKER':
        if (display) {
          if (field.dimensionCode === 'validDateFrom' || field.dimensionCode === 'validDateTo') {
            displayValue = (
              <Tooltip
                placement="bottomLeft"
                title={
                  record.highlightFlag
                    ? intl.get('ssrc.priceLibraryNew.view.tooltip.expireDate').d('价格即将到期')
                    : moment(display).format(this.renderDateFormat(field.dateFormat))
                }
              >
                <span style={record.highlightFlag ? { color: 'red' } : {}}>
                  {moment(display).format(this.renderDateFormat(field.dateFormat))}
                </span>
              </Tooltip>
            );
          } else {
            displayValue = (
              <Tooltip
                placement="bottomLeft"
                title={moment(display).format(this.renderDateFormat(field.dateFormat))}
              >
                {moment(display).format(this.renderDateFormat(field.dateFormat))}
              </Tooltip>
            );
          }
        }
        break;
      default:
        break;
    }
    if (isNil(display) && field.fieldWidget !== 'SWITCH') {
      displayValue = '-';
    }
    return remote
      ? remote.render('SSRC_PRICE_LIBRARY_NEW_RENDER_DISPLAY', displayValue, {
          record,
          field,
          history,
        })
      : displayValue;
  }

  /**
   * 渲染fieldType
   */
  @Bind()
  renderFieldType(field) {
    let fieldConfig = {};
    switch (field.fieldWidget) {
      case 'INPUT':
      case 'UPLOAD':
      case 'LINK':
      case 'LOV':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'SELECT':
        fieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
        };
        break;
      case 'INPUT_NUMBER':
        fieldConfig = {
          type: 'number',
        };
        break;
      case 'DATE_PICKER':
        fieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
        };
        break;
      case 'SWITCH':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
        };
        break;
      default:
        break;
    }
    return fieldConfig;
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
          multiple: Number(field.multipleFlag) === 1 ? ',' : false,
          // 设置下拉框查询参数
          lovPara: this.renderQueryParams(field),
        };
        break;
      case 'LOV':
        queryFieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1,
          // 设置下拉框查询参数
          lovPara: this.renderQueryParams(field),
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
          format: this.renderDateFormat(field.dateFormat),
          range: ['start', 'end'],
          transformRequest: (val) => {
            if (val) {
              Object.assign(val, {
                start:
                  val.start &&
                  moment(val.start).format(
                    field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                      field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                      ? 'YYYY-MM-DD HH:mm:ss'
                      : 'YYYY-MM-DD 00:00:00'
                  ),
                end:
                  val.end &&
                  moment(val.end).format(
                    field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
                      field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
                      ? 'YYYY-MM-DD HH:mm:ss'
                      : 'YYYY-MM-DD 23:59:59'
                  ),
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
        queryField = <C7nSelect name={field.dimensionCode} />;
        break;
      case 'LOV':
        queryField = <Lov name={field.dimensionCode} />;
        break;
      case 'DATE_PICKER':
        queryField =
          field.dateFormat === 'yyyy/MM/dd hh:mm:ss' ||
          field.dateFormat === 'yyyy-MM-dd hh:mm:ss' ? (
            <DateTimePicker
              name={field.dimensionCode}
              defaultTime={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
            />
          ) : (
            <DatePicker name={field.dimensionCode} />
          );
        break;
      case 'SWITCH':
        queryField = <C7nSelect name={field.dimensionCode} />;
        break;
      default:
        queryField = <TextField name={field.dimensionCode} />;
        break;
    }
    return queryField;
  }

  /**
   * 设置lov,select查询参数
   */
  @Bind()
  renderQueryParams(field) {
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
   * 渲染列居左居中居右 --- 废弃
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
   * 查询头
   */
  @Bind()
  async fetchPriceLibHeaderConfig(queryDs, relevantPriceParams) {
    const result = getResponse(
      await fetchPriceLibHeaderConfig({
        templateCode: this.state.routerParams.templateCode,
        shieldDimCodes: relevantPriceParams && 'relevantPrice',
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const columnList = [];
      const queryFields = [];
      list.forEach((item) => {
        const fieldConfig = {};
        const name =
          item.fieldWidget === 'LOV' || item.fieldWidget === 'SELECT'
            ? `${item.dimensionCode}Meaning`
            : item.dimensionCode;
        // 查询表单
        if (item.queryFlag) {
          // 针对 `LOV` 增加fieldMeaning, 适配导出组件
          const { dimensionCode, dimensionName, fieldWidget } = item;
          if (item.fieldWidget === 'LOV') {
            const displayField = item.priceLibDimMapList?.find(
              (n) => n.targetDimensionCode === item.dimensionCode
            )?.sourceFromFieldMeaning;

            queryDs.addField(item.dimensionCode, {
              name: item.dimensionCode,
              label: item.dimensionName,
              ...this.renderQueryFieldType(item),
            });
            queryDs.addField(`${item.dimensionCode}Meaning`, {
              name: `${item.dimensionCode}Meaning`,
              type: 'string',
              bind: `${item.dimensionCode}.${displayField || item.displayField}`,
            });
          } else {
            queryDs.addField(item.dimensionCode, {
              name: item.dimensionCode,
              label: item.dimensionName,
              ...this.renderQueryFieldType(item),
            });
          }
          Object.assign(fieldConfig, {
            name: dimensionCode,
            label: dimensionName,
            fieldWidget,
            ...this.renderQueryFieldType(item),
          });
          queryFields.push(this.renderQueryField(item));
        }
        // 表格列
        if (Number(item.fieldVisible)) {
          // 当前日期距离有效期至小于等于30天时，报价有效期从和至标红显示
          if (
            item.fieldWidget === 'UPLOAD' ||
            item.fieldWidget === 'LINK' ||
            item.fieldWidget === 'SWITCH' ||
            item.fieldWidget === 'DATE_PICKER'
            // ||
            // item.dimensionCode === 'validDateFrom' ||
            // item.dimensionCode === 'validDateTo'
          ) {
            columnList.push({
              dataIndex: name,
              key: name,
              title: item.dimensionName,
              width: item.gridWidth,
              resizable: true,
              align: renderAlign(item),
              render: ({ rowData }) => this.renderDisplay(rowData, item),
            });
          } else {
            columnList.push({
              dataIndex: name,
              key: name,
              title: item.dimensionName,
              width: item.gridWidth,
              resizable: true,
              align: renderAlign(item),
              render: ({ rowData }) =>
                // 含税单价未税单价，每一含税单价，每一未税单价，千分位分割
                this.renderTextDisplay(rowData, item, name),
            });
          }
        }
      });

      if (!isEmpty(relevantPriceParams)) {
        this.fetchPriceLibRelevantData({}, relevantPriceParams);
      } else {
        // 价格库主表 --- 此处逻辑移动至别处
        // this.setState({ columnList, queryFields });
        // this.fetchPriceLibData();
      }
    }
  }

  /**
   * 跳转手工创建&更新页面
   */
  @Bind()
  async jumpPriceLibCreate() {
    const { remote } = this.props;
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxJumpCheck', {
        current: this,
        otherProps: {
          templateCode: this.state.routerParams.templateCode,
        },
      });
      if (!res) {
        return;
      }
    }

    this.props.history.push({
      pathname: `/ssrc/price-library-new/${this.state.routerParams.templateCode}/update`,
      search:
        this.state.checkValues?.length > 0
          ? `?priceLibIds=${this.state.checkValues}&viewCode=${this.state.viewCode}`
          : `viewCode=${this.state.viewCode}`,
    });
  }

  /**
   * 跳转到查询审批页面
   */
  @Bind()
  jumpPriceLibApproval() {
    this.props.history.push({
      pathname: `/ssrc/price-library-new/${this.state.routerParams.templateCode}/approval`,
      search: `viewCode=${this.state.viewCode}`,
    });
  }

  /**
   * 置为无效
   */
  @Bind()
  deactivatePriceLib() {
    const { customizeForm } = this.props;
    // 当onClick为返回Promise的时候,会自动开启loading。我们使用invalidLoading作为loading,所以去掉async,否则invalidLoading会不生效
    const { checkData = [], viewCode } = this.state;
    if (!isEmpty(checkData)) {
      this.setState({ invalidLoading: true });
      const dataSource = checkData.map((n) => {
        return {
          ...n,
          templateCode: this.state.routerParams.templateCode,
          reqType: 'INVALID',
          viewCode,
        };
      });
      getResponse(fetchApproveMethod({ dataSource })).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          if (result.includes('WFL') || result.includes('EXT')) {
            Modal.open({
              key: Modal.key(),
              title: intl.get('ssrc.priceLibraryNew.view.message.invalidConfirm').d('失效确认'),
              style: {
                width: 450,
              },
              children: customizeForm(
                {
                  code: 'SSRC.PRICE_LIB_NEW.REQ_INVALID_FORM',
                  dataSet: this.deactivateDs,
                },
                <Form dataSet={this.deactivateDs} columns={1}>
                  <TextField name="remark" />
                  <Upload
                    name="attachmentUuid"
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="price-center"
                    fileSize={FIlESIZE}
                    tenantId={organizationId}
                    attachmentUUID={this.deactivateDs?.current?.get('buyerAttachmentUuid')}
                    afterOpenUploadModal={(attUuid) => {
                      // eslint-disable-next-line no-unused-expressions
                      this.deactivateDs?.current?.set('attachmentUuid', attUuid);
                    }}
                  />
                </Form>
              ),
              onOk: () => {
                this.handleDeactivatePriceLib(dataSource);
              },
              afterClose: () => {
                // eslint-disable-next-line no-unused-expressions
                this.deactivateDs?.current?.reset();
                this.setState({
                  invalidLoading: false,
                });
              },
            });
          } else {
            this.handleDeactivatePriceLib(dataSource);
          }
        } else {
          this.setState({
            invalidLoading: false,
          });
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssrc.priceLibraryNew.view.notification.chooseOne')
          .d('请至少勾选一条数据'),
      });
    }
  }

  /**
   * 置为无效
   */
  @Bind()
  async handleDeactivatePriceLib(dataSource) {
    const { viewCode, pagination = {} } = this.state;
    if (!isEmpty(dataSource)) {
      let data = dataSource;
      data = dataSource.map((n, index) => {
        if (index === 0) {
          const {
            remark: _remark,
            attachmentUuid: _attachmentUuid,
            ...others
          } = this.deactivateDs?.current?.toData();
          const deactivateData = {
            ...others,
            _remark,
            _attachmentUuid,
          };
          const firstData = { ...n, ...deactivateData, viewCode };
          return {
            ...firstData,
            innerPriceMap: firstData,
          };
        } else {
          return n;
        }
      });
      this.setState({ invalidLoading: true });
      deactivatePriceLib(data, viewCode, 'SSRC.PRICE_LIB_NEW.REQ_INVALID_FORM').then((res) => {
        if (this.invalTimer) {
          clearTimeout(this.invalTimer);
        }
        this.invalTimer = setTimeout(() => {
          const result = getResponse(res);
          if (result && !result.failed) {
            notification.success();
            this.setState({
              checkData: [],
              checkValues: [],
            });
            this.fetchPriceLibData(pagination);
          }
          this.setState({
            invalidLoading: false,
          });
        }, 5000);
      });
    }
  }

  /**
   * 切换视图
   */
  @Bind()
  async handleViewSelectChange(value) {
    const { viewSwitchData = [] } = this.state;
    if (value) {
      const params = viewSwitchData.find((item) => item.viewCode === value);
      const res = await getResponse(saveViewSwitch({ ...params, userId }));
      if (res && !res.failed) {
        this.setState({
          viewCode: value,
          checkData: [],
          checkValues: [],
        });
        this.fetchPriceLibData();
      }
    }
  }

  /**
   * 操作记录
   */
  @Throttle(2000)
  @Bind()
  showOperation(record) {
    const { viewCode } = this.state;
    const { remote } = this.props;
    const docType = viewCode && viewCode !== 'ALL_VIEW' ? 'VIEW' : 'MAIN';
    const docId = record.priceLibId;
    const modalProps = {
      docId,
      docType,
      priceLibId: docId,
      remote,
    };
    let filterBarRef = null;
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: '742px',
      },
      drawer: true,
      children: (
        <OperationRecord
          {...modalProps}
          onRef={(ref) => {
            filterBarRef = ref;
          }}
        />
      ),
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
      footer: (okBtn) => (
        <div>
          {okBtn}
          <ExportBtn
            documentId={docId}
            documentType={docType}
            getRef={() => filterBarRef} // 直接传递拿不到ref
          />
        </div>
      ),
    });
  }

  /**
   * 导入ERP
   */
  @Bind()
  async handleImportERP() {
    const { viewCode, checkValues = [] } = this.state;
    if (!isEmpty(checkValues)) {
      // this.setState({ exportErpLoding: true });
      const res = await fetchImportToERP({
        viewCode: viewCode || 'ALL_VIEW',
        priceLibIds: checkValues,
      });
      // this.setState({ exportErpLoding: false });
      if (!res) return;
      if (res.code === 'EBS' || res.code === 'SAP') {
        if (res.message) {
          notification.warning({
            message: res.message,
          });
        } else {
          notification.warning({
            message: intl
              .get(`ssrc.priceLibraryNew.message.validation.importFail`)
              .d('导入失败，请补充信息后再次导入'),
          });
        }
        EventManager.emit('REFRESH-PRICE-LIBRARY-IMPORT_TABLE', { from: 'price-library-new' }); // 刷新价格库导入erp下的table
        this.props.history.push({
          pathname: `/ssrc/search-result-import-new/list`,
          search: querystring.stringify({ activeKey: res.code }),
        });
      } else if (res.code === 'SUCCESS') {
        notification.success({
          message: intl.get(`ssrc.priceLibraryNew.message.validation.importSuc`).d('导入成功'),
        });
        EventManager.emit('REFRESH-PRICE-LIBRARY-IMPORT_TABLE', { from: 'price-library-new' }); // 刷新价格库导入erp下的table
        this.props.history.push({
          pathname: `/ssrc/search-result-import-new/list`,
          search: querystring.stringify({ activeKey: res.code }),
        });
      } else {
        notification.warning({
          message: res.message,
        });
      }
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibraryNew.message.validation.selectRows`)
          .d('请选择一条或者多条数据后再执行导入操作！'),
      });
    }
  }

  /**
   * 查看历史价格趋势图
   */
  @Bind()
  handleViewPriceChart() {
    const {
      routerParams: { templateCode },
      checkData = [],
    } = this.state;
    let search = '';
    if (!isEmpty(checkData)) {
      const {
        itemId = '',
        itemIdMeaning = '',
        supplierCompanyId = '',
        supplierCompanyIdMeaning = '',
      } = checkData[0];
      search = `?viewCode=${this.state.viewCode}&itemId=${itemId}&itemIdMeaning=${itemIdMeaning}&supplierCompanyId=${supplierCompanyId}&supplierCompanyIdMeaning=${supplierCompanyIdMeaning}`;
    } else {
      search = `?viewCode=${this.state.viewCode}`;
    }
    this.props.history.push({
      pathname: `/ssrc/price-library-new/${templateCode}/chart`,
      search,
    });
  }

  /**
   * 批量导出适用范围模板-侧弹框
   */
  @Bind()
  showExportTemplateModal() {
    const { routerParams, viewCode } = this.state;

    const queryParams = {
      templateCode: routerParams.templateCode,
      viewCode,
      userId,
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
            saveViewSwitch({ ...this.exportTemplateDs?.current?.toData(), userId })
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
   * 价格下发
   */
  @Bind()
  handleDistributionPrice() {
    const {
      routerParams: { templateCode },
      distribueColumnList,
      checkData,
      checkValues,
      viewCode,
      pagination,
    } = this.state;
    const tableDs = new DataSet(listLineDS({ templateCode }, []));
    const props = {
      tableDs,
      checkData,
      checkValues,
      distribueColumnList,
      match: { params: { templateCode } },
      routerParams: {
        viewCode,
      },
      onRefresh: () => {
        this.fetchPriceLibData(pagination);
      },
    };
    Modal.open({
      title: intl.get('ssrc.priceLibraryNew.view.button.priceDistribute').d('价格下发'),
      children: <PriceDistribution {...props} />,
      drawer: true,
      style: { width: '742px' },
      closable: true,
      okProps: {
        disabled: true,
      },
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
    const { checkValues = [], tableData = [] } = this.state;
    const { remote } = this.props;
    const currentPriceLibIds = tableData.map((item) => item.priceLibId);
    const columnList = [
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
        fixed: true,
        hideable: false,
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
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operation',
        key: 'operation',
        resizable: true,
        width: 120,
        // flexGrow: 1,
        // width: 180,
        render: ({ rowData }) => (
          <a onClick={() => this.showOperation(rowData)}>
            {intl.get('ssrc.priceLibraryNew.model.library.operation').d('操作记录')}
          </a>
        ),
      },
      ...this.state.columnList,
    ];
    return remote
      ? remote.process('SSRC_PRICE_LIBRARY_NEW_PROCESS_TABLE_COLUMNS', columnList, {
          current: this,
        })
      : columnList;
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
   * 渲染筛选器左侧
   */
  @Bind()
  renderLeftLayout() {
    const { viewCode, viewSwitchData = [] } = this.state;
    return Array.isArray(viewSwitchData) && viewSwitchData.length <= 1 ? null : (
      <span className={style['view-select-no-border']}>
        <C7nSelect
          size="small"
          value={viewCode}
          onChange={this.handleViewSelectChange}
          dropdownClassName={style['select-z-index']}
          allowClear={false}
        >
          {viewSwitchData.map((item) => (
            <C7nSelect.Option key={item.viewCode} value={item.viewCode}>
              <Tooltip title={item.viewName} placement="left" theme="light">
                {item.viewName}
              </Tooltip>
            </C7nSelect.Option>
          ))}
        </C7nSelect>
      </span>
    );
  }

  /**
   * [贝泰妮] 重写, 谨慎修改!!!
   * @protected
   */
  renderSearchBar(searchBarProps) {
    return <SearchBar {...searchBarProps} />;
  }

  /**
   * 按钮组
   */
  getButtons() {
    const {
      routerParams: { templateCode },
      viewCode = '',
      checkValues = [],
      distribueColumnList = [],
      invalidLoading = false,
      enableTemplate,
    } = this.state;
    const { remote } = this.props;

    const ResponsiveComponent = observer(({ queryData, ...other }) => {
      // 需要把查询参数传递给导出组件
      // const queryData = dataSet?.current ? filterNullValueObject(dataSet.current.toData()) : {};
      // if (!isEmpty(queryData)) delete queryData.__dirty;
      const newQueryData = toJS(queryData);
      return (
        <ExportDynamicExcel
          requestUrl={`${SRM_SPC}/v1/${organizationId}/price-lib-mains/excel/export/column`}
          queryParams={{
            viewCode,
            templateCode,
            selectedRowKeys: checkValues,
            queryData: newQueryData,
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
    let buttons = [
      {
        name: 'creatAndUpdate',
        btnComp: PermissionButton,
        btnProps: {
          icon: 'plus',
          type: 'primary',
          onClick: this.jumpPriceLibCreate,
          permissionList: [
            {
              code: `${templateCode?.toLocaleLowerCase()}.button.create`,
              type: 'button',
              meaning:
                intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
                intl
                  .get(`ssrc.priceLibraryNew.view.message.button.creatAndUpdate`)
                  .d('手工创建&更新'),
            },
          ],
        },
        child: intl
          .get(`ssrc.priceLibraryNew.view.message.button.creatAndUpdate`)
          .d('手工创建&更新'),
      },
      {
        name: 'deactivate',
        btnComp: PermissionButton,
        child: intl.get(`ssrc.priceLibraryNew.view.button.deactivate`).d('置为无效'),
        btnProps: {
          disabled: checkValues.length === 0,
          type: 'c7n-pro',
          onClick: this.deactivatePriceLib,
          loading: invalidLoading,
          funcType: 'flat',
          icon: 'not_interested',
          // wait: 1000,
          // waitType: 'debounce',
          permissionList: [
            {
              code: `${templateCode?.toLocaleLowerCase()}.button.deactivate`,
              type: 'button',
              meaning:
                intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
                intl.get(`ssrc.priceLibraryNew.view.button.deactivate`).d('置为无效'),
            },
          ],
        },
      },
      {
        name: 'batchExport',
        btnComp: ResponsiveComponent,
        btnProps: {
          // dataSet: this.queryFormDs,
          // dataSet: this.searchBarRef?.queryDs,
          queryData: this.queryData,
          funcType: 'flat',
        },
      },
      {
        name: 'importERP',
        child: intl.get(`ssrc.priceLibraryNew.view.button.importERP`).d('导入ERP'),
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          icon: 'archive',
          disabled: checkValues.length === 0,
          onClick: this.handleImportERP,
        },
      },
      {
        name: 'priceDistribute',
        child: intl.get(`ssrc.priceLibraryNew.view.button.priceDistribute`).d('价格下发'),
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'near_me',
          funcType: 'flat',
          disabled: checkValues.length === 0 || isEmpty(distribueColumnList),
          onClick: this.handleDistributionPrice,
        },
      },
      {
        name: 'dropdownBtnListNew',
        group: true,
        child: <Button icon="more_horiz" funcType="flat" />,
        children: [
          {
            name: 'readApproval',
            child: intl.get(`ssrc.priceLibraryNew.view.button.readApproval`).d('价格审批查询'),
            btnType: 'c7n-pro',
            btnProps: {
              funcType: 'flat',
              onClick: this.jumpPriceLibApproval,
              icon: 'authorize',
            },
          },
          {
            name: 'historyAna',
            child: intl.get(`ssrc.priceLibraryNew.view.button.historyAna`).d('历史价格分析'),
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'bar_chart',
              funcType: 'flat',
              onClick: this.handleViewPriceChart,
            },
          },
        ],
      },
    ];

    // 价格库禁用后，价格库菜单需要隐藏“价格审批查询”、“价格下发”、“手工新建&更新”、“置为无效”按钮，只允许对禁用价格库进行查看导出等操作，不允许进行修改。
    if (!enableTemplate) {
      buttons = buttons
        .map((btn) => {
          if (['creatAndUpdate', 'deactivate', 'priceDistribute'].includes(btn?.name)) {
            return null;
          } else if (btn?.name === 'dropdownBtnListNew') {
            const children =
              btn?.children?.filter((item) => !['readApproval'].includes(item?.name)) || [];
            return children[0] || {};
          } else {
            return btn;
          }
        })
        .filter(Boolean);
    }

    batchCheckBtnPermission(templateCode, buttons);
    const otherProps = {
      current: this,
    };

    return remote
      ? remote.process('SSRC_PRICE_LIBRARY_NEW_PROCESS_HEADER_BUTTONS', buttons, otherProps)
      : buttons;
  }

  render() {
    const { remote, customizeVTable = noop, customizeBtnGroup } = this.props;
    const {
      routerParams: { templateCode },
      tableData = [],
      pagination = {},
      queryLoading = false,
      queryPageSizeLoading = false,
      checkValues = [],
      checkData = [],
      // exportErpLoding,
    } = this.state;
    const cuxPagination = remote
      ? remote.process('SSRC_PRICE_LIBRARY_NEW_PROCESS_PAGINATION', pagination, {})
      : pagination;

    const searchBarProps = {
      remote,
      templateCode,
      renderLeftLayout: this.renderLeftLayout(),
      onQuery: this.fetchPriceLibData,
      onRef: this.handleRef,
      onAfterQueryFields: this.handleAfterQueryFields,
      checkValues,
      checkData,
      setState: this.setState.bind(this),
    };
    return (
      <Fragment>
        {/* <Spin spinning={exportErpLoding}> */}
        <Header title={intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库')}>
          {customizeBtnGroup(
            { code: 'SSRC.PRICE_LIBRARY_NEW.LIST.HEADER_BUTTONS', pro: true },
            <DynamicButtons buttons={this.getButtons()} trigger="hover" />
          )}
        </Header>
        <Content>
          {this.renderSearchBar(searchBarProps)}
          <div style={{ height: 'calc(100vh - 270px)' }}>
            {customizeVTable(
              {
                code: 'SSRC.PRICE_LIBRARY_NEW.LIST',
                dataSet: this.tableDs,
              },
              <PerformanceTable
                virtualized
                cellBordered
                customizable
                columnDraggable
                columnTitleEditable
                rowKey="priceLibId"
                bordered={false}
                customizedCode="SSRC.PRICE_LIBRARY_NEW.LIST" // 个性化暂时还未适配, 同步个性化code, 给聚合表格
                headerHeight={36}
                // height={376}
                autoHeight={{ type: 'minHeight', diff: 80 }}
                loading={queryLoading}
                columns={this.columns}
                data={tableData}
              />
            )}
            <Spin size="small" spinning={queryPageSizeLoading}>
              <Pagination
                {...cuxPagination}
                className={style['performanceTable-pagination']}
                onChange={(page, pageSize) => this.fetchPriceLibData({ page, pageSize })}
              />
            </Spin>
          </div>
        </Content>
        {/* </Spin> */}
      </Fragment>
    );
  }
}

const hocFuc = (com) =>
  compose(
    WithCustomizeC7N({
      unitCode: [
        'SSRC.PRICE_LIBRARY_NEW.LIST',
        'SSRC.PRICE_LIB_NEW.REQ_INVALID_FORM',
        'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_LIST',
        'SSRC.PRICE_LIBRARY_NEW.LIST.HEADER_BUTTONS',
      ],
    }),
    formatterCollections({ code: ['ssrc.priceLibraryNew', 'ssrc.common', 'hzero.common'] })
  )(
    remoteHoc(
      {
        code: 'SSRC_PRICE_LIBRARY_NEW',
      },
      {
        events: {
          cuxFetchPriceLibData() {}, // 查询数据二开
          handlePriceLibraryNewMount() {}, // 组件挂载二开
          handleCuxJumpCheck() {}, // 新建跳转校验
        },
      }
    )(com)
  );

export default hocFuc(PriceLibraryNew);
export { PriceLibraryNew, hocFuc };
