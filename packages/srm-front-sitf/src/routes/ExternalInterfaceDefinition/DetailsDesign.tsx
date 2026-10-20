import React, { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import { DataSet, Table, Button, Modal, Form, TextArea } from 'choerodon-ui/pro';
import { Tabs, Card } from 'choerodon-ui';
import { isNil } from 'lodash';
import { parse } from 'querystring';

import intl from 'hzero-front/lib/utils/intl';
import { Header, Content } from 'hzero-front/lib/components/Page';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'utils/notification';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { treeNavData, requestData, constantInfo, globalVariable, fetchContentLineDelete, fetchConstantSave, fetchVariableLineDelete, fetchVariableSave, fetchPublish } from './initialDataDs';
import RequestMapping from './RequestMapping';
import './index.less';
import './treeshow.less';

const { TabPane } = Tabs;
const DetailsDesign: React.FC<any> = (props) => {

  const {match: {params: {extItfId}}, location} = props;
  const [tabKey, setTabkey] = useState('information');
  const {constantsUniqueCode, name} = location.state || {};
  const {tenantId, objectCode, editorType} = parse(location.search.substr(1));

  const constantInfoDs = useMemo(() => new DataSet(constantInfo()), []);
  const globalVariableDs = useMemo(() => new DataSet(globalVariable(tenantId, objectCode, extItfId)), []);
  const requestDataDs = useMemo(() => new DataSet(requestData('REQUEST_MAPPING')), []);
  const requestTreeNavDataDs = useMemo(() => new DataSet(treeNavData()), []);
  const feedDataDs = useMemo(() => new DataSet(requestData('RESPONSE_MAPPING')), []);
  const feedTreeNavDataDs = useMemo(() => new DataSet(treeNavData()), []);

  useEffect(() => {
    if(!isNil(extItfId) && !isNil(tenantId) && !isNil(constantsUniqueCode)) {
      constantInfoDs.setQueryParameter('tenantId', tenantId);
      constantInfoDs.setQueryParameter('extItfId', extItfId);
      constantInfoDs.setQueryParameter('uniqueCode', constantsUniqueCode);
      constantInfoDs.query();
      globalVariableDs.setQueryParameter('tenantId', tenantId);
      globalVariableDs.setQueryParameter('extItfId', extItfId);
      globalVariableDs.query();
    }
  }, [tenantId, extItfId, constantsUniqueCode]);

  const handleLineEditor = useCallback((record) => {
    if(record.getState('editing')) {
      record.reset();
      record.setState('editing', false);
    } else {
      record.setState('editing', true);
    }
  }, []);

  const handleLineDelete = useCallback(async (record, type) => {
    if(isNil(record.get('id'))) {
      if(type === 1) {
        constantInfoDs.remove(record);
      } else {
        globalVariableDs.remove(record);
      }
    } else {
      if(type === 1) {
        const response = await fetchContentLineDelete(extItfId, tenantId, [record.toData()]);
        if(getResponse(response)) {
          constantInfoDs.query();
        }
      } else {
        const response = await fetchVariableLineDelete(extItfId, tenantId, [record.toData()]);
        if(getResponse(response)) {
          globalVariableDs.query();
        }
      }
     
    } 
  }, []);

  const constantColumns = useMemo((): ColumnProps[]=> [
    {
      name: 'code',
      editor: record => record.getState('editing'),
    },
    {
      name: 'remark',
      editor: record => record.getState('editing'),
    },
    {
      name: 'value',
      editor: record => record.getState('editing'),
    },
    {
      header: intl.get('scux.externalInterfaceDefinition.model.optionNew').d('操作'),
      renderer: ({record}) => (
        <div className='optionNewStyle'>
          <Button funcType={FuncType.flat} onClick={() => handleLineEditor(record)}>{record?.getState('editing') ? intl.get('scux.externalInterfaceDefinition.model.cancel').d('取消') : intl.get('scux.externalInterfaceDefinition.model.editor').d('编辑')}</Button>
          <Button funcType={FuncType.flat} onClick={() => handleLineDelete(record, 1)}>{intl.get('scux.externalInterfaceDefinition.model.delete').d('删除')}</Button>
        </div>
      ),
    },
  ], [])

  const galobalColumns = useMemo((): ColumnProps[] => [
    {
      name: 'code',
      editor: record => record.getState('editing'),
    },
    {
      name: 'name',
      editor: record => record.getState('editing'),
    },
    {
      name: 'source',
      editor: record => record.getState('editing'),
    },
    {
      name: 'valueCodeLov',
      editor: record => record.getState('editing'),
    },
    {
      name: 'valueSourceNode',
    },
    {
      header: intl.get('scux.externalInterfaceDefinition.model.optionNew').d('操作'),
      hidden: editorType ==='viewRcord',
      renderer: ({record}) => (
        <div className='optionNewStyle'>
          <Button hidden={isNil(record?.get('id'))} funcType={FuncType.flat} onClick={() => handleLineEditor(record)}>{record?.getState('editing') ? intl.get('scux.externalInterfaceDefinition.model.cancel').d('取消') : intl.get('scux.externalInterfaceDefinition.model.editor').d('编辑')}</Button>
          <Button funcType={FuncType.flat} onClick={() => handleLineDelete(record, 2)}>{intl.get('scux.externalInterfaceDefinition.model.delete').d('删除')}</Button>
        </div>
      ),
    },
  ], [editorType]);

  const handleAdd = useCallback((type) => {
    if(type === 1 ) {
      const record = constantInfoDs.create({} ,0);
      record.setState('editing', true);
    } else {
      const record = globalVariableDs.create({} ,0);
      record.setState('editing', true);
    }
    
  }, []);

  const handleConstantSave = useCallback(async (type) => {
    const validateFlag = type === 1 ? await constantInfoDs.validate() : await globalVariableDs.validate();
    if(validateFlag) {
      const currentData = type === 1 ? constantInfoDs.toData() : globalVariableDs.toData().map(item => ({
        ...item,
        tenantId,
        extItfId,
        valueSource: 'source_data',
      }));
      const response = type === 1 ? await fetchConstantSave(extItfId, tenantId, constantsUniqueCode, currentData) : await fetchVariableSave(extItfId, tenantId, currentData);
      if(getResponse(response)) {
        notification.success({});
        if(type === 1) {
        constantInfoDs.query();
        } else {
          globalVariableDs.query();
        }
      }
    } else {
      notification.warning({
        message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
      });
    }
  }, [extItfId, tenantId, constantsUniqueCode]);

  const contentButtons = useMemo(() => [
    <Button icon="add" funcType={FuncType.flat} onClick={() => handleAdd(1)}>{intl.get(`scux.externalInterfaceDefinition.button.editor.add`).d('新增')}</Button>,
    <Button icon="save" funcType={FuncType.flat} onClick={() => handleConstantSave(1)}>{intl.get(`scux.externalInterfaceDefinition.button.editor.save`).d('保存')}</Button>,
  ], []);

  const variableButtons = useMemo(() => [
    <Button icon="add" funcType={FuncType.flat} onClick={() => handleAdd(2)}>{intl.get(`scux.externalInterfaceDefinition.button.editor.add`).d('新增')}</Button>,
    <Button icon="save" funcType={FuncType.flat} onClick={() => handleConstantSave(2)}>{intl.get(`scux.externalInterfaceDefinition.button.editor.save`).d('保存')}</Button>,
  ], []);

  const handlePublish = useCallback(() => {
    const publishData = new DataSet({
      fields: [{
        name: 'remark',
        required: true,
        label: intl.get('scux.externalInterfaceDefinition.view.title.publish.remark').d('说明'),
      }],
    });
    Modal.open({
      title: intl.get('scux.externalInterfaceDefinition.view.title.publish.explain').d('发布说明'),
      children: (
        <Form dataSet={publishData} labelLayout={LabelLayout.float}>
          <TextArea name="remark" placeholder={intl.get('cux.externalInterfaceDefinition.view.placehodle.remark').d('发布说明必须包含需求号，例如：cdp-000 用于实现功能XXXX')}/>
        </Form>
      ),
      onOk: async () => {
        const validFlag = await publishData.validate();
        let flag = false;
        if(validFlag) {
          const response = await fetchPublish({id: extItfId, tenantId, remark: publishData.current?.get('remark')});
          const resp = getResponse(response);
          if(resp) {
            flag = true;
            notification.success({});
            if(tabKey === 'request') {
              requestDataDs.query();
            } else {
              feedDataDs.query();
            }
          }
        } else {
          notification.warning({
            message: intl.get('scux.externalInterfaceDefinition.view.message.notNull').d('请填写必填项!')
          });
        }

        return flag;
      },
    });
  }, [tabKey, extItfId, tenantId]);

  return (
    <Fragment>
    <Header
      title={name}
      backPath='/sitf/external-interface-definition/list'
    >
       <Button icon="publish2" hidden={tabKey === 'information' || editorType ==='viewRcord'} onClick={handlePublish}>{intl.get('scux.externalInterfaceDefinition.view.button.publish').d('发布')}</Button>
    </Header>
    <Content>
      <Tabs activeKey={tabKey} onChange={key => {setTabkey(key);}} flex>
        <TabPane tab={intl.get(`scux.externalInterfaceDefinition.view.tab.variable.information`).d('常量&变量信息')} key="information">
          <Card className="contentStyle" style={{marginBottom: '24px'}}>
            <div className="titleTag">
              {intl.get(`scux.externalInterfaceDefinition.view.title.constant`).d('常量信息')} - {constantsUniqueCode}
            </div>
            <Table dataSet={constantInfoDs} columns={constantColumns} buttons={editorType ==='viewRcord' ? [] : contentButtons as Buttons[]} />
          </Card>
          <Card className="contentStyle">
            <div className="titleTag">
              {intl.get(`scux.externalInterfaceDefinition.view.title.global.variable`).d('全局变量')}
            </div>
            <Table dataSet={globalVariableDs} columns={galobalColumns} buttons={editorType ==='viewRcord' ? [] : variableButtons as Buttons[]} />
          </Card>
        </TabPane>
        <TabPane tab={intl.get(`scux.externalInterfaceDefinition.view.tab.request.mapping`).d('请求报文映射')} key="request">
          <RequestMapping id={extItfId} tenantId={tenantId} source="REQUEST_MAPPING" requestDataDs={requestDataDs} requestTreeNavDataDs={requestTreeNavDataDs} editorType={editorType} />
        </TabPane>
        <TabPane tab={intl.get(`scux.externalInterfaceDefinition.view.tab.feedback.mapping`).d('反馈报文映射')} key="feedback">
          <RequestMapping id={extItfId} tenantId={tenantId} source="RESPONSE_MAPPING" requestDataDs={feedDataDs} requestTreeNavDataDs={feedTreeNavDataDs} editorType={editorType} />
        </TabPane>
      </Tabs>
    </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.externalInterfaceDefinition', 'hzero.common'],
})(DetailsDesign);
