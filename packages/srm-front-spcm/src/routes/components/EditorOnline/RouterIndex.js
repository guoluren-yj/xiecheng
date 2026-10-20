/*
 * EditorOnline  -  在线编辑通用组件
 * @date: 2019年5月20日 10:52:02
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import EditorOnline from './index';

const CONTRACT_WORKSPACE_MAINTAIN = 'srm.pc-admin.pc-purchaser.workspace2';

@withRouter
export default class EditorOnlineRouter extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { pcHeaderId },
      },
      location: { search },
    } = props;
    const routerParams = querystring.parse(search.substr(1)) || {};
    this.state = {
      pcHeaderId,
      routerParams,
    };
  }

  render() {
    const { pcHeaderId, routerParams } = this.state;
    return (
      <EditorOnline
        pcHeaderId={pcHeaderId}
        {...routerParams}
        routerFlag
        menuCode={CONTRACT_WORKSPACE_MAINTAIN}
        iframeStyle={{
          width: '100%',
          height: '100vh',
        }}
      />
    );
  }
}
