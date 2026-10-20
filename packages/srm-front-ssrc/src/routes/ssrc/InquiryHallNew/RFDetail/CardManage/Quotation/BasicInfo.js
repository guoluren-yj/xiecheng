/*
 * @Descripttion: 信息征询中--基本信息
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-14 11:17:38
 * @LastEditors: yiping.liu
 */
import React, { useContext, useEffect } from 'react';
import { Output, Form, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../../store/index';

const BasicInfo = observer(() => {
  const {
    commonDs: { consultBasicFormDs },
    routerParams: { sourceCategory },
    customizeForm,
  } = useContext(Store);

  const { current } = consultBasicFormDs;

  useEffect(() => {
    consultBasicFormDs.query();
  }, []);

  return customizeForm(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.QUOTATION_RF_INFO_${sourceCategory}`,
      dataSet: consultBasicFormDs,
    },
    <Form
      dataSet={consultBasicFormDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="rfTitle" />
      <Output name="templateName" />
      {current?.get('sourceFrom') === 'PROJECT' && (
        <Output
          name="sourceProjectName"
          renderer={({ record, value }) => (
            <Tooltip
              title={`${record?.get('sourceProjectNum')} - ${record?.get('sourceProjectName')}`}
            >
              {value}
            </Tooltip>
          )}
        />
      )}
      <Output name="rfRemark" />
    </Form>
  );
});

export default BasicInfo;
