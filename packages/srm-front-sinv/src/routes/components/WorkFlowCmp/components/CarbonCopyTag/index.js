/**
 * CarbonCopyTag - 抄送已读/未读展示组件
 * @date: 2022-8-18
 * @author: lokya <kan.li01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tooltip, Popover } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import styles from './index.less';

function CarbonCopyTag(props = {}) {
  const {
    carbonCopyInfo = {},
    errorColor = '#F25535',
    successColor = '#3AB545',
    showRowTooltip = false,
  } = props;
  const { initiator, actionName, employeeMap = {} } = carbonCopyInfo;
  const employeeInfo = Object.entries(employeeMap).map(([key, value]) => {
    return {
      name: key,
      type: value,
      color: value ? successColor : errorColor,
      message: value
        ? intl.get('hzero.common.process.readFlagY').d('已读')
        : intl.get('hzero.common.process.readFlagN').d('未读'),
    };
  });

  const renderEmployeeTag = (infos = [], toolTipFlag) => {
    if (toolTipFlag) {
      return infos.map((info) => {
        return (
          <Tooltip title={info.message}>
            <span className="carbon-copy-tag-employee" style={{ borderLeftColor: info.color }}>
              {info.name}
            </span>
          </Tooltip>
        );
      });
    } else {
      return infos.map((info) => {
        return (
          <span className="carbon-copy-tag-employee" style={{ borderLeftColor: info.color }}>
            {info.name}
          </span>
        );
      });
    }
  };

  return (
    <div className={styles['carbon-copy-tag']}>
      {showRowTooltip ? (
        <Popover
          overlayClassName={styles['workflow-carbon-copy-tag-popover']}
          content={
            <>
              <span className="carbon-copy-tag-initiator">{initiator}</span>
              <span className="carbon-copy-tag-action">{actionName}</span>
              {renderEmployeeTag(employeeInfo, false)}
            </>
          }
        >
          <span className="carbon-copy-tag-initiator">{initiator}</span>
          <span className="carbon-copy-tag-action">{actionName}</span>
        </Popover>
      ) : (
        <>
          <span className="carbon-copy-tag-initiator">{initiator}</span>
          <span className="carbon-copy-tag-action">{actionName}</span>
        </>
      )}
      {renderEmployeeTag(employeeInfo, true)}
    </div>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(CarbonCopyTag);
