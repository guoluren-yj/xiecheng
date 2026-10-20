import React, { useEffect, useState, useMemo } from 'react';
import { Tag } from 'choerodon-ui';
import { Form, Output, DataSet } from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { processStatusRender } from '@/utils/util';
import { detailFormDS } from '@/stores/approveItemDS';
import styles from './index.less';

const ApproveItem = (props) => {
  const { detail = {}, processStatus = [], customizeForm, code, fromTask } = props;
  const [processStatusObj, setProcessStatusObj] = useState({});
  const formDs = useMemo(() => {
    return new DataSet(detailFormDS());
  });

  useEffect(() => {
    const processStatusArr = {};
    processStatus.forEach((item) => {
      processStatusArr[item.value] = item.meaning;
    });
    setProcessStatusObj(processStatusArr);
  }, [processStatus]);

  useEffect(() => {
    formDs.loadData([{ ...detail }]);
  }, [detail, formDs]);

  const suspendFlag = useMemo(() => {
    return detail && detail.processStatusForecast === 'SUSPENDED' && !!detail.approvalShowSuspend;
  }, [detail.processStatus]);

  return (
    <>
      {customizeForm(
        {
          code,
        },
        <Form dataSet={formDs} labelLayout="vertical" className={styles['cuz-approve-form']}>
          <Output
            name="processName"
            renderer={() => {
              return (
                <div className={styles['approve-item-content']}>
                  {detail.processName || '-'}
                  {detail.deleteReason &&
                    processStatusRender(processStatusObj, detail.deleteReason)}
                </div>
              );
            }}
          />
          <Output
            name="id"
            renderer={() => {
              return <div className={styles['approve-item-content']}>{detail.id || '-'}</div>;
            }}
          />
          <Output
            name="startUserName"
            renderer={() => {
              return (
                <div className={styles['approve-item-content']}>
                  {detail.startUserName || '-'}
                  {detail.employeeResign && (
                    <Tag
                      color="#E5E7EC"
                      style={{
                        lineHeight: '18px',
                        height: '18px',
                        border: 'none',
                        padding: '0 4px',
                        cursor: 'default',
                        marginLeft: '4px',
                        marginRight: 0,
                        transform: 'scale(0.84)',
                        color: '#4e5769',
                      }}
                    >
                      {intl.get('hpfm.organization.model.position.leave').d('离职')}
                    </Tag>
                  )}
                </div>
              );
            }}
          />
          <Output
            name="startTime"
            renderer={() => {
              return (
                <div className={styles['approve-item-content']}>
                  {detail.startTime ? dateTimeRender(detail.startTime) : '-'}
                </div>
              );
            }}
          />
          <Output
            name="description"
            renderer={() => {
              const content = (detail.description || '-').split('\n').map((i) => <div>{i}</div>);
              return <div className={styles['approve-item-content']}>{content}</div>;
            }}
          />
          <Output
            name="unitName"
            renderer={() => {
              return <div className={styles['approve-item-content']}>{detail.unitName || '-'}</div>;
            }}
          />
          {suspendFlag && (
            <Output
              name="exceptionMsgHead"
              colSpan={3}
              renderer={() => {
                return (
                  <div className={styles['approve-item-content']}>
                    {detail.exceptionMsgHead || '-'}
                  </div>
                );
              }}
            />
          )}
          {fromTask && (
            <Output
              name="processRejectedFlag"
              renderer={() => {
                return (
                  <div className={styles['approve-item-content']}>
                    {detail.processRejectedFlag ? (
                      <Tag
                        style={{
                          color: '#f56649',
                          backgroundColor: '#ffeeeb',
                          border: 'none',
                          marginTop: 4,
                        }}
                      >
                        {intl.get('hzero.common.button.yes').d('是')}
                      </Tag>
                    ) : (
                      intl.get('hzero.common.button.no').d('否')
                    )}
                  </div>
                );
              }}
            />
          )}
        </Form>
      )}
    </>
  );
};

export default withCustomize({
  unitCode: [
    'HWFP.APPROVAL_FORM_UNIT_GROUP.NOT_APPROVED',
    'HWFP.APPROVAL_FORM_UNIT_GROUP.APPROVED',
    'HWFP.APPROVAL_FORM_UNIT_GROUP.CARBON',
    'HWFP.APPROVAL_FORM_UNIT_GROUP.STARTEDBY',
  ],
})(ApproveItem);
