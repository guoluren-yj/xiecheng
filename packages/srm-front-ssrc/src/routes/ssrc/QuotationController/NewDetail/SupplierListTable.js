// 供应商列表table SupplierListTablePrepare

import React, { Component, Fragment } from 'react';
import { Table, Row, Select, TextField, Col, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Button as PermissionButton } from 'components/Permission';
import moment from 'moment';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import warnIcon from '@/assets/warn-icon.svg';
import commonStyle from '@/routes/ssrc/common.less';
import { riskLevelRender } from '@/utils/renderer';
import { ComponentDiffRender } from './utils';
import styles from './index.less';

@observer
export default class SupplierListTable extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.supplierListTableDS.query();
  }

  handleDelete = async () => {
    const { supplierListTableDS, fetchQualificationWarnController } = this.props;
    const res = await supplierListTableDS.delete(supplierListTableDS.selected);
    if (res) fetchQualificationWarnController();
  };

  // table columns
  getColumns() {
    const { supplierLineAllotItem, remote, bidFlag = false } = this.props;
    const columns = [
      {
        name: 'supplierLov',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
        renderer: ({ text, record }) =>
          text ? (
            <Fragment>
              {record.get('qualificationExpiredFlag') === 1 && (
                <Tooltip
                  title={intl
                    .get(`ssrc.inquiryHall.view.tooltip.qualificationExpirationWarning`)
                    .d('资质到期')}
                >
                  <img src={warnIcon} alt="" style={{ marginRight: 8 }} />
                </Tooltip>
              )}
              {text}
            </Fragment>
          ) : null,
      },
      {
        editor: true,
        name: 'priceCoefficient',
        width: 150,
        align: 'left',
        renderer: ({ record, value }) => (
          <ComponentDiffRender
            record={record}
            historyDTO="rfxLineSupplierDTO"
            name="priceCoefficient"
          >
            <span> {value} </span>
          </ComponentDiffRender>
        ),
      },
      {
        name: 'riskLevel',
        width: 120,
        renderer: ({ record, value }) => {
          return riskLevelRender(value, record.get('riskLevelMeaning'));
        },
      },
      {
        name: 'contactNameLov',
        width: 150,
        editor: true,
        renderer: ({ record, value }) => {
          return (
            <ComponentDiffRender record={record} historyDTO="rfxLineSupplierDTO" name="contactName">
              <span> {value ? value.contactName : ''} </span>
            </ComponentDiffRender>
          );
        },
      },
      {
        name: 'contactMobilephoneContainer',
        width: 300,
        renderer: ({ record }) => {
          return (
            <div style={{ width: '100%' }}>
              <Row>
                <Col span={12}>
                  <ComponentDiffRender
                    record={record}
                    historyDTO="rfxLineSupplierDTO"
                    name="internationalTelCode"
                  >
                    <Select
                      record={record}
                      clearButton={false}
                      name="internationalTelCode"
                      style={{ width: '100%' }}
                      renderer={({ text }) => <div> {text} </div>}
                    />
                  </ComponentDiffRender>
                </Col>
                <Col span={12}>
                  <ComponentDiffRender
                    record={record}
                    historyDTO="rfxLineSupplierDTO"
                    name="contactMobilephone"
                  >
                    <TextField
                      name="contactMobilephone"
                      record={record}
                      style={{
                        width: '100%',
                      }}
                      renderer={({ text }) => <div> {text} </div>}
                    />
                  </ComponentDiffRender>
                </Col>
              </Row>
            </div>
          );
        },
      },
      {
        name: 'contactMail',
        width: 250,
        editor: true,
        renderer: ({ record, value }) => (
          <ComponentDiffRender record={record} historyDTO="rfxLineSupplierDTO" name="contactMail">
            <span> {value} </span>
          </ComponentDiffRender>
        ),
      },
      {
        name: 'allotItem',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          !record.get('rfxLineSupplierId') || record.get('showItemAssignFlag') === 1 ? (
            <a className={styles['supplier-link']} onClick={() => supplierLineAllotItem(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.allotItem`).d('分配物料')}
            </a>
          ) : null,
      },
    ].filter(Boolean);

    return remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SUPPLIER_TABLE_COLUMN', columns, {
          bidFlag,
        })
      : columns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      remote,
      custKey,
      customizeTable,
      custLoading,
      supplierListTableDS,
      header = {},
      onBulkAddSupplier,
      supplierConfigOldFlag = true,
      supplierLovProps = {},
      checkPermissionObject = {},
      bidFlag = false,
      location = {},
      qualificationWarnInfo,
      history,
    } = this.props;
    const SupplierLovQueryData = {};
    const { supplierCompanyName, expiredCount } = qualificationWarnInfo || {};

    const {
      rfxHeaderBaseInfoAdjustDTO,
      rfxHeaderBaseInfoAdjustDTO: {
        sourceMethod,
        allowChangeSupplyFlag,
        sourceFrom,
        companyId,
        rfxHeaderId,
        rfxHeaderBaseInfoDTO,
      },
      rfxRequireQuotationAdjustDTO,
    } = header;

    const { currentDateTime, rfxRequireQuotationDTO: { quotationEndDate } = {} } =
      rfxRequireQuotationAdjustDTO || {};
    const { rfxRealityStatus } = rfxHeaderBaseInfoDTO || {};

    SupplierLovQueryData.companyId = companyId || null;
    const allowChangeSupply = allowChangeSupplyFlag === 0 && sourceFrom === 'PROJECT';

    let prefix = bidFlag
      ? 'new-bid-hall.new-rfx-detail-controller'
      : 'new-inquiry-hall.new-rfx-detail-controller';

    if (
      !isEmpty(location) &&
      location.pathname.indexOf('/ssrc/quotation-controller/new-rfx-detail') > -1
    ) {
      prefix = 'quotation-controller.new-rfx-detail-controller';
    } else if (
      !isEmpty(location) &&
      location.pathname.indexOf('/ssrc/bid-quotation-controller/new-rfx-detail') > -1
    ) {
      prefix = 'bid-quotation-controller.new-rfx-detail-controller';
    }

    // 对于寻源方式=邀请的询价、新招标、老竞价、新竞价单据，当报价时间截止，且寻源单据状态≠报价响应不足时，寻源过程控制页面隐藏供应商三个头按钮【批量添加供应商】、【保存】、【批量删除】
    // src-59414 需求直接隐藏整个按钮不合理，现在src-63194先恢复
    let hiddenBtnFlag = false;

    hiddenBtnFlag = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SUPPLIER_TABLE_BUTTON_VISIBLE',
          hiddenBtnFlag,
          {
            bidFlag,
            supplierListTableDS,
            rfxHeaderBaseInfoAdjustDTO,
            rfxRequireQuotationAdjustDTO,
            that: this,
          }
        )
      : hiddenBtnFlag;

    const tableButtons = hiddenBtnFlag
      ? []
      : [
          supplierConfigOldFlag ? (
            <PermissionButton
              onClick={onBulkAddSupplier}
              icon="auto_complete"
              disabled={sourceMethod !== 'INVITE' || allowChangeSupply}
              type="c7n-pro"
              name="supplierLovList"
              permissionList={[
                {
                  code: `${prefix}.button.batch-add-supplier`?.toLowerCase(),
                  type: 'button',
                  meaning:
                    intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('询价工作台') -
                    intl
                      .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
                      .d('批量添加供应商'),
                },
              ]}
            >
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
                .d('批量添加供应商')}
            </PermissionButton>
          ) : checkPermissionObject?.['batch-add-supplier']?.approve ? (
            <SupplierLov
              {...supplierLovProps}
              queryData={SupplierLovQueryData}
              disabled={sourceMethod !== 'INVITE' || allowChangeSupply}
            >
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.button.bulkAddSupplier')
                .d('批量添加供应商')}
            </SupplierLov>
          ) : null,
          'save',
          <TooltipButtonPro
            name="delete"
            icon="delete_sweep"
            disabled={isEmpty(supplierListTableDS.selected)}
            onClick={this.handleDelete}
            help={intl
              .get('ssrc.common.view.message.supplier-line.select.tip')
              .d('请先勾选供应商行')}
          >
            {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
          </TooltipButtonPro>,
        ].filter(Boolean);

    const TableButtons = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SUPPLIER_TABLE_BUTTON',
          tableButtons,
          {
            bidFlag,
            rfxHeaderId,
            supplierListTableDS,
            rfxHeaderBaseInfoAdjustDTO,
            history,
          }
        )
      : tableButtons;

    return (
      <React.Fragment>
        {!!supplierCompanyName && (
          <Alert
            showIcon
            message={intl
              .get(`ssrc.inquiryHall.view.message.qualificationWarnInfo`, {
                supplierCompanyName,
                expiredCount,
              })
              .d(
                '{supplierCompanyName}等{expiredCount}家供应商在供应商360资质认证已到期，请确认是否邀请！'
              )}
            type="error"
            className={commonStyle['ssrc-alert-error']}
            style={{ margin: '20px 0 20px 0' }}
          />
        )}
        <div className={styles['supplier-table']}>
          {customizeTable(
            {
              code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER`,
              buttonCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_BUTTONS`,
            },
            <Table
              bordered
              buttons={TableButtons}
              custLoading={custLoading}
              dataSet={supplierListTableDS}
              rowKey="rfxLineSupplierId"
              columns={this.getColumns()}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}
