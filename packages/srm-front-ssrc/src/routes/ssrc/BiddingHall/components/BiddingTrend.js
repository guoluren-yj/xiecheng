// import React, { Component } from 'react';
// import { Table, DataSet } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react';
// import { Popover } from 'choerodon-ui';
// import { noop, throttle } from 'lodash';
// import { Throttle } from 'lodash-decorators';
// import classnames from 'classnames';

// import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';

// import { numberSeparatorRender } from '@/utils/renderer';

// import Styles from './index.less';

// const lineChartIcon = require('@/assets/line-chart-icon.svg');

// @observer
// class BiddingTrend extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {};
//   }

//   queryData = async () => {
//     const {
//       organizationId,
//       quotationHeaderId,
//     } = this.props;
//     if (!organizationId || !quotationHeaderId) {
//       return;
//     }

//     const param = {
//       organizationId,
//       quotationHeaderId,
//     };

//     let result = null;
//     try {
//       // result = await roundQuotationRankTable(param);
//       result = getResponse(result);
//       if (!result) {
//         return;
//       }

//       // tableDS.loadData(result);
//     } catch (e) {
//       throw e;
//     }
//   }

//   getColumns = () => {
//     const columns = [

//     ].filter(Boolean);

//     return columns;
//   }

//   clearDS = () => {

//   }

//   @Throttle(1200)
//   charIconPopover = (visibleFlag = false) => {
//     if (visibleFlag) {
//       this.queryData();
//     } else {
//       this.clearDS();
//     }
//   }

//   render() {
//     const {
//       title = '',
//       innerIcon = '',
//       // type = "SUPPLIER",
//     } = this.props;

//     return (
//       <Popover
//         title={title}
//         trigger='click'
//         overlayStyle={{ width: '600px' }}
//         // content={<Table bordered dataSet={this.tableDS} rowKey="roundHeaderDateId" columns={this.getColumns()} />}
//         onVisibleChange={this.charIconPopover}
//       >
//         <span className={Styles['supplier-bidding-history-chart-wrap']}>
//           {innerIcon || <img alt="icon" style={{ width: '22px', height: '22px' }} src={lineChartIcon} />}
//         </span>
//       </Popover>
//     );
//   }
// }

// export default BiddingTrend;
