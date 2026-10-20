import React, { useCallback, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { booleanRenderer, useDefaultColumns, useTable } from './hooks';
import { redirectToOther } from '@/routes/components/utils';
import { Store } from './stores';
import BOMModal from './BOMModal';

// 设置sodr国际化前缀 - common - message
const titlePrompt = 'sodr.sendOrder.view.title';

const OtherTable = function OtherTable() {
  const { customizeTable, otherDs, sourceFromCancel } = useContext(Store);
  const defaultColumns = useDefaultColumns('others');
  const modal = useModal();
  const openBOMModal = useCallback(
    (record) => {
      modal.open({
        title: intl.get(`${titlePrompt}.titleBom`).d('外协BOM'),
        children: <BOMModal record={record} />,
        style: {
          width: 700,
        },
      });
    },
    [modal]
  );
  const columns = useMemo(
    () => [
      ...defaultColumns,
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'exchangeRate',
        width: 90,
      },
      {
        name: 'consignedFlag',
        width: 90,
        renderer: booleanRenderer,
      },
      {
        name: 'returnedFlag',
        width: 90,
        renderer: booleanRenderer,
      },
      {
        name: 'freeFlag',
        width: 90,
        renderer: booleanRenderer,
      },
      {
        name: 'immedShippedFlag',
        width: 90,
        renderer: booleanRenderer,
      },
      // TODO 后端没字段
      {
        width: 100,
        name: 'bom',
        renderer: ({ record }) => (
          <a onClick={() => openBOMModal(record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 180,
        renderer: ({ value, record }) => (
          <a onClick={() => redirectToOther('purchase', record.toData())}>{value}</a>
        ),
      },
      {
        name: 'contractNum',
        width: 180,
        renderer: ({ value, record }) => (
          <a onClick={() => redirectToOther('contract', record.toData())}>{value}</a>
        ),
      },
      {
        name: 'sourceNumAndLine',
        width: 180,
        renderer: ({ value, record }) => (
          <a onClick={() => redirectToOther('source', record.toData())}>
            {value || record.get('sourceCodeNum')}
          </a>
        ),
      },
      {
        name: 'prRequestedName',
        width: 90,
        renderer: ({ record }) => record.get('purReqAppliedName'),
      },
      {
        name: 'productNum',
        width: 130,
      },
      {
        name: 'productName',
        width: 100,
      },
      {
        name: 'catalogName',
        width: 100,
      },
      {
        name: 'shipToThirdPartyName',
        width: 120,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
      },
      {
        name: 'receiveTelNum',
        width: 150,
        renderer: ({ value, record }) => (
          <span>{value ? `${record.get('internationalTelCode') || ''} ${value}` : ''}</span>
        ),
      },
      {
        name: 'priceUomName',
        width: 150,
        renderer: ({ record }) => record.get('priceUomCodeName'),
      },
      {
        name: 'priceUomConversion',
        width: 150,
      },
    ],
    [defaultColumns, openBOMModal]
  );
  return customizeTable(
    {
      code: sourceFromCancel
        ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER'
        : 'SODR.SEND_ORDER_DETAIL.OTHER',
    },
    useTable(otherDs, columns)
  );
};

export default observer(OtherTable);
