import React from 'react';
import { Tooltip, InputNumber } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';

import { getQuotationTooltipTitle } from '@/utils/renderer';

import intl from 'utils/intl';

import Styles from './index.less';

// 外层包一个组件 解决个性化对加在Form.Item里面的tooltip造成的不显示影响
// export default function FormInputWrapper(props) {
//   const { priceReadonlyFlag, ...inputProps } = props;
//   return (
//     <Tooltip placement="topLeft" title={getQuotationTooltipTitle(priceReadonlyFlag)}>
//       <InputNumber {...inputProps} />
//     </Tooltip>
//   );
// }

@observer
export default class FormInputWrapper extends React.Component {
  render() {
    const { priceReadonlyFlag, ...inputProps } = this.props;

    return (
      <>
        <Tooltip placement="topLeft" title={getQuotationTooltipTitle(priceReadonlyFlag)}>
          <InputNumber {...inputProps} />
        </Tooltip>

        <InputNumberZeroTooltipWrap {...(this.props || {})} />
      </>
    );
  }
}

const InputNumberZeroTooltipWrap = observer((props = {}) => {
  const {
    zeroValueVisibleFlag = false, // 显示标识
    taxFlag = false, // 含税标识 需要取反。 例如 基准价未税，显示的含税提示
    styleObject = {},
    currencyPrecision = null,
  } = props;

  if (!zeroValueVisibleFlag) {
    return '';
  }

  const getCurrentTitle = () => {
    const newCurrencyPrecision = currencyPrecision ?? 0;

    let currentTitle = intl
      .get('ssrc.common.view.taxPrirceCalcZeroFormualWarning', {
        currencyPrecision: newCurrencyPrecision,
      })
      .d(
        '根据计算公式：含税单价=含税金额/数量*价格批量，含税单价设置的小数位为{currencyPrecision}，四舍五入后展示的含税单价即为0'
      );
    if (!taxFlag) {
      currentTitle = intl
        .get('ssrc.common.view.netPrirceCalcZeroFormualWarning', {
          currencyPrecision: newCurrencyPrecision,
        })
        .d(
          '根据计算公式：未税单价=未税金额/数量*价格批量，未税单价设置的小数位为{currencyPrecision}，四舍五入后展示的未税单价即为0'
        );
    }

    return currentTitle;
  };

  return (
    <Tooltip placement="topLeft" title={getCurrentTitle()}>
      <Icon
        type="help"
        className={Styles['supplier-quotation-zero-value-tooltip-icon-color']}
        style={{ marginLeft: '1px', ...(styleObject || {}) }}
      />
    </Tooltip>
  );
});

export { InputNumberZeroTooltipWrap };
