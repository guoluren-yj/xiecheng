/*
 * @Description: v7 wps预览页面
 * @Date: 2024-08-13 16:56:55
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import EmbedPage from 'components/EmbedPage';

@withRouter
export default class WpsV7Preview extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const { previewUrl } = querystring.parse(search?.substr(1)) || {};
    this.state = {
      previewUrl,
    };
  }

  render() {
    const { previewUrl } = this.state;
    return (
      <EmbedPage
        contentStyle={{ height: '100vh' }}
        href={previewUrl}
      />
    );
  }
}
