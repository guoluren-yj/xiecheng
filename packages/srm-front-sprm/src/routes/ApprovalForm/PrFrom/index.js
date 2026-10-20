/* eslint-disable prefer-template */
/*
 * ApprovalForm - 申请审批表单
 * @date: 2023/09/01 11:47:39
 * @author: yanglin
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */

import React, { useEffect, useState, useMemo, useCallback, Fragment } from 'react';
import { DataSet, Modal, Icon } from 'choerodon-ui/pro';
import { Alert, Spin } from 'choerodon-ui';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import { AFBasic, AFExtra } from '_components/AFCards';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import PrintProButton from '_components/PrintProButton';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPRM } from '_utils/config';
import { getCuszTemplate } from '@/utils/api';
import OtherInfo from './components/OtherInfo';
import ReplenishInfo from './components/ReplenishInfo';
import AttachmentInfo from './components/AttachmentInfo';
import PurchaseLineInfo from './components/PurchaseLineInfo';

import { basic, extra, other, line, attachmentInfo, replenish } from './store';
import { THROTTLE_TIME, thousandBitSeparator } from '@/routes/utils';
import OperationNewRecord from '@/routes/components/OperationHistory';
// import { useAmountRender } from '@/routes/OrderWorkspace/hooks';
import { fetchUomControl } from '@/services/purchaseRequisitionCreationService';
import styles from './index.less';

const createUnitCode = [
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFBASIC',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFEXTRA',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.OTHER',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.REPLENISH',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.BTNS',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.ATTACHMENTINFO',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CREATE_TABLE',
];

const changeUnitCode = [
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFBASIC',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFEXTRA',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.OTHER',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.REPLENISH',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGE_BTNS',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGE_ATTACHMENTINFO',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGED_TABLE',
];

const cancelUnitCode = [
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFBASIC',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFEXTRA',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.OTHER',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.REPLENISH',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.BTNS',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGE_ATTACHMENTINFO',
  'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CANCEL_LINE_TABLE',
];

