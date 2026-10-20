import React, { Component } from 'react';
import { Button, DataSet, Form, TextField, TextArea, Lov } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import classnames from 'classnames';
import querystring from 'querystring';
import { compose, isEmpty } from 'lodash';

import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
// import { PRIVATE_BUCKET } from '_utils/config';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

// import { FIlESIZE } from '@/utils/SsrcRegx';
import { isText, fetchCurrentPrecision, amountCalcType } from '@/utils/utils';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import { operateResponseMessagePrompt } from '@/utils/common.js';

import {
  priceReplySave,
  priceReplySubmit,
  fetchPriceClarificationFiles,
} from '@/services/supplierQutationService';
import { queryEnableDoubleUnit } from '@/services/commonService';

import CommonStyles from '@/routes/share/styles/customPage.less';
import SupplierQuoteDetailTable from './SupplierQuoteDetailTable';
import { HeaderFormDS } from '../FormDS';
import Attachment from './Attachments';

import styles from '../index.less';

class Update extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      pageLoading: false, // page loading
      // bUuid: null,
      // tUuid: null,
      doubleUnitFlag: false,
      currencyPrecision: null, // 手动查询的币种精度，单价不补零
      financialPrecision: null, // 手动查询的财务精度
      caclRule: null, // 业务规则定义-金额计算方式
    };

    this.HeaderFormDS = new DataSet(HeaderFormDS({ sourceKey: this.props.sourceKey || INQUIRY }));
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  bidFlag = (this.props.sourceKey || INQUIRY) === BID;

  SupplierQuoteTableRef = null;

  componentDidMount() {
    this.initPage();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      history: {
        location: { search },
      },
    } = prevProps || {};
    const PrevRouterParams = querystring.parse(search.substr(1)) || {};
    const { clarifyNotifyId: preClarifyNotifyId = null } = PrevRouterParams;
    const clarifyNotifyId = this.getLocationSearch('clarifyNotifyId');

    return clarifyNotifyId && clarifyNotifyId !== preClarifyNotifyId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  getRouterParams(key = null) {
    const {
      location: { search },
    } = this.props;

    const RouterParams = querystring.parse(search.substr(1));
    if (!key) {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  initPage = async () => {
    this.fetchHeaderInfo();
  };

  fetchHeaderInfo() {
    const routerParam = this.getRouterParams();
    const { clarifyNotifyId, quotationHeaderId = '' } = routerParam;

    this.HeaderFormDS.setQueryParameter('commonProps', {
      clarifyNotifyId,
      quotationHeaderId,
      organizationId: this.organizationId,
    });
    this.HeaderFormDS.query().then((res) => {
      if (getResponse(res)) {
        const { currencyCode, tenantId } = res || {};
        this.queryDoubleUnit(tenantId);
        // this.initCalcType({ organizationId: tenantId });
        this.initCalcType({
          purTenantId: tenantId,
          organizationId: this.organizationId,
          supplierFlag: 1,
        });
        this.fetchCurrencyPrecision(currencyCode, tenantId);
        this.fetchPriceClarificationFiles();
        this.setLineDSHeaderData(res);
      }
    });
  }

  // line ds set header
  setLineDSHeaderData = (header = {}) => {
    const { SupplierQuotationTableDS } = this.SupplierQuoteTableRef || {};

    if (SupplierQuotationTableDS) {
      SupplierQuotationTableDS.setQueryParameter('headerInfo', header || {});
    }
  };

  initCalcType = async (data = {}) => {
    const result = (await amountCalcType(data)) || [];
    this.setState({ caclRule: result?.[0] });
  };

  // fetch quotation file
  async fetchPriceClarificationFiles() {
    const routerParam = this.getRouterParams();
    const { clarifyNotifyId, quotationHeaderId } = routerParam;

    try {
      let result = await fetchPriceClarificationFiles({
        organizationId: this.organizationId,
        clarifyNotifyId,
        quotationHeaderId,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      const { businessAttachmentUuid, techAttachmentUuid } = result || {};

      const { current } = this.HeaderFormDS || {};
      if (!current) {
        return;
      }

      current.set({
        businessAttachmentUuid,
        techAttachmentUuid,
      });

      // this.setState({
      //   bUuid: businessAttachmentUuid,
      //   tUuid: techAttachmentUuid,
      // });
    } catch (e) {
      throw e;
    }
  }

  // 根据币种查询精度
  @Bind()
  async fetchCurrencyPrecision(currencyCode, tenantId) {
    if (!currencyCode) {
      return;
    }

    const Precisions = await fetchCurrentPrecision({
      currencyCodes: currencyCode,
      purTenantId: tenantId,
    });
    if (!Precisions) {
      return;
    }
    const { currency, financial } = Precisions || {};
    // 设置币种精度
    this.setState({ currencyPrecision: currency });
    this.setState({ financialPrecision: financial });
  }

  @Bind()
  queryDoubleUnit(tenantId) {
    queryEnableDoubleUnit({ businessModule: 'RFX', tenantId }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  // table ref
  @Bind()
  onTableRef(ref) {
    this.SupplierQuoteTableRef = ref;
  }

  // toggle loadding
  togglePageLoading(pageLoading = false) {
    this.setState({
      pageLoading,
    });
  }

  // render form
  renderForm() {
    const { customizeForm } = this.props;
    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT`,
        dataSet: this.HeaderFormDS,
      },
      <Form labelLayout="float" columns={2} dataSet={this.HeaderFormDS}>
        <TextField name="clarifyNotifyNum" />
        <TextField name="clarifyNotifyStatusMeaning" />
        <TextField name="clarifyNotifyTitle" />
        <TextField name="companyName" />
        <TextField name="sourceNum" />
        <TextField name="replyEndDate" />
        <TextField name="submittedByName" />
        <TextField name="submittedDate" />
        <Lov name="paymentTypeLov" />
        <Lov name="paymentTermLov" />
        <Lov name="currencyLov" />
        <TextArea newLine colSpan={2} rows={3} name="replyRequirement" resize />
      </Form>
    );
  }

  getRecordAttachmentUploadErrors = async (currentDS) => {
    const error = {
      uploadValidateFlag: true,
    };

    if (!currentDS) {
      return error;
    }

    const errorList = await currentDS.getValidationErrors();
    if (isEmpty(errorList)) {
      return error;
    }

    const errs = errorList[0]?.errors;
    if (isEmpty(errs)) {
      return error;
    }

    let attachmentValidateObj = null;
    errs.forEach((err) => {
      const currentErr =
        err?.errors?.filter((item) => item?.ruleName === 'attachmentError')[0] || {};
      const { ruleName } = currentErr;
      if (ruleName === 'attachmentError') {
        attachmentValidateObj = currentErr;
      }
    });

    const message = attachmentValidateObj?.$validationMessage;
    if (message) {
      notification.error({ message });
      error.uploadValidateFlag = false;
      error.message = message;
    }

    return error;
  };

  // 提交保存校验
  async validateSubmitData() {
    const SupplierDS = this.SupplierQuoteTableRef.SupplierQuotationTableDS || {};
    SupplierDS.forEach((record) => {
      record.set('status', 'update');
    });

    const SupplierLineValidate = await SupplierDS.validate();
    const { uploadValidateFlag: supplierLineAttachmentFlag } =
      (await this.getRecordAttachmentUploadErrors(SupplierDS)) || {};

    return {
      supplierLineAttachmentFlag,
      SupplierLineValidate,
    };
  }

  // collection form data to operate
  integrationHeaderFormData = async () => {
    const headerDS = this.HeaderFormDS;
    if (!headerDS || !headerDS?.current) {
      return;
    }

    headerDS.forEach((record) => {
      record.set('status', 'update');
    });

    let clarifyNotify = null;
    let headerValidateFlag = true;

    headerValidateFlag = await headerDS.validate();
    const { uploadValidateFlag: headerAttachmentUploadProcessFlag } =
      (await this.getRecordAttachmentUploadErrors(headerDS)) || {};

    clarifyNotify = headerDS.current.toData();

    return {
      clarifyNotify,
      headerValidateFlag,
      headerAttachmentUploadProcessFlag,
    };
  };

  // supplier item table data
  integrationTableData() {
    const SupplierDS = this.SupplierQuoteTableRef.SupplierQuotationTableDS || {};
    const data = SupplierDS.toData();
    const newData = data.map((item) => {
      const { netPrice } = item;
      return { ...item, newNetPrice: netPrice };
    });
    return newData;
  }

  // // supplier file
  // integrationSupplierFile() {
  //   let bUuid = null;
  //   let tUuid = null;

  //   if (this.attachmentRef) {
  //     const { businessAttachmentUuid: businessUuid, techAttachmentUuid: techUuid } =
  //       this.attachmentRef.state || {};
  //     if (businessUuid) {
  //       bUuid = businessUuid;
  //     }
  //     if (techUuid) {
  //       tUuid = techUuid;
  //     }
  //   }

  //   return {
  //     businessAttachmentUuid: bUuid,
  //     techAttachmentUuid: tUuid,
  //   };
  // }

  // submit
  @Throttle(1200)
  @Bind()
  async handleSubmit() {
    const { history } = this.props;
    const RouterParams = this.getLocationSearch();
    const { backPath = null, quotationHeaderId = null, clarifyNotifyId = null } =
      RouterParams || {};

    if (!clarifyNotifyId) {
      return;
    }

    const { supplierLineAttachmentFlag, SupplierLineValidate } =
      (await this.validateSubmitData()) || {};
    const { clarifyNotify, headerValidateFlag, headerAttachmentUploadProcessFlag } =
      (await this.integrationHeaderFormData()) || {};

    const priceClarifyIssueLines = this.integrationTableData();
    const { businessAttachmentUuid, techAttachmentUuid } = clarifyNotify || {};
    // const files = this.integrationSupplierFile();

    if (!SupplierLineValidate || !headerValidateFlag) {
      if (!supplierLineAttachmentFlag || !headerAttachmentUploadProcessFlag) {
        return;
      }

      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
      });
      return;
    }

    try {
      this.togglePageLoading(true);
      let result = await priceReplySubmit({
        clarifyNotifyId,
        organizationId: this.organizationId,
        quotationHeaderId,
        clarifyNotify,
        priceClarifyIssueLines,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT_ATTACHMENTS`,
        // ...files,
        businessAttachmentUuid,
        techAttachmentUuid,
      });
      result = getResponse(result);
      this.togglePageLoading();
      if (!result) {
        return;
      }

      const validateRes = validatorConfirmModal({
        response: result,
        validatorType: 'highestValidatorType',
        validatorArrName: 'validateResults',
        onOk: async () => {
          this.togglePageLoading(true);
          const res = await priceReplySubmit({
            clarifyNotifyId,
            organizationId: this.organizationId,
            quotationHeaderId,
            clarifyNotify,
            priceClarifyIssueLines,
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT_ATTACHMENTS`,
            businessAttachmentUuid,
            techAttachmentUuid,
            weakCtrlConfirmFlag: 1, // 再次确认
          });
          this.togglePageLoading();
          if (getResponse(res)) {
            notification.success();
            history.push(backPath);
          }
        },
        onCancel: () => this.togglePageLoading(),
        errorOk: () => this.togglePageLoading(),
      });

      // highestValidatorType 返回结果为空或是不存在这个字段 走正常逻辑
      if (validateRes && !validateRes.highestValidatorType) {
        notification.success();
        history.push(backPath);
        return;
      }
    } catch (e) {
      throw e;
    }
  }

  // save
  @Throttle(1200)
  @Bind()
  async handleSave() {
    const RouterParams = this.getLocationSearch();
    const { clarifyNotifyId = null, quotationHeaderId = null } = RouterParams || {};

    const { supplierLineAttachmentFlag, SupplierLineValidate } =
      (await this.validateSubmitData()) || {};
    const { clarifyNotify, headerValidateFlag, headerAttachmentUploadProcessFlag } =
      (await this.integrationHeaderFormData()) || {};

    const priceClarifyIssueLines = this.integrationTableData();
    const { businessAttachmentUuid, techAttachmentUuid } = clarifyNotify || {};
    // const files = this.integrationSupplierFile();

    if (!SupplierLineValidate || !headerValidateFlag) {
      if (!supplierLineAttachmentFlag || !headerAttachmentUploadProcessFlag) {
        return;
      }

      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
      });
      return;
    }

    try {
      this.togglePageLoading(true);
      let result = await priceReplySave({
        clarifyNotifyId,
        organizationId: this.organizationId,
        quotationHeaderId,
        clarifyNotify,
        priceClarifyIssueLines,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT_ATTACHMENTS`,
        // ...files,
        businessAttachmentUuid,
        techAttachmentUuid,
      });

      this.togglePageLoading();
      result = operateResponseMessagePrompt({
        res: result,
      });
      if (!result) {
        return;
      }

      this.initPage();
      const TableDS = this.SupplierQuoteTableRef.SupplierQuotationTableDS;
      TableDS.query(TableDS?.currentPage || 1);
    } catch (e) {
      throw e;
    }
  }

  // @Bind()
  // handleBindOnRef(ref = {}) {
  //   this.attachmentRef = ref;
  // }

  // get location
  getLocationSearch(key = null) {
    const { history } = this.props;
    const {
      location: { search = {} },
    } = history || {};
    const RouterParams = querystring.parse(search.substr(1)) || {};
    if (!key || typeof key !== 'string') {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  // get back path
  getBackpath() {
    const backPath = this.getLocationSearch('backPath');
    const activeKey = this.getLocationSearch('activeKey');
    return `${backPath}&activeKey=${activeKey}`;
  }

  render() {
    const {
      pageLoading = false,
      // bUuid = null,
      // tUuid = null,
      doubleUnitFlag,
      currencyPrecision,
      financialPrecision,
      caclRule = null,
    } = this.state;
    const RouterParams = this.getLocationSearch();
    const {
      customizeTable = () => {},
      custLoading,
      customizeCollapseForm,
      replyRemote,
    } = this.props;

    const {
      clarifyNotifyId = null,
      quotationHeaderId,
      sourceFrom,
      supplierCompanyId,
      supplierTenantId,
    } = RouterParams;

    const SupplierProps = {
      headerInfoDS: this.HeaderFormDS,
      organizationId: this.organizationId,
      quotationHeaderId,
      sourceFrom,
      supplierCompanyId,
      supplierTenantId,
      clarifyNotifyId,
      currencyPrecision,
      financialPrecision,
      onTableRef: this.onTableRef,
      getRouterParams: (key) => this.getRouterParams(key),
      customizeTable,
      custLoading,
      quotationName: getQuotationName(this.bidFlag),
      sourceKey: this.sourceKey,
      doubleUnitFlag,
      handleAllSave: this.handleSave,
      caclRule,
      replyRemote,
      bidFlag: this.bidFlag,
    };

    const AttachmentProps = {
      // bucketName: PRIVATE_BUCKET,
      // bucketDirectory: 'ssrc-rfx-quotationheader',
      // viewOnly: false,
      // businessUuid: bUuid,
      // techUuid: tUuid,
      // onRef: this.handleBindOnRef,
      // techAttachmentVisible: false,
      // fileSize: FIlESIZE,
      headerInfoDS: this.HeaderFormDS,
      customizeCollapseForm,
      sourceKey: this.sourceKey,
      custLoading,
    };

    return (
      <>
        <Header
          title={intl.get(`ssrc.supplierQuotation.view.message.title.pNReply`).d('价格澄清回复')}
          backPath={this.getBackpath()}
        >
          <Button icon="check" onClick={this.handleSubmit} color="primary" loading={pageLoading}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" onClick={this.handleSave} loading={pageLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content
          className={classnames(
            CommonStyles['ssrc-common-container'],
            CommonStyles['ssrc-override-c7n-ui']
          )}
        >
          <div className={styles['ssrc-price-clarification-form']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.basicInfomations').d('基础信息')}
            </h3>
            {this.renderForm()}
          </div>

          <div className={CommonStyles['m-t-m']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl
                .get('ssrc.inquiryHall.view.inquiryHall.commonSupplierQuoteDetails', {
                  quotationName: getQuotationName(this.bidFlag),
                })
                .d('供应商{quotationName}详情')}
            </h3>
            <SupplierQuoteDetailTable {...SupplierProps} />
          </div>

          <div className={CommonStyles['m-t-m']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl.get('hzero.common.upload.modal.title').d('附件')}
            </h3>
            <Attachment {...AttachmentProps} />
          </div>
        </Content>
      </>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) =>
  compose(
    WithCustomizeC7N({
      unitCode: [
        `SSRC.${type}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT`,
        `SSRC.${type}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT`,
        `SSRC.${type}_HALL.CLARIFICATION.SUPPLIER_REPLY_LADDER_LEVEL_EDIT`,
        `SSRC.${type}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT_ATTACHMENTS`,
      ],
    }),
    formatterCollections({
      code: [
        'ssrc.expertScoring',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.supplierQuotation',
        'hzero.common',
      ],
    }),
    remote({
      code: 'SSRC_PRICE_REPLY',
      name: 'replyRemote',
    })
  )(Comp);

export default HOCComponent(Update);

export { HOCComponent, Update };
