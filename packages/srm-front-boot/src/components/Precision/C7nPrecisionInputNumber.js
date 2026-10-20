/**
 * 针对c7n/c7n-pro 封装的响应式输入框组件
 */
import React from 'react';
import { observer } from 'mobx-react';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { NumberField } from 'choerodon-ui/pro';

import PrecisionInputNumber from './PrecisionInputNumber';

// const C7nPrecisionInputNumber = observer(
//   ({ record, name, uom, currency, financial, ...otherProps }) => {
//     let typeField = '';
//     let valueField = '';
//     if (!isUndefined(uom)) {
//       typeField = 'uom';
//       valueField = uom;
//     } else if (!isUndefined(currency)) {
//       typeField = 'currency';
//       valueField = currency;
//     } else {
//       typeField = 'financial';
//       valueField = financial;
//     }
//     const expandProps = {
//       name,
//       record,
//       [typeField]: record?.get(valueField),
//       ...otherProps,
//     };
//     return <NumberField {...expandProps} />;
//   }
// );

// const C7nPrecisionInputNumber = () => {
//   return <NumberField />;
// };

@observer
class C7nPrecisionInputNumber extends NumberField {
  @Bind()
  handleRef(ref) {
    if (!ref) return;
    this.elementReference(ref.element); // 由于在NumberField上包裹了一层, 导致聚焦时, 无法自动聚焦到真实输入框上, 根本原因没有拿到真实element
  }

  render() {
    const { headerRecord, record, name, uom, currency, financial, ...otherProps } = this.props;
    let typeField = '';
    let valueField = '';
    if (!isUndefined(uom)) {
      typeField = 'uom';
      valueField = uom;
    } else if (!isUndefined(currency)) {
      typeField = 'currency';
      valueField = currency;
    } else {
      typeField = 'financial';
      valueField = financial;
    }
    const expandProps = {
      name,
      record,
      headerRecord,
      [typeField]: (headerRecord || record)?.get(valueField),
      ...otherProps,
    };
    return <PrecisionInputNumber key={record?.key} onRef={this.handleRef} {...expandProps} />;
  }
}

export default C7nPrecisionInputNumber;
