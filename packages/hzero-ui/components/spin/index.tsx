import type { FunctionComponent } from 'react';
import React from 'react';
// import classNames from 'classnames';
import { Size } from 'choerodon-ui/lib/_util/enum';
import C7NSpin from 'choerodon-ui/lib/spin';
import type { SpinIndicator, SpinProps, SpinState } from 'choerodon-ui/lib/spin';

export { Size as SpinSize };
export type { SpinProps, SpinIndicator, SpinState };

// function renderIndicator(props: SpinProps): React.ReactElement {
//   const { prefixCls = 'ant-spin' } = props;
//   return (
//     <span className={classNames(`${prefixCls}-dot`, `${prefixCls}-dot-spin`)}>
//       <i />
//       <i />
//       <i />
//       <i />
//     </span>
//   );
// }

const Spin: FunctionComponent<SpinProps> = function Spin(props) {
  return (
    <C7NSpin
      prefixCls="ant-spin"
      // indicator={renderIndicator(props)}
      {...props}
    />
  );
};
const { setDefaultIndicator } = C7NSpin;

export { setDefaultIndicator };

Spin.displayName = 'Spin<hzeroWithC7n>';

type SpinType = typeof Spin & {
  setDefaultIndicator: typeof setDefaultIndicator;
}
(Spin as SpinType).setDefaultIndicator = setDefaultIndicator;

export default Spin as SpinType;
