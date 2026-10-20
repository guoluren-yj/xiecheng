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
@connect(({ ssrcEditorOnline, loading }) => ({
  ssrcEditorOnline,
  loading: loading.effects['ssrcEditorOnline/fetchEditorOnlineHTML'],
}))
export default class EditorOnline extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
  }

  state = { htmlContent: '' };

  componentDidMount() {
    const { sourceHeaderId } = this.props;
    if (sourceHeaderId) {
      this.fetchEditorOnlineHTML();
    } else {
      this.fetchEditorOnlineTemplateHTML();
    }
  }

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  writeFrameDocument(content) {
    // const { sourceHeaderId = '', templateId = '', fullScreenFlag = false } = this.props;
    // const idSuffix = `H${sourceHeaderId}T${templateId}${fullScreenFlag ? 'full' : ''}`;
    // if (document.getElementById(`EditOnline${idSuffix}`)) {
    //   const editorIframeDocument = document.getElementById(`EditOnline${idSuffix}`).contentWindow
    //     .document;
    //   editorIframeDocument.open('text/html', 'replace');
    //   editorIframeDocument.write(content);
    //   editorIframeDocument.close();
    // }
    this.setState({ htmlContent: content });
  }

  @Bind()
  fetchEditorOnlineHTML() {
    const {
      dispatch,
      sourceHeaderId,
      templateId = '',
      sourceFrom,
      callBack = () => {},
    } = this.props;
    dispatch({
      type: 'ssrcEditorOnline/fetchEditorOnlineHTML',
      payload: {
        sourceHeaderId,
        templateId,
        sourceFrom,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
      callBack();
    });
  }

  @Bind()
  fetchEditorOnlineTemplateHTML() {
    const { dispatch, templateId = '', lang = '' } = this.props;
    dispatch({
      type: 'ssrcEditorOnline/fetchEditorOnlineTemplateHTML',
      payload: {
        lang,
        templateId,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
    });
  }

  render() {
    const {
      iframeStyle = {},
      sourceHeaderId = '',
      templateId = '',
      fullScreenFlag = false,
    } = this.props;
    const { htmlContent } = this.state;
    const idSuffix = `H${sourceHeaderId}T${templateId}${fullScreenFlag ? 'full' : ''}`;
    return (
      <iframe
        id={`EditOnline${idSuffix}`}
        style={{ border: '0', ...iframeStyle }}
        title="Edit Online"
        // eslint-disable-next-line react/no-unknown-property
        srcdoc={htmlContent}
      />
    );
  }
}
