/*
 * OtherInfo - 其他信息
 * @Date: 2023-04-13 09:15:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin, Output } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { isNil } from 'lodash';
import { handleExtTextRenderIntercept } from '@/routes/components/utils';

const OtherInfo = ({
  dataSet,
  custLoading,
  customizeForm,
  handleCompareRender,
  customizeUnitCode,
}) => {
  const fields = [
    {
      name: 'foreverBlacklistFlag',
      renderer: ({ value }) => (isNil(value) ? yesOrNoRender(0) : yesOrNoRender(Number(value))),
    },
    {
      name: 'blacklistFlag',
      renderer: ({ value }) => (isNil(value) ? yesOrNoRender(0) : yesOrNoRender(Number(value))),
    },
    {
      name: 'blacklistExpiryDate',
    },
  ].map(field => {
    const { type, ...others } = field;
    return {
      renderer: ({ value, record, name }) => handleCompareRender({ value, record, name, type }),
      ...field,
      ...others,
    };
  });

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
          readOnly: true,
          extTextRenderIntercept: handleExtTextRenderIntercept,
        },
        <Form
          columns={3}
          dataSet={dataSet}
          labelLayout="vertical"
          custLoading={custLoading}
          style={{ width: '90%', maxWidth: 1172 }}
          className="c7n-pro-vertical-form-display"
        >
          {fields.map(field => (
            <Output {...field} />
          ))}
        </Form>
      )}
    </Spin>
  );
};

export default OtherInfo;
