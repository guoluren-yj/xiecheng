/**
 * riskEmbedPage - 斯瑞德内嵌页
 * @date: 2019-07-12
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';

export default class riskEmbedPage extends Component {
  constructor(props) {
    super(props);
    const {
      history: {
        location: { search, hash },
      },
    } = props;
    const url = search.substr(9) + hash;
    this.state = {
      url,
    };
  }

  render() {
    const { url } = this.state;
    return <iframe src={url} width="100%" height="100%" frameBorder="0" title="riskEmbedPage" />;
  }
}
