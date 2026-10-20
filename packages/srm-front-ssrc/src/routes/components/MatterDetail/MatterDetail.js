import React, { PureComponent } from 'react';
import { replacePrivateBucket } from '@/utils/utils';
import NoDataContent from '@/routes/components/NoDataContent';

export default class MatterDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderNewMatterDetail(newMatterDetail) {
    return newMatterDetail ? (
      <div dangerouslySetInnerHTML={{ __html: newMatterDetail || '' }} />
    ) : (
      <NoDataContent />
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { matterDetail } = this.props;
    const newMatterDetail = replacePrivateBucket(matterDetail);
    return (
      <React.Fragment>
        <div style={{ height: '100%' }}>{this.renderNewMatterDetail(newMatterDetail)}</div>
      </React.Fragment>
    );
  }
}
