/*
 * @Description: file content
 * @Date: 2022-02-09 16:09:54
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useContext, useMemo } from 'react';
import { Select, Lov, TextArea } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import { Store } from '../Detail/StoreProvider';
import EditorForm from '@/routes/Components/EditorForm';
import { collectStrs } from '../../../utils/utils';

export default () => {
  const {
    updateFlag,
    readOnlyFlag,
    customizeForm,
    settleHeaderDs,
    directInvoicingType,
  } = useContext(Store);

  const platformFlag = directInvoicingType === 'INVOICE_PLATFORM';

  // 【开票类型】= 【电商】
  const ecFlag = directInvoicingType === 'EC';

  const commonCustomizeOptions = useMemo(() => {
    return { readOnly: readOnlyFlag };
  }, [readOnlyFlag]);

  // 注意，组件上写disabled:true，个性化配置编辑不生效，组件上的disabled优先级最高!!!
  // 把diabled放到ds里面去控制
  const basicColumns = useMemo(() => {
    return [
      'directInvoicingTypeMeaning', // 就算配了个性化为编辑，页面上也只能禁用
      platformFlag
        ? { name: 'sdimInvoiceType', editor: Select }
        : { name: 'invoiceType', editor: Select },
      ecFlag && { name: 'invoiceMethodMeaning' },
      ecFlag && { name: 'invoiceContent' },
      ecFlag && { name: 'invoiceContentDetail' },
      platformFlag && { name: 'sdimPreviewFlag', editor: Select },
    ];
  }, [platformFlag, ecFlag]);

  const buyerColumns = useMemo(() => {
    return [
      { name: 'sdimPurCompanyLov', editor: Lov },
      { name: 'purchaserTaxNumber' },
      {
        name: 'sdimPurAddrAndPhone',
        renderer: ({ record }) => {
          const { sdimPurAddress, sdimPurTelephone } = record.get([
            'sdimPurAddress',
            'sdimPurTelephone',
          ]);
          return collectStrs(sdimPurAddress, sdimPurTelephone);
        },
      },
      {
        name: 'sdimPurBankAccountAndName',
        renderer: ({ record }) => {
          const { sdimPurBankAccount, sdimPurBankName } = record.get([
            'sdimPurBankAccount',
            'sdimPurBankName',
          ]);
          return collectStrs(sdimPurBankName, sdimPurBankAccount);
        },
      },
      platformFlag && { name: 'sdimPurCompanyType', editor: Select },
    ];
  }, [platformFlag]);

  const sellerColumns = useMemo(() => {
    return [
      { name: 'saleCompanyLov', editor: Lov },
      { name: 'supplierTaxRegistrationNumber' },
      {
        name: 'sdimSupAddrAndPhone',
        renderer: ({ record }) => {
          const { sdimSupAddress, sdimSupTelephone } = record.get([
            'sdimSupAddress',
            'sdimSupTelephone',
          ]);
          return collectStrs(sdimSupAddress, sdimSupTelephone);
        },
      },
      {
        name: 'sdimSupBankNameAndAccount',
        renderer: ({ record }) => {
          const { sdimSupBankName, sdimSupBankAccount } = record.get([
            'sdimSupBankName',
            'sdimSupBankAccount',
          ]);
          return collectStrs(sdimSupBankName, sdimSupBankAccount);
        },
      },
      { name: 'sdimSupCompanyType', editor: Select },
    ];
  }, []);

  const ticketColumns = useMemo(() => {
    return platformFlag
      ? [
          { name: 'sdimReceiver' },
          { name: 'sdimRecipientPhone' },
          { name: 'sdimReceiverMail' },
          { name: 'sdimRecipientAddress' },
        ]
      : ecFlag
      ? [
          { name: 'contactName' },
          { name: 'mobile' },
          { name: 'regionLov', editor: Lov },
          { name: 'address' },
        ]
      : [];
  }, [platformFlag, ecFlag]);

  const otherColumns = useMemo(() => {
    return [{ name: 'invoiceFailMsg', editor: TextArea }];
  }, []);

  const cardList = useMemo(() => {
    return [
      {
        key: 'basic',
        title: intl.get(`ssta.purchaseSettle.view.message.panel.baseInfos`).d('基本信息'),
        editorColumns: basicColumns,
        customizeOptions: {
          ...commonCustomizeOptions,
          code: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.BASIC',
        },
      },
      {
        key: 'buyer',
        title: intl.get(`ssta.purchaseSettle.view.message.panel.purchaseInfos`).d('购方信息'),
        editorColumns: buyerColumns,
        customizeOptions: {
          ...commonCustomizeOptions,
          code: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.BUYER',
        },
      },
      {
        key: 'seller',
        title: intl.get(`ssta.purchaseSettle.view.message.panel.supplyInfos`).d('销方信息'),
        editorColumns: sellerColumns,
        customizeOptions: {
          ...commonCustomizeOptions,
          code: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.SELLER',
        },
      },
      {
        key: 'ticket',
        title: intl.get(`ssta.purchaseSettle.view.message.panel.ticketInfos`).d('纸票收件人信息'),
        editorColumns: ticketColumns,
        customizeOptions: {
          ...commonCustomizeOptions,
          code: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.TICKET',
        },
      },
      // {
      //   key: 'other',
      //   title: intl.get(`ssta.purchaseSettle.view.message.panel.otherInfos`).d('其他信息'),
      //   editorColumns: otherColumns,
      //   customizeOptions: {
      //     ...commonCustomizeOptions,
      //     code: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO.OTHER',
      //   },
      // },
    ];
  }, [
    basicColumns,
    buyerColumns,
    sellerColumns,
    ticketColumns,
    otherColumns,
    commonCustomizeOptions,
  ]);

  return (
    <Fragment>
      {cardList.map((item) => {
        const { key, title, editorColumns, customizeOptions } = item;
        return (
          <Card key={key} bordered={false} className={DETAIL_CARD_CLASSNAME} title={title}>
            <EditorForm
              useWidthPercent
              columns={3}
              useColon={false}
              editorFlag={updateFlag}
              dataSet={settleHeaderDs}
              editorColumns={editorColumns}
              customizeForm={customizeForm}
              customizeOptions={customizeOptions}
            />
          </Card>
        );
      })}
    </Fragment>
  );
};
