import React, { useCallback, useMemo } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { Row, Col } from 'choerodon-ui';
import { AutoSizer, List as VList } from 'react-virtualized';
import 'react-virtualized/styles.css';

import { TooltipEllipsis } from '../../../components';

import './index.less';

const itemSvg = require('@/assets/biddingHall/total-price-item.svg');
const quantitySvg = require('@/assets/biddingHall/total-price-quantity.svg');

// 左侧标的物列表
const TotalPriceItemList = observer((props = {}) => {
  const { totalPriceItemListDataSet } = props || {};

  // 获取ds length PS：解决初次页面不渲染问题
  const getTotalPriceSupplierListLength = useMemo(() => {
    return totalPriceItemListDataSet?.length || 0;
  }, [totalPriceItemListDataSet?.length]);

  // 虚拟滚动rowRender
  const rowRenderer = useCallback(
    ({ key, index, style }) => {
      const record = totalPriceItemListDataSet?.records?.[index];
      if (!record) return;
      const {
        itemName,
        rfxQuantity,
        secondaryQuantity,
        uomName,
        secondaryUomName,
        specs,
      } = record.get([
        'itemName',
        'rfxQuantity',
        'secondaryQuantity',
        'uomName',
        'secondaryUomName',
        'specs',
      ]);

      const doubleUnitFlag = totalPriceItemListDataSet.getQueryParameter('doubleUnitFlag');

      // 标的物 数量+单位
      const quantityUomTitle = doubleUnitFlag
        ? `${secondaryQuantity ?? ''} ${secondaryUomName ?? ''}`
        : `${rfxQuantity ?? ''} ${uomName ?? ''}`;

      return (
        <div
          key={key}
          style={style}
          className="pur-left-sider-bottom-virtual-list-item pur-left-sider-bottom-virtual-list-item-total-price"
        >
          <Row gutter={8} type="flex" justify="space-between" className="item-first-row">
            <Col className="item-name">
              <img alt="" src={itemSvg} className="item-name-svg" />
              <TooltipEllipsis title={itemName ?? ''}>
                <span className="item-name-text">{itemName ?? ''}</span>
              </TooltipEllipsis>
            </Col>
            <Col className="item-quantity">
              <img alt="" src={quantitySvg} className="item-quantity-icon" />
              <TooltipEllipsis title={quantityUomTitle}>
                <span className="item-quantity-text">{quantityUomTitle}</span>
              </TooltipEllipsis>
            </Col>
          </Row>
          <Row gutter={8} type="flex" justify="space-between" className="item-second-row">
            <TooltipEllipsis title={specs ?? ''}>
              <span className="item-specs-text">{specs ?? ''}</span>
            </TooltipEllipsis>
          </Row>
        </div>
      );
    },
    [totalPriceItemListDataSet?.records]
  );

  return (
    <>
      <h3 className="pur-left-sider-bottom-virtual-header">
        {intl.get('ssrc.biddingHall.view.title.item').d('标的物')}
      </h3>
      <div className="pur-left-sider-bottom-virtual-list">
        <AutoSizer>
          {({ width, height }) => (
            <VList
              height={height}
              rowCount={getTotalPriceSupplierListLength}
              rowHeight={57} // 高度是item-name的css高度
              rowRenderer={(p) => rowRenderer(p)}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    </>
  );
});

export default TotalPriceItemList;
