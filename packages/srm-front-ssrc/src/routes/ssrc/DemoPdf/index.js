import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

@connect(({ inquiryHall }) => ({
  inquiryHall,
  organizationId: getCurrentOrganizationId(),
}))
export default class DemoPdf extends PureComponent {
  @Bind()
  exportPdf() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/exportPdf',
      payload: { organizationId },
    }).then((url) => {
      if (url) {
        fetch(url)
          .then((data) => data.blob())
          .then((zip) => {
            // IE兼容性处理
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(zip, 'exportPdf.pdf');
            } else {
              const blobUrl = window.URL.createObjectURL(zip);
              const a = document.createElement('a');
              a.download = decodeURIComponent('exportPdf.pdf');
              a.href = blobUrl;
              a.click();
            }
          });
      }
    });
  }

  render() {
    return (
      <React.Fragment>
        <Header title={intl.get('ssrc.common.title.exportPDF').d('导出pdf')}>
          <Button type="primary" onClick={this.exportPdf}>
            {intl.get('ssrc.common.button.exportPDF').d('导出pdf')}
          </Button>
        </Header>
      </React.Fragment>
    );
  }
}
