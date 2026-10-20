import React from 'react';
import { Popover } from 'choerodon-ui';
import styles from './index.less';

const DocumentWizardPopover = (props) => {
  const title = props.title || '单据精灵提示';
  const content = (
    <>
      <div className={styles['document-wizard-popover-border']} />
      {props.content}
    </>
  );
  const { hidden, ...rest } = props;
  if (hidden) {
    rest.visible = false;
  }
  return (
    <Popover
      {...rest}
      title={title}
      content={content}
      overlayClassName={styles['document-wizard-popover']}
    />
  );
};

DocumentWizardPopover.displayName = 'DocumentWizardPopover';

export default DocumentWizardPopover;
