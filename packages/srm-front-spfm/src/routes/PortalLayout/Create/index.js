/*
 * @Date: 2024-03-27 15:01:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, {Fragment, useEffect} from "react";
import { routerRedux } from 'dva/router';
import {useDataSet, Form, IntlField, Button} from "choerodon-ui/pro";

import intl from "utils/intl";
import {Header, Content} from "components/Page";
import { TopSection } from '_components/Section';
import formatterCollections from 'utils/intl/formatterCollections';

import layoutDs from '../store/layoutDs';

const Create = ({dispatch})=>{
  const formDs = useDataSet(() => layoutDs(), []);

  const handleSave = ()=>{
   return formDs.submit().then(res=>{
      if(res){
        dispatch(routerRedux.push({
          pathname: `/spfm/portal-layout/edit/${res.content[0].id}`,
        }));
      }
    });
  };

  useEffect(()=>{
    formDs.create({}); // ds与表格共用，无法使用autoCreate
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('hzero.common.button').d('新建模板')} backPath="/spfm/portal-layout/list">
        <Button icon="save" color="primary" onClick={handleSave}>
          {intl.get('hzero.common.model.save').d('保存')}
        </Button>
      </Header>
      <Content style={{ padding: 20 }}>
        <TopSection title={intl.get('sslm.common.view.title.baseInfo').d('基础信息')}>
          <Form
            columns={3}
            useWidthPercent
            dataSet={formDs}
            labelLayout="float"
          >
            <IntlField name="layoutName" />
            <IntlField name="description" />
          </Form>
        </TopSection>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['sslm.common'],
})(Create);