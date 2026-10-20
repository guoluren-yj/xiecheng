import React, { useContext, useCallback } from 'react';
import { useModal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { Store } from '.';
import { useModalOpen } from '../../../hooks';
import SelectBoxCard from '../components/SelectBoxCard';
import ToBeInvedMergeRule from '../components/ToBeInvedMergeRule';

const MergeRule = () => {

  const { editFlag } = useContext(Store);

  const modal = useModal();
  const modalOpen = useModalOpen(modal);

  const handleOpenWaitInvingLineMergeRule = useCallback(() => {
    modalOpen({
      editFlag,
      size: 'small',
      title: intl.get(`ssta.invoiceRule.view.title.toBeInvedLineMergeRuleConfig`).d('待开票行合并规则'),
      children: <ToBeInvedMergeRule />,
    });
  }, [editFlag, modalOpen]);

  return (
    <div className="strategy-panel-wrapper">
      <SelectBoxCard
        name='mergeCommodityDetailFlag'
        help={intl.get('ssta.invoiceRule.view.help.toBeInvedLineMergeRule').d('启用后，系统在自动生成开票申请单时，会将税收商品名称（行物料映射）、编码、税率、基准单价及其他用户自定义维度完全一致的待开票数据行合并为一行后，提交开票')}
        onSuffixClick={handleOpenWaitInvingLineMergeRule}
      />
    </div>
  );
};

export default MergeRule;