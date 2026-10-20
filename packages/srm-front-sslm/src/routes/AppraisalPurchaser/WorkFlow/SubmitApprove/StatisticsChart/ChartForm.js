/*
 * @Date: 2024-01-11 09:15:08
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head } from 'lodash';
import React, { Fragment, useState } from 'react';
import intl from 'utils/intl';
import { Dropdown, Menu, Icon } from 'choerodon-ui/pro';

const ChartForm = ({ indicatorType, onTypeChange }) => {
  const [defaultIndicator, setDefaultIndicator] = useState(head(indicatorType)?.indicatorName);

  const handleOverlayClick = e => {
    const value = e.key;
    const name = e?.item.props?.meaning;
    setDefaultIndicator(name);
    onTypeChange(value);
  };

  const renderOption = () => {
    return (
      <Menu defaultSelectedKeys={[head(indicatorType)?.evalTplIndId]}>
        {indicatorType.map(item => (
          <Menu.Item key={item.evalTplIndId} meaning={item.indicatorName}>
            {item.indicatorName}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  return (
    <Fragment>
      <div className="indicator-title">
        <Dropdown overlay={() => renderOption()} onOverlayClick={handleOverlayClick}>
          <span
            style={{
              cursor: 'pointer',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {intl
              .get('sslm.appraisalPurchaser.view.field.rankDistribution', {
                name: defaultIndicator,
              })
              .d(`${defaultIndicator}等级分布`)}
          </span>
          <Icon type="expand_more" />
        </Dropdown>
      </div>
    </Fragment>
  );
};

export default ChartForm;
