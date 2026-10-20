import React, { useMemo, useContext, useEffect } from 'react';
import { Table, Modal, Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
// import { FIlESIZE } from '@/utils/SsrcRegx';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

import Store from '../../store/index';
import styles from '../../../rfComponents/common.less';
import Style from './index.less';

// const organizationId = getCurrentOrganizationId();

export default observer(function ItemLineDetail(props) {
  const { doubleUnitFlag } = props;
  const {
    routerParams: { sourceCategory },
    commonDs: { ItemLineDetailDs, checkLadderQuotationTableDs, checkPendingBasicFormDs },
    customizeTable,
  } = useContext(Store);

  useEffect(() => {
    ItemLineDetailDs.query();
  }, []);

  const showLadderQuotation = (record) => {
    checkLadderQuotationTableDs.setQueryParameter('quotationLineId', record.get('quotationLineId'));
    checkLadderQuotationTableDs.query();

    const columns = [
      {
        name: 'rfLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 120,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryLadderTo',
            width: 120,
          }
        : null,
      {
        name: 'ladderFrom',
        width: 120,
      },
      {
        name: 'ladderTo',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'validLadderSecondaryPrice',
            width: 150,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetLadderSecPrice',
            width: 150,
          }
        : null,
      {
        name: 'validLadderPrice',
        width: 150,
      },
      {
        name: 'validNetLadderPrice',
        width: 150,
      },
      {
        name: 'remark',
        width: 120,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      footer: (_, cancelBtn) => cancelBtn,
      closable: true,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      okButton: false,
      cancelProps: {
        color: 'primary',
      },
      className: styles['rf-ladder-quotation-modal-wrapper'],
      children: (
        <React.Fragment>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rfDetail.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          <Form
            labelLayout="vertical"
            columns={2}
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output
              label={intl.get('ssrc.rfDetail.model.rfDetail.itemCode').d('物料编码')}
              value={record.get('itemCode')}
            />
            <Output
              label={intl.get('ssrc.rfDetail.model.rfDetail.itemName').d('物料名称')}
              value={record.get('itemName')}
            />
          </Form>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rfDetail.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          <Table
            dataSet={checkLadderQuotationTableDs}
            columns={columns}
            customizable
            style={{ maxHeight: 'calc(100vh - 250px)' }}
            customizedCode="SSRC.INQUIRY_HALL.RF_DETAIL.CHECK_PENDING.LINE_LADDER_QUOTATION"
          />
        </React.Fragment>
      ),
      afterClose: () => {
        checkLadderQuotationTableDs.loadData([]);
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      checkPendingBasicFormDs?.current?.get('subjectMatterRule') === 'PACK'
        ? {
            name: 'sectionCode',
            width: 120,
          }
        : null,
      checkPendingBasicFormDs?.current?.get('subjectMatterRule') === 'PACK'
        ? {
            name: 'sectionName',
            width: 120,
          }
        : null,
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 120,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
            width: 120,
          }
        : null,
      {
        name: 'validQuotationPrice',
        width: 120,
      },
      {
        name: 'validNetPrice',
        width: 120,
      },
      checkPendingBasicFormDs?.current?.get('lineItemsFlag')
        ? {
            name: 'currencyCode',
            width: 100,
          }
        : null,
      checkPendingBasicFormDs?.current?.get('lineItemsFlag')
        ? {
            name: 'exchangeRate',
            width: 100,
          }
        : null,
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'taxRate',
        width: 150,
        align: 'right',
        renderer: ({ record }) => {
          return record.get('taxRate') === 0 ? '0' : record.get('taxRate');
        },
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 120,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'validQuotationQuantity',
        align: 'right',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) =>
          record.status !== 'add' && (
            <a onClick={() => showLadderQuotation(record)}>
              {intl.get(`ssrc.rfDetail.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ),
      },
      {
        name: 'totalAmount',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netAmount',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 120,
          }
        : null,
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 120,
            align: 'right',
          }
        : null,
      {
        name: 'demandQuantity',
        width: 120,
        align: 'right',
      },
      {
        name: 'priceBatchQuantity',
        width: 150,
      },
      {
        name: 'demandDate',
        width: 150,
      },
      {
        name: 'purchaseAttachmentUuid',
        width: 150,
        // editor: true,
        // renderer: ({ record }) => (
        //   <Attachment
        //     readOnly
        //     viewMode="popup"
        //     sortable={false}
        //     record={record}
        //     fileSize={FIlESIZE}
        //     label={intl.get(`ssrc.rf.view.message.readAttachment`).d('查看附件')}
        //     name="purchaseAttachmentUuid"
        //     bucketName={PRIVATE_BUCKET}
        //     bucketDirectory="ssrc-rf-rfitem"
        //     data={{
        //       tenantId: organizationId,
        //     }}
        //   />
        // ),
      },
      {
        name: 'attachmentUuid',
        width: 150,
        // editor: true,
        // renderer: ({ record }) => (
        //   <Attachment
        //     readOnly
        //     viewMode="popup"
        //     sortable={false}
        //     record={record}
        //     fileSize={FIlESIZE}
        //     label={intl.get(`ssrc.rf.view.message.readAttachment`).d('查看附件')}
        //     name="attachmentUuid"
        //     bucketName={PRIVATE_BUCKET}
        //     bucketDirectory="ssrc-rf-rfitem"
        //     data={{
        //       tenantId: organizationId,
        //     }}
        //   />
        // ),
      },
    ],
    [checkPendingBasicFormDs?.current]
  );

  return customizeTable(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.${sourceCategory}_QUOTATION_LINE`,
    },
    <Table dataSet={ItemLineDetailDs} columns={columns} className={Style['check-rf-item']} />
  );
});
