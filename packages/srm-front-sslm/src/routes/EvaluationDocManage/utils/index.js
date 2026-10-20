import React from 'react';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentTenant } from 'utils/utils';
import { isEmpty } from 'lodash';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { Input, Row, Col } from 'choerodon-ui';

// 考评档案 -- 退回评分确认回调
export async function backScoreSave(params) {
  const { dispatch, dataSet, onRefresh, headerId } = params;

  const { tenantId } = getCurrentTenant();
  // 判断弹框是否关闭
  let closeFlag = true;

  //  权限批量维护的退回原因字段
  let backReason = '';

  // 获取勾选数据
  const checkData = dataSet.toJSONData();
  // 是否跨页全选
  const checkAll = dataSet.isAllPageSelection;
  // 获取查询条件
  const queryData = dataSet.queryDataSet?.current.toJSONData();
  const { indicatorId, userId, supplierId, categoryIds, itemId } = queryData;
  // 未选中的值
  const unCheckData = dataSet.unSelected.map(record => record.toData());

  const payload = {
    evalHeaderId: headerId,
    userId,
    indicatorId,
    tenantId,
    selectAllFlag: checkAll ? 1 : 0,
    kpiEvalDtlResps: checkAll ? [] : checkData,
    unChooseKpiEvalDtlResps: unCheckData,
    supplierId,
    categoryIds,
    standardFlag: 1,
    itemId,
  };

  if (checkAll) {
    // 勾选跨页全选，，弹窗批量维护退回原因
    return C7nModal.confirm({
      title: intl.get('sslm.commonApplication.model.message.backReason').d('退回原因'),
      children: (
        <React.Fragment>
          <Row>
            <Col span={24}>
              <Input
                style={{ width: '100%' }}
                onChange={e => {
                  backReason = e.target.value;
                }}
              />
            </Col>
          </Row>
        </React.Fragment>
      ),
    }).then(async button => {
      if (button === 'ok') {
        if (!isEmpty(checkData)) {
          await dispatch({
            type: 'evaluationDocManage/backScore',
            payload: { ...payload, backReason },
          }).then(res => {
            if (res) {
              notification.success();
              onRefresh();
            } else {
              closeFlag = false;
            }
          });
        }
        return closeFlag;
      }
      if (button === 'cancel') {
        return false;
      }
      return false;
    });
  }
  // 没有勾选跨页全选直接退回
  if (!isEmpty(checkData)) {
    await dispatch({
      type: 'evaluationDocManage/backScore',
      payload: { ...payload, backReason },
    }).then(res => {
      if (res) {
        notification.success();
        onRefresh();
      } else {
        closeFlag = false;
      }
    });
    return closeFlag;
  }
  return false;
}
