import React from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';

import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { thousandBitSeparator } from '@/routes/utils.js';

const commonPrompt = 'sprm.common.model.common';
const organizationId = getCurrentOrganizationId();
// const useSetState = (initialState) => {
//   const [state, set] = useState(initialState);
//   const setState = useCallback(
//     (newState) => {
//       set((prevState) => ({ ...prevState, ...newState }));
//     },
//     [set]
//   );
//   return [state, setState];
// };

const ds = (poLineId) => {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get(`${commonPrompt}.displayPoNum`).d('订单编号'),
        name: 'displayPoNum',
      },
      {
        label: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        name: 'lineNum',
      },
      {
        label: intl.get('entity.company.tag').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get(`${commonPrompt}.supplierCode`).d('供应商编码'),
        name: 'supplierCode',
      },
      {
        label: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
        name: 'supplierName',
      },
      {
        label: intl.get(`${commonPrompt}.enteredTaxIncludedPrice`).d('单价(含税)'),
        name: 'enteredTaxIncludedPrice',
      },
      {
        label: intl.get(`${commonPrompt}.quantity`).d('数量'),
        name: 'quantity',
      },
      {
        label: intl.get(`${commonPrompt}.taxIncludedLineAmount`).d('含税行金额'),
        name: 'taxIncludedLineAmount',
      },
      {
        label: intl.get(`${commonPrompt}.confirmedDate`).d('发布时间'),
        name: 'confirmedDate',
        type: 'dateTime',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poLineId}`,
          method: 'GET',
        };
      },
    },
  };
};

export const PriceModal = formatterCollections({
  code: ['sprm.common', 'entity.company', 'hzero.common'],
})(({ item: { lastPurchasePrice, poLineId } = {} }) => {
  // const inputEl = useRef(null);
  // const [state, setState] = useSetState({
  //   data: [],
  //   loading: false,
  // });

  // const { loading, data } = state;

  // const inputElMouseenter = useCallback(() => {
  //   if (poLineId && !loading) {
  //     setState({ loading: true });
  //     fetchPoLine(poLineId).then((res) => {

  //       setState({
  //         loading: false,
  //         data: res || [],
  //       });
  //     });
  //   }
  // }, [poLineId, loading]);

  // useEffect(() => {
  //   // if (inputEl.current) {
  //   //   inputEl.current.addEventListener('mouseenter', inputElMouseenter);
  //   // }
  // }, [poLineId]);

  const columns = [
    {
      name: 'displayPoNum',
      width: 100,
    },
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'companyName',
      width: 120,
    },
    {
      name: 'supplierCode',
      width: 120,
    },
    {
      name: 'supplierName',
      width: 120,
    },
    {
      name: 'enteredTaxIncludedPrice',
      width: 120,
      renderer: ({ value }) => thousandBitSeparator(value),
    },
    {
      name: 'quantity',
      renderer: ({ value }) => thousandBitSeparator(value),
      width: 80,
    },
    {
      name: 'taxIncludedLineAmount',
      renderer: ({ value }) => thousandBitSeparator(value),
      width: 120,
    },
    {
      name: 'confirmedDate',
      width: 120,
    },
  ];

  const openModal = () => {
    if (!poLineId) {
      return;
    }
    const lastPurPriceDs = new DataSet(ds(poLineId));

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`sprm.common.model.common.lastPurPrice`).d('上次采购单价'),
      children: (
        <Table
          style={{ maxHeight: 'calc(100vh - 174px)' }}
          dataSet={lastPurPriceDs}
          columns={columns}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });

    lastPurPriceDs.query();
    // fetchPoLine(poLineId).then((res) => {
    //   tableState.loading = false;
    //   if (res && res.failed) {
    //     notification.error({ message: res.message });
    //   }
    //   if (res && !res.failed) {
    //     lastPurPriceDs.loadData(res);
    //   }
    // });
  };

  return lastPurchasePrice ? <a onClick={openModal}>{lastPurchasePrice}</a> : null;
});
