/**
 * model - 送货单创建 - 弹窗函数
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'hzero-ui';

const IS_REACT_16 = !!ReactDOM.createPortal;

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {any} children - 子组件
 * @reactProps {function} afterClose - 关闭后的函数
 * @reactProps {boolean} visible - 是否隐藏
 * @reactProps {number} zIndex - css z-index
 * @reactProps {number} width - 宽度
 * @reactProps {object} style - 样式
 * @reactProps {string} className - className
 * @reactProps {string} wrapClassName - 容器className
 * @reactProps {function} close - 关闭函数
 * @reactProps {any} footer - 底部元素
 * @reactProps {string} title - 标题
 * @return React.element
 */
class WrapperModal extends PureComponent {
  render() {
    const {
      children,
      afterClose,
      visible,
      zIndex,
      width,
      style,
      className,
      wrapClassName,
      close,
      footer,
      title,
    } = this.props;
    return (
      <Modal
        title={title}
        className={className}
        afterClose={afterClose}
        wrapClassName={wrapClassName}
        visible={visible}
        onCancel={close.bind(this, { triggerCancel: true })}
        style={style}
        width={width}
        zIndex={zIndex}
        footer={footer}
      >
        {children}
      </Modal>
    );
  }
}

/**
 * modal - 弹窗函数
 * @param {object} [config={}] - Moadl组件属性配置
 */
export default function modal(config = {}) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  let currentConfig = { ...config, close, visible: true };
  function close(...args) {
    currentConfig = {
      ...currentConfig,
      visible: false,
      afterClose: destroy.bind(this, ...args),
    };
    if (IS_REACT_16) {
      render(currentConfig);
    } else {
      destroy(...args);
    }
  }

  function destroy(...args) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    const triggerCancel = args && args.length && args.some(param => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(...args);
    }
  }

  function render(props) {
    ReactDOM.render(<WrapperModal {...props} />, div);
  }

  render(currentConfig);
  return {
    destroy: close,
  };
}
