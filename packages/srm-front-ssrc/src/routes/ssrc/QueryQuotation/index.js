/**
 * Recommend - 报价查询-列表
 * @date: 2018-12-25
 * @author: NJQ <jiangqi.nan@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Table, Badge, Popover } from 'hzero-ui';
import { connect } from 'dva';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { dateTimeRender } from 'utils/renderer';

import { queryIndicateData } from '@/services/supplierQutationService';
import { isPubPage, asyncPageFetchList } from '@/utils/utils';
import FilterForm from './FilterForm';
import PretrialApplicationModal from '../SupplierQuotation/PretrialApplicationModal';
import QualRequirementDetailsModal from '../SupplierQuotation/QualRequirementDetailsModal';

const promptCode = `ssrc.queryQuotation`;

@remoteHoc({
  code: 'SSRC_QUERY_QUOTATION_LIST',
  name: 'remote',
})
@connect(({ queryQuotation, loading }) => ({
  queryQuotation,
  Loading: loading.effects['queryQuotation/fetchEntranceList'],
  selectPreApplyLoading: loading.effects['queryQuotation/fetchPretrialApplication'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.queryQuotation', 'ssrc.common'],
})
@withCustomize({
  unitCode: [
    'SSRC.QUERY_QUOTATION.LIST.V2',
    'SSRC_SUPPLIER_PREQUAL.DATA',
    'SSRC.QUERY_QUOTATION.LIST_HEADER',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Supplierquotation extends Component {
  form;

  activeTabKey = getActiveTabKey();

  state = {
    preApplyModalVisible: false,
    prequalOnlyRead: false,
    qualRequirementDetailSource: [], // 资格预审申请-资质要求细项数据
    qualRequirementDetailsVisible: false, // 资格预审申请-资质要求细项弹框是否打开标志
    qualRequirementDetailLoading: false, // 资格预审申请-资质要求细项数据查询loading
  };

  componentDidMount() {
    this.querySupplier();
  }

  /**
   * 供应商报价查询
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      queryQuotation: { supplierEntrancePaging = {} },
    } = this.props;
    this.handleSearch(supplierEntrancePaging);
    const lovCodes = {
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      inquiryMethod: 'SSRC.SOURCE_METHOD', // 询价方式
      biddingDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      rfxStatus: 'SSRC.RFX_STATUS', // 询价单状态
      reviewMethod: 'SSRC.REVIEW_METHOD', // 审查方式
    };
    dispatch({
      type: 'queryQuotation/batchCode',
      payload: { lovCodes },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const formatValue = this.handleFormQuery(formValues);
    const filterValues = {
      ...formatValue,
    };
    return filterValues;
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 点击PFx跳转
   */
  @Bind()
  async onrfxNum(record = {}) {
    const {
      dispatch,
      match: { path = null },
    } = this.props;
    const { rfxHeaderId, supplierCompanyId, quotationHeaderId } = record;
    if (!rfxHeaderId || !supplierCompanyId) {
      return;
    }

    const commonSearchObj = {
      switchUrl: 0,
      quotationHeaderId,
    };

    const search = querystring.stringify(commonSearchObj);
    dispatch(
      routerRedux.push({
        pathname: isPubPage(
          path,
          `/ssrc/query-quotation/detail/${rfxHeaderId}/${supplierCompanyId}`
        ),
        search,
      })
    );
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues = {}) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['quotationStartDateFrom', 'quotationEndDateFrom'];
    const timeToArray = ['quotationStartDateTo', 'quotationEndDateTo'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleSearch(page = {}, pageChangeFlag = false) {
    const {
      dispatch,
      organizationId,
      queryQuotation: { oldTotalElements },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    const commonPayload = {
      page,
      ...handleFormValues,
      organizationId,
      customizeUnitCode: 'SSRC.QUERY_QUOTATION.LIST.V2',
    };
    const fetchEntranceList = (payload) => {
      return dispatch({
        type: 'queryQuotation/fetchEntranceList',
        payload,
      });
    };

    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchEntranceList,
    });
  }

  /**
   * 预审申请数据获取
   * @param {String} rfxHeaderId -询价单头id
   */
  @Bind()
  fetchPretrialApplicationData(rfxHeaderId) {
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'queryQuotation/fetchPretrialApplication',
      payload: {
        organizationId,
        rfxHeaderId,
        prequalCategory: 'RFX',
        customizeUnitCode: 'SSRC_SUPPLIER_PREQUAL.DATA',
      },
    });
  }

  /**
   * 打开资格预审弹框
   * @param {obj} record - table的行记录
   */
  @Bind()
  openPretrialApplicationModal(record) {
    this.setState({
      prequalOnlyRead: true,
      rfxHeaderId: record.rfxHeaderId,
      supplierCompanyId: record.supplierCompanyId,
      preApplyModalVisible: true,
    });
    this.fetchPretrialApplicationData(record.rfxHeaderId);
  }

  // 展示资质要求细项
  /**
   * @param {?boolean} sectionFlag - 区分是否分标段
   */
  @Bind()
  handleShowQualRequirementsDetails(sectionFlag = false) {
    this.setState({
      qualRequirementDetailsVisible: true,
    });
    this.handleQueryIndicateData(sectionFlag);
  }

  /**
   * 查询资质要求细项-要素数据
   */
  @Bind()
  handleQueryIndicateData() {
    const {
      queryQuotation: { fetchPretrialApplicationData = {} },
    } = this.props;
    const { prequalHeaderId = null } = fetchPretrialApplicationData;
    if (prequalHeaderId) {
      this.setState({
        qualRequirementDetailLoading: true,
      });
      queryIndicateData({ prequalHeaderId })
        .then((res) => {
          const result = getResponse(res);
          if (result) {
            this.setState({
              qualRequirementDetailSource: result || [],
            });
          }
        })
        .finally(() => {
          this.setState({
            qualRequirementDetailLoading: false,
          });
        });
    }
  }

  // 关闭资质要求细项弹窗
  @Bind()
  handleCloseQulReqDetailModal() {
    this.setState({
      qualRequirementDetailsVisible: false,
    });
  }

  /** 关闭模态框时清楚model中的数据 */
  @Bind()
  clearPretrialApplicationData() {
    this.setState({ preApplyModalVisible: false, prequalOnlyRead: false });
    this.props.dispatch({
      type: 'queryQuotation/updateState',
      payload: {
        fetchPretrialApplicationData: {},
      },
    });
  }

  render() {
    const {
      Loading,
      organizationId,
      selectPreApplyLoading,
      customizeTable,
      queryQuotation: {
        code,
        dispatch,
        supplierEntranceList = [],
        supplierEntrancePaging = {},
        fetchPretrialApplicationData,
      },
      customizeForm = () => {},
      customizeBtnGroup = () => {},
      remote,
    } = this.props;
    const {
      preApplyModalVisible,
      supplierCompanyId,
      rfxHeaderId,
      prequalOnlyRead,
      qualRequirementDetailSource,
      qualRequirementDetailLoading,
      qualRequirementDetailsVisible,
    } = this.state;
    const pretrialApplicationModalProps = {
      rfxHeaderId,
      supplierCompanyId,
      organizationId,
      selectPreApplyLoading,
      visible: preApplyModalVisible,
      onlyRead: prequalOnlyRead,
      reviewMethodValues: code.reviewMethod,
      // onClear: this.clearPretrialApplicationData,
      onShowQualRequirementsDetails: this.handleShowQualRequirementsDetails,
      onClose: this.clearPretrialApplicationData,
      formData: fetchPretrialApplicationData,
      customizeForm,
    };
    const qualRequirementDetailsProps = {
      dataSource: qualRequirementDetailSource,
      loading: qualRequirementDetailLoading,
      visible: qualRequirementDetailsVisible,
      onChange: this.handleQueryIndicateData,
      onCancel: this.handleCloseQulReqDetailModal,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.queryQuotation.rfxStatus`).d('状态'),
        dataIndex: 'rfxStatusMeaning',
        fixed: 'left',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.RFxNo.`).d('RFx单号'),
        dataIndex: 'rfxNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => <a onClick={() => this.onrfxNum(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.inquiryTitle`).d('询价单标题'),
        dataIndex: 'rfxTitle',
        width: 180,
        fixed: 'left',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.pretrialApplication`).d('预审申请'),
        dataIndex: 'prequalLineStatus',
        width: 110,
        render: (val, record) => {
          const statusMap = {
            NEW: 'default',
            SUBMITED: 'processing',
            REFUSED: 'error',
            APPROVED: 'success',
            NO_APPROVED: 'error',
          };
          if (record.operationMeaning === 'UNPARTICIPATED') {
            return null;
          }
          return (
            <React.Fragment>
              <Badge status={statusMap[val]} />
              <a onClick={() => this.openPretrialApplicationModal(record)}>
                {record.prequalLineStatusMeaning}
              </a>
            </React.Fragment>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.customer`).d('客户'),
        dataIndex: 'companyName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'supplierCompanyName',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.sourcingTemplate`).d('寻源模板'),
        dataIndex: 'templateName',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.sourcingCategory`).d('寻源类别'),
        dataIndex: 'sourceCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.biddingDirection`).d('报价方向'),
        dataIndex: 'auctionDirectionMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.quotationStartDate`).d('报价开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: (val) => {
          return dateTimeRender(val);
        },
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.quotationEndDate`).d('报价截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: (val) => {
          return dateTimeRender(val);
        },
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.currency`).d('币种'),
        dataIndex: 'currencyCode',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.creater`).d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 480);
    const filterProps = {
      remote,
      dispatch,
      code,
      onRef: this.handleRef,
      onConditional: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.quotationInquiry`).d('报价查询')}>
          {customizeBtnGroup({ code: 'SSRC.QUERY_QUOTATION.LIST_HEADER' }, [
            <ExcelExport
              requestUrl={`/ssrc/v1/${organizationId}/rfx/supplier/all/excel`}
              queryParams={this.handleGetFormValue()}
              name="export"
            />,
            <ExcelExportPro
              templateCode="SSRC_OFFER_EXPORT"
              buttonText={`${intl.get('hzero.common.button.export').d('导出')}(New)`}
              requestUrl={`/ssrc/v1/${organizationId}/rfx/supplier/all/excel`}
              queryParams={this.handleGetFormValue()}
              otherButtonProps={{
                permissionList: [
                  {
                    code: `${this.props.match.path}.button.batch-export-new`,
                    type: 'button',
                    meaning:
                      intl
                        .get('ssrc.queryQuotation.view.message.title.quotationInquiry')
                        .d('报价查询') -
                      intl.get('hzero.common.button.priceExportNew').d('(新)批量导出'),
                  },
                ],
              }}
              name="newExport"
            />,
          ])}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SSRC.QUERY_QUOTATION.LIST.V2',
            },
            <Table
              scroll={{ x: scrollWidth }}
              dataSource={supplierEntranceList}
              pagination={supplierEntrancePaging}
              rowKey="recordId"
              loading={Loading}
              columns={columns}
              bordered
              onChange={(page) => this.handleSearch(page, true)}
            />
          )}
          <PretrialApplicationModal {...pretrialApplicationModalProps} />
          {qualRequirementDetailsVisible && (
            <QualRequirementDetailsModal {...qualRequirementDetailsProps} />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
