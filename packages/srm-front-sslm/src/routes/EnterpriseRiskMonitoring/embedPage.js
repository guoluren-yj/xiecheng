/**
 * EmbedPage - 风险内嵌页面
 * @date: 2019-07-11
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import qs from 'querystring';

export default class EmbedPage extends Component {
  constructor(props) {
    super(props);
    const parame = qs.parse(props.location.search.substr(1));
    this.state = {
      urlParams: decodeURIComponent(parame.urlParams),
    };
  }

  render() {
    const { urlParams } = this.state;
    return (
      <iframe
        title="title"
        id="thisFrame"
        src={urlParams}
        width="100%"
        height="100%"
        frameBorder="0"
      />
    );
  }
}
