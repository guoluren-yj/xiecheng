/**
 * @description 付款组合工作流详情
 * @extends {Component}
 */

import React, { Fragment, useEffect } from 'react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { getApproveDetail } from '@/services/taskService';



const Details = ({ match, history }) => {
  const {
    params: { processInstanceId },
  } = match;

  useEffect(() => {
    if(processInstanceId){
      getApproveDetail({processInstanceId}).then(res => {
        if(getResponse(res)){
          history.push(res.replace(/^\/app/, ''));
        }
      });
    }
  }, []);


  return (
    <Fragment>
      <Header
        title={intl.get(`hwfp.task.view.goldRainGroup.title`).d('中转审批表单')}
      />
      <Content>
        loading
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['hwfp.task.view', 'hzero.common', 'scux.common'],
})(Details);
