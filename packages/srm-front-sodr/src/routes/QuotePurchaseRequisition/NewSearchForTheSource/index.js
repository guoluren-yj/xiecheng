import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Button, DataSet, Modal } from 'choerodon-ui/pro';
import { compose, isEmpty, isNumber } from 'lodash';
import { observer } from 'mobx-react-lite';
import { stringify } from 'querystring';
import isPromise from 'is-promise';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import DocFlow from '_components/DocFlow';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import {
  useC7NComponent,
  formatAumont,
  queryCommonDoubleUomConfig,
} from '@/routes/components/utils';
import {
  pendingFlag as setPendingFlag,
  pendingCancelFlag,
  check,
  createCombineOrder,
  createOrder,
} from '@/services/quotePurchaseRequisitionService';
import { list } from './store';
import OldIndex from '../SearchForTheSource';
import LadderLevel from './LadderLevel';

const NewIndex = compose(observer)((props) => {
  const { history, customizeTable } = props;
  const dataSet = useMemo(() => new DataSet(list()), []);
  const allPendingFlag = useMemo(
    () => !isEmpty(dataSet.selected) && dataSet.selected.every((i) => i.get('pendingFlag') === 1),
    [dataSet.selected.length]
  );
  const [loading, setLoading] = useState(false);
  const [doubleUnitEnabled, setDoubleUnitEnabled] = useState(0);
  const toSourceDetail = useCallback(
    (record) => {
      const { sourceHeaderId, sourceFrom, subjectMatterRule } = record.get([
        'sourceHeaderId',
        'sourceFrom',
        'subjectMatterRule',
      ]);
      if (sourceFrom === 'RFX') {
        history.push({
          pathname: `/sodr/purchase-order-maintain/source-from-requisition/query-rfq/${sourceHeaderId}`,
          search: stringify({
            libFlag: `order`,
            rfxStatus: subjectMatterRule,
            sourcePage: 'order',
          }),
        });
      } else {
        history.push({
          pathname: `/sodr/purchase-order-maintain/source-from-requisition/bid-event-query/${sourceHeaderId}`,
          search: stringify({
            source: subjectMatterRule,
          }),
        });
      }
    },
    [history]
  );
  const showLadderInquiry = useCallback((record) => {
    Modal.open({
      closable: true,
      children: <LadderLevel record={record} />,
      footer: null,
    });
  }, []);
  const btnLoading = useMemo(() => dataSet.status !== 'ready' || loading, [
    dataSet.status,
    loading,
  ]);
  const columns = useMemo(
    () => [
      {
        name: 'sourceNum',
        width: 180,
        renderer: ({ value, record }) => <a onClick={() => toSourceDetail(record)}>{value}</a>,
      },
      {
        name: 'itemNum',
        width: 80,
      },
      {
        name: 'supplierCompanyNum',
        width: 120,
        renderer: ({ record }) =>
          record.get('supplierCompanyNum') || record.get('erpSupplierCompanyNum'),
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        renderer: ({ record }) => record.get('supplierCompanyName') || record.get('supplierName'),
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 100,
      },
      {
        name: 'itemName',
        width: 120,
      },

      {
        name: 'categoryName',
        width: 100,
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomName',
        width: 100,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 100,
        renderer: ({ value, record }) => formatAumont(value, record.get('secondaryUomPrecision')),
      },
      {
        name: 'uomName',
        width: 100,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'quantity',
        width: 100,
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'changeQuantity',
        width: 120,
        editor: (record) => record.isSelected,
      },
      {
        name: 'occupationQuantity',
        width: 200,
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'remainQuantity',
        width: 200,
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'unitPrice',
        width: 100,
        renderer: ({ value, record }) => formatAumont(value, record.get('defaultPrecision')),
      },
      {
        name: 'netAmount',
        width: 100,
        renderer: ({ value, record }) =>
          formatAumont(value, record.get('financialPrecision'), true),
      },
      {
        name: 'taxprice',
        width: 100,
        renderer: ({ value, record }) => formatAumont(value, record.get('defaultPrecision')),
      },
      {
        name: 'taxAmount',
        width: 100,
        renderer: ({ value, record }) =>
          formatAumont(value, record.get('financialPrecision'), true),
      },
      {
        name: 'priceBatchQuantity',
        width: 100,
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'validPromisedDate',
        width: 120,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 && (
            <a onClick={() => showLadderInquiry(record)}>
              {intl.get(`sodr.orderMaintain.sourceFrom.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ),
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'purOrganizationName',
        width: 120,
      },
      {
        name: 'purchaseAgentName',
        width: 100,
      },
      {
        name: 'realName',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'prNumAndLineNum',
        width: 150,
        renderer: ({ value }) => value !== ' | ' && <span>{value}</span>,
      },
      {
        name: 'itemRemark',
        width: 100,
      },
      {
        width: 100,
        name: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        renderer: ({ record }) => (
          <DocFlow tableName="ssrc_rfx_line_item" tablePk={record.get('sourceLineItemId')} />
        ),
      },
    ],
    [toSourceDetail, doubleUnitEnabled, showLadderInquiry]
  );
  const handleCreate = useCallback(async () => {
    const { selected } = dataSet;
    const validateRes = await Promise.all(selected.map((i) => i.validate()));
    if (validateRes.every((i) => i)) {
      const checkRes = getResponse(await check({ sourceCode: 'SOURCE' }));
      if (!isNumber(checkRes)) return;
      const data = dataSet.toJSONData();
      if (checkRes === 1) {
        const res = getResponse(await createCombineOrder(data));
        if (!res) return;
        const poHeaderId = res.map((i) => i.poHeaderId);
        if (res.length > 1) {
          history.push({
            pathname: `/sodr/purchase-order-maintain/source-from-requisition/tab-line-newCreation`,
            search: `?poHeaderId=${poHeaderId}&cacheKey=${res[0].cacheKey}&source=newRequisition&sourcePage=pageSource`,
          });
        } else if (res.length === 1) {
          history.push({
            pathname: `/sodr/purchase-order-maintain/source-from-requisition/detail/${poHeaderId}`,
            search: `?poHeaderId=${poHeaderId}&source=newRequisition&sourcePage=pageSource`,
          });
        }
      } else if (checkRes === 0) {
        const res = getResponse(await createOrder(data));
        if (res) {
          const { poHeaderId } = res;
          history.push({
            pathname: `/sodr/purchase-order-maintain/source-from-requisition/detail/${poHeaderId}`,
            search: `?poHeaderId=${poHeaderId}&source=newRequisition&sourcePage=pageSource`,
          });
        }
      }
    }
  }, [dataSet, history]);
  const handleSourceHold = useCallback(async () => {
    const { selected } = dataSet;
    const noPendingFlag = selected.every((i) => i.get('pendingFlag') === 0);
    if (!allPendingFlag && !noPendingFlag) {
      return notification.warning({
        message: intl
          .get('sodr.sourceFrom.view.message.checkMark')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    const data = selected.map((i) => {
      const {
        tenantId,
        pendingFlag,
        resultId,
        sourceContractConfigId,
        poSourceContractConfigObjectVersionNumber,
      } = i.get([
        'tenantId',
        'pendingFlag',
        'resultId',
        'sourceContractConfigId',
        'poSourceContractConfigObjectVersionNumber',
      ]);
      return {
        tenantId,
        pendingFlag: pendingFlag === 1 ? 0 : 1,
        type: 'SOURCE',
        executeType: 'PO',
        resultId,
        sourceContractConfigId,
        poSourceContractConfigObjectVersionNumber,
      };
    });
    const res = getResponse(await (allPendingFlag ? pendingCancelFlag : setPendingFlag)(data));
    if (res) {
      notification.success();
      dataSet.clearCachedRecords();
      dataSet.unSelectAll();
      await dataSet.query();
    }
  }, [allPendingFlag, dataSet]);
  const getDoubleUnitEnabled = useCallback(async () => {
    const result = await queryCommonDoubleUomConfig();
    setDoubleUnitEnabled(result);
  }, []);

  useEffect(() => {
    getDoubleUnitEnabled();
  }, []);

  const useLoading = useCallback((func) => {
    return useCallback(async () => {
      setLoading(true);
      const res = func();
      if (isPromise(res)) {
        await res;
      }
      setLoading(false);
    }, [func]);
  }, []);

  return (
    <Fragment>
      <Header
        title={intl.get(`sodr.orderMaintain.sourceFrom.title`).d('引用寻源结果')}
        backPath="/sodr/purchase-order-maintain/list"
      >
        <Button
          wait={THROTTLE_TIME}
          icon="add"
          color="primary"
          onClick={useLoading(handleCreate)}
          loading={btnLoading}
          disabled={!dataSet.selected.length}
        >
          {intl.get(`sodr.orderMaintain.sourceFrom.createButton`).d('创建')}
        </Button>
        <Button
          icon={allPendingFlag ? 'unlock' : 'lock'}
          wait={THROTTLE_TIME}
          type="c7n-pro"
          disabled={!dataSet.selected.length}
          loading={btnLoading}
          onClick={useLoading(handleSourceHold)}
        >
          {allPendingFlag
            ? intl.get(`sodr.orderMaintain.sourceFrom.cancelHold`).d('取消暂挂')
            : intl.get(`sodr.orderMaintain.sourceFrom.hold`).d('暂挂')}
        </Button>
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SODR.PURCHASE_SOURCE_LIST.LINE',
            filterCode: 'SODR.PURCHASE_SOURCE_LIST.FILTER',
          },
          <Table dataSet={dataSet} columns={columns} />
        )}
      </Content>
    </Fragment>
  );
});

export default compose(
  useC7NComponent('sourcingResults', OldIndex),
  formatterCollections({
    code: [
      'sodr.common',
      'sodr.orderMaintain',
      'entity.company',
      'entity.supplier',
      'entity.roles',
      'ssrc.inquiryHall',
      'sodr.order',
    ],
  }),
  withCustomize({
    unitCode: ['SODR.PURCHASE_SOURCE_LIST.FILTER', 'SODR.PURCHASE_SOURCE_LIST.LINE'],
  })
)(NewIndex);
