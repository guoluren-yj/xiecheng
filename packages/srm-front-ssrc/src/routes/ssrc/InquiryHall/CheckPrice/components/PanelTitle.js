/**
 * 折叠面板title
 */
import React from 'react';
import { Tag, Tooltip } from 'hzero-ui';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

export default observer((props) => {
  const { basicInfoDs, remote } = props;
  const { current } = basicInfoDs;
  const { rfxNum = '', rfxTitle = '', quotationRoundNumber } =
    current?.get(['rfxNum', 'rfxTitle', 'quotationRoundNumber']) || {};

  let titleStyle = {
    display: 'inline-block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '85%',
    float: 'left',
  };

  titleStyle = remote
    ? remote.process('SSRC_CHECK_PRICE_PROCESS_COLLAPSE_PANEL_RFX_TITLE_STYLE', titleStyle, {
        basicInfoDs,
      })
    : titleStyle;

  return (
    <h3 style={{ maxWidth: '90%' }}>
      <span style={titleStyle}>
        {rfxNum}-
        <Tooltip title={`${rfxNum} — ${rfxTitle}`} overlayStyle={{ minWidth: '300px' }}>
          {rfxTitle}
        </Tooltip>
      </span>
      <Tag style={{ marginLeft: '15px', width: '65px' }}>
        <span style={{ marginLeft: '-17px' }}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：
          {quotationRoundNumber || 1}
        </span>
      </Tag>
    </h3>
  );
});
