import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import omit from 'lodash/omit';
import { toJS } from 'mobx';
import classNames from 'classnames';
import { delta2Html } from './utils';
import Modal from '../modal';

export interface RichTextViewerProps {
  deltaOps?: any;
  className?: string;
  style?: React.CSSProperties;
}

class RichTextViewer extends Component<RichTextViewerProps> {
  componentDidMount() {
    const { deltaOps } = this.props;
    const thisNode = findDOMNode(this);
    if (thisNode && deltaOps) {
      thisNode.addEventListener('click', this.open);
    }
  }

  componentWillUnmount() {
    const thisNode = findDOMNode(this);
    if (thisNode) thisNode.removeEventListener('click', this.open);
  }

  open = (e) => {
    const { target } = e;
    if (target && target.nodeName === 'IMG') {
      e.stopPropagation();
      const { deltaOps } = this.props;
      const imgArr: string[] = [];
      deltaOps.forEach(item => {
        const image = item.insert.image;
        if (image) {
          imgArr.push(image);
        }
      });
      const { src } = target;
      const index = imgArr.findIndex(img => img === src);
      Modal.preview({
        list: imgArr,
        defaultIndex: index,
      })
    }
  };

  escape = str => str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');

  getOtherProps() {
    return omit(this.props, ['deltaOps']);
  }

  render() {
    const { deltaOps, className } = this.props;
    const html = delta2Html(toJS(deltaOps));

    const classString = classNames(
      className,
      'quill',
    );

    return (
      <div {...this.getOtherProps()} className={classString}>
        <div className="ql-container ql-snow">
          <div dangerouslySetInnerHTML={{ __html: `${this.escape(html)}` }} className="ql-editor" />
        </div>
      </div>
    );
  }
}

export default RichTextViewer;
