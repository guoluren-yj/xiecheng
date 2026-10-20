// /*
//  * 启用SRM采购协议审批
//  * @date: 2019-12-12
//  * @author: SWJ <wenjing.sun@hand-china.com>
//  * @version: 0.0.1
//  * @copyright Copyright (c) 2018, Hand
//  */

// import React, { Component } from 'react';
// import { connect } from 'dva';
// import { Modal, Form, Select } from 'hzero-ui';
// import { isArray, isEmpty } from 'lodash';
// import { Bind } from 'lodash-decorators';

// import { getEditTableData } from 'utils/utils';
// import notification from 'utils/notification';
// import Checkbox from 'components/Checkbox';
// import EditTable from 'components/EditTable';
// import intl from 'utils/intl';

// import styles from './index.less';

// const FormItem = Form.Item;

// @connect(({ loading, configServer }) => ({
//   saving: loading.effects['configServer/saveOrderMergeRule'],
//   loading: loading.effects['configServer/queryApprovalRules'],
//   configServer,
// }))
// export default class agreementApprovalModal extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       dataSource: [],
//     };
//   }

//   componentDidMount() {
//     this.handleSearch();
//   }

//   /**
//    * 查询审批规则定义
//    * @param {Object} [page={}]
//    */
//   @Bind()
//   handleSearch() {
//     const { dispatch } = this.props;
//     const { dataSource } = this.state;
//     if (isArray(dataSource) && !isEmpty(dataSource)) {
//       dataSource[0].$form.resetFields();
//     }
//     dispatch({
//       type: 'configServer/queryApprovalRules',
//     }).then(res => {
//       if (res) {
//         this.setState({
//           dataSource: res.map(item => ({ ...item, _status: 'update' })),
//         });
//       }
//     });
//   }

//   /**
//    * 关闭审批规则定义弹窗
//    */
//   @Bind()
//   hideModal() {
//     const { handleModal } = this.props;
//     if (handleModal) {
//       handleModal(false);
//     }
//   }

//   /**
//    * 保存审批规则定义
//    * @returns
//    */
//   @Bind()
//   saveList() {
//     const { dispatch } = this.props;
//     const { dataSource } = this.state;
//     const addList = getEditTableData(dataSource, ['ruleId']);
//     if (Array.isArray(addList) && addList.length === 0) {
//       return;
//     }
//     dispatch({
//       type: 'configServer/saveApprovalRuleList',
//       payload: addList,
//     }).then(data => {
//       if (data) {
//         if (isArray(dataSource) && !isEmpty(dataSource)) {
//           dataSource[0].$form.resetFields();
//         }
//         this.hideModal();
//         notification.success();
//       }
//     });
//   }

//   /**
//    * 保存审批规则定义
//    */
//   @Bind()
//   changeEnableFlag(lastVal, record) {
//     const {
//       $form: { setFieldsValue },
//     } = record;
//     if (lastVal === 1) {
//       setFieldsValue({ approveMethod: undefined });
//     }
//   }

//   render() {
//     const { dataSource } = this.state;
//     const {
//       visible,
//       loading,
//       configServer: { enumMap = {} },
//     } = this.props;
//     const { pcApprovalMethod = [] } = enumMap;
//     const columns = [
//       {
//         title: intl
//           .get(`spfm.configServer.model.purchaseContract.approveSequenceCodeMeaning`)
//           .d('审批流'),
//         dataIndex: 'approveSequenceCodeMeaning',
//         width: 220,
//         align: 'left',
//       },
//       {
//         title: intl.get(`spfm.configServer.model.purchaseContract.enableFlag`).d('是否启用'),
//         dataIndex: 'enableFlag',
//         width: 150,
//         align: 'left',
//         render: (val, record) => (
//           <FormItem>
//             {record.$form.getFieldDecorator(`enableFlag`, {
//               initialValue: val === 1 ? 1 : 0,
//             })(<Checkbox onChange={e => this.changeEnableFlag(e.target.value, record)} />)}
//           </FormItem>
//         ),
//       },
//       {
//         title: intl.get('spfm.configServer.model.purchaseContract.approveMethod').d('审批方式'),
//         dataIndex: 'approveMethod',
//         width: 150,
//         align: 'left',
//         render: (val, record) => (
//           <FormItem>
//             {record.$form.getFieldDecorator('approveMethod', {
//               initialValue: val,
//               rules: [
//                 {
//                   required: record.$form.getFieldValue('enableFlag') === 1,
//                   message: intl.get('hzero.common.validation.notNull', {
//                     name: intl.get('entity.attachment.approveMethod').d('审批方式'),
//                   }),
//                 },
//               ],
//             })(
//               <Select
//                 showSearch
//                 style={{ width: '150px' }}
//                 allowClear
//                 disabled={record.$form.getFieldValue('enableFlag') === 0}
//               >
//                 {pcApprovalMethod.map(item => (
//                   <Select.Option key={item.value} value={item.value}>
//                     {item.meaning}
//                   </Select.Option>
//                 ))}
//               </Select>
//             )}
//           </FormItem>
//         ),
//       },
//     ];
//     return (
//       <Modal
//         title={intl.get(`spfm.configServer.view.purchaseContract.ApprovalRule`).d('审批规则定义')}
//         visible={visible}
//         width={700}
//         onOk={this.saveList}
//         onCancel={this.hideModal}
//       >
//         <EditTable
//           bordered
//           className={styles['order-config-table']}
//           loading={loading}
//           rowKey="ruleId"
//           dataSource={dataSource}
//           pagination={false}
//           onChange={this.handleSearch}
//           columns={columns}
//         />
//       </Modal>
//     );
//   }
// }
