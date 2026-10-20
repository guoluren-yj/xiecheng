/**
 * index.js -三方平台用户关联
 * @date: 2020-06-08
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
// import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { thirdPartyRelationDS } from './stores/thirdPartyRelationDS';
// import './index.less';

const { Column } = Table;

@formatterCollections({
  code: ['smbl.thirdPartyRelation', 'smbl.thirdParty', 'smbl.thirdPartyAcc', 'smbl.common'],
})
export default class thirdPartyRelationSite extends Component {
  tableDs = new DataSet(thirdPartyRelationDS());

  // 表格操作项
  tableButtons = ['add', 'save', 'delete'];

  render() {
    return (
      <>
        <Header
          title={intl.get('smbl.thirdPartyRelation.view.thirdPartyRelationUser').d('三方用户关联')}
        >
          <Button
            color="primary"
            onClick={() => {
              openTab({
                key: '/himp/commentImport/SMBL.THIRD_PARTY_RELATION',
                title: intl.get('smbl.thirdPartyRelation.view.import').d('三方关联关系导入'),
              });
            }}
          >
            {intl.get('smbl.thirdPartyRelation.view.import').d('三方关联关系导入')}
          </Button>
        </Header>
        <Content name="table">
          <Table
            dataSet={this.tableDs}
            queryFieldsLimit={3}
            data={[]}
            autoMaxWidth
            buttons={this.tableButtons}
          >
            <Column name="loginName" width={200} />
            <Column name="user" width={200} editor={(record) => !record.data.relationId} />
            <Column name="thirdUserName" editor={(record) => !record.data.relationId} width={200} />
            <Column
              name="thirdPartyAccount"
              editor={(record) => !record.data.relationId}
              width={200}
            />
            <Column name="thirdPartyDesc" width={200} />
            <Column name="userTenantName" width={200} />
            <Column name="tenantName" width={200} />
            {/* <Column name="test" align="center" width={150} renderer={({ value, record }) => { */}
            {/*  // eslint-disable-next-line prefer-destructuring */}
            {/*  const flag = record.data.userTenantId === record.data.tenantId; */}
            {/*  const desc = record.data.userTenantId === record.data.tenantId?intl.get('hzero.common.yes').d('是'):intl.get('hzero.common.no').d('否'); */}
            {/*  let color = 'red'; */}
            {/*  switch (flag) { */}
            {/*    case true: */}
            {/*      color = 'green'; */}
            {/*      break; */}
            {/*    case false: */}
            {/*      color = 'red'; */}
            {/*      break; */}
            {/*    default: */}
            {/*      color = 'red'; */}
            {/*      break; */}
            {/*  } */}
            {/*  return ( */}
            {/*    <Tag className="skill-tag-frameless" color={color}> */}
            {/*      {desc} */}
            {/*    </Tag> */}
            {/*  ); */}
            {/* }} /> */}
            <Column name="creationDate" width={200} />
            {/* <Column name="enableFlag" editor={(record) => !record.data.relationId} width={60} /> */}
          </Table>
        </Content>
      </>
    );
  }
}
