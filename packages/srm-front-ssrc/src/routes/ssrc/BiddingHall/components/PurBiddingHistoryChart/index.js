import React, { useCallback } from 'react';
import { useModal, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';

import HistoryAnalysis from './HistoryAnalysis';
import TooltipEllipsis from '../TooltipEllipsis';

import Styles from '../index.less';

const historyChartSvg = require('@/assets/biddingHall/history-chart.svg');

// 采购方-竞价历史图表分析
const PurBiddingHistoryChart = observer((props) => {
  const ModalPro = useModal();
  const {
    header,
    itemRecord, // 物料行数据
    itemLineListDS, // 物料行ds
    modalProps = {},
    visibleFlag = 1,
    buttonTextClass = '',
  } = props || {};

  // // temporary hidden function
  // return "";

  if (!visibleFlag) {
    return '';
  }

  const { width = '600px' } = modalProps || {};

  const { biddingTarget } = header || {};

  const { itemName, rfxLineItemId } = itemRecord
    ? itemRecord?.get(['itemName', 'rfxLineItemId'])
    : {};

  const handleHistoryChart = useCallback(
    debounce((e) => {
      e.stopPropagation();

      const totalPriceFlag = biddingTarget === 'TOTAL_PRICE';

      if (!itemLineListDS) {
        return;
      }

      // const historyModalCount = itemLineListDS.getState('historyModalCount') || 0;
      const historyModalKeySet = itemLineListDS.getState('historyModalKey') ?? new Set();

      // 弹框数量最多可打开3个
      if (historyModalKeySet.size >= 3) {
        return;
      }

      historyModalKeySet.add(rfxLineItemId);
      itemLineListDS.setState('historyModalKey', historyModalKeySet);

      ModalPro.open({
        destroyOnClose: true,
        closable: true,
        mask: false,
        key: totalPriceFlag ? 'ssrc_bidding_hall_history_chart_modal' : rfxLineItemId,
        style: { width },
        bodyStyle: {
          // height: 'calc(100vh - 3.06rem)',
          minHeight: '500px',
          padding: '20px',
        },
        footer: null,
        title: (
          <TooltipEllipsis title={itemName}>
            <div className={Styles['purchase-item-history-modal-title']}>
              {totalPriceFlag
                ? intl.get('ssrc.biddingHall.view.title.biddingTrend').d('竞价趋势')
                : itemName ?? ''}
            </div>
          </TooltipEllipsis>
        ),
        children: <HistoryAnalysis {...props} />,
        onClose: () => {
          if (!itemLineListDS || totalPriceFlag) {
            return;
          }

          const historyModals = itemLineListDS.getState('historyModalKey') ?? new Set();
          historyModals.delete(rfxLineItemId);
          itemLineListDS.setState('historyModalKey', historyModals);
        },
      });
    }, 600),
    [props, itemRecord, rfxLineItemId]
  );

  return (
    <span className={Styles['ssrc-bidding-record-chart-component']} onClick={handleHistoryChart}>
      <img className={Styles['purchase-item-history-chart']} alt="" src={historyChartSvg} />
      <span
        className={classnames(Styles['ssrc-bidding-record-chart-component-text'], buttonTextClass)}
      >
        <Tooltip title={intl.get('ssrc.biddingHall.view.title.biddingAnalysis').d('竞价分析')}>
          {intl.get('ssrc.biddingHall.view.title.biddingAnalysis').d('竞价分析')}
        </Tooltip>
      </span>
    </span>
  );
});

export default PurBiddingHistoryChart;
