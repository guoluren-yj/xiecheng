import React from 'react';
import { InputNumber, Icon, Tooltip } from 'hzero-ui';
import { omit, isNil } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';

export default class InputNumberTip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.value,
    };
  }

  /**
   * 同步 Lov 值节流以提高性能
   * @param {String} value - 组件变更值
   */
  @Bind()
  @Throttle(500)
  setValue(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  /**
   * 同步输入值至 Input
   * @param {String} value - 输入框内的值
   */
  @Bind()
  setText(value) {
    const { isInput } = this.props;
    if (isInput) {
      this.setState(
        {
          text: value,
        },
        () => {
          this.setValue(value);
        }
      );
    }
  }

  render() {
    const { text: stateText } = this.state;
    const {
      form,
      value,
      style,
      isInput,
      showIcon,
      tooltipFlag,
      tooltipTitle,
      ...otherProps
    } = this.props;
    let text;
    const omitProps = ['onClick'];
    if (isInput) {
      text = stateText;
      omitProps.push('onChange');
    } else {
      const texts = stateText;
      text = isNil(value) ? '' : texts === 0 ? 0 : texts;
    }
    const inputStyle = {
      ...style,
      verticalAlign: 'middle',
      position: 'relative',
      top: -1,
    };

    return (
      <Tooltip title={tooltipFlag ? tooltipTitle : ''}>
        <InputNumber
          readOnly={!isInput}
          value={text}
          style={inputStyle} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper
          onChange={e => this.setText(e)}
          {...omit(otherProps, omitProps)}
        />
        {showIcon && (
          <Icon style={{ margin: '10px 5px', color: '#F05434' }} type="exclamation-circle" />
        )}
      </Tooltip>
    );
  }
}
