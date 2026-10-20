/*
 * C7nPriceModal - 工作台参考价格弹窗
 * @date: 2021/05/26 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty, compose } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { queryEnableModifyReferPrice } from '@/services/contractCommonService';
import { priceTableDS, ladderPriceDS } from './store/c7nPriceModalDs';
// import { getFlexLink } from './util';

let readOnly = true;

const PriceModal = (props) => {
  const {
    modal,
    type = 'C7N',
    dataSet,
    customizeTable,
    queryParams,
    customizeUnitCode,
    viewOnlyFlag = false,
  } = props;
  const { pcHeaderId } = queryParams;

  useEffect(() => {
    // 查询是否可修改价格
    queryEnableModifyReferPrice({ pcHeaderId }).then((response) => {
      const { enableModifyPrice } = getResponse(response) || {};
      readOnly = enableModifyPrice !== '1' || viewOnlyFlag;
    });
    dataSet.query();
  }, []);
  // 根据勾选行修改按钮是否可编辑属性
  useEffect(() => {
    if (modal) {
      const { update } = modal;
      update({
        okProps: {
          disabled: isEmpty(dataSet.selected) && !readOnly,
        },
      });
    }
  }, [dataSet.selected, readOnly]);

  const ladderPriceDs = useMemo(() => new DataSet(ladderPriceDS()));
  const ladderPriceColumns = useMemo(() => [
    {
      name: 'ladderLineNum',
      width: 80,
    },
    {
      name: 'quantityStart',
      width: 150,
    },
    {
      name: 'quantityEnd',
      width: 150,
    },
    {
      name: 'price',
      width: 150,
    },
    {
      name: 'ladderNetPrice',
      width: 150,
    },
    {
      name: 'description',
      width: 150,
    },
    {
      name: 'stepAccumulationFlag',
      width: 100,
      renderer: ({ record }) => yesOrNoRender(record.get('stepAccumulationFlag')),
    },
  ]);

  const openLadderPriceModal = (record) => {
    ladderPriceDs.setQueryParameter('priceLibId', record.get('priceLibId'));
    ladderPriceDs.query();
    Modal.open({
      title: intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格'),
      style: { width: 1000 },
      drawer: type === 'C7N',
      destroyOnClose: true,
      children: <Table dataSet={ladderPriceDs} columns={ladderPriceColumns} />,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'taxPrice',
        width: 120,
      },
      {
        name: 'unitPrice',
        width: 120,
      },
      {
        name: 'uomCodeName',
        width: 120,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'taxCode',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'ladderPrice',
        width: 120,
        renderer: ({ record }) =>
          record.get('ladderQuotationFlag') === 1 && (
            <a onClick={() => openLadderPriceModal(record)}>
              {intl.get(`spcm.common.model.common.ladderPrice`).d('阶梯价格')}
            </a>
          ),
      },
      {
        name: 'priceSource',
        width: 120,
        renderer: ({ record }) => record.get('sourceFromMeaning'),
      },
      {
        name: 'orderNum',
        width: 150,
        renderer: ({ record }) => record.get('sourceFromNum'),
        // renderer: ({ text, record }) => getFlexLink(text, record.toData(), 'c7n'),
      },
    ],
    []
  );

  const table = (
    <Table
      dataSet={dataSet}
      columns={columns}
      selectionMode={readOnly ? 'none' : 'rowbox'}
      style={{ maxHeight: `calc(100vh - 280px)` }}
      virtual
      virtualCell
    />
  );

  return customizeTable
    ? customizeTable(
        {
          code: customizeUnitCode,
        },
        table
      )
    : table;
};

const hocFuc = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SPCM.WORKSPACE_DETAIL.SUBJECT.REFERENCE_PRICE', // 标的-参考价格
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.REFERENCE_PRICE',
      ],
    }),
    observer
  )(com);

const C7nPriceModal = hocFuc(PriceModal);
export const openC7nPriceModal = (params) => {
  const { type = 'C7N', onOk, queryParams = {}, customizeUnitCode, viewOnlyFlag = false } = params;
  const dsParams = {
    customizeUnitCode,
    ...queryParams,
  };
  const priceTableDs = new DataSet({
    ...priceTableDS(dsParams),
  });
  const titps1 = intl.get('spcm.workspace.title.common.referPrice.tips1').d('温馨提示：');
  const titleRender = () => {
    const titps2 = intl
      .get('spcm.workspace.title.common.referPrice.tips2')
      .d(
        '1、请选择参考价格数据，点击确定后，参考价格将被带入标的行，如您不能选择参考价，请联系您的项目经理/运维经理'
      );
    const titps3 = intl
      .get('spcm.workspace.title.common.referPrice.tips3')
      .d('2、参考价中的阶梯价仅支持查看，不会带入标的行');
    const content = (
      <div style={{ width: '500px' }}>
        <h4>{titps2}</h4>
        <h4>{titps3}</h4>
      </div>
    );
    return (
      <Popover placement="rightTop" content={content} title={titps1} trigger="hover">
        {intl.get('spcm.common.model.common.referPrice').d('参考价格')}
        <Icon style={{ fontSize: '16px', marginLeft: '8px', color: '#868D9C' }} type="help" />
      </Popover>
    );
  };

  Modal.open({
    drawer: type === 'C7N',
    style: { width: 1090 },
    title: titleRender(),
    children: <C7nPriceModal {...params} dataSet={priceTableDs} />,
    okProps: {
      disabled: isEmpty(priceTableDs.selected),
    },
    okButton: !viewOnlyFlag,
    onOk: () => onOk(priceTableDs),
  });
};

export default C7nPriceModal;
