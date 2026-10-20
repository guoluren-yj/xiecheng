/**
 * Contact - 联系人
 * @date: 2021-11-25
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import { Table, TextField, Select, Form, Row } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { formatInternationalTel } from './utils';
import styles from './index.less';

const Contact = ({ dataSet, isEdit, companyId, userInfo, legalDS }) => {
  useEffect(() => {
    if (companyId) {
      dataSet.setQueryParameter('companyId', companyId);
      dataSet.query().then((res) => {
        if (isEmpty(res)) {
          dataSet.loadData([]);
          const legalData = legalDS?.current?.toData() || {};
          const { domesticForeignRelation } = legalData;
          // 区分个人和其他注册方式
          if (domesticForeignRelation !== '2') {
            const { realName, phone, email, internationalTelCode } = userInfo || {};
            dataSet.create({
              name: realName,
              mail: email,
              mobilephone: phone,
              internationalTelCode,
            });
          } else {
            const { companyName, phone, internationalTelCode, email } = legalData;
            dataSet.create({
              name: companyName,
              mail: email,
              mobilephone: phone,
              internationalTelCode,
            });
          }
        }
      });
    }
  }, [companyId]);

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
      name: 'mobilephoneField',
      width: 280,
      renderer: ({ record }) => {
        const {
          data: { internationalTelMeaning, mobilephone },
        } = record;
        return isEdit ? (
          <Form record={record} className={classnames(styles['line-form'])}>
            <Row>
              <Select
                clearButton={false}
                name="internationalTelCode"
                style={{ width: '50%', height: 26 }}
              />
              <TextField
                name="mobilephone"
                restrict="a-zA-Z0-9-_"
                style={{ width: '50%', height: 26, marginLeft: '-0.01rem' }}
              />
            </Row>
          </Form>
        ) : (
          formatInternationalTel(internationalTelMeaning, mobilephone)
        );
      },
    },
    {
      name: 'mail',
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
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      selectionMode={isEdit ? 'rowbox' : 'click'}
      // style={{ marginTop: 16 }}
    />
  );
};

export default Contact;
