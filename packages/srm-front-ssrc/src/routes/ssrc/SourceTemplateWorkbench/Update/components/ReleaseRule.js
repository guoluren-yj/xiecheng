/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2023-08-01 20:15:31
 * @LastEditors: yiping.liu
 */
import React, { useContext, useRef } from 'react';
import { Select, NumberField, CheckBox, Output, Modal, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import RichTextEditor from 'components/RichTextEditor';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import Store from '../store/index';
import styles from '../../index.less';

const ReleaseRule = () => {
  const {
    customizeForm,
    getCustomizeUnitCode = () => {},
    commonDs: { releaseRuleDs, baseInfoDs, quotationRuleDs },
  } = useContext(Store);

  const editorRef = useRef();

  // 弹框确定
  const handleOk = () => {
    // eslint-disable-next-line no-unused-expressions
    releaseRuleDs?.current?.set('matterDetail', editorRef.current.getContent());
  };

  // 编辑寻源事项说明
  const handleEditNotice = () => {
    Modal.open({
      title: (
        <div>
          <div>
            {intl.get(`ssrc.sourceTemplate.view.message.modal.sourceMatterDesc`).d('寻源事项说明')}
          </div>
          <div className={styles['source-matter-desc']}>
            {intl
              .get(`ssrc.sourceTemplate.model.template.sourceMatterNoticeContentTooltip`)
              .d('用于维护供应商报价期间需要阅读的事项须知内容。')}
          </div>
        </div>
      ),
      key: Modal.key(),
      style: {
        width: '1000px',
      },
      drawer: true,
      closable: true,
      children: (
        <div className={styles['source-template-release-rich']}>
          <RichTextEditor
            bucketName={PRIVATE_BUCKET}
            privateBucket
            content={releaseRuleDs?.current?.get('matterDetail')}
            bucketDirectory="ssrc-common"
            ref={(node) => {
              editorRef.current = node;
            }}
          />
        </div>
      ),
      onOk: handleOk,
    });
  };

  // 新竞价过滤全平台公开
  const renderSourceMethod = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    if (baseInfoDs?.current?.get('sourceCategory') === 'RFA') {
      if (quotationRuleDs?.current?.get('rankRule') === 'WEIGHT_PRICE') {
        return optionValue === 'INVITE';
      } else {
        return optionValue !== 'ALL_OPEN';
      }
      // return optionValue !== 'ALL_OPEN';
    }
    return optionValue;
  };

  // sourceMethod
  const changeSourceMethod = (value) => {
    const { current: quotationRuleCurrent } = quotationRuleDs || {};
    const { lackQuotationTriggersType = '' } = quotationRuleCurrent
      ? quotationRuleCurrent.get(['lackQuotationTriggersType'])
      : {};

    if (
      value &&
      value !== 'INVITE' &&
      lackQuotationTriggersType &&
      lackQuotationTriggersType.includes('PART_SUPPLIER_NO_QUOTED')
    ) {
      quotationRuleCurrent.set({
        lackQuotationTriggersType: undefined,
      });
    }
  };

  const getFields = () => [
    <Select
      name="sourceMethod"
      clearButton={false}
      optionsFilter={renderSourceMethod}
      showHelp="tooltip"
      onChange={changeSourceMethod}
    />,
    <NumberField
      name="maxVendorQuantity"
      hidden={releaseRuleDs?.current?.get('sourceMethod') !== 'INVITE'}
      showHelp="tooltip"
    />,
    <NumberField
      name="minVendorNumber"
      hidden={releaseRuleDs?.current?.get('sourceMethod') !== 'INVITE'}
      showHelp="tooltip"
    />,
    <CheckBox
      name="matchRestrictFlag"
      hidden={releaseRuleDs?.current?.get('sourceMethod') !== 'INVITE'}
      showHelp="tooltip"
    />,
    <Select name="notesReadRequired" clearButton={false} showHelp="tooltip" />,
    <Output
      name="sourceMatterNotice"
      renderer={() => {
        return <a onClick={handleEditNotice}>{intl.get('hzero.common.button.edit').d('编辑')}</a>;
      }}
    />,
    <Select name="noticeEndNodeCode" clearButton={false} showHelp="tooltip" />,
  ];

  return customizeForm(
    {
      code: getCustomizeUnitCode('releaseRule'),
    },
    <Form
      dataSet={releaseRuleDs}
      columns={3}
      labelLayout="float"
      className={styles['source-template-update-release-rule']}
      useWidthPercent
    >
      {getFields()}
    </Form>
  );
};

export default observer(ReleaseRule);
