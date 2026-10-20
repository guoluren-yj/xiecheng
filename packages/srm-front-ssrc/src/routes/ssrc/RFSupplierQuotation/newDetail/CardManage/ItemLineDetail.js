import React, { useMemo, useContext, useEffect } from 'react';
import { Table, Modal, Form, Output, Attachment } from 'choerodon-ui/pro';

// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { numberSeparatorRender } from '@/utils/renderer';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import { Store } from '../store/index';
import styles from '../rfComponent/common.less';
import Style from './index.less';

const organizationId = getCurrentOrganizationId();

export default observer(function ItemLineDetail(props) {
  const { doubleUnitFlag } = props;
  const {
    remote,
    routerParams: { sourceCategory },
    commonDs: { ItemLineDetailDs, ladderQuotationTableDs, basicFormDs },
    customizeTable,
  } = useContext(Store);

  useEffect(() => {
    ItemLineDetailDs.query();
  }, []);

  useEffect(() => {
    ItemLineDetailDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
  }, [doubleUnitFlag]);

  const showLadderQuotation = (record) => {
    ladderQuotationTableDs.setQueryParameter('rfLineItemId', record.get('rfLineItemId'));
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
      {
        name: 'ladderRemark',
        width: 120,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.rf.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 1090,
      },
      drawer: true,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
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
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.rfDetail.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          <Table
            dataSet={ladderQuotationTableDs}
            columns={columns}
            style={{ maxHeight: 'calc(100vh - 250px)' }}
          />
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
      },
    });
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'rfLineItemNum',
          width: 80,
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
          name: 'ouName',
          width: 150,
        },
        {
          name: 'invOrganizationName',
          width: 150,
        },
        {
          name: 'itemCode',
          width: 150,
        },
        {
          name: 'itemName',
          width: 150,
        },
        {
          name: 'itemCategoryName',
          width: 150,
        },
        doubleUnitFlag
          ? {
              name: 'secondaryQuantity',
              width: 120,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        doubleUnitFlag
          ? {
              name: 'secondaryUomName',
              width: 150,
            }
          : null,
        {
          name: 'demandQuantity',
          width: 120,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'uomName',
          width: 150,
        },
        {
          name: 'priceBatch',
          width: 150,
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
          name: 'demandDate',
          width: 150,
        },
        {
          name: 'ladderOffer',
          width: 100,
          renderer: ({ record }) =>
            record.status !== 'add' && (
              <a onClick={() => showLadderQuotation(record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ),
        },
        {
          name: 'attachmentUuid',
          width: 150,
          renderer: ({ record }) => (
            <Attachment
              readOnly
              record={record}
              viewMode="popup"
              sortable={false}
              fileSize={FIlESIZE}
              name="attachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rf-rfitem"
              data={{
                tenantId: organizationId,
              }}
              className="ssrc-attachment-upload-component"
            />
          ),
        },
      ].filter(Boolean),
    [basicFormDs?.current, doubleUnitFlag]
  );

  const standardColumns = remote
    ? remote.process('SSRC_RF_SUPPLIER_QUOTATION_NEW_DETAIL_ITEM_LINE_COLUMNS', columns, {
        sourceCategory,
        ItemLineDetailDs,
        basicFormDs,
      })
    : columns;

  return customizeTable(
    {
      code: `SSRC.SUPPLIER_REPLY_${sourceCategory}.ITEM_LINE`,
    },
    <Table
      dataSet={ItemLineDetailDs}
      columns={standardColumns}
      className={Style['supplier-detail-item']}
      style={{ maxHeight: 'calc(100vh - 300px)' }}
    />
  );
});
