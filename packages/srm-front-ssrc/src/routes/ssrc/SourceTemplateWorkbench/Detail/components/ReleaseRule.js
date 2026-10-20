import React, { useContext, useRef } from 'react';
import { Output, Modal, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import RichTextEditor from 'components/RichTextEditor';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';
import styles from '../../index.less';

const ReleaseRule = () => {
  const {
    customizeForm,
    getCustomizeUnitCode = () => {},
    commonDs: { releaseRuleDs },
  } = useContext(Store);

  const editorRef = useRef();

  // 编辑寻源事项说明
  const handleEditNotice = () => {
    Modal.open({
      title: intl.get(`ssrc.sourceTemplate.view.message.modal.sourceMatterDesc`).d('寻源事项说明'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: '1000px',
      },
      closable: true,
      children: (
        <div className={styles['source-template-release-rich']}>
          <RichTextEditor
            privateBucket
            bucketName={PRIVATE_BUCKET}
            content={releaseRuleDs?.current?.get('matterDetail')}
            bucketDirectory="ssrc-common"
            ref={(node) => {
              editorRef.current = node;
            }}
          />
        </div>
      ),
      footer: null,
    });
  };

  const getFields = () => [
    <Output name="sourceMethod" showHelp="label" />,
    <Output
      showHelp="label"
      name="maxVendorQuantity"
      hidden={releaseRuleDs?.current?.get('sourceMethod') !== 'INVITE'}
    />,
    <Output
      name="minVendorNumber"
      showHelp="label"
      hidden={releaseRuleDs?.current?.get('sourceMethod') !== 'INVITE'}
    />,
    <Output
      name="matchRestrictFlag"
      showHelp="label"
      hidden={releaseRuleDs?.current?.get('sourceMethod') !== 'INVITE'}
      renderer={({ value }) => yesOrNoRender(value)}
    />,
    <Output
      name="notesReadRequired"
      renderer={({ value }) => yesOrNoRender(value)}
      showHelp="label"
    />,
    <Output
      name="sourceMatterNotice"
      showHelp="label"
      renderer={() => {
        if (!releaseRuleDs?.current?.get('matterDetail')) return '-';
        return <a onClick={handleEditNotice}>{intl.get('hzero.common.button.look').d('查看')}</a>;
      }}
    />,
    <Output name="noticeEndNodeCode" showHelp="label" />,
  ];
  return customizeForm(
    {
      code: getCustomizeUnitCode('releaseRule'),
    },
    <Form
      dataSet={releaseRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      {getFields()}
    </Form>
  );
};

export default observer(ReleaseRule);
