/*
 * EditorOnline  -  在线编辑通用组件
 * @date: 2019年5月20日 10:52:02
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { queryDocument } from '@/services/disclaimerSignService';
import { getResponse } from 'utils/utils';
// import Styles from './index.less';
/**
 * EditorOnline - 在线编辑通用组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [pcHeaderId] - 头ID
 *
 */
export default class EditorOnline extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.uuid = uuid();
  }

  componentDidMount() {
    this.fetchEditorOnlineHTML();
  }

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  writeFrameDocument(content) {
    const idSuffix = `AAAbbbb${this.uuid}`;
    if (document.getElementById(`EditOnline${idSuffix}`)) {
      const editorIframeDocument = document.getElementById(`EditOnline${idSuffix}`).contentWindow
        .document;
      editorIframeDocument.open('text/html', 'replace');
      editorIframeDocument.write(content);
      editorIframeDocument.close();
    }
  }

  @Bind()
  async fetchEditorOnlineHTML() {
    const res = await queryDocument();
    let json = {};
    try {
      json = JSON.parse(res);
      if (getResponse(json)) {
        this.writeFrameDocument(res);
      }
    } catch (error) {
      this.writeFrameDocument(res);
    }
  }

  render() {
    const { iframeStyle = {} } = this.props;
    const idSuffix = `AAAbbbb${this.uuid}`;
    return (
      <iframe
        id={`EditOnline${idSuffix}`}
        style={{ border: '0', ...iframeStyle }}
        title="Edit Online"
      />
    );
  }
}
