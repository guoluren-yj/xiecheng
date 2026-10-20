/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-16 18:50:09
 * @FilePath: /srm-front-sslm/src/routes/SupplierLifePolicyConfig/PhaseConfig/StageForm.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
/*
 * @Date: 2022-11-08 16:06:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, IntlField, TextField, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

const StageForm = ({ record }) => {
  return (
    <div style={{ margin: '-16px 0 0 16px' }}>
      <TopSection>
        <SecondSection
          title={intl.get('sslm.supplierLifePolicyConfig.view.title.stageInfo').d('阶段信息')}
        >
          <Form record={record} labelLayout="float" style={{ margin: 0 }}>
            <TextField name="stageCode" restrict="A-Z0-9" />
            <IntlField name="stageDescription" />
            {/* <CheckBox name="allowOrders" /> */}
            <CheckBox name="allowProtocolFlag" />
            <CheckBox name="allowSmallOrders" />
            <CheckBox name="allowSettleAccount" />
          </Form>
        </SecondSection>
      </TopSection>
    </div>
  );
};

export default StageForm;
