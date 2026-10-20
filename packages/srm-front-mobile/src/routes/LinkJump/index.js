/**
 * index.js - link中转
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { getAccessToken } from 'hzero-front/lib/utils/utils';

export default class linkJump extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (window.location.search) {
      const temp = window.location.search.replace('?', '');
      const arr = temp.split('&');
      let encryptUuid = '';
      let queryString = '';
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].indexOf('encryptUuid') > -1) {
          const arrEpt = arr[i].split('=');
          if (arrEpt.length === 2) {
            const s = arrEpt[1];
            encryptUuid = s;
          }
        } else {
          queryString = `${arr[i]}&${queryString}`;
        }
      }
      const accessToken = getAccessToken();
      const url = `${window.$$env.API_HOST}/smbl/v1/link/after-login/redirect/${encryptUuid}?access_token=${accessToken}&${queryString}`;
      window.location.replace(url);
    }
  }

  render() {
    return <div />;
  }
}
