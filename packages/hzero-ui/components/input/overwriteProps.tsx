import type { InputProps } from 'choerodon-ui/lib/input';

const C7NInputProps: Pick<InputProps, 'prefixCls' | 'trim' | 'inputChinese' | 'border' | 'labelLayout' | 'showLengthInfo' | 'showPasswordEye'> = {
  prefixCls: 'ant-input',
  trim: true,
  inputChinese: true,
  border: false,
  labelLayout: 'none',
  showLengthInfo: 'never',
  showPasswordEye: 'nohold',
};

export default C7NInputProps;
