/**
 * detail - 线下询价结果录入
 * @date: 2019-03-05
 * @author: Nemo <yingbin.jiang@hand-china.com>
 * @version: 1.0.0
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { DataSet, Modal as c7nModal, ModalProvider } from 'choerodon-ui/pro';
import { Form, Row, Col, Collapse, Tabs, Spin, Tag, Modal, Icon, Tooltip } from 'hzero-ui';
import { Bind, Debounce, Throttle } from 'lodash-decorators';
import { isEmpty, filter, isUndefined, noop, isFunction } from 'lodash';
import classnames from 'classnames';
import queryString from 'querystring';
import moment from 'moment';
import { getActiveTabKey } from 'utils/menuTab';
import uuidv4 from 'uuid/v4';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

import remote from 'hzero-front/lib/utils/remote';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import {
  getEditTableData,
  delItemToPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentUserId,
  delItemsToPagination,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import notification from 'utils/notification';
import { FORM_COL_3_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
// import { openTab } from 'utils/menuTab';

import { yesOrNoRender, numberRender, dateTimeRender } from 'utils/renderer';
import { Button as PermissionButton } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import { phoneRender, numberSeparatorRender } from '@/utils/renderer';
import CommonImportNew from 'hzero-front/lib/components/Import';
import ExcelExport from '@/routes/components/ExcelExport';
import CommonImport from '@/routes/himp/CommonImportNew';
import QuotationDetailImport from '@/routes/components/QuotationDetailOfflineImport';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import {
  submitQuoteData,
  saveQuoteLine,
  saveUploadAttachment,
  deleteSupplierDatas,
  getQualificationWarnInfo,
} from '@/services/offlineResultEntryService';
import { INQUIRY, BID, getSourceName, getQuotationName } from '@/utils/globalVariable';
import { queryEnableDoubleUnit, queryH0OrC7N } from '@/services/commonService';
import { PageSourceSymbol } from '@/utils/constants.js';
import { isText, amountCalcType } from '@/utils/utils';
import { operateResponseMessagePrompt } from '@/utils/common.js';

import {
  fetchConfigSheet,
  fetchSourceSupplierRelativeConfig,
} from '@/services/inquiryHallNewService';
import { handleFormDSFieldsValue } from '@/routes/components/Widget/Forms/handleFormDSFieldsValue';
import AttachmentForm from './Attachment';
import ImportExcel from '../../components/ImportExcel';
import BatchAddItems from './BatchAddItems';
import AllQuoteLineTable from './AllQuoteLineTable';
import {
  allQuotationDS,
  attachmentDS,
  SupplierBulkExpiredModalDS,
} from './AllQuotationLineTableDS';
import UploadAttachment from './UploadAttachment';
import SupplierBatchAddExpiredModal from './SupplierBatchAddExpiredModal';
// import Iconfont from '../../components/Icons';
import BatchMaintainItemForm from './BatchMaintainItemForm';
import BatchMaintainItemDS from './BatchMaintainItemDS';

const { Panel } = Collapse;

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const promptCode = 'ssrc.offlineResultEntry';

class Detail extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      quoteLineSelectdRowKeys: [], // 报价明细行选中行key
      batchAddItemVisible: false, // 批量添加物品模态框可见
      batchAddItemSelectedRows: [], // 批量添加物品选中行
      viewLadderLevelVisible: false, // 阶梯报价modal
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      collapseKeys: {}, // 打开的折叠面板key
      visibleImport: false, // excel导入显示控制
      saveOrSubmitLoadding: false, //  保存或者提交時候的loading
      selectRowKeys: [], // 勾选行keys
      selectRows: [], // 勾选行
      doubleUnitFlag: false, // 双单位是否开启标志
      bathEditQuotationLineDTO: {}, // 全量/批量编辑的值
      supplierConfigOldFlag: true, // 配置表“新建供应商”, 老ui
      allowOnlyNameSupplier: false,
      caclRule: null, // 业务规则定义-金额计算方式
      qualificationWarnInfo: null, // 资质到期提示字段对象
      headerGroupButtonMaxNum: -1, // 头按钮默认max_num数目
      showHeaderFileCount: false, // 显示头附件数量配置
    };
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  sourceKeyString = this.sourceKey === BID ? 'BID_' : '';

  bidFlag = this.sourceKey === BID;

  configs = {
    filterDynamicProps: {},
    rfxHeaderId: this.props.match.params.rfxId,
    organizationId: this.props.organizationId,
    userId: this.props.userId,
    sourceKey: this.sourceKey,
    batchUpdateLines: this.batchUpdateLines,
    getBatchUpdateFlag: this.getBatchUpdateFlag,
  };

  allQuotationDS = new DataSet(
    this.props.offlineResultRemote
      ? this.props.offlineResultRemote.process(
          'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_ALL_QUOTATION_DS',
          allQuotationDS(this.configs),
          {
            bidFlag: this.sourceKey === BID,
          }
        )
      : allQuotationDS(this.configs)
  );

  attachmentDs = new DataSet(attachmentDS(this.configs));

  batchMaintainItemDS = new DataSet(
    this.props.offlineResultRemote
      ? this.props.offlineResultRemote.process(
          'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_BATCH_QUOTATION_DS',
          BatchMaintainItemDS(),
          {
            bidFlag: this.sourceKey === BID,
          }
        )
      : BatchMaintainItemDS()
  );

  SupplierBulkExpiredLineDS = new DataSet(SupplierBulkExpiredModalDS()); // 供应商资质到期行Ds

  allEditFlag = -1; // 1:全量编辑，0:批量编辑, -1:

  organizationId = getCurrentOrganizationId();

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
    this.handleQuoteLineList();
    this.queryDoubleUnit();
    this.fetchSupplierLovConfig();
    this.handleSearchConfig();
    this.fetchH0OrC7N();
  }

  @Bind()
  async handleSearchConfig() {
    const { organizationId } = this.props;
    const result = getResponse(
      await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_offline_entry_allows_only_name_suppliers',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      })
    );
    if (result) {
      this.setState({
        allowOnlyNameSupplier: !!result.length,
      });
    }
  }

  // 寻源功能控制黑白名单
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const bargainObj =
        res.find(
          (item) => item.function === 'BUTTON_GROUP_FIVE_BUTTONS' && item.whiteFlag === '1'
        ) || {}; // 议价
      const showFileObj =
        res.find(
          (item) => item.function === 'SHOW_FILE_COUNT_IN_OFFLINERESULTENTRY_EDIT'
        ) || {}; // 显示头附件配置

      this.setState({
        headerGroupButtonMaxNum: !isEmpty(bargainObj) ? 5 : -1,
        showHeaderFileCount: !isEmpty(showFileObj),
      });
    }
  };

  queryDoubleUnit = () => {
    queryEnableDoubleUnit({
      businessModule: 'RFX',
    }).then((res) => {
      if (isText(res)) {
        this.allQuotationDS.setState('doubleUnitFlag', !!Number(res));
        this.setState({
          doubleUnitFlag: !!Number(res),
        });
      }
    });
  };

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.rfxId || null;
    const id = params.rfxId || null;
    return prevId !== id;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.handleSearch();
      this.handleQuoteLineList();
    }
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'offlineResultEntry' } = this.props;

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        header: {},
      },
    });
    dispatch({
      type: 'common/updateState',
      payload: {
        setting: {},
      },
    });

    this.allQuotationDS.reset();
    this.allQuotationDS.loadData();
    if (this.AttachmentFormRef.AttachmentDS) {
      this.AttachmentFormRef.AttachmentDS.reset();
    }

    this.batchAddItemModalClearData();
  }

  // 获取资质到期提醒信息
  @Bind()
  async fetchQualificationWarnInfo() {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    if (!rfxId) return undefined;
    const res = await getQualificationWarnInfo(rfxId);
    if (getResponse(res)) {
      this.setState({ qualificationWarnInfo: res });
    }
  }

  @Bind()
  handleSearch(options = {}) {
    const { dispatch, match, modelName = 'offlineResultEntry' } = this.props;
    const { rfxId } = match.params;
    const { offlineDetailkipQueryTableFlag = false } = options || {};
    // 询价单表头数据

    return dispatch({
      type: `${modelName}/fetchInquiryHeader`,
      payload: {
        rfxHeaderId: rfxId,
        customizeUnitCode: `SSRC.${
          this.sourceKey === BID ? 'BID_' : ''
        }OFFLINE_RESULT_ENTRY.DETAIL.HEADINFO,SSRC.${
          this.sourceKey === BID ? 'BID_' : ''
        }OFFLINE_RESULT_ENTRY.ATTACHMENT_FORM,SSRC.${
          this.sourceKey === BID ? 'BID_' : ''
        }OFFLINE_RESULT_ENTRY.TABS,SSRC.${
          this.sourceKeyString
        }OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE`,
      },
    }).then((res) => {
      if (isEmpty(res)) {
        return;
      }
      /*
       *  ds设置缓存参数基础信息以供二开使用，勿删
       */
      this.allQuotationDS.setState('header', res);
      this.batchMaintainItemDS.setState('header', res);
      // ----------------------------------------
      // 不需要更新表格
      if (!offlineDetailkipQueryTableFlag) {
        this.afterQueryHeader(res);
      }
      if (this.AttachmentFormRef.initDSFields) {
        this.AttachmentFormRef.initDSFields([res]);
      }
    });
  }

  // 永祥二开
  // 头信息查询之后
  afterQueryHeader(res = {}) {
    const { userId = null } = this.props;
    const {
      templateId = null,
      companyId = null,
      rfxHeaderId = null,
      multiCurrencyFlag = false,
      taxChangeFlag = false,
      quantityChangeFlag = null,
      validDateInputType = null,
      tenantId,
      systemVersion,
    } = res || {};

    this.initCalcType({ organizationId: tenantId, supplierFlag: 0 });
    this.allQuotationDS.setQueryParameter('rfxHeader', {
      templateId,
      companyId,
      sourceHeaderId: rfxHeaderId,
      userId,
      multiCurrencyFlag,
      taxChangeFlag,
      quantityChangeFlag,
      validDateInputType,
      systemVersion,
    });
  }

  /**
   * 报价明细 - 查询
   */
  @Bind()
  handleQuoteLineList() {
    const {
      usrId,
      organizationId,
      match: { params },
    } = this.props;
    const { rfxId } = params;

    this.allQuotationDS.setQueryParameter('params', {
      organizationId,
      rfxHeaderId: rfxId,
      usrId,
      customizeUnitCode: `SSRC.${this.sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.LINE`,
    });
    this.allQuotationDS.query();
    this.fetchQualificationWarnInfo();
  }

  renderHeaderTitle(header = null) {
    return (
      <h3 style={{ maxWidth: '90%' }}>
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '85%',
            float: 'left',
          }}
        >
          {header.rfxNum}-
          <Tooltip
            title={`${header.rfxNum}--${header.rfxTitle}`}
            overlayStyle={{ minWidth: '300px' }}
          >
            {header.rfxTitle}
          </Tooltip>
        </span>
        <Tag style={{ marginLeft: '15px', paddingLeft: 'inherit' }}>
          {intl.get(`${promptCode}.model.offlineEntry.round`).d('轮次')}：
          {header.quotationRoundNumber ? header.quotationRoundNumber : 1}
        </Tag>
      </h3>
    );
  }

  initCalcType = async (data = {}) => {
    const result = (await amountCalcType(data)) || [];
    this.setState({ caclRule: result?.[0] });
  };

  // 查询新建供应商新老弹窗配置
  fetchSupplierLovConfig = async () => {
    const { organizationId } = this.props;

    try {
      let result = await fetchConfigSheet({
        organizationId,
        configCode: 'source_supplier_lov_old_config',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      if (isEmpty(result)) {
        this.setState({
          supplierConfigOldFlag: false, // true = old ui, false = new supplier lov ui
        });
      }
    } catch (e) {
      throw e;
    }
  };

  /**
   * 表单头
   */
  renderHeaderForm(tempRfxHeaderDetails) {
    const {
      form = {},
      h0: { customizeForm = () => {} },
    } = this.props;
    const { getFieldDecorator } = form;
    const dataSource = tempRfxHeaderDetails;
    return customizeForm(
      {
        code: `SSRC.${this.sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.DETAIL.HEADINFO`,
        form,
        dataSource,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.offlineEntry.commonSourcingTemplate`, {
                  sourceName: getSourceName(this.sourceKey === BID),
                })
                .d('{sourceName}模板')}
              {...formLayout}
            >
              {getFieldDecorator('templateId', {
                initialValue: dataSource.templateId,
              })(<span>{dataSource.templateName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.sourcingCategory`).d('寻源类别')}
              {...formLayout}
            >
              {getFieldDecorator('sourceCategory', {
                initialValue: dataSource.secondarySourceCategory || dataSource.sourceCategory,
              })(
                <span>
                  {dataSource.secondarySourceCategoryMeaning || dataSource.sourceCategoryMeaning}
                </span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.purchOrgName`).d('采购组织名称')}
              {...formLayout}
            >
              {getFieldDecorator('purOrganizationId', {
                initialValue: dataSource.purOrganizationId,
              })(<span>{dataSource.purOrganizationName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('ssrc.common.company').d('公司')} {...formLayout}>
              {getFieldDecorator('companyName', {
                initialValue: dataSource.companyName,
              })(<span>{dataSource.companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.createdUnitName`).d('创建人部门')}
              {...formLayout}
            >
              {getFieldDecorator('createdUnitName', {
                initialValue: dataSource.createdUnitName,
              })(<span>{dataSource.createdUnitName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.sourcingApproach`).d('寻源方式')}
              {...formLayout}
            >
              {getFieldDecorator('sourceMethod', {
                initialValue: dataSource.sourceMethod,
              })(<span>{dataSource.sourceMethodMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={<QuotationDirectLable />} {...formLayout}>
              {getFieldDecorator('auctionDirection', {
                initialValue: dataSource.auctionDirection,
              })(<span>{dataSource.auctionDirectionMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.budgetAmount`).d('预算金额')}
              {...formLayout}
            >
              {getFieldDecorator('budgetAmount', {
                initialValue: dataSource.budgetAmount,
              })(
                <span>
                  {dataSource.budgetAmount && numberSeparatorRender(dataSource.budgetAmount)}
                </span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.currency`).d('币种')}
              {...formLayout}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: dataSource.currencyCode,
              })(<span>{dataSource.currencyCode}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.exchangeRate`).d('汇率')}
              {...formLayout}
            >
              {getFieldDecorator('exchangeRate', {
                initialValue: dataSource.exchangeRate,
              })(<span>{numberRender(dataSource.exchangeRate, 8, false)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.creationDate`).d('创建时间')}
              {...formLayout}
            >
              {getFieldDecorator('creationDate', {
                initialValue: dataSource.creationDate,
              })(<span>{dateTimeRender(dataSource.creationDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.offlineEntry.commonQuotStartTime`, {
                  quotationName: getQuotationName(this.sourceKey === BID),
                })
                .d('{quotationName}开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: dataSource.quotationStartDate,
              })(<span>{dateTimeRender(dataSource.quotationStartDate)}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                .get(`${promptCode}.model.offlineEntry.commonQuotationDeadLine`, {
                  quotationName: getQuotationName(this.sourceKey === BID),
                })
                .d('{quotationName}截止时间')}
              {...formLayout}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: dataSource.quotationEndDate,
              })(<span>{dateTimeRender(dataSource.quotationEndDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.sourcingType`).d('寻源类型')}
              {...formLayout}
            >
              {getFieldDecorator('sourceType', {
                initialValue: dataSource.sourceType,
              })(<span>{dataSource.sourceTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.paymentTerms`).d('付款方式')}
              {...formLayout}
            >
              {getFieldDecorator('paymentTypeId', {
                initialValue: dataSource.paymentTypeId,
              })(<span>{dataSource.paymentTypeName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.priceCategory`).d('价格类型')}
              {...formLayout}
            >
              {getFieldDecorator('priceCategory', {
                initialValue: dataSource.priceCategory,
              })(<span>{dataSource.priceCategoryMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.createRfxAnnot`).d('创建寻源公告')}
              {...formLayout}
            >
              {getFieldDecorator('sourceAnnouncementFlag', {
                initialValue: dataSource.sourceAnnouncementFlag,
              })(<span>{yesOrNoRender(dataSource.sourceAnnouncementFlag)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...formLayout}
            >
              {getFieldDecorator('purchaserId', {
                initialValue: dataSource.purchaserId,
              })(<span>{dataSource.purchaserName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.quotationType`).d('报价方式')}
              {...formLayout}
            >
              {getFieldDecorator('quotationType', {
                initialValue: dataSource.quotationType,
              })(<span>{dataSource.quotationTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${promptCode}.model.offlineEntry.remarks`).d('备注')}
              {...formLayout}
            >
              {getFieldDecorator('rfxRemark', {
                initialValue: dataSource.rfxRemark,
              })(<span>{dataSource.rfxRemark}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间')}
              {...formLayout}
            >
              {getFieldDecorator('sourceCreationDate', {
                initialValue: dataSource.sourceCreationDate,
              })(<span>{dateTimeRender(dataSource.sourceCreationDate)}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(records = {}) {
    const record = records.toData() || {};
    const taxIncludedFlag = records.get('taxIncludedFlag');
    const taxRate = records.get('taxRate');
    const quotationHeaderId = records.get('quotationHeaderId');
    const {
      itemCode,
      itemName,
      rfxLineItemId,
      quotationLineId,
      itemId,
      secondaryUomId,
      uomId,
    } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        ...record,
        taxRate,
        itemId,
        itemCode,
        itemName,
        uomId,
        secondaryUomId,
        rfxLineItemId,
        quotationLineId,
        taxIncludedFlag,
      },
    });
    const { dispatch, modelName = 'offlineResultEntry' } = this.props;
    dispatch({
      type: `${modelName}/queryQuotationHeader`,
      payload: { quotationHeaderId },
    });
    dispatch({
      type: `${modelName}/fetchLadderList`,
      payload: { quotationLineId: record.quotationLineId },
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.allQuotationDS.query(); // 刷新数据
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ladderLevelData: [],
      },
    });
  }

  // 保存阶梯报价(能新建，能输入，能删除的)
  @Debounce(800)
  @Bind()
  haeSaveData() {
    const {
      modelName = 'offlineResultEntry',
      [modelName]: { fetchLadderList = [] },
      dispatch,
    } = this.props;
    const { LadderLevelHeaderData, selectRowKeys } = this.state;
    const newParams = getEditTableData(fetchLadderList, ['ladderQuotationId']);
    if (!isEmpty(newParams)) {
      const params = newParams.map((item, index) => {
        return {
          ...item,
          rfxLadderLineNum: index + 1,
        };
      });
      if (!isEmpty(params)) {
        dispatch({
          type: `${modelName}/saveLadderList`,
          payload: {
            params,
            query: { synCurrentFlag: 1 },
            quotationLineId: LadderLevelHeaderData.quotationLineId,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch({
              type: `${modelName}/updateState`,
              payload: {
                fetchLadderList: [],
              },
            });
            dispatch({
              type: `${modelName}/fetchLadderList`,
              payload: {
                quotationLineId: LadderLevelHeaderData.quotationLineId,
              },
            });
            if (!isEmpty(selectRowKeys)) {
              this.setState({
                selectRows: [],
                selectRowKeys: [],
              });
            }
          }
        });
      }
    }
  }

  // 保存阶梯报价(只有保存)
  @Bind()
  onlySaveData() {
    const {
      modelName = 'offlineResultEntry',
      [modelName]: { fetchLadderList = [] },
      dispatch,
    } = this.props;
    const { LadderLevelHeaderData } = this.state;
    const params = getEditTableData(fetchLadderList, ['ladderQuotationId']);
    if (!isEmpty(params)) {
      dispatch({
        type: `${modelName}/saveLadderList`,
        payload: {
          params,
          query: { synCurrentFlag: 1 },
          quotationLineId: LadderLevelHeaderData.quotationLineId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              fetchLadderList: [],
            },
          });
          dispatch({
            type: `${modelName}/fetchLadderList`,
            payload: {
              quotationLineId: LadderLevelHeaderData.quotationLineId,
            },
          });
        }
      });
    }
  }

  @Bind()
  handlePageChange(page) {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      [modelName]: { quoteListChange = false },
    } = this.props;
    if (quoteListChange) {
      Modal.confirm({
        title: intl
          .get(`${promptCode}.model.offlineEntry.changePageTip`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchItemLine(page);
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              quoteListChange: false,
            },
          });
        },
      });
    } else {
      this.handleQuoteLineList(page);
    }
  }

  /**
   * 报价明细-表格内容改变
   */
  @Bind()
  handleChangeLineData() {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      [modelName]: { quoteListChange = false },
    } = this.props;
    if (!quoteListChange) {
      dispatch({
        type: 'quoteListChange/updateState',
        payload: {
          quoteListChange: true,
        },
      });
    }
  }

  /**
   * FilterForm绑定到这里
   * @param {form} form
   */
  @Bind()
  bindForm(form) {
    this.allQuoteForm = form;
  }

  /**
   * 此方法被 [永祥] 二开, 禁止修改
   * @protected
   * 报价明细－勾选删除
   * */
  @Bind()
  async onDeleteLine() {
    const { cachedCreated, selected = null } = this.allQuotationDS || {};
    const selecteds = selected || [];
    if (isEmpty(selecteds)) {
      return;
    }

    const allNewLines = this.allQuotationDS.filter((item) => !(item.data || {}).quotationLineId);
    const remoteDelete = selecteds.filter((item) => (item.data || {}).quotationLineId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).quotationLineId);

    const deleteLines = async (data = [], messageFlag = true) => {
      try {
        await this.allQuotationDS.delete(data, messageFlag);
        this.fetchQualificationWarnInfo();
      } catch (e) {
        throw e;
      }
    };

    if (!isEmpty(remoteDelete)) {
      if (!isEmpty(allNewLines) || !isEmpty(cachedCreated)) {
        c7nModal.open({
          destroyOnClose: true,
          closable: true,
          key: c7nModal.key(),
          title: intl.get('hzero.common.view.message.deleteConfirm').d('是否删除'),
          children: intl
            .get(`ssrc.common.view.title.deleteLinesWillLostNewLines`)
            .d('操作删除后，新增未保存的数据将被清空，建议保存后再进行删除操作'),
          onOk: () => {
            deleteLines(remoteDelete, false);
            this.allQuotationDS.remove(localDelete);
          },
          okText: intl.get('hzero.common.button.delete').d('删除'),
        });
      } else {
        deleteLines(remoteDelete);
      }
    } else {
      this.allQuotationDS.remove(localDelete);
    }
  }

  /**
   * 报价明细行 - 批量删除
   */
  @Bind()
  deleteQuoteLines() {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      [modelName]: { quoteList = [], quoteListPagination = {} },
      organizationId,
    } = this.props;
    const { quoteLineSelectdRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(quoteList, (item) => {
      return quoteLineSelectdRowKeys.indexOf(item.quotationLineId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newItemDetails = filter(quoteList, (item) => {
      return quoteLineSelectdRowKeys.indexOf(item.quotationLineId) < 0;
    });
    const remoteDelete = [];
    const localDelete = [];
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              quoteList: newItemDetails,
              quoteListPagination: delItemToPagination(quoteList.length, quoteListPagination),
            },
          });
          this.setState({ quoteLineSelectdRowKeys: [] });
        } else {
          dispatch({
            type: `${modelName}/deleteQuoteLines`,
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: `${modelName}/updateState`,
                payload: {
                  quoteList: newItemDetails,
                  quoteListPagination: delItemsToPagination(
                    newParameters.length,
                    quoteList.length,
                    quoteListPagination
                  ),
                },
              });
              this.setState({ quoteLineSelectdRowKeys: [] });
              this.handleQuoteLineList();
            }
          });
        }
      },
    });
  }

  /**
   * 打开-批量添加物品模态框，并且查询数据
   */
  @Bind()
  openBatchAddItemModal() {
    this.setState({
      batchAddItemVisible: true,
    });
    this.handleItemList();
  }

  form;

  lineRef;

  AttachmentFormRef = {};

  /**
   * 设置Form
   * @param {object} ref - BatchAddItems组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 物料行ref
   * */
  @Bind()
  handleBindLineRef(node = {}) {
    this.lineRef = node;
  }

  /**
   * 附件模块ref
   * */
  @Bind()
  getAttachmentFormRef(ref) {
    this.AttachmentFormRef = ref || {};
  }

  batchAddItemModalClearData = () => {
    const { dispatch, modelName = 'offlineResultEntry' } = this.props;

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        itemList: [],
        itemListPagination: {},
      },
    });
  };

  /**
   * 取消-关闭批量添加物品模态框
   */
  @Bind()
  closeBatchAddItemModal() {
    this.setState({
      batchAddItemVisible: false,
      batchAddItemSelectedRows: [],
    });

    this.batchAddItemModalClearData();
  }

  @Bind()
  handleItemList(page = {}, queryParams = {}) {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      match: { params },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: `${modelName}/fetchItemList`,
      payload: {
        page,
        ...fieldValues,
        ...queryParams,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${
          this.sourceKey === BID ? 'BID_' : ''
        }OFFLINE_RESULT_ENTRY.BATCH_ADD_QUOTATION`,
      },
    });
  }

  /**
   * 批量添加数据-handleAddItem
   * @protected 济民可信二开，严禁随意改动此方法名
   */
  @Bind()
  handleAddItem() {
    const {
      modelName = 'offlineResultEntry',
      organizationId,
      match: { params = {} },
      [modelName]: { header = {} },
      offlineResultRemote,
    } = this.props;
    const { batchAddItemSelectedRows = [] } = this.state;
    const { currencyCode: headerCurrencyCode = null } = header;

    if (!isEmpty(batchAddItemSelectedRows)) {
      batchAddItemSelectedRows.forEach((item = {}, index) => {
        const { currencyCode = null, currencyDefaultPrecision = null } = item;

        const news = {
          ...item,
          attachmentUuid: null,
          rfxHeaderId: params.rfxId,
          suggestedFlag: 0,
          specs: item.specs,
          rfxLineItemId: item.rfxLineItemId,
          rfxLineItemNum: item.rfxLineItemNum,
          tenantId: organizationId,
          itemCategoryId: item.itemCategoryId, // 物品分类ID
          itemCategoryName: item.itemCategoryName, // 物品分类
          itemId: item.itemId, // 物品id
          itemCode: item.itemCode, // 物料编码
          itemName: item.itemName, // 物品描述
          uomId: item.uomId, // 基本单位id
          uomName: item.uomName, // 基本单位
          secondaryUomId: item.secondaryUomId, // 单位id
          secondaryUomName: item.secondaryUomName, // 单位
          ouId: item.ouId, // 业务实体id
          ouName: item.ouName, // 业务实体
          invOrganizationId: item.invOrganizationId, // 库存组织id
          invOrganizationName: item.invOrganizationName, // 库存组织
          supplierCompanyId: null, // 供应商id
          supplierCompanyNum: null, // 供应商编码
          supplierCompanyName: null, // 供应商编码
          currentQuotationPrice: null, // 单价
          ladderInquiryFlag: item.ladderInquiryFlag, // 阶梯报价需变更
          taxIncludedFlag: item.taxIncludedFlag, // 含税标识
          taxId: item.taxId, // 税率（%）
          taxRate: item.taxRate, // 税率（%）
          rfxQuantity: item.rfxQuantity, // 需求数量
          secondaryQuantity: item.secondaryQuantity, // 基本数量
          currentQuotationSecQuantity: item.secondaryQuantity, // 可供数量
          currentQuotationQuantity: item.rfxQuantity, // 基本可供数量
          quotedDate: null, //  报价时间
          quotationStartDate: item.quotationStartDate, // 开始时间
          quotationEndDate: item.quotationEndDate, // 结束时间
          currentQuotationRemark: null, // 报价说明
          paymentTypeName: item.paymentTypeName,
          paymentTypeId: item.paymentTypeId,
          paymentTermId: item.paymentTermId,
          paymentTerm: item.paymentTerm,
          minLimitPrice: item.minLimitPrice, // 最低限价
          maxLimitPrice: item.maxLimitPrice, // 最高限价
          costPrice: item.costPrice, // 成本单价
          currentPromisedDate: null, // 承诺交货期
          currentDeliveryCycle: null, // 供货周期
          currentExpiryDateFrom: item.validExpiryDateFrom, // 报价有效期从
          currentExpiryDateTo: item.validExpiryDateTo, // 报价有效期至
          allottedQuantity: null, // 分配数量
          minPurchaseQuantity: null, // 最小采购量
          minPackageQuantity: null, // 最小包装量
          freightIncludedFlag: item.freightIncludedFlag, // 是否含运费
          prNum: item.prNum, // 采购申请号
          requestLineNumber: item.requestLineNumber, // 采购申请行号
          priceBatchQuantity: item.batchPrice || null, // 价格批量
          prHeaderId: item.prHeaderId,
          prSourcePlatform: item.prSourcePlatform,
          quotationCurrencyCode: currencyCode || headerCurrencyCode,
          quotationCurrencyDefaultPrecision: currencyDefaultPrecision || 6,
          _status: 'create',
        };

        this.allQuotationDS.create(
          offlineResultRemote
            ? offlineResultRemote.process(
                'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_BATCH_CREATE',
                news,
                {
                  bidFlag: this.sourceKey === BID,
                  item,
                }
              )
            : news,
          index
        );
      });

      this.closeBatchAddItemModal();
      this.forceUpdate();
    }
  }

  // get batch update symbol and data
  @Bind()
  getBatchUpdateFlag() {
    const { batchMaintainDTO = {} } = this.state;

    return {
      batchEditQuotationLineDTO: batchMaintainDTO,
      allEditFlag: this.allEditFlag,
    };
  }

  /**
   * 更行行数据值
   * record - current line
   * dsCurrentFields current field obj
   * data object 批量更新数据
   * */
  updateCommonLineValue = ({ record, dsCurrentFiels, data = {} }) => {
    const { offlineResultRemote } = this.props;
    const { name } = dsCurrentFiels || {};
    const currentField = record.getField(name);

    if (!currentField) {
      return;
    }

    // 行上如果字段不能编辑，批量编辑不更新值
    const disabledFlag = currentField?.get('disabled');
    const readOnlyFlag = currentField?.get('readOnly');
    // supplierCompanyName 在禁用逻辑下也允许批量编辑
    const disabledBatchFlag = disabledFlag || readOnlyFlag;
    if (disabledBatchFlag) {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(data, name)) {
      let remoteAssignmentResult = false; // 二开赋值，如果二开中符合条件返回true跳过下面的处理，否则，返回false继续走下面的处理
      if (offlineResultRemote) {
        // 批量编辑 - 对行字段进行逐一赋值二开处理
        remoteAssignmentResult = offlineResultRemote.process(
          'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_BATCH_UPDATE_LINE_FIELD_ASSIGNMENT',
          false,
          {
            name,
            record,
            data,
          }
        );
      }
      if (remoteAssignmentResult) {
        return;
      }

      record.set(name, data[name]);

      // if (name === 'taxId' || name === 'taxRate') {
      //   const taxLovField = record.getField('taxLov');
      //   const taxLovDisabledFlag = taxLovField?.get('disabled');
      //   const taxLovReadOnlyFlag = taxLovField?.get('readOnly');
      //   const taxLovDisabledBatchFlag = taxLovDisabledFlag || taxLovReadOnlyFlag;
      //   if (taxLovDisabledBatchFlag) {
      //     return;
      //   }
      //   record.set('taxLov', data[name]);
      // } else {
      //   record.set(name, data[name]);
      // }
    }
  };

  /**
   * 批量更新报价行
   */
  @Bind()
  batchUpdateLines(lineDS = {}, batchDto = {}, allEditFlag = 0) {
    if (isEmpty(batchDto)) {
      // 批量维护表单数据
      return;
    }
    const { fields = [] } = lineDS || {};
    const dsAllFields = fields.toJS() || []; // ds all fields
    const { supplierCompanyNum: supplierCompanyNumOfBatch } = batchDto || {};

    /**
     * update value
     * dataList DataSet[] 需要更新的行数据
     * dsCurrentFiels Fields
     */
    const updateDSFieldsValue = ({ dataList = [], dsCurrentFiels = {} }) => {
      if (isEmpty(dataList) || isEmpty(dsCurrentFiels)) {
        return;
      }

      dataList.forEach((record = {}) => {
        const { quotationLineId, supplierCompanyNum } = record.get([
          'supplierCompanyNum',
          'quotationLineId',
          'supplierType',
        ]);

        const newLineOrEmptySupplierNumFlag =
          !quotationLineId || (quotationLineId && !supplierCompanyNum); // 可以修改供应商的行 - 新建行，非新建行但是没供应商编码
        const updateSupplierDataFlag = supplierCompanyNumOfBatch && newLineOrEmptySupplierNumFlag; // 需要更新所有包括供应商数据，如果为否，需要将供应商数据剔除出去
        if (updateSupplierDataFlag) {
          const supplierCompanyIdFields = record.getField('supplierCompanyNumLov');
          const supplierCompanyIdDisabledFlag = supplierCompanyIdFields?.get('disabled');
          const supplierCompanyIdReadOnlyFlag = supplierCompanyIdFields?.get('readOnly');
          const unSupplierData = {};
          let supplierKeys = [];
          if (
            batchDto.supplierCompanyId &&
            (supplierCompanyIdDisabledFlag || supplierCompanyIdReadOnlyFlag)
          ) {
            supplierKeys = [
              'supplierId',
              'supplierName',
              'supplierNum',
              'supplierCompanyNum',
              'supplierCompanyId',
              'supplierCompanyNumLov',
              'contactName',
              'contactMobilephone',
              'supplierType',
              'contactMail',
              'internationalTelCode',
              'supplierCompanyName',
            ];
          }
          Object.keys(batchDto).forEach((dataKey) => {
            if (supplierKeys.includes(dataKey)) {
              return; // 如果供应商相关字段不允许修改，需要剔除相关字段
            }
            unSupplierData[dataKey] = batchDto[dataKey];
          });
          this.updateCommonLineValue({ record, dsCurrentFiels, data: unSupplierData });
        } else {
          const willUpdateSupplierData = {};
          const supplierLovKeys = [
            'supplierId',
            'supplierName',
            'supplierNum',
            'supplierCompanyNum',
            'supplierCompanyId',
            'supplierCompanyNumLov',
          ];
          const supplierOtherKeys = [
            // 'contactName',
            // 'contactMobilephone',
            'supplierType',
            // 'contactMail',
            // 'internationalTelCode',
            'supplierCompanyName',
          ];

          // 如果允许修改供应商数据，如果批量维护
          // 1，没有维护供应商编码或者若本地供应商，允许修改lov之外的数据，比如联系人，邮箱
          // 2. 维护了供应商编码，允许修改所有供应商数据
          let supplierKeys =
            newLineOrEmptySupplierNumFlag && !supplierCompanyNumOfBatch
              ? supplierLovKeys
              : [...supplierLovKeys, ...supplierOtherKeys];

          // 供应商编码批量编辑后，行上的供应商编码不可编辑时，其他所选供应商带出的字段同样不予赋值
          const supplierCompanyIdFields = record.getField('supplierCompanyNumLov');
          const supplierCompanyIdDisabledFlag = supplierCompanyIdFields?.get('disabled');
          const supplierCompanyIdReadOnlyFlag = supplierCompanyIdFields?.get('readOnly');
          if (
            batchDto.supplierCompanyId &&
            (supplierCompanyIdDisabledFlag || supplierCompanyIdReadOnlyFlag)
          ) {
            const supplierOtherLinkedKeys = [
              'contactName',
              'contactMobilephone',
              'supplierType',
              'contactMail',
              'internationalTelCode',
              'supplierCompanyName',
            ];
            supplierKeys = [...supplierKeys, ...supplierOtherLinkedKeys];
          }

          Object.keys(batchDto).forEach((dataKey) => {
            if (supplierKeys.includes(dataKey)) {
              return; // 如果供应商相关字段不允许修改，需要剔除相关字段
            }

            willUpdateSupplierData[dataKey] = batchDto[dataKey];
          });

          this.updateCommonLineValue({ record, dsCurrentFiels, data: willUpdateSupplierData });
        }
      });
    };

    for (const [index] of dsAllFields) {
      const dsCurrentFiels = lineDS.getField(index);
      if (allEditFlag === 1) {
        updateDSFieldsValue({ dataList: lineDS, dsCurrentFiels });
        updateDSFieldsValue({ dataList: lineDS?.cachedCreated, dsCurrentFiels });
      }

      if (allEditFlag === 0) {
        updateDSFieldsValue({ dataList: lineDS?.selected, dsCurrentFiels });
      }
    }

    const { dynamicChangePrice } = this.lineRef || {};
    const updateLineFlag = this.updateLinesPirceAndAmountFlag(batchDto);

    runInAction(() => {
      lineDS.forEach((record = {}) => {
        if (updateLineFlag && isFunction(dynamicChangePrice)) {
          dynamicChangePrice(record); // 重新计算行价,格金额
        }
      });
    });
  }

  /**
   * 判断行需要重新计算行价格 or 金额
   * @param batchDto object 批量维护表单数据
   *
   * TODO
   * 批量编辑，行都触发重新计算逻辑，消耗一部分性能
   * 后期改造计划，批量编辑中，筛选如有影响价格或金额的字段值存在，才去触发计算，
   * 比如数量，单价，税率，是否含税，还有双单位逻辑......
   * */
  updateLinesPirceAndAmountFlag = (batchDto = {}) => {
    const flag = true;
    if (isEmpty(batchDto)) {
      return false;
    }

    return flag;
  };

  // after save, fetch data and update line
  @Bind()
  async updateQuotationLine() {
    const { batchMaintainDTO = {} } = this.state;

    await this.allQuotationDS.query();
    this.batchUpdateLines(this.allQuotationDS, batchMaintainDTO, this.allEditFlag);
  }

  // 批量维护 reset状态
  @Bind()
  resetBatchMainRecord() {
    this.allEditFlag = -1;
    this.setState({ batchEditQuotationLineDTO: {}, batchMaintainDTO: {} });
    this.allQuotationDS.unSelectAll();
    this.allQuotationDS.clearCachedSelected();
  }

  // validate ds upload process
  getRecordAttachmentUploadErrors = (currentDS) => {
    let uploadValidateFlag = true;

    if (!currentDS) {
      return uploadValidateFlag;
    }

    const errorList = currentDS.getValidationErrors();
    if (isEmpty(errorList)) {
      return uploadValidateFlag;
    }

    const attachmentValidateObj =
      errorList[0]?.errors[0]?.errors?.filter(
        (item) => item.ruleName === 'attachmentError' || item.ruleName === 'valueMissing'
      )[0] || {};

    const { $validationMessage, injectionOptions } = attachmentValidateObj || {};
    let message = $validationMessage;

    if (message) {
      const mathVariable = $validationMessage.match(/.*{*}/);

      if (!isEmpty(injectionOptions) && !isEmpty(mathVariable)) {
        Object.keys(injectionOptions).forEach((key) => {
          const currentValue = injectionOptions[key];
          if (typeof $validationMessage === 'string') {
            message = $validationMessage.replace(`{${key}}`, currentValue);
          }
        });
      }
    }

    if (message) {
      notification.error({ message });
      uploadValidateFlag = false;
    }

    return uploadValidateFlag;
  };

  lockSaveOrSubmit = false; // 保存或者提交 锁 （解决loading问题）

  /**
   * 保存
   */
  @Bind()
  @Throttle(1200)
  async saveQuoteData(changePageFlag, options = {}) {
    const {
      c7n: { custTable = () => {} },
      match = {},
    } = this.props;
    if (this.lockSaveOrSubmit) return;
    const { rfxId } = match.params || {};
    const { page } = options || {};
    this.allQuotationDS.forEach((record) => {
      record.set('status', 'update');
    });

    const enableFlag = await this.allQuotationDS.validate();
    if (!enableFlag) {
      const uploadValidateFlag = await this.getRecordAttachmentUploadErrors(this.allQuotationDS);
      if (!uploadValidateFlag) {
        return;
      }
      await this.getValidateContent();
      return;
    }

    const { selected = null, unSelected = null } = this.allQuotationDS;
    const { batchEditQuotationLineDTO = {} } = this.state;
    const selectedData = !isEmpty(selected) ? selected : [];
    const unSelectedData = !isEmpty(unSelected) ? unSelected : [];
    const allData = [...selectedData, ...unSelectedData];

    const news = allData.map((lineRecord = {}) => {
      if (!lineRecord) {
        return;
      }

      const data = lineRecord.toData();
      const supplierCompanyName = lineRecord.get('supplierCompanyName');
      // data.currentExpiryDateFrom = dateFormate(data.currentExpiryDateFrom, DATETIME_MIN);
      // data.currentExpiryDateTo = dateFormate(data.currentExpiryDateTo, DATETIME_MAX);
      data.supplierCompanyName =
        typeof supplierCompanyName === 'object'
          ? supplierCompanyName.supplierCompanyName
          : supplierCompanyName;
      return data;
    });
    this.lockSaveOrSubmit = true;
    this.setState({
      saveOrSubmitLoadding: true,
    });
    try {
      const params = {
        rfxHeaderId: rfxId,
        allEditFlag: this.allEditFlag,
        quotationLineDTOList: news,
        batchEditQuotationLineDTO,
        customizeUnitCode: `SSRC.${
          this.sourceKey === BID ? 'BID_' : ''
        }OFFLINE_RESULT_ENTRY.LINE,SSRC.${
          this.sourceKeyString
        }OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE`,
      };
      let result = await this.CuxSaveQuoteLine(params);
      result = operateResponseMessagePrompt({
        res: result,
      });
      if (result) {
        await this.handleSearch();
        await this.allQuotationDS.query(page);
        this.resetBatchMainRecord();
        this.fetchQualificationWarnInfo();

        if (!changePageFlag) {
          const uploadAProps = {
            tableDs: this.attachmentDs,
            onRef: (node) => {
              this.uploadAttachment = node;
            },
            custTable,
            code: `SSRC.${this.sourceKeyString}OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE`,
          };
          c7nModal.open({
            key: c7nModal.key(),
            title: intl.get(`${promptCode}.view.title.uploadAttachments`).d('上传附件'),
            children: <UploadAttachment {...uploadAProps} />,
            style: { width: '60%' },
            onOk: async () => {
              if (!this.attachmentDs) {
                return false;
              }

              this.attachmentDs.forEach((itemLine = {}) => {
                itemLine.set('status', 'update');
              });
              const attachmentTableValidate = await this.attachmentDs.validate();
              if (!attachmentTableValidate) {
                const uploadValidateFlag = await this.getRecordAttachmentUploadErrors(
                  this.attachmentDs
                );
                if (!uploadValidateFlag) {
                  return false;
                }
              }

              try {
                const newData = this.attachmentDs.toData();
                const res = getResponse(
                  await saveUploadAttachment({
                    newData,
                    customizeUnitCode: `SSRC.${this.sourceKeyString}OFFLINE_RESULT_ENTRY.LINE,SSRC.${this.sourceKeyString}OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE`,
                  })
                );
                if (res && !res.failed) {
                  notification.success();
                  this.allQuotationDS.query(page);
                } else {
                  return false;
                }
              } catch (e) {
                throw e;
              }
            },
            onCancel: () => this.attachmentDs.loadData([]),
            onClose: () => {
              this.handleSearch({
                offlineDetailkipQueryTableFlag: true,
              });
            },
          });

          this.attachmentDs.setQueryParameter('commons', {
            customizeUnitCode: `SSRC.${this.sourceKeyString}OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE`,
          });
          // 查询Modal页数据
          this.attachmentDs.query();
        } else {
          // notification.success({
          //   message,
          // });
          // eslint-disable-next-line no-lonely-if
          if (changePageFlag !== true) {
            this.updateQuotationLine();
          }
        }
      }
      this.lockSaveOrSubmit = false;
      this.setState({
        saveOrSubmitLoadding: false,
      });
    } catch (e) {
      this.lockSaveOrSubmit = false;
      this.setState({
        saveOrSubmitLoadding: false,
      });
      throw e;
    }
  }

  /**
   * 保存接口二开
   * @protected （永祥二开）禁止修改、删除此方法名
   */
  CuxSaveQuoteLine(params) {
    return saveQuoteLine(params);
  }

  /**
   * 提交接口二开
   * @protected （永祥二开）禁止修改、删除此方法名
   */
  async CuxSubmitQuoteData(params = {}) {
    return submitQuoteData(params);
  }

  /**
   * 提交成功后跳转
   * @protected （永祥二开）禁止修改、删除此方法名
   */
  afterSuccessSubmit() {
    const {
      history,
      match,
      modelName = 'offlineResultEntry',
      [modelName]: { header = {} },
    } = this.props;
    const { rfxId } = match.params;
    notification.success();
    if (
      Number(header.toCheckFlag) &&
      header.quotationEndDate &&
      moment().isAfter(header.quotationEndDate)
    ) {
      history.push({
        pathname: `${getActiveTabKey()}/check-price/${rfxId}`,
        search: queryString.stringify({ back: 'offline' }),
      });
    } else {
      history.push({ pathname: `${getActiveTabKey()}/list` });
    }
  }

  // 删除供应商行数据
  @Bind()
  async handleDeleteSupplierData(datas) {
    const res = await deleteSupplierDatas(datas);
    if (getResponse(res)) {
      // 重新刷新行数据
      this.allQuotationDS.query();
      // 重新获取资质过期提示信息
      this.fetchQualificationWarnInfo();
      return true;
    }
    return false;
  }

  /**
   * 铺平供应商资质到期提醒数据
   */
  @Bind()
  renderDataSource(dataSource) {
    const arrayItem = [];
    const attachmentsItem = dataSource.map((item) => {
      const { expirAttachmentsDtos = [], ...otherItem } = item;
      if (expirAttachmentsDtos && expirAttachmentsDtos.length) {
        const attachmentsElement = expirAttachmentsDtos.map((element, index) => {
          return {
            index: `${otherItem.supplierCompanyId}#${index}`, // 用作唯一主键
            ...otherItem,
            ...element,
            supplierCompanyId: otherItem.supplierCompanyId,
          };
        });
        return attachmentsElement;
      } else {
        return otherItem;
      }
    });
    attachmentsItem.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    return arrayItem;
  }

  // 资质弹窗内容渲染
  @Bind()
  renderQualificationExpir(qualifyExpiredData) {
    const { offlineResultRemote } = this.props;
    const { checkValue } = qualifyExpiredData || {};
    const { expired } = checkValue || {};
    if (!expired?.length) return false;
    // 解析数据
    let flatData = [];
    const supplierAttachments = expired.filter((item) => item.expirAttachmentsDtosLen);
    if (!isEmpty(supplierAttachments)) {
      flatData = this.renderDataSource(expired);
    }
    // 加载资质到期行数据
    this.SupplierBulkExpiredLineDS.loadData(flatData);
    const supplierExpiredProps = {
      remoteBox: offlineResultRemote,
      organizationId: this.organizationId,
      supplierBulkExpiredModalDS: this.SupplierBulkExpiredLineDS,
      tip: intl
        .get('ssrc.inquiryHall.view.offLineQualificationWarning')
        .d('以下供应商在供应商360资质认证已到期，无法提交报价，请确认是否删除对应的报价行！'),
      selectionMode: 'none',
    };

    const deleteSupplierData = expired.map((item) => {
      const { sourceHeaderId, sourceLineSupplierId } = item;
      return {
        rfxHeaderId: sourceHeaderId,
        rfxLineSupplierId: sourceLineSupplierId,
      };
    });

    c7nModal.open({
      destroyOnClose: true,
      key: c7nModal.key(),
      title: intl.get('ssrc.inquiryHall.view.title.tips').d('提示'),
      children: <SupplierBatchAddExpiredModal {...supplierExpiredProps} />,
      style: { width: '800px' },
      bodyStyle: { maxHeight: 400 },
      onOk: () => this.handleDeleteSupplierData(deleteSupplierData),
    });
  }

  // 校验具体字段
  @Bind()
  async getValidateContent() {
    let errorInfoStr = intl
      .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
      .d('校验不通过');
    const originAllErrorInfos = await this.allQuotationDS.getValidationErrors();
    const sortAllErrorInfos = originAllErrorInfos?.sort((a, b) => {
      return b?.errors.length - a?.errors.length;
    });

    const uploadValidateObj = { errorFlag: false };
    if (sortAllErrorInfos.length > 0) {
      const errorInfos = sortAllErrorInfos[0].errors;
      if (!isEmpty(errorInfos)) {
        errorInfoStr = errorInfos?.reduce((prev, cur, index) => {
          const currentPrev = prev || '';
          const curArr = Array.prototype.slice.call(cur?.errors);
          const attachmentValidateObj =
            curArr?.filter((item) => item.ruleName === 'attachmentError')[0] || {};

          const message = attachmentValidateObj.$validationMessage;
          if (message) {
            uploadValidateObj.message = message;
            uploadValidateObj.errorFlag = true;
          }

          if (index < errorInfos.length - 1 && curArr[0]?.injectionOptions) {
            const currentLable = curArr[0]?.injectionOptions?.label || '';
            return `${currentPrev + currentLable} `;
          } else if (curArr[0]?.injectionOptions) {
            const currentLable = curArr[0]?.injectionOptions?.label || '';
            return `${currentPrev + currentLable} ${intl
              .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
              .d('校验不通过')}`;
          } else {
            return intl
              .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
              .d('校验不通过');
          }
        }, '');
      }
    }

    if (uploadValidateObj?.errorFlag) {
      notification.warning({
        message: uploadValidateObj?.message,
      });
      return;
    }

    notification.warning({
      message: errorInfoStr,
    });
  }

  /**
   * 提交
   * @param {*} otherProps 控制强弱管控
   */
  @Bind()
  @Throttle(1200)
  async submitQuoteData(otherProps) {
    const {
      modelName = 'offlineResultEntry',
      [modelName]: { header = {} },
      dispatch,
      match = {},
    } = this.props;
    const { rfxId } = match.params || {};
    this.allQuotationDS.forEach((record) => {
      record.set('status', 'update');
    });
    const enableFlag = await this.allQuotationDS.validate();

    if (!enableFlag) {
      let errorInfoStr = '';
      const originAllErrorInfos = await this.allQuotationDS.getValidationErrors();
      const sortAllErrorInfos = originAllErrorInfos.sort((a, b) => {
        return b?.errors.length - a?.errors.length;
      });

      const uploadValidateObj = { errorFlag: false };
      if (sortAllErrorInfos.length > 0) {
        const errorInfos = sortAllErrorInfos[0].errors;

        errorInfoStr = errorInfos.reduce((prev, cur, index) => {
          const currentPrev = prev || '';
          const curArr = Array.prototype.slice.call(cur?.errors);
          const attachmentValidateObj =
            curArr?.filter((item) => item.ruleName === 'attachmentError')[0] || {};

          const message = attachmentValidateObj.$validationMessage;
          if (message) {
            uploadValidateObj.message = message;
            uploadValidateObj.errorFlag = true;
          }

          if (index < errorInfos.length - 1 && curArr[0]?.injectionOptions) {
            const currentLable = curArr[0]?.injectionOptions?.label || '';
            return `${currentPrev + currentLable} `;
          } else if (curArr[0]?.injectionOptions) {
            const currentLable = curArr[0]?.injectionOptions?.label || '';
            return `${currentPrev + currentLable} ${intl
              .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
              .d('校验不通过')}`;
          } else {
            return intl
              .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
              .d('校验不通过');
          }
        }, '');
      }

      if (uploadValidateObj?.errorFlag) {
        notification.warning({
          message: uploadValidateObj?.message,
        });
        return;
      }

      notification.warning({
        message: errorInfoStr,
      });

      return;
    }

    const { selected = null, unSelected = null } = this.allQuotationDS;
    const { batchEditQuotationLineDTO = {} } = this.state;
    const selectedData = !isEmpty(selected) ? selected : [];
    const unSelectedData = !isEmpty(unSelected) ? unSelected : [];
    const allData = [...selectedData, ...unSelectedData];

    const news = allData.map((lineRecord = {}) => {
      if (!lineRecord) {
        return;
      }

      const data = lineRecord.toData();
      const supplierCompanyName = lineRecord.get('supplierCompanyName');
      // data.currentExpiryDateFrom = dateFormate(data.currentExpiryDateFrom, DATETIME_MIN);
      // data.currentExpiryDateTo = dateFormate(data.currentExpiryDateTo, DATETIME_MAX);
      data.supplierCompanyName =
        typeof supplierCompanyName === 'object'
          ? supplierCompanyName.supplierCompanyName
          : supplierCompanyName;

      return data;
    });

    if (isEmpty(news)) {
      return;
    }

    const warnigSubmit = (response = {}) => {
      notification.warning({
        message: response.message,
      });
    };

    // 提交前的校验接口
    const doValidate = () => {
      return dispatch({
        type: `${modelName}/validateOfflineResultSubmit`,
        payload: {
          rfxHeaderId: rfxId,
          quotationLineDTOList: news,
          allEditFlag: this.allEditFlag,
          batchEditQuotationLineDTO,
          ...otherProps,
          customizeUnitCode: `SSRC.${
            this.sourceKey === BID ? 'BID_' : ''
          }OFFLINE_RESULT_ENTRY.LINE,SSRC.${
            this.sourceKeyString
          }OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE`,
        },
      });
    };

    const doSubmit = (otherParams) => {
      const params = {
        rfxHeaderId: rfxId,
        quotationLineDTOList: news,
        allEditFlag: this.allEditFlag,
        batchEditQuotationLineDTO,
        ...otherProps,
        ...otherParams,
        customizeUnitCode: `SSRC.${
          this.sourceKey === BID ? 'BID_' : ''
        }OFFLINE_RESULT_ENTRY.LINE,SSRC.${
          this.sourceKeyString
        }OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE`,
      };
      return this.CuxSubmitQuoteData(params);
    };

    if (this.lockSaveOrSubmit) return;
    this.lockSaveOrSubmit = true;
    this.setState({
      saveOrSubmitLoadding: true,
    });

    const ValidateResult = getResponse(await doValidate());
    if (!ValidateResult) {
      this.lockSaveOrSubmit = false;
      this.setState({
        saveOrSubmitLoadding: false,
      });
      return;
    }

    if (!isEmpty(ValidateResult)) {
      const validateCallBack = validatorConfirmModal({
        response: ValidateResult,
        validatorType: 'highestValidatorType',
        validatorArrName: 'validateResults',
        onOk: async () => {
          const result = await doSubmit();
          if (result && result?.failed) {
            warnigSubmit(result);
          } else {
            this.afterSuccessSubmit();
          }
        },
        errorOk: () => {
          this.lockSaveOrSubmit = false;
          this.setState({
            saveOrSubmitLoadding: false,
          });
        },
        onCancel: () => {
          this.lockSaveOrSubmit = false;
          this.setState({
            saveOrSubmitLoadding: false,
          });
        },
      });
      return validateCallBack;
    } else {
      const result = await doSubmit();

      const { validateResults } = result || {};
      if (validateResults?.length) {
        // 校验信息
        validatorConfirmModal({
          response: result,
          validatorType: 'highestValidatorType',
          validatorArrName: 'validateResults',
          openQualificationModal: this.renderQualificationExpir,
        });
      } else if (result && result.failed) {
        this.resetBatchMainRecord();
        if (['EQUAL_WEAK', 'WEAK'].includes(header.detailPriceControlRule)) {
          Modal.confirm({
            content: result.message,
            onOk: async () => {
              const subResult = await doSubmit({ weakCtrlConfirmFlag: 1 });
              if (subResult && subResult.failed) {
                warnigSubmit(subResult);
              } else {
                this.afterSuccessSubmit();
              }
            },
            onCancel: () => {
              this.lockSaveOrSubmit = false;
              this.setState({
                saveOrSubmitLoadding: false,
              });
            },
          });
        } else if (['EQUAL_STRONG', 'STRONG'].includes(header.detailPriceControlRule)) {
          Modal.warning({
            content: result.message,
            okText: intl.get('hzero.common.button.ok').d('确定'),
          });
        } else {
          notification.warning({
            message: result.message,
          });
        }
      } else if (getResponse(result)) {
        this.afterSuccessSubmit();
      }
    }

    this.resetBatchMainRecord();
    this.lockSaveOrSubmit = false;
    this.setState({
      saveOrSubmitLoadding: false,
    });
  }

  /**
   * 获取选中行-询价单行
   */
  @Bind()
  handleBacthAddItemRowSelectChange(_, selectedRows) {
    this.setState({
      batchAddItemSelectedRows: selectedRows,
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  // /**
  //  * 批量导入
  //  */
  // @Bind()
  // handleBatchExport(header, organizationId) {
  //   openTab({
  //     key: '/ssrc/offline-result-entry/comment-import/SSRC.RFX_QUOTATION.OFF_LINE',
  //     search: queryString.stringify({
  //       key: '/ssrc/offline-result-entry/comment-import/SSRC.RFX_QUOTATION.OFF_LINE',
  //       title: 'hzero.common.title.batchImport',
  //       action: intl.get('hzero.common.title.batchImport').d('批量导入'),
  //       backPath: `/ssrc/offline-result-entry/detail/${header.rfxHeaderId}`,
  //       args: JSON.stringify({
  //         tenantId: organizationId,
  //         rfxHeaderId: header.rfxHeaderId,
  //       }),
  //     }),
  //   });
  // }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchExport() {
    const {
      modelName = 'offlineResultEntry',
      [modelName]: { header = {} },
      organizationId,
    } = this.props;
    if (!header.rfxHeaderId || header.rfxHeaderId === 'null') {
      return;
    }

    const props = {
      code: 'SSRC.RFX_QUOTATION.OFF_LINE',
      prefixPatch: SRM_SSRC,
      auto: true,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: header.rfxHeaderId,
        templateCode: 'SSRC.RFX_QUOTATION.OFF_LINE',
      }),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
      downloadTemplateFlag: false,
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl
        .get(`${promptCode}.view.title.commonOfflineEntry`, {
          sourceName: getSourceName(this.sourceKey === BID),
        })
        .d('线下{sourceName}结果录入'),
      children: <CommonImport {...props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
      onCancel: this.batchImportOk,
    });
  }

  /**
   * 导入回调
   * @protected （永祥二开）禁止修改、删除此方法名
   */
  @Bind
  batchImportOk() {
    this.allQuotationDS.query();
    this.fetchQualificationWarnInfo();
  }

  /**
   * 结束报价
   */
  @Throttle(1200)
  @Bind()
  finishQuotation() {
    const {
      dispatch,
      match: { params },
      modelName = 'offlineResultEntry',
    } = this.props;
    return dispatch({
      type: `${modelName}/finishQuotation`,
      payload: {
        rfxHeaderIds: [params.rfxId],
      },
    }).then(async () => {
      try {
        await this.handleSearch();
        this.handleQuoteLineList();
      } catch (e) {
        throw e;
      }
    });
  }

  /**
   * 改变分页的回调
   */
  @Bind()
  onChangePagination(page = 1, pageSize = 10) {
    const flag = this.allQuotationDS.records.some((item) => item.status === 'update');
    if (flag) {
      this.saveQuoteData(true, { page, pageSize });
    }
  }

  /**
   * 配置表使用新供应商lov, 在打开之前
   * 查询寻源和系统供应商数据,给SupplierLov组件查询接口传递
   */
  fetchSourceSupplierRelativeConfigData = async () => {
    const {
      modelName = 'offlineResultEntry',
      organizationId,
      [modelName]: { header },
    } = this.props;
    const { sourceMethod, rfxHeaderId } = header || {};
    if (!rfxHeaderId) {
      return;
    }

    const params = {
      organizationId,
      sourceHeaderId: rfxHeaderId,
      sourceFrom: 'RFX',
      pageSource: PageSourceSymbol.offlineResultEntry,
    };
    let result = {};
    try {
      result = await fetchSourceSupplierRelativeConfig(params);
      result = getResponse(result);
      if (!result) {
        return;
      }

      const {
        reviewStatusList = null,
        existSuppliers = null,
        excludeSuppliers = null,
        itemCategoryIds = null,
        sourceCode = null,
        erpFlag = null,
        stageIdList = null,
        stageAllMismatchFlag = 0,
        queryItemIds = null,
        expandObject = null, // 扩展对象
      } = result;

      if (stageAllMismatchFlag === 1) {
        notification.warning({
          message:
            this.sourceKey === INQUIRY
              ? intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.batchAddRFQSupplierMsg`)
                  .d(
                    '操作失败，失败原因是业务规则定义"可参与询价供应商设置"导致没有供应商可参与，请检查'
                  )
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.batchAddBIDSupplierMsg`)
                  .d(
                    '操作失败，失败原因是业务规则定义"可参与投标（新）供应商设置"导致没有供应商可参与，请检查'
                  ),
        });
      }

      result = {
        defaultQueryItemCategoryIds: this.formatListToString(itemCategoryIds),
        supplyReviewStatus: this.formatListToString(reviewStatusList),
        sourceCode,
        erpFlag,
        excludeSupplierDetailDTOS: excludeSuppliers,
        chooseDetailDTOS: sourceMethod === 'INVITE' ? existSuppliers : null, // 维护，过程控制-反选供应商，线下正选供应商
        stageIdList,
        queryItemIds,
        ...(expandObject || {}),
        pageSource: PageSourceSymbol.offlineResultEntry,
      };
    } catch (e) {
      throw e;
    }

    return result || {};
  };

  formatListToString = (list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  };

  // 批量维护
  @Bind()
  startBatchMaintainItemLine() {
    const {
      modelName = 'offlineResultEntry',
      clearProperties = noop,
      c7n: { customizeForm = () => {} },
      [modelName]: { header = {} },
      organizationId,
      userId,
      offlineResultRemote,
    } = this.props;
    const { supplierConfigOldFlag = true, allowOnlyNameSupplier } = this.state;
    const { selected = [] } = this.allQuotationDS;
    this.allEditFlag = 0;
    if (isEmpty(selected)) {
      this.allEditFlag = 1;
    }

    this.batchMaintainItemDS.setQueryParameter('rfxHeader', { ...header, organizationId, userId });

    const Props = {
      rfx: { sourceKey: this.sourceKey },
      customizeForm,
      clearProperties,
      BatchMaintainItemDS: this.batchMaintainItemDS,
      tableDs: this.allQuotationDS,
      supplierConfigOldFlag,
      header,
      organizationId,
      allowOnlyNameSupplier,
      fetchSourceSupplierRelativeConfigData: this.fetchSourceSupplierRelativeConfigData,
      offlineResultRemote,
    };

    const modalKey = c7nModal.key();

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护'),
      children: <BatchMaintainItemForm {...Props} />,
      style: { width: '380px' },
      onOk: this.saveBatchMaintainItemLine,
      onCancel: () => {
        this.batchMaintainItemDS.loadData();
        this.batchMaintainItemDS.reset();
      },
    });
  }

  // 针对批量编辑是实体字段， 行上为xxxLov
  transformBatchMaintainData = (data = {}) => {
    if (isEmpty(data)) {
      return {};
    }

    const newData = data;

    Object.keys(newData).forEach((key) => {
      const value = newData[key];

      if (key === 'taxId') {
        newData.taxLov = value;
        delete newData[key];
      }
      if (key === 'paymentTypeId') {
        newData.paymentTypeLov = value;
        delete newData[key];
      }
      if (key === 'paymentTermId') {
        newData.paymentTermLov = value;
        delete newData[key];
      }
      if (key === 'rfxLineItemNum') {
        newData.rfxLineItemNumLov = value;
        delete newData[key];
      }
      if (key === 'currencyCode') {
        newData.quotationCurrencyCodeLov = value;
        delete newData[key];
      }
    });

    return newData;
  };

  // 批量维护保存
  @Throttle(800)
  @Bind()
  async saveBatchMaintainItemLine() {
    const { offlineResultRemote } = this.props;
    const validateFlag = await this.batchMaintainItemDS.validate();
    if (!validateFlag) {
      return false;
    }
    let currentData = handleFormDSFieldsValue({
      ds: this.batchMaintainItemDS,
    });

    currentData = this.transformBatchMaintainData(currentData);

    const data = this.batchMaintainItemDS?.toData()[0] || {};
    if (data?.taxId) {
      data.taxRate = currentData.taxLov.taxRate;
    }
    this.setState({
      batchEditQuotationLineDTO: data,
      batchMaintainDTO: currentData,
    });

    let cuxFlag = true;
    if (offlineResultRemote?.event) {
      cuxFlag = await offlineResultRemote.event.fireEvent('remoteBatchUpdateLineBeforeHandle', {
        that: this,
        currentData,
        data,
        bidFlag: this.bidFlag,
      });
    }

    if (cuxFlag === false) {
      return false;
    }

    await this.batchUpdateLines(this.allQuotationDS, currentData, this.allEditFlag);

    if (offlineResultRemote?.event) {
      offlineResultRemote.event.fireEvent('remoteBatchUpdateLineAfterHandle', {
        that: this,
        currentData,
        data,
        bidFlag: this.bidFlag,
      });
    }

    this.batchMaintainItemDS.loadData();
    this.batchMaintainItemDS.reset();
  }

  // 阶梯报价删除
  @Bind()
  deleteData() {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      [modelName]: { fetchLadderList = [] },
    } = this.props;
    const { selectRows, selectRowKeys = [], LadderLevelHeaderData } = this.state;
    if (isEmpty(selectRows)) {
      return;
    }

    // 过滤出勾选数据(非新建行)
    const newParameters = filter(selectRows, (item) => {
      return item._status !== 'create';
    });
    // 过滤出数据(非新建行item._status !== 'create')
    const newLadderLevel = filter(fetchLadderList, (item) => {
      return item._status !== 'create';
    });
    // 正常的最后几条
    const endLadderList = newLadderLevel.slice(newLadderLevel.length - newParameters.length);
    // 二者相同项
    const commonLadderList = filter(endLadderList, (item) => {
      return newParameters.find((param) => param.rfxLadderLineNum === item.rfxLadderLineNum);
    });
    if (
      newParameters.length &&
      newParameters.length < newLadderLevel.length &&
      commonLadderList.length < newParameters.length
    ) {
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.model.supQuo.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
    } else {
      Modal.confirm({
        title: intl.get('ssrc.supplierQuotation.message.confirm.remove').d('确定删除该条数据?'),
        onOk: () => {
          const remoteDelete = [];
          const localDelete = [];
          selectRows.forEach((item) => {
            if (item._status === 'create') {
              localDelete.push(item);
            }
            if (item._status === 'update') {
              remoteDelete.push(item);
            }
          });
          // 删除的都是新建行
          if (isEmpty(remoteDelete)) {
            // 过滤出勾选数据的剩下新建数据
            const currentNewTableData = filter(fetchLadderList, (item) => {
              return selectRowKeys.indexOf(item.ladderQuotationId) < 0;
            });

            dispatch({
              type: `${modelName}/updateState`,
              payload: {
                fetchLadderList: currentNewTableData,
              },
            });
            this.handleRowSelectChange([], []);
          } else {
            dispatch({
              type: `${modelName}/deleteLadderQuot`,
              payload: {
                remoteDelete,
                quotationLineId: LadderLevelHeaderData.quotationLineId,
                query: { synCurrentFlag: 1 },
              },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: `${modelName}/fetchLadderList`,
                  payload: {
                    quotationLineId: LadderLevelHeaderData.quotationLineId,
                  },
                });
                this.handleRowSelectChange([], []);
              }
            });
          }
        },
      });
    }
    // }
  }

  // 阶梯报价新建
  @Bind()
  addData() {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      [modelName]: { header, fetchLadderList = [] },
      organizationId,
    } = this.props;
    const { LadderLevelHeaderData } = this.state;
    const { currencyCode: HeaderCurrencyCode } = header || {};
    const { quotationCurrencyCode } = LadderLevelHeaderData || {};

    const newLine = {
      quotationLineId: LadderLevelHeaderData.quotationLineId,
      ladderQuotationId: uuidv4(),
      rfxLadderLineNum: undefined,
      ladderFrom: undefined,
      ladderTo: undefined,
      tenantId: organizationId,
      currentLadderPrice: undefined,
      currentNetLadderPrice: null,
      cumulativeFlag: 0,
      validLadderTaxPrice: undefined,
      validNetLadderPrice: undefined,
      currencyCode: quotationCurrencyCode || HeaderCurrencyCode,
      _status: 'create',
    };

    if (!isEmpty(fetchLadderList)) {
      // 上一行的至作为下行的从
      const lastLine = fetchLadderList[fetchLadderList.length - 1] || {};
      const nextLineLadderFrom = lastLine.$form ? lastLine.$form?.getFieldValue('ladderTo') : null;
      newLine.ladderFrom = nextLineLadderFrom;

      newLine.secondaryLadderFrom = lastLine.$form
        ? lastLine.$form.getFieldValue('secondaryLadderTo')
        : null;
    }

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        fetchLadderList: [...fetchLadderList, newLine],
      },
    });
  }

  /**
   * 勾选行切换
   */
  @Bind()
  handleRowSelectChange(selectRowKeys = [], selectRows = []) {
    this.setState({
      selectRowKeys,
      selectRows,
    });
  }

  // 导入按钮
  renderCommonImportButton = () => {
    const {
      modelName = 'offlineResultEntry',
      match: { path },
      [modelName]: { header = {} },
      organizationId,
    } = this.props;

    const ImportProps = {
      businessObjectTemplateCode:
        this.sourceKey === BID ? 'SSRC.NEW_BID_QUOTATION.OFF_LINE' : 'SSRC.RFX_QUOTATION.OFF_LINE',
      prefixPatch: SRM_SSRC,
      auto: true,
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: header.rfxHeaderId,
        templateCode: 'SSRC.RFX_SUPPLIER.IMPORT',
        fromExport: true,
      },
      backPath: undefined,
      buttonText: `${intl
        .get(`${promptCode}.view.message.button.NewExcelImport`)
        .d('(新)Excel导入')}`,
      refreshButton: true,
      successCallBack: this.batchImportOk,
      modalProps: {
        onclose: this.batchImportOk,
      },
      customeImportTemplate: {
        templateCode:
          this.sourceKey === BID
            ? 'SRM_C_SRM_SSRC_THE_BID_OFFLINE_RESULTS_EXPORT'
            : 'SRM_C_SRM_SSRC_RFX_OFFLINE_SOURCE_SEARCH_RESULTS_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/off-line/supplier/list/new-export`,
        queryParams: { rfxHeaderId: header.rfxHeaderId },
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
    };

    return {
      name: 'excelImportNew',
      btnComp: CommonImportNew,
      btnProps: {
        name: 'excelImportNew',
        ...ImportProps,
        buttonProps: {
          funcType: 'flat',
          permissionList: [
            {
              code: `${path}.button.importNew`.toLowerCase(),
              type: 'button',
              meaning: `${
                intl.get(`${promptCode}.view.title.offlineEntry`).d('线下询价结果录入') -
                intl.get(`${promptCode}.view.message.button.ExcelImport`).d('Excel导入')
              }(New)`,
            },
          ],
        },
      },
    };
  };

  // 导入按钮
  @Bind()
  renderImportListButton() {
    const {
      modelName = 'offlineResultEntry',
      [modelName]: { header = {} },
    } = this.props;
    const { rfxHeaderId = '', existsQuotationDetailFlag = 0 } = header || {};
    return {
      name: 'quotationDetailImport',
      btnComp: QuotationDetailImport,
      btnProps: {
        isH0Btn: false,
        rfxHeaderId,
        onOk: this.handleQuoteLineList,
        onClose: this.handleQuoteLineList,
        isDisabled: existsQuotationDetailFlag !== 1,
        existsQuotationDetailFlag,
        pageSource: PageSourceSymbol.offlineResultEntry,
        buttonProps: {
          funcType: 'flat',
          // icon: '',
        },
      },
    };
  }

  /**
   * 头部按钮（三生制药二开）
   * @protected 禁止修改方法名
   */
  renderHeaderButtons = () => {
    const { saveOrSubmitLoadding, showHeaderFileCount = false } = this.state;
    const {
      modelName = 'offlineResultEntry',
      [modelName]: { header = {} },
      organizationId,
      offlineResultRemote,
    } = this.props;
    const { rfxHeaderId = null, quotationHeadersCurrentUuidFileCount = null } = header || {};

    const buttons = [
      {
        name: 'submit',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'check',
          color: 'primary',
          // funcType: 'flat',
          loading: saveOrSubmitLoadding,
          onClick: () => this.submitQuoteData(),
        },
        child: intl.get('hzero.common.button.submit').d('提交'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          loading: saveOrSubmitLoadding,
          onClick: this.saveQuoteData,
          funcType: 'flat',
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'uploadAttach',
        btnType: 'c7n-pro',
        btnProps: {
          color: 'default',
          loading: saveOrSubmitLoadding,
          onClick: () => this.saveQuoteData(false),
          funcType: 'flat',
        },
        child: (
          <>
            <Icon type="upload" size={16} style={{ marginRight: '8px' }} />
            {intl.get('hzero.common.title.uploadAttach').d('上传附件')}
            {quotationHeadersCurrentUuidFileCount && showHeaderFileCount ? (
              <span style={{ marginLeft: '4px' }}>{quotationHeadersCurrentUuidFileCount}</span>
            ) : (
              ''
            )}
          </>
        ),
      },
      this.renderCommonImportButton(),
      this.renderImportListButton(),
      {
        name: 'excelImport',
        btnType: 'c7n-pro',
        btnProps: {
          color: 'default',
          onClick: this.handleBatchExport,
          funcType: 'flat',
        },
        child: (
          <>
            {/* <Iconfont type="main-import" size={16} style={{ marginRight: '8px' }} /> */}
            {intl.get(`${promptCode}.view.message.button.ExcelImport`).d('Excel导入')}
          </>
        ),
      },
      (moment().isBefore(header.quotationEndDate) || !header.quotationEndDate) && {
        name: 'offlineResultEntry',
        btnComp: PermissionButton,
        btnType: 'c7n-pro',
        btnProps: {
          onClick: this.finishQuotation,
          loading: saveOrSubmitLoadding,
          icon: 'state_over',
          type: 'c7n-pro',
          funcType: 'flat',
          uiType: 'c7n-pro',
          style: {
            fontWeight: 400,
            paddingLeft: 0,
          },
          permissionList: [
            {
              code: `${
                this.sourceKey === BID
                  ? 'ssrc.new-bid.offline-result-entry.detail.-rfxid'
                  : this.props.match.path
              }.button.finish`.toLowerCase(),
              type: 'button',
              meaning:
                intl
                  .get(`${promptCode}.view.title.commonOfflineEntry`, {
                    sourceName: getSourceName(this.sourceKey === BID),
                  })
                  .d('线下{sourceName}结果录入') -
                intl
                  .get('ssrc.offlineResultEntry.model.offlineResultEntry.commonFinish', {
                    quotationName: getQuotationName(this.sourceKey === BID),
                  })
                  .d('结束{quotationName}'),
            },
          ],
        },
        otherProps: {
          uiType: 'c7n-pro',
          funcType: 'flat',
        },
        child: intl
          .get('ssrc.offlineResultEntry.model.offlineResultEntry.commonFinish', {
            quotationName: getQuotationName(this.sourceKey === BID),
          })
          .d('结束{quotationName}'),
      },
      {
        name: 'downloadImportTemplate',
        btnComp: ExcelExport,
        btnType: 'c7n-pro',
        btnProps: {
          buttonText: intl
            .get(`ssrc.offlineResultEntry.view.button.downloadImportTemplate`)
            .d('下载导入模板'),
          requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/off-line/supplier/list/excel`,
          queryParams: { rfxHeaderId: header.rfxHeaderId },
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            // icon: 'unarchive',
          },
        },
      },
    ].filter(Boolean);

    const otherProps = {
      rfxHeaderId,
      bidFlag: this.sourceKey === BID,
      that: this,
    };

    return offlineResultRemote
      ? offlineResultRemote.process(
          'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_HEADER_BUTTON',
          buttons,
          otherProps
        )
      : buttons;
  };

  /**
   * 【永祥】二开
   * header渲染
   * @returns
   */
  getHeaderRender = () => {
    const {
      c7n: { customizeBtnGroup = () => {} },
    } = this.props;
    const { headerGroupButtonMaxNum = -1 } = this.state;

    return (
      <ModalProvider>
        <Header
          backPath={`${getActiveTabKey()}/list`}
          title={intl
            .get(`${promptCode}.view.title.commonOfflineEntry`, {
              sourceName: getSourceName(this.sourceKey === BID),
            })
            .d('线下{sourceName}结果录入')}
        >
          {customizeBtnGroup(
            {
              code: `SSRC.${this.sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.BUTTON_GROUP`,
              pro: true,
            },
            <DynamicButtons
              maxNum={headerGroupButtonMaxNum}
              trigger="click"
              buttons={this.renderHeaderButtons()}
              defaultBtnType="c7n-pro"
            />
          )}
        </Header>
      </ModalProvider>
    );
  };

  render() {
    const {
      bucketName,
      bucketDirectory,
      visibleImport,
      batchAddItemVisible,
      batchAddItemSelectedRows = [],
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      collapseKeys,
      selectRowKeys = [],
      selectRows = [],
      doubleUnitFlag,
      supplierConfigOldFlag = true,
      allowOnlyNameSupplier,
      caclRule = '',
      qualificationWarnInfo,
    } = this.state;

    const {
      modelName = 'offlineResultEntry',
      [modelName]: { header = {}, itemList = [], itemListPagination = {}, fetchLadderList = [] },
      c7n: { custTable = () => {}, custLoading, customizeForm = () => {} },
      h0: { customizeTable = () => {}, customizeTabPane = () => {} },
      // excel导入所需参数-起始
      dispatch,
      uploadExcelLoading,
      loadDataSourceLoading,
      queryStatusLoading,
      validateDataLoading,
      importDataLoading,
      queryPrefixPatchLoading,
      namespace,
      // excel导入所需参数-终
      organizationId,
      userId,
      fetchInquiryHeaderLoading,
      fetchQuoteLineListLoading,
      saveQuoteLineLading,
      fetchItemListLading,
      ladderLoading,
      history,
      quotationHeader,
      match,
      offlineResultRemote,
      match: { params },
    } = this.props;
    const configTaxIncludeFlag = (header && header.priceTypeCode) === 'TAX_INCLUDED_PRICE'; // TAX_INCLUDED_PRICE(含税价), NET_PRICE(不含税)

    this.allQuotationDS.setQueryParameter('tableProps', {
      configTaxIncludeFlag,
    });

    const batchAddItemRowSelection = {
      selectedRowKeys:
        batchAddItemSelectedRows && batchAddItemSelectedRows.map((item) => item.rfxLineItemId),
      onChange: this.handleBacthAddItemRowSelectChange,
    };
    const attachmentsProps = {
      bucketName,
      bucketDirectory,
      viewOnly: true,
      customizeForm,
      onRef: this.getAttachmentFormRef,
      header,
      sourceKey: this.sourceKey,
    };

    // 全部报价明细行
    const allQuoteLineTableProps = {
      history,
      match,
      // setConfigs: this.setConfigs,
      configTaxIncludeFlag,
      custLoading,
      custTable,
      allQuotationDS: this.allQuotationDS,
      header,
      doubleUnitFlag,
      loading: fetchQuoteLineListLoading,
      organizationId,
      userId,
      sourceKey: this.sourceKey,
      offlineResultRemote,
      onPageChange: this.handlePageChange,
      onDeleteLine: this.onDeleteLine,
      onChangeLineData: this.handleChangeLineData,
      onDeleteLines: this.deleteQuoteLines,
      openModal: this.openBatchAddItemModal,
      saveLoading: fetchQuoteLineListLoading || saveQuoteLineLading,
      ladderLevelData: fetchLadderList, // 阶梯报价信息
      visible: viewLadderLevelVisible, // 阶梯报价展示
      LadderLevelHeaderData, // 阶梯报价头信息
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      saveData: this.haeSaveData,
      onlySaveData: this.onlySaveData,
      onRef: this.handleBindLineRef,
      handleSearch: this.handleQuoteLineList,
      ladderLoading,
      onChangePagination: this.onChangePagination,
      startBatchMaintainItemLine: this.startBatchMaintainItemLine,
      deleteData: this.deleteData,
      addData: this.addData,
      selectRowKeys,
      selectRows,
      handleRowSelectChange: this.handleRowSelectChange,
      quotationHeader,
      supplierConfigOldFlag,
      fetchSourceSupplierRelativeConfigData: this.fetchSourceSupplierRelativeConfigData,
      allowOnlyNameSupplier,
      caclRule,
      qualificationWarnInfo,
      rfxHeaderId: params.rfxId,
    };
    //  批量添加物品行
    const batchAddItemsProps = {
      customizeTable,
      rowSelection: batchAddItemRowSelection,
      loading: fetchItemListLading,
      pagination: itemListPagination,
      dataSource: itemList,
      visible: batchAddItemVisible,
      sourceKey: this.sourceKey,
      onRef: this.handleBindRef,
      onSearch: this.handleItemList,
      onCancel: this.closeBatchAddItemModal,
      onChange: this.handleItemList,
      onOk: this.handleAddItem,
      bidFlag: this.bidFlag,
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.offlineEntry.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.contacts').d('联系人'),
        dataIndex: 'contactName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.contactsPhone`).d('联系电话'),
        dataIndex: 'contactMail',
        width: 200,
        render: (val, record) => phoneRender(record.internationalTelCodeMeaning, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        dataIndex: 'contactMobilephone',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.unitPrice`).d('单价'),
        dataIndex: 'currentQuotationPrice',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.availableQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.offlineEntry.commonQuotationDesc`, {
            quotationName: getQuotationName(this.sourceKey === BID),
          })
          .d('{quotationName}说明'),
        dataIndex: 'currentQuotationRemark',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTypeName`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerm`).d('付款条款'),
        dataIndex: 'paymentTermName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.deliveryPeriod`).d('供货周期'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.quotcurFrom`).d('qVFrom'),
        dataIndex: 'currentExpiryDateFrom',
        width: 150,
        render: (val) => {
          if (typeof val === 'string') {
            return val.replace(/-/g, '/').split(' ')[0];
          } else return val;
        },
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.qVTo`).d('报价有效期至'),
        dataIndex: 'currentExpiryDateTo',
        width: 150,
        render: (val) => {
          if (typeof val === 'string') {
            return val.replace(/-/g, '/').split(' ')[0];
          } else return val;
        },
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.promDelDate`).d('承诺交货期'),
        dataIndex: 'currentPromisedDate',
        width: 120,
        render: (val) => {
          if (typeof val === 'string') {
            return val.replace(/-/g, '/').split(' ')[0];
          } else return val;
        },
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.minPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.minPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 120,
      },
    ];
    // excel导入所需参数
    const importExcelProps = {
      columns,
      dispatch,
      namespace,
      importDataLoading,
      uploadExcelLoading,
      queryStatusLoading,
      loadDataSourceLoading,
      queryPrefixPatchLoading,
      validateDataLoading,
      onBack: () => {
        dispatch({
          type: `${modelName}/fetchQuoteLineList`,
          payload: {
            rfxHeaderId: header.rfxHeaderId,
            customizeUnitCode: `SSRC.${
              this.sourceKey === BID ? 'BID_' : ''
            }OFFLINE_RESULT_ENTRY.LINE`,
          },
        });
        this.setState({ visibleImport: !visibleImport });
        this.fetchQualificationWarnInfo();
      },
      extraParams: { rfxHeaderId: header.rfxHeaderId, tenantId: organizationId },
      title: intl.get(`${promptCode}.model.offlineEntry.batchImport`).d('线下询价导入'),
      templateCode: 'SSRC.RFX_QUOTATION.OFF_LINE',
    };

    if (visibleImport) {
      return <ImportExcel {...importExcelProps} />;
    } else {
      return (
        <ModalProvider>
          {this.getHeaderRender()}
          <Content>
            <Spin
              spinning={fetchInquiryHeaderLoading}
              wrapperClassName={classnames('ued-detail-wrapper')}
            >
              <Collapse
                className="form-collapse"
                defaultActiveKey={['rfxTitle']}
                onChange={(arr) => this.onCollapseChange(arr, 'rfxTitle')}
              >
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      {this.renderHeaderTitle(header)}
                      <a>
                        {collapseKeys.rfxTitle
                          ? collapseKeys.rfxTitle.some((o) => o === 'rfxTitle')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')
                          : intl.get(`hzero.common.button.up`).d('收起')}
                      </a>
                      <Icon
                        type={
                          collapseKeys.rfxTitle
                            ? collapseKeys.rfxTitle.some((o) => o === 'rfxTitle')
                              ? 'up'
                              : 'down'
                            : 'up'
                        }
                      />
                    </Fragment>
                  }
                  key="rfxTitle"
                >
                  {this.renderHeaderForm(header)}
                </Panel>
              </Collapse>
              {customizeTabPane(
                {
                  code: `SSRC.${this.sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.TABS`,
                },
                <Tabs defaultActiveKey="allQuoteLines" onChange={this.changeTabs} animated={false}>
                  <Tabs.TabPane
                    tab={intl
                      .get(`${promptCode}.view.message.tab.allQuotationDetails`)
                      .d('全部报价明细')}
                    key="allQuoteLines"
                  >
                    <AllQuoteLineTable {...allQuoteLineTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`${promptCode}.view.message.tab.attachmentList`).d('附件列表')}
                    key="attachmentList"
                  >
                    <AttachmentForm {...attachmentsProps} />
                  </Tabs.TabPane>
                </Tabs>
              )}
            </Spin>
          </Content>
          <BatchAddItems {...batchAddItemsProps} />
        </ModalProvider>
      );
    }
  }
}

