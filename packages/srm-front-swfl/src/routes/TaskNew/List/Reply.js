import React, { Component } from 'react';
import { TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

export default class Reply extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { originValue } = props;
    const result = originValue ? originValue.match(/\n|\r/g) : [];
    this.state = {
      replyValue: originValue || '',
      count: result ? result.length : 0,
    };
  }

  componentDidMount() {
    const target = document.getElementById('comment-textarea');
    // 监听粘贴事件，粘贴情况下，需要提前计算出换行数来修改maxLength
    if (target) {
      target.addEventListener('paste', this.handleMaxLength);
    }
  }

  componentWillUnmount() {
    const target = document.getElementById('comment-textarea');
    if (target) {
      target.removeEventListener('paste', this.handleMaxLength);
    }
  }

  @Bind()
  handleMaxLength(event) {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    this.handleDeleteNewLine(paste);
  }

  @Bind()
  // 粘贴文本最后一个字符为换行符时，删除
  handleDeleteNewLine = (paste) => {
    // 最后一个值为换行符时，去除换行符
    if (
      paste &&
      (paste.charAt(paste.length - 1) === '\n' || paste.charAt(paste.length - 1) === '\r')
    ) {
      const newPaste = paste.substring(0, paste.length - 1);
      this.handleDeleteNewLine(newPaste);
    } else {
      let num = 0;
      if (paste.replace(/\n|\r/g, '').length > 3500) {
        // 粘贴进审批意见的值大于3500时，只需统计3500以内的换行符
        // 出现换行的位置
        let index = paste.indexOf('\n');
        // 有换行符且除换行以外的字数在3500内时。index-1即换行符前的字符
        while (index !== -1 && index - 1 - num < 3501) {
          num++;
          index = paste.indexOf('\n', index + 1);
        }
      }
      this.setState({ count: num });
    }
  };

  @Bind()
  handleValue(value) {
    const result = value ? value.match(/\n|\r/g) : [];
    // 如遇换行符，长度会+1，因此需要计算出换行符数量，在maxLength基础上加换行符数量
    this.setState({ replyValue: value, count: result ? result.length : 0 });
  }

  @Bind()
  handleValidationRender() {
    return (
      <span>
        {intl.get('hzero.common.validation.max', {
          max: 3500,
        })}
      </span>
    );
  }

  render() {
    const { replyValue, count } = this.state;
    return (
      <div>
        <TextArea
          id="comment-textarea"
          value={replyValue}
          valueChangeAction="input"
          onChange={this.handleValue}
          rows={12}
          maxLength={3500 + count}
          trim="none"
          validationRenderer={this.handleValidationRender}
        />
        <p>{replyValue ? replyValue.replace(/\n|\r/g, '').length : 0}/3500</p>
      </div>
    );
  }
}
