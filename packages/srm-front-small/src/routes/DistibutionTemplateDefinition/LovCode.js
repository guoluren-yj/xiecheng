/**
 * 值集编码
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Icon, Badge } from 'choerodon-ui';
import { Lov, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default function LovCode(props) {

  const LovCodeWrapper = observer(({ ds, fieldEvents }) => {
    const {
      componentType,
      dimensionParameterList,
      dimensionFieldRelationList,
      productDimensionFlag,
      isProductDimension,
      treeSelectFlag,
      translateFlag,
    } = ds?.current?.toData() || {};
    const dotFlag =
      !isEmpty(dimensionParameterList) ||
      !isEmpty(dimensionFieldRelationList) ||
      treeSelectFlag ||
      translateFlag;
    return (
      ['LOV', 'SELECT'].includes(componentType) && (
        <Lov
          name="lovCodeLov"
          disabled={+productDimensionFlag === 1 || isProductDimension}
          addonAfter={
            <Tooltip placement="top" title={intl.get('small.common.fx.field.config').d('值集配置')}>
              <Badge dot={dotFlag}>
                <Icon
                  type="settings"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    fieldEvents();
                  }}
                />
              </Badge>
            </Tooltip>
          }
        />
      )
    );
  });

  return <LovCodeWrapper {...props} />;
};
