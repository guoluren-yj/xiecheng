// /**
//  * index.js -队列消费组配置
//  * @date: 2021-06-22
//  * @author: longhui.zou@going-link.com
//  * @version: 0.0.1
//  * @copyright: Copyright (c) 2021, Hand
//  */
// import React, { Component } from 'react';
// import { DataSet, Table, Button} from 'choerodon-ui/pro';
// import { Header, Content } from 'components/Page';
// import intl from 'utils/intl';
// import formatterCollections from 'utils/intl/formatterCollections';
// import { queueConsumerDS } from './stores/queueConsumerDS';
//
// const { Column } = Table;
//
// @formatterCollections({ code: ['smbl.common', 'smbl.queue'] })
// export default class ThirdPartyParam extends Component {
//   tableDs = new DataSet(queueConsumerDS());
//
//   fieldEditFlag = true;
//
//   // 渲染栏
//    operationActionCommands = ({ record }) => {
//      const btns = [];
//      if (record.getState('editing')) {
//        btns.push(
//          <a onClick={this.handleSubmit}>{intl.get('hzero.common.button.confirm').d('确认')}</a>,
//          <a onClick={() => this.handleCancel(record)}>
//            {intl.get('hzero.common.button.cancel').d('取消')}
//          </a>
//        );
//      } else {
//        btns.push(
//          <a onClick={() => this.handleEdit(record)} disabled={record.status === 'delete'}>
//            {intl.get('hzero.common.edit').d('编辑')}
//          </a>
//        );
//      }
//      return [<span className="action-link">{btns}</span>];
//    };
//
//   // 修改
//   handleEdit = record => {
//     record.setState('editing', true);
//   };
//
//   // 提交
//   handleSubmit = async () => {
//     try {
//       await this.tableDs.submit();
//     } catch (e) {
//       this.tableDs.reset();
//     }
//   };
//
//   // 取消
//   handleCancel = record => {
//   if (record.status === 'add') {
//     this.tableDs.remove(record);
//   } else {
//     record.reset();
//     record.setState('editing', false);
//   }
//   };
//
//   // 生命周期函数，第一个执行
//   componentDidMount() {
//     this.tableDs.setQueryParameter('tagId', this.props.match.params.tagId);
//     this.tableDs.query();
//   }
//
//   // 新增
//   // handleAdd = () => {
//   //   this.fieldEditFlag = false;
//   //   const record = this.tableDs.create({ appVersionId: this.props.match.params.appVersionId }, 0);
//   //   this.openModal(record);
//   // };
//
//   // 新增
//   handleAdd = () => {
//     const record = this.tableDs.create({tagId: this.props.match.params.tagId}, 0);
//     record.setState('editing', true);
//   };
//
//   // 表格操作项
//   tableButtons = [
//     <Button icon="playlist_add" onClick={this.handleAdd} key="add">
//       {intl.get('hzero.common.button.add').d('新增')}
//     </Button>,
//     'delete',
//     'save',
//     'query',
//   ];
//
//   render() {
//     return (
//       <>
//         <Header
//           backPath="/smbl/queue/definition"
//           title={intl.get('smbl.common.title.consumerInfoDefine').d('消费组配置')}
//         />
//         <Content>
//           <Table
//             dataSet={this.tableDs}
//             queryFieldsLimit={4}
//             data={[]}
//             buttons={this.tableButtons}
//             autoMaxWidth
//           >
//             <Column name="consumerCode" editor width={200} />
//             <Column name="consumerName" editor width={200} />
//             <Column name="enableFlag" editor width={200} />
//             <Column name="remark" editor width={200} />
//             {/* <Column name="operationAction" width={150} command={this.operationActionCommands} /> */}
//           </Table>
//         </Content>
//       </>
//     );
//   }
// }
