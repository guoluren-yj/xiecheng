// 对供应商要求form

import React, { Component } from 'react';
import { DataSet, Modal, Output, Attachment, Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';
// import Upload from '_components/Upload';
import intl from 'utils/intl';
import { PUBLIC_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import SupplierListTablePrepare from './SupplierListTablePrepare';
import { SupplierFilterItemForm } from './SupplierView';
import { SupplierFilterItemDS } from './SuppliersDS';

export default class SupplierWithRequestForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.init = true;
    this.SupplierFilterItemDS = new DataSet(SupplierFilterItemDS());
  }

  shouldComponentUpdate() {
    if (this.init) {
      return true;
    } else {
      return false;
    }
  }

  componentDidUpdate() {
    const record = this.props.rfxInfoDS.current || null;
    const rfxHeaderId = record?.get('rfxHeaderId');
    if (!rfxHeaderId) {
      return;
    }
    this.init = false;
  }

  initSupplierFilterItemDS() {
    const { rfxId, organizationId, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx || {};
    this.SupplierFilterItemDS.setQueryParameter('commonProps', {
      rfxHeaderId: rfxId,
      organizationId,
      customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.SUPPLIER_ALLOT_ITEM`,
    });
  }

  // 供应商查看分配无聊modal
  @Bind()
  supplierLineAllotItem(record = {}) {
    this.initSupplierFilterItemDS();
    const { rfxId, organizationId, customizeTable, rfx = {}, remote } = this.props;

    const { unitCodeSymbol } = rfx || {};

    const data = record.toData() || {};
    const { rfxLineSupplierId } = data;
    const params = {
      rfxHeaderId: rfxId,
      rfxLineSupplierId,
      organizationId,
      customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.SUPPLIER_ALLOT_ITEM`,
    };
    this.SupplierFilterItemDS.setQueryParameter(
      'commonProps',
      remote
        ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_ALLOT_ITEM_PARAMS', params, {
            bidFlag: rfx?.bidFlag,
          })
        : params
    );
    this.SupplierFilterItemDS.query();

    const Props = {
      SupplierFilterItemDS: this.SupplierFilterItemDS,
      customizeTable,
      rfx,
    };
    const modalKey = Modal.key();
    Modal.open({
      drawer: true,
      closable: true,
      destroyOnClose: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.title.viewAllotItemLine`).d('查看分配物料'),
      children: <SupplierFilterItemForm {...Props} />,
      style: { width: '742px' },
      okButton: false,
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  }

  // 多选lov文本渲染
  renderMultiLovText(value = null) {
    return <Tooltip title={value}>{value || '-'}</Tooltip>;
  }

  getFields = () => {
    const { rfxInfoDS, remote } = this.props;
    const sourceMethod = rfxInfoDS?.current?.get('sourceMethod');
    const industryVisible = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_INDUSTRYVISIBLE',
          sourceMethod && sourceMethod !== 'INVITE',
          { sourceMethod, rfxInfoDS }
        )
      : sourceMethod && sourceMethod !== 'INVITE';

    const Fields = [
      <Output name="sourceMethodMeaning" />,
      <div name="sourceMethod_1" fieldClassName="td-no-visible" />,
      <div name="sourceMethod_2" fieldClassName="td-no-visible" />,
      industryVisible ? <Output name="organizationTypeMeaning" /> : false,
      industryVisible ? (
        <Output name="industryData" renderer={({ value }) => this.renderMultiLovText(value)} />
      ) : (
        false
      ),
      industryVisible ? (
        <Output
          name="industryCategoryData"
          renderer={({ value }) => this.renderMultiLovText(value)}
        />
      ) : (
        false
      ),
      <Output name="expandScopeMeaning" />,
    ];
    return Fields.filter(Boolean);
  };

  // 公告fields
  getNoticeFields() {
    const {
      // organizationId,
      btnFlag = false,
      previewNotice,
      disabledAllLinkFlag = false,
    } = this.props;

    const Fields = [
      <Output name="noticeTitle" />,
      <Output name="noticeDays" />,
      // <Output
      //   name="noticeAttachmentUuid"
      //   newLine
      //   renderer={({ value }) => (
      //     <Upload
      //       viewOnly
      //       filePreview
      //       icon=""
      //       // icon={<Icon style={{ paddingRight: '5px' }} type="find_in_page" />}
      //       btnText={
      //         <span className={styles['uploda-title-text']}>
      //           {intl.get(`ssrc.bidHall.model.bidHall.viewRfxNoticeAttachment`).d('查看公告附件')}
      //         </span>
      //       }
      //       name="noticeAttachmentUuid"
      //       label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
      //       bucketName={PUBLIC_BUCKET}
      //       bucketDirectory="ssrc-rfx-tender-notice"
      //       attachmentUUID={value}
      //       tenantId={organizationId}
      //     />
      //   )}
      // />,
      <Attachment
        readOnly
        name="noticeAttachmentUuid"
        label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
        bucketName={PUBLIC_BUCKET}
        bucketDirectory="ssrc-rfx-tender-notice"
        style={{ paddingLeft: '10px' }}
        newLine
      />,
      btnFlag ? null : (
        <Output
          name="noticePreview"
          labelLayout="none"
          renderer={() => (
            <a onClick={previewNotice} disabled={disabledAllLinkFlag}>
              {/* <Icon type="find_in_page" style={{ paddingRight: '3px' }} /> */}
              <span>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.noticePreview').d('公告预览')}
              </span>
            </a>
          )}
        />
      ),
    ].filter(Boolean);

    return Fields;
  }

  // 保证金
  rendererBidBond({ value = null }) {
    if (!value) {
      return intl.get('ssrc.common.view.gratis').d('免费');
    }

    return numberSeparatorRender(value);
  }

  // 商务要求
  getBusinessRequest = () => {
    const fields = [
      <Output name="bidFileExpense" renderer={(value) => this.rendererBidBond(value)} />,
      <Output name="bidBond" renderer={(value) => this.rendererBidBond(value)} />,
      <Output name="serviceExpenseChargeFlag" renderer={({ value }) => yesOrNoRender(value)} />,
      <div name="biddingBusinessRequestField_1_3" fieldClassName="td-no-visible" />, // 个性化表单占位符，不删除，平台隐藏
      <Output name="paymentTypeName" />,
      <Output name="paymentTermName" />,
      <div name="biddingBusinessRequestField_2_3" fieldClassName="td-no-visible" />,
    ];
    return fields;
  };

  getSupplierStageFields() {
    const Fields = [<Output name="allowSourceSupplierStages" colSpan={2} />];
    return Fields;
  }

  render() {
    const {
      rfxInfoDS = {},
      sourceNoticeDS = {},
      supplierListTableDS = {},
      biddingBusinessRequestDS = {},
      custLoading = null,
      customizeTable,
      onLinkRiskScan,
      rfxId,
      customizeCollapseForm,
      rfx = {},
      dispatch,
      // riskScanFlag,
      organizationId,
      remote,
      serviceChargeFlag,
      sslmLifeCycleNewUser,
      match,
      location,
      history,
      currentStep,
    } = this.props;
    const { unitCodeSymbol } = rfx;

    const record = rfxInfoDS.current || null;
    if (!record) {
      return [];
    }

    const { biddingHallFlag } = rfxInfoDS.getQueryParameter('commonProps') || {};
    const { sourceCategory, biddingFlag } = record.get(['sourceCategory', 'biddingFlag']) || {};
    // 竞价大厅标识
    const newBiddingFlag =
      !!biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    const sourceMethod = record.get('sourceMethod');

    const supplierListTableProps = {
      organizationId,
      // riskScanFlag,
      rfxId,
      sourceMethod,
      supplierListTableDS,
      customizeTable,
      custLoading,
      onLinkRiskScan,
      supplierLineAllotItem: this.supplierLineAllotItem,
      rfx,
      dispatch,
      serviceChargeFlag,
      remote,
      sslmLifeCycleNewUser,
      rfxInfoDS,
      match,
      location,
      history,
      currentStep,
    };
    const displayFormFlag = remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_DISPLAYFORMFLAG', false, { rfxInfoDS })
      : false;

    return (
      <div>
        <div>
          <h4 id="supplierWithRequestSide" className={styles['rfx-card-item-title-level-two']}>
            <div className={styles['rfx-card-item-title-line']} />
            {intl
              .get('ssrc.inquiryHall.view.inquiryHall.participateSupplierScope')
              .d('可参与供应商范围')}
          </h4>
          <div className={styles['rfx-card-item-form']}>
            {customizeCollapseForm(
              {
                code: `SSRC.${unitCodeSymbol}_DETAIL.SOURCE_METHOD`,
                dataSet: rfxInfoDS,
                labelLayout: 'float',
              },
              <CollapseForm
                labelLayout="vertical"
                className="c7n-pro-vertical-form-display"
                columns={3}
                dataSet={rfxInfoDS}
                useWidthPercent
              >
                {this.getFields()}
              </CollapseForm>
            )}
            {sourceMethod !== 'INVITE' || displayFormFlag
              ? customizeCollapseForm(
                  {
                    code: `SSRC.${unitCodeSymbol}_DETAIL.NOTICE`,
                    dataSet: sourceNoticeDS,
                    labelLayout: 'float',
                  },
                <CollapseForm
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                  columns={3}
                  dataSet={sourceNoticeDS}
                  style={{ marginTop: '8px' }}
                  useWidthPercent
                >
                  {this.getNoticeFields()}
                </CollapseForm>
                )
              : null}
          </div>
        </div>
        {sourceMethod === 'INVITE' ? (
          <SupplierListTablePrepare {...supplierListTableProps} />
        ) : null}

        {newBiddingFlag && (
          <div>
            <h4
              id="supplierWithRequestSide"
              className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
            >
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.businessRequest').d('商务要求')}
            </h4>
            <div className={styles['rfx-card-item-form']}>
              {customizeCollapseForm(
                {
                  code: `SSRC.${unitCodeSymbol}_DETAIL.BUSINESS_REQUEST`,
                  dataSet: biddingBusinessRequestDS,
                  labelLayout: 'vertical',
                },
                <CollapseForm
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                  columns={3}
                  showLines={3}
                  dataSet={biddingBusinessRequestDS}
                  useWidthPercent
                >
                  {this.getBusinessRequest()}
                </CollapseForm>
              )}
            </div>
          </div>
        )}

        <div className={styles['rfx-card-item-form']}>
          {customizeCollapseForm(
            {
              code: `SSRC.${unitCodeSymbol}_DETAIL.ALLOW_SUPPLIERSTAGE`,
              dataSet: rfxInfoDS,
              labelLayout: 'float',
            },
            <CollapseForm
              labelLayout="vertical"
              className="c7n-pro-vertical-form-display"
              columns={3}
              dataSet={rfxInfoDS}
              style={{ marginTop: '16px' }}
              useWidthPercent
            >
              {this.getSupplierStageFields()}
            </CollapseForm>
          )}
        </div>
      </div>
    );
  }
}
