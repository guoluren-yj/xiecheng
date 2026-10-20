import React, { Fragment, useCallback, useMemo, useEffect, useState } from 'react';
import { DataSet, IntlField, Spin, Form, TextField, Lov, Switch, Select } from 'choerodon-ui/pro';
import { Card, Tabs } from 'choerodon-ui';

import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { formData } from './initialDataDs';
import ObjectComponents from './ObjectComponents';
import ReferencingComponents from './ReferencingComponents';
import './index.less';

const { TabPane } = Tabs;
enum TabsPosition {
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right',
}


const Details: React.FC<any> = (props) => {
  const {match: {params: {id}}} = props;
  const [tabKey, setTabKey] = useState('baseInfo');
  const formDataDs = useMemo(() => new DataSet(formData()), []);

  useEffect(() => {
    if(id && tabKey) {
      if(tabKey === 'baseInfo') {
        formDataDs.setQueryParameter('id', id);
        formDataDs.query();
      }
    }
  }, [id, tabKey]);

  const handChangeTab = useCallback(key => {
    setTabKey(key);
  }, []);

  return (
    <Fragment>
      <Header
        title={intl
          .get(`scux.externalInterfaceDefinition.view.title.interfaceObjectDefinitionNew`)
          .d('外部接口定义')}
        backPath='/sitf/external-interface-definition/list'
      >
      </Header>
      <Content className="contentStyle">
        <Tabs tabPosition={TabsPosition.left} activeKey={tabKey} onChange={handChangeTab} style={{height: "calc(100vh - 152px)"}} flex>
          <TabPane tab={intl.get(`scux.externalInterfaceDefinition.view.tab.baseInfo`).d('基础信息')} key="baseInfo">
            <div style={{height: 'calc(100vh - 152px)', overflow: 'scroll'}}>
            <Card>
            <div className="titleTag">
              {intl.get(`scux.externalInterfaceDefinition.view.tab.baseInfo`).d('基础信息')}
            </div>
            <Spin dataSet={formDataDs}>
              <Form dataSet={formDataDs} columns={3} labelLayout={LabelLayout.float}>
                <IntlField name="name" disabled />
                    <TextField name="code" disabled />
                    <Lov name="tenantIdLov" disabled />
                    <Lov name="interfaceCodeLov" disabled />
                    <TextField name="interfaceName" disabled />
                    <Lov name="objectCodeLov" disabled />
                    <TextField name="objectName" disabled />
                    <Select name="releaseStatus" disabled />
                    <Select name="enabledFlag" disabled />
                </Form>
              </Spin>
            </Card>
            <Card>
              <div className="titleTag">
                {intl.get(`scux.externalInterfaceDefinition.view.tab.enter.parameter`).d('创建信息')}
              </div>
              <Spin dataSet={formDataDs}>
                <Form dataSet={formDataDs} columns={3} labelLayout={LabelLayout.float}>
                  <TextField name="createName" disabled />
                  <TextField name="creationDate" disabled />
                  <TextField name="updateName" disabled />
                  <TextField name="lastUpdateDate" disabled />
                </Form>
              </Spin>
            </Card>
            </div>
          </TabPane>
          <TabPane tab={intl.get(`scux.externalInterfaceDefinition.view.tab.request.messsage`).d('请求报文')} key="parameter">
            <ObjectComponents formDataDs={formDataDs} id={id} />
          </TabPane>
          <TabPane tab={intl.get(`scux.externalInterfaceDefinition.view.tab.feedback.object`).d('反馈报文')} key="object">
            <ReferencingComponents formDataDs={formDataDs} id={id} />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.externalInterfaceDefinition', 'hzero.common'],
})(Details);
