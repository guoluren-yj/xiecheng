import React, { useMemo, useState, useCallback } from 'react';
import { Table, DataSet, Modal, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, throttle, debounce } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
// import { getRankChartColor } from '../utils/rankChartColor';

import { quotationHistoryTableDS } from '../Stores/quotationHistoryTableDS';

import Styles from '../index.less';

const CurrentModalKey = Modal.key();

/**
 * 报价历史弹窗
 * record 报价行 Record @required
 * headerDS 报价头 DataSet @required
 * disabledViewFlag boolean 禁止查看报价历史标识
 * customizeUnitCode string 表格个性化编码
 * historyDestroyAllFlag boolean 历史弹框打开前是否销毁所有弹框
 */
const QuotationHistory = (props = {}) => {
  const {
    organizationId,
    record = {},
    headerDS = {},
    quotationName = '',
    customizeUnitCode = null,
    customizeTable = noop,
    disabledViewFlag = false,
    doubleUnitFlag = false,
    historyDestroyAllFlag = true,
  } = props;

  const { existBargainedFlag, continuousQuotationFlag } = headerDS.current
    ? headerDS.current.get(['continuousQuotationFlag', 'existBargainedFlag'])
    : {};

  const [viewLastSubmit, setViewLastSubmit] = useState(false); // 查看末轮最后提交

  // const RFAFlag = useMemo(() => sourceCategory === 'RFA', [sourceCategory]);

  const tableDS = useMemo(
    () =>
      new DataSet(
        quotationHistoryTableDS({
          quotationName,
          doubleUnitFlag,
        })
      ),
    [record, disabledViewFlag, quotationName, doubleUnitFlag]
  );

  // 查询表格
  const queryTable = useCallback(
    async (params = {}) => {
      const {
        quotationLineId,
        quotationHeaderId,
        quotationRoundNumber = 0,
        purSelectQuotationDetailFlag = 0,
      } = record.get([
        'quotationLineId',
        'quotationHeaderId',
        'quotationRoundNumber',
        'purSelectQuotationDetailFlag',
      ]);
      if (!organizationId || !quotationHeaderId || !quotationLineId) {
        return;
      }

      let result = null;
      const param = {
        organizationId,
        quotationLineId,
        quotationHeaderId,
        customizeUnitCode,
        isQueryLastFlag: viewLastSubmit ? 1 : 0,
        quotationRoundNumber,
        purSelectQuotationDetailFlag,
        ...params,
      };

      tableDS.setQueryParameter('commonProps', param);

      try {
        result = await tableDS.query();
        result = getResponse(result);
        if (!result) {
          return;
        }
      } catch (e) {
        throw e;
      }
    },
    [record, customizeUnitCode, viewLastSubmit]
  );

  const viewHistory = useCallback(
    debounce(async () => {
      if (Number(historyDestroyAllFlag) === 1) {
        Modal.destroyAll();
      }
      await queryTable();

      Modal.open({
        drawer: true,
        key: CurrentModalKey,
        destroyOnClose: true,
        style: { width: '1090px' },
        closable: true,
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationHistory`, { quotationName })
          .d('{quotationName}历史'),
        children: renderContent(),
        onCancel: handleCancel,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        footer: (okBtn) => okBtn,
      });
    }, 1200),
    [renderContent, handleCancel, quotationName, tableDS]
  );

  // modal cancel
  const handleCancel = useCallback(() => {
    tableDS.loadData();
    tableDS.reset();
  }, [tableDS]);

  // rank
  // const rankChartColorRender = (realRank) => {
  //   const color = getRankChartColor(realRank);

  //   return (
  //     <Tag style={{ border: 0 }} color={color}>
  //       {realRank}
  //     </Tag>
  //   );
  // };

  // current quotation stage
  const quotationStageRender = useCallback(
    (historyLineRecord = {}) => {
      const {
        quotationNode,
        quotationRoundNumber,
        quotationNodeMeaning,
        bargainTimes,
      } = historyLineRecord.get([
        'quotationNode',
        'quotationRoundNumber',
        'quotationNodeMeaning',
        'bargainTimes',
      ]);
      let title = '';

      switch (quotationNode) {
        case 'QUOTATION_PRICE':
        case 'PRICE_CLARIFICATION':
          title = quotationNodeMeaning;
          break;
        case 'ROUND_QUOTATION_PRICE':
          title = intl
            .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
              round: quotationRoundNumber,
            })
            .d('第{round}轮报价');
          break;
        case 'BARGAIN_PRICE':
          title = intl
            .get(`ssrc.common.theRoundBargainNum`, { bargainTimes })
            .d(`第{bargainTimes}次议价`);
          break;
        default:
          title = quotationNodeMeaning;
          break;
      }

      return title;
    },
    [record]
  );

  const columns = useMemo(
    () =>
      [
        {
          name: 'quotationNode',
          width: 100,
          renderer: ({ record: historyLineRecord }) => quotationStageRender(historyLineRecord),
        },
        {
          name: 'quotedDate',
          width: 140,
        },
        {
          name: 'quotedByName',
        },
        // {
        //   name: 'quotationRoundNumber',
        //   width: 80,
        // },
        // {
        //   name: 'rank',
        //   width: 80,
        //   // hidden: !RFAFlag,
        //   // renderer: ({ value }) => rankChartColorRender(value),
        // },
        {
          name: 'quotationSecondaryPrice',
          width: 120,
          hidden: !doubleUnitFlag,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'validNetSecondaryPrice',
          width: 120,
          hidden: !doubleUnitFlag,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'quotationPrice',
          width: 120,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'validNetPrice',
          width: 120,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'taxRate',
          width: 120,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'totalAmount',
          width: 120,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'netAmount',
          width: 120,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        // {
        //   name: 'quotationQuantity',
        //   width: 120,
        //   renderer: ({ value }) => numberSeparatorRender(value),
        // },
        {
          name: 'bargainPrice',
          width: 120,
          align: 'right',
          hidden: !existBargainedFlag,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'bargainRemark',
          width: 200,
          hidden: !existBargainedFlag,
        },
      ].filter(Boolean),
    [quotationStageRender, existBargainedFlag, doubleUnitFlag]
  );

  // 切换查看方式
  const changeLastQuotation = useCallback(
    throttle((val) => {
      setViewLastSubmit(val);
      queryTable({
        isQueryLastFlag: val ? 1 : 0,
      });
    }, 1200),
    [queryTable]
  );

  // 仅查看每轮最后提交 checkbox
  const renderCheckbox = useCallback(() => {
    if (!continuousQuotationFlag) {
      return;
    }

    return (
      <CheckBox defaultChecked={false} onChange={changeLastQuotation}>
        <span style={{ fontSize: '12px', fontWeight: 400 }}>
          {intl.get('ssrc.common.view.title.onlyViewLastRoundSubmit').d('仅查看每轮最后提交')}
        </span>
      </CheckBox>
    );
  }, [continuousQuotationFlag, changeLastQuotation]);

  const renderContent = useCallback(() => {
    const { itemName, itemCode } = record?.get(['itemName', 'itemCode']);

    const modalTitle = itemCode && itemName ? `${itemCode}-${itemName}` : itemCode || itemName;

    return (
      <div>
        <div
          className={classnames(
            Styles['standard-title-modal'],
            Styles['quotation-history-modal-title']
          )}
        >
          <span>{modalTitle}</span>
          <span>{renderCheckbox()}</span>
        </div>
        <div>
          {customizeTable(
            { code: customizeUnitCode },
            <Table
              bordered
              dataSet={tableDS}
              rowKey="recordId"
              columns={columns}
              style={{ maxHeight: 'calc(100vh - 260px)' }}
            />
          )}
        </div>
      </div>
    );
  }, [viewLastSubmit, tableDS, renderCheckbox, columns, customizeUnitCode]);

  return (
    <a onClick={viewHistory} disabled={disabledViewFlag}>
      {intl.get(`hzero.common.button.view`).d('查看')}
    </a>
  );
};

export default observer(QuotationHistory);
