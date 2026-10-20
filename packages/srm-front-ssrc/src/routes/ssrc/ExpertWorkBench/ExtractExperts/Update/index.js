import React, { useState, useRef, useEffect } from 'react';
import { Button, useModal, Tooltip } from 'choerodon-ui/pro';
import { compose, noop } from 'lodash';
import { observer } from 'mobx-react';

import remotes from 'hzero-front/lib/utils/remote';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';
import { isRecord } from '@/utils/utils';

import Content from './Content';

const Index = (props) => {
  const {
    headerRecord,
    excludeExpertIds = [],
    toolTipVisible = false,
    btnProps = {},
    sourceFromId = '',
    sourceFrom = 'RFX',
    extractOperateType = 'RFX_EDIT',
    customizeTable = noop,
    customizeCollapseForm = noop,
    submitSuccessCallBack = noop,
    name = '',
    extraRandomExtractPayload = {},
    remote,
  } = props || {};

  const {
    expertReplyFlag = 0,
    adjustRecordId,
    rfxHeaderAdjustId: sourceHeaderAdjustId,
    originTemplateId,
    templateId,
    expertRequirementsRule,
  } = isRecord(headerRecord)
    ? headerRecord.get([
        'expertReplyFlag',
        'adjustRecordId',
        'rfxHeaderAdjustId',
        'originTemplateId',
        'templateId',
        'expertRequirementsRule',
      ])
    : headerRecord || {};

  const hasTemplateChangeFlag = templateId !== originTemplateId;

  const Modal = useModal();
  const modalRef = useRef();

  const [operateLoading, setOperateLoading] = useState(false);

  const getChild = () => {
    const contentProps = {
      sourceFrom,
      sourceFromId,
      customizeTable,
      customizeCollapseForm,
      submitSuccessCallBack,
      extractOperateType,
      expertReplyFlag,
      excludeExpertIds,
      operateLoading,
      adjustRecordId,
      sourceHeaderAdjustId,
      extraRandomExtractPayload,
      setOperateLoading,
      expertRequirementsRule,
      remote,
    };
    return <Content {...contentProps} />;
  };

  const openModal = () => {
    if (!sourceFromId) return;

    return new Promise(async (resolve) => {
      modalRef.current = await Modal.open({
        title: intl.get('ssrc.expertExtract.view.title.randomExtract').d('随机抽取'),
        destroyOnClose: true,
        children: getChild(),
        drawer: true,
        style: {
          width: 1090,
        },
        okText: intl.get('ssrc.expertExtract.view.button.saveAndPush').d('保存并推送'),
        okProps: {
          loading: operateLoading,
        },
      });
      resolve();
    });
  };

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    modalRef.current?.update?.({
      children: getChild(),
      okProps: {
        loading: operateLoading,
      },
    });
  }, [operateLoading]);

  const renderTooltipTitle = () => {
    if (toolTipVisible) {
      if (extractOperateType === 'RFX_ADJUST') {
        return intl
          .get('ssrc.expertExtract.view.button.tooltip.extractExtractController')
          .d('若您调整过专家行或评分要素行信息，请及时保存');
      } else if (extractOperateType === 'RFX_EDIT') {
        if (hasTemplateChangeFlag) {
          return intl
            .get('ssrc.expertExtract.view.button.tooltip.extractExtractTemplate')
            .d('寻源模板更新，请保存后操作专家抽取');
        } else {
          return intl
            .get('ssrc.expertExtract.view.button.tooltip.extractExtract')
            .d('存在未保存的专家行和评分要素行，请先进行保存');
        }
      }
    }
    return null;
  };

  return (
    <Tooltip title={renderTooltipTitle()}>
      <Button
        name={name}
        icon="root"
        funcType="flat"
        color="primary"
        {...(btnProps || {})}
        onClick={() => openModal()}
      >
        {intl.get('ssrc.expertExtract.view.button.randomExtract').d('随机抽取')}
      </Button>
    </Tooltip>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.RULES_EDIT`, // 抽取规则表单
      `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_EDIT`, // 抽取专家表格
      `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.BUTTONS`, // 按钮组
    ],
  }),
  formatterCollections({
    code: ['ssrc.expertExtract', 'ssrc.common', 'hzero.common'],
  }),
  remotes(
    {
      code: 'SSRC_EXPERT_WORKBENCH_EXTRACT_EXPERTS_UPDATE',
      name: 'remote',
    },
    {
      events: {
        cuxRemoteodalHandleOkLasted() {},
      },
    }
  )
)(observer(Index));
