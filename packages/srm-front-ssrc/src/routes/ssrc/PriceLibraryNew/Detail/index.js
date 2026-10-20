/**
 * 价格库审批结果查询（明细）
 * @date: 2020-08-18
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React from 'react';
import moment from 'moment';
import qs from 'querystring';
import { Popover } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import remote from 'hzero-front/lib/utils/remote';
import {
  Output,
  Form,
  DataSet,
  Table,
  Modal,
  PerformanceTable,
  Pagination,
  Tooltip,
  TextField,
  NumberField,
  Lov,
  Select as C7nSelect,
  DatePicker,
  DateTimePicker,
  Attachment,
} from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import { isEmpty, isObject, noop, isArray, isNil, compose } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { numberIntervalRender, numberSeparatorRender } from '@/utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
// import ApproveRecord from 'srm-front-boot/lib/components/ApproveRecord';
// import ApproveRecordSimple from "srm-front-boot/lib/components/ApproveRecordSimple";

import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import { queryBatchApprovaFlag } from 'srm-front-boot/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { yesOrNoRender } from 'utils/renderer';

import { createC7nPagination } from '@/utils/utils';
import ExportBtn from '@/routes/spc/components/OperationRecord/ExportBtn';
import {
  revokePriceLibrary,
  fetchApprovingScopeTab,
  fetchPriceLibHeaderConfig,
  fetchHistoryInfo,
  fetchPriceLibData,
  fetchPriceLibApproveData,
  fetchApprovingScopeTabOther,
  operationRevoke,
  revokeWorkflow,
} from '@/services/priceLibraryNewService';
import style from '../index.less';
import { operationDS } from '../operationDS';
import ApplicationScope from '../ApplicationScope';
import OperationRecord from '../OperationRecord';
import RelevantPrice from '../RelevantPrice';
import {
  basicFormDS,
  // approTableDS,
  scopeTableDS,
  ladderQuotationDS,
  relevantQueryFormDS,
} from './lineDS';
import { relevantPriceDS } from '../Update/lineDS';
import commonStyle from '../common.less';
import { renderValidStatu } from '../util';

const organizationId = getCurrentOrganizationId();
const modalKey = Modal.key();

let _modal;
class Detail extends React.Component {
  constructor(props) {
    super(props);
    const routerParams = qs.parse(this.props.location.search.substr(1));
    this.state = {
      viewCode: routerParams.viewCode || '',
      requestId: routerParams.requestId,
      columnList: [], // 动态列
      tableData: [], // 表格数据
      pagination: {}, // 表格分页
      queryLoading: false,
      relevantColumnList: [], // 相关价格动态列
      currentRecord: {}, // 当前操作行
      relevantPriceFieldConfig: {}, // 相关价格field配置
      revokeByBusKeyFlag: false, // 是否允许撤销审批
      approvalByBusKey: null, // 审批相关信息
      approvalProcessByBusKey: null, // 审批进度相关信息
    };
  }

  basicFormDs = new DataSet(
    basicFormDS(
      {
        templateCode: this.props.match.params.templateCode,
        requestId: qs.parse(this.props.location.search.substr(1)).requestId,
      },
      []
    )
  );

  relevantPriceDs = new DataSet(
    relevantPriceDS({
      requestStatus: qs.parse(this.props.location.search.substr(1)).requestStatus,
      templateCode: this.props.match.params.templateCode,
    })
  );

  relevantQueryFormDs = new DataSet(relevantQueryFormDS());

  ladderQuotationDs = new DataSet(ladderQuotationDS());

  scopeTableDs = new DataSet(
    scopeTableDS(
      {
        requestId: qs.parse(this.props.location.search.substr(1)).requestId,
        templateCode: this.props.match.params.templateCode,
      },
      []
    )
  );

  operationDs = new DataSet(operationDS());

  tableDs = new DataSet(); // 大数据列表ds

  relevantSearchBarRef = null; // 相关价格筛选器ref

  componentDidMount() {
    // 请求配置头
    this.fetchPriceLibHeaderConfig();
    this.basicFormDs.query().then((r) => {
      this.queryOperationRevoke(r);
    });
  }

  /**
   * 查询价格库表格数据
   */
  @Bind()
  async fetchPriceLibData(page = {}) {
    const { pagination = {} } = this.state;
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
      pagination: page,
      templateCode: this.props.match.params.templateCode,
      requestId: qs.parse(this.props.location.search.substr(1)).requestId,
    };
    this.setState({ queryLoading: true });
    fetchPriceLibApproveData(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && Array.isArray(result.content)) {
          this.setState({
            tableData: result.content,
            pagination: createC7nPagination(result),
          });
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
    const { priceLibId, fromPriceLibId } = currentRecord;
    const { dimensionId } = relevantPriceFieldConfig;
    // const queryData = this.relevantQueryFormDs.toData()[0];
    // 获取相关价格筛选器数据
    const queryData = filterNullValueObject(this.relevantSearchBarRef?.getQueryParameter()) || {};
    const { requestStatus } = qs.parse(this.props.location.search.substr(1));
    const queryParams = {};
    let queryLoading = false;
    let result = {};

    const relevantProps = {
      templateCode: this.props.match.params.templateCode,
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
    const params = {
      viewCode,
      priceLibId,
      dimensionId,
      fromPriceLibId,
      pagination: page,
      shieldDimCodes: 'relevantPrice',
      templateCode: this.props.match.params.templateCode,
      from:
        requestStatus === 'APPROVING' || requestStatus === 'APPROVE_SUCCESS'
          ? 'APPROVE_RELEVANT_PRICE'
          : 'RELEVANT_PRICE',
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
   * 渲染组件显示
   */
  @Bind()
  renderDisplay(record, field, from = '') {
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
            displayValue = (
              <Popover trigger="click" placement="topLeft" content={this.renderLadderQuotation()}>
                <a onClick={() => this.fetchLadderQuotation(record)}>{display}</a>
              </Popover>
            );
            break;
          case 'applicationScope': // 适用范围
            displayValue = <a onClick={() => this.showApplicationScope(record, from)}>{display}</a>;
            break;
          default:
            if (record[`${field.dimensionCode}OpenMethod`] === 'POPUP_WINDOW') {
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
          displayValue = (
            <Tooltip
              placement="bottomLeft"
              title={moment(display).format(this.renderDateFormat(field.dateFormat))}
            >
              {moment(display).format(this.renderDateFormat(field.dateFormat))}
            </Tooltip>
          );
        }
        break;
      default:
        break;
    }
    return displayValue;
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
        };
        break;
      case 'LOV':
        queryFieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1,
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
            <DateTimePicker name={field.dimensionCode} />
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
   * 渲染列居左居中居右
   */
  @Bind()
  renderAlign(field) {
    let align = 'left';
    switch (field.fieldWidget) {
      case 'INPUT_NUMBER':
        align = 'right';
        break;
      case 'SWITCH':
        align = 'center';
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
        templateCode: this.props.match.params.templateCode,
        shieldDimCodes: relevantPriceParams ? 'relevantPrice' : 'priceLibraryStatus',
        relevantPriceFlag: relevantPriceParams ? 1 : 0,
      })
    );
    if (result && Array.isArray(result) && result.length > 0) {
      const list = result;
      const columnList = [];
      const queryFields = [];
      list.forEach((item) => {
        const name =
          item.fieldWidget === 'LOV' || item.fieldWidget === 'SELECT'
            ? `${item.dimensionCode}Meaning`
            : item.dimensionCode;

        // 查询表单
        if (item.queryFlag && queryDs) {
          if (item.fieldWidget === 'LOV') {
            queryDs.addField(item.dimensionCode, {
              name: item.dimensionCode,
              label: item.dimensionName,
              ...this.renderQueryFieldType(item),
            });
          } else {
            queryDs.addField(item.dimensionCode, {
              name: item.dimensionCode,
              label: item.dimensionName,
              ...this.renderQueryFieldType(item),
            });
          }
          queryFields.push(this.renderQueryField(item));
        }
        // 表格列
        if (Number(item.fieldVisible)) {
          if (
            item.fieldWidget === 'UPLOAD' ||
            item.fieldWidget === 'LINK' ||
            item.fieldWidget === 'SWITCH' ||
            item.fieldWidget === 'DATE_PICKER'
          ) {
            columnList.push({
              dataIndex: name,
              key: name,
              title: item.dimensionName,
              width: item.gridWidth,
              resizable: true,
              align: this.renderAlign(item),
              render: ({ rowData }) => this.renderDisplay(rowData, item),
            });
          } else {
            columnList.push({
              dataIndex: name,
              key: name,
              title: item.dimensionName,
              width: item.gridWidth,
              resizable: true,
              align: this.renderAlign(item),
              render: ({ rowData }) =>
                isNil(rowData[name]) || isEmpty(rowData[name]) ? (
                  rowData[name]
                ) : (
                  <Tooltip placement="bottomLeft" title={rowData[name]}>
                    {rowData[name]}
                  </Tooltip>
                ),
            });
          }
        }
      });

      if (!isEmpty(relevantPriceParams)) {
        this.fetchPriceLibRelevantData({}, relevantPriceParams);
      } else {
        if (!isEmpty(columnList)) {
          Object.assign(columnList[0], {
            fixed: true,
          });
        }
        this.setState({ columnList });
        this.fetchPriceLibData();
      }
    }
  }

  @Bind()
  async operateHistory() {
    const { requestId, businessKey } =
      this.basicFormDs?.current?.get(['businessKey', 'requestId']) || {};
    if (!(requestId && businessKey)) return;
    let filterBarRef = null;
    const modalProps = {
      approvalRecords: await fetchHistoryInfo(businessKey),
      docId: requestId,
      docType: 'MAIN_REQ',
      title: `【${intl.get('ssrc.priceLibraryNew.view.title.priceApproval').d('价格审批')}】`,
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      okText: intl.get('ssrc.common.view.button.close').d('关闭'),
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
      footer: (okBtn) => (
        <div>
          {okBtn}
          <ExportBtn
            documentId={requestId}
            documentType="MAIN_REQ"
            getRef={() => filterBarRef} // 直接传递拿不到ref
          />
        </div>
      ),
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
          numberIntervalRender(record.get('ladderFrom'), record.get('ladderTo')),
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
        dataSet={this.ladderQuotationDs}
        columns={columns}
        className={style['popover-content']}
      />
    );
  }

  /**
   * 操作记录
   */
  @Bind()
  showOperation(record) {
    this.operationDs.setQueryParameter('queryParams', {
      docType: 'MAIN',
      docId: record.priceLibId,
    });

    this.operationDs.query();

    const operateColumns = [
      {
        name: 'actionName',
        width: 120,
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 150,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: 520,
      },
      children: <Table dataSet={this.operationDs} columns={operateColumns} />,
      onOk: () => {},
      onCancel: () => {},
    });
  }

  /**
   * 通用列逻辑处理
   * @param {*} list - 查询列集合
   */
  handleCommonColumns(list = [], from = '') {
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
            align: this.renderAlign(item),
            render: ({ rowData }) => this.renderDisplay(rowData, item, from),
          });
        } else {
          columnList.push({
            dataIndex: name,
            key: name,
            title: item.dimensionName,
            width: item.gridWidth,
            resizable: true,
            align: this.renderAlign(item),
            render: ({ rowData }) =>
              // 含税单价未税单价，千分位分割
              this.renderTextDisplay(rowData, item, name),
          });
        }
      }
    });
    return columnList;
  }

  @Bind()
  handleRelevantAfterQueryFields(list = []) {
    const columnList = this.handleCommonColumns(list, 'relevant');
    this.setState({
      relevantColumnList: [
        ...columnList,
        {
          title: intl.get('ssrc.priceLibraryNew.model.library.operation').d('操作记录'),
          flexGrow: 1,
          minWidth: 120,
          dataIndex: 'operation',
          key: 'operation',
          render: ({ rowData }) => (
            <a onClick={() => this.showOperation(rowData, 'APPLICATION_SCOPE')}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ),
        },
      ],
    });
  }

  // 相关价格
  @Bind()
  handleRelevantRef(vnode) {
    this.relevantSearchBarRef = vnode;
  }

  /**
   * 展示相关价格弹框
   */
  @Bind()
  showRelevantPrice(record, field) {
    const {
      match: { params },
    } = this.props;
    const { relevantColumnList = [] } = this.state;
    const relevantProps = {
      from: 'EDIT',
      templateCode: params.templateCode,
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
            width: '80%',
          },
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
    //   fromPriceLibId: record.fromPriceLibId,
    // });
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
  }

  /**
   * 展示适用范围
   */
  @Bind()
  async showApplicationScope(record, from = '') {
    const { viewCode = '', requestId } = this.state;
    const scopeProps = {
      viewCode,
      tableDs: this.scopeTableDs,
      priceLibId: record.priceLibId,
    };

    // 打开弹框
    const scopeModal = Modal.open({
      key: modalKey,
      title: intl.get('ssrc.priceLibraryNew.view.title.viewScope').d('查看适用范围'),
      drawer: true,
      style: {
        width: '60%',
      },
      children: <ApplicationScope tabsData={[]} {...scopeProps} />,
    });
    // 查询tab标签页
    const params = {
      templateCode: this.props.match.params.templateCode,
      requestId,
      priceLibId: record.priceLibId,
    };
    let result;
    if (from) {
      result = getResponse(await fetchApprovingScopeTabOther(params));
    } else {
      result = getResponse(await fetchApprovingScopeTab(params));
    }
    if (result && !result.failed) {
      // 更新弹框内容
      scopeModal.update({
        children: <ApplicationScope tabsData={result} {...scopeProps} />,
      });
      // 查询第一个tab对应表格的数据
      this.scopeTableDs.setQueryParameter('params', {
        ...params,
        from,
        dimensionCode: result[0] && result[0].dimensionCode,
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
    const iframeUrl = record[`${field.dimensionCode}Href`];
    const width = record[`${field.dimensionCode}WindowWidth`];
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
   * button 撤销操作，单据状态变为撤销
   */
  @Bind()
  async revokePriceLibrary() {
    const {
      history,
      match: { params },
    } = this.props;
    const { requestId, viewCode } = this.state;
    const res = getResponse(await revokePriceLibrary({ requestId }));
    if (res && !res.failed) {
      notification.success();
      history.push(`/ssrc/price-library-new/${params.templateCode}/update?viewCode=${viewCode}`);
    }
  }

  /**
   * 获取table列
   */
  get columns() {
    return [...this.state.columnList];
  }

  @Bind()
  getButtons(backPath) {
    const { revokeByBusKeyFlag = false, approvalByBusKey = null } = this.state;
    const {
      match: { params },
    } = this.props;
    return [
      {
        name: 'operateHistory',
        child: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: this.operateHistory,
        },
      },
      approvalByBusKey && {
        name: 'approval',
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          icon: 'authorize',
          funcType: 'flat',
          type: 'c7n-pro',
          wait: 500,
          onClick: () => this.handleApproval(backPath),
          permissionList: [
            {
              code: `${params.templateCode?.toLocaleLowerCase()}.button.audit`,
              type: 'button',
              meaning:
                intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
                intl.get('ssrc.priceLibraryNew.view.button.approval').d('审批'),
            },
          ],
        },
        child: intl.get('ssrc.priceLibraryNew.view.button.approval').d('审批'),
      },
      revokeByBusKeyFlag && {
        name: 'revokeApproval',
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          icon: 'reply',
          funcType: 'flat',
          type: 'c7n-pro',
          wait: 500,
          onClick: () => this.handleRevoke(backPath),
          permissionList: [
            {
              code: `${params.templateCode?.toLocaleLowerCase()}.button.cancelaudit`,
              type: 'button',
              meaning:
                intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
                intl.get('ssrc.priceLibraryNew.view.button.revokeApproval').d('撤销审批'),
            },
          ],
        },
        child: intl.get('ssrc.priceLibraryNew.view.button.revokeApproval').d('撤销审批'),
      },
    ].filter(Boolean);
  }

  @Bind()
  renderHeader() {
    const {
      match: { params },
    } = this.props;
    const { viewCode } = this.state;
    const backPath = `/ssrc/price-library-new/${params.templateCode}/approval?viewCode=${viewCode}`;
    return (
      <Header
        title={intl
          .get('ssrc.priceLibraryNew.view.title.priceLibraryARQ')
          .d('价格库审批结果查询(明细)')}
        backPath={backPath}
      >
        <DynamicButtons buttons={this.getButtons(backPath)} trigger="hover" />
      </Header>
    );
  }

  // 凯撒易食二开按钮
  @Bind()
  renderExportButton() {
    return null;
  }

  /**
   * 通过businesskey判断流程是否可以撤销
   * @param {*} headerInfoRes
   */
  @Bind()
  async queryOperationRevoke(headerInfoRes) {
    const { requestStatus, businessKey, approveMethod } = headerInfoRes;
    if (requestStatus === 'APPROVING' && businessKey && approveMethod === 'WFL') {
      Promise.all([
        operationRevoke([businessKey]),
        queryBatchApprovaFlag([businessKey]),
        // queryBatchSimpleApprovalHistory([businessKey])
      ]).then(([res1, res2]) => {
        const res = getResponse(res1);
        if (res && res2) {
          this.setState({
            revokeByBusKeyFlag: res?.[businessKey]?.REVOKE,
            approvalByBusKey: res2?.[businessKey],
            // approvalProcessByBusKey: res3?.[businessKey],
          });
        }
      });
    }
  }

  /**
   * 撤销审批
   */
  @Bind()
  handleRevoke(backPath) {
    const { requestId } = this.state;
    const { history } = this.props;
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`ssrc.priceLibraryNew.view.message.note.revokeApprove`)
        .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
      onOk: async () => {
        const res = await revokeWorkflow({ requestId });
        if (getResponse(res)) {
          notification.success();
          history.push(backPath);
        }
      },
    });
  }

  /**
   * 审批
   */
  @Bind()
  handleApproval(backPath) {
    const { approvalByBusKey } = this.state;
    const { history } = this.props;
    const { taskId, processInstanceId } = approvalByBusKey;
    if (taskId && processInstanceId) {
      openApproveModal({
        taskId,
        processInstanceId,
        closable: true,
        onSuccess: () => {
          history.push(backPath);
        },
      });
    }
  }

  render() {
    const {
      match: { params },
      customizeForm,
      customizeVTable = noop,
      // eslint-disable-next-line no-shadow
      remote,
    } = this.props;
    const {
      viewCode,
      // historyData = [],
      tableData = [],
      pagination = {},
      queryLoading = false,
    } = this.state;
    // const historyColumnsList = [
    //   {
    //     name: 'endTime',
    //     width: 150,
    //     tooltip: 'overflow',
    //     renderer: ({ value }) => dateTimeRender(value),
    //   },
    //   {
    //     name: 'action',
    //     width: 150,
    //     tooltip: 'overflow',
    //     renderer: ({ value }) => approveNameRender(value),
    //   },
    //   {
    //     name: 'name',
    //     width: 150,
    //     tooltip: 'overflow',
    //   },
    //   {
    //     name: 'assigneeName',
    //     width: 120,
    //     tooltip: 'overflow',
    //   },
    //   {
    //     name: 'comment',
    //     width: 150,
    //     tooltip: 'overflow',
    //   },
    //   {
    //     name: 'attachmentUuid',
    //     width: 100,
    //     renderer: ({ value }) => {
    //       return (
    //         <Upload
    //           attachmentUUID={value}
    //           name="attachmentUuid"
    //           filePreview
    //           bucketName="private-bucket"
    //           bucketDirectory="hwfp03-price-library"
    //           tenantId={organizationId}
    //           viewOnly
    //         />
    //       );
    //     },
    //   },
    // ];
    const basicFormData = this.basicFormDs.toData()[0];
    const newAttachmentUuid = basicFormData ? basicFormData.attachmentUuid : undefined;
    const backPath = `/ssrc/price-library-new/${params.templateCode}/approval?viewCode=${viewCode}`;
    return (
      <React.Fragment>
        {remote
          ? remote.render('SSRC_PRICELIB_DETAIL_RENDER_HEADER', this.renderHeader(), {
              templateCode: params.templateCode,
              basicFormData,
              backPath,
            })
          : this.renderHeader()}
        <div className={style.rfxControlContainer}>
          <Content>
            <h3 className={style.title} style={{ 'padding-bottom': 0 }}>
              {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
            </h3>
            <div className={style.rfxControlContainerDetailBasicStyle}>
              {customizeForm(
                {
                  code: 'SSRC.PRICE_LIB_NEW.REQ_READ',
                  dataSet: this.basicFormDs,
                },
                <Form
                  dataSet={this.basicFormDs}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output name="requestNum" />
                  <Output name="realName" />
                  <Output name="creationDate" />
                  <Output name="requestStatus" />
                  {/* <Output
                    name="approvalProgress"
                    label={intl.get('ssrc.priceLibraryNew.model.library.approvalProgress').d('审批进度')}
                    renderer={() => {
                      return approvalProcessByBusKey ? <ApproveRecordSimple data={approvalProcessByBusKey} /> : '-';
                    }}
                  /> */}
                  <Output name="remark" colSpan={2} />
                  <Attachment
                    name="attachmentUuid"
                    viewMode="popup"
                    filePreview
                    attachmentUUID={newAttachmentUuid}
                    bucketName="private-bucket"
                    bucketDirectory="price-library-inform-approve"
                    tenantId={organizationId}
                    readOnly
                    dataSet={this.basicFormDs}
                  />
                  {/* <Upload
                    name="attachmentUuid"
                    filePreview
                    attachmentUUID={newAttachmentUuid}
                    bucketName="private-bucket"
                    bucketDirectory="price-library-inform-approve"
                    tenantId={organizationId}
                    viewOnly
                  /> */}
                </Form>
              )}
            </div>
          </Content>
          <Content>
            <h3 className={style.title}>
              {intl.get('ssrc.priceLibraryNew.model.library.price').d('价格')}
            </h3>
            {this.renderExportButton()}
            {customizeVTable(
              {
                code: 'SSRC.PRICE_LIBRARY_NEW.REQ_MAIN_LIST',
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
                customizedCode="SSRC.PRICE_LIBRARY_NEW.REQ_MAIN_LIST"
                headerHeight={36}
                rowHeight={38}
                height={376}
                loading={queryLoading}
                columns={this.columns}
                data={tableData}
              />
            )}
            <Pagination
              {...pagination}
              className={style['performanceTable-pagination']}
              onChange={(page, pageSize) => this.fetchPriceLibData({ page, pageSize })}
            />
          </Content>
        </div>
      </React.Fragment>
    );
  }
}

const HOCDetail = (Comp) =>
  compose(
    WithCustomizeC7N({
      unitCode: [
        'SSRC.PRICE_LIB_NEW.REQ_READ', // 工作流发布申请页面
        'SSRC.PRICE_LIBRARY_NEW.REQ_MAIN_LIST', // 列表
        'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_LIST', // 阶梯报价
      ],
    }),
    formatterCollections({ code: ['ssrc.priceLibraryNew', 'ssrc.common'] }),
    remote({
      code: 'SSRC_PRICELIB_DETAIL', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    })
  )(Comp);

export default HOCDetail(Detail);

export { HOCDetail, Detail };
