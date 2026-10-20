import React, { useMemo, useCallback, memo, useImperativeHandle } from 'react';
import { TextField, Lov, Icon, TextArea, Output } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';

import { isEmpty, noop } from 'lodash';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { observer, useComputed } from 'mobx-react-lite';
import { withOverride } from '@/utils/utils';

const { Step } = Steps;

const RfxInfoDS = observer((props) => {
  const {
    customizeCollapseForm,
    custLoading,
    rfxInfoDS = {},
    changeRfxTitle,
    changeSourceTemplateLov,
    changeSectionNameLov,
    setRfxInfoRef,
    header,
    proxyDsCreate = {},
    rfx = {},
    afterCustomizeDs,
    remote,
    newBiddingFlag,
    isNewRfx = false,
    bidFlag = false,
    history,
    itemLineTableDS,
    fetchInquiryHeader = noop,
    toggleButtonsLoading = noop,
    togglePageLoading = noop,
  } = props;
  const { sourceKey = null } = rfx;
  const isProject = header && header.sourceFrom === 'PROJECT';
  const isTemplate = useComputed(() => {
    return rfxInfoDS?.current?.get('templateId'); // 是否有寻源模板 有显示寻源节点 无则隐藏
  }, [rfxInfoDS]);

  // 寻源节点
  const renderNodes = useCallback((option = {}) => {
    const { name = '', dataSet = {} } = option || {};

    if (!dataSet.current) {
      return null;
    }

    const rfxSteps = dataSet.current.get(name) || [];
    const isArrayValue = rfxSteps?.slice && Array.isArray(rfxSteps?.slice());

    if (!rfxSteps || isEmpty(rfxSteps) || !isArrayValue) {
      return null;
    }

    return (
      <Steps size="small">
        {rfxSteps.map((rfxStep = {}) => {
          const { nodeStatus = null, nodeStatusMeaning = null } = rfxStep || {};

          return (
            <Step
              status="wait"
              key={nodeStatus}
              title={
                <span style={{ color: 'black', fontWeight: '400' }}>
                  {nodeStatusMeaning || nodeStatus}
                </span>
              }
              icon={<Icon type="brightness_o" />}
            />
          );
        })}
      </Steps>
    );
  }, []);

  const sectionNameModalProps = useMemo(
    () => ({
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称'),
      style: { width: '80%' },
    }),
    []
  );
  const sourceTemplateModalProps = useMemo(
    () => ({
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
      style: { width: '80%' },
      destroyOnClose: true,
    }),
    []
  );

  // hooks继承挂载二开需要的方法变量等
  useImperativeHandle(props?.forwardRef, () => ({
    getColumns,
  }));

  const getColumns = () => [
    <TextField name="rfxTitle" onChange={changeRfxTitle} clearButton />,
    isProject ? <TextField name="sourceProjectNum" disabled /> : null,
    isProject ? <TextField name="sourceProjectName" disabled /> : null,
    header?.multiSectionFlag && header?.rfxStatus === 'NEW' ? (
      ''
    ) : isProject && header.subjectMatterRule === 'PACK' ? (
      <Lov
        name="sectionNameLov"
        modalProps={sectionNameModalProps}
        onChange={changeSectionNameLov}
        clearButton={false}
      />
    ) : null,
    <C7nPrecisionInputNumber
      name="budgetAmount"
      record={rfxInfoDS.current}
      financial="currencyCode"
    />,
    <Lov
      name="sourceTemplateLov"
      modalProps={sourceTemplateModalProps}
      noCache
      onChange={changeSourceTemplateLov}
    />,
    // {/* 占位符号 */}
    <div name="rfxInfo_1" fieldClassName="td-no-visible" />,
    isTemplate && (
      <Output
        name="sourceNodes"
        colSpan={3}
        className={styles['source-nodes-wrap']}
        renderer={renderNodes}
      />
    ),
    <TextArea name="rfxRemark" clearButton resize />,
    // {/* 占位符号 */}
    <div name="rfxInfo_2" fieldClassName="td-no-visible" />,
    header && header.priceTypeCode === 'NET_PRICE' ? ( // 基准价未税
      <C7nPrecisionInputNumber
        name="totalNetEstimatedAmount"
        record={rfxInfoDS.current}
        financial="currencyCode"
        disabled
      />
    ) : (
      <C7nPrecisionInputNumber
        name="totalEstimatedAmount"
        record={rfxInfoDS.current}
        financial="currencyCode"
        disabled
      />
    ),
    newBiddingFlag ? <Lov name="currencyLov" /> : '',
  ];

  const getOverrideColumns = withOverride.call(props, getColumns, 'getOverrideColumns');

  const columns = getOverrideColumns();

  return customizeCollapseForm(
    {
      code: `SSRC.${sourceKey}_HALL.NEW_EDIT.INFO_V2`,
      dataSet: rfxInfoDS,
      proxyDsCreate,
      afterCustomizeDs,
    },
    <CollapseForm
      dataSet={rfxInfoDS}
      labelLayout="float"
      showLines={6}
      columns={3}
      custLoading={custLoading}
      formRef={setRfxInfoRef}
      useWidthPercent
      className={styles['rfx-card-common-form']}
    >
      {remote
        ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_RFX_FORM_COLUMNS', columns, {
            rfxInfoDS,
            sourceKey,
            isNewRfx,
            bidFlag,
            history,
            itemLineTableDS,
            fetchInquiryHeader,
            toggleButtonsLoading,
            togglePageLoading,
            changeSourceTemplateLov,
          })
        : columns}
    </CollapseForm>
  );
});

export default memo(RfxInfoDS);
