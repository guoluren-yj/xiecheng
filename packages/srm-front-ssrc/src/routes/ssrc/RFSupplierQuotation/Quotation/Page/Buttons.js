import React, { useCallback } from 'react';
import { Button, Icon } from 'choerodon-ui/pro';
import { noop, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';

import { SRM_SSRC } from '_utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';

import CommonImportNew from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import useBidAnnouncementQueryModal from '@/routes/ssrc/components/BidAnnouncementQuery';

// import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import RFSupplierQuotationDetailImport from '@/routes/components/RFSupplierQuotationDetailImport';
import ApplyToSection from '../Modals/ApplyToSection';
import HistoryVersionListBtn from '../Modals/HistoryVersionListBtn';
import ChatRoomSourceLink from "@/routes/components/ChatRoomSource/ChatRoomSourceLink";

const { openBidAnnouncementQueryModal } = useBidAnnouncementQueryModal();

const Buttons = (props = {}) => {
  const {
    getCustomizeUnitCode = noop,
    customizeBtnGroup = noop,
    loading,
    submitQuotation = noop,
    saveQuotation = noop,
    batchImportOk = noop,
    queryQuotationLines = noop,
    getCurrentPageSubmitData = noop,
    // getSectionList = noop,
    quotationHeaderId,
    path,
    organizationId,
    isBidSectionData,
    submitQuotationSection = noop,
    getSectionListData = noop,
    basicFormDS,
    bidFlag = 0,
    quotationName = '',
    refreshPage = noop,
    projectLineSectionList = [],
    judgeSectionDataNoEmpty = noop,
    quotationRemote = null,
    handleWholeAbandon = noop,
    handleWholeAbandonSection = noop,
    quotationLineDS,
    allPageDisabled = false,
    doubleUnitFlag = false,
  } = props;
  const {
    quotationHeaderCurrentId,
    quotationStatus,
    // currentQuotationRound,
    bargainStatus,
    supplierStatus,
    needBidAnnouncement,
    // sourceCategory,
  } = basicFormDS.current
    ? basicFormDS.current.get([
        'quotationHeaderCurrentId',
        'quotationStatus',
        // 'currentQuotationRound',
        'bargainStatus',
        'supplierStatus',
        'needBidAnnouncement',
        // 'sourceCategory',
      ])
    : {};

  const wholeAbandonFlag =
    supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识

  // get import props
  const getImportProps = useCallback(() => {
    return {
      businessObjectTemplateCode: !bidFlag
        ? 'SSRC.RFX_QUOTATION.IMPORT'
        : 'SSRC.BID_QUOTATION.IMPORT',
      prefixPatch: SRM_SSRC,
      args: {
        tenantId: organizationId,
        quotationHeaderCurrentId,
        templateCode: !bidFlag ? 'SSRC.RFX_QUOTATION.IMPORT' : 'SSRC.BID_QUOTATION.IMPORT',
        fromExport: true,
      },
      otherButtonProps: {
        funcType: 'flat',
      },
      buttonProps: {
        permissionList: [
          {
            code: `${path}.button.import`.toLowerCase(),
            type: 'button',
            meaning: `${
              intl.get('ssrc.supplierQuotation.common.supplierQuotation.new').d('(新)') +
              intl
                .get(`ssrc.supplierQuotation.view.message.title.supplierQuotation`)
                .d('供应商报价') -
              intl.get(`ssrc.supplierQuotation.view.message.button.importQuotation`).d('Excel导入')
            }`,
          },
        ],
        funcType: 'flat',
        disabled: wholeAbandonFlag || allPageDisabled,
        loading,
      },
      refreshButton: true,
      buttonText: intl
        .get(`ssrc.supplierQuotation.view.message.button.importQuotation`)
        .d('Excel导入'),
      auto: true,
      successCallBack: batchImportOk,
      modalProps: {
        onCancel: batchImportOk,
        title: intl
          .get(`ssrc.supplierQuotation.view.message.title.commonSupplierQuotation`, {
            quotationName,
          })
          .d('供应商{quotationName}'),
      },
      customeImportTemplate: {
        templateCode: !bidFlag
          ? 'SRM_C_SRM_SSRC_RFX_QUOTATION_CUR_DOWNLOAD_EXPORT'
          : 'SRM_C_SRM_SSRC_BID_QUOTATION_CUR_DOWNLOAD_EXPORT',
        requestUrl: `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/items/quotation/lines/export?quotationHeaderCurrentId=${quotationHeaderCurrentId}`,
        queryParams: { quotationHeaderCurrentId },
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
    };
  }, [
    basicFormDS,
    bidFlag,
    quotationHeaderId,
    path,
    batchImportOk,
    quotationHeaderCurrentId,
    wholeAbandonFlag,
    loading,
    allPageDisabled,
  ]);

  // 打印调用接口前的处理 返回false，则不调用
  const beforePrint = useCallback(
    throttle(async () => {
      if (quotationRemote?.event) {
        quotationRemote.event.fireEvent('beforePrint', { bidFlag, basicFormDS });
      }
      const { validationFlag } = await getCurrentPageSubmitData();
      if (!validationFlag) {
        notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.view.message.pleaseSave')
            .d('请完善必填信息保存后再打印'),
        });
        return false;
      }
      return true;
    }, 2000),
    [getCurrentPageSubmitData, path, basicFormDS, quotationHeaderCurrentId]
  );

  // 打印成功后的回掉处理
  const printSuccess = useCallback(() => {
    if (quotationRemote?.event) {
      quotationRemote.event.fireEvent('beforePrintSuccess', { bidFlag, basicFormDS });
    }
  }, []);
  // 唱标查询
  const handleBidAnnouncement = () => {
    const { rfxHeaderId, supplierCompanyId } = basicFormDS?.current?.get([
      'rfxHeaderId',
      'supplierCompanyId',
    ]);
    openBidAnnouncementQueryModal({
      doubleUnitFlag,
      bidFlag,
      rfxHeaderId,
      supplierCompanyId,
    });
  };

  // header button set
  const getHeaderButtons = useCallback(() => {
    const currentBargainFlag = bargainStatus === 'BARGAINING_ONLINE'; // 议价

    // 整单放弃禁用标识
    const wholeAbandonDisabledFlag =
      !quotationStatus || !quotationHeaderCurrentId || wholeAbandonFlag || loading;

    let buttons = [
      {
        name: 'more',
        group: true,
        hidden: isBidSectionData,
        child: (
          <Button funcType="flat" disabled={wholeAbandonFlag}>
            <Icon type="more_horiz" />
            {/* {intl.get('hzero.common.basicLayout.viewMore').d('查看更多')} */}
          </Button>
        ),
        children: [
          {
            name: 'wholeAbandon',
            hidden: isBidSectionData || currentBargainFlag || allPageDisabled,
            child: (
              <>
                {/* <Icon type="delete_forever" style={{ fontSize: '12px', marginRight: '6px' }} /> */}
                {intl.get(`ssrc.supplierQuotation.view.message.wholeGiveUp`).d('整单放弃')}
              </>
            ),
            btnProps: {
              onClick: handleWholeAbandon,
              loading,
              style: {
                fontWeight: '600',
              },
              disabled: wholeAbandonDisabledFlag,
            },
          },
          {
            name: 'supplierQuotation',
            btnComp: RFSupplierQuotationDetailImport,
            inMenuItem: true,
            btnProps: {
              quotationHeaderCurrentId,
              buttonProps: {
                loading,
                funcType: 'flat',
                disabled: wholeAbandonFlag || allPageDisabled,
                icon: '',
              },
              funcType: 'flat',
              templateCode: !bidFlag
                ? 'SSRC.RFX_SUP_QUO_DETAIL_CUR'
                : 'SSRC.NEW_BID_SUP_QUO_DETAIL_CUR',
              onOk: queryQuotationLines,
              onClose: queryQuotationLines,
              calibrateImportFinishBeforeClose: 1, // 关闭弹窗前校验导入是否完成
            },
          },
          needBidAnnouncement
            ? {
                name: 'bidAnnouncementQuery',
                child: intl.get(`ssrc.common.model.common.bidAnnouncementQuery`).d('唱标查询'),
                btnProps: {
                  funcType: 'flat',
                  style: {
                    fontWeight: '600',
                  },
                  onClick: handleBidAnnouncement,
                },
              }
            : null,
          {
            name: 'chat',
            btnComp: ChatRoomSourceLink,
            btnType: 'c7n-pro',
            child: intl.get('ssrc.common.view.message.chatRecord').d('聊天记录'),
            btnProps: {
              btnType: 'c7n-pro',
              quotationHeaderId,
              roleCategory: 'SUPPLIER',
            },
          },
        ].filter(Boolean),
      },
      isBidSectionData
        ? {
            name: 'wholeAbandonSection',
            hidden: !isBidSectionData || currentBargainFlag,
            group: true,
            child: () => (
              <Button funcType="flat" icon="delete_forever" loading={loading}>
                {intl.get(`ssrc.supplierQuotation.view.message.wholeGiveUp`).d('整单放弃')}
              </Button>
            ),
            children: [
              {
                name: 'abandonCurrentSection',
                child: intl
                  .get(`ssrc.common.view.button.wholeAbandonCurrentSection`)
                  .d('整单放弃当前标段'),
                hidden: !isBidSectionData,
                btnProps: {
                  type: 'default',
                  loading,
                  disabled: wholeAbandonDisabledFlag || allPageDisabled,
                  onClick: () => handleWholeAbandonSection('CURRENT'),
                },
              },
              {
                name: 'abandonAllSection',
                child: intl
                  .get(`ssrc.common.view.button.wholeAbandonAllSections`)
                  .d('整单放弃所有标段'),
                hidden: !isBidSectionData,
                btnProps: {
                  type: 'default',
                  loading,
                  disabled: wholeAbandonDisabledFlag || allPageDisabled,
                  onClick: () => handleWholeAbandonSection('ALL'),
                },
              },
              {
                name: 'abandonPortionSection',
                btnComp: ApplyToSection,
                btnProps: {
                  type: 'default',
                  loading,
                  disabled: wholeAbandonDisabledFlag || allPageDisabled,
                  types: 'PORTION',
                  textNode: intl
                    .get('ssrc.common.view.button.wholeAbandonPortionBatchSection')
                    .d('整单放弃部分标段'),
                  getSectionListData,
                  submitQuotationSection: handleWholeAbandonSection,
                  getSectionItemProps: (sectionItem) => {
                    return {
                      disabled: ['QUOTATION_ABANDONED', 'ABANDONED'].includes(
                        sectionItem?.supplierStatus
                      ),
                    };
                  },
                },
              },
            ],
          }
        : null,
      {
        name: 'print',
        child: intl.get(`ssrc.supplierQuotation.view.message.button.print`).d('打印'),
        btnType: 'c7n-pro',
        btnComp: PrintProButton,
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            icon: 'print',
            disabled: allPageDisabled,
          },
          buttonText: intl.get(`ssrc.supplierQuotation.view.message.button.print`).d('打印'),
          requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/current/print-excel/token`,
          method: 'POST',
          data: {
            quotationHeaderCurrentId,
          },
          beforePrint,
          successCallBack: printSuccess,
        },
      },
      {
        name: 'historyRecord',
        btnComp: HistoryVersionListBtn,
        hidden: !quotationStatus || quotationStatus === 'NEW',
        btnProps: {
          funcType: 'flat',
          quotationHeaderId,
          organizationId,
          bidFlag,
          disabled: wholeAbandonFlag || allPageDisabled,
          loading,
        },
        inMenuItem: true,
      },
      {
        name: 'excelImport',
        btnComp: CommonImportNew,
        // hidden: isBidSectionData,
        btnProps: {
          name: 'excelInfoNew',
          ...(getImportProps() || {}),
        },
        inMenuItem: true,
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => saveQuotation(),
          loading,
          icon: 'save',
          funcType: 'flat',
          disabled: wholeAbandonFlag || allPageDisabled,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      !isBidSectionData
        ? {
            name: 'submit',
            btnType: 'c7n-pro',
            btnProps: {
              onClick: () => submitQuotation(),
              loading,
              color: 'primary',
              icon: 'check',
              disabled: wholeAbandonFlag || allPageDisabled,
            },
            hidden: isBidSectionData,
            child: intl.get('hzero.common.button.submit').d('提交'),
          }
        : false,
      isBidSectionData
        ? {
            name: 'submitSection', // 多标段提交
            group: true,
            child: () => {
              return (
                <Button icon="check" color="primary" loading={loading}>
                  {intl.get('hzero.common.button.submit').d('提交')}
                  <Icon type="expand_more" />
                </Button>
              );
            },
            hidden: !isBidSectionData || wholeAbandonFlag || allPageDisabled,
            children: [
              {
                name: 'submitCurrentSection',
                child: intl.get(`ssrc.common.view.button.submitCurrentSection`).d('提交当前标段'),
                btnProps: {
                  type: 'default',
                  loading,
                  disabled: wholeAbandonFlag || allPageDisabled,
                  onClick: () => submitQuotationSection('CURRENT'),
                },
                hidden: !isBidSectionData,
              },
              {
                name: 'submitAllSection',
                child: intl.get(`ssrc.common.view.button.submitAllSections`).d('提交全部标段'),
                btnProps: {
                  type: 'default',
                  loading,
                  disabled: wholeAbandonFlag || allPageDisabled,
                  onClick: () => submitQuotationSection('ALL'),
                },
                hidden: !isBidSectionData,
              },
              {
                name: 'submitPortionSection',
                btnComp: ApplyToSection,
                btnProps: {
                  type: 'default',
                  loading,
                  title: intl
                    .get(`ssrc.common.view.button.submitPortionBatchSection`)
                    .d('批量提交标段'),
                  submitQuotationSection,
                  types: 'PORTION',
                  getSectionListData,
                  disabled: wholeAbandonFlag || allPageDisabled,
                  getSectionItemProps: (sectionItem) => {
                    return {
                      disabled: ['QUOTATION_ABANDONED', 'ABANDONED'].includes(
                        sectionItem?.supplierStatus
                      ),
                    };
                  },
                },
                hidden: !isBidSectionData,
              },
            ],
          }
        : null,
    ].filter(Boolean);

    // 二开需要的参数 [ 'daqo' ]
    const otherProps = {
      ...(props || {}),
    };

    buttons = quotationRemote
      ? quotationRemote.process('SSRC_SUPPLIER_QUOTATION_NEW_HEADER_BUTTONS', buttons, otherProps)
      : buttons;

    return buttons;
  }, [
    props,
    quotationStatus,
    submitQuotationSection,
    getSectionListData,
    isBidSectionData,
    submitQuotation,
    getImportProps,
    quotationHeaderId,
    organizationId,
    bidFlag,
    beforePrint,
    refreshPage,
    projectLineSectionList?.length,
    judgeSectionDataNoEmpty,
    loading,
    quotationHeaderCurrentId,
    quotationRemote,
    wholeAbandonFlag,
    bargainStatus,
    handleWholeAbandon,
    quotationLineDS,
    saveQuotation,
    basicFormDS,
    allPageDisabled,
    needBidAnnouncement,
  ]);

  return basicFormDS?.length ? (
    <>
      {customizeBtnGroup(
        {
          code: getCustomizeUnitCode('buttons'),
          pro: true,
        },
        <DynamicButtons
          // trigger="click"
          // maxNum={7}
          buttons={getHeaderButtons()}
          defaultBtnType="c7n-pro"
        />
      )}
    </>
  ) : (
    ''
  );
};

export default observer(Buttons);
