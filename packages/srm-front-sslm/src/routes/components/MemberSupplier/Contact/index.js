/*
 * @Date: 2024-08-01 16:55:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, Lov, Icon, DataSet, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { contactDS } from '../stores/getContactDS';

const Contact = ({ isEdit = false, contactData = [] }, ref) => {
  const dataSet = useDataSet(() => contactDS(), []);

  useEffect(() => {
    dataSet.loadData(contactData);
  }, [JSON.stringify(contactData)]);

  useImperativeHandle(ref, () => {
    return {
      dataSet,
    };
  });

  const handleBatchAdd = useCallback(
    records => {
      const addList = records.map(record => record.toData());
      const userIds = (dataSet.toData() || []).map(record => record.userId);
      const existList = addList.filter(item => userIds.includes(item.id));
      if (!isEmpty(existList)) {
        notification.warning({
          message: intl
            .get('sslm.common.view.message.cannotSelectExistingContacts')
            .d('不可选择已存在联系人'),
        });
        return false;
      }
      const newList = addList.map(data => ({
        ...data,
        userId: data.id,
        phone: data.mobile,
        realName: data.name,
      }));
      newList.forEach(data => {
        dataSet.create(data, 0);
      });
    },
    [dataSet]
  );

  const getButtons = useCallback(() => {
    const addContactDs = new DataSet(contactDS({ multiple: true }));
    return isEdit
      ? [
        <Lov
          mode="button"
          name="userId"
          clearButton={false}
          dataSet={addContactDs}
          onBeforeSelect={handleBatchAdd}
          modalProps={{
              beforeOpen: () => {
                const lovDs = addContactDs.getField('userId').getOptions(addContactDs.current);
                if (lovDs) {
                  lovDs.unSelectAll();
                  lovDs.clearCachedSelected();
                }
              },
            }}
        >
          <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
          {intl.get('hzero.common.button.add').d('新增')}
        </Lov>,
          'delete',
        ]
      : [];
  }, [isEdit]);

  const columns = [
    {
      name: 'userId',
      editor: isEdit,
    },
    {
      name: 'realName',
    },
    {
      name: 'email',
    },
    {
      name: 'phone',
    },
  ];

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={getButtons()}
      style={{ maxHeight: 600 }}
      selectionMode={isEdit ? 'rowbox' : 'none'}
      customizedCode="sslm.member-supplier.contact"
    />
  );
};

export default forwardRef(Contact);
