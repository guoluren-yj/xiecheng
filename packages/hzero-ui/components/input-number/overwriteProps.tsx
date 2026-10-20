import React from 'react';
import omit from 'lodash/omit';
import { preventDefault } from 'choerodon-ui/dataset';
import type { InputNumberProps } from 'choerodon-ui/lib/input-number';

function renderInput(props) {
  return <input {...omit(props, ['suffix', 'inputMode'])} />;
}

function renderHandler(handler) {
  return handler;
}

function getInputNumberProps(): InputNumberProps {
  const prefixCls = 'ant-input-number';
  const upHandler = (
    <span
      unselectable="on"
      className={`${prefixCls}-handler-up-inner`}
      onClick={preventDefault}
    />
  );
  const downHandler = (
    <span
      unselectable="on"
      className={`${prefixCls}-handler-down-inner`}
      onClick={preventDefault}
    />
  );
  return {
    prefixCls,
    renderInput,
    renderHandler,
    upHandler,
    downHandler,
  };
}

const C7NInputNumberProps: InputNumberProps = getInputNumberProps();

export default C7NInputNumberProps;
