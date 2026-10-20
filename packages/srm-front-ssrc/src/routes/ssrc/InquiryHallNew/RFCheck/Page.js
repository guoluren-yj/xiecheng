import React, { Fragment, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { Button, Modal, Lov, Icon, Table, Spin } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import querystring from 'querystring';
import { throttle } from 'lodash';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';

import {
  saveCheck,
  releaseCheck,
  checkConfirm,
  downloadSupplierInfo,
  queryPermissionStatus,
  releaseCreateRFP,
} from '@/services/rfService';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText } from '@/utils/utils';
import Store from './store/index';
import BasicInfo from './CardManage/BasicInfo';
import Supplier from './CardManage/Supplier';
import ItemLineDetail from './CardManage/ItemLineDetail';
import Attachment from './CardManage/Attachment';
import Card from '../rfComponents/Card';
import styles from '../rfComponents/common.less';
import style from './index.less';

const Index = () => {
  const {
    routerParams: { sourceCategory, rfHeaderId, organizationId },
    commonDs: {
      basicFormDs,
      supplierDs,
      rfqTemplateDs,
      rfpTemplateDs,
      exchangeRateDs,
      ItemLineDetailDs,
      ladderQuotationTableDs,
    },
    commonCode: { customizeUnitCode },
    history,
    customizeBtnGroup,
    remote,
  } = useContext(Store);

  /** ********* 【卓见】二开【报价方案行】卡片-勿动!!! *********** */
  const expandCardRef = useRef(); // 拓展卡片ref

  const [RFPbuttonPermission, setRFPButtonPermission] = useState(true);
  const [RFQbuttonPermission, setRFQButtonPermission] = useState(true);
  const [RFPCreateSourceRFPPermission, setRFPCreateSourceRFPPermission] = useState(true); // 发布并创建RFP-permission
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    queryDoubleUnit();
  }, []);

  useEffect(() => {
    ItemLineDetailDs.setQueryParameter('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setQueryParameter('doubleUnitFlag', doubleUnitFlag);
  }, [doubleUnitFlag]);

  const queryDoubleUnit = () => {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        setDoubleUnitFlag(!!Number(res));
      }
    });
  };

  // 保存
  const handleSave = async () => {
    await supplierDs.validate();
    await basicFormDs.validate();

    const expandDTO = remote
      ? remote.process(
          'SSRC_RF_CHECK_PROCESS_SAVE_EXPAND_DTO',
          {},
          {
            expandCardRef,
            sourceCategory,
            basicFormDs,
          }
        )
      : {};

    const params = {
      customizeUnitCode: customizeUnitCode.current,
      rfHeader: basicFormDs.current?.toData(),
      rfQuoHeaderList: supplierDs.toData(),
      ...(expandDTO || {}),
    };
    setPageLoading(true);
    return saveCheck(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && !res.failed) {
          notification.success();
          // 查询
          await Promise.all([basicFormDs.query(), supplierDs.query()]);
          if (remote?.event) {
            remote.event.fireEvent('remoteSaveUpdateCallBackEvent', {
              expandCardRef,
              sourceCategory,
              basicFormDs,
            });
          }
        }
      })
      .finally(() => setPageLoading(false));
  };

  // direction to list
  const pageDirectToList = () => {
    history.push({
      pathname: '/ssrc/new-inquiry-hall/list',
      search: querystring.stringify({
        sourceCategory,
      }),
    });
  };

  const submitSuccessCallBack = (data) => {
    const { createSourceId } = data || {};

    if (!createSourceId) {
      pageDirectToList();
      return;
    }

    if (data?.createSourceType === 'RFQ') {
      if (basicFormDs?.current?.get('sourceRequest') === 'OFFLINE_ENTER') {
        // 线下整单录入
        history.push({
          pathname: `/ssrc/new-inquiry-hall/whole-update/${data.createSourceId}`,
        });
        return;
      }
      history.push({
        pathname: `/ssrc/new-inquiry-hall/rfx-update-new/${data.createSourceId}`,
      });
    } else if (data?.createSourceType === 'RFP') {
      // 发布并创建RFP
      history.push({
        pathname: `/ssrc/new-inquiry-hall/rf-update/RFP/${data?.createSourceId}`,
      });
    } else {
      // 直接发布
      // 跳转
      pageDirectToList();
    }
  };

  // 第二步
  const onOk = (type, templateId) => {
    const expandDTO = remote
      ? remote.process(
          'SSRC_RF_CHECK_PROCESS_RELEASE_CONFIRM_EXPAND_DTO',
          {},
          {
            expandCardRef,
            sourceCategory,
            basicFormDs,
          }
        )
      : {};

    const checkParams = {
      customizeUnitCode: customizeUnitCode.current,
      rfHeader: {
        ...basicFormDs.current?.toData(),
        finishCreateSource: type,
        rfxTemplateId: type === 'RFQ' ? templateId : null,
        targetTemplateId: type === 'RFP' ? templateId : null,
      }, // 发布并创建标志
      rfQuoHeaderList: supplierDs.toData(),
      confirmFlag: 1,
      skipCheckFlag: 1,
      ...(expandDTO || {}),
    };
    return checkConfirm(checkParams).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        submitSuccessCallBack(result);
      }
    });
  };

  // 发布
  const handleRelease = async (type, templateId) => {
    const flag = (await supplierDs.validate()) && (await basicFormDs.validate());
    if (!flag) {
      notification.warning({
        message: intl
          .get('ssrc.rfCheck.view.rfCheck.inputSubmitRfCheck')
          .d('提交前请填写完整相关信息'),
      });
      return;
    }

    const expandDTO = remote
      ? remote.process(
          'SSRC_RF_CHECK_PROCESS_RELEASE_EXPAND_DTO',
          {},
          {
            expandCardRef,
            sourceCategory,
            basicFormDs,
          }
        )
      : {};
    const params = {
      customizeUnitCode: customizeUnitCode.current,
      rfHeader: {
        ...basicFormDs.current?.toData(),
        finishCreateSource: type,
        rfxTemplateId: type === 'RFQ' ? templateId : null,
        targetTemplateId: type === 'RFP' ? templateId : null,
      }, // 发布并创建标志
      rfQuoHeaderList: supplierDs.toData(),
      ...(expandDTO || {}),
    };

    if (remote && remote.event && remote.event.fireEvent) {
      const remoteFlag = await remote.event.fireEvent('remoteHandleReleaseValidate', {
        expandDTO,
        basicFormDs,
        sourceCategory,
      });
      if (!remoteFlag) return false;
    }

    // 第一步
    releaseCheck(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 校验通过
        if (result?.body === true) {
          notification.success();
          submitSuccessCallBack(result);
        } else if (result?.highestValidatorType === 'ERROR') {
          // 校验失败
          const { validateResults = [] } = result;

          const description = validateResults?.map?.((i, index) => {
            return <div>{`${index + 1}、${i.message}`}</div>;
          });

          notification.error({
            message: intl
              .get('ssrc.rfCheck.view.title.errorInfo')
              .d('提交失败，以下内容验证不通过'),
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
            title: intl
              .get('ssrc.rfCheck.view.title.warningInfo')
              .d('以下验证未通过，确认发布吗？'),
            children: description,
            onOk: () => onOk(type, templateId),
            onCancel: () => {},
          });
        }
      }
    });
  };

  // 发布 RFP/RFQ
  const handleReleaseRF = (type) => {
    let templateId;
    if (type === 'RFP') {
      // 单选 和 双击
      templateId =
        rfpTemplateDs.current?.getField('rfpTemplateLov')?.options?.current?.get('templateId') ||
        rfpTemplateDs.get(0)?.get('templateId');
    } else if (type === 'RFQ') {
      templateId =
        rfqTemplateDs.current?.getField('rfqTemplateLov')?.options?.current?.get('templateId') ||
        rfqTemplateDs.get(0)?.get('templateId');
    }
    if (templateId) {
      handleRelease(type, templateId);
    } else {
      // 没有模板，点弹框确定，不关闭弹框
      return false;
    }
  };

  const handlePermissionStatus = () => {
    // 当前页是否选择供应商
    // const isSupplierSelected = supplierDs.toData()?.some((i) => i.suggestedFlag);
    // setButtonPermission(true);

    const params = {
      customizeUnitCode: customizeUnitCode.current,
      rfHeader: basicFormDs.current?.toData(),
      rfQuoHeaderList: supplierDs.toData(),
    };

    queryPermissionStatus(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        const { rfpCreateSourceRFP = false } = result || {};
        setRFPButtonPermission(!result.createSourceRFP);
        setRFQButtonPermission(!result.createSourceRFQ);
        setRFPCreateSourceRFPPermission(!rfpCreateSourceRFP);
      }
    });
  };

  const validatePageAndGetData = async () => {
    let validateResult = false;
    const supplierResult = await supplierDs.validate();
    const baseResult = await basicFormDs.validate();
    validateResult = supplierResult && baseResult;

    return {
      customizeUnitCode: customizeUnitCode?.current,
      rfHeader: basicFormDs.current?.toData(),
      rfQuoHeaderList: supplierDs.toData(),
      validateResult,
    };
  };

  // RFP创建RFP 成功回调
  const creteRfpSuccessCallBack = (data) => {
    const { rfHeaderId: newId = null } = data || {};
    history.push({
      pathname: `/ssrc/new-inquiry-hall/rf-update/RFP/${newId}`,
    });
  };

  // RFP创建RFP 二次确认回调
  const rfpReleaseCreateRFPOk = () => {
    const expandDTO = remote
      ? remote.process(
          'SSRC_RF_CHECK_PROCESS_RELEASE_CREATE_RFP_CONFIRM_EXPAND_DTO',
          {},
          {
            expandCardRef,
            sourceCategory,
            basicFormDs,
          }
        )
      : {};

    const params = {
      rfHeaderId,
      organizationId,
      confirmFlag: 1,
      skipCheckFlag: 1,
      customizeUnitCode: customizeUnitCode?.current,
      rfHeader: basicFormDs.current?.toData(),
      rfQuoHeaderList: supplierDs.toData(),
      ...(expandDTO || {}),
    };
    return releaseCreateRFP(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        creteRfpSuccessCallBack(result);
      }
    });
  };

  // 发布并创建RFP
  const handleReleaseCreateRFP = throttle(async () => {
    const { validateResult = false, ...others } = await validatePageAndGetData();
    if (!validateResult) {
      return;
    }
    const expandDTO = remote
      ? remote.process(
          'SSRC_RF_CHECK_PROCESS_RELEASE_CREATE_RFP_EXPAND_DTO',
          {},
          {
            expandCardRef,
            sourceCategory,
            basicFormDs,
          }
        )
      : {};

    const createRFPParams = {
      rfHeaderId,
      organizationId,
      confirmFlag: 1,
      ...others,
      ...(expandDTO || {}),
    };
    releaseCreateRFP(createRFPParams).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 校验通过
        if (result?.rfHeaderId) {
          notification.success();
          creteRfpSuccessCallBack(result);
        } else if (result?.highestValidatorType === 'ERROR') {
          // 校验失败
          const { validateResults = [] } = result;

          const description = validateResults?.map?.((i, index) => {
            return <div>{`${index + 1}、${i.message}`}</div>;
          });

          notification.error({
            message: intl
              .get('ssrc.rfCheck.view.title.errorInfo')
              .d('提交失败，以下内容验证不通过'),
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
            title: intl
              .get('ssrc.rfCheck.view.title.warningInfo')
              .d('以下验证未通过，确认发布吗？'),
            children: description,
            onOk: () => rfpReleaseCreateRFPOk(),
            onCancel: () => {},
          });
        }
      }
    });
  }, 1400);

  // 汇率编辑
  const handleExchangeEdit = () => {
    exchangeRateDs.query();

    const columns = [
      {
        name: 'supplierCompanyName',
        width: 220,
      },
      {
        name: 'quotationCurrencyCode',
        width: 120,
      },
      {
        name: 'baseCurrencyCode',
        width: 120,
      },
      {
        name: 'exchangeRate',
        width: 120,
        editor: true,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.rfCheck.view.button.exchangeEdit').d('汇率编辑'),
      style: {
        width: 742,
      },
      drawer: true,
      closable: true,
      destroyOnClose: true,
      children: (
        <Table
          dataSet={exchangeRateDs}
          columns={columns}
          customizedCode="SSRC.INQUIRY_HALL.RF_CHECK.EXCHANGE_EDIT" // 用户个性化单元设置
          style={{
            maxHeight: 'calc(100vh - 200px)',
          }}
        />
      ),
      onOk: async () => {
        // submit中会走validate逻辑
        const res = await exchangeRateDs.submit();
        // 校验失败，阻止弹框关闭
        return res;
      },
      afterClose: () => {
        exchangeRateDs.loadData([]);
        basicFormDs.query();
        ItemLineDetailDs.query();
        supplierDs.query();
      },
    });
  };

  const getBackPath = useMemo(
    () => `/ssrc/new-inquiry-hall/list?sourceCategory=${sourceCategory}`,
    [sourceCategory]
  );

  // 渲染标题
  const Title = observer(({ ds }) => {
    const { current = {} } = ds || {};
    const title = current?.get?.('rfNum') ? `-${current?.get?.('rfNum')}` : '';
    return intl.get('ssrc.rfCheck.view.card.title.rfiUpdateTitle').d('确定供应商') + title;
  });

  // 供应商附件信息下载
  const handleSupDownload = async () => {
    setPageLoading(true);
    if (!rfHeaderId) return;
    try {
      const res = await downloadSupplierInfo({ rfHeaderId });
      if (getResponse(res)) {
        setPageLoading(false);
      }
    } catch (e) {
      throw e;
    }
  };

  const getButtons = useMemo(() => {
    const buttons = [
      {
        name: 'supInfoDownload',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'get_app',
          funcType: 'flat',
          onClick: handleSupDownload,
        },
        child: intl.get('ssrc.rfCheck.view.button.supInfoDownload').d('供应商附件下载'),
      },
      basicFormDs?.current?.get('multiCurrencyFlag') && {
        name: 'exchangeEdit',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: handleExchangeEdit,
        },
        child: intl.get('ssrc.rfCheck.view.button.exchangeEdit').d('汇率编辑'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          onClick: handleSave,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'publish',
        group: true,
        children: [
          {
            name: 'directRelease',
            btnType: 'c7n-pro',
            child: intl.get('ssrc.rfCheck.view.button.directRelease').d('直接发布'),
            btnProps: {
              onClick: () => handleRelease(),
            },
          },
          {
            name: 'releaseAndRFP',
            btnType: 'c7n-pro',
            btnProps:
              sourceCategory === 'RFP'
                ? {
                    onClick: handleReleaseCreateRFP,
                    disabled: RFPCreateSourceRFPPermission,
                  }
                : {
                    disabled: RFPbuttonPermission,
                  },
            child: (fieldName = '') =>
              sourceCategory === 'RFP' ? (
                intl.get('ssrc.rfCheck.view.button.releaseAndRFP').d('发布并创建RFP')
              ) : (
                <Lov
                  noCache
                  funcType="link"
                  mode="button"
                  clearButton={false}
                  dataSet={rfpTemplateDs}
                  name="rfpTemplateLov"
                  disabled={RFPbuttonPermission}
                  modalProps={{
                    onOk: () => handleReleaseRF('RFP'),
                    onDoubleClick: () => handleReleaseRF('RFP'),
                  }}
                >
                  <span className={RFPbuttonPermission ? style['menu-lov-button-disabled'] : null}>
                    {fieldName ||
                      intl.get('ssrc.rfCheck.view.button.releaseAndRFP').d('发布并创建RFP')}
                  </span>
                </Lov>
              ),
          },
          basicFormDs?.current?.get('sourceRequest') === 'OFFLINE_ENTER'
            ? {
                name: 'releaseAndRFQ',
                btnType: 'c7n-pro',
                btnProps: {
                  disabled: RFQbuttonPermission,
                  onClick: () => handleRelease('RFQ'),
                },
                child: (fieldName = '') =>
                  fieldName ||
                  intl.get('ssrc.rfCheck.view.button.releaseAndRFQ').d('发布并创建RFQ'),
              }
            : {
                name: 'releaseAndRFQ',
                btnType: 'c7n-pro',
                btnProps: {
                  disabled: RFQbuttonPermission,
                },
                child: (fieldName = '') => (
                  <Lov
                    noCache
                    funcType="link"
                    mode="button"
                    clearButton={false}
                    dataSet={rfqTemplateDs}
                    name="rfqTemplateLov"
                    disabled={RFQbuttonPermission}
                    modalProps={{
                      onOk: () => handleReleaseRF('RFQ'),
                      onDoubleClick: () => handleReleaseRF('RFQ'),
                    }}
                  >
                    <span
                      className={RFQbuttonPermission ? style['menu-lov-button-disabled'] : null}
                    >
                      {fieldName ||
                        intl.get('ssrc.rfCheck.view.button.releaseAndRFQ').d('发布并创建RFQ')}
                    </span>
                  </Lov>
                ),
              },
        ],
        child: (fieldName = '') => (
          <Button
            name="publish"
            icon="publish2"
            color="primary"
            onClick={handlePermissionStatus}
            loading={
              !basicFormDs?.current?.get('rfHeaderId') || !supplierDs.getState('isCancelLoading')
            }
          >
            {fieldName || intl.get('hzero.common.button.release').d('发布')}
            <Icon type="expand_more" style={{ marginTop: '-2px' }} />
          </Button>
        ),
      },
    ].filter(Boolean);

    if (!remote) return buttons;

    const remoteProps = {
      rfHeaderId,
      sourceCategory,
      expandCardRef,
      basicFormDs,
    };
    return remote.process('SSRC_RF_CHECK_PROCESS_HEADER_BUTTONS', buttons, remoteProps);
  }, [
    basicFormDs?.current?.get('multiCurrencyFlag'),
    sourceCategory,
    RFPCreateSourceRFPPermission,
    RFPbuttonPermission,
    RFQbuttonPermission,
    rfpTemplateDs,
    rfqTemplateDs,
    supplierDs.getState('isCancelLoading'),
    remote,
    rfHeaderId,
    expandCardRef,
    basicFormDs,
    basicFormDs?.current?.get('sourceRequest'),
  ]);

  const itemLineDetailProps = {
    doubleUnitFlag,
  };

  return (
    <Fragment>
      <Spin spinning={pageLoading} wrapperClassName={style['opening-height-wrapper']}>
        <Header title={<Title ds={basicFormDs} />} backPath={getBackPath}>
          {customizeBtnGroup(
            { code: `SSRC.INQUIRY_HALL.RF_CHECK.HEADER_BUTTONS_${sourceCategory}`, pro: true },
            <DynamicButtons buttons={getButtons} trigger="click" />
          )}
        </Header>
        {/* <Spin dataSet={basicFormDs}> */}
        <div className={classNames('rf-page-content-warp', styles['rf-page-content'])}>
          {/** to do 考虑通用卡片样式设置 */}
          <div className={styles['rf-card-content-wrapper']}>
            <Card
              title={intl.get('ssrc.rfCheck.view.card.title.basicInfos').d('基本信息')}
              component={<BasicInfo />}
            />
            <Card
              title={intl.get('ssrc.rfCheck.view.card.title.supplier').d('供应商')}
              component={<Supplier />}
            />
            {basicFormDs?.current?.get('lineItemsFlag') ? (
              <Card
                title={intl.get('ssrc.rfCheck.view.card.title.quotationDetail').d('报价明细')}
                component={<ItemLineDetail {...itemLineDetailProps} />}
              />
            ) : null}
            {remote
              ? remote.render('SSRC_RF_CHECK_RENDER_EXPAND_CARD', null, {
                  sourceCategory,
                  basicFormDs,
                  rfHeaderId,
                  onRef: expandCardRef,
                  rfItemLineDs: ItemLineDetailDs,
                })
              : null}
            <Card
              title={intl.get('ssrc.rfCheck.view.card.title.attachmentUuid').d('附件')}
              component={<Attachment />}
            />
            {/* <div className={styles['bottom-line']} /> */}
          </div>
        </div>
      </Spin>
    </Fragment>
  );
};

export default observer(Index);
