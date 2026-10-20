/**
 * 由于之前不合理的设计，还有历史包袱
 * 导致目前只能把报价单头和附件当作可以变更的数据源用于前后端交互
 * H-SASS-1599
 */

import React, { Fragment, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { Button, Modal, Form, TextArea, DataSet, Icon } from 'choerodon-ui/pro';
import classNames from 'classnames';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';
import { runInAction, autorun } from 'mobx';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { openTab } from 'utils/menuTab';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { TopSection } from '_components/Section';

import {
  saveSupplierReply,
  checkSupplierReply,
  releaseSupplierReply,
  checkSupplierParticipate,
  participate,
  abandon,
  fetchVersion,
} from '@/services/rfService';
import DynamicButtons from '_components/DynamicButtons';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText, fetchCurrentPrecision, amountCalcType } from '@/utils/utils';

import { StoreProvider, Store } from './store/index';
import BasicInfo from './CardManage/BasicInfo';
import RfItemLine from './CardManage/RfItemLine';
import ItemLineDetail from './CardManage/ItemLineDetail';
import Programme from './CardManage/Programme';
import SupplierProgramme from './CardManage/SupplierProgramme';
import Attachment from './CardManage/Attachment';
import PurchaseConcat from './CardManage/PurchaseConcat';
import ReplyHeader from './CardManage/ReplyHeader';
import Card from './rfComponent/Card';
import styles from './rfComponent/common.less';

