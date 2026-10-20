/**
 * 问号，提示渲染
 * @author aaron.yi
 * @date 2020/7/13
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { isString } from 'lodash';
import { Popover, Icon } from 'hzero-ui';
import Tips from './Tips';

const QuestionPopover = (props) => {
  const {
    code,
    text = '',
    message = '',
    iconStyle = { marginLeft: 2, textIndent: 0 },
    iconType = 'question-circle',
    ...extraProps
  } = props;

  let contents = message;
  if (isString(message)) {
    contents = [];
    const msgList = message.split('\n');
    msgList.forEach((item) => {
      contents.push(<div style={{ paddingBottom: '3px' }}>{item}</div>);
    });
  }

  const renderContent = () => {
    if (code) {
      return (
        <>
          {text}
          <Tips code={code} trigger="hover">
            <Icon style={iconStyle} type={iconType} />
          </Tips>
        </>
      );
    }
    return (
      <>
        {text}
        <Popover content={<div>{contents}</div>} overlayStyle={{ maxWidth: 450 }} {...extraProps}>
          <Icon style={iconStyle} type={iconType} />
        </Popover>
      </>
    );
  };

  return renderContent();
};

export default QuestionPopover;
