/*
 * OrderAffix - 订单明细锚点
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

// import React, { Component } from 'react';

// import intl from 'utils/intl';
// import PositionAnchor from '_components/PositionAnchor';
import SodrOrderAffix from 'srm-front-sodr/lib/routes/components/OrderAffix';

export default SodrOrderAffix;

// const { Link } = PositionAnchor;

// export default class OrderAffix extends Component {
//   renderLinks = () => {
//     const { linkKeys = [] } = this.props;
//     const linkList = [
//       {
//         key: 'basicInfo',
//         link: (
//           <Link
//             href="#order-workSpace-detail-content-basicInfo"
//             title={intl.get('slod.orderExecution.view.panel.basicInfo').d('订单基础信息')}
//           />
//         ),
//       },
//       {
//         key: 'organizationInfo',
//         link: (
//           <Link
//             href="#order-workSpace-detail-content-organizationInfo"
//             title={intl
//               .get('slod.orderExecution.view.panel.organization')
//               .d('交易方及采买组织信息')}
//           />
//         ),
//       },
//       {
//         key: 'detailInfo',
//         link: (
//           <Link
//             href="#order-workSpace-detail-content-detailInfo"
//             title={intl.get('slod.orderExecution.view.panel.detailInfo').d('订单明细信息')}
//           />
//         ),
//       },
//       {
//         key: 'receiptInfo',
//         link: (
//           <Link
//             href="#order-workSpace-detail-content-receiptInfo"
//             title={intl.get('slod.orderExecution.view.panel.receiptInfo').d('收货/收单信息')}
//           />
//         ),
//       },
//       {
//         key: 'billingInfo',
//         link: (
//           <Link
//             href="#order-workSpace-detail-content-billingInfo"
//             title={intl.get('slod.orderExecution.view.panel.billingInfo').d('开票信息')}
//           />
//         ),
//       },
//       {
//         key: 'attachmentInfo',
//         link: (
//           <Link
//             href="#order-workSpace-detail-content-attachmentInfo"
//             title={intl.get('slod.orderExecution.view.panel.attachmentInfo').d('附件')}
//           />
//         ),
//       },
//     ];
//     return linkList.filter((i) => linkKeys.includes(i.key)).map((i) => i.link);
//   };

//   render() {
//     const {
//       currentOffsetTop = null,
//       currentAnchorContainer = () =>
//         document.getElementById('order-workspace-detail-container') || document.body,
//     } = this.props;

//     return (
//       <PositionAnchor
//         offsetTop={currentOffsetTop || 100}
//         currentAnchorContainer={currentAnchorContainer}
//       >
//         {this.renderLinks()}
//       </PositionAnchor>
//     );
//   }
// }
