/*
 * FieldMatchConfig - 字段匹配配置
 * @date: 2021-01-22
 * @author: SWJ <wenjing.sun@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import ModalChildren from './ModalChildren';
import FieldMatchConfigDs from './FieldMatchConfigDs';

export default function FieldMatchConfig(props) {
  const { editable, pcTypeId, enumMap } = props;
  const configureDs = new DataSet(FieldMatchConfigDs({ editable, pcTypeId }));

  const modalChildrenProps = {
    enumMap,
    editable,
    pcTypeId,
    configureDs,
  };

  Modal.open({
    closable: true,
    movable: false,
    drawer: true,
    key: Modal.key(),
    title: intl.get(`spcm.common.model.common.FieldMatchConfig`).d('字段匹配配置'),
    style: {
      width: 1000,
    },
    children: <ModalChildren {...modalChildrenProps} />,
    footer: null,
  });
}