const ApprovalForm = (props) => {
  const {
    code = '',
    customizeCommon,
    customizeForm,
    customizeTable,
    queryUnitConfig,
    customizeBtnGroup,
    queryTemplateConfig,
    match: {
      params: { prHeaderId },
    },
  } = props;

  // const { stageCode, templateCode, templateVersion } = useMemo(
  //   () => parse(location.search?.substring(1)),
  //   [location]
  // );
  const [uomControl, setUomControl] = useState(0); // 双单位控制.开启后原单位,数量不可编辑
  const isChange = useMemo(() => code?.includes('CHANGE'), [code]); // 是否为变更审批表单标识
  const isCancel = useMemo(() => code?.includes('CANCEL'), [code]); // 是否为取消审批表单标识
  // 单据样式页面编码
  const stageCode = useMemo(() => {
    if (isChange) {
      return 'CHANGE';
    }

    if (isCancel) {
      return 'CANCEL';
    }

    return 'CREATE';
  }, [isChange, isCancel]);
  // 明细信息单元编码
  const detailInfoCode = useMemo(
    () =>
      isChange
        ? 'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGED_TABLE'
        : isCancel
        ? 'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CANCEL_LINE_TABLE'
        : 'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CREATE_TABLE',
    []
  );
  // 附件信息单元编码
  const AttachmentInfoCode = useMemo(
    () =>
      isChange || isCancel
        ? [
            'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGE_ATTACHMENTINFO',
            'SPRM.PURCHASE_PLAFORM_APPROVALFORM.EXTERNAL_ATTACHMENT',
          ]
        : [
            'SPRM.PURCHASE_PLAFORM_APPROVALFORM.ATTACHMENTINFO',
            'SPRM.PURCHASE_PLAFORM_APPROVALFORM.EXTERNAL_ATTACHMENT',
          ],
    []
  );

  // 变更审批表单下是否仅展示变更数据状态
  const [isShowAll, setIsShowAll] = useState(true);
  const [init, setInit] = useState(false);
  const [templateInfo, setTemplateInfo] = useState(null);

  const extraDs = useMemo(() => new DataSet(extra()), []);
  const otherDs = useMemo(() => new DataSet(other()), []);
  const replenishDs = useMemo(() => new DataSet(replenish()), []);
  const attachmentInfoDs = useMemo(() => new DataSet(attachmentInfo()), []);
  const basicDs = useMemo(
    () => new DataSet(basic({ prHeaderId, extraDs, attachmentInfoDs, otherDs })),
    []
  );
  const lineDs = useMemo(() => new DataSet(line({ prHeaderId, uomControl })), [uomControl]);

  const basicFieldsConfig = useMemo(
    () => ({
      displayPrNum: {
        render: ({ record }) =>
          record &&
          `${record.get('title') ? record.get('title') + '-' : ''}${record.get('displayPrNum') ??
            ''}`,
      },
      prTypeName: {
        useLabel: false,
      },
      creationDate: {
        render: ({ record, name, dataSet }) =>
          record &&
          `${dataSet.getField(name).get('label') || '-'} : ${record
            .get('creationDate')
            ?.format(DEFAULT_DATE_FORMAT) || '-'}`,
      },
    }),
    []
  );

  const extraFieldsConfig = useMemo(() => {
    return {
      fieldGroup1: {
        aggregation: true,
        aggregationFields: ['unitName', 'prRequestedName', 'requestDate'],
        aggregationTitleRender({ node }) {
          return <>{node}</>;
        },
      },
      remark: {
        useLabel: true,
      },
      requestDate: {
        renderValue: ({ value }) => value?.format(DEFAULT_DATE_FORMAT),
      },
    };
  }, []);

  const queryCuszFunc = (templateInfoRes) => {
    const { templateCode, templateVersion, useTemplateCusz } = templateInfoRes;
    if (useTemplateCusz) {
      const newTemplateInfo = {
        cuszTplTemplateCode: templateCode,
        cuszTplVersion: templateVersion,
        cuszTplStageCode: stageCode,
        cuszTplPageCode: 'SRM',
      };

      return queryTemplateConfig(templateInfoRes, {
        stageCode: newTemplateInfo.cuszTplStageCode,
        pageCode: newTemplateInfo.cuszTplPageCode,
      }).then(() => {
        setTemplateInfo({
          ...newTemplateInfo,
          stageCode: newTemplateInfo.cuszTplStageCode,
          pageCode: newTemplateInfo.cuszTplPageCode,
        });
      });
    } else {
      const unitCodes = isChange ? changeUnitCode : isCancel ? cancelUnitCode : createUnitCode;
      return queryUnitConfig(undefined, undefined, unitCodes).then(() => {
        setTemplateInfo({});
      });
    }
  };

  // 获取是否开启双单位控制
  const queryUomControl = async () => {
    await fetchUomControl().then((res) => {
      if (res && res.failed) {
        notification.error({ message: res.message });
      } else {
        setUomControl(res?.SPRM || 0);
      }
      setInit(true);
    });
  };

  // 初始化模版
  const initCustomizeTemplate = () => {
    getCuszTemplate({
      templateCuszMethodCode: 'SPRM_PR_PROCESS_FORM_CUSZ_TEMPLATE',
      businessParam: { prHeaderId },
    }).then((templateInfoRes) => {
      if (getResponse(templateInfoRes)) {
        queryCuszFunc(templateInfoRes);
      }
    });
  };

  useEffect(() => {
    queryUomControl();
    if (prHeaderId) {
      initCustomizeTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prHeaderId]);

  useEffect(() => {
    if (init && !!templateInfo) {
      if (isChange) {
        basicDs.setQueryParameter(
          'customizeUnitCode',
          'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFBASIC,SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFEXTRA,SPRM.PURCHASE_PLAFORM_APPROVALFORM.OTHER,SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGE_ATTACHMENTINFO,SPRM.PURCHASE_PLAFORM_APPROVALFORM.EXTERNAL_ATTACHMENT'
        );
        lineDs.setQueryParameter(
          'customizeUnitCode',
          'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGED_TABLE,SPRM.PURCHASE_PLAFORM_APPROVALFORM.LINE_SEARCH'
        );
      } else if (isCancel) {
        basicDs.setQueryParameter(
          'customizeUnitCode',
          'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFBASIC,SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFEXTRA,SPRM.PURCHASE_PLAFORM_APPROVALFORM.OTHER,SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGE_ATTACHMENTINFO,SPRM.PURCHASE_PLAFORM_APPROVALFORM.EXTERNAL_ATTACHMENT'
        );
        lineDs.setQueryParameter(
          'customizeUnitCode',
          'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CANCEL_LINE_TABLE,SPRM.PURCHASE_PLAFORM_APPROVALFORM.LINE_SEARCH'
        );
      } else {
        basicDs.setQueryParameter(
          'customizeUnitCode',
          'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFBASIC,SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFEXTRA,SPRM.PURCHASE_PLAFORM_APPROVALFORM.OTHER,SPRM.PURCHASE_PLAFORM_APPROVALFORM.ATTACHMENTINFO,SPRM.PURCHASE_PLAFORM_APPROVALFORM.EXTERNAL_ATTACHMENT'
        );
        lineDs.setQueryParameter(
          'customizeUnitCode',
          'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CREATE_TABLE,SPRM.PURCHASE_PLAFORM_APPROVALFORM.LINE_SEARCH'
        );
      }

      Object.keys(templateInfo).forEach((key) => {
        basicDs.setQueryParameter(key, templateInfo[key]);
        lineDs.setQueryParameter(key, templateInfo[key]);
      });

      basicDs.query();
      lineDs.query();
    }
  }, [init, isChange, isCancel, templateInfo, basicDs, lineDs]);

  // 渲染金额
  const renderHeaderAmount = ({ record, name, text }) => {
    const field = 'headerPriceHiddenFlag';

    if (record && record.get(field) === 1) {
      return record.get(`${name}Meaning`);
    }

    return thousandBitSeparator(
      text,
      record.get('financialPrecision'),
      record.get('prSourcePlatform') !== 'SRM'
    );
  };

  const contentRemainRender = useCallback(() => {
    const basicCurrent = basicDs && basicDs.current;
    if (basicCurrent) {
      const { amount, originalCurrency = '' } = basicCurrent.get(['amount', 'originalCurrency']);

      return (
        <div
          style={{
            display: 'flex',
            height: '100%',
            alignItems: 'flex-end',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#868D9C',
              paddingRight: '12px',
              lineHeight: '18px',
              fontWeight: 400,
            }}
          >
            {intl.get('sodr.approvalForm.model.common.amount').d('原币含税金额')}
          </div>
          <div style={{ fontWeight: 600, fontSize: '24px', paddingRight: '12px' }}>
            {`${renderHeaderAmount({
              record: basicCurrent,
              name: 'amount',
              text: amount,
            })}  ${originalCurrency}`}
          </div>
        </div>
      );
    }
  }, []);

  // 打印
  const handlePrint = async () => {
    const printFlag = checkPrintWindow();

    const patchParams = {
      prHeaderId,
      responseType: printFlag ? 'blob' : 'json',
      headers: printFlag ? {} : { 's-print-using-preview': '1' },
    };

    const res = await print(patchParams);

    if (printFlag) {
      if (res && res.type && res.type.includes('application/json')) {
        const reader = new FileReader();
        reader.readAsText(res, 'utf-8');
        reader.onload = () => {
          const readers = reader.result;
          const parseObj = JSON.parse(readers);
          notification.error({ message: parseObj.message });
        };
      } else if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) printWindow.print();
      }
    }
    if (!printFlag) {
      if (getResponse(res)) {
        // 添加如下代码
        const { fileUrl, bucketName, fileToken } = res;
        const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
        window.open(url);
      }
    }
  };

  // 操作记录
  const handleRecord = useCallback(() => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationNewRecord prHeaderId={prHeaderId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  }, [prHeaderId]);

  // 仅展示变更内容
  const handleChangeContent = useCallback(
    (flag) => {
      // changeEditFlag: 1 仅展示变更内容 ｜ 0 展示全部内容
      setIsShowAll(flag);
      const changeEditFlag = flag ? 0 : 1;
      lineDs.setState('changeEditFlag', changeEditFlag);
      lineDs.query();
    },
    [isShowAll]
  );

  const handleReplenish = () => {
    Modal.open({
      width: 380,
      title: intl.get('sprm.common.common.title.replenishInfo').d('补录信息'),
      closable: true,
      drawer: true,
      children: (
        <ReplenishInfo
          ds={replenishDs}
          customizeForm={customizeForm}
          prHeaderId={prHeaderId}
          code="SPRM.PURCHASE_PLAFORM_APPROVALFORM.REPLENISH"
        />
      ),
    });
  };

  const contentBottomRender = useCallback(() => {
    const buttons = [
      {
        name: 'print',
        btnComp: PrintProButton,
        child: intl.get(`hzero.common.button.print`).d('打印'),
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            color: 'dark',
          },
          color: 'dark',
          wait: THROTTLE_TIME,
          requestUrl: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-requests/${prHeaderId}/print-token`,
          method: 'GET',
          buttonText: intl.get(`hzero.common.button.print`).d('打印'),
        },
      },
      {
        name: 'record',
        child: intl.get('sodr.approvalForm.view.button.operationRecords').d('操作记录'),
        btnProps: {
          color: 'dark',
          icon: 'operation_service_request',
          funcType: 'flat',
          type: 'c7n-pro',
          wait: THROTTLE_TIME,
          onClick: handleRecord,
        },
      },
      {
        name: 'replenish',
        child: intl.get('sprm.common.common.title.replenishInfo').d('补录信息'),
        btnProps: {
          color: 'dark',
          funcType: 'flat',
          type: 'c7n-pro',
          icon: 'mode_edit',
          wait: THROTTLE_TIME,
          onClick: handleReplenish,
        },
      },
    ];
    // if (isChange) {
    //   buttons.push({
    //     name: 'changeContent',
    //     child: isShowAll
    //       ? intl.get('sodr.approvalForm.view.button.hiddenAll').d('仅展示变更内容')
    //       : intl.get('sodr.approvalForm.view.button.showAll').d('展示全部内容'),
    //     btnProps: {
    //       icon: 'visibility',
    //       // funcType: 'flat',
    //       onClick: handleChangeContent,
    //       wait: THROTTLE_TIME,
    //     },
    //   });
    // }
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {customizeBtnGroup(
            {
              code: isChange
                ? 'SPRM.PURCHASE_PLAFORM_APPROVALFORM.CHANGE_BTNS'
                : 'SPRM.PURCHASE_PLAFORM_APPROVALFORM.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
          )}
        </div>
        {isChange && (
          <div className={styles.rightTabs}>
            <div className={isShowAll ? 'active' : ''} onClick={() => handleChangeContent(true)}>
              <span>{intl.get(`sprm.common.common.view.changedDoc`).d('展示变更后单据')}</span>
            </div>
            <div className={!isShowAll ? 'active' : ''} onClick={() => handleChangeContent(false)}>
              <span>{intl.get(`sprm.common.common.view.onlyChangeData`).d('仅展示变更项')}</span>
            </div>
          </div>
        )}
      </div>
    );
  }, [isShowAll, handlePrint, handleRecord, handleChangeContent, customizeBtnGroup]);

  return (
    <div className={styles['approval-form']}>
      <Spin spinning={basicDs.status !== 'ready'}>
        {isChange && (
          <Alert
            className={styles['order-top-title']}
            border={false}
            message={
              <Fragment>
                <Icon
                  type="help"
                  style={{
                    fontSize: '16px',
                    marginRight: '8px',
                    position: 'relative',
                    top: '-2px',
                  }}
                />
                {intl
                  .get('sprm.common.view.alert.changeInfo')
                  .d('单据变更的内容用红色字体标识，鼠标定位在变更处可以查看变更前的原始内容')}
              </Fragment>
            }
            closable
          />
        )}
        {customizeCommon(
          {
            code: 'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFBASIC',
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            dataSet={basicDs}
            titleField="displayPrNum"
            tagFields={['prTypeName']}
            normalFields={['createByName', 'creationDate']}
            fieldsConfig={basicFieldsConfig}
            contentRemainWidth="25%"
            contentRemainRender={contentRemainRender}
            contentBottomRender={contentBottomRender}
          />
        )}
        {customizeCommon(
          {
            code: 'SPRM.PURCHASE_PLAFORM_APPROVALFORM.AFEXTRA',
            processUnitTag: 'AF-EXTRA',
          },
          <AFExtra
            dataSet={extraDs}
            fields={['fieldGroup1', 'remark']}
            fieldsConfig={extraFieldsConfig}
          />
        )}
        <Content>
          <h3>{intl.get('sprm.common.title.detailLineInfo').d('申请明细信息')}</h3>
          <PurchaseLineInfo
            ds={lineDs}
            uomControl={uomControl}
            isChange={isChange}
            isCancel={isCancel}
            isShowAll={isShowAll}
            customizeTable={customizeTable}
            prHeaderId={prHeaderId}
            code={detailInfoCode}
          />
        </Content>
        {isShowAll && (
          <>
            <Content>
              <h3>{intl.get('sprm.common.common.title.otherInfo').d('其他信息')}</h3>
              <OtherInfo
                ds={otherDs}
                customizeForm={customizeForm}
                prHeaderId={prHeaderId}
                code="SPRM.PURCHASE_PLAFORM_APPROVALFORM.OTHER"
              />
            </Content>
            <Content>
              <AttachmentInfo
                ds={attachmentInfoDs}
                customizeForm={customizeForm}
                prHeaderId={prHeaderId}
                code={AttachmentInfoCode}
                showChangeAttach={isChange || isCancel}
              />
            </Content>
          </>
        )}
      </Spin>
    </div>
  );
};

export default compose(
  withCustomize({ isTemplate: true }),
  formatterCollections({
    code: [
      'sodr.approvalForm',
      'sodr.workspace',
      'sodr.common',
      'sprm.common',
      'ssrc.inquiryHall',
      'entity.supplier',
      'sprm.purchasePlatform',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'entity.attachment',
      'entity.item',
      'sprm.purchaseRequisitionInquiry',
      'sprm.purchaseReqCreation',
      'sprm.purchaseRequisitionAssign',
      'sodr.sendOrder',
      'ssrc.priceLibrary',
    ],
  }),
  observer
)(ApprovalForm);
