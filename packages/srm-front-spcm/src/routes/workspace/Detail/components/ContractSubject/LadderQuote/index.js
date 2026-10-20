/*
 * @Description: 标的的阶梯报价
 * @Date: 2022-06-29 10:52:52
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
  const { priceType = '', editable } = props;
  const priceEdit = ['TAX_INCLUDED_PRICE', 'NONE'].includes(priceType);
  const ladderNetPriceEdit = ['NET_PRICE', 'NONE'].includes(priceType);
  const ladderQuoteDs = new DataSet(ladderQuoteDS({ ...props, priceEdit, ladderNetPriceEdit }));

  const modalChildrenProps = {
    ...props,
    ladderQuoteDs,
    ladderNetPriceEdit,
    priceEdit,
  };

  const isViewProps = !editable && {
    okButton: false,
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    cancelProps: {
      color: 'primary',
    },
  };

  Modal.open({
    closable: true,
    movable: false,
    drawer: true,
    key: Modal.key(),
    title: intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格'),
    style: {
      width: 1090,
    },
    children: <ModalChildren {...modalChildrenProps} />,
    // footer: null,
    ...isViewProps,
  });
}
