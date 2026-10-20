import { Expose } from 'utils/remote';

const submitTips = [
  {
    value: 'offline_signing',
    content: '您的信息已提交。下一步，请前往OA系统在“待处理表单中”找到单据，上传相关附件并正式发起审批。',
  },
  {
    value: 'fadada',
    content: '您的信息已提交。下一步，请前往OA系统在“待处理表单中”找到单据，维护签约信息及文件后正式发起审批',
  },
  {
    value: 'docusign',
    content: '您的信息已提交。下一步，请前往OA系统在“待处理表单中”找到单据，维护签约信息及文件后正式发起审批',
  },
  {
    value: 'other_signing',
    content: '您的信息已提交。下一步，请前往OA系统在“待处理表单中”找到单据，维护签约信息及文件后正式发起审批',
  },
];

export default new Expose({
  process: {
    SPCM_WORKSPACE_DETAIL_PROCESS_SUBMIT_CONFIRM: async (children, otherProps) => {
      const { current } = otherProps;
      const { headerFormDs } = current.state || {};
      const { attributeVarchar27 } = headerFormDs.current.get(['attributeVarchar27']);
      if (attributeVarchar27 && submitTips.some((item) => item.value === attributeVarchar27)) {
        return submitTips.find((item) => item.value === attributeVarchar27)?.content;
      }
      return children;
    },
    SPCM_WORKSPACE_DETAIL_HEADER_FIELD_CONFIG: (sourceConfig, otherProps) => {
      const { headerProps } = otherProps || {};
      const { isEdit, headerFormDs } = headerProps || {};
      const { pcSourceCode, supplementFlag } = headerFormDs?.current?.get(['pcSourceCode', 'supplementFlag']) || {};
      if (isEdit && pcSourceCode === 'SEARCH_SOURCE_RESULT' && [0, '0'].includes(supplementFlag)) {
        const commonFiledConfig = {
          ...(sourceConfig?.companyIdLov || {}),
          disabled: false,
        };
        return {
          ...(sourceConfig || {}),
          companyIdLov: commonFiledConfig,
          pcTypeIdLov: commonFiledConfig,
          pcTemplateIdLov: commonFiledConfig,
        };
      };
      return sourceConfig;
    },
  },
});
