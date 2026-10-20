import React, { useMemo, useContext, useEffect } from 'react';
import { Table, Modal, Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import { Store } from '../store/index';
import styles from '../../rfComponents/common.less';

export default observer(function ItemLineDetail(props) {
  const { doubleUnitFlag } = props;
  const {
    routerParams: { sourceCategory },
    commonDs: { ItemLineDetailDs, ladderQuotationTableDs, basicFormDs },
    customizeTable,
  } = useContext(Store);

  useEffect(() => {
    ItemLineDetailDs.query();
  }, []);

  const showLadderQuotation = (record) => {
    ladderQuotationTableDs.setQueryParameter('quotationLineId', record.get('quotationLineId'));
    ladderQuotationTableDs.query();

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
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'remark',
        width: 120,
      },
    ].filter(Boolean);
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => <div>{okBtn}</div>,
      closable: true,
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
          <h3 className={styles['ladder-sub-title']} style={{ marginTop: '32px' }}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rfDetail.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          <Table
            columns={columns}
            dataSet={ladderQuotationTableDs}
            style={{ maxHeight: 'calc(100vh - 370px)' }}
            customizedCode={`SSRC.INQUIRY_HALL.${
              sourceCategory === 'RFI' ? '_RFI' : ''
            }_CHECK.ITEM_LINE_LADDER_TABLE`}
          />
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
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
      basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
        ? {
            name: 'sectionCode',
            width: 120,
          }
        : null,
      basicFormDs?.current?.get('subjectMatterRule') === 'PACK'
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
      basicFormDs?.current?.get('lineItemsFlag')
        ? {
            name: 'currencyCode',
            width: 100,
          }
        : null,
      basicFormDs?.current?.get('lineItemsFlag')
        ? {
            name: 'exchangeRate',
            width: 100,
          }
        : null,
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
        // value
        //   ? intl.get('hzero.common.status.yes').d('是')
        //   : intl.get('hzero.common.status.no').d('否'),
      },
      {
        name: 'taxRate',
        width: 150,
        renderer: ({ record }) => {
          return record.get('taxRate') === 0 ? '0' : record.get('taxRate');
        },
        align: 'right',
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value),
            align: 'right',
          }
        : null,
      {
        name: 'validQuotationQuantity',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
        align: 'right',
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
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
    ],
    [basicFormDs?.current]
  );

  return customizeTable(
    {
      code: `SSRC.INQUIRY_HALL.RF_CHECK.ITEM_LINE${sourceCategory === 'RFI' ? '_RFI' : ''}`,
    },
    <Table dataSet={ItemLineDetailDs} columns={columns} />
  );
});
