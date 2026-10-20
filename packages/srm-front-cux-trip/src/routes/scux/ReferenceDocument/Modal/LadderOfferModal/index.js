/*
 * @Description: 引用寻源的阶梯报价
 * @Date: 2022-06-29 10:52:52
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Modal, DataSet, Table, Form, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import styles from './index.less';

import ladderQuoteDS from './LadderQuoteDS';

const ModalChildren = (props) => {
  const { sourceInfo, ladderQuoteDs, doubleUnitEnabled } = props;
  const columns = [
    {
      name: 'rfxLadderLineNum',
      width: 100,
    },
    doubleUnitEnabled && {
      name: 'secondaryLadderFrom',
      width: 130,
      align: 'right',
    },
    {
      name: 'ladderFrom',
      width: 130,
      align: 'right',
    },
    doubleUnitEnabled && {
      name: 'secondaryLadderTo',
      width: 130,
      align: 'right',
    },
    {
      name: 'ladderTo',
      width: 130,
      align: 'right',
    },
    doubleUnitEnabled && {
      name: 'validLadderSecPrice',
      width: 130,
      align: 'right',
    },
    {
      name: 'validLadderPrice',
      width: 130,
      align: 'right',
    },
    doubleUnitEnabled && {
      name: 'validNetLadderSecPrice',
      width: 130,
      align: 'right',
    },
    {
      name: 'validNetLadderPrice',
      width: 130,
      align: 'right',
    },
    {
      name: 'validBargainPrice',
      width: 130,
      align: 'right',
    },
    {
      name: 'remark',
      width: 100,
    },
  ];
  return (
    <>
      <h3 className={styles['ladder-sub-title']}>
        <div className={styles['ladder-sub-title-line']} />
        {intl.get('spcm.workspace.model.common.materialInfo').d('物料信息')}
      </h3>
      <Form
        labelLayout="vertical"
        columns={2}
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
      >
        <Output
          label={intl.get(`spcm.common.model.inquiryHall.itemsCode`).d('物料编码')}
          value={sourceInfo.itemCode}
        />
        <Output
          label={intl.get(`spcm.common.model.inquiryHall.itemsName`).d('物料名称')}
          value={sourceInfo.itemName}
        />
      </Form>
      <h3 className={styles['ladder-sub-title']} style={{ marginTop: '32px' }}>
        <div className={styles['ladder-sub-title-line']} />
        {intl.get('spcm.common.view.card.subtitle.quotationInfo').d('报价信息')}
      </h3>
      <Table style={{ maxHeight: 'calc(100vh - 350px)' }} dataSet={ladderQuoteDs} columns={columns} />
    </>
  );
};

export default function showLadderQuote(props) {
  const { sourceInfo } = props;
  const ladderQuoteDs = new DataSet(
    ladderQuoteDS({ ...props, quotationLineId: sourceInfo.quotationLineId })
  );

  const modalChildrenProps = {
    ...props,
    ladderQuoteDs,
    sourceInfo,
  };

  Modal.open({
    closable: true,
    movable: false,
    drawer: true,
    key: Modal.key(),
    title: intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格'),
    style: {
      width: 1090,
    },
    children: <ModalChildren {...modalChildrenProps} />,
    // footer: null,
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    footer: (okBtn, cancelBtn) => cancelBtn,
    cancelProps: {
      color: 'primary',
    },
  });
}
