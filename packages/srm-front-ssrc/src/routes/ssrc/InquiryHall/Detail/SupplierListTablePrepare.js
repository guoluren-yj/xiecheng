// 供应商列表table SupplierListTablePrepare

import React, { PureComponent } from 'react';
import { Table, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import EmbedPage from '_components/EmbedPage';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { phoneRender, riskLevelRender } from '@/utils/renderer';
import { fetchEnterpriceRiskControlConfig } from '@/services/commonService';
import { ContactPhone } from '@/routes/ssrc/InquiryHallNew/Update/Components';
import BulkAddSupplierModal from '@/routes/ssrc/InquiryHallNew/Update/BulkAddSupplierModal';
import { BulkAddSupplierDS } from '@/routes/ssrc/InquiryHallNew/Update/BulkAddSupplierDS';
import { supplierAttachment, saveSupplierLine } from '@/services/inquiryHallService';

export default class SupplierListTablePrepare extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      enterpriceRiskControllerButtonsVisible: {
        RELATION_MINING: 0, // 关系图谱（关系挖掘）
        RISK_SCAN: 0, // 风险扫描
        // 'QCC_FIND_RELATION_VARIOUS_V1': 0, // 找关系
      },
    };
  }

  componentDidMount() {
    this.enterpriceRiskControllerButtonConfig();
  }

  enterpriceRiskControllerButtonConfig = async () => {
    const { organizationId } = this.props;
    let result = null;

    const params = {
      organizationId,
      applicationCode: 'AP_CREDIT',
      serviceCode: 'RISK_SCAN,RELATION_MINING', // 找关系，关系图谱（关系挖掘），风险扫描,
    };

    try {
      result = await fetchEnterpriceRiskControlConfig(params);
      result = getResponse(result || isEmpty(result));
      if (!result) {
        return;
      }

      this.setState({
        enterpriceRiskControllerButtonsVisible: result,
      });
    } catch (e) {
      throw e;
    }
  };

  // 跳转供应商生命周期
  handleJumpToSupplierLifecycle = (record, e) => {
    e.stopPropagation();
    const { dispatch, sslmLifeCycleNewUser } = this.props;
    const {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    } = record.get([
      'tenantId',
      'companyId',
      'partnerCompanyId',
      'partnerTenantId',
      'spfmSupplierCompanyId',
      'spfmCompanyId',
      'supplierCompanyId',
    ]);
    const params = {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId: spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    };

    const pathUrl = sslmLifeCycleNewUser
      ? '/sslm/supplier-detail-new'
      : '/sslm/include/supplier-manager/supplier-detail';
    // '/sslm/supplier-life-manage/supplier-detail';

    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: pathUrl,
          search: querystring.stringify(params),
        }),
      });
    } else {
      dispatch(
        routerRedux.push({
          pathname: pathUrl,
          search: querystring.stringify(params),
        })
      );
    }
  };

  // 展示风险提示
  renderRiskRelation = () => {
    const { rfxInfoDS, remote, currentStep } = this.props;
    const { current } = rfxInfoDS || {};

    let dom = '';
    if (current) {
      const { rfxNum, secondarySourceCategory } = current?.get([
        'rfxNum',
        'secondarySourceCategory',
      ]);
      dom = (
        <div style={{ marginTop: '20px' }}>
          <EmbedPage
            href="/public/sdat/relation-troubleshoot"
            location={{
              search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${getCurrentOrganizationId()}`,
            }}
          />
        </div>
      );
    }

    dom = remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_SUPPLIER_RENDERRISKRELATIONN_DOM', dom, {
          that: this,
          rfxInfoDS,
          currentStep,
        })
      : dom;

    return dom;
  };

  // table columns
  getColumns() {
    const {
      onLinkRiskScan = () => {},
      supplierLineAllotItem,
      serviceChargeFlag,
      remote,
      rfx = {},
    } = this.props;
    const { enterpriceRiskControllerButtonsVisible = {} } = this.state;
    const { RISK_SCAN = 0 } = enterpriceRiskControllerButtonsVisible || {};
    const { bidFlag = false } = rfx || {};

    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
        renderer: ({ record, value }) => {
          const {
            tenantId,
            partnerCompanyId,
            partnerTenantId,
            spfmSupplierCompanyId,
          } = record.get([
            'tenantId',
            'partnerCompanyId',
            'partnerTenantId',
            'spfmSupplierCompanyId',
          ]);
          return tenantId && partnerTenantId && (partnerCompanyId || spfmSupplierCompanyId) ? (
            <a onClick={(e) => this.handleJumpToSupplierLifecycle(record, e)}>{value}</a>
          ) : (
            value
          );
        },
      },
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        name: 'supplierCategoryDescription',
        width: 150,
      },
      {
        name: 'priceCoefficient',
        width: 150,
      },
      {
        name: 'stageDescription',
        width: 150,
      },
      {
        name: 'riskLevel',
        width: 120,
        renderer: ({ record, value }) => {
          return riskLevelRender(value, record.get('riskLevelMeaning'));
        },
      },
      RISK_SCAN
        ? {
            name: 'riskScan',
            width: 150,
            renderer: ({ record }) => {
              const { rfxLineSupplierId, supplierCompanyId } = record.get([
                'rfxLineSupplierId',
                'supplierCompanyId',
              ]);

              return rfxLineSupplierId ? (
                <a onClick={() => onLinkRiskScan(record)} disabled={!supplierCompanyId}>
                  {intl.get(`ssrc.inquiryHall.view.message.button.riskScan`).d('风险扫描')}
                </a>
              ) : null;
            },
          }
        : null,
      {
        name: 'contactName',
        width: 150,
      },
      {
        name: 'contactMobilephone',
        width: 200,
        renderer: ({ record }) => {
          return phoneRender(
            record.get('internationalTelCodeMeaning'),
            record.get('contactMobilephone')
          );
        },
      },
      {
        name: 'contactMail',
        width: 120,
      },
      serviceChargeFlag && {
        name: 'bidFileExpensePaymentRuleMeaning',
        width: 120,
      },
      serviceChargeFlag && {
        name: 'depositPaymentRuleMeaning',
        width: 120,
      },
      {
        name: 'viewItemLine',
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          record.get('rfxLineSupplierId') ? (
            <div>
              <a onClick={() => supplierLineAllotItem(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.viewAllotItem`).d('查看物料')}
              </a>
              &nbsp;({record.get('itemAllotCount')}/{record.get('itemTotalCount')})
              {record.get('itemAllotCount') === record.get('itemTotalCount') ? null : record.get(
                  'itemAllotCount'
                ) === 0 ? (
                  <Icon type="brightness_o" style={{ color: 'gray', marginLeft: '5px' }} />
              ) : (
                <Icon type="timelapse" style={{ color: 'gray', marginLeft: '5px' }} />
              )}
            </div>
          ) : null,
      },
    ].filter(Boolean);

    return remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_SUPPLIER_TABLE_COLUMN', columns, {
          bidFlag,
          ...this.props,
          ContactPhone,
        })
      : columns;
  }

  renderTableButtons() {
    const { remote, supplierListTableDS, rfx, rfxId, rfxInfoDS, customizeTable } = this.props;

    const { enterpriceRiskControllerButtonsVisible = {} } = this.state;
    const { RELATION_MINING = 0 } = enterpriceRiskControllerButtonsVisible || {};

    const buttons = [].filter(Boolean);
    if (!remote) return buttons;
    const processProps = {
      RELATION_MINING,
      supplierListTableDS,
      rfx,
      rfxHeaderId: rfxId,
      rfxInfoDS,
      BulkAddSupplierModal,
      BulkAddSupplierDS,
      customizeTable,
      supplierAttachment,
      saveSupplierLine,
    };
    return remote.process(
      'SSRC_INQUIRY_HALL_DETAIL_PROCESS_SUPPLIER_TABLE_PREPARE_BUTTONS',
      buttons,
      processProps
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { customizeTable, custLoading, supplierListTableDS, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    return (
      <React.Fragment>
        {this.renderRiskRelation()}
        {customizeTable(
          { code: `SSRC.${unitCodeSymbol}_DETAIL.LINE_SUPPLIER` },
          <Table
            bordered
            custLoading={custLoading}
            dataSet={supplierListTableDS}
            rowKey="rfxLineSupplierId"
            columns={this.getColumns()}
            style={{ marginTop: '16px', maxHeight: 450 }}
            buttons={this.renderTableButtons()}
          />
        )}
      </React.Fragment>
    );
  }
}
