/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-10-27 17:41:35
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';

import { numberSeparatorRender } from '@/utils/renderer';

import { biddingRuleDS } from './BiddingRuleFormDS';

export default class BiddingRuleForm extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.FormDS = new DataSet(biddingRuleDS());
  }

  componentDidMount() {
    const { header } = this.props;
    this.FormDS.loadData([header.rfxRequireQuotationAdjustDTO]);
  }

  @Bind()
  getClassName(field) {
    const { header = {}, currentMode } = this.props;
    const { adjustFields = [] } = header?.rfxRequireQuotationAdjustDTO || {};
    let className = '';
    if (adjustFields?.includes(field)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }
    return className;
  }

  render() {
    const { custLoading, header = {}, customizeForm, custKey, currentMode } = this.props;
    const { rfxHeaderBaseInfoAdjustDTO } = header || {};
    const { biddingMode, biddingTarget, biddingTotalPricePrinciple, } = rfxHeaderBaseInfoAdjustDTO || {};

    // 报价幅度、安全价 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【总价竞价】，任一不满足时隐藏
    const totalBiddingPriceFlag =
      biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'TOTAL_PRICE';
    // 总价 - 总价必输
    const totalRequiredFlag = biddingTotalPricePrinciple === "TOTAL_PRICE_REQUIRED" && biddingTarget === 'TOTAL_PRICE';

    return (
      <Fragment>
        {customizeForm(
          {
            code:
              currentMode === 'history'
                ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE_HISTORY`
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE_READONLY`,
          },
          <Form
            dataSet={this.FormDS}
            labelLayout="vertical"
            columns={3}
            custLoading={custLoading}
            className="c7n-pro-vertical-form-display"
          >
            <Output
              name="biddingStrategyMeaning"
              className={
                this.getClassName('biddingStrategy') || this.getClassName('biddingStrategyMeaning')
              }
            />
            {totalBiddingPriceFlag && (
              <Output
                name="quotationRange"
                renderer={({ record }) => {
                  const { floatType, floatTypeMeaning, quotationRange } = record.get([
                    'floatType',
                    'floatTypeMeaning',
                    'quotationRange',
                  ]);
                  if (floatType && !isNil(quotationRange)) {
                    return (
                      <>
                        <span className={this.getClassName('floatType')}>{floatTypeMeaning}</span>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        <span
                          className={this.getClassName('quotationRange')}
                          style={{ display: 'inline-block', width: 'calc(100% - 65px)' }}
                        >
                          {`${quotationRange} ${floatType === 'ratio' ? '%' : ''}`}
                        </span>
                      </>
                    );
                  } else if (floatType) {
                    return (
                      <>
                        <span className={this.getClassName('floatType')}>{floatTypeMeaning}</span>
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        <span
                          className={this.getClassName('quotationRange')}
                          style={{ display: 'inline-block', width: 'calc(100% - 65px)' }}
                        >
                          {`-`}
                        </span>
                      </>
                    );
                  }
                  return '-';
                }}
              />
            )}
            {totalBiddingPriceFlag && (
              <Output
                name="safePrice"
                renderer={({ value }) => numberSeparatorRender(value)}
                className={this.getClassName('safePrice')}
              />
            )}
            {totalRequiredFlag && (
              <Output
                name="biddingSpreadPrice"
                renderer={({ value }) => numberSeparatorRender(value)}
                className={this.getClassName('biddingSpreadPrice')}
              />
            )}
          </Form>
        )}
      </Fragment>
    );
  }
}
