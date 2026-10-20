import React from 'react';
import { Expose } from 'utils/remote';
import { Button, Modal } from 'choerodon-ui/pro';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MARMOT } from '_utils/config';
import { math } from 'choerodon-ui/dataset';
import intl from 'hzero-front/lib/utils/intl';

const decimalSum = (arr) => {
  if (arr.some((item) => isNaN(item))) {
    return math.sum(...arr);
  } else {
    const transformArr = arr.map((item) => item || 0);
    return math.sum(...transformArr);
  }
};

const handleGetFixedAssetPhysicalCategories = async (lineDS, settleHeaderDs) => {
  Modal.confirm({
    title: '提示',
    children:
      '请先保存整单信息，再点击确认以获取品类主数据的实物类别及预算分类；未保存直接确认，已维护行信息将被清空。',
    onOk: async () => {
      const res = await request(
        `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/TBdzKWg5iaIFBmQIuzmfL9qDStIltFulBIZYAQmkwXvE`,
        {
          method: 'POST',
          body: {
            settleHeaderId: settleHeaderDs.current?.get('settleHeaderId'),
          },
        }
      );
      if (getResponse(res)) {
        lineDS.query();
      }
    },
  });
};

const handleUpdateLine = async (event) => {
  const { name, record, value } = event;
  if (name === 'attributeVarchar8' && value) {
    const res = await request(
      `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/z8VDpIK7iaK22ShWv066Mtn4q4iamOQKFWQtVg9BkTvic0`,
      {
        method: 'POST',
        body: {
          attributeVarchar8: value?.value,
        },
      }
    );
    if (getResponse(res)) {
      record.set('attributeVarchar32', res?.attributeVarchar32);
    }
  }
};

const handleJumpOA = () => {
  window.open(
    'http://newoa.ard.ctripcorp.com/oa/uui/com/sms/newctripoa/editform/editForm.html?ybRTejQFJ9ebr84ZeNvFRj0JGBb5pFpnn7rxD1H35f2yOZqOexbTPK5sFmkLg5Do',
    '_blank'
  );
};

export default new Expose({
  process: {
    'SSTA_PURCHASESETTLE_DETAIL.LINE_BTNS': (normarlBtns, otherprops) => {
      const { updateFlag, settleLineDs, settleType, settleHeaderDs } = otherprops;
      const cuxFixedAssetPhysicalCategoriesBtn = (
        <Button
          key="cuxFixedAssetPhysicalCategories"
          name="cuxFixedAssetPhysicalCategories"
          disabled={!settleLineDs.length}
          onClick={() => handleGetFixedAssetPhysicalCategories(settleLineDs, settleHeaderDs)}
        >
          固资类实物分类预算分类获取
        </Button>
      );
      return [
        ...normarlBtns,
        updateFlag && settleType === 'PAYMENT' && cuxFixedAssetPhysicalCategoriesBtn,
      ].filter(Boolean);
    },
  },
  events: {
    onEffect: (eventProps) => {
      const { settleLineDs, updateFlag, documentType } = eventProps;
      if (updateFlag && documentType === 'PAYMENT') {
        settleLineDs.addEventListener('update', handleUpdateLine);
      }
    },
    beforeSubmit: async (eventProps) => {
      const { settleHeaderDs } = eventProps;
      if (settleHeaderDs.current?.get('settleType') === 'PAYMENT') {
        const {
          remainingPaymentAmount,
          paymentAmount,
          applyAmount,
          attributeDecimal10,
          attributeDecimal12,
        } =
          settleHeaderDs.current?.get([
            'remainingPaymentAmount',
            'paymentAmount',
            'applyAmount',
            'attributeDecimal10',
            'attributeDecimal12',
          ]) || {};
        const unPaidAmount = decimalSum([
          remainingPaymentAmount || 0,
          -(paymentAmount || 0),
          -(applyAmount || 0),
        ]);
        if ((attributeDecimal12 > 0 || attributeDecimal10 > 0) && unPaidAmount === 0) {
          const modalRes = await Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <div>
                {intl
                  .get('ssta.purchaseSettle.cux.trip.paymentAmountExceedApplyAmountA')
                  .d('您有已支付的押金未处理，如押金已退回，请前往【')}
                <a style={{ marginLeft: 8 }} onClick={() => handleJumpOA()}>
                  {intl
                    .get('ssta.purchaseSettle.cux.trip.comprehensiveBusinessPaymentForm')
                    .d('综合业务付款单')}
                </a>
                {intl
                  .get('ssta.purchaseSettle.cux.trip.paymentAmountExceedApplyAmountB')
                  .d('】确认')}
              </div>
            ),
          });
          return modalRes === 'ok';
        }
      }
      return true;
    },
  },
});
