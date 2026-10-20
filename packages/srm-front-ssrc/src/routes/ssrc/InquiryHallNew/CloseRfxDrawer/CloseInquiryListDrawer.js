/**
 * OperationRecord - 关闭询价单页面
 * @date: 2021 7/15
 * @author: SYJ <yujie.shao@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, TextArea, Attachment } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
// import intl from 'utils/intl';
import classnames from 'classnames';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import styles from './index.less';

function CloseInquiryListDrawer(props) {
  const { formDS, remote, sourceKey = 'INQUIRY', customizeForm = () => {} } = props;
  return customizeForm(
    {
      code: `SSRC.${sourceKey}_HALL.CLOSE_MODAL.FORM`,
      dataSet: formDS,
    },
    <Form
      dataSet={formDS}
      labelWidth={100}
      labelLayout="float"
      className={classnames(styles['close-from-wrapper'])}
    >
      {/* <h3 className={classnames(styles['close-sub-title'])} name="remarkTitle">
        {intl.get(`ssrc.inquiryHall.view.message.close.inquiryListReason`).d('关闭理由')}
      </h3> */}
      <TextArea name="terminatedRemark" cols={180} rows={2} resize />
      {/* <h3
        className={classnames(styles['close-sub-title'], styles['close-top-16'])}
        name="uuidTitle"
      >
        {intl.get('hzero.common.upload.modal.title').d('附件')}
      </h3>
      </h3> */}
      <Attachment name="closeAttachmentUuid" {...ChunkUploadProps} />
      {remote
        ? remote.render('SSRC_INQUIRY_HALL_NEW_LIST_RENDER_CLOSE_RFXDRAWER_NODE', <></>)
        : null}
    </Form>
  );
}

export default WithCustomizeC7N({
  unitCode: [`SSRC.INQUIRY_HALL.CLOSE_MODAL.FORM`, `SSRC.BID_HALL.CLOSE_MODAL.FORM`],
})(formatterCollections({ code: ['ssrc.inquiryHall', 'hzero.common'] })(CloseInquiryListDrawer));

export { CloseInquiryListDrawer };
