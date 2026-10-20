import React from 'react';
import { Icon, Modal, Form, Lov, Output } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { isEmpty, noop } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import { saveSupplierBiddingCurrentHeader } from '@/services/biddingHallService';
import FileGroup from '@/routes/ssrc/RFSupplierQuotation/Quotation/Modals/FileGroup';
import Styles from '../index.less';

const SupplierHeaderBaseInfoOpenModal = async (m = {}) => {
  const {
    headerInfo,
    disabledAllFields,
    // getCustomizeUnitCode,
    afterSaveBaseInfoFetchHeader,
    customizeForm = noop,
    headerBasicInfoDS,
    headerBasicInfoDetailDS,
    fetchBasicInfoHeader = noop,
    getBasicInfoCustomizeCode = noop,
    beforeOpenHeaderBaseInfoModal,
    afterCloseHeaderBaseInfoModal,
    remote,
  } = m || {};

  const editorFlag = disabledAllFields !== 1;

  if (!headerBasicInfoDS && !headerBasicInfoDetailDS) {
    return;
  }

  headerBasicInfoDS.setState('disabledAllFieldsFlag', 0);
  headerBasicInfoDetailDS.setState('disabledAllFieldsFlag', 1);

  const { biddingSupHeaderCurId } = headerInfo || {};

  const organizationId = getCurrentOrganizationId();

  const fetchHeader = async () => {
    if (!biddingSupHeaderCurId) {
      return;
    }

    if (fetchBasicInfoHeader) {
      fetchBasicInfoHeader();
    }
  };

  const getCurrentDS = () => {
    return editorFlag ? headerBasicInfoDS : headerBasicInfoDetailDS;
  };

  let loading = false;

  const toggleLoading = (value = false) => {
    loading = value;
  };

  const getCurrentCode = () => {
    const code = getBasicInfoCustomizeCode();
    return code;
  };

  /**
   * 写入表单只读控制字段
   * 编辑，只读用一套逻辑
   */
  // const updateDisabledSymbol = () => {
  //   const { current } = headerBasicInfoDS || {};
  //   if (!current) {
  //     return;
  //   }
  //   current.set('disabledAllFields', disabledAllFields);
  // };

  const handleModalClose = async () => {
    const ds = getCurrentDS();
    ds.reset();
    ds.loadData([]);

    if (afterCloseHeaderBaseInfoModal) {
      afterCloseHeaderBaseInfoModal();
    }
  };

  // const getCustomizeCode = () => {
  //   let codeName = 'headerModalBaseInfoForm';
  //   if (disabledAllFields) {
  //     codeName = 'headerModalBaseInfoFormDetail';
  //   }

  //   const code = getCustomizeUnitCode(codeName);
  //   return code;
  // };

  const validateAndReconizationData = async () => {
    const { current } = headerBasicInfoDS || {};
    if (!current || !biddingSupHeaderCurId) {
      return;
    }

    const validateFlag = await headerBasicInfoDS.validate();
    const data = current.toData();
    if (isEmpty(data)) {
      return;
    }

    return {
      validateFlag,
      data,
      organizationId,
      querys: {
        customizeUnitCode: getCurrentCode(),
      },
    };
  };

  const handleOk = async () => {
    const { validateFlag, data, ...others } = (await validateAndReconizationData()) || {};

    if (!validateFlag || disabledAllFields === 1 || loading) {
      return false;
    }

    const params = {
      data,
      ...others,
    };

    const baseInfoModalSave = async () => {
      let result = null;
      toggleLoading(true);
      try {
        result = await saveSupplierBiddingCurrentHeader(params);
        const res = getResponse(result);
        toggleLoading(false);

        if (res) {
          notification.success();
          if (afterSaveBaseInfoFetchHeader) {
            await afterSaveBaseInfoFetchHeader();
          }
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      } catch (e) {
        throw e;
      }
    };

    let finallyResult = null;
    if (remote?.event) {
      const eventProps = {
        pageProps: m,
        baseInfoModalSave,
        saveSupplierBiddingCurrentHeader,
        params,
        validateAndReconizationData,
      };
      finallyResult = await remote.event.fireEvent('baseInfoModalHandleOk', eventProps);
      return finallyResult;
    } else {
      finallyResult = await baseInfoModalSave();
      return finallyResult;
    }
  };

  const getFormFields = () => {
    const fields = [
      <Lov name="paymentTypeId" />,
      <Lov name="paymentTermId" />,
      <Output name="companyNameUuid" renderer={() => <FileGroup basicFormDS={getCurrentDS()} />} />,
      <Output name="currencyCode" />,
    ];
    return fields;
  };

  const renderForm = () => {
    const { fieldsRequiredFlag } = headerInfo || {};
    const ds = getCurrentDS();

    return (
      <Spin spinning={loading}>
        {fieldsRequiredFlag === 1 && disabledAllFields !== 1 ? (
          <div
            style={{
              margin: '-20px -20px 20px',
              background: 'rgb(230, 242, 253)',
              padding: '10px 24px',
              fontSize: '13px',
              color: 'rgb(48, 145, 242)',
            }}
          >
            <Icon type="icon icon-help" />
            <span style={{ marginLeft: '4px' }}>
              {intl.get('ssrc.common.view.required.pleaseInputFirst').d('请先填写必输信息')}
            </span>
          </div>
        ) : (
          ''
        )}

        <div className={Styles['ssrc-bidding-hall-header-form-modal-wrapper']}>
          {customizeForm(
            {
              code: getCurrentCode(),
              dataSet: ds,
            },
            <Form dataSet={ds} labelLayout="float" columns={1}>
              {getFormFields()}
            </Form>
          )}
        </div>
      </Spin>
    );
  };

  await fetchHeader();

  // 打开弹窗
  if (beforeOpenHeaderBaseInfoModal) {
    beforeOpenHeaderBaseInfoModal();
  }

  const modal = await Modal.open({
    key: Modal.key(),
    title: intl.get('ssrc.common.view.message.basicInfos').d('基础信息'),
    children: renderForm(),
    style: { width: '390px' },
    drawer: true,
    closable: true,
    destroyed: true,
    okButton: editorFlag,
    onOk: handleOk,
    onClose: handleModalClose,
    okProps: {
      loading,
    },
    cancelProps: {
      color: editorFlag ? 'default' : 'primary',
    },
    cancelText: editorFlag
      ? intl.get('hzero.common.button.cancel').d('取消')
      : intl.get('hzero.common.button.close').d('关闭'),
  });

  return modal;
};

export { SupplierHeaderBaseInfoOpenModal };
