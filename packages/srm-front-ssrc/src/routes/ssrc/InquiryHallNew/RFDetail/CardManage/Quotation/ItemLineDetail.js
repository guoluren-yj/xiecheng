import React, { useMemo, useContext, useEffect } from 'react';
import { Table, Modal, Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
import { yesOrNoRender } from 'utils/renderer';

import Store from '../../store/index';
import styles from '../../../rfComponents/common.less';
import Style from '../CheckPending/index.less';

export default observer(function ItemLineDetail(props) {
  const { doubleUnitFlag } = props;
  const {
    routerParams: { sourceCategory },
    commonDs: {
      ItemLineInQuotationDetailDs: ItemLineDetailDs,
      checkLadderQuotationTableDs,
      consultBasicFormDs,
    },
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
      closable: true,
      className: styles['rf-ladder-quotation-modal-wrapper'],
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
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
            customizedCode="SSRC.INQUIRY_HALL.RF_DETAIL.QUOTATION.LINE_LADDER_QUOTATION"
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
      consultBasicFormDs?.current?.get('subjectMatterRule') === 'PACK'
        ? {
            name: 'sectionCode',
            width: 120,
          }
        : null,
      consultBasicFormDs?.current?.get('subjectMatterRule') === 'PACK'
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
      {
        name: 'validQuotationPrice',
        width: 120,
      },
      {
        name: 'validNetPrice',
        width: 120,
      },
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
      {
        name: 'validQuotationQuantity',
        width: 120,
        align: 'right',
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
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      {
        name: 'demandQuantity',
        align: 'right',
        width: 120,
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
    [consultBasicFormDs?.current]
  );

  return customizeTable(
    {
      // code: `SSRC.INQUIRY_HALL_RF_DETAIL.${sourceCategory}_QUOTATION_LINE`,
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.${sourceCategory}_STEP_IN_QUOTATION_LINE`,
    },
    <Table dataSet={ItemLineDetailDs} columns={columns} className={Style['check-rf-item']} />
  );
});
