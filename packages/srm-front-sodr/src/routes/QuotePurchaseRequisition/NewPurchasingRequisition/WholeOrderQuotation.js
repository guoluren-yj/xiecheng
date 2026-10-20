import { useCallback, useContext, useMemo } from 'react';
import { yesOrNoRender } from 'utils/renderer';
import { Store } from './stores';
import { usePrNumRender, useTable } from './hooks';

const style = {
  height: 500,
};

const WholeOrderQuotation = function WholeOrderQuotation(props) {
  const { dataSet } = props;
  const { customizeTable, history } = useContext(Store);
  const handleDetail = useCallback(
    (record) => {
      history.push({
        pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/detail/${record.get(
          'prHeaderId'
        )}`,
      });
    },
    [history]
  );
  const prNumRenderer = usePrNumRender(handleDetail);
  const columns = useMemo(
    () => [
      {
        name: 'prNum',
        width: 150,
        lock: true,
        renderer: prNumRenderer,
      },
      {
        name: 'title',
        lock: true,
        width: 100,
      },
      {
        name: 'requestDate',
        width: 150,
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
        name: 'organizationName',
      },
      {
        name: 'purchaseAgentName',
        width: 150,
      },
      {
        name: 'requestedName',
        width: 100,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 150,
      },
      {
        name: 'ecSupplierCompanyName',
        width: 120,
      },
      {
        name: 'urgentFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'urgentDate',
        width: 150,
      },
    ],
    [prNumRenderer]
  );
  return customizeTable(
    {
      code: 'SODR.PURCHASE_REQUISITION_LIST.ALL',
      filterCode: 'SODR.PURCHASE_REQUISITION_LIST.FILTER_ALL',
    },
    useTable(dataSet, columns, { style })
  );
};

export default WholeOrderQuotation;
