// /**
//  * 标段table
//  */
// import React, { PureComponent } from 'react';
// import { Table, Modal, DataSet } from 'choerodon-ui/pro';
// import { isFunction } from 'lodash';
// import { Bind } from 'lodash-decorators';

// import intl from 'utils/intl';
// import { getResponse, getCurrentOrganizationId } from 'utils/utils';

// import { savePrequalSectionGroup } from '@/services/inquiryHallNewService';
// import { unselectSectionTableDS } from './SectionTableDS';

// const organizationId = getCurrentOrganizationId();

// export default class SectionTable extends PureComponent {
//   constructor(props) {
//     super(props);
//     const { rfxHeaderId, sourceProjectId } = props;
//     // 未选标段
//     this.unselectSectionTableDs = new DataSet(
//       unselectSectionTableDS({
//         rfxHeaderId,
//         sourceProjectId,
//         tempSourceHeaderId: rfxHeaderId,
//       })
//     );
//   }

//   /**
//    * 新增
//    */
//   @Bind()
//   handleAdd() {
//     this.unselectSectionTableDs.query();
//     const tableProps = {
//       columns: this.columns,
//       dataSet: this.unselectSectionTableDs,
//     };
//     Modal.open({
//       key: Modal.key(),
//       closable: true,
//       drawer: true,
//       title: intl.get(`ssrc.inquiryHall.view.message.title.selectSection`).d('选择标段'),
//       style: {
//         width: '45%',
//       },
//       children: <Table {...tableProps} />,
//       onOk: this.handleSaveSelectedSection,
//       onCancel: () => this.unselectSectionTableDs.reset(),
//     });
//   }

//   /**
//    * 保存已勾选的标段
//    */
//   @Bind()
//   async handleSaveSelectedSection() {
//     const { sectionTableDs, onRefreshPrequalGroup, rfxHeaderId: tempSourceHeaderId } = this.props;
//     const selectedData = this.unselectSectionTableDs.selected.map((r) => r.toJSONData());
//     if (selectedData?.length) {
//       const params = {
//         selectedData,
//         organizationId,
//         tempSourceHeaderId,
//       };
//       const res = getResponse(await savePrequalSectionGroup(params));
//       if (res && isFunction(onRefreshPrequalGroup)) {
//         onRefreshPrequalGroup();
//         sectionTableDs.query();
//         return true;
//       }
//     }
//     return false;
//   }

//   @Bind()
//   async handleDelete() {
//     const { sectionTableDs, onRefreshPrequalGroup } = this.props;
//     const selectedData = sectionTableDs.selected;
//     const res = getResponse(await sectionTableDs.delete(selectedData));
//     if (res && isFunction(onRefreshPrequalGroup)) {
//       onRefreshPrequalGroup();
//     }
//   }

//   get columns() {
//     return [
//       {
//         name: 'sectionCode',
//         width: 180,
//       },
//       {
//         name: 'sectionName',
//         width: 300,
//       },
//     ];
//   }

//   render() {
//     const { sectionTableDs } = this.props;
//     return (
//       <Table
//         bordered
//         rowKey="prequalsectionHeaderId"
//         dataSet={sectionTableDs}
//         columns={this.columns}
//         buttons={[
//           [
//             'add',
//             {
//               onClick: this.handleAdd,
//             },
//           ],
//           [
//             'delete',
//             {
//               onClick: this.handleDelete,
//             },
//           ],
//         ]}
//       />
//     );
//   }
// }
