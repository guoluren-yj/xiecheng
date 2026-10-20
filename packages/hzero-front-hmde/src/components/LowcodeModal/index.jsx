import { Modal } from 'choerodon-ui/pro';
import globalStyles from '@/lowcodeGlobalStyles/global.less';

const LowcodeModal = { ...Modal };

const enumType = ['confirm', 'info', 'success', 'error', 'warning'];

const sizeStyleMap = {
  small: {
    width: '25%',
  },
  mid: {
    width: '41%',
  },
  big: {
    width: '58%',
  },
  bigger: {
    width: '75%',
  },
  biggest: {
    width: '85%',
  },
};

LowcodeModal.open = (props) => {
  const { className = '', lowcodeSize, contentfont = false } = props;

  return Modal.open({
    ...props,
    className: `${className} lowcode-m-modal ${globalStyles['lowcode-m-modal']} ${
      contentfont && lowcodeSize === 'small' ? globalStyles['lowcode-m-modal-content'] : ''
    }`,
    style: sizeStyleMap[lowcodeSize]
      ? { ...(props.style || {}), ...sizeStyleMap[lowcodeSize] }
      : props.style,
  });
};

enumType.forEach((item) => {
  LowcodeModal[item] = (props, arg1) => {
    // 不确定原本是否由第二个参数，因此就叫做arg1了
    const { className = '', lowcodeSize, contentfont = true } = props;
    if (typeof props === 'object') {
      return Modal[item]({
        ...props,
        className: `${className} lowcode-m-modal ${globalStyles['lowcode-m-modal']} ${
          contentfont && lowcodeSize === 'small' ? globalStyles['lowcode-m-modal-content'] : ''
        }`,
        style: sizeStyleMap[lowcodeSize]
          ? { ...(props.style || {}), ...sizeStyleMap[lowcodeSize] }
          : props.style,
      });
    }
    return Modal[item]({
      children: props,
      className: `${globalStyles['lowcode-m-modal']} lowcode-m-modal ${globalStyles['lowcode-m-modal-content']}`,
      style: sizeStyleMap[arg1] ? { ...sizeStyleMap[arg1] } : undefined,
    });
  };
});

export default LowcodeModal;
