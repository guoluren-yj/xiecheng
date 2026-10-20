/**
 * BomRecord - 导入
 * @date: 2022-5-12
 * @author: Mya
 * @version: 0.0.1
 */

import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Table, Form, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { BomDataSet } from './BomDS';
import './bom.less';

const BomRecord = (props) => {
  const { poHeaderId, poLineId, ds } = props;
  const BomDS = useMemo(() => new DataSet(BomDataSet()), []);

  useEffect(() => {
    BomDS.setQueryParameter('poHeaderId', poHeaderId);
    BomDS.setQueryParameter('poLineId', poLineId);
    BomDS.query();
  }, []);

  const columns = [
    {
      label: intl.get(`sinv.common.model.common.orderSeq`).d('序号'),
      name: 'orderSeq',
      width: 100,
    },
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      align: 'center',
      name: 'itemCode',
      width: 100,
    },
    {
      label: intl.get(`entity.item.name`).d('物料名称'),
      name: 'itemName',
      width: 120,
    },
    {
      label: intl.get(`entity.item.type`).d('物料类型'),
      width: 120,
      name: 'categoryName',
    },
    {
      label: intl.get(`sinv.common.model.common.refQuantity`).d('参考数量'),
      width: 120,
      name: 'refQuantity',
    },
    {
      label: intl.get(`sinv.common.model.common.needQuantity`).d('需求数量'),
      width: 100,
      name: 'quantity',
    },
    {
      label: intl.get(`sinv.common.model.common.uomName`).d('单位'),
      width: 120,
      name: 'uomName',
    },
    {
      label: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
      width: 120,
      name: 'invOrganizationName',
    },
    {
      label: intl.get(`sinv.common.model.common.needByDate`).d('需求日期'),
      width: 120,
      name: 'needByDate',
      renderer: ({ text }) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
    },
  ];

  return (
    <Fragment>
      <Form labelLayout="horizontal" dataSet={ds} columns={2} labelAlign="left" className="bom">
        <Output name="itemCode" />
        <Output name="itemName" />
      </Form>
      <Table columns={columns} dataSet={BomDS} />
    </Fragment>
  );
};

export default BomRecord;
