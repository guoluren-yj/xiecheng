/**
 * 多轮报价执行情况链接，给外部的弹窗链接
 *
 * 和列表页共用一套，如果有变更，都需要处理
 * src/routes/ssrc/InquiryHallNew/components/RoundQuotation/index.js
 *
 */

import React, { useEffect, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, compose } from 'lodash';
import moment from 'moment';
import querystring from 'querystring';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header } from 'components/Page';

import { fetchInquiryHeaderDetail } from '@/services/inquiryHallService';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import EmptyDataIllustrate from '@/routes/ssrc/BiddingHall/components/EmptyDataIllustrate';
import RoundQuotationModals from './index';
import { headerInfoDataSet } from './store/indexDS.js';

const LinkExtrance = (props) => {
  const { customizeTable = noop, history, href } = props;

  let searchData = {};

  // 外部以弹窗形式嵌套
  if (!history && href) {
    const modalLinkSearch = querystring.parse(href.substr(href.indexOf('?') + 1, href.length));
    const { externalModalFlag } = modalLinkSearch || {};

    if (externalModalFlag === '1') {
      searchData = modalLinkSearch;
    }
  }

  const organizationId = getCurrentOrganizationId();

  const { rfxHeaderId, externalModalFlag } = searchData || {};

  const insertIntoModal = externalModalFlag === '1';

  const headerInfoDS = useMemo(() => new DataSet(headerInfoDataSet()), [href, rfxHeaderId]);

  const {
    secondarySourceCategory,
    quotationRoundNumber,
    bargainStatus,
    bargainEndDate,
    rfxStatus,
  } = headerInfoDS?.current
    ? headerInfoDS?.current?.get([
        'secondarySourceCategory',
        'quotationRoundNumber',
        'bargainStatus',
        'bargainEndDate',
        'rfxStatus',
      ])
    : {};

  const bidFlag = useMemo(() => secondarySourceCategory === 'NEW_BID', [secondarySourceCategory]);

  const sourceKey = useMemo(() => (bidFlag ? 'INQUIRY' : 'BID'), [
    secondarySourceCategory,
    bidFlag,
  ]);

  const barginFlag =
    (bargainStatus === 'BARGAINING_ONLINE' || bargainStatus === 'BARGAINING_OFFLINE') &&
    moment().isBefore(bargainEndDate);

  useEffect(() => {
    initHeader();
  }, [href, rfxHeaderId, headerInfoDS]);

  const initHeader = async () => {
    idValidation(rfxHeaderId);

    let result = null;
    try {
      result = await fetchInquiryHeaderDetail({ organizationId, rfxHeaderId });
      result = getResponse(result);
      if (!result) {
        return;
      }

      headerInfoDS.loadData([result]);
    } catch (e) {
      throw e;
    }
  };

  if (!secondarySourceCategory || !rfxStatus) {
    return '';
  }

  return (
    <>
      {!insertIntoModal ? (
        <Header
          backPath=""
          title={
            rfxStatus === 'FINISHED'
              ? intl.get('ssrc.inquiryHall.model.inquiryHall.winBidSituation').d('中标情况')
              : intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况')
          }
        />
      ) : (
        ''
      )}

      <div>
        {quotationRoundNumber ? (
          <RoundQuotationModals
            lineRecord={headerInfoDS?.current}
            barginFlag={barginFlag}
            sourceKey={sourceKey}
            rfxHeaderId={rfxHeaderId}
            customizeTable={customizeTable}
            quotationRoundNumber={quotationRoundNumber}
            customizedCode={
              bidFlag
                ? `SSRC.BID_HALL.NEW_LIST.EXECUTE_TABLE`
                : 'SSRC.INQUIRY_HALL.NEW_LIST.EXECUTE_TABLE'
            }
          />
        ) : (
          <div style={{ height: '550px' }}>
            <EmptyDataIllustrate />
          </div>
        )}
      </div>
    </>
  );
};

const hocUpdate = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL.NEW_LIST.EXECUTE_TABLE',
        'SSRC.BID_HALL.NEW_LIST.EXECUTE_TABLE',
      ],
    })
  )(observer(Com));
};

export default hocUpdate(LinkExtrance);
