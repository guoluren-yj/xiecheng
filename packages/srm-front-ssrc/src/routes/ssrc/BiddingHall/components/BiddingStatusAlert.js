// import React from 'react';
// import { observer } from 'mobx-react';
// import { Icon } from 'choerodon-ui';
// import { Throttle } from 'lodash-decorators';

// @observer
// class BiddingStatusAlert extends React.Component {
//   @Throttle(2000)
//   collections = () => {
//     const { handleCollection, readOnly } = this.props;
//     if (!readOnly) {
//       return;
//     }

//     if (handleCollection) {
//       handleCollection();
//     }
//   }

//   render() {
//     const {
//       visibleFlag = 0,
//     } = this.props;

//     // if (!visibleFlag) {
//     //   return '';
//     // }

//     return (
//       <span onClick={this.collections}>
//         <Icon type="star" style={{ color: "#eecc34" }} />
//       </span>
//     );
//   }
// }

// export default BiddingStatusAlert;
