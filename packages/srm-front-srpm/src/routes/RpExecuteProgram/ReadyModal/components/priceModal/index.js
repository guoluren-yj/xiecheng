import React, { useState, useCallback, Fragment, useEffect, useRef } from 'react';

import { Popover, Table, Spin } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { fetchPoLine } from '@/services/rpExecuteProgramService';

const commonPrompt = 'sprm.common.model.common';

const useSetState = (initialState) => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    (newState) => {
      set((prevState) => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

export const PriceModal = ({ item: { lastPurchasePrice, poLineId } = {} }) => {
  const inputEl = useRef(null);
  const [state, setState] = useSetState({
    data: [],
    loading: false,
  });

  const { loading, data } = state;

  const inputElMouseenter = useCallback(() => {
    if (poLineId && !loading) {
      setState({ loading: true });
      fetchPoLine(poLineId).then((res) => {
        setState({
          loading: false,
          data: res || [],
        });
      });
    }
  }, [poLineId, loading]);

  useEffect(() => {
    if (inputEl.current) {
      // eslint-disable-next-line no-unused-expressions
      inputEl.current?.addEventListener('mouseenter', inputElMouseenter);
    }
  }, [poLineId]);

  return (
    <Fragment>
      <Popover arrowPointAtCenter content={<Content {...{ loading, data }} />}>
        <a ref={inputEl}>{lastPurchasePrice}</a>
      </Popover>
    </Fragment>
  );
};

const Content = formatterCollections({
  code: ['sprm.common', 'entity.company'],
})(({ loading, data }) => {
  const columns = [
    {
      title: intl.get(`${commonPrompt}.displayPoNum`).d('订单编号'),
      dataIndex: 'displayPoNum',
      width: 100,
    },
    {
      title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
      dataIndex: 'lineNum',
      width: 80,
    },
    {
      title: intl.get('entity.company.tag').d('公司'),
      dataIndex: 'companyName',
      width: 120,
    },
    {
      title: intl.get(`${commonPrompt}.supplierCode`).d('供应商编码'),
      dataIndex: 'supplierCode',
      width: 120,
    },
    {
      title: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
      dataIndex: 'supplierName',
      width: 120,
    },
    {
      title: intl.get(`${commonPrompt}.enteredTaxIncludedPrice`).d('单价(含税)'),
      dataIndex: 'enteredTaxIncludedPrice',
      type: 'currency',
      width: 120,
    },
    {
      title: intl.get(`${commonPrompt}.quantity`).d('数量'),
      dataIndex: 'quantity',
      type: 'number',
      width: 80,
    },
    {
      title: intl.get(`${commonPrompt}.taxIncludedLineAmount`).d('行金额(含税)'),
      dataIndex: 'taxIncludedLineAmount',
      type: 'currency',
      width: 120,
    },
    {
      title: intl.get(`${commonPrompt}.confirmedDate`).d('发布时间'),
      dataIndex: 'confirmedDate',
      width: 120,
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table bordered columns={columns} rowKey="prLineId" dataSource={data} pagination={false} />
    </Spin>
  );
});
