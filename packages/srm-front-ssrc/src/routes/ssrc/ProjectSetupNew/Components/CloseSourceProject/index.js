/**
 * OperationRecord - 关闭寻源项目
 * @date: 2023/03/12
 * @author: SYJ <yujie.shao@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useImperativeHandle } from 'react';
import { Form, TextArea, Attachment, useDataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import classnames from 'classnames';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { closeSourceProjectDS } from './ds';
import styles from './index.less';

function CloseSourceProjectChildren(props) {
  const { customizeForm = () => {}, closeSourceProjectRef, record } = props;

  const sourceProjectId = record?.get('sourceProjectId');

  const closeFormDS = useDataSet(() => closeSourceProjectDS({ sourceProjectId }), []);

  useImperativeHandle(closeSourceProjectRef, () => ({
    closeFormDS,
  }));

  return customizeForm(
    {
      code: `SSRC.PROJECT_SETUP.NEW_LIST.CLOSE_SOURCE_PROJECT_FORM`,
      dataSet: closeFormDS,
    },
    <Form
      dataSet={closeFormDS}
      labelLayout="float"
      columns={1}
      className={classnames(styles['close-from-wrapper'])}
    >
      <h3 className={classnames(styles['close-sub-title'])} colSpan={3} name="remarkTitle">
        {intl.get(`ssrc.projectSetup.view.message.close.reason`).d('关闭理由')}
      </h3>
      <TextArea name="closedComments" rows={2} colSpan={3} resize newLine />
      <h3
        className={classnames(styles['close-sub-title'], styles['close-top-16'])}
        name="uuidTitle"
        colSpan={3}
        newLine
      >
        {intl.get('hzero.common.upload.modal.title').d('附件')}
      </h3>
      <Attachment name="closedAttachmentUuid" colSpan={3} newLine />
    </Form>
  );
}

export default WithCustomizeC7N({
  unitCode: [`SSRC.PROJECT_SETUP.NEW_LIST.CLOSE_SOURCE_PROJECT_FORM`],
})(
  formatterCollections({ code: ['ssrc.projectSetup', 'hzero.common'] })(CloseSourceProjectChildren)
);
