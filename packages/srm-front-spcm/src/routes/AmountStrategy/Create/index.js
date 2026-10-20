/*
 * @Date: 2024-06-07 14:36:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { compose, head } from 'lodash';
import { routerRedux } from 'dva/router';
import React, { Fragment, useState } from 'react';
import { useDataSet, Button, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection } from '_components/Section';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import Basic from '../components/Basic';
import { getHeaderTitle } from '../utils';
import { getFormDS } from '../stores/getDetailDS';

const Create = ({ dispatch }) => {
  const [loading, setLoading] = useState(false);

  const basicDs = useDataSet(() => getFormDS({ isEdit: true, isCreate: true }), []);

  const handleSave = async () => {
    const validateFlag = await basicDs.validate();
    if (validateFlag) {
      setLoading(true);
      return basicDs
        .submit()
        .then((response) => {
          if (response) {
            const { strategyId } = head(response.content) || {};
            dispatch(
              routerRedux.push({
                pathname: `/spcm/amount-strategy/${strategyId}/edit`,
                search: querystring.stringify({ sourceKey: 'CREATE' }),
              })
            );
          }
        })
        .finally(() => setLoading(false));
    }
  };
  return (
    <Fragment>
      <Header title={getHeaderTitle('create')} backPath="/spcm/amount-strategy/list">
        <Button icon="save" color="primary" onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content style={{ padding: 20 }}>
        <Spin spinning={loading}>
          <TopSection title={intl.get('hzero.common.view.title.baseInfo').d('基础信息')}>
            <Basic isEdit dataSet={basicDs} />
          </TopSection>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.amountStrategy'],
  })
)(Create);
