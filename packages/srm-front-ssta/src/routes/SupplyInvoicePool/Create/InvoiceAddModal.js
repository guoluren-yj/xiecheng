/*
 * @Description: file content
 * @Date: 2022-12-2 13:18:10
 * @Author: xie.yan <yan.xie@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { isArray, isUndefined } from 'lodash';
import { Steps, Alert } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { newList, editList, getConfig, getInvoiceConfig } from '@/services/invoicePurPoolService';
import commonStyles from '@/routes/common.less';
import InvoiceHeaderAdd from './Components/InvoiceHeaderAdd';
import InvoiceLineAdd from './Components/InvoiceLineAdd';
import { newLineDs, newDs } from '../newDS';
import styles from '../Create/index.less';

const { Step } = Steps;

const lineUnitCodes = {
  add: 'SSTA.SUPINVOICE_POOL_LIST.LINE_CREATE',
  edit: 'SSTA.SUPINVOICE_POOL_LIST.HEAD_EDIT.LINE_CREATE',
};
const headUnitCodes = {
  add: 'SSTA.SUPINVOICE_POOL_LIST.HANDLE_CREATE',
  edit: 'SSTA.SUPINVOICE_POOL_LIST.HANDLE_EDIT',
};

export default observer((props) => {
  // const headerAddDS = useMemo(() => new DataSet(newDs()), []);
  const {
    customizeForm,
    customizeTable,
    modal,
    type,
    showModal,
    handleUpdateNew,
    recordData,
    computeDateProps,
    remote,
  } = props;

  const [enableTaxInvoiceLineCreateFlag, setEnableTaxInvoiceLineCreateFlag] = useState(true);
  const headerAddDS = useDataSet(() => newDs(headUnitCodes[type]), [type]);
  const invoiceLineAddDS = useDataSet(() => newLineDs(lineUnitCodes[type]), [type]);

  useEffect(() => {
    // 获取发票号码，发票代码的配置信息
    getInvoiceConfig().then((res) => {
      if (getResponse(res)) {
        headerAddDS.setState('invoiceConfigMap', res);
      }
    });
  }, [headerAddDS]);

  useEffect(() => {
    if (type === 'edit') {
      const { invoiceHeaderId } = recordData;
      headerAddDS.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
      headerAddDS.query().then((res) => {
        if (res) {
          // 编辑进来，1.校验
          computeDateProps(headerAddDS?.current);
        }
      });
      // 2.查询行接口
      invoiceLineAddDS.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
      invoiceLineAddDS.query().then(() => {
        headerAddDS.setState('isDisabled', Boolean(invoiceLineAddDS.length));
      });
    } else {
      headerAddDS.create({});
    }
    // 查询业务规则定义，判断是否显示行
    getConfig().then((res) => {
      if (getResponse(res)) {
        const { enableTaxInvoiceLineCreateFlag: newEnableTaxInvoiceLineCreateFlag } = res || {};
        setEnableTaxInvoiceLineCreateFlag(newEnableTaxInvoiceLineCreateFlag);
      }
    });
  }, [headerAddDS, recordData, computeDateProps, invoiceLineAddDS, type]);

  useEffect(() => {
    headerAddDS.addEventListener('update', handleUpdateNew);
    return () => {
      headerAddDS.removeEventListener('update', handleUpdateNew);
    };
  }, [handleUpdateNew, headerAddDS]);

  const handlePrev = useCallback(async () => {
    const stepCurrent = headerAddDS.getState('stepCurrent') || 0;
    // 保存行数据
    invoiceLineAddDS.dataToJSON = 'all';
    const res = await invoiceLineAddDS
      .setState('headInfo', {
        ...(headerAddDS.current?.toData() || {}),
        camp: 'SUPPLIER',
      })
      .submit();
    invoiceLineAddDS.dataToJSON = 'dirty';
    if (!isUndefined(res) && !res) return;
    // 查询头数据
    const invoiceHeaderId = headerAddDS?.current?.get('invoiceHeaderId');
    if (invoiceHeaderId) {
      // 新增和编辑的上一步
      headerAddDS.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
      await headerAddDS.query();
      computeDateProps(headerAddDS?.current);
      // 行上有数据时，头上的【不含税金额】【税额】禁用
      headerAddDS.setState('isDisabled', Boolean(invoiceLineAddDS.length));
      headerAddDS.setState('stepCurrent', stepCurrent - 1);
    }
  }, [headerAddDS, invoiceLineAddDS, computeDateProps]);

  const handleNext = useCallback(async () => {
    const stepCurrent = headerAddDS.getState('stepCurrent') || 0;
    const res = await handleHeadInfo();
    if (res) {
      const datas = isArray(res) ? res : [res];
      headerAddDS.loadData(datas);
      // 获取行信息
      const newInvoiceHeaderId = headerAddDS?.current?.get('invoiceHeaderId');
      if (type === 'add' && newInvoiceHeaderId) {
        // 新增的时候重新去查行
        invoiceLineAddDS.setQueryParameter('invoiceHeaderId', newInvoiceHeaderId);
        await invoiceLineAddDS.query();
      }
      // 头信息保存成功,下一步
      headerAddDS.setState('stepCurrent', stepCurrent + 1);
    }

    //   },
  }, [headerAddDS, invoiceLineAddDS, type, handleHeadInfo]);

  const handleHeadInfo = useCallback(async () => {
    if (!headerAddDS.current) {
      notification.error({
        message: intl.get(`ssta.invoiceSheet.view.button.validateError`).d('字段校验不通过'),
      });
      return false;
    }
    const validateFlag = await headerAddDS.validate();
    const data = { ...(headerAddDS.current?.toData() || {}), camp: 'SUPPLIER' };
    const { invoiceHeaderId } = data;
    if (validateFlag) {
      const res = invoiceHeaderId
        ? await editList(data, headUnitCodes[type])
        : await newList(data, headUnitCodes[type]);
      if (res?.failed) {
        notification.error({
          message: res.message,
        });
        return false;
      }
      return res;
    } else {
      notification.error({
        message: intl.get(`ssta.invoiceSheet.view.button.validateError`).d('字段校验不通过'),
      });
      return false;
    }
  }, [headerAddDS, type]);

  const handleSave = useCallback(
    async (source) => {
      if (source === 'head') {
        const res = await handleHeadInfo();
        if (res) {
          modal.close();
        }
      } else {
        invoiceLineAddDS.dataToJSON = 'all';
        const res = await invoiceLineAddDS
          .setState('headInfo', { ...(headerAddDS?.current?.toData() || {}), camp: 'SUPPLIER' })
          .submit();
        invoiceLineAddDS.dataToJSON = 'dirty';
        if (res || invoiceLineAddDS.length === 0) {
          modal.close();
        }
      }
    },
    [modal, invoiceLineAddDS, handleHeadInfo, headerAddDS]
  );

  const stepList = useMemo(() => {
    const okBtn = (props) => {
      const { source } = props;
      return {
        name: 'confirm',
        child: intl.get('hzero.common.button.confirm').d('确定'),
        btnProps: {
          onClick: () => handleSave(source),
          color: 'primary',
        },
      };
    };
    const cancelBtn = {
      name: 'cancel',
      child: intl.get('hzero.common.button.cancel').d('取消'),
      btnProps: {
        onClick: () => modal.close(),
      },
    };

    const prevBtn = {
      name: 'prevStep',
      child: intl.get(`ssta.common.button.prevStep`).d('上一步'),
      btnProps: {
        onClick: handlePrev,
      },
    };
    const nextBtn = (props) => {
      const { btnText = intl.get(`ssta.common.button.nextStep`).d('下一步'), ...btnPorps } = props;
      return {
        name: 'nextStep',
        child: btnText,
        btnProps: {
          // color: 'primary',
          ...btnPorps,
          onClick: handleNext,
        },
      };
    };
    return [
      {
        title: intl.get('ssta.invoiceSheet.view.title.invoiceHeader').d('发票头'),
        name: 'INVOICE_HEADER',
        content: (
          <InvoiceHeaderAdd
            headerAddDS={headerAddDS}
            customizeForm={customizeForm}
            customizeCode={headUnitCodes[type]}
            showModal={showModal}
            remote={remote}
          />
        ),
        footerBtns: [
          okBtn({ source: 'head' }),
          Boolean(enableTaxInvoiceLineCreateFlag) && nextBtn({}),
          cancelBtn,
        ],
      },
      Boolean(enableTaxInvoiceLineCreateFlag) && {
        title: intl.get('ssta.invoiceSheet.view.title.invoiceLine').d('发票行'),
        name: 'INVOICE_LINE',
        content: (
          <InvoiceLineAdd
            invoiceLineAddDS={invoiceLineAddDS}
            customizeTable={customizeTable}
            customizeCode={lineUnitCodes[type]}
            headerAddDS={headerAddDS}
          />
        ),
        footerBtns: [okBtn({ source: 'line' }), prevBtn, cancelBtn],
      },
    ].filter((item) => item);
  }, [
    customizeForm,
    customizeTable,
    handleNext,
    handlePrev,
    handleSave,
    headerAddDS,
    modal,
    invoiceLineAddDS,
    showModal,
    type,
    enableTaxInvoiceLineCreateFlag,
  ]);

  const stepCurrent = headerAddDS.getState('stepCurrent') || 0;

  return (
    <div className={styles['create-steps-wrapper']}>
      {Boolean(enableTaxInvoiceLineCreateFlag) && (
        <Steps
          current={stepCurrent}
          size="small"
          style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #f5f5f5' }}
        >
          {stepList.map(({ title, name }) => (
            <Step title={title} key={name} />
          ))}
        </Steps>
      )}
      {stepCurrent === 0 && Boolean(enableTaxInvoiceLineCreateFlag) && (
        <Alert
          message={intl
            .get('ssta.invoiceSheet.view.title.invoiceWarningInfo')
            .d('若不需要录入发票行，直接点击【确认】即可')}
          type="info"
          closable
          className={commonStyles['ssta-alert-info']}
        />
      )}
      <div className="create-steps-content">{stepList[stepCurrent]?.content}</div>
      <div className="ssta-body-footer">
        <DynamicButtons defaultBtnType="c7n-pro" buttons={stepList[stepCurrent]?.footerBtns} />
      </div>
    </div>
  );
});
