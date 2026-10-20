import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { noop } from 'lodash';

import SVGIcon from '@/routes/components/SvgIcon';
import { numberSeparatorRender } from '@/utils/renderer';

import Style from './index.less';

const TabItem = (props) => {
  const {
    title = '',
    tabItemName = '',
    tabItemAmount = '',
    activateId = '',
    primaryKeyId = '',
    onClick = noop,
  } = props;

  return (
    <React.Fragment>
      <div
        className={classnames(Style['tab-item'], {
          [Style['tab-item-activate']]: activateId === primaryKeyId,
        })}
        onClick={() => onClick(primaryKeyId)}
      >
        <div className={Style['tab-item-content']}>
          <div
            className={classnames(Style['tab-item-content-name'], {
              [Style['tab-item-content-name-activate']]: activateId === primaryKeyId,
            })}
          >
            <Tooltip title={tabItemName}>{tabItemName}</Tooltip>
          </div>
          <div className={Style['tab-item-content-amount']}>
            <Tooltip title={title}>
              <span style={{ marginRight: '8px', marginTop: '2px' }}>
                <SVGIcon
                  path={require('@/assets/check-count.svg')}
                  className={Style['link-color']}
                />
              </span>
            </Tooltip>
            <Tooltip title={tabItemAmount}>
              <div className={Style['tab-item-content-amount-box']}>
                {numberSeparatorRender(tabItemAmount)}
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TabItem;
