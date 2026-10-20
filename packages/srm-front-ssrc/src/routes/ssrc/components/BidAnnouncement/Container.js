import React, { useMemo, useState, useEffect } from 'react';
import { Form, Select, Table, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import intl from 'utils/intl';

import styles from './index.less';

const Container = (props) => {
  const { formDs, contentTableDs, targetTableDs, init = noop } = props;
  const [checkValue, setCheckValue] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  const [checkValueOne, setCheckValueOne] = useState(false);
  const [indeterminateOne, setIndeterminateOne] = useState(false);

  const { current: formCurrent } = formDs || {};

  const { bidAnnouncementTarget, bidAnnouncementContent } = formCurrent
    ? formCurrent.get(['bidAnnouncementTarget', 'bidAnnouncementContent'])
    : {};

  useEffect(() => {
    init().then(() => {
      if (bidAnnouncementContent && bidAnnouncementContent !== 'ALL_SUPPLIER') {
        const suggestedFlagArr = contentTableDs?.toData()?.map((item) => {
          return item.bidAnnouncementContentFlag;
        });
        if (suggestedFlagArr.every((ele) => ele)) {
          setCheckValue(true);
          setIndeterminate(false);
        } else if (suggestedFlagArr.every((ele) => !ele)) {
          setCheckValue(false);
          setIndeterminate(false);
        } else {
          setIndeterminate(true);
        }
      }
      if (bidAnnouncementTarget && bidAnnouncementTarget !== 'ALL_SUPPLIER') {
        const suggestedFlagArr = targetTableDs?.toData()?.map((item) => {
          return item.bidAnnouncementTargetFlag;
        });
        if (suggestedFlagArr.every((ele) => ele)) {
          setCheckValueOne(true);
          setIndeterminateOne(false);
        } else if (suggestedFlagArr.every((ele) => !ele)) {
          setCheckValueOne(false);
          setIndeterminateOne(false);
        } else {
          setIndeterminateOne(true);
        }
      }
    });
    contentTableDs.addEventListener('update', handleUpdate);
    targetTableDs.addEventListener('update', handleUpdateOne);
    return () => {
      contentTableDs.removeEventListener('update', handleUpdate);
      targetTableDs.removeEventListener('update', handleUpdateOne);
    };
  }, [formDs]);

  // 唱标范围ds更新
  const handleUpdate = ({ dataSet, name }) => {
    if (name === 'bidAnnouncementContentFlag') {
      const suggestedFlagArr = dataSet?.records?.map((record) => {
        return record.get('bidAnnouncementContentFlag');
      });
      if (suggestedFlagArr.every((ele) => ele)) {
        setCheckValue(true);
        setIndeterminate(false);
      } else if (suggestedFlagArr.every((ele) => !ele)) {
        setCheckValue(false);
        setIndeterminate(false);
      } else {
        setIndeterminate(true);
      }
    }
  };

  // 唱标对象ds更新
  const handleUpdateOne = ({ dataSet, name }) => {
    if (name === 'bidAnnouncementTargetFlag') {
      const suggestedFlagArr = dataSet?.records?.map((record) => {
        return record.get('bidAnnouncementTargetFlag');
      });
      if (suggestedFlagArr.every((ele) => ele)) {
        setCheckValueOne(true);
        setIndeterminateOne(false);
      } else if (suggestedFlagArr.every((ele) => !ele)) {
        setCheckValueOne(false);
        setIndeterminateOne(false);
      } else {
        setIndeterminateOne(true);
      }
    }
  };

  const handleChange = (value, type) => {
    if (type === 'content') {
      if (!contentTableDs?.length) {
        setCheckValue(false);
        return;
      }
      setCheckValue(value);
      if (value) {
        // eslint-disable-next-line no-unused-expressions
        contentTableDs?.records?.forEach((record) => {
          record.set('bidAnnouncementContentFlag', 1);
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        contentTableDs?.records?.forEach((record) => {
          record.set('bidAnnouncementContentFlag', 0);
        });
      }
    } else {
      if (!targetTableDs?.length) {
        setCheckValueOne(false);
        return;
      }
      setCheckValueOne(value);
      if (value) {
        // eslint-disable-next-line no-unused-expressions
        targetTableDs?.records?.forEach((record) => {
          record.set('bidAnnouncementTargetFlag', 1);
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        targetTableDs?.records?.forEach((record) => {
          record.set('bidAnnouncementTargetFlag', 0);
        });
      }
    }
  };

  const columnsContent = useMemo(() => {
    return [
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'bidAnnouncementContentFlag',
        width: 100,
        editor: true,
        header: ({ title }) => {
          return (
            <div style={{ display: 'flex' }}>
              <CheckBox
                checked={checkValue}
                onChange={(value) => handleChange(value, 'content')}
                indeterminate={indeterminate}
              />
              <div style={{ marginLeft: '8px' }}>{title}</div>
            </div>
          );
        },
      },
    ];
  }, [checkValue, indeterminate]);

  const columnsTarget = useMemo(() => {
    return [
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'bidAnnouncementTargetFlag',
        width: 100,
        editor: true,
        header: ({ title }) => {
          return (
            <div style={{ display: 'flex' }}>
              <CheckBox
                checked={checkValueOne}
                onChange={(value) => handleChange(value, 'target')}
                indeterminate={indeterminateOne}
              />
              <div style={{ marginLeft: '8px' }}>{title}</div>
            </div>
          );
        },
      },
    ];
  }, [checkValueOne, indeterminateOne]);

  return (
    <div>
      <div>
        <Form dataSet={formDs} columns={2} labelLayout="float">
          <Select name="bidAnnouncementType" />
          <Select name="bidAnnouncementContent" />
          <Select name="bidAnnouncementTarget" />
          <CheckBox name="showSupplierName" />
          <CheckBox name="showHistoricalPriceVersion" />
        </Form>
      </div>
      {bidAnnouncementContent && bidAnnouncementContent !== 'ALL_SUPPLIER' ? (
        <div style={{ marginTop: '32px' }}>
          <div className={styles['announcement-title']}>
            <div className={styles['announcement-title-line']} />
            <div className={styles['announcement-title-name']}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.announcementScope').d('目标内容选择')}
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Table
              customizable
              customizedCode="customizedCode"
              dataSet={contentTableDs}
              columns={columnsContent}
              style={{ maxHeight: '430px' }}
            />
          </div>
        </div>
      ) : null}
      {bidAnnouncementTarget && bidAnnouncementTarget !== 'ALL_SUPPLIER' ? (
        <div style={{ marginTop: '32px' }}>
          <div className={styles['announcement-title']}>
            <div className={styles['announcement-title-line']} />
            <div className={styles['announcement-title-name']}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.announcementTarget').d('接收对象选择')}
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Table
              customizable
              customizedCode="customizedCode"
              dataSet={targetTableDs}
              columns={columnsTarget}
              style={{ maxHeight: '430px' }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default observer(Container);