const Page = observer(() => {
  const {
    routerParams: { sourceCategory, rfHeaderId, activeTabKey },
    ref: { attachementRef },
    commonDs: {
      basicFormDs,
      purchaseConcatDs,
      rfItemLineDs,
      attachementDs,
      supplierQuotationFormDs,
      rfFormDs,
    },
    storeData: { queryParams, detailFlag, participateFlag, noBackFlag },
    commonCode: { customizeUnitCode },
    history,
    customizeBtnGroup,
    remote,
    getHocInstance,
  } = useContext(Store);

  const lineRef = useRef(); // 行

  /** ********* 【卓见】二开【报价方案行】卡片-勿动!!! *********** */
  const expandCardRef = useRef(); // 拓展卡片ref

  const [validateObj, setValidateObj] = useState({
    // 卡片校验绿钩钩
    supplierReplyValidate: false,
    attachementValidate: false,
  });
  const [listPurchase, setListPurchase] = useState([]);
  const [participateLoading, setParticipateLoading] = useState(false);
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 双精度标志
  const [operationLoading, setOperationLoading] = useState(false); // 保存和发布按钮loading
  const [currencyPrecision, setCurrencyPrecision] = useState(null); // 手动查询的币种精度
  const [financialPrecision, setFinancialPrecision] = useState(null); // 手动查询的财务精度
  const [caclRule, setCaclRule] = useState(null); // 业务规则定义-金额计算方式

  // 大查询
  const fetchUpdate = () => {
    basicFormDs.query();
    supplierQuotationFormDs.query();
    rfFormDs.query();
    attachementDs.query();
    rfItemLineDs.query();
    if (remote?.event) {
      remote.event.fireEvent('remoteSaveUpdateCallBackEvent', {
        expandCardRef,
        sourceCategory,
        basicFormDs,
        participateFlag,
      });
    }
  };

  const validateFormRefFields = async (formRef = {}) => {
    const { fields = [] } = formRef || {};
    return Promise.all(fields?.map((i) => i.validate())).then((res) => {
      return res.every((item) => item);
    });
  };

  // 校验数据(ps: 保存返回完成率， 发布返回校验结果)
  const checkPage = async () => {
    // const rfItemLineCard = rfItemLineDs.validate() && !!rfItemLineDs.length;
    const basicFormValidate = await basicFormDs.validate(); // 采购方维护的基本信息，不需要绿钩钩校验
    const supplierReplyValidate = await supplierQuotationFormDs.validate();
    const attachementValidate = await validateFormRefFields(attachementRef?.current);
    const rfItemLineCardValidate =
      basicFormDs?.current?.get('lineItemsFlag') &&
      !participateFlag &&
      ['', 'BUSS'].includes(basicFormDs?.current?.get('evaluateShowType'))
        ? await rfItemLineDs.validate()
        : true;

    const validateList = [
      basicFormValidate,
      supplierReplyValidate,
      attachementValidate,
      rfItemLineCardValidate,
    ];

    const _list = remote
      ? remote.process('SSRC_SUPPLIER_RF_QUOTATION_PROCESS_CHECK_PAGE_LIST', validateList, {
          expandCardRef,
          sourceCategory,
          basicFormDs,
          participateFlag,
        })
      : validateList;

    const list = await _list;

    return Promise.all(list).then((res) => {
      // 此功能不生效 TODO
      const resObj = {};
      for (let index = 0; index < res.length; index++) {
        resObj[list[index]] = res[index];
      }
      setValidateObj({
        ...resObj,
      });
      return res.every((item) => item);
    });
  };

  // 获取保存、发布data
  const getData = () => {
    const expandDTO = remote
      ? remote.process(
          'SSRC_SUPPLIER_RF_QUOTATION_PROCESS_EXPAND_DTO',
          {},
          {
            expandCardRef,
            sourceCategory,
            basicFormDs,
            participateFlag,
          }
        )
      : {};

    return {
      rfQuotationHeader: {
        ...attachementDs?.current?.toData(),
        currencyCode: basicFormDs?.current?.get('currencyCode'),
      },
      quotationForm: { ...supplierQuotationFormDs?.current?.toData() },
      rfQuotationLines: rfItemLineDs.toData(),
      rfBaseHeader: { ...basicFormDs?.current?.toData() },
      ...(expandDTO || {}),
    };
  };

  // 保存 校验绿钩钩和保存数据(ps: 校验结果不影响保存操作)
  const handleSave = debounce(async () => {
    setOperationLoading(true);
    try {
      await checkPage();
      const data = getData();
      const params = {
        ...data,
        customizeUnitCode,
      };
      await saveSupplierReply(params).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          fetchUpdate();
        }
      });
    } catch (e) {
      throw e;
    } finally {
      setOperationLoading(false);
    }
  }, 500);

  const [versionList, setVersionList] = useState([]);

  const getVersion = async () => {
    await fetchVersion({
      quotationHeaderId: queryParams.quotationHeaderId,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        setVersionList(result);
      }
    });
  };

  useEffect(() => {
    getVersion();
    if (!participateFlag) {
      rfItemLineDs.query();
    }
    purchaseConcatDs.query().then((res) => {
      setListPurchase(res);
    });
  }, []);

  useEffect(() => {
    if (basicFormDs.current) {
      queryDoubleUnit();
      fetchCurrencyPrecision();
      initCalcType();
    }

    return () => {
      clearAllCaches();
    };
  }, [basicFormDs.current, chagenCurrencyDisposer]);

  const queryDoubleUnit = () => {
    queryEnableDoubleUnit({
      businessModule: 'RFX',
      tenantId: basicFormDs?.current?.get('tenantId'),
    }).then((res) => {
      if (isText(res)) {
        setDoubleUnitFlag(!!Number(res));
        rfItemLineDs.setState('doubleUnitFlag', !!Number(res));
      }
    });
  };

  // clear page all cache
  const clearAllCaches = () => {
    if (chagenCurrencyDisposer) {
      chagenCurrencyDisposer();
    }
  };

  const initCalcType = async () => {
    const tenantId = basicFormDs?.current?.get('tenantId');
    if (!tenantId) {
      return;
    }

    const data = {
      purTenantId: tenantId,
      organizationId: getCurrentOrganizationId(),
      supplierFlag: 1,
    };
    const result = (await amountCalcType(data)) || [];
    setCaclRule(result?.[0]);
  };

  // fetch precision
  const fetchCurrencyPrecision = async () => {
    const currencyCode = basicFormDs?.current?.get('currencyCode');
    const tenantId = basicFormDs?.current?.get('tenantId');

    if (!currencyCode) {
      return;
    }

    const Precisions = await fetchCurrentPrecision({
      currencyCodes: currencyCode,
      purTenantId: tenantId,
    });
    if (!Precisions) {
      return;
    }
    const { currency, financial } = Precisions || {};
    // 设置币种精度
    setCurrencyPrecision(currency);
    setFinancialPrecision(financial);
  };

  // const historyVersion = useMemo(() => {
  //   const menu = versionList.map(item => {
  //     return {
  //      name: `version${item.quotationVersion}`,
  //      btnType: 'c7n-pro',
  //      btnProps: {
  //       funcType: 'flat',
  //       onClick: () => linkTohistory(item),
  //     },
  //     child: `${intl.get('ssrc.rf.view.rf.version').d('版本')}${item.quotationVersion}`,
  //     };
  //   });
  //   return menu;
  // }, [versionList]);

  const linkTohistory = (item) => {
    const routerActiveTabKey = activeTabKey.split('/').slice(0, 3).join('/');
    openTab({
      key: `${routerActiveTabKey}/rf/detail/${sourceCategory}/${rfHeaderId}/${item.quotationHeaderVersionId}`,
      // title: `${`${intl.get('ssrc.rf.view.card.title.supliierReply').d('供应商回复')}-${intl
      //   .get('ssrc.rf.view.rf.version')
      //   .d('版本')}`}${item.quotationVersion}`,
      title: `${`${intl.get('srm.common.tab.title.ssrc.suplierReply').d('供应商回复')}-${intl
        .get('srm.common.tab.title.ssrc.version')
        .d('版本')}`}${item.quotationVersion}`,
      path: `${routerActiveTabKey}/rf/detail/${sourceCategory}/${rfHeaderId}/${item.quotationHeaderVersionId}`,
      search: querystring.stringify({
        quotationHeaderId: queryParams.quotationHeaderId,
        quotationHeaderVersionId: item.quotationHeaderVersionId,
        rfQuotationFormVersionId: item.rfQuotationFormVersionId,
      }),
      closable: true,
    });
  };

  // 第二步
  const onConfirm = () => {
    const data = getData();
    const params = {
      ...data,
      customizeUnitCode,
      confirmFlag: 1,
    };

    return releaseSupplierReply(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        history.push({
          pathname: `${activeTabKey}/list`,
        });
      }
    });
  };

  // 发布 校验数据和发布(ps: 校验结果影响发布)
  const handleRelease = debounce(async () => {
    setOperationLoading(true);
    const flag = await checkPage();
    if (!flag) {
      notification.warning({
        message: intl.get('ssrc.rf.view.rf.inputSubmitRfxUpdate').d('提交前请填写完整相关信息'),
      });
      setOperationLoading(false);
      return;
    }
    const data = getData();
    const params = {
      ...data,
      customizeUnitCode,
    };

    if (remote?.event) {
      const remoteFlag = await remote.event.fireEvent('remoteHandleReleaseValidate', {
        params,
        expandCardRef,
        sourceCategory,
        basicFormDs,
        participateFlag,
      });
      if (!remoteFlag) {
        setOperationLoading(false);
        return false;
      }
    }
    // 第一步
    checkSupplierReply(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          // 校验通过
          if (result?.body === true) {
            notification.success();
            history.push({
              pathname: `${activeTabKey}/list`,
            });
          } else if (result?.highestValidatorType === 'ERROR') {
            // 校验失败
            const { validateResults = [] } = result;

            const description = validateResults?.map?.((i, index) => {
              return <div>{`${index + 1}、${i.message}`}</div>;
            });

            notification.error({
              message: intl.get('ssrc.rf.view.title.errorInfo').d('提交失败，以下内容验证不通过'),
              description,
              duration: null,
            });
          } else if (result?.highestValidatorType === 'WARNING') {
            // 校验警告
            const { validateResults = [] } = result;

            const description = validateResults?.map?.((i, index) => {
              return <div>{`${index + 1}、${i.message}`}</div>;
            });

            Modal.confirm({
              title: intl.get('ssrc.rf.view.title.warningInfo').d('以下验证未通过，确认发布吗？'),
              children: description,
              onOk: () => onConfirm(),
              onCancel: () => {
                setOperationLoading(false);
              },
            });
          }
        }
      })
      .finally(() => {
        setOperationLoading(false);
      });
  }, 500);

  // 渲染标题
  const Title = observer(({ ds }) => {
    const { current = {} } = ds || {};
    const title = current?.get?.('rfNum') ? `-${current?.get?.('rfNum')}` : '';
    return intl.get('ssrc.rf.view.card.title.supliierReply').d('供应商回复') + title;
  });

  const Quotation = observer(({ ds }) => {
    const rfItemLineProps = {
      doubleUnitFlag,
      financialPrecision,
      currencyPrecision,
      caclRule,
      onRef: lineRef,
    };

    return (
      <Fragment>
        {ds?.current?.get('lineItemsFlag') &&
        !participateFlag &&
        ['', 'BUSS'].includes(ds?.current?.get('evaluateShowType')) ? (
          <Card
            title={intl.get('ssrc.rf.view.card.title.quotation').d('报价')}
            component={<RfItemLine {...rfItemLineProps} />}
            validateFlag={validateObj?.rfItemLineCardValidate}
          />
        ) : null}
      </Fragment>
    );
  });

  // 第二步
  const onParticipateConfirm = () => {
    const params = {
      ...basicFormDs?.current?.toData(),
      supplierCompanyId: queryParams.supplierCompanyId,
      customizeUnitCode: `SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_HEADER`,
      confirmFlag: 1,
    };

    return participate(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        setParticipateLoading(false);
        if (result?.backFlag) {
          // 有可能参与后还没有报价开始，所以只能先返回列表页
          history.push(`${activeTabKey}/list`);
        } else {
          history.push({
            pathname: `${activeTabKey}/reply/${sourceCategory}/${result.rfHeaderId}`,
            search: querystring.stringify({
              quotationHeaderId: result.quotationHeaderId,
            }),
          });
        }
      }
    });
  };

  // 发布 校验数据和发布(ps: 校验结果影响发布)
  const onParticipate = debounce(async () => {
    setParticipateLoading(true);
    const flag = await basicFormDs.validate();
    if (!flag) {
      notification.warning({
        message: intl
          .get('ssrc.rf.view.rf.inputParticipateRfxUpdate')
          .d('参与前请填写完整相关信息'),
      });
      setParticipateLoading(false);
      return;
    }

    const params = {
      ...basicFormDs?.current?.toData(),
      supplierCompanyId: queryParams.supplierCompanyId,
      customizeUnitCode: `SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_HEADER`,
    };

    // 第一步
    checkSupplierParticipate(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          // 校验通过
          if (result?.validFlag === true) {
            // 参与校验字段有变，非body
            notification.success();
            if (result?.backFlag) {
              // 有可能参与后还没有报价开始，所以只能先返回列表页
              history.push(`${activeTabKey}/list`);
            } else {
              history.push({
                pathname: `${activeTabKey}/reply/${sourceCategory}/${result.rfHeaderId}`,
                search: querystring.stringify({
                  quotationHeaderId: result.quotationHeaderId,
                }),
              });
            }
          } else if (result?.highestValidatorType === 'ERROR') {
            // 校验失败
            const { validateResults = [] } = result;

            const description = validateResults?.map?.((i, index) => {
              return <div>{`${index + 1}、${i.message}`}</div>;
            });

            notification.error({
              message: intl.get('ssrc.rf.view.title.errorInfo').d('提交失败，以下内容验证不通过'),
              description,
              duration: null,
            });
          } else if (result?.highestValidatorType === 'WARNING') {
            // 校验警告
            const { validateResults = [] } = result;

            const description = validateResults?.map?.((i, index) => {
              return <div>{`${index + 1}、${i.message}`}</div>;
            });

            Modal.confirm({
              title: intl.get('ssrc.rf.view.title.warningInfo').d('以下验证未通过，确认发布吗？'),
              children: description,
              onOk: () => onParticipateConfirm(),
              onCancel: () => {
                setParticipateLoading(false);
              },
            });
          }
        }
      })
      .finally(() => {
        setParticipateLoading(false);
      });
  }, 500);

  /**
   * 控制按钮是否可见
   * @param {*} props 展示的主体
   * @param {*} visibleFlag 按钮是否展示
   * @returns VNode
   */
  const visibleButton = (props, visibleFlag) => {
    if (visibleFlag) {
      return props;
    } else {
      return null;
    }
  };

  let chagenCurrencyDisposer = null;

  // change currency
  const changeCurrency = (data) => {
    const { currencyCode, defaultPrecision, financialPrecision: currentFinancialPrecision } =
      data || {};
    setCurrencyPrecision(currencyCode ? defaultPrecision : null);
    setFinancialPrecision(currencyCode ? currentFinancialPrecision : null);

    chagenCurrencyDisposer = autorun(
      () => {
        changeCurrencyReCalculateLine();
      },
      { delay: 200 }
    );
  };

  // after change currency
  const changeCurrencyReCalculateLine = () => {
    const { dynamicChangePrice } = lineRef?.current || {};
    if (!rfItemLineDs?.length || !dynamicChangePrice) {
      return;
    }

    runInAction(() => {
      rfItemLineDs.forEach((line) => {
        dynamicChangePrice(line);
      });
    });
  };

  const formDS = () => ({
    autoCreate: true,
    fields: [
      {
        name: 'abandonRemark',
        label: intl.get('ssrc.supplierQuotation.model.supQuo.giveUpReason').d('放弃理由'),
        required: true,
      },
    ],
  });
  const abandonDS = useMemo(() => new DataSet(formDS()), []);

  const onGiveUp = () => {
    const onOk = async () => {
      const validateRes = await abandonDS.validate();
      if (!validateRes) {
        return false;
      }
      const res = getResponse(
        await abandon({
          supplierCompanyId: queryParams.supplierCompanyId,
          rfHeaderId,
          abandonRemark: abandonDS.current.get('abandonRemark'),
        })
      );
      if (res) {
        history.push(`${activeTabKey}/list`);
      }
    };
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      title: intl.get(`ssrc.supplierQuotation.view.message.title.waiverOfQuotation`).d('放弃报价'),
      drawer: true,
      children: (
        <Form dataSet={abandonDS} labelLayout="float">
          <TextArea name="abandonRemark" resize rows={2} />
        </Form>
      ),
      style: { width: '380px' },
      onOk,
    });
  };

  const getBackPath = useMemo(() => {
    const { backRecommend } = queryParams || {};
    if (
      backRecommend === 'expertDetailToSupplierReplyDetail' ||
      backRecommend === 'recommend' ||
      backRecommend === 'rfDetail'
    ) {
      // if (JSON.parse(sessionStorage.getItem('sourceRouter'))?.current === 'newInquiryHall') {
      //   return null;
      // } // 跳转明细时判断是否从询价工作台跳转到专家评分到明细，如果是，则明细页backPath为null
      const key =
        backRecommend === 'recommend'
          ? `sourceRouter+${activeTabKey}`
          : `${backRecommend}+${activeTabKey}`;
      const backPack = JSON.parse(
        sessionStorage.getItem(key) || sessionStorage.getItem('sourceRouter') || '{}'
      ).url;
      return backPack || null;
    } else if (noBackFlag) {
      return null;
    }
    return `${activeTabKey}/list`;
  }, [queryParams, noBackFlag]);

  const getButtons = useMemo(() => {
    const importCode =
      sourceCategory === 'RFI'
        ? 'SSRC_RFI_QUOTATION_LINE_IMPORT'
        : 'SSRC_RFP_QUOTATION_LINE_IMPORT';

    const exportCode =
      sourceCategory === 'RFI'
        ? 'SRM_C_SRM_SSRC_RF_QUOTATION_HEADER_ONLINE_EXPORT'
        : 'SRM_C_SRM_SSRC_RFP_QUOTATION_HEADER_ONLINE_EXPORT';

    return [
      visibleButton(
        {
          name: 'import',
          btnComp: CommonImportNew,
          btnProps: {
            name: 'import',
            businessObjectTemplateCode: importCode,
            prefixPatch: SRM_SSRC,
            args: {
              tenantId: getCurrentOrganizationId(),
              rfHeaderId,
              quotationHeaderId: queryParams.quotationHeaderId,
              templateCode: importCode,
              fromExport: true,
            },
            buttonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
            },
            buttonText:
              sourceCategory === 'RFI'
                ? intl.get('ssrc.supplierQuotation.model.supQuo.button.import-rfi').d('RFI报价导入')
                : intl
                    .get('ssrc.supplierQuotation.model.supQuo.button.import-rfp')
                    .d('RFP报价导入'),
            auto: true,
            successCallBack: () => {
              rfItemLineDs.query();
            },
            customeImportTemplate: {
              templateCode: exportCode,
              requestUrl: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rf/quotation/rf/export`,
              queryParams: { quotationHeaderId: queryParams.quotationHeaderId },
              queryArea: { fillerType: 'multi-sheet', async: false },
            },
          },
        },
        !participateFlag && !detailFlag
      ),
      visibleButton(
        {
          name: 'responseHistory',
          group: true,
          children: versionList.map((item) => {
            return {
              name: `version${item.quotationVersion}`,
              btnProps: {
                funcType: 'flat',
                onClick: () => linkTohistory(item),
              },
              child: `${intl.get('ssrc.rf.view.rf.version').d('版本')}${item.quotationVersion}`,
            };
          }),
          child: (fieldName = '') => (
            <Button name="responseHistory" funcType="flat">
              <Icon
                type="schedule"
                style={{
                  marginTop: '-2px',
                  marginRight: '0.05rem',
                  fontWeight: '400',
                  fontSize: '.14rem',
                }}
              />
              {fieldName || intl.get('hzero.common.button.History').d('历史版本')}
              <Icon type="expand_more" style={{ marginTop: '-2px' }} />
            </Button>
          ),
        },
        !participateFlag && versionList.length
      ),
      visibleButton(
        {
          name: 'save',
          btnType: 'c7n-pro',
          btnProps: {
            loading: operationLoading,
            icon: 'save',
            funcType: 'flat',
            onClick: handleSave,
          },
          child: intl.get('hzero.common.button.save').d('保存'),
        },
        !participateFlag && !detailFlag
      ),
      visibleButton(
        {
          name: 'publish',
          btnType: 'c7n-pro',
          btnProps: {
            loading: operationLoading,
            icon: 'publish2',
            color: 'primary',
            onClick: handleRelease,
          },
          child: intl.get('hzero.common.button.release').d('发布'),
        },
        !participateFlag && !detailFlag
      ),
      visibleButton(
        {
          name: 'abandon',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'cancel',
            onClick: onGiveUp,
            funcType: 'flat',
          },
          child: intl.get(`ssrc.supplierQuotation.model.supQuo.abandon`).d('放弃'),
        },
        participateFlag && !detailFlag
      ),
      visibleButton(
        {
          name: 'participate',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'person_pin',
            color: 'primary',
            loading: participateLoading,
            onClick: onParticipate,
          },
          child: intl.get(`ssrc.supplierQuotation.view.message.button.participate`).d('参与'),
        },
        participateFlag && !detailFlag
      ),
    ].filter((item) => item !== null);
  }, [participateLoading, participateFlag, detailFlag, versionList, operationLoading]);

  const itemLineDetailProps = {
    doubleUnitFlag,
  };

  const basicFormProps = {
    changeCurrency,
  };

  const replyHeaderProps = {
    ds: attachementDs,
  };

  return (
    <Fragment>
      <Header title={<Title ds={basicFormDs} />} backPath={getBackPath}>
        {customizeBtnGroup(
          { code: `SSRC.SUPPLIER_REPLY_${sourceCategory}.HEADER_BUTTONS`, pro: true },
          <DynamicButtons buttons={getButtons} />
        )}
      </Header>
      <div className={classNames('rf-page-content-warp', styles['rf-page-content'])}>
        {/** to do 考虑通用卡片样式设置 */}
        <div className={styles['rf-card-content-wrapper']}>
          <TopSection
            getHocInstance={getHocInstance}
            code={`SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_HEADER_CARD`}
            title={intl.get('ssrc.rf.view.card.title.basicInfos').d('基本信息')}
            className={styles['rf-top-section-card-wrap']}
          >
            <BasicInfo ds={basicFormDs} {...basicFormProps} />
          </TopSection>
          {!participateFlag && !noBackFlag ? (
            <TopSection
              getHocInstance={getHocInstance}
              code={`SSRC.SUPPLIER_REPLY_${sourceCategory}.REPLY_HEADER_CARD`}
              title={intl.get('ssrc.rf.view.card.title.supplierReplyHeader').d('供应商回复头')}
              className={styles['rf-top-section-card-wrap']}
            >
              <ReplyHeader {...replyHeaderProps} />
            </TopSection>
          ) : (
            ''
          )}
          {listPurchase && listPurchase.length ? (
            <Card
              title={intl.get('ssrc.rf.view.card.title.purchase.concat').d('采购联系人')}
              component={<PurchaseConcat list={listPurchase} />}
            />
          ) : null}
          <Card
            title={
              sourceCategory === 'RFP'
                ? intl.get('ssrc.rf.view.card.title.programmeDescribe').d('方案邀请说明')
                : intl.get('ssrc.rf.view.card.title.inquiryContent').d('征询内容')
            }
            component={<Programme />}
          />
          {basicFormDs?.current?.get('lineItemsFlag') && participateFlag ? (
            <Card
              title={intl.get('ssrc.rfDetail.view.card.title.item').d('标的物')}
              component={<ItemLineDetail {...itemLineDetailProps} />}
            />
          ) : null}
          <Quotation ds={basicFormDs} />
          {remote
            ? remote.render('SSRC_SUPPLIER_RF_QUOTATION_RENDER_EXPAND_CARD', null, {
                sourceCategory,
                basicFormDs,
                participateFlag,
                rfItemLineDs,
                detailFlag,
                noBackFlag,
                rfHeaderId,
                quotationHeaderId: queryParams.quotationHeaderId,
                quotationHeaderVersionId: queryParams.quotationHeaderVersionId,
                onRef: expandCardRef,
              })
            : null}
          {!participateFlag && (
            <Card
              title={
                sourceCategory === 'RFP'
                  ? intl.get('ssrc.rf.view.card.title.supplierPlan').d('供应商方案')
                  : intl.get('ssrc.rf.view.card.title.supliierReply').d('供应商回复')
              }
              component={<SupplierProgramme />}
              validateFlag={validateObj?.supplierReplyValidate}
            />
          )}
          {!participateFlag && (
            <Card
              title={intl.get('ssrc.rf.view.card.title.attachmentUuid').d('附件')}
              component={<Attachment />}
              validateFlag={validateObj?.attachementValidate}
            />
          )}
        </div>
      </div>
    </Fragment>
  );
});

// 所有功能组件都是StoreProvider的子组件 所以context能传递到任何子组件
const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

export default Index;
