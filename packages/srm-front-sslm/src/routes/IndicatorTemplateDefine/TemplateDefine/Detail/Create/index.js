/*
 * @Date: 2023-11-15 15:25:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import React, { Fragment, useState, useEffect } from 'react';
import { useDataSet, Button, Spin } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { TopSection } from '_components/Section';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import { createTemplate } from '@/services/indicatorTemplateDefineService';
import Basic from '../components/Basic';
import { getHeaderTitle } from '../utils';
import { getBasicDs } from '../stores/getBasicDS';

const Create = ({ dispatch, indicatorTemplateDefineDetailRemote }) => {
  const routerParam = querystring.parse(location.search.substr(1));
  const { evalTplId, evalTplType, jumpSource } = routerParam;

  const [loading, setLoading] = useState(false);
  const basicDs = useDataSet(() => getBasicDs({ isEdit: true, type: jumpSource, isCreate: true }), [
    jumpSource,
  ]);

  useEffect(() => {
    if (evalTplType) {
      // 复制模板
      basicDs.current.set({
        evalTplType,
      });
    }
  }, [evalTplType]);

  const handleSave = async () => {
    const validateFlag = await basicDs.validate();
    if (validateFlag) {
      setLoading(true);
      const params = {
        evalTplId,
        ...basicDs.current?.toJSONData(),
      };
      return createTemplate(params, jumpSource)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/sslm/indicator-template-define/template-detail/${res.evalTplId}/${res.evalTplType}/edit`,
                search: querystring.stringify({
                  jumpSource: 'CREATE',
                }),
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Fragment>
      <Header
        backPath="/sslm/indicator-template-define/list"
        title={getHeaderTitle(jumpSource === 'COPY' ? 'copy' : 'create')}
      >
        <Button icon="save" color="primary" loading={loading} onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>
      <Content style={{ padding: 20 }}>
        <Spin spinning={loading}>
          <TopSection title={intl.get('sslm.common.view.title.baseInfo').d('基础信息')}>
            <Basic isEdit dataSet={basicDs} remote={indicatorTemplateDefineDetailRemote} />
          </TopSection>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common'],
  }),
  remote({
    code: 'SSLM.INDICATORTEMPLATEDEFINE.DETAIL',
    name: 'indicatorTemplateDefineDetailRemote',
  })
)(Create);
