import type { ReactElement } from 'react';
import React, { useMemo, useCallback } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Spin, Button, Select, TextArea, useModal, Switch } from 'choerodon-ui/pro';
import { Card, Collapse } from 'choerodon-ui';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import SearchBarTable from '_components/SearchBarTable';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { isEmpty } from 'lodash';

import EditorForm from '../Components/EditorForm';
import { useModalOpen } from '../../hooks';
import BatchModifyModal from './components/BathModify';
import RelationDiscounted from './components/RelationDiscounted';
// import BlueLineNum from './components/BlueLineNum';
import { statusTagRender } from '../Components/StatusTag';
import { headerCustCodeMap, lineCustCodeMap } from './type';
import DynamicAlertList from '../Components/DynamicAlert/List';
import styles from './index.less';

const defaultActiveKey = [
  'header',
  'line',
];


const { Panel } = Collapse;

export interface DetailContentProps {
  loading: boolean
  modalFlag: boolean,
  invApplyLineDs: DataSet,
  invApplyHeaderDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
  readOnlyFlag?: boolean,
  editFlag?: boolean,
}

const DetailContent = flow(
  observer,
)((props: DetailContentProps) => {

  const {
    loading,
    modalFlag,
    invApplyLineDs,
    invApplyHeaderDs,
    editFlag,
    customizeTable,
    customizeForm,
  } = props;
  const { selected } = invApplyLineDs;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const { applyHeaderId, billingType } = invApplyHeaderDs.current?.get(['applyHeaderId', 'billingType']) || {};

  const basicColumns = useMemo(() => {
    return [
      'applyNum',
      {
        name: 'applyStatus',
        disabled: true,
        renderer: statusTagRender,
      },
      'supplierCompanyLov',
      'companyNameLov',
      {name: 'applyType', editor: Select},
      'ruleLov',
      {name: 'invoiceType', editor: Select},
      {name: 'invoiceSpecialMark', editor: Select},
      {name: 'invoiceListMark', editor: Select},
      {name: 'paperInvoiceType', editor: Select},
      {name: 'pushPriceFlag', editor: Select},
      {name: 'taxIncludedPriceFlag', editor: Select}, // TODO
      {name: 'writeOffReason', editor: Select},
      'billingType',
      'invoiceCode',
      'invoiceNum',
      'invoiceDate',
      'digitInvoiceNum',
      'originalInvoiceCode',
      'originalInvoiceNum',
      'originalDigitInvoiceNum',
      {name: 'redInfoNumber'},
    ];
  }, []);

  const buyerColumns = useMemo(() => {
    return [
      'purchaseCompanyLov',
      'purchaseCompanyType',
      'purUnifiedSocialCode',
      'purAddressTel',
      'purBankAndAccount',
    ];
  }, []);
  const sellerColumns = useMemo(() => {
    return [
      'saleCompanyLov',
      'saleCompanyType',
      'saleUnifiedSocialCode',
      'saleAddressTel',
      'saleBankAndAccount',
    ];
  }, []);

  const otherColumns = useMemo(() => {
    return [
      {name: 'invoiceBy'},
      {name: 'payee'},
      {name: 'reviewer'},
      {name: 'remark', editor: TextArea},
    ];
  }, []);

  const draweeColumns = useMemo(() => {
    return [
      {name: 'receiver'},
      {name: 'recipientAddress'},
      {name: 'recipientPhone' },
      {name: 'pushPhoneFlag', renderer: ({ value }) => yesOrNoRender(value), editor: Switch },
      {name: 'recipientEmail' },
      {name: 'pushEmailFlag', renderer: ({ value }) => yesOrNoRender(value), editor: Switch },
    ];
  }, []);

  // const handleEditBlueLineNum = useCallback((record) => {
  //   modalOpen({
  //     size: 'middle',
  //     editFlag: true,
  //     title: intl.get(`ssta.directPoolSupply.model.directPoolSupply.originalApplyLineIdLov`).d('关联蓝票明细行序号'),
  //     children: <BlueLineNum record={record} applyHeaderId={applyHeaderId} />,
  //   });
  // }, [applyHeaderId]);

  const lineColumns = useMemo<ColumnProps[]>(
    () => [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'applyLineType',
        width: 180,
        editor: editFlag && Number(billingType) !== 2,
      },
      {
        name: 'originalApplyLineIdLov',
        width: 180,
        hidden: Number(billingType) !== 2,
        editor: editFlag,
      },
      {
        name: 'associatedDiscountedLineNumStr',
        width: 180,
        hidden: Number(billingType) === 2,
      },
      {
        name: 'commodityCode',
        width: 120,
      },
      {
        name: 'projectName',
        width: 120,
      },
      {
        name: 'model',
        width: 120,
      },
      {
        name: 'uomCode',
        width: 80,
      },
      {
        name: 'uomName',
        width: 80,
      },
      {
        name: 'quantity',
        width: 80,
      },
      {
        name: 'netAmount',
        width: 100,
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'taxAmount',
        width: 120,
      },
      {
        name: 'amount',
        width: 100,
      },
      {
        name: 'deductionAmount',
        width: 100,
      },
      {
        name: 'netPrice',
        width: 100,
      },
      {
        name: 'price',
        width: 100,
        renderer: ({ value, record, text }) =>
          math.eq(value, record?.get('originPrice')) ? (
            text
          ) : (
            <span style={{ color: 'red' }}>{text}</span>
          ),
      },
      {
        name: 'freeTaxMark',
        width: 120,
      },
      {
        name: 'preferentialPolicyFlag',
        width: 120,
      },
      {
        name: 'specialManagementVat',
        width: 120,
      },
      {
        name: 'vehicleType',
        width: 120,
      },
      {
        name: 'brandModel',
        width: 120,
      },
      {
        name: 'productArea',
        width: 120,
      },
      {
        name: 'certificateNum',
        width: 120,
      },
      {
        name: 'importExportCertificateNum',
        width: 120,
      },
      {
        name: 'commodityInspectionNum',
        width: 120,
      },
      {
        name: 'engineNum',
        width: 120,
      },
      {
        name: 'vehicleNum',
        width: 120,
      },
      {
        name: 'taxPaymentCertificateNum',
        width: 120,
      },
      {
        name: 'tonnage',
        width: 100,
      },
      {
        name: 'passengersLimit',
        width: 100,
      },
      {
        name: 'organizationCode',
        width: 120,
      },
      {
        name: 'sourceDocSettleNum',
        width: 120,
      },
    ],
    [editFlag, billingType]
  );

  const cardList = useMemo(() => {
    return [
      {
        key: 'basic',
        title: intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息'),
        editorColumns: basicColumns,
        code: headerCustCodeMap.basic,
      },
      {
        key: 'buyer',
        title: intl.get(`ssta.directPoolSupply.model.directPoolSupply.purchaseInfo`).d('购方信息'),
        editorColumns: buyerColumns,
        code: headerCustCodeMap.buy,
      },
      {
        key: 'seller',
        title: intl.get(`ssta.directPoolSupply.model.directPoolSupply.saleInfo`).d('销方信息'),
        editorColumns: sellerColumns,
        code: headerCustCodeMap.sale,
      },
      {
        key: 'other',
        title: intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息'),
        editorColumns: otherColumns,
        code: headerCustCodeMap.other,
      },
      {
        key: 'drawee',
        title: intl.get(`ssta.common.view.title.draweeInfo`).d('受票人信息'),
        editorColumns: draweeColumns,
        code: headerCustCodeMap.receiver,
        columns: 2,
      },
    ];
  }, [basicColumns, buyerColumns, sellerColumns, otherColumns, draweeColumns]);

  const handleSearch = useCallback(() => {
    invApplyHeaderDs.query();
  }, [invApplyHeaderDs]);

  const handleBatchModify = useCallback(() => {
    modalOpen({
      size: 'small',
      editFlag: true,
      title: intl.get('ssta.common.button.bathModify').d('批量修改'),
      children: <BatchModifyModal selected={selected} applyHeaderId={applyHeaderId} closeCallback={handleSearch} />,
    });
  }, [selected, applyHeaderId, handleSearch, modalOpen]);

  const handleRelationBtn = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('ssta.common.button.relationDiscountedBtn').d('关联被折扣行'),
      children: <RelationDiscounted applyHeaderId={applyHeaderId} closeCallback={handleSearch} />,
    });
  }, [applyHeaderId, handleSearch, modalOpen]);

  const buttons = useMemo(() => {
    if (editFlag && Number(billingType) !== 2) {
      return [
        <Button
          name="lineBatchModify"
          icon="mode_edit"
          onClick={handleBatchModify}
          disabled={!invApplyHeaderDs.length || isEmpty(selected)}
        >
          {isEmpty(selected)
            ? intl.get('ssta.common.button.batchModify').d('批量修改')
            : intl.get('ssta.common.button.selectedBatchModify').d('勾选批量修改')}
        </Button>,
        <Button
          name="relationBtn"
          onClick={handleRelationBtn}
        >
          {intl.get('ssta.common.button.relationDiscountedBtn').d('关联被折扣行')}
        </Button>,
      ];
    }
    return [];
  }, [editFlag, selected, handleBatchModify, handleRelationBtn, billingType, invApplyHeaderDs]);

  return (
    <Content className={`${modalFlag && styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-invoicingApply']}`}>
      <Spin spinning={loading}>
        <Collapse
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          defaultActiveKey={defaultActiveKey}
        >
          <Panel forceRender showArrow={false} key="header" header={intl.get(`ssta.costSheet.view.message.panel.baseInfoss`).d('发票头信息')}>
            {cardList.map((item) => {
              const { key, title, editorColumns, columns, code } = item;
              return (
                <Card key={key} bordered={false} className={DETAIL_CARD_CLASSNAME} title={title}>
                  <EditorForm
                    useWidthPercent
                    columns={columns || 3}
                    useColon={false}
                    editorFlag={editFlag}
                    dataSet={invApplyHeaderDs}
                    editorColumns={editorColumns}
                    customizeForm={customizeForm}
                    customizeOptions={{code}}
                  />
                </Card>
              );
            })}
          </Panel>
          <Panel forceRender showArrow={false} key="line" header={intl.get(`ssta.costSheet.view.message.invoiceLineInfo`).d('发票明细信息')}>
            <DynamicAlertList
              dataSource={[
                {
                  type: 'info',
                  name: 'taxInvoiceAlert1',
                  message: (
                    <span>
                      {Number(billingType) === 2 ? intl
                        .get(`ssta.common.view.message.invoiceApplyTipsRed`)
                        .d('注意:1、若存在开票行数量为0，不符合开票规范，无法开具税票，系统提交第三方服务商开票时将会自动过滤此行；2、红字发票行金额需为负数，故实际接口开具时会自动合并折扣行与被折扣行金额，会导致红字发票行与发票行有所偏差') : intl
                        .get(`ssta.common.view.message.invoiceApplyTips`)
                        .d('注意，若存在开票行数量为0，不符合开票规范，无法开具税票，系统提交第三方服务商开票时将会自动过滤此行。')}
                    </span>
                  ),
                  showFlag: true,
                },
              ]}
            />
            {
               customizeTable(
                {
                  code: lineCustCodeMap.line,
                  readOnly: !editFlag,
                },
                 <SearchBarTable
                   virtual
                   searchCode={lineCustCodeMap.search}
                   dataSet={invApplyLineDs}
                   columns={lineColumns}
                   buttons={buttons}
                   style={{ maxHeight: 370 }}
                   searchBarConfig={{
                    autoQuery: false,
                    closeFilterSelector: true,
                  }}
                 />
              )
            }
          </Panel>
        </Collapse>
      </Spin>
    </Content>
  );
}) as (props: DetailContentProps) => ReactElement;

export default DetailContent;
