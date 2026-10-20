import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';

import { formatNumber } from '../../../../../utils/utils';

const AmountCard = observer((props) => {
  const {
    col,
    title,
    iconColor,
    help,
    iconType,
    taxIncludedAmount,
    setTailDiffShow,
    operationType,
    operationFunc,
    operationHelp,
    isInvOnlyTailFlag = false,
    financialPrecision,
  } = props;
  return (
    <div className={`amount-card amount-col-${col}`}>
      <div className="amount-total">
        <div>
          <Icon type={iconType} className="amount-icon" style={{ color: iconColor }} />
          <span className="amount-header">{title}</span>
          {help && (
            <Tooltip title={help}>
              <Icon type="help" />
            </Tooltip>
          )}
          {operationFunc && (
            <Tooltip title={operationHelp}>
              <Icon
                type={operationType}
                onClick={operationFunc}
                className="amount-card-operation-icon"
              />
            </Tooltip>
          )}
        </div>
        <div className="expand-card">
          <span className="amount-header">{formatNumber(taxIncludedAmount, financialPrecision)}</span>
          {setTailDiffShow && !isInvOnlyTailFlag && (
            <Icon type="expand_less" onClick={() => setTailDiffShow(false)} />
          )}
        </div>
      </div>
    </div>
  );
});
export default AmountCard;
