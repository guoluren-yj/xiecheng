/**
 * Contact - 联系人
 * @date: 2021-11-25
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

const ContactPerson = forwardRef(
  (
    {
      dataSet,
      isEdit: editFlag,
      entryBaseInfo,
      domesticForeignRelation,
      customizedCode,
      customizeTable,
      custLoading,
      disabledObj,
    },
    ref
  ) => {
    const { allDisabled } = disabledObj;
    const isEdit = editFlag && !allDisabled;
    const handleQuery = useCallback(() => {
      return dataSet.query().then(res => {
        if (isEmpty(res)) {
          dataSet.loadData([]);
          // 页面可编辑且没有合作伙伴关系才默认新建一行
          if (isEdit) {
            // 区分个人和其他注册方式
            const { realName, phone, internationalTelCode, email } = entryBaseInfo;
            if (domesticForeignRelation !== '2') {
              dataSet.create({
                name: realName,
                mail: email,
                mobilephone: phone,
                internationalTelCode,
              });
            } else {
              dataSet.create({
                name: realName,
                mail: email,
                mobilephone: phone,
                internationalTelCode,
              });
            }
          }
        }
      });
    }, [dataSet, domesticForeignRelation, entryBaseInfo]);

    useImperativeHandle(ref, () => ({
      handleQuery,
    }));

    useEffect(() => {
      handleQuery();
    }, [dataSet, domesticForeignRelation, entryBaseInfo]);

    const columns = [
      {
        name: 'name',
        width: 150,
        editor: isEdit,
      },
      // {
      //   name: 'gender',
      //   width: 100,
      //   editor: isEdit,
      // },
      {
        name: 'mobilephone',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'mail',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'contactType',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'telephone',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'department',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'position',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'description',
        width: 170,
        editor: isEdit,
      },
      {
        name: 'defaultFlag',
        width: 100,
        editor: isEdit,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'enabledFlag',
        width: 100,
        editor: isEdit,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    const buttons = isEdit
      ? [
          'add',
          [
            'delete',
            {
              onClick: () =>
                dataSet.delete(dataSet.selected, {
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: intl
                    .get('sslm.common.view.message.sureDeleteSelectedRows')
                    .d('确认删除选中行？'),
                }),
            },
          ],
        ]
      : [];
    return customizeTable(
      { code: customizedCode, readOnly: !isEdit },
      <Table
        custLoading={custLoading}
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        selectionMode={isEdit ? 'rowbox' : 'click'}
      />
    );
  }
);

export default ContactPerson;
