/**
 * Recommend - 供应商回复-列表
 * @date: 2021-7-16
 * @author: lzj <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { Component, Fragment } from 'react';
import { isEmpty, isArray, noop, compose, isNil } from 'lodash';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import { DataSet, Tabs, Button, Modal, Icon, Form, Table, Select } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';
import moment from 'moment';

import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import ExcelExport from 'components/ExcelExport';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import DocFlow from '_components/DocFlow';
import { numberRender, yesOrNoRender } from 'utils/renderer';

import style from '@/routes/ssrc/RFSupplierQuotation/index.less';

import {
  saveExecutiveStrategy,
  importBudgetService,
  supplyAbilityService,
  importAnExternalSystem,
  importPriceLibrary,
  fetchAllotted,
  saveAllotted,
  validateResultPool,
  submitResultPool,
} from '@/services/resultsQueryService';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import PopoverButton from '@/routes/components/PopoverButton';
import { handleValidationResult } from '@/routes/components/Widget/handleValidationResult';
import Styles from './index.less';
import { statusRender } from './statusRender';
import LadderLevel from '../../components/LadderLevelDoubleUnit'; // 报价后阶梯报价弹框

import { TableDS, allotDataSet, allotHeadDataSet } from './ds/tableDataSet';

const { TabPane } = Tabs;
const promptCode = 'ssrc.resultsQuery';

const lineModalKey = Modal.key();

class SourceResultPool extends Component {
  constructor(props) {
    super(props);

    const { onRef = noop } = props;
    onRef(this);

    this.currentLineEdit = false;

    this.searchBarRef = null;

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      activeKey: 'pending',
      loading: false,
    };
  }

  allocateData = {};

  tabsName = {
    pending: 'pending',
    approval: 'approval',
    all: 'all',
  };

  componentDidMount() {
    this.initAllPage();
  }

  initAllPage = () => {
    this.queryConfigs();
    this.initAllDS();
    // this.fetchCurrentTable();
  };

  initAllDS = () => {
    const { doubleUnitFlag, pendingDS, approvalDS, allDS } = this.props;

    pendingDS.setQueryParameter('commons', {
      tabCode: 'ATTENTION',
      key: 'pending',
      customizeUnitCode: this.getCustomizeUnitCode(['pendingTable', 'pendingTableFilter']),
    });

    approvalDS.setQueryParameter('commons', {
      tabCode: 'APPROVING',
      key: 'approval',
      customizeUnitCode: this.getCustomizeUnitCode(['approvalTable', 'approvalTableFilter']),
    });

    allDS.setQueryParameter('commons', {
      key: 'all',
      tabCode: '',
      customizeUnitCode: this.getCustomizeUnitCode(['allTable', 'allTableFilter']),
    });

    allDS.setState('doubleUnitFlag', doubleUnitFlag);
  };

  queryConfigs = () => {
    this.dealCustActiveTabKey();
  };

  fetchCurrentTable = () => {
    const ds = this.getCurrentTableDS();

    ds.query(ds.currentPage);
  };

  toggleLoading = (loading = false) => {
    this.setState({
      loading,
    });
  };

  /**
   * 处理个性化Tabs时, 需要同步activeKey, 因为个性化只是覆盖默认的defaultActiveKey, 并不会改变activeKey
   */
  dealCustActiveTabKey() {
    const field =
      this.props.getHocInstance?.().custConfig[this.getCustomizeUnitCode('tabs')]?.fields || [];
    const { fieldCode } = field.find((item) => item.defaultActive === 1) || {};
    if (fieldCode) {
      this.setState({
        activeKey: fieldCode,
      });
    } else {
      const sortField =
        // eslint-disable-next-line array-callback-return
        field.sort((a, b) => {
          if (a?.seq < b?.seq) {
            return -1;
          }
          return null;
        }) || [];
      this.setState({
        activeKey: sortField.find((item) => item.visible)?.fieldCode || this.state?.activeKey,
      });
    }
  }

  getCurrentTableDS = (key = '') => {
    const { pendingDS, approvalDS, allDS } = this.props;
    const { activeKey } = this.state;

    const tabKey = key || activeKey;

    let currentDS = pendingDS;

    if (tabKey === 'approval') {
      currentDS = approvalDS;
    }

    if (tabKey === 'all') {
      currentDS = allDS;
    }

    return currentDS;
  };

  /**
   * 获取对应的个性化编码
   * @param type null string | string[]
   * @return null | string
   *  */
  getCustomizeUnitCode = (type = null) => {
    if (!type || isEmpty(type)) {
      return null;
    }

    const RfxCodeMap = new Map([
      ['buttons', 'SSRC.SOURCE_RESULT_POOL.BUTTONS'], // 头部按钮组
      ['pendingTable', 'SSRC.SOURCE_RESULT_POOL.PENDING_TABLE'],
      ['pendingTableFilter', 'SSRC.SOURCE_RESULT_POOL.PENDING_TABLE_FILTER'],
      ['approvalTable', 'SSRC.SOURCE_RESULT_POOL.APPROVAL_TABLE'],
      ['approvalTableFilter', 'SSRC.SOURCE_RESULT_POOL.APPROVAL_TABLE_FILTER'],
      ['allTable', 'SSRC.SOURCE_RESULT_POOL.FINISH_TABLE'],
      ['allTableFilter', 'SSRC.SOURCE_RESULT_POOL.FINISH_TABLE_FILTER'],
      ['tabs', 'SSRC.SOURCE_RESULT_POOL.TABS'], //
      ['allocate', 'SSRC.SOURCE_RESULT_POOL.TABLE_ALLOCATE'],
    ]);

    const CodeDataMap = RfxCodeMap;
    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = CodeDataMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        codeSet.add(CodeDataMap.get(unitCode));
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  getCurrentTabTableCode = () => {
    const { activeKey } = this.state;

    let tableKey = 'pendingTable';

    if (activeKey === 'approval') {
      tableKey = 'approvalTable';
    }

    if (activeKey === 'all') {
      tableKey = 'allTable';
    }

    return tableKey;
  };

  getCurrentTableUnitCode = () => {
    return this.getCustomizeUnitCode(this.getCurrentTabTableCode());
  };

  getCurrentTabTableSearchCode = () => {
    const { activeKey } = this.state;

    let tableFilterKey = 'pendingTableFilter';

    if (activeKey === 'approval') {
      tableFilterKey = 'approvalTableFilter';
    }

    if (activeKey === 'all') {
      tableFilterKey = 'allTableFilter';
    }

    return tableFilterKey;
  };

  getCurrentTabTableCodeCombine = () => {
    return this.getCustomizeUnitCode([
      this.getCurrentTabTableCode(),
      this.getCurrentTabTableSearchCode(),
    ]);
  };

  // 头动态按钮组件
  headerButtons = () => {
    return <DynamicButtons buttons={this.getButtons()} />;
  };

  handleChange = (key) => {
    this.setState(
      {
        activeKey: key,
      },
      () => {
        this.fetchCurrentTable();
      }
    );
  };

  tableSearchQuery = ({ params }) => {
    const currentTableDS = this.getCurrentTableDS();
    currentTableDS.setQueryParameter('searchBar', params);
    currentTableDS.query();
  };

  pendingTab = () => {
    const { activeKey } = this.state;

    return activeKey === 'pending';
  };

  approvalTab = () => {
    const { activeKey } = this.state;

    return activeKey === 'approval';
  };

  allTab = () => {
    const { activeKey } = this.state;

    return activeKey === 'all';
  };

  @Debounce(800)
  viewDetail = (record) => {
    const { onDetail } = this.props;
    const data = record.toData();

    if (typeof onDetail === 'function') {
      onDetail(data);
    }
  };

  @Debounce(800)
  viewLadder = (record) => {
    const { viewLadderLevelModal } = this.props;

    const data = record.toData();

    if (typeof viewLadderLevelModal === 'function') {
      viewLadderLevelModal(data);
    }
  };

  @Debounce(800)
  linktoPrNumDetailPage = (record) => {
    const { linktoPrNumDetail } = this.props;
    const data = record.toData();

    if (typeof linktoPrNumDetail === 'function') {
      linktoPrNumDetail(data);
    }
  };

  @Debounce(800)
  allocateCompanyQuantityView = (visible = false, record = {}) => {
    if (visible) {
      this.fetchNumAllotted(record);
    } else {
      this.clearAllottedNum();
    }
  };

  getCurrentId = () => {
    const id = this.allTab() ? 'resultId' : 'resultPoolId';
    return id;
  };

  distributeModalRef = null;

  @Debounce(500)
  distributeNum = async (record) => {
    const { customizeTable } = this.props;
    const { loading } = this.state;
    await this.fetchNumAllotted(record);

    this.distributeModalRef = Modal.open({
      key: lineModalKey,
      closable: true,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
      style: { width: '742px' },
      children: (
        <div>
          <div
            style={{
              margin: '-20px -20px 20px',
              background: 'rgb(230, 242, 253)',
              padding: '10px 24px',
              fontSize: '13px',
              color: 'rgb(48, 145, 242)',
            }}
          >
            <Icon type="icon icon-help" />
            <span style={{ paddingLeft: '8px' }}>
              {intl
                .get('ssrc.common.model.view.tableOnlyUpdateAttributeFieldsWarning')
                .d('分配弹框表格只更新个性化字段的值，配置标准字段修改后不生效')}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Form dataSet={this.allotHeadDS} columns={3} labelLayout="float">
              <Select name="allocateRule" clearButton={false} />
            </Form>
          </div>

          {customizeTable(
            { code: this.getCustomizeUnitCode('allocate') },
            <Table
              dataSet={this.allotDS}
              rowKey="resultPoolId"
              pagination={false}
              columns={this.getLineAllottedColumns()}
            />
          )}
        </div>
      ),
      okProps: {
        loading,
        wait: 800,
        waitType: 'debounce',
      },
      onOk: this.distributeNumOk,
      onClose: this.distributeNumClose,
    });
  };

  validateDistribute = async () => {
    const { current } = this.allotHeadDS || {};

    if (!current) {
      return;
    }

    current.set('status', 'update');

    this.allotDS.forEach((record) => {
      if (!record) {
        return;
      }

      record.set('status', 'update');
    });

    const headerValidate = await this.allotHeadDS.validate();
    const lineValidate = await this.allotDS.validate();

    const headerData = current.toData() || {};
    const lineData = this.allotDS.toData() || [];

    return {
      validateFlag: headerValidate && lineValidate,
      allocateInfoList: lineData,
      ...headerData,
      organizationId: this.organizationId,
      querys: {
        customizeUnitCode: this.getCustomizeUnitCode('allocate'),
      },
    };
  };

  @Debounce(500)
  distributeNumOk = async () => {
    const { validateFlag = false, ...data } = (await this.validateDistribute()) || {};
    if (!validateFlag) {
      return false;
    }

    let result = null;
    try {
      this.toggleLoading(true);
      result = await saveAllotted(data);
      result = getResponse(result);
      this.toggleLoading(false);
      if (!result) {
        return false;
      }

      this.successNotification();
      this.fetchCurrentTable();
    } catch (e) {
      throw e;
    }
  };

  @Debounce(500)
  distributeNumClose = () => {
    this.clearAllottedNum();
  };

  clearAllottedNum = () => {
    if (!this.allotDS || !this.allotHeadDS) {
      return;
    }

    this.allotHeadDS.clear();
    this.allotHeadDS.loadData();
    this.allotDS.clear();
    this.allotDS.loadData();
    this.allotDS.reset();
  };

  fetchNumAllotted = async (record) => {
    const { quotationLineId, resultPoolId, resultId } =
      record?.get(['quotationLineId', 'resultPoolId', 'resultId']) || {};

    if (this.currentLineEdit) {
      return;
    }

    this.allotHeadDS = new DataSet(allotHeadDataSet());
    this.allotDS = new DataSet(allotDataSet());

    this.allotDS.setState('allotHeadDS', this.allotHeadDS);

    this.currentLineEdit = true;

    const data = {
      quotationLineId,
      resultPoolId,
      resultId,
      organizationId: this.organizationId,
      customizeUnitCode: this.getCustomizeUnitCode('allocate'),
    };
    let result = null;
    try {
      this.toggleLoading(true);
      result = await fetchAllotted(data);
      this.currentLineEdit = false;
      result = getResponse(result);
      this.toggleLoading();
      if (!result) {
        return;
      }

      const { allocateInfoList = [], ...others } = result || {};
      this.allotHeadDS.loadData([others]);
      this.allotDS.loadData(allocateInfoList || []);
    } catch (e) {
      throw e;
    }
  };

  getLineAllottedColumns = () => {
    const columns = [
      {
        name: 'companyNum',
        width: 160,
      },
      {
        name: 'companyName',
      },
      {
        name: 'quantity',
        editor: true,
        width: 160,
      },
    ].filter(Boolean);

    return columns;
  };

  allottedColumns = () => {
    const columns = [
      {
        title: intl.get(`ssrc.common.company`).d('公司'),
        name: 'companyName',
      },
      {
        name: 'quantity',
        width: 160,
      },
    ].filter(Boolean);

    return columns;
  };

  renderAllocateCompanyQuantity = ({ value, record }) => {
    if (isNil(value)) {
      return '-';
    }

    return (
      <Popover
        title=""
        overlayStyle={{ width: '600px' }}
        content={() => (
          <Table
            bordered={false}
            dataSet={this.allotDS}
            rowKey="resultPoolId"
            pagination={false}
            columns={this.allottedColumns({ edit: false })}
            virtual
            virtualCell
            style={{
              maxHeight: 420,
            }}
          />
        )}
        trigger="click"
        placement="topLeft"
        onVisibleChange={(visible) => this.allocateCompanyQuantityView(visible, record)}
      >
        <a>{value}</a>
      </Popover>
    );
  };

  getTableColumns = () => {
    const columns = [
      {
        name: 'poolStatus',
        width: 100,
        hidden: !this.pendingTab(), // 进行中显示
        renderer: ({ record }) => {
          const { poolStatus, poolStatusMeaning } = record.get(['poolStatusMeaning', 'poolStatus']);

          if (!poolStatus) {
            return '';
          }

          return statusRender({ status: poolStatus, statusMeaning: poolStatusMeaning });
        },
      },
      {
        name: 'sourceNum',
        width: 140,
        renderer: ({ value, record }) => {
          return <a onClick={() => this.viewDetail(record)}>{value}</a>;
        },
      },
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'itemCode',
        width: 140,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'itemNum',
        width: 100,
      },
      {
        name: 'supplierCompanyNum',
        width: 160,
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'taxPrice',
        align: 'right',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      // {
      //   name: 'unitPrice',
      //   align: 'right',
      //   renderer: this.tableColumnRenderNumber,
      // },
      {
        name: 'allocateCompanyQuantity',
        width: 120,
        renderer: this.renderAllocateCompanyQuantity,
      },

      {
        name: 'operate',
        width: 120,
        hidden: !this.pendingTab(),
        renderer: ({ record }) => {
          if (!this.pendingTab()) {
            return '-';
          }

          return (
            <Button
              funcType="link"
              waitType="throttle"
              wait={500}
              onClick={() => this.distributeNum(record)}
            >
              {intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
            </Button>
          );
        },
      },
    ];

    return columns;
  };

  getAllColumns = () => {
    const { oldPriceFlag, isNewLink, oldSourceFlag, doubleUnitFlag } = this.props;

    const columns = [
      !oldPriceFlag && {
        name: 'priceSyncStatusMeaning',
        width: 120,
      },
      !oldPriceFlag && {
        name: 'priceSyncFeedback',
        width: 120,
      },
      {
        name: 'importErpStatusMeaning',
        width: 120,
      },
      {
        name: 'importErpFeedback',
        width: 200,
      },
      isNewLink && {
        name: 'resultExecutionStrategy',
        width: 130,
        editor: (record) => {
          const {
            resultExecutionStrategyOptional = [],
            resultExecutionStrategyMeaning = '',
          } = record.get(['resultExecutionStrategyOptional', 'resultExecutionStrategyMeaning']);

          const newOptions = toJS(resultExecutionStrategyOptional);

          if (isEmpty(newOptions) || !isNewLink) {
            return resultExecutionStrategyMeaning || '';
          }

          return (
            <Select
              record={record}
              name="resultExecutionStrategy"
              optionsFilter={(curRecord) => {
                const currentOptionValue = curRecord.get('value') || null;
                return (newOptions || []).includes(currentOptionValue);
              }}
              showHelp="tooltip"
            />
          );
        },
      },
      {
        name: 'amountUsageRecordQuery',
        width: 120,
        renderer: ({ record }) => {
          const { needShowBudgetHistory, budgetMode, sourceHeaderId, resultId } = record.get([
            'needShowBudgetHistory',
            'budgetMode',
            'sourceHeaderId',
            'resultId',
          ]);

          return (
            needShowBudgetHistory && (
              <BudgetModal
                documentType="SOURCE"
                docLineId={budgetMode === 'HEADER' ? sourceHeaderId : resultId}
              />
            )
          );
        },
      },
      oldSourceFlag && {
        name: 'syncStatusMeaning',
        width: 100,
      },
      oldSourceFlag && {
        name: 'syncResponseMsg',
        width: 120,
      },
      {
        name: 'docFlow',
        width: 120,
        renderer: ({ record }) => {
          const rfxLineItemId = record.get('rfxLineItemId');

          return <DocFlow tableName="ssrc_rfx_line_item" tablePk={rfxLineItemId} />;
        },
      },
      {
        name: 'purOrganizationCode',
        width: 120,
      },
      {
        name: 'purOrganizationName',
        width: 120,
      },
      {
        name: 'ouName',
        width: 120,
      },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 100,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'uomName',
        width: 100,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        name: 'itemNum',
        width: 60,
      },
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'erpSupplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 120,
      },
      {
        name: 'taxPrice',
        align: 'right',
        width: 80,
        renderer: this.tableColumnRenderNumber,
      },
      {
        name: 'unitPrice',
        align: 'right',
        width: 80,
        renderer: this.tableColumnRenderNumber,
      },
      doubleUnitFlag
        ? {
            name: 'taxSecondaryPrice',
            align: 'right',
            width: 80,
            renderer: this.tableColumnRenderNumber,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'netSecondaryPrice',
            align: 'right',
            width: 80,
            renderer: this.tableColumnRenderNumber,
          }
        : null,
      {
        width: 100,
        name: 'quotationDetailFlag',
        renderer: ({ record }) => {
          const { sourceFrom, sourceHeaderId, secondarySourceCategory } = record.get([
            'sourceFrom',
            'sourceHeaderId',
            'secondarySourceCategory',
          ]);

          return (
            <QuotationDetail
              rowData={record}
              uiType="c7n-pro"
              sourceFrom={sourceFrom}
              sourceHeaderId={sourceHeaderId}
              allowBuyerViewFlag
              bidFlag={secondarySourceCategory === 'NEW_BID'}
            />
          );
        },
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ record }) => {
          const ladderInquiryFlag = record.get('ladderInquiryFlag');

          return ladderInquiryFlag === 1 ? (
            <a onClick={() => this.viewLadder(record)}>
              {intl.get(`${promptCode}.model.offlineEntry.ladderLevel`).d('阶梯报价')}
            </a>
          ) : (
            ''
          );
        },
      },
      {
        name: 'taxCode',
        width: 60,
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'rate',
        width: 80,
        renderer: ({ value }) => numberRender(value, 8, false),
      },
      {
        name: 'validQuotationRemark',
        width: 120,
      },
      {
        name: 'quotationTypeMeaning',
        width: 90,
      },
      {
        name: 'validPromisedDate',
        width: 110,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      {
        name: 'quotationExpiryDateFrom',
        width: 120,
      },
      {
        name: 'quotationExpiryDateTo',
        width: 120,
      },
      {
        name: 'priceBatchQuantity',
        align: 'right',
        width: 90,
      },
      {
        name: 'controlProtocolFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'prNum',
        width: 140,
        renderer: ({ value, record }) => {
          return <a onClick={() => this.linktoPrNumDetailPage(record)}> {value || ''}</a>;
        },
      },
      {
        name: 'prLineNum',
        width: 140,
      },
      {
        name: 'receiptsStatusMeaning',
        width: 120,
      },
      {
        name: 'occupationQuantity',
        width: 120,
        renderer: this.tableColumnRenderNumber,
      },
      {
        name: 'rfxCreated',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'finishDate',
        width: 150,
      },
      {
        name: 'model',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'sourceNum',
        width: 150,
        lock: 'right',
        renderer: ({ value, record }) => {
          return <a onClick={() => this.viewDetail(record)}>{value}</a>;
        },
      },
      {
        name: 'budgetImportStatusMeaning',
        width: 150,
      },
      {
        name: 'budgetImportFeedback',
        width: 150,
      },
      {
        name: 'supplyImportStatusMeaning',
        width: 180,
      },
      {
        name: 'supplyImportFeedback',
        width: 180,
      },
      {
        name: 'allocateCompanyQuantity',
        width: 120,
        renderer: this.renderAllocateCompanyQuantity,
      },
    ].filter(Boolean);

    return columns;
  };

  tableColumnRenderNumber = ({ value }) => {
    return numberSeparatorRender(value);
  };

  clearCurrentDSSelected = () => {
    const ds = this.getCurrentTableDS();
    if (!ds) {
      return;
    }

    ds.clearCachedSelected();
    ds.unSelectAll();
  };

  handleSubmit = async () => {
    const { lines, validFlag = false } = (await this.getCurrentTableSelectedData()) || {};

    if (!validFlag || !lines.length) {
      return;
    }

    const SubmitNewData = {
      organizationId: this.organizationId,
      querys: {
        customizeUnitCode: this.getCurrentTableUnitCode(),
      },
      sourceResultPoolList: lines,
    };

    // 二次提交确认
    const confirmSubmit = async (SubmitOptionData = {}) => {
      const SubmitSymbolData = { passFlag: 1 }; // 通过passFlag确定是校验还是提交
      const result = await submitResultPool({
        ...SubmitNewData,
        ...SubmitSymbolData,
        ...SubmitOptionData,
      });
      this.toggleLoading(false);
      if (result && result.failed) {
        notification.warning({
          message: result?.message,
        });
        return;
      }

      await handleValidationResult({
        validationResult: result,
        afterSuccessSubmit: () => {
          notification.success();
          this.fetchCurrentTable();
          this.clearCurrentDSSelected();
        },
        // headerId: rfxId,
      });
    };

    this.toggleLoading(true);
    let result = null;
    try {
      result = await validateResultPool(SubmitNewData);
      this.toggleLoading(false);
      if (result && result.failed) {
        notification.warning({
          message: result?.message,
        });
        return;
      }

      if (Array.isArray(result) && isEmpty(result)) {
        confirmSubmit(); // 后端没有采用标准校验器，检验成功返回了[]，还需要前端再提交
        return;
      }

      /**
       * 校验弱校验场景下，后端返回的数据不是标准校验结构，是个数组。暂时不考虑扩展
       * 前端为了用组件 handleValidationResult，对数据结果做一次封装，
       * */
      if (Array.isArray(result) && !isEmpty(result)) {
        /**
         * confirmFlag: null
         warnCode: "error.ssrc.result_pool_no_quantity"
         warnFlag: 1
         warnMessage:  "寻源
         * */
        const list = result.map((res) => {
          const { warnFlag, warnMessage = '' } = res || {};
          if (warnFlag === 1) {
            return {
              ...res,
              type: 'WARNING',
              message: warnMessage,
            };
          }
          return res;
        });

        result = {
          validateResults: list,
        };
      }

      await handleValidationResult({
        validationResult: result,
        // headerId: rfxId,
        confirmSubmit: () => confirmSubmit(),
        afterSuccessSubmit: () => {
          this.fetchCurrentTable();
          this.clearCurrentDSSelected();
        },
      });
    } catch (e) {
      throw e;
    }
  };

  getCurrentTableData = async () => {
    const { allDS } = this.props;
    let validateFlag = false;
    let lines = [];

    const ds = this.getCurrentTableDS();
    if (ds?.length < 1) {
      return;
    }

    ds.forEach((record) => {
      record.set('status', 'update');
    });

    validateFlag = await allDS.validate();
    lines = ds.toData();

    return {
      lines,
      validateFlag,
    };
  };

  // all table selected
  getCurrentTableSelectedData = async () => {
    const { selected: allTabSelected } = this.getCurrentTableDS() || {};
    if (!allTabSelected?.length) {
      return null;
    }

    const resultPoolIds = [];
    const ids = [];
    const lines = [];
    const allDsSelectValidate = [];

    allTabSelected.forEach((record) => {
      const { resultPoolId, resultId } = record.get(['resultPoolId', 'resultId']);
      if (resultId) {
        ids.push(resultId);
      }
      if (resultPoolId) {
        resultPoolIds.push(resultPoolId);
      }
      const data = record.toJSONData();
      lines.push(data);
      allDsSelectValidate.push(record.validate(true));
    });

    let validFlag = await Promise.all(allDsSelectValidate);
    validFlag = validFlag.every((v) => v !== false);

    return {
      resultPoolIds,
      ids,
      lines,
      validFlag,
    };
  };

  // 导入价格库
  @Bind()
  @Debounce(500)
  async handleImportPriceLibrary() {
    const { ids } = (await this.getCurrentTableSelectedData()) || {};

    const data = {
      resultIds: ids,
    };

    this.toggleLoading(true);
    const result = getResponse(await importPriceLibrary(data));
    this.toggleLoading(false);
    if (result) {
      notification.success({
        message: intl.get('hzero.common.message.notification').d('操作成功!'),
      });
    }

    this.clearCurrentDSSelected();
    this.fetchCurrentTable();
  }

  @Bind()
  async handleImportAnExternalSystem() {
    const { lines, ids, validFlag } = (await this.getCurrentTableSelectedData()) || {};
    if (!lines.length || !validFlag) {
      return;
    }

    this.toggleLoading(true);
    const params = {
      organizationId: this.organizationId,
      data: lines,
      customizeUnitCode: this.getCurrentTableUnitCode(),
    };
    const res = getResponse(await saveExecutiveStrategy(params));
    if (res) {
      const result = getResponse(await importAnExternalSystem({ resultIds: ids }));
      this.toggleLoading(false);
      if (result) {
        notification.success({
          message: intl.get('hzero.common.message.notification').d('操作成功!'),
        });
      }
      this.clearCurrentDSSelected();
      this.fetchCurrentTable();
    } else {
      this.toggleLoading(false);
    }
  }

  @Throttle(1000)
  @Bind()
  async createSupplierAvailable() {
    const { ids } = (await this.getCurrentTableSelectedData()) || {};
    const data = { resultIds: ids };
    const params = { organizationId: this.organizationId, data };
    this.toggleLoading(true);
    supplyAbilityService(params).then((res) => {
      this.toggleLoading(false);
      if (getResponse(res)) {
        notification.success({
          message: intl.get('hzero.common.message.notification').d('操作成功!'),
        });
        this.clearCurrentDSSelected();
        this.fetchCurrentTable();
      }
    });
  }

  @Throttle(1000)
  @Bind()
  async importBudget() {
    const { ids } = (await this.getCurrentTableSelectedData()) || {};
    const data = { resultIds: ids };
    const params = { organizationId: this.organizationId, data };
    this.toggleLoading(true);

    importBudgetService(params).then((res) => {
      this.toggleLoading(false);
      if (getResponse(res)) {
        notification.success({
          message: intl.get('hzero.common.message.notification').d('操作成功!'),
        });
        this.clearCurrentDSSelected();
        this.fetchCurrentTable();
      }
    });
  }

  @Throttle(1000)
  @Bind()
  async saveExecutiveStrategy() {
    const { lines, validateFlag } = (await this.getCurrentTableData()) || {};
    if (!validateFlag) {
      return;
    }
    if (!lines.length) {
      return;
    }
    this.toggleLoading(true);
    const params = {
      organizationId: this.organizationId,
      data: lines,
      customizeUnitCode: this.getCurrentTableUnitCode(),
    };
    saveExecutiveStrategy(params).then((res) => {
      this.toggleLoading(false);
      if (getResponse(res)) {
        this.successNotification();
        this.clearCurrentDSSelected();
        this.fetchCurrentTable();
      }
    });
  }

  successNotification = () => {
    notification.success({
      message: intl.get('hzero.common.notification.success.save').d('保存成功'),
    });
  };

  getCurrentTabSearchParams = () => {
    const ds = this.getCurrentTableDS();

    let data = {};
    const { queryDataSet } = ds || {};
    if (!queryDataSet) {
      return data;
    }

    data = queryDataSet?.toData() || [];
    data = data[0] || {};
    return data;
  };

  getSelectedKeys = () => {
    const { selected: allTabSelected } = this.getCurrentTableDS() || {};
    if (!allTabSelected?.length) {
      return [];
    }

    const resultPoolIds = [];
    const resultIds = [];

    allTabSelected.forEach((record) => {
      const { resultPoolId, resultId } = record.get(['resultPoolId', 'resultId']);
      if (resultId) {
        resultIds.push(resultId);
      }
      if (resultPoolId) {
        resultPoolIds.push(resultPoolId);
      }
    });

    return {
      resultPoolIds,
      resultIds,
    };
  };

  getAllTabBtns = () => {
    const { isNewLink, match = {}, allDS, resultPoolRemote } = this.props;
    const { loading } = this.state;
    const { selected: allTabSelected } = allDS || {};
    const exportParams = this.getSearchBarQueryParams() || {};
    const { resultIds = [] } = this.getSelectedKeys() || {};
    const searchFilterCode = this.getCustomizeUnitCode(this.getCurrentTabTableSearchCode());

    let allButtons = [
      {
        name: 'importPriceLibrary',
        btnComp: PopoverButton,
        btnType: 'c7n-pro',
        btnProps: {
          onClick: this.handleImportPriceLibrary,
          loading,
          wait: 800,
          waitType: 'debounce',
          disabled: !allTabSelected?.length,
          icon: 'archive',
          showPopover: true,
          placement: 'top',
          funcType: 'flat',
          content: intl
            .get(`${promptCode}.model.resultsQuery.importPriceLibrary.tooltip`)
            .d('支持将寻源结果导入价格库，若导入同步成功的寻源结果会将原价格行失效重新同步。'),
        },
        child: intl.get(`${promptCode}.model.resultsQuery.importPriceLibrary`).d('导入价格库'),
      },
      {
        name: 'importAnExternalSystem',
        btnComp: PopoverButton,
        btnType: 'c7n-pro',
        btnProps: {
          onClick: this.handleImportAnExternalSystem,
          loading,
          disabled: !allTabSelected?.length,
          showPopover: true,
          placement: 'top',
          funcType: 'flat',
          wait: 800,
          waitType: 'debounce',
          content: intl
            .get(`${promptCode}.model.resultsQuery.importAnExternalSystem.tooltip`)
            .d('支持将“未导入”“导入失败”的寻源结果导入外部系统'),
        },
        child: (
          <span>
            <Icon
              type="archive"
              style={{ marginRight: '4px', fontSize: '14px', paddingBottom: '2px' }}
            />
            {intl.get(`${promptCode}.model.resultsQuery.importAnExternalSystem`).d('导入外部系统')}
          </span>
        ),
      },
      {
        name: 'createSupplierAvailable',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: this.createSupplierAvailable,
          disabled: !allTabSelected?.length,
          funcType: 'flat',
          wait: 800,
          waitType: 'debounce',
          loading,
        },
        child: (
          <>
            {intl
              .get(`${promptCode}.model.resultsQuery.createSupplierAvailable`)
              .d('生成供货能力清单')}
          </>
        ),
      },
      {
        name: 'importBudget',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: this.importBudget,
          disabled: !allTabSelected?.length,
          funcType: 'flat',
          wait: 800,
          waitType: 'debounce',
          loading,
        },
        child: <>{intl.get(`${promptCode}.model.resultsQuery.importBudget`).d('导入预算')}</>,
      },
      {
        name: 'priceExport',
        btnComp: ExcelExport,
        btnType: 'c7n-pro',
        btnProps: {
          buttonText: intl.get('hzero.common.button.priceExport').d('批量导出'),
          requestUrl: `/ssrc/v2/${this.organizationId}/source/result-pool/result-list/export`,
          queryParams: {
            resultIds: resultIds?.length > 0 ? resultIds : undefined,
            ...exportParams,
            customizeUnitCode: searchFilterCode,
          },
          loading,
          funcType: 'flat',
        },
      },
      {
        name: 'newPriceExport',
        btnComp: ExcelExportPro,
        btnType: 'c7n-pro',
        btnProps: {
          templateCode: 'SSRC_SOURCE_RESULT_BATCH_EXPORT',
          buttonText: intl.get('hzero.common.button.priceExportNew').d('(新)批量导出'),
          requestUrl: `/ssrc/v2/${this.organizationId}/source/result-pool/result-list/export`,
          queryParams: {
            resultIds: resultIds?.length > 0 ? resultIds : undefined,
            ...exportParams,
            customizeUnitCode: searchFilterCode,
          },
          otherButtonProps: {
            funcType: 'flat',
            wait: 800,
            waitType: 'debounce',
            loading,
            permissionList: [
              {
                code: `${match?.path}.button.exportNew`.toLowerCase(),
                type: 'button',
                meaning: `${
                  intl
                    .get(`${promptCode}.view.message.title.findSourceResultQuery`)
                    .d('寻源结果查询') -
                  intl.get('hzero.common.button.priceExportNew').d('(新)批量导出')
                }`,
              },
            ],
          },
        },
      },
      {
        name: 'save',
        hidden: !isNewLink,
        btnType: 'c7n-pro',
        btnProps: {
          onClick: this.saveExecutiveStrategy,
          // funcType: "flat",
          funcType: 'flat',
          wait: 800,
          waitType: 'debounce',
          loading,
        },
        child: (
          <>
            <Icon type="save" style={{ marginRight: '4px' }} />
            {intl.get('hzero.common.btn.save').d('保存')}
          </>
        ),
      },
    ];

    allButtons = resultPoolRemote
      ? resultPoolRemote.process('SSRC_SOURCE_RESULT_POOL_PROCESS_ALL_BTNS', allButtons, {
          that: this,
          allDS,
        })
      : allButtons;

    return allButtons.filter(Boolean);
  };

  getPendingBtns = () => {
    const { pendingDS, resultPoolRemote } = this.props;
    const { loading } = this.state;

    let buttons = [
      {
        name: 'submit',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          color: 'primary',
          onClick: this.handleSubmit,
          loading,
          disabled: !pendingDS?.selected?.length,
          wait: 800,
          waitType: 'debounce',
        },
      },
    ];

    buttons = resultPoolRemote
      ? resultPoolRemote.process('SSRC_SOURCE_RESULT_POOL_PROCESS_PENDING_BTNS', buttons, {
          that: this,
        })
      : buttons;

    return buttons.filter(Boolean);
  };

  getButtons = () => {
    const pendingBtns = this.pendingTab() ? this.getPendingBtns() : [];
    const allBtns = this.allTab() ? this.getAllTabBtns() : [];

    let buttons = [...pendingBtns, ...allBtns];

    buttons = buttons.filter(Boolean);

    return buttons;
  };

  setCurrentSearchBarRef = (ref) => {
    this.searchBarRef = ref;
  };

  getSearchBarQueryParams = () => {
    const { getQueryParameter } = this.searchBarRef || {};
    let data = {};
    if (getQueryParameter) {
      data = getQueryParameter();
    }

    data = data || {};
    return data;
  };

  // 筛选器-单据发布时间 默认值范围 approved_date
  getFilterCreateDataRangeDefaultValue = () => {
    const value = [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')];
    return value;
  };

  renderCotent = () => {
    const { customizeTable } = this.props;

    const id = this.allTab() ? 'resultId' : 'resultPoolId';

    const columns = this.allTab() ? this.getAllColumns() : this.getTableColumns();
    const searchFilterCode = this.getCustomizeUnitCode(this.getCurrentTabTableSearchCode());

    return (
      <>
        {customizeTable(
          { code: this.getCurrentTableUnitCode() },
          <SearchBarTable
            clearButton
            searchBarRef={this.setCurrentSearchBarRef}
            searchCode={searchFilterCode}
            onQuery={this.tableSearchQuery}
            fieldProps={{}}
            showLoading={false}
            queryBar="none"
            searchBarConfig={{
              autoQuery: true,
              // closeFilterSelector: true, // 不能切换筛选 和新建筛选了
              // defaultExpand: false,
              onQuery: this.tableSearchQuery,
              editorProps: {
                organizationId: this.organizationId,
              },
              fieldProps: {
                tempKey: {
                  // SSLM.SUPPLIER_CHOOSE
                  lovPara: {
                    tenantId: this.organizationId,
                  },
                },
                finishDate: {
                  defaultValue: this.getFilterCreateDataRangeDefaultValue(),
                },
              },
              fieldDefaultValueType: 'custom',
            }}
            bordered
            dataSet={this.getCurrentTableDS()}
            rowKey={id}
            virtual
            virtualCell
            columns={columns}
            style={getTableFixSelfAdaptStyle()?.searchBarTableMaxHeight}
          />
        )}
      </>
    );
  };

  render() {
    const {
      customizeTabPane,
      customizeBtnGroup,
      ladderLevelModalProps = {},
      pendingDS,
      approvalDS,
      allDS,
    } = this.props;

    // 当前激活的tab是否是全部页签这样的单表页签
    const tableFixSelfAdaptStyle = getTableFixSelfAdaptStyle(true) || {};

    return (
      <Fragment>
        <Header
          className={Styles['ssrc-source-result-pool']}
          useDefaultTitle={false}
          title={intl.get('ssrc.common.view.title.sourceResultPool').d('寻源结果池')}
        >
          {customizeBtnGroup(
            { code: this.getCustomizeUnitCode('buttons'), pro: true, btnType: 'c7n-pro' },
            <DynamicButtons buttons={this.getButtons()} />
          )}
        </Header>
        <Content>
          <div className={style.wrapper} style={tableFixSelfAdaptStyle.wrapperCalcHeight}>
            {customizeTabPane(
              {
                code: this.getCustomizeUnitCode('tabs'),
              },
              <Tabs
                keyboard={false}
                // defaultChangeable={false}
                // defaultActiveKey={activeKey}
                // activeKey={activeKey}
                onChange={this.handleChange}
                {...tableFixSelfAdaptStyle.tabsProps}
              >
                <TabPane
                  tab={
                    <span>{intl.get('ssrc.inquiryHall.model.inquiryHall.toDeal').d('待处理')}</span>
                  }
                  key="pending"
                  count={!pendingDS?.counting ? pendingDS?.totalCount ?? '0' : ''}
                >
                  {this.renderCotent()}
                </TabPane>
                <TabPane
                  tab={intl.get('ssrc.inquiryHall.model.inquiryHall.approvaling').d('审批中')}
                  key="approval"
                  count={!approvalDS?.counting ? approvalDS?.totalCount ?? '0' : ''}
                >
                  {this.renderCotent()}
                </TabPane>
                <TabPane
                  tab={intl.get('ssrc.inquiryHall.model.inquiryHall.hadFinished').d('已完成')}
                  key="all"
                  count={!allDS?.counting ? allDS?.totalCount ?? '0' : ''}
                >
                  {this.renderCotent()}
                </TabPane>
              </Tabs>
            )}
          </div>

          <LadderLevel {...ladderLevelModalProps} />
        </Content>
      </Fragment>
    );
  }
}

