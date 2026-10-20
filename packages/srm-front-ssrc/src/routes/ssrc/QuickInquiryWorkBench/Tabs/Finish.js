import React, { useMemo, useCallback, useState } from 'react';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Tooltip, Icon } from 'choerodon-ui';
import classNames from 'classnames';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { statusRender, quotationRoundsRender } from '../utils';

import styles from '../index.less';

export default observer(function Finish(props = {}) {
  const {
    dataSet,
    customizeTable = noop,
    doubleUnitFlag = false,
    tableDisplayMap = {},
    onChangeAggregation = noop,
    onHandleJumpDetail = noop,
    renderOperate = noop,
    onShowQuoLadderLevelModal = noop,
    onShowPriceAdjustmentModal = noop,
  } = props || {};

  // 是否聚合
  const [aggregation, setAggregation] = useState(tableDisplayMap?.finish?.isAggregation || false);

  // 改变表格聚合平铺形态
  const changeTableDisplay = (aggregationType = false) => {
    if (aggregationType === aggregation) {
      return;
    }
    setAggregation(aggregationType);
    // 修改props中aggregation值 记录缓存值
    onChangeAggregation('finish', aggregationType);
  };

  const rightRender = useCallback(() => {
    return (
      <div className={styles['view-search']}>
        <Tooltip
          title={intl.get('ssrc.quickInquiry.model.quickInquiry.flatTableView').d('平铺表视图')}
        >
          <div
            className={classNames(
              styles['search-config'],
              aggregation ? '' : styles['active-table-wide']
            )}
            onClick={() => changeTableDisplay(false)}
          >
            <Icon type="reorder" className={!aggregation ? 'primaryColor' : 'disabled'} />
          </div>
        </Tooltip>
        <Tooltip
          title={intl
            .get('ssrc.quickInquiry.model.quickInquiry.aggregateTableView')
            .d('聚合表视图')}
        >
          <div
            className={classNames(
              styles['search-config'],
              aggregation ? styles['active-table-wide'] : ''
            )}
            onClick={() => changeTableDisplay(true)}
            style={{
              marginLeft: '8px',
            }}
          >
            <Icon type="view_day" className={aggregation ? 'primaryColor' : 'disabled'} />
          </div>
        </Tooltip>
      </div>
    );
  }, [aggregation]);

  const columns = useMemo(() => {
    return [
      {
        name: 'quotationStatus',
        width: 100,
        renderer: ({ record, value }) => {
          return statusRender(value, record.get('quotationStatusMeaning'));
        },
      },
      {
        name: 'operate',
        width: aggregation ? 120 : 220,
        renderer: ({ record }) => renderOperate({ record }, aggregation),
      },
      {
        name: 'batchNo',
        width: 150,
        renderer: ({ record, value }) => <a onClick={() => onHandleJumpDetail(record)}>{value}</a>,
      },
      {
        name: 'priceAdjustmentInfo',
        header: intl
          .get('ssrc.quickInquiry.model.quickInquiry.priceAdjustmentInfo')
          .d('调价单信息'),
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'priceAdjustmentCode',
            width: 130,
            renderer: ({ record, value }) => {
              return value ? (
                <a onClick={() => onShowPriceAdjustmentModal(record)}>{value}</a>
              ) : null;
            },
          },
        ],
      },
      {
        name: 'itemOne',
        header: intl.get('ssrc.quickInquiry.model.quickInquiry.itemInfo').d('物料信息') + 1,
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'itemCode',
            width: 130,
          },
          {
            name: 'itemName',
            width: 150,
          },
          {
            name: 'secondaryUomName',
            width: 120,
          },
          {
            name: 'uomName',
            width: 120,
            hidden: !doubleUnitFlag,
          },
          {
            name: 'secondaryTargetPrice',
            width: 150,
            align: 'right',
          },
          {
            name: 'targetPrice',
            width: 150,
            align: 'right',
            hidden: !doubleUnitFlag,
          },
        ].filter(Boolean),
      },
      {
        name: 'organizationInfo',
        header: intl.get(`ssrc.quickInquiry.model.quickInquiry.orgInfos`).d('组织信息'),
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'companyName',
            width: 180,
          },
          {
            name: 'ouName',
            width: 100,
          },
          {
            name: 'invOrganizationName',
            width: 130,
          },
          {
            name: 'purOrganizationName',
            width: 100,
          },
          {
            name: 'purchaseName',
            width: 100,
          },
        ].filter(Boolean),
      },
      {
        name: 'supplierInfo',
        header: intl.get(`ssrc.quickInquiry.model.quickInquiry.supplierInfo`).d('供应商信息'),
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'supplierCompanyNum',
            width: 150,
          },
          {
            name: 'supplierCompanyName',
            width: 180,
          },
          {
            name: 'contactName',
            width: 150,
          },
          {
            name: 'contactMobilephone',
            width: 150,
            renderer: ({ record, text }) =>
              [record.getField('contactAreaCode')?.getText(record.get('contactAreaCode')), text]
                .filter(Boolean)
                .join(' | '),
          },
          {
            name: 'contactMail',
            width: 150,
          },
        ].filter(Boolean),
      },
      {
        name: 'quotationInfo',
        header: intl.get(`ssrc.quickInquiry.model.quickInquiry.quotationInfo`).d('报价信息'),
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'roundNumber',
            width: 120,
            renderer: ({ record }) => quotationRoundsRender(record),
          },
          {
            name: 'localQuotationSecPrice',
            width: 120,
            align: 'right',
          },
          {
            name: 'localQuotationPrice',
            width: 120,
            align: 'right',
            hidden: !doubleUnitFlag,
          },
          {
            name: 'localNetSecPrice',
            width: 120,
            align: 'right',
          },
          {
            name: 'localNetPrice',
            width: 120,
            align: 'right',
            hidden: !doubleUnitFlag,
          },
        ].filter(Boolean),
      },
      {
        name: 'itemTwo',
        header: intl.get('ssrc.quickInquiry.model.quickInquiry.itemInfo').d('物料信息') + 2,
        width: 220,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'targetPriceType',
            width: 120,
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
            name: 'ladderInquiryFlag',
            width: 150,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'ladderInquiry',
            width: 150,
            renderer: ({ record }) => {
              return record.get('ladderInquiryFlag') ? (
                <a onClick={() => onShowQuoLadderLevelModal(record)}>
                  {intl.get(`hzero.common.button.view`).d('查看')}
                </a>
              ) : null;
            },
          },
          {
            name: 'quotationExpiryDateFrom',
            width: 150,
          },
          {
            name: 'quotationExpiryDateTo',
            width: 150,
          },
          {
            name: 'itemCategoryName',
            width: 150,
          },
          {
            name: 'brand',
            width: 150,
          },
          {
            name: 'specs',
            width: 150,
          },
          {
            name: 'minLimitPrice',
            width: 150,
            align: 'right',
          },
          {
            name: 'maxLimitPrice',
            width: 150,
            align: 'right',
          },
        ].filter(Boolean),
      },
      {
        name: 'purchaseInfo',
        header: intl.get('ssrc.quickInquiry.model.quickInquiry.purchaseInfo').d('采购申请信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'prNum',
            width: 150,
          },
          {
            name: 'prLineNum',
            width: 150,
          },
        ].filter(Boolean),
      },
      {
        name: 'otherInfo',
        header: intl.get('ssrc.quickInquiry.model.quickInquiry.otherInfo').d('其他信息'),
        width: 180,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'remark',
            width: 150,
          },
          {
            name: 'attachmentUuid',
            width: 150,
          },
        ].filter(Boolean),
      },
      {
        name: 'createInfo',
        header: intl.get('ssrc.quickInquiry.model.quickInquiry.creationInfo').d('创建信息'),
        width: 200,
        align: 'left',
        aggregation: true,
        aggregationLimit: 4,
        children: [
          {
            name: 'creationDate',
            width: 150,
          },
          {
            name: 'createdByName',
            width: 150,
          },
        ],
      },
    ];
  }, [aggregation]);

  return customizeTable(
    {
      code: 'SSRC.QUICK_INQUIRY.LIST.FINISH',
    },
    <SearchBarTable
      virtual
      virtualCell
      cacheState
      searchCode="SSRC.QUICK_INQUIRY.LIST.FINISH_FILTER"
      dataSet={dataSet}
      columns={columns}
      aggregation={aggregation}
      onAggregationChange={changeTableDisplay}
      style={{
        maxHeight: 'calc(100vh - 240px)',
      }}
      searchBarConfig={{
        right: {
          render: rightRender,
        },
      }}
    />
  );
});
