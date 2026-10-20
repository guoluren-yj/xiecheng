/*
 * AgreementLadderPrice - 协议阶梯价格弹窗
 * @date: 2022/08/18 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { line } from './store';

const AgreementLadderPrice = (props) => {
  const { pcSubjectId } = props;
  const lineDs = useMemo(() => new DataSet(line(pcSubjectId)), []);
  const columns = useMemo(
    () => [
      {
        name: 'lineNum',
        width: 50,
      },
      {
        name: 'quantityStart',
      },
      {
        name: 'quantityEnd',
      },
      {
        name: 'price',
      },
      {
        name: 'ladderNetPrice',
      },
      {
        name: 'description',
      },
      {
        name: 'stepAccumulationFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ],
    []
  );
  useEffect(() => {}, []);
  return <Table dataSet={lineDs} columns={columns} selectionMode="none" />;
};

const openModal = (childrenProps = {}, modalProps = {}) => {
  const {
    title = intl.get('sodr.workspace.model.common.ladderInquiry').d('阶梯价格'),
  } = modalProps;
  return Modal.open({
    key: Modal.key(),
    drawer: true,
    cancelButton: false,
    okText: intl.get('hzero.common.btn.close').d('关闭'),
    style: { width: 742 },
    title,
    children: <AgreementLadderPrice {...childrenProps} />,
  });
};

export { openModal, AgreementLadderPrice };
