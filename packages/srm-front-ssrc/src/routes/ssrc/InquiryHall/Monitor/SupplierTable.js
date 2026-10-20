/**
 * inquiryHall - 寻源服务/询价大厅-监控台子组件【供应商列表】
 * @date: 2020-10-27
 * @author: lzj <zhijian.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import {
  phoneRender,
  abandonRemarkRender,
  numberSeparatorRender,
  supplierQuotaitonAbandanRenderStatus,
} from '@/utils/renderer';
import { directionSupplierLifeManagerDetail } from '@/utils/utils';

class SupplierTable extends PureComponent {
  // 报价状态
  renderQuotationStatus = (value = null, record = {}) => {
    if (!value) {
      return null;
    }

    const { quotationStatusMeaning = null } = record || {};
    let renderer = <span>{quotationStatusMeaning}</span>;

    if (value === 'NEW') {
      renderer = <span style={{ color: 'red' }}>{quotationStatusMeaning}</span>;
    }
    if (value === 'QUOTED') {
      renderer = <span style={{ color: 'green' }}>{quotationStatusMeaning}</span>;
    }
    if (value === 'ABANDONED' || value === 'QUOTATION_ABANDONED') {
      renderer = <span style={{ color: 'blue' }}>{quotationStatusMeaning}</span>;
    }

    renderer = supplierQuotaitonAbandanRenderStatus({
      val: renderer,
      record,
    });
    return renderer;
  };

  render() {
    const {
      dataSource,
      pagination,
      fetchMonitorSupplierLineLoading,
      fastBidding,
      quotationName,
      fetchMonitorSupplierLine,
      header = {},
      customizeTable = () => {},
      sourceKey,
      history,
      sslmLifeCycleFlag = true,
      remote,
    } = this.props;
    const {
      sealedQuotationFlag = null,
      quotationScope = null,
      priceTypeCode = null,
      companyId = null,
    } = header || {};
    const showRankFlag = sealedQuotationFlag === 0 && quotationScope === 'ALL_QUOTATION';
    let currentRound = null;
    if (!isEmpty(dataSource)) {
      currentRound = (dataSource[0] || {}).quotationRound || null;
    }

    const PriceCodeText =
      priceTypeCode && priceTypeCode !== 'NET_PRICE'
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
        : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税');

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
        render: (val, record) =>
          record.supplierCompanyId && history ? ( // 加上history判断，为了防止没有扫到的二开点击跳转报错
            <a
              onClick={() =>
                directionSupplierLifeManagerDetail({
                  record,
                  companyId,
                  history,
                  sslmLifeCycleFlag,
                })
              }
            >
              {val}
            </a>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 130,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.feedBackStatus`).d('是否参与'),
        dataIndex: 'feedbackStatusMeaning',
        width: 80,
        render: (value, record) => {
          const { feedbackStatus } = record;
          let fontColor;
          switch (feedbackStatus) {
            case 'PARTICIPATED':
              fontColor = 'green';
              break;
            case 'ABANDONED':
              fontColor = 'blue';
              break;
            case 'NEW':
              fontColor = 'red';
              break;
            default:
              fontColor = 'red';
          }
          return abandonRemarkRender({
            val: <span style={{ color: fontColor }}> {value}</span>,
            record,
          });
        },
      },
      fastBidding && {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.signInFlag`).d('是否签到'),
        dataIndex: 'signInFlag',
        width: 80,
        render: (value) => {
          return value ? (
            <span style={{ color: 'green' }}>
              {' '}
              {intl.get('ssrc.inquiryHall.model.inquiryHall.signInIn').d('已签到')}
            </span>
          ) : (
            <span style={{ color: 'red' }}>
              {' '}
              {intl.get('ssrc.inquiryHall.model.inquiryHall.notSignInIn').d('未签到')}
            </span>
          );
        },
      },
      {
        title: (
          <span>
            {intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationFlag`, {
                quotationName,
              })
              .d('是否{quotationName}')}
            {currentRound ? (
              <span>
                {` (${intl.get('ssrc.common.the').d('第')} ${currentRound} ${intl
                  .get('ssrc.common.round')
                  .d('轮')})`}
              </span>
            ) : null}
          </span>
        ),
        dataIndex: 'quotationStatus',
        width: 130,
        render: this.renderQuotationStatus,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationTotalCount`, { quotationName })
          .d('{quotationName}行数'),
        dataIndex: 'assignItemCountConcatQuotedCount',
        width: 100,
        render: (value) => {
          return value ?? '-';
        },
      },
      showRankFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRank`).d('排名'),
            dataIndex: 'totalAmountRank',
            width: 100,
          }
        : null,
      showRankFlag
        ? {
            title: `${intl
              .get('ssrc.common.totalQuotaionAmount')
              .d('报价总金额')}(${PriceCodeText})`,
            dataIndex: 'benchmarkTotalAmount',
            width: 150,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contactName`).d('联系人'),
        dataIndex: 'contactName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contactMobilePhone`).d('联系方式'),
        dataIndex: 'contactMobilephone',
        width: 200,
        render: (val, record) => phoneRender(record.internationalTelCodeMeaning, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        dataIndex: 'contactMail',
        width: 100,
      },
    ];

    let supplierColumns = remote
      ? remote.process('SSRC_INQUIRY_HALL_MONITOR_PROCESS_SUPPLIER_TABLE_COLUMNS', columns, {
          that: this,
        })
      : columns;

    supplierColumns = (supplierColumns || []).filter(Boolean);

    return customizeTable(
      { code: `SSRC.${sourceKey}_HALL.MONITOR.SUPPLIER_TABLE`, readOnly: true },
      <Table
        rowKey="rfxLineSupplierId"
        bordered
        loading={fetchMonitorSupplierLineLoading}
        dataSource={dataSource}
        columns={supplierColumns}
        pagination={pagination}
        style={{ margin: '16px' }}
        onChange={(page) => fetchMonitorSupplierLine(page)}
      />
    );
  }
}

export default SupplierTable;
