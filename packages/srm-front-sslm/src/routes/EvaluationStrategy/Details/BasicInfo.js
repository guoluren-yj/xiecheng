/**
 * @Description: 供应商评估策略- 详情页 - 基本信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-07 10:56:59
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Tag } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';
import '../index.less';

const BasicInfo = observer(({ dataSet, isEdit, customizeForm, custLoading, readOnly }) => {
  const formColumns = [
    {
      name: 'strategyCode',
    },
    {
      name: 'strategyName',
    },
    {
      name: 'strategyStatus',
      renderer: ({ name, value, record }) => {
        const { enabledFlag } = record?.get(['enabledFlag']) || {};
        if (!enabledFlag) {
          return (
            <Tag color="red" style={{ border: 'none' }}>
              {intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
            </Tag>
          );
        } else {
          return renderStatus({ name, value, record });
        }
      },
    },
    {
      name: 'assessType',
      componentType: 'Select',
    },
    {
      name: 'versionNumber',
    },
    {
      name: 'realName',
    },
    {
      name: 'creationDate',
      componentType: 'DATETIMEPICKER',
    },
  ];

  return customizeForm(
    {
      readOnly,
      code: 'SSLM.EVAL_PLAN_STRATEGY.DETAIL_BASIC_INFO',
    },
    <Form
      columns={3}
      useWidthPercent
      dataSet={dataSet}
      custLoading={custLoading}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      {formColumns.map(props => (
        <FormField key={props.name} isEdit={isEdit} {...props} />
      ))}
    </Form>
  );
});

export default BasicInfo;
