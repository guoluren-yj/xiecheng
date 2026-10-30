/**
 * Contact - 联系人
 * @date: 2021-11-25
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';

import styles from '../../index.less';

const Contact = forwardRef(
  (
    { dataSet, isEdit, allInfo = {}, contactInfo = {}, userInfo = {}, remoteHiddenTips = false },
    ref
  ) => {
    const { remark, atLeastFlag: atLeast = 1, enableFieldList = [] } = contactInfo;
    const { basicInfo = {} } = allInfo;
    const queryFlag = !isEmpty(basicInfo);
    const showTips = !!atLeast && isEdit && !remoteHiddenTips;

    useEffect(() => {
      handleQueryContact();
    }, [queryFlag]);

    const handleQueryContact = useCallback(() => {
      if (queryFlag) {
        const { changeReqId, domesticForeignRelation } = basicInfo;
        dataSet.setQueryParameter('changeReqId', changeReqId);
        dataSet.query().then(res => {
          // src-9159 页面编辑时联系人默认带出一条
          if (isEmpty(res) && isEdit) {
            dataSet.loadData([]);
            // 区分个人和其他注册方式
            if (domesticForeignRelation !== 2) {
              const { realName, phone, email, internationalTelCode } = userInfo;
              dataSet.create({
                name: realName,
                mail: email,
                mobilephone: phone,
                internationalTelCode,
              });
            } else {
              const { companyName, phone, internationalTelCode, email } = basicInfo;
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
    }, [queryFlag]);

    useImperativeHandle(ref, () => ({
      handleQueryContact,
    }));

    const columns = [
      {
        name: 'name',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'gender',
        width: 100,
        editor: isEdit,
      },
      {
        name: 'idType',
        width: 120,
        editor: isEdit,
      },
      {
        name: 'idNum',
        width: 150,
        editor: <SecretField readOnly={!isEdit} displayOutput={!isEdit} />,
      },
      {
        name: 'contactType',
        width: 120,
        editor: isEdit,
      },
      {
        name: 'mobilephone',
        width: 280,
        editor: isEdit,
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
    ].filter(item => {
      return enableFieldList.includes(item.name);
    });
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
      <Content>
        <div className={styles['certification-title']} id="spfm_company_contact">
          {intl.get('spfm.supplierRegister.view.title.contactInfo').d('联系人信息')}
          {showTips && (
            <span className={styles['certification-title-tips']}>
              {intl
                .get('spfm.enterpriseCertification.view.register.contactAtLast', {
                  atLeast,
                })
                .d(`请至少填写${atLeast}条联系人`)}
            </span>
          )}
        </div>
        {remark && <Alert showIcon type="info" message={remark} style={{ marginBottom: 8 }} />}
        <Table
          dataSet={dataSet}
          columns={columns}
          buttons={buttons}
          selectionMode={isEdit ? 'rowbox' : 'click'}
        />
      </Content>
    );
  }
);

export default Contact;
