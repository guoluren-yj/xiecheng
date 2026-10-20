/**
 * 会员管理 - 积分发放及扣减弹窗
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useMemo } from 'react';
import {
  Form,
  NumberField,
  TextArea,
  DatePicker,
  Output,
  DataSet,
  Table,
  Select,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import HeadLine from '@/components/HeadLine';

import { BalanceDetailDS } from '@/stores/MemberManagementDS';

// 积分发放
const PointsEditModal = (props) => {
  const { dataSet } = props;

  useEffect(() => {
    return () => {
      dataSet.queryParameter = {};
    };
  }, []);

  return (
    <Form labelLayout="float" dataSet={dataSet} columns={1}>
      <Select name="pointsTypeId" noCache />
      <NumberField name="modifyIntegralCount" />
      <DatePicker name="expirationDate" />
      <TextArea name="remarks" resize="vertical" style={{ width: '343px', height: '60px' }} />
    </Form>
  );
};

// 积分扣减
export const PointsReduceModal = (props) => {
  const { dataSet, memberId } = props;

  const detailDs = useMemo(() => {
    return new DataSet(BalanceDetailDS(dataSet));
  }, []);

  useEffect(() => {
    detailDs.setQueryParameter('memberId', memberId);
    detailDs.query();
  }, [memberId]);

  return (
    <Form labelLayout="float" columns={2} dataSet={dataSet}>
      <HeadLine
        colSpan={2}
        title={intl.get('sigl.memberCenter.view.selectPoints').d('选择积分')}
        style={{ marginBottom: 0 }}
      />
      <Output
        name="balanceDetails"
        renderer={() => {
          return (
            <div style={{ marginBottom: '16px' }}>
              <Table
                dataSet={detailDs}
                customizedCode="SIGL.MEMBER_MEMBERMANAGMENT.POINT_REDUCE"
                columns={[
                  {
                    name: 'pointsTypeName',
                    header: intl.get('sigl.memberCenter.view.potinsType').d('积分类型'),
                  },
                  { name: 'integralBalance', align: 'right' },
                  { name: 'expirationDate' },
                  // { name: 'remarks' },
                ]}
              />
            </div>
          );
        }}
        colSpan={2}
      />
      <HeadLine
        colSpan={2}
        title={intl.get('sigl.memberCenter.view.button.deductionPoints').d('积分扣减')}
        style={{ marginBottom: 0 }}
      />
      <div colSpan={2}>
        <NumberField colSpan={2} style={{ width: '343px' }} name="modifyIntegralCount" />
      </div>
      <TextArea
        name="remarks"
        resize="vertical"
        colSpan={2}
        style={{ width: '343px', height: '60px' }}
      />
    </Form>
  );
};

export default PointsEditModal;
