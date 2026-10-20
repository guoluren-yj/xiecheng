/*
 * PurchaseRequisitionApprovalConfig - 采购申请审批配置弹窗
 * @date: 2019-01-29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

// import React, { PureComponent } from 'react';
// import { Form, Button, Modal, Select } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';
// import { isArray, isEmpty, omit } from 'lodash';
// import { connect } from 'dva';
// import uuid from 'uuid/v4';

// import Lov from 'components/Lov';
// import EditTable from 'components/EditTable';
// import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
// import notification from 'utils/notification';
// import intl from 'utils/intl';

// import styles from './index.less';

// const FormItem = Form.Item;
// @connect(({ loading, configServer }) => ({
//   configServer,
//   loading: loading.effects['configServer/fetchPurchaseRequisitionApprovalList'],
//   saving: loading.effects['configServer/savePurchaseRequisitionApproval'],
//   deleting: loading.effects['configServer/deletePurchaseRequisitionApproval'],
// }))
// export default class PurchaseRequisitionApprovalConfig extends PureComponent {
//   constructor(props) {
//     super(props);
//     this.state = {
//       dataSource: [],
//       selectedRows: [],
//       tenantId: getCurrentOrganizationId(),
//     };
//   }

//   componentDidMount() {
//     this.handleSearch();
//   }

//   /**
//    * 查询
//    */
//   @Bind()
//   handleSearch() {
//     const { dispatch } = this.props;
//     dispatch({
//       type: 'configServer/fetchPurchaseRequisitionApprovalList',
//     }).then(dataSource => {
//       if (dataSource) {
//         this.setState({
//           dataSource: dataSource.map(item => ({ ...item, _status: 'update' })),
//         });
//       }
//     });
//   }

//   /**
//    * 新建审批规则
//    * @param {Number} shieldSupId
//    */
//   @Bind()
//   handleCreate() {
//     const { dataSource } = this.state;
//     this.setState({
//       dataSource: [{ approvalRuleId: uuid(), _status: 'create' }, ...dataSource],
//     });
//   }

//   /**
//    * 保存
//    */
//   @Bind()
//   handleSave() {
//     const { dataSource, tenantId } = this.state;
//     const { dispatch } = this.props;
//     const prApprovalRules = getEditTableData(dataSource, ['approvalRuleId']).map(item => ({
//       tenantId,
//       ...item,
//     }));
//     if (isArray(prApprovalRules) && !isEmpty(prApprovalRules)) {
//       dispatch({
//         type: 'configServer/savePurchaseRequisitionApproval',
//         payload: prApprovalRules,
//       }).then(res => {
//         if (res) {
//           notification.success();
//           this.handleSearch();
//         }
//       });
//     }
//   }

//   /**
//    * 关闭弹窗
//    */
//   @Bind()
//   hideModal() {
//     const { handleModal } = this.props;
//     if (handleModal) {
//       handleModal('purchaseRACVisible', false);
//     }
//   }

//   /**
//    * 改变主键
//    * @param {Array} selectedRows 选中数据数组
//    */
//   @Bind()
//   handleChangeSelectRowKeys(selectedRowKeys, selectedRows) {
//     this.setState({ selectedRows });
//   }

//   /**
//    * 删除
//    */
//   @Bind()
//   handleDelete() {
//     const { selectedRows, dataSource } = this.state;
//     const { dispatch } = this.props;
//     const selectedRowKeys = selectedRows.map(item => item.approvalRuleId);
//     const newDataSource = [];
//     const deleteList = [];
//     Modal.confirm({
//       title: intl.get(`spfm.configServer.view.message.shield.title.content`).d('确定删除吗？'),
//       onOk: () => {
//         dataSource.forEach(item => {
//           if (!selectedRowKeys.includes(item.approvalRuleId)) {
//             newDataSource.push(item);
//           } else if (item._status !== 'create') {
//             deleteList.push(omit(item, ['$form']));
//           }
//         });
//         if (!isEmpty(deleteList)) {
//           dispatch({
//             type: 'configServer/deletePurchaseRequisitionApproval',
//             payload: deleteList,
//           }).then(res => {
//             if (res) {
//               notification.success();
//               this.handleSearch();
//             }
//           });
//         }
//         this.setState({ selectedRows: [], dataSource: newDataSource });
//       },
//     });
//   }

