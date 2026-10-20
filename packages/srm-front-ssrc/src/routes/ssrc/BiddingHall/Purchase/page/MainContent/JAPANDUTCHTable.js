/**
 * 日式，荷兰
 *
 * 平铺表列表- table
 */

import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { observer } from 'mobx-react';
// import { isNil } from 'lodash';

import { japanDutchRoundTabletDS } from '../../stores/totalPriceDS';
import { getSupplierStatusTagColor } from '../../../utils/statusColor';

const JAPANDUTCHTable = (props = {}) => {
  const {
    record: roundRecord,
    commonProps,
    header,
    biddingRuleDataSet,
    headerInfoDS,
    organizationId,
  } = props || {};
  const {
    biddingStatus,
    sealedQuotationFlag, // 是否是密封报价
    biddingQuotationMethod, // 竞价或者拍卖
    biddingType,
    biddingAnonymousQuotesFlag, // 是否匿名报价
    biddingNotStartFlag,
    biddingEndFlag,
  } = header || {};

  const { current } = headerInfoDS || {};

  if (!roundRecord) {
    return '';
  }

  const { trialBiddingFlag } = current ? current.get(['trialBiddingFlag']) : {};

  const { biddingRoundDateId, biddingRoundStatus } =
    roundRecord.get(['biddingRoundDateId', 'biddingRoundStatus']) || {};

  const { rankRule } = biddingRuleDataSet?.current?.get(['rankRule']) || {};

  const tableDS = useMemo(() => new DataSet(japanDutchRoundTabletDS()), []);

  // 提交参数
  const tableProps = useMemo(() => {
    return {
      ...commonProps,
      rankRule,
      biddingRoundDateId,
      biddingRoundStatus,
      biddingQuotationMethod,
      biddingType,
      biddingAnonymousQuotesFlag,
      biddingStatus,
      sealedQuotationFlag,
      biddingNotStartFlag,
      biddingEndFlag,
      organizationId,
    };
  }, [
    commonProps,
    rankRule,
    biddingRoundDateId,
    biddingRoundStatus,
    biddingQuotationMethod,
    biddingType,
    trialBiddingFlag,
    biddingAnonymousQuotesFlag,
    biddingStatus,
    sealedQuotationFlag,
  ]);

  useEffect(() => {
    tableDS.setQueryParameter('tableProps', tableProps);
    tableDS.query();

    return () => {
      tableDS.reset();
    };
  }, [tableProps, roundRecord, tableDS, trialBiddingFlag]);

  const columns = useMemo(() => {
    const allColumns = [
      {
        name: 'disSupplierCompanyName',
      },
      !biddingAnonymousQuotesFlag
        ? {
            name: 'supplierCompanyNum',
            width: 360,
          }
        : null,
      {
        name: 'biddingRoundSupplierStatus',
        width: 150,
        renderer: ({ record }) => {
          const { biddingRoundSupplierStatus, biddingRoundSupplierStatusMeaning } = record.get([
            'biddingRoundSupplierStatus',
            'biddingRoundSupplierStatusMeaning',
          ]);

          if (!biddingRoundSupplierStatus) {
            return '-';
          }

          const color = getSupplierStatusTagColor({ status: biddingRoundSupplierStatus });

          return (
            <Tag color={color} border={null}>
              {biddingRoundSupplierStatusMeaning}
            </Tag>
          );
        },
      },
    ].filter(Boolean);

    return allColumns;
  }, [
    sealedQuotationFlag,
    headerInfoDS,
    roundRecord,
    biddingRuleDataSet,
    biddingAnonymousQuotesFlag,
    tableDS,
    // handleDeleteNewPrice,
  ]);

  return (
    <Table
      dataSet={tableDS}
      columns={columns}
      // customizable
      // customizedCode="SSRC.BIDDING_HALL."
      style={{ maxHeight: '200px' }}
      virtual
      virtualCell
    />
  );
};

export default observer(JAPANDUTCHTable);