const hocComponent = (NewComponent) => {
  return compose(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.resultsQuery',
        'scux.ssrc',
        'sscux.ssrc',
      ],
    }),
    withCustomize({
      unitCode: [
        'SSRC.SOURCE_RESULT_POOL.BUTTONS',
        'SSRC.SOURCE_RESULT_POOL.PENDING_TABLE',
        'SSRC.SOURCE_RESULT_POOL.PENDING_TABLE_FILTER',
        'SSRC.SOURCE_RESULT_POOL.APPROVAL_TABLE',
        'SSRC.SOURCE_RESULT_POOL.APPROVAL_TABLE_FILTER',
        'SSRC.SOURCE_RESULT_POOL.FINISH_TABLE',
        'SSRC.SOURCE_RESULT_POOL.FINISH_TABLE_FILTER',
        'SSRC.SOURCE_RESULT_POOL.TABS',
        'SSRC.SOURCE_RESULT_POOL.TABLE_ALLOCATE',
      ],
    }),
    withProps(
      () => {
        const pendingDS = new DataSet(
          TableDS({
            selection: 'multiple',
          })
        );

        const approvalDS = new DataSet(TableDS());

        const allDS = new DataSet(
          TableDS({
            idName: 'resultId',
            selection: 'multiple',
          })
        );

        return {
          pendingDS,
          approvalDS,
          allDS,
        };
      },
      { cacheState: true }
    ),
    remote(
      {
        code: 'SSRC_SOURCE_RESULT_POOL',
        name: 'resultPoolRemote',
      },
      {
        events: {},
      }
    )
  )(observer(NewComponent));
};

export default hocComponent(SourceResultPool);
export { hocComponent, SourceResultPool };
