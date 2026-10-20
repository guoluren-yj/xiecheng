import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
// import { FIlESIZE } from '@/utils/SsrcRegx';
// import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
// import { PRIVATE_BUCKET } from '_utils/config';
import DocFlow from '_components/DocFlow';

import Store from '../../store/index';
import styles from '../../../rfComponents/common.less';
// import Style from './index.less';

// const organizationId = getCurrentOrganizationId();

export default observer(function RfItemLineCard(props) {
  const { doubleUnitFlag, configSheet = {} } = props;
  const {
    routerParams: { sourceCategory },
    commonDs: { rfItemLineDs, ladderQuotationTableDs, createBasicFormDs },
    customizeTable,
    history,
  } = useContext(Store);

  // 单据来源为采购申请转立项转寻源
  const purchaseRequestFlag = rfItemLineDs?.some(item => item && item?.get('prLineId'));

  useEffect(() => {
    rfItemLineDs.query();
  }, []);

  const showLadderQuotation = record => {
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
    ].filter(Boolean);
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
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
            customizedCode="SSRC.INQUIRY_HALL.RF_DETAIL.CREATE.LINE_LADDER_QUOTATION"
          />
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
      },
    });
  };

  // 采购申请行跳转
  const linktoPrNumDetail = useCallback(
    (record = {}, prHeaderId = '') => {
      const { sprmOldUiConfig = false } = configSheet;
      const prSourcePlatform = record.get('prSourcePlatform') || null;
      const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
      let pathUrl = null;
      if (!sprmOldUiConfig) {
        // 采购申请工作台
        pathUrl = isErp
          ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
      } else {
        pathUrl = isErp
          ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
          : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
      }
      history.push({
        pathname: pathUrl,
      });
    },
    [history, configSheet]
  );

  const getTabActiveKey = () => {
    const { sprmOldUiConfig = false } = configSheet;
    let tabKey = '';
    if (!sprmOldUiConfig) {
      tabKey =
        window.dvaApp?._store
          ?.getState?.()
          ?.global?.menuLeafNode?.find?.(i => i.path === '/sprm/purchase-platform')?.path || null;
    } else {
      tabKey =
        window.dvaApp?._store
          ?.getState?.()
          ?.global?.menuLeafNode?.find?.(i => i.path === '/sprm/purchase-requisition-inquiry')
          ?.path || null;
    }
    return tabKey;
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'rfLineItemNum',
          width: 80,
        },
        {
          header: intl.get('ssrc.rfDetail.model.rfDetail.docFlow').d('单据流'),
          name: 'docFlow',
          width: 80,
          renderer: ({ record }) => (
            <DocFlow tableName="ssrc_rf_line_item" tablePk={record.get('rfLineItemId')} />
          ),
        },
        createBasicFormDs?.current?.get('subjectMatterRule') === 'PACK'
          ? {
              name: 'sectionCode',
              width: 120,
            }
          : null,
        createBasicFormDs?.current?.get('subjectMatterRule') === 'PACK'
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
            return record.get('taxIdMeaning');
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
            record.status !== 'add' ? (
              <a onClick={() => showLadderQuotation(record)}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
              </a>
            ) : null,
        },
        purchaseRequestFlag
          ? {
              name: 'prNum',
              width: 150,
              renderer: ({ record, value }) => {
                // const prData = record.get('prData');
                const prHeaderId = record.get('prHeaderId');
                if (prHeaderId) {
                  // if (prData) {
                  //   return JSON.parse(prData).map(prItem => {
                  //     return getTabActiveKey() ? (
                  //       <a onClick={() => linktoPrNumDetail(record, prItem.prHeaderId)}>
                  //         {`${prItem.prNum}|${prItem.lineNum}`}{' '}
                  //       </a>
                  //     ) : (
                  //       `${prItem.prNum}|${prItem.lineNum}`
                  //     );
                  //   });
                  // } else {
                  return getTabActiveKey() ? (
                    <a onClick={() => linktoPrNumDetail(record, prHeaderId)}>{value}</a>
                  ) : (
                    value
                  );
                  // }
                } else {
                  return value;
                }
              },
            }
          : null,
        purchaseRequestFlag
          ? {
              name: 'prDisplayLineNum',
              width: 150,
            }
          : null,
        {
          name: 'projectTaskName',
          width: 150,
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
      ].filter(Boolean),
    [createBasicFormDs?.current, configSheet, purchaseRequestFlag]
  );

  return customizeTable(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.LINE_ITEM_${sourceCategory}`,
    },
    <Table dataSet={rfItemLineDs} columns={columns} />
  );
});
