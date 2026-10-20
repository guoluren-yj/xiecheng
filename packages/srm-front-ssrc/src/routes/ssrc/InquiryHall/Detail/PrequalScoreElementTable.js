// TODO 后期删除

// // 资格预审评分要素table

// import React, { PureComponent } from 'react';
// import { Table } from 'choerodon-ui/pro';
// import { yesOrNoRender } from 'utils/renderer';
// import { numberSeparatorRender } from '@/utils/renderer';

// export default class PrequalScoreElementTable extends PureComponent {
//   constructor(props) {
//     super(props);

//     this.state = {};
//   }

//   componentDidMount() {}

//   // table columns
//   getColumns() {
//     const columns = [
//       {
//         name: 'indicateCode',
//         width: 200,
//       },
//       {
//         name: 'indicateName',
//       },
//       {
//         name: 'indicateType',
//         width: 150,
//       },
//       {
//         name: 'minScore',
//         width: 100,
//         renderer: ({ value }) => numberSeparatorRender(value),
//       },
//       {
//         name: 'maxScore',
//         width: 100,
//         renderer: ({ value }) => numberSeparatorRender(value),
//       },
//       {
//         name: 'mustApprovedFlag',
//         width: 120,
//         align: 'left',
//         renderer: ({ value }) => yesOrNoRender(value),
//       },
//       {
//         name: 'qualifiedScore',
//         width: 150,
//         renderer: ({ value }) => numberSeparatorRender(value),
//       },
//     ].filter(Boolean);

//     return columns;
//   }

//   render() {
//     const { prequalScoreElementDS = {} } = this.props;

//     return (
//       <React.Fragment>
//         <Table
//           bordered
//           pagination={false}
//           dataSet={prequalScoreElementDS}
//           rowKey="prequalScoreAssignId"
//           columns={this.getColumns()}
//         />
//       </React.Fragment>
//     );
//   }
// }
