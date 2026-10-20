import React, { useState, useMemo, useEffect } from 'react';

import { DataSet, Form, TextArea, Button } from 'choerodon-ui/pro';
// import { Button } from 'hzero-ui';
import { Rate } from 'choerodon-ui';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { evaluateDs } from './evaluateDs';

import { evaluate, modalSave } from '@/services/purchaseRequisitionInquiryService';

import style from './index.less';

const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';
const organizationId = getCurrentOrganizationId();

export default ({ currentRecord, dataSet, prHeaderId, hideModal }) => {
  const [values, setValues] = useState(currentRecord.get('satisfactionDegreeCode') || null);
  const [evaluateFlag, setEvaluateFlag] = useState(currentRecord.get('evaluateFlag') || 0);
  const evaluateFromDs = useMemo(() => new DataSet(evaluateDs()), []);

  useEffect(() => {
    evaluateFromDs.loadData([currentRecord.toData()]);
    evaluate({ prHeaderId, organizationId }).then((res) => {
      if (getResponse(res)) {
        setValues(res.satisfactionDegreeCode);
        setEvaluateFlag(res.evaluateFlag);
        evaluateFromDs.loadData([res]);
      }
    });
  }, []);

  const handleModalSave = async () => {
    const flag = await evaluateFromDs.validate();
    if (flag) {
      const res = await modalSave({
        ...currentRecord.toData(),
        satisfactionDegreeCode: evaluateFromDs.current.get('satisfactionDegreeCode'),
        evaluateRemark: evaluateFromDs.current.get('evaluateRemark'),
      });

      if (getResponse(res)) {
        notification.success();
        hideModal();
        dataSet.query();
      }
    }
  };

  const onChange = (e) => {
    setValues(e);
    let record = evaluateFromDs.current;
    if (!record) {
      record = evaluateFromDs.create({
        satisfactionDegreeCode: null,
        evaluateRemark: null,
        evaluateFlag: 0,
      });
    }
    record.set({
      satisfactionDegreeCode: e,
    });
  };

  return (
    <>
      <div style={{ marginBottom: 140 }}>
        <div>
          <div className={style['rate-box']}>
            <div className={style['rate-box-left']}>
              <span style={{ display: values === null || values === 0 ? 'block' : 'none' }}>
                {intl.get(`${modelPrompt}.userMarktitle`).d('用户评价')}
              </span>
              <span style={{ display: +values === 1 ? 'block' : 'none' }}>
                {intl.get(`${modelPrompt}.userMarkUnhappy`).d('非常不满意')}
              </span>
              <span style={{ display: +values === 2 ? 'block' : 'none' }}>
                {intl.get(`${modelPrompt}.userMarknotOk`).d('不满意')}
              </span>
              <span style={{ display: +values === 3 ? 'block' : 'none' }}>
                {intl.get(`${modelPrompt}.userMarkOk`).d('一般满意')}
              </span>
              <span style={{ display: +values === 4 ? 'block' : 'none' }}>
                {intl.get(`${modelPrompt}.userMarkGood`).d('比较满意')}
              </span>
              <span style={{ display: +values === 5 ? 'block' : 'none' }}>
                {intl.get(`${modelPrompt}.userMarkNice`).d('非常满意')}
              </span>
            </div>
            <div className={style['rate-box-right']}>
              <Rate
                className={style['rate-box']}
                allowClear
                value={values}
                onChange={onChange}
                disabled={evaluateFlag === 1}
              />
            </div>
          </div>
        </div>
        <div className={style['remark-box']}>{intl.get(`${modelPrompt}.userRemark`).d('备注')}</div>
        <div className={style['textarea-box']}>
          <Form dataSet={evaluateFromDs} useColon={false} labelLayout="none">
            <TextArea
              // className={style['text-area']}
              name="evaluateRemark"
              disabled={evaluateFlag === 1 || values === null || values === 0}
              autosize={{ minRows: 2, maxRows: 3 }}
              rows={4}
              resize="vertical"
            />
          </Form>
        </div>
      </div>

      {evaluateFlag === 0 ? (
        <div className={style['btn-box']}>
          <Button
            disabled={values === null || values === 0}
            onClick={handleModalSave}
            type="primary"
            color="primary"
            className={style['btn-ok']}
          >
            {intl.get(`hzero.common.button.confrim`).d('确定')}
          </Button>
          <Button onClick={hideModal} className={style['btn-no']}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ) : (
        <div className={style['btn-box']}>
          <Button onClick={hideModal} type="primary" className={style['btn-no']}>
            {intl.get(`hzero.common.model.button.close`).d('关闭')}
          </Button>
        </div>
      )}
    </>
  );
};
