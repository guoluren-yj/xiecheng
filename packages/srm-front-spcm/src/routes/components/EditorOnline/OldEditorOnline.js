/*
 * EditorOnline  -  在线编辑通用组件
 * @date: 2019年5月20日 10:52:02
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
// import Styles from './index.less';
/**
 * EditorOnline - 在线编辑通用组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [pcHeaderId] - 头ID
 *
 */
@connect(({ editorOnline, loading }) => ({
  editorOnline,
  loading: loading.effects['editorOnline/fetchEditorOnlineHTML'],
}))
export default class EditorOnline extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    const { templateFlag, sourcePage = '' } = this.props;
    // 协议模板传的字段
    if (templateFlag) {
      this.fetchEditorOnlineTemplateHTML();
      // 协议议制
    } else if (sourcePage === 'contractMaintain') {
      this.getContractMaintainOnlineHtml();
    } else {
      this.fetchEditorOnlineHTML();
    }
  }

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  writeFrameDocument(content) {
    const { pcHeaderId = '', pcTemplateFileId = '', fullScreenFlag = false } = this.props;
    const idSuffix = `H${pcHeaderId}T${pcTemplateFileId}${fullScreenFlag ? 'full' : ''}`;
    if (document.getElementById(`EditOnline${idSuffix}`)) {
      const editorIframeDocument = document.getElementById(`EditOnline${idSuffix}`).contentWindow
        .document;
      editorIframeDocument.open('text/html', 'replace');
      editorIframeDocument.write(content);
      editorIframeDocument.close();
    }
  }

  @Bind()
  fetchEditorOnlineHTML() {
    const { dispatch, pcHeaderId = '', permissionCode, supplierFlag } = this.props;
    dispatch({
      type: 'editorOnline/fetchEditorOnlineHTML',
      payload: {
        pcHeaderId,
        permissionCode,
        supplierFlag,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
    });
  }

  @Bind()
  getContractMaintainOnlineHtml() {
    const { dispatch, pcHeaderId = '', permissionCode, supplierFlag } = this.props;
    dispatch({
      type: 'editorOnline/fetchContractMaintainEditorOnlineHTML',
      payload: {
        pcHeaderId,
        permissionCode,
        supplierFlag,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
    });
  }

  @Bind()
  fetchEditorOnlineTemplateHTML() {
    const { dispatch, pcTemplateId = '', pcTemplateFileId = '', permissionCode } = this.props;
    dispatch({
      type: 'editorOnline/fetchEditorOnlineTemplateHTML',
      payload: {
        pcTemplateId,
        pcTemplateFileId,
        permissionCode,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
    });
  }

  render() {
    const {
      iframeStyle = {},
      pcHeaderId = '',
      pcTemplateFileId = '',
      fullScreenFlag = false,
    } = this.props;
    const idSuffix = `H${pcHeaderId}T${pcTemplateFileId}${fullScreenFlag ? 'full' : ''}`;
    return (
      <iframe
        id={`EditOnline${idSuffix}`}
        style={{ border: '0', ...iframeStyle }}
        title="Edit Online"
      />
    );
  }
}
