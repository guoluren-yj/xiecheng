/**
 * LadderInquiryModal - 阶梯报价弹窗
 * @date: 2022-03-23
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { Table, Form, DataSet, Output } from 'choerodon-ui/pro/lib';
import React, { Fragment, useEffect, useMemo } from 'react';

import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { header, line } from './store/ladderInquiryModalDs';

const organizationId = getCurrentOrganizationId();

const LadderInquiryModal = (props) => {
  const { sourceLineItemId } = props;
  const headerDs = useMemo(() => new DataSet(header()), []);
  const lineDs = useMemo(
    () =>
      new DataSet({
        ...line(),
        transport: {
          read() {
            return {
              url: `${SRM_SSRC}/v1/${organizationId}/rfx/${sourceLineItemId}/ladder-inquiry`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const columns = useMemo(
    () => [
      {
        name: 'rfxLadderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 80,
      },
      {
        name: 'ladderTo',
        width: 80,
      },
      {
        name: 'remark',
        width: 80,
      },
    ],
    []
  );

  useEffect(() => {
    const { headerData } = props;
    headerDs.loadData([headerData]);
    lineDs.query();
  }, []);
  const tableProps = { dataSet: lineDs, columns };
  return (
    <Fragment>
      <Form dataSet={headerDs}>
        <Output name="itemCode" />
        <Output name="itemName" />
      </Form>
      <Table {...tableProps} />
    </Fragment>
  );
};

export default LadderInquiryModal;
