import React, { Component, Fragment } from 'react';
import { Icon } from 'choerodon-ui';

import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
// import Upload from 'components/Upload';
// import { PRIVATE_BUCKET } from '_utils/config';

// const organizationId = getCurrentOrganizationId();
export default class MoreAndLess extends Component {
  state = {
    showMore: false,
    showBotton: false,
    data: [],
  };

  componentDidMount() {
    this.clickLess();
  }

  clickMore = () => {
    const { source } = this.props;
    this.setState({ data: source.children, showMore: false });
  };

  clickLess = () => {
    const { source } = this.props;
    if (source?.children?.length >= 3) {
      const data = source?.children?.slice(0, 3);
      this.setState({ showBotton: true, showMore: true, data });
    } else {
      this.setState({ data: source.children });
    }
  };

  getMultipleNode = (child) => {
    const lastDateStyle = { paddingBottom: 0 };
    return child.map((s, idx, arr) => {
      return (
        <Fragment>
          <p className="line">
            <span className="desc">
              {intl.get('sinv.receiptWorkbench.model.receipt.assigneeName').d('审批人')}
            </span>
            <span className="text">{s.assigneeName}</span>
            {s.action === 'Approved' && <Icon className="approve_icon check" type="check" />}
            {s.action === 'Rejected' && <Icon className="approve_icon close" type="close" />}
          </p>

          {s.action !== 'CarbonCopy' && s.comment && (
            <p className="line">
              <span className="desc">
                {intl.get('sinv.receiptWorkbench.model.receipt.comment').d('审批意见')}
              </span>
              <span className="text">
                {s.comment}
                {/* <Upload
                  // filePreview
                  viewOnly
                  attachmentUUID={s.attachmentUuid}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sinv-delivery"
                  tenantId={organizationId}
                /> */}
              </span>
            </p>
          )}
          <p className="line date-line" style={idx === arr.length - 1 ? lastDateStyle : null}>
            <span className="desc">
              {intl.get('hzero.common.view.message.cron.date').d('日期')}
            </span>
            <span className="text">{s.startTime}</span>
          </p>
        </Fragment>
      );
    });
  };

  render() {
    const { showMore, showBotton, data } = this.state;
    return (
      <Fragment>
        {this.getMultipleNode(data)}
        {showBotton && showMore && (
          <div className="more_btn expand_btn" style={{ paddingBottom: '16px' }}>
            <a onClick={this.clickMore}>
              {intl.get('sinv.receiptWorkbench.model.moreInfo').d('更多信息')}
              <Icon type="expand_more" />
            </a>
          </div>
        )}
        {showBotton && !showMore && (
          <div className="less_btn expand_btn" style={{ paddingBottom: '16px' }}>
            <a onClick={this.clickLess}>
              {intl.get('sinv.receiptWorkbench.model.lessInfo').d('收起更多')}
              <Icon type="expand_less" />
            </a>
          </div>
        )}
      </Fragment>
    );
  }
}
