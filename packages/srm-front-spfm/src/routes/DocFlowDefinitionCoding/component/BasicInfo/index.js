import React, { useEffect, useMemo, useImperativeHandle } from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';
import {DataSet, Output, Form, IntlField, TextField, CheckBox, TextArea, Table, Spin } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer.js';
import notification from 'utils/notification';
import { formDS, getNodeTableRelListDs } from './indexDS';
import { onLineDetailChange } from '../../utils';
import './index.less';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();


 const BasicInfoCmp = (props)=> {
   const { editors, data: {nodeId}, currentComponentKey, onRef, currentTenantNum} = props;
    const IntlCmp = editors ? IntlField : Output;
    const TextCmp = editors ? TextField : Output;
    const TextAreaCmp = editors ? TextArea : Output;
    

    const formDs = useMemo(() => new DataSet(formDS()), [nodeId]);
    const lineDs = useMemo(() => new DataSet(getNodeTableRelListDs()), [nodeId]);
    
   
   
    useImperativeHandle(onRef, () => ({
      formDs,
      lineDs,
    }));

   useEffect(() => {
      // 平台级 点击新建按钮 nodeId： create_node
      if (nodeId !== 'create_node') {
        formDs.setQueryParameter('tenantId', organizationId);
        formDs.setQueryParameter('nodeId', nodeId);
        formDs.query().then(res => {
        lineDs.loadData(res?.nodeTableRelList || []);
    });
      }
    }, [nodeId, currentComponentKey]);
   
    const addTrueTableRecord = () => {
      if (lineDs.records.length < 4) {
        lineDs.create({editorFlag: true}, 0);
      } else {
        notification.warning({
          message: intl.get('sdps.newNode.modal.submit.toFew').d('业务实体表中表数量小于5'),
        });
      }
    };
   
    const buttons = () => {
      const Buttons = observer(({ dataSet }) => {
        const btns = [
          {
            name: 'add',
            btnType: 'c7n-pro',
            hidden: currentTenantNum ==="SRM",
            child: (name) => name || intl.get('hzero.common.button.create').d('新建'),
            btnProps: {
              funcType: 'flat',
              color: 'primary',
              icon: 'playlist_add',
              onClick: addTrueTableRecord,
            },
          },
          {
            name: 'delete',
            btnType: 'c7n-pro',
            child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
            btnProps: {
              funcType: 'flat',
              color: 'primary',
              icon: 'delete_sweep',
              onClick: () => onLineDetailChange({
                dataSet,
                url: 'node-details'
              }),
              disabled: isEmpty(dataSet?.selected),
            },
          },
        ];
        return <DynamicButtons buttons={btns?.filter((i) => !i.hidden)} />;
      });
      return [<Buttons dataSet={lineDs} />];
    };
   
    const columns = [
      {
        name: 'NodeTable',
        editor: currentTenantNum !=="SRM",
      },
      {
        name: 'mainTableFlag',
        editor: currentTenantNum !=="SRM",
      },
    ];
   
    
    return (
      <div style={{ width: "100%", height: 'calc(100vh - 175px)', overflowY: "auto", paddingBottom: '20px' }}>
        <Spin dataSet={formDs}>
          {tenantFlag && (
            <div className={!editors&&'form_content'}>
              <Form style={{width: "100%", paddingTop:editors? '5px':'0px'}} labelLayout={editors? 'float': "vertical"} dataSet={formDs} columns={3}>
                <TextCmp name="code" disabled />
                <IntlCmp name="name" />
              </Form>
            </div>
          )}
          {!tenantFlag && (
            <>
              <h3 className='title-h3' id="delivery-create">
                <div className='block' />
                {intl.get(`sdps.newNode.model.newNode.nodeTableRelForm`).d('节点信息')}
              </h3>
              <Form className={!editors&&'form_content'} style={{width: "100%"}} labelLayout={editors? 'float': "vertical"} dataSet={formDs} columns={3}>
                <TextCmp name="code" disabled={currentTenantNum ==="SRM"} />
                <IntlCmp name="name" />
                {editors && <CheckBox name='rootNodeFlag' disabled={currentTenantNum ==="SRM"} />}
                {!editors && <Output name='rootNodeFlag' renderer={({ value }) => yesOrNoRender(+value)} />}
                {editors && <CheckBox name="linkCheckFlag" />}
                {!editors && <Output name="linkCheckFlag" renderer={({ value }) => yesOrNoRender(+value)} />}
                <TextAreaCmp newLine name="fromSql" disabled={currentTenantNum ==="SRM"} colSpan={3} resize="vertical" style={{ height: 200 }} />
                <TextAreaCmp newLine name="belongNodeSql" disabled={currentTenantNum ==="SRM"} colSpan={3} resize="vertical" style={{ height: 120 }} />
                <TextAreaCmp newLine name="rootNodeSql" disabled={currentTenantNum ==="SRM"} colSpan={3} resize="vertical" style={{ height: 120 }} />
              </Form>
              <h3 className='title-h3' id="delivery-create">
                <div className='block' />
                {intl.get('sdps.newNode.model.newNode.nodeTableRelList').d('业务实体表')}
              </h3>
              <Table
                  dataSet={lineDs}
                  columns={columns}
                  buttons={editors && currentTenantNum !=="SRM" && buttons()}
                  pagination={{
                    hideOnSinglePage: true,
                  }}
                  selectionMode={editors && currentTenantNum !=="SRM" ? 'rowbox' : 'none'}
                />
            </>
          )}
        </Spin>
      </div>
    );
 };

export default BasicInfoCmp;