const HOCComponent = (Comp) => {
  return mixCustomize({
    unitCode: [
      'SSRC.OFFLINE_RESULT_ENTRY.DETAIL.HEADINFO',
      'SSRC.OFFLINE_RESULT_ENTRY.LINE',
      'SSRC.OFFLINE_RESULT_ENTRY.BUTTON_GROUP',
      'SSRC.OFFLINE_RESULT_ENTRY.BATCH_ADD_QUOTATION',
      'SSRC.OFFLINE_RESULT_ENTRY.BATCH_ITEM_FORM',
      'SSRC.OFFLINE_RESULT_ENTRY.TABS',
      'SSRC.OFFLINE_RESULT_ENTRY.ATTACHMENT_FORM',
      'SSRC.OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE',
    ],
    c7nUnit: [
      'SSRC.OFFLINE_RESULT_ENTRY.LINE',
      'SSRC.OFFLINE_RESULT_ENTRY.BUTTON_GROUP',
      'SSRC.OFFLINE_RESULT_ENTRY.BATCH_ITEM_FORM',
      'SSRC.OFFLINE_RESULT_ENTRY.ATTACHMENT_FORM',
      'SSRC.OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE',
    ],
  })(
    Form.create({ fieldNameProp: null })(
      connect(
        ({ offlineResultEntryInquiry, commonModel, loading, importExcel: { namespace } }) => ({
          modelName: 'offlineResultEntryInquiry',
          offlineResultEntryInquiry,
          offlineResultEntry: offlineResultEntryInquiry,
          namespace,
          commonModel,
          uploadExcelLoading: loading.effects['importExcel/uploadExcel'],
          validateDataLoading: loading.effects['importExcel/validateData'],
          loadDataSourceLoading: loading.effects['importExcel/loadDataSource'],
          importDataLoading: loading.effects['importExcel/importData'],
          queryStatusLoading: loading.effects['importExcel/queryStatus'],
          queryPrefixPatchLoading: loading.effects['importExcel/queryPrefixPatch'],
          fetchInquiryHeaderLoading:
            loading.effects['offlineResultEntryInquiry/fetchInquiryHeader'],
          fetchQuoteLineListLoading:
            loading.effects['offlineResultEntryInquiry/fetchQuoteLineList'],
          saveQuoteLineLading: loading.effects['offlineResultEntryInquiry/saveQuoteLine'],
          submitQuoteLineLading: loading.effects['offlineResultEntryInquiry/submitQuoteData'],
          fetchItemListLading: loading.effects['offlineResultEntryInquiry/fetchItemList'],
          ladderLoading: loading.effects['offlineResultEntryInquiry/saveLadderList'],
          organizationId: getCurrentOrganizationId(),
          userId: getCurrentUserId(),
        })
      )(
        formatterCollections({
          code: [
            'ssrc.offlineResultEntry',
            'ssrc.inquiryHall',
            'ssrc.common',
            'ssrc.supplierQuotation',
            'ssrc.bidHall',
            'ssrc.priceLibraryNew',
            'sscux.ssrc',
            'scux.ssrc',
            'hzero.common',
          ],
        })(
          remote(
            {
              code: 'SSRC_OFFLINE_RESULT_ENTRY_DETAIL',
              name: 'offlineResultRemote',
            },
            {
              events: {
                // 全部报价明细行 - 添加供应商确认逻辑二开
                handleRemoteNewBulkAddSupplier() {},
                // 批量编辑 - 添加供应商确认逻辑二开
                handleRemoteBatchNewBulkAddSupplier() {},
                // 批量编辑，数据更新后埋点二开
                remoteBatchUpdateLineAfterHandle() {},
                remoteBatchUpdateLineBeforeHandle() {},
              },
            }
          )(observer(Comp))
        )
      )
    )
  );
};

export { HOCComponent, Detail };

export default HOCComponent(Detail);
