import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import intl from 'utils/intl';

import SecLevelTitle from '../../components/SecLevelTitle';

import ApproveRule from './ApproveRule';
import AttachmentRequirements from './AttachmentRequirements';
import Store from '../store/index';

const ApproveRuleTab = (props) => {
  const { commonDs: { baseInfoDs, attachRequirementDs } = {} } = useContext(Store);

  const { sourceCategory } = baseInfoDs?.current?.get(['sourceCategory']) || {};

  // 是否启用了招标文件模板管理功能
  const fileTemplateManageFlag = attachRequirementDs?.getState('fileTemplateManageFlag');

  // 配置表查询出来之后再显示
  if (isNil(fileTemplateManageFlag)) return;

  return fileTemplateManageFlag && ['NEW_BID', 'RFA', 'RFQ'].includes(sourceCategory) ? (
    <>
      <div>
        <SecLevelTitle
          title={intl.get('ssrc.sourceTemplate.view.title.approveRule').d('审批规则')}
          style={{ marginTop: '20px' }}
        />
        <ApproveRule {...props} />
      </div>
      <div>
        <SecLevelTitle
          title={intl.get('ssrc.sourceTemplate.view.title.attachmentRequirements').d('附件要求')}
        />
        <AttachmentRequirements />
      </div>
    </>
  ) : (
    <ApproveRule {...props} />
  );
};

export default observer(ApproveRuleTab);