//   render() {
//     const {
//       loading,
//       saving,
//       deleting,
//       visible = false,
//       configServer: { enumMap = {} },
//     } = this.props;
//     const { dataSource = [], tenantId, selectedRows } = this.state;
//     const { approvalMethod = [], prSrcPlateForm = [] } = enumMap;
//     const rowSelection = {
//       selectedRowKeys: selectedRows.map(item => item.approvalRuleId),
//       onChange: this.handleChangeSelectRowKeys,
//     };
//     const columns = [
//       {
//         title: intl.get(`entity.company.tag`).d('公司'),
//         dataIndex: 'companyName',
//         width: 200,
//         render: (val, record) =>
//           ['create', 'update'].includes(record._status) ? (
//             <FormItem>
//               {record.$form.getFieldDecorator(`companyId`, {
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl.get(`entity.company.tag`).d('公司'),
//                     }),
//                   },
//                 ],
//                 initialValue: record.companyId,
//               })(
//                 <Lov
//                   code="HPFM.COMPANY"
//                   textValue={record.companyName}
//                   queryParams={{ tenantId, enabledFlag: 1 }}
//                 />
//               )}
//             </FormItem>
//           ) : (
//             val
//           ),
//       },
//       {
//         title: intl.get(`spfm.configServer.model.configServer.sourcePlatform`).d('申请单据来源'),
//         dataIndex: 'sourcePlatformMeaning',
//         width: 200,
//         render: (val, record) =>
//           ['create', 'update'].includes(record._status) ? (
//             <FormItem>
//               {record.$form.getFieldDecorator(`sourcePlatform`, {
//                 initialValue: record.sourcePlatform,
//               })(
//                 <Select showSearch style={{ width: '150px' }} allowClear>
//                   {prSrcPlateForm.map(item => (
//                     <Select.Option key={item.value} value={item.value}>
//                       {item.meaning}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               )}
//             </FormItem>
//           ) : (
//             val
//           ),
//       },
//       {
//         title: intl.get(`spfm.configServer.model.configServer.approvalMethodCode`).d('审批方式'),
//         dataIndex: 'approvalMethodCodeMeaning',
//         width: 200,
//         render: (val, record) =>
//           ['create', 'update'].includes(record._status) ? (
//             <FormItem>
//               {record.$form.getFieldDecorator(`approvalMethodCode`, {
//                 rules: [
//                   {
//                     required: true,
//                     message: intl.get('hzero.common.validation.notNull', {
//                       name: intl
//                         .get(`spfm.configServer.model.configServer.approvalMethodCode`)
//                         .d('审批方式'),
//                     }),
//                   },
//                 ],
//                 initialValue: record.approvalMethodCode,
//               })(
//                 <Select showSearch style={{ width: '150px' }} allowClear>
//                   {approvalMethod.map(item => (
//                     <Select.Option key={item.value} value={item.value}>
//                       {item.meaning}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               )}
//             </FormItem>
//           ) : (
//             val
//           ),
//       },
//     ];
//     const editTableProps = {
//       loading,
//       columns,
//       dataSource,
//       rowSelection,
//       pagination: false,
//       bordered: true,
//       rowKey: 'approvalRuleId',
//     };
//     return (
//       <Modal
//         title={
//           <div>
//             {intl.get(`spfm.configServer.view.message.modal.orderDefine`).d('采购申请审批配置')}
//             <span style={{ color: '#bbb', marginLeft: '20px', fontSize: '12px' }}>
//               {intl
//                 .get(`spfm.configServer.view.message.modal.selectSourceToCustom`)
//                 .d('选择申请单据来源，可细化定制不同来源采购申请的审批方式')}
//             </span>
//           </div>
//         }
//         visible={visible}
//         onCancel={this.hideModal}
//         width={800}
//         footer={null}
//         wrapClassName={styles['purchase-requisition-approval-config']}
//       >
//         <div className="header" style={{ textAlign: 'right' }}>
//           <Button
//             onClick={this.handleDelete}
//             loading={deleting}
//             disabled={isArray(selectedRows) && isEmpty(selectedRows)}
//             style={{ marginRight: '8px' }}
//           >
//             {intl.get('hzero.common.button.delete').d('删除')}
//           </Button>
//           <Button
//             onClick={this.handleSave}
//             loading={saving || loading}
//             style={{ marginRight: '8px' }}
//           >
//             {intl.get('hzero.common.button.save').d('保存')}
//           </Button>
//           <Button type="primary" onClick={this.handleCreate}>
//             {intl.get('hzero.common.button.create').d('新建')}
//           </Button>
//         </div>
//         <EditTable {...editTableProps} />
//       </Modal>
//     );
//   }
// }
