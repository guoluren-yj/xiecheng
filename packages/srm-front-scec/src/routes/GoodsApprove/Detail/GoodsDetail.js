/**
 * GoodsApprove -detail 商品审批 商品详情
 * @date: 2019-2-14
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';

export default class GoodsDetail extends Component {
  render() {
    const {
      detail: { productDetail = {} },
    } = this.props;
    return (
      <React.Fragment>
        {productDetail && productDetail.introduction && (
          <div dangerouslySetInnerHTML={{ __html: productDetail.introduction }} />
        )}
      </React.Fragment>
    );
  }
}
