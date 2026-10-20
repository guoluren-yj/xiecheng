/*
 * @Description: 阶段报价
 * @Date: 2022-04-16 14:04:28
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import ModalChildren from './ModalChildren';
import ladderQuoteDS from './LadderQuoteDS';

export default function showLadderQuote(props) {
  const { priceType } = props;
  const priceEdit = ['TAX_INCLUDED_PRICE', 'NONE'].includes(priceType);
  const ladderNetPriceEdit = ['NET_PRICE', 'NONE'].includes(priceType);
  const ladderQuoteDs = new DataSet(
    ladderQuoteDS({
      ...props,
      priceEdit,
      ladderNetPriceEdit,
    })
  );

  const modalChildrenProps = {
    ...props,
    priceEdit,
    ladderNetPriceEdit,
    ladderQuoteDs,
  };

  Modal.open({
    closable: true,
    movable: false,
    key: Modal.key(),
    title: intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格'),
    style: {
      width: 1000,
    },
    children: <ModalChildren {...modalChildrenProps} />,
    footer: null,
  });
}
