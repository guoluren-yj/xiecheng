/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: yanglin
 * @LastEditTime: 2023-01-28 11:18:43
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, Output } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import { colorRender } from '../../util';

const Base = ({ baseInfoDs, currentStatusFlag }) => {
  return (
    <div className="config-right-content">
      <Form
        dataSet={baseInfoDs}
        showLines={6}
        columns={3}
        useColon={false}
        labelLayout="vertical"
        labelAlign="left"
        useWidthPercent
        showHelp="tooltip"
        className="c7n-pro-vertical-form-display"
      >
        <Output name="containerCode" />
        <Output name="containerName" />
        <Output
          name="containerStatus"
          renderer={({ value, text }) =>
            currentStatusFlag
              ? colorRender(value, text)
              : colorRender('Invalid', intl.get('hzero.common.currentStatus.invalid').d('已失效'))
          }
        />

        {/* <Output name="templateType" /> */}
        <Output name="effectiveTime" />
        <Output name="version" />
        {/* <Output name="enabledFlag" /> */}

        <Output name="versionControlFlag" renderer={({ value }) => yesOrNoRender(Number(value))} />
        <Output name="appointorId" />
        <Output name="createdByName" />
        <Output name="defaultCheckFlag" renderer={({ value }) => yesOrNoRender(Number(value))} />
      </Form>
    </div>
  );
};

export default Base;
