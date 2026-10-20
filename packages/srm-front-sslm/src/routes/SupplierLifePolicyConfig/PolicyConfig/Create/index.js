/*
 * @Date: 2024-03-15 10:32:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { compose, head } from 'lodash';
import {
  Button,
  Form,
  useDataSet,
  TextField,
  NumberField,
  IntlField,
  Spin,
  Select,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { TopSection } from '_components/Section';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { getBasicDs } from '../stores/getBasicDS';

const Create = ({ dispatch }) => {
  const dataSet = useDataSet(() => getBasicDs(), []);

  // 保存回调
  const handleSave = () => {
    return dataSet.submit().then(response => {
      if (response && response.success) {
        const { strategyId } = head(response.content) || {};
        dispatch(
          routerRedux.push({
            pathname: `/sslm/supplier-life-policy-config/detail/${strategyId}/edit`,
          })
        );
      }
    });
  };

  return (
    <Fragment>
      <Header
        backPath="/sslm/supplier-life-policy-config/list"
        title={intl
          .get('sslm.supplierLifePolicyConfig.view.title.createPolicyConfig')
          .d('新建策略')}
      >
        <Button color="primary" icon="save" onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content style={{ padding: 20 }}>
        <Spin dataSet={dataSet}>
          <TopSection title={intl.get('sslm.common.view.title.baseInfo').d('基础信息')}>
            <Form columns={3} useWidthPercent dataSet={dataSet} labelLayout="float">
              <TextField name="strategyCode" />
              <IntlField name="strategyName" />
              <NumberField name="orderSeq" />
              <Select
                name="mustProcess"
                showHelp="tooltip"
                help={intl
                  .get('sslm.supplierLifePolicyConfig.modal.field.strategyControlModeHelp')
                  .d(
                    '配置两个阶段之间如果未创建流程线时，是否允许手工发起升降级。如果管控要求不严格，大多数阶段之间都无条件允许手工发起，建议选择“无流程线时允许手工发起”'
                  )}
              />
            </Form>
          </TopSection>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplierLifePolicyConfig'],
  })
)(Create);
