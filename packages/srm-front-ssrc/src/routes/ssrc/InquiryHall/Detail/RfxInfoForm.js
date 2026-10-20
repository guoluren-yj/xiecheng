import React, { Component } from 'react';
import { Output } from 'choerodon-ui/pro';
import querystring from 'querystring';
import CollapseForm from '_components/CollapseForm';

import { numberSeparatorRender } from '@/utils/renderer';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';

export default class RfxInfoDS extends Component {
  /**
   * 跳转立项转询价
   * @param {Object} record
   */
  jumpToProjectDetail = (record) => {
    const { history = {} } = this.props;
    const sourceProjectId = record.get('sourceProjectId');
    if (!sourceProjectId) return;
    const search = querystring.stringify({
      fromSourcePage: 'otherTabDetail',
    });
    const pathname = `/ssrc/new-project-setup/detail/${sourceProjectId}`;
    history.push({
      pathname,
      search,
    });
  };

  getFields() {
    const {
      header: { sourceFrom, subjectMatterRule, priceTypeCode },
      disabledAllLinkFlag = false,
      rfxInfoDS,
      remote,
      isPubPage = false,
      history,
      rfx = {},
      routerParam = {},
    } = this.props;
    const { bidFlag = false } = rfx;
    const sourceFromFlag = sourceFrom === 'PROJECT';
    const subjectMatterFlag = sourceFrom === 'PROJECT' && subjectMatterRule === 'PACK';
    const { biddingHallFlag } = rfxInfoDS?.getQueryParameter('commonProps') || {};
    const { sourceCategory, biddingFlag } =
      rfxInfoDS?.current?.get(['sourceCategory', 'biddingFlag']) || {};
    // 竞价大厅标识
    const newBiddingFlag = !!biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    const Fields = [
      <Output name="rfxTitle" />,
      sourceFromFlag ? (
        <Output
          name="sourceProjectNum"
          renderer={({ record, value }) => (
            <a onClick={() => this.jumpToProjectDetail(record)} disabled={disabledAllLinkFlag}>
              {value}
            </a>
          )}
        />
      ) : null,
      sourceFromFlag ? <Output name="sourceProjectName" /> : null,
      subjectMatterFlag ? <Output name="sectionName" /> : null,
      <Output name="budgetAmount" renderer={({ value }) => numberSeparatorRender(value)} />,
      <Output name="templateName" />,
      <Output name="rfxRemark" colSpan={2} />,
      <div name="rfxInfo_1" fieldClassName="td-no-visible" />,
      priceTypeCode === 'NET_PRICE' ? (
        <Output
          name="totalNetEstimatedAmount"
          renderer={({ value }) => numberSeparatorRender(value)}
        />
      ) : (
        <Output
          name="totalEstimatedAmount"
          renderer={({ value }) => numberSeparatorRender(value)}
        />
      ),
      newBiddingFlag && <Output name="currencyCode" />,
    ].filter(Boolean);

    if(!remote) return Fields;
    return remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_BASIC_INFO_PREPARE_FIELDS', Fields, {
      history,
      bidFlag,
      rfxInfoDS,
      isPubPage,
      routerParam,
    });
  }

  render() {
    const { customizeCollapseForm, rfxInfoDS = {}, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    return (
      <div className={styles['rfx-card-item-form']}>
        {customizeCollapseForm(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.INFO_PREPARE`,
            dataSet: rfxInfoDS,
            labelLayout: 'vertical',
          },
          <CollapseForm
            dataSet={rfxInfoDS}
            showLines={6}
            columns={3}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
            useWidthPercent
          >
            {this.getFields()}
          </CollapseForm>
        )}
      </div>
    );
  }
}
