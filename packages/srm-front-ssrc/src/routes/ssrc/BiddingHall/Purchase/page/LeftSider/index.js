/**
 * 竞价大厅leftSider内容
 */
import React, { useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { Form, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import 'react-virtualized/styles.css';

import { getPurCustomizeUnitCode } from '@/routes/ssrc/BiddingHall/utils/utils';

import UnitPriceSupplierList from './UnitPriceSupplierList';
import TotalPriceItemList from './TotalPriceItemList';

import style from '../../index.less';
import './index.less';

const Header = observer((props = {}) => {
  const {
    header = {},
    biddingRuleDataSet,
    supplierListDataSet,
    totalPriceItemListDataSet,
    toggleLoading,
    commonProps,
    itemLineListDS,
    useNewRateFlag = 0,
    getUnitPriceFlag = noop,
    getTotalPriceFlag = noop,
    customizeCollapseForm = noop,
    britishBidding = noop,
    japOrDutchBiddingTotalPrice = noop,
    japanBiddingTotalPrice = noop,
    remote,
  } = props || {};

  const japanTotal = japanBiddingTotalPrice();
  const japOrDutchBiddingTotal = japOrDutchBiddingTotalPrice();

  useEffect(() => {}, [supplierLineInfoDTOS]);

  const { supplierLineInfoDTOS = [] } =
    supplierListDataSet?.current?.get(['supplierLineInfoDTOS']) || {};

  // 渲染表单字段
  const getBiddingRuleFields = useCallback(() => {
    const { rankRule } = biddingRuleDataSet?.current?.get(['rankRule']) || {};
    let fields = [
      <Output name="biddingTargetMeaning" />,
      <Output name="openRuleMeaning" />,
      britishBidding() ? <Output name="biddingStrategyMeaning" /> : null,
      rankRule === 'WEIGHT_PRICE' && !japOrDutchBiddingTotalPrice() ? (
        <Output name="rankRuleMeaning" />
      ) : null,
      japanTotal ? <Output name="biddingEliminateRoundNumber" /> : null,
      japanTotal ? <Output name="biddingMinShortlistedSupplierNumber" /> : null,
      japOrDutchBiddingTotal ? <Output name="biddingEndType" /> : null,
    ];

    fields = fields.filter(Boolean);
    return fields;
  }, [biddingRuleDataSet?.current, japanTotal, japOrDutchBiddingTotal]);

  // 单价竞价供应行列表组件入参
  const unitPriceListProps = {
    supplierListDataSet,
    header,
    toggleLoading,
    commonProps,
    itemLineListDS,
    useNewRateFlag,
    remote,
  };

  // 总价竞价标的物列表组件入参
  const totalPriceItemListProps = {
    header,
    totalPriceItemListDataSet,
    remote,
  };

  return (
    <>
      <div className={classNames(style['pur-left-sider-top'])}>
        <h3>{intl.get('ssrc.inquiryHall.view.inquiryHall.biddingRule').d('竞价规则')}</h3>
        {customizeCollapseForm(
          {
            code: getPurCustomizeUnitCode('biddingRule'),
            dataSet: biddingRuleDataSet,
            labelLayout: 'vertical',
          },
          <Form
            className={classNames(style['pur-left-sider-top-rule-form'])}
            labelLayout="horizontal"
            dataSet={biddingRuleDataSet}
            labelAlign="left"
            labelWidth={80}
            useColon={false}
            columns={1}
            separateSpacing={[0, 0]}
            spacingType="around"
          >
            {getBiddingRuleFields()}
          </Form>
        )}
      </div>
      <div
        className={`${classNames(style['pur-left-sider-bottom'])} pur-left-sider-bottom-virtual`}
      >
        {getUnitPriceFlag(header) && <UnitPriceSupplierList {...unitPriceListProps} />}
        {getTotalPriceFlag(header) && <TotalPriceItemList {...totalPriceItemListProps} />}
      </div>
    </>
  );
});

export default Header;
