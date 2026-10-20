/*
 * TooltipButton - 带tooltip的button（用于h0个性化中显示tooltip提示）
 * @Date: 2022-10-28 10:27:27
 * @Author: ZLH
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

export default class TooltipButton extends Component {
  render() {
    const {
      tooltip,
      icon,
      buttonName,
      loading = false,
      style,
      type = '',
      disabled,
      onButtonClick = () => {},
    } = this.props;
    return (
      <Tooltip title={tooltip}>
        <Button
          icon={icon}
          style={style}
          loading={loading}
          type={type}
          onClick={onButtonClick}
          disabled={disabled}
        >
          {buttonName}
        </Button>
      </Tooltip>
    );
  }
}
