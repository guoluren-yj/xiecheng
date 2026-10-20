/**
 * index.js -常用子应用
 * @date: 2020-09-06
 * @author: yuyu.chang@hand-china.com
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, {Component} from 'react';
import {
  DataSet,
  Table,
  Lov,
  Modal,
} from 'choerodon-ui/pro';
import {Content, Header} from 'components/Page';
import intl from 'utils/intl';
import 'choerodon-ui/pro/lib/code-area/lint/javascript';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import {subApplicationCommonRole} from './stores/subApplicationCommonRole';
import SubApplicationCommon from "./SubAppCommon";

const {Column} = Table;

@formatterCollections({code: ['hzero.common', 'smbl.subAppCommon']})
export default class SubApplicationCommonRole extends Component {

  tableDs = new DataSet(subApplicationCommonRole());

  createTableDs = new DataSet({ fields: subApplicationCommonRole().fields });

  // 行操作栏
  operationActionCommands = ({record}) => {
    const btns = [];
    btns.push(
      <a onClick={() => this.handleEdit(record)}>{intl.get('hzero.common.edit').d('编辑')}</a>,
    );
    return [<span className="action-link">{btns}</span>];
  };

  @Bind
  handleAdd(data) {
    this.createTableDs.loadData([data]);
    this.handleEdit(this.createTableDs.get(0));
  }

  // 编辑
  handleEdit = (record) => {
    let refreshFlag;
    Modal.open({
      title: intl.get('smbl.subAppCommon.view.title').d('常用子应用管理'),
      drawer: true,
      clasable: true,
      style: { width: "800px" },
      children: (
        <SubApplicationCommon id={record.get('id')} name={record.get('name')} needRefresh={()=> { refreshFlag = true; }} />
      ),
      cancelText: intl.get('hzero.common.btn.close').d("关闭"),
      cancelProps: {
        color: "primary",
      },
      okButton: false,
      onCancel: () => {
        if (refreshFlag) {
          this.tableDs.query();
          this.createTableDs.loadData([]);
        }
      },
    });
  };

  render() {
    return (
      <>
        <Header title={intl.get('smbl.subAppCommon.view.title').d('常用子应用管理')}>
          <Lov
            name="role"
            mode="button"
            icon="add"
            clearButton={false}
            dataSet={this.createTableDs}
            onChange={this.handleAdd}
            modalProps={{
              title: intl.get('hzero.common.button.create').d('新建'),
            }}
            color='primary'
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Lov>
        </Header>
        <Content>
          <Table
            dataSet={this.tableDs}
            autoMaxWidth
            selectionMode='none'
          >
            <Column name="name" />
            <Column name="code" />
            <Column name="operationAction" width={150} command={this.operationActionCommands} />
          </Table>
        </Content>
      </>
    );
  }
}
