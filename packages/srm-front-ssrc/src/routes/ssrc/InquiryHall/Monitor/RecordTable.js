/**
 * inquiryHall - 寻源服务/询价大厅-监控台子组件【询报价历史Table】
 * @date: 2019-2-22
 * @author: lbc <baocheng.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Badge } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import { Table, Popover, Icon, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { isNil } from 'lodash';

import { dateTimeRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';
import IPAddress from '@/routes/components/IPAddress';
import { getPriceName, getNetPriceName } from '@/utils/utils';
import OverlappingSupplier from '@/routes/ssrc/InquiryHall/Detail/OverlappingSupplier';
import NoOverlappingSupplier from '@/routes/ssrc/InquiryHall/Detail/NoOverlappingSupplier';

class RecordTable extends PureComponent {
  handleOpenIPCoincide = (val, record) => {
    const { rfxHeaderId } = this.props;
    const Props = {
      sourceHeaderId: rfxHeaderId,
      whetherIpCoincide: val,
      rfxLineSupplierId: record.rfxLineSupplierId,
      quotationHeaderId: record.quotationHeaderId,
    };
    Modal.open({
      key: 'ssrc-ip-coincide',
      title: intl.get('ssrc.common.model.common.IPDetail').d('IP详情'),
      children: val ? <OverlappingSupplier {...Props} /> : <NoOverlappingSupplier {...Props} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  };

  render() {
    const {
      dataSource,
      pagination,
      fetchRecordLoading,
      header = {},
      customizeTable,
      sourceKey,
      quotationName,
      bidFlag,
      doubleUnitFlag,
      useNewRateFlag = 0,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRank`).d('排名'),
        dataIndex: 'ranking',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
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
      header.rankRule === 'WEIGHT_PRICE'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
            dataIndex: 'weightPrice',
            width: 100,
            render: (val) => numberSeparatorRender(val),
          }
        : '',
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            dataIndex: 'quotationSecondaryPrice',
            width: 100,
            align: 'right',
            render: (val, record) => {
              if (!record.quotationPriceStatus) {
                return numberSeparatorRender(val);
              } else {
                return record.quotationPriceStatusMeaning;
              }
            },
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.netPrice').d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
            render: (val) => numberSeparatorRender(val),
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'quotationPrice',
        width: 100,
        align: 'right',
        render: (val, record) => {
          if (!record.quotationPriceStatus) {
            return numberSeparatorRender(val);
          } else {
            return record.quotationPriceStatusMeaning;
          }
        },
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 100,
        render: (val) => numberSeparatorRender(val),
      },
      header.rankRule === 'WEIGHT_PRICE'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
            dataIndex: 'priceCoefficient',
            width: 100,
          }
        : '',
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次'),
        dataIndex: 'quotationRoundNumber',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCount`).d('报价次数'),
        dataIndex: 'quotationCount',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 120,
        render: (val) => dateTimeRender(val),
      },
      !useNewRateFlag
        ? {
            title: (
              <span>
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationIPRFX`, { quotationName })
                  .d('{quotationName}IP')}
                <Tooltip
                  title={intl
                    .get('ssrc.common.view.ipOnlyReferenceWarning')
                    .d('供应商报价/投标时，IP可通过使用代理服务等操作进行包装，此结果仅用于参考')}
                >
                  <Icon type="question-circle" style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            ),
            dataIndex: 'supplierCompanyIp',
            width: 120,
            // render: (val, record) => {
            //   if (record.repeatIpFlag) {
            //     return <span style={{ color: 'red' }}> {val} </span>;
            //   } else {
            //     return val;
            //   }
            // },
            render: (val, record) => {
              const { repeatIpFlag } = record || {};
              let text = val ?? '';
              if (repeatIpFlag) {
                text = <span style={{ color: 'red' }}> {val} </span>;
              }

              return <IPAddress text={text} record={record} bidFlag={bidFlag} />;
            },
          }
        : null,
      useNewRateFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`).d('IP是否重合'),
            dataIndex: 'whetherIpCoincide',
            width: 150,
            render: (val, record) =>
              isNil(val) ? (
                val
              ) : (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => this.handleOpenIPCoincide(val, record)}
                >
                  <Badge style={{ marginTop: '-2px' }} status={val ? 'error' : 'success'} />
                  <span>
                    {val
                      ? intl.get(`hzero.common.model.yes`).d('是')
                      : intl.get(`hzero.common.model.no`).d('否')}
                  </span>
                </span>
              ),
          }
        : null,
    ].filter(Boolean);

    return customizeTable(
      { code: `SSRC.${sourceKey}_HALL.MONITOR.HISTORY_TABLE`, readOnly: true },
      <Table
        rowKey="uniqueKey"
        bordered
        loading={fetchRecordLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        style={{ margin: '16px' }}
      />
    );
  }
}

export default RecordTable;
