/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';
import './WYSIWYGViewer.less';

function text2Delta(description) {
  if (!description) {
    return undefined;
  }
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(description)) {
    return String(description);
  }
  let temp = description;
  try {
    temp = JSON.parse(
      description
        .replace(/\\n/g, '\\n')
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, '\\&')
        .replace(/\\r/g, '\\r')
        .replace(/\\t/g, '\\t')
        .replace(/\\b/g, '\\b')
        .replace(/\\f/g, '\\f')
    );
  } catch (error) {
    temp = description;
  }
  // return temp;
  return temp || '';
}

/**
 * 将quill特有的文本结构转为html
 * @param {*} delta
 */

function delta2Html(description) {
  const delta = text2Delta(description);
  const QuillDeltaToHtmlConverter = require('quill-delta-to-html');
  const converter = new QuillDeltaToHtmlConverter(delta, {});
  const text = converter.convert();
  if (text.substring(0, 3) === '<p>') {
    return text.substring(3);
  } else {
    return text;
  }
}

class WYSIWYGViewer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      src: '',
      open: false,
    };
  }

  componentDidMount() {
    const { data } = this.props;
    window.addEventListener('click', (e) => {
      if (e.target.nodeName === 'IMG' && data && data.search(e.target.src) > -1) {
        e.stopPropagation();
        this.open(e.target.src);
      }
    });
  }

  open = (src) => {
    this.setState({
      open: true,
      src,
    });
  };

  escape = (str) => str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');

  render() {
    const { data } = this.props;
    const { open, src } = this.state;
    const html = delta2Html(data);

    return (
      <div className="c7n-read-delta" style={{ width: '100%', wordBreak: 'break-all' }}>
        <div dangerouslySetInnerHTML={{ __html: `${this.escape(html)}` }} />
        {open ? (
          <Lightbox
            mainSrc={src}
            onCloseRequest={() => this.setState({ open: false })}
            imageTitle="images"
          />
        ) : null}
      </div>
    );
  }
}

export default WYSIWYGViewer;
