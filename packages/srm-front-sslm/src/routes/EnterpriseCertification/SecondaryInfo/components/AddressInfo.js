/**
 * Address - 地址
 * @date: 2021-11-25
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { Table, TextField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { Content } from 'components/Page';

import RegionCascade from '@/routes/components/RegionCascade';
import styles from '../../index.less';

const AddressInfo = forwardRef(
  (
    {
      dataSet,
      isEdit,
      allInfo = {},
      addressInfo = {},
      changeReqId,
      showAllTab = true,
      defaultCountryInfo = {},
      remoteHiddenTips = false,
    },
    ref
  ) => {
    const { remark, atLeastFlag: atLeast = 1, enableFieldList = [] } = addressInfo;
    const { bussinessInfo = {}, basicInfo = {} } = allInfo;
    const { industryReqList } = bussinessInfo || {};
    const queryFlag = !isEmpty(basicInfo);
    const showTips = isEdit && !showAllTab && !!atLeast && !remoteHiddenTips;

    useEffect(() => {
      handleQueryAddress();
    }, [queryFlag]);

    const handleQueryAddress = useCallback(() => {
      if (changeReqId && queryFlag) {
        const {
          registeredCountryCode,
          registeredCountryId,
          registeredCountryName,
          regionPathName,
          registeredRegionId,
          addressDetail,
          _tls = {},
        } = basicInfo;
        const { addressDetail: addressDetailTls = {} } = _tls || {};
        dataSet.setQueryParameter('changeReqId', changeReqId);
        dataSet.query().then(address => {
          // 判断第一次保存才带出一条默认地址信息，这里通过是否填写业务信息来判断是否保存第一次保存
          if (isEmpty(address) && isEmpty(industryReqList)) {
            dataSet.loadData([]);
            dataSet.create({
              countryObj: {
                countryId: registeredCountryId,
                countryCode: registeredCountryCode,
                countryName: registeredCountryName,
              },
              regionId: registeredRegionId,
              regionPathName,
              addressDetail,
              _tls: {
                addressDetail: addressDetailTls,
              },
            });
          }
        });
      }
    }, [queryFlag]);

    useImperativeHandle(ref, () => ({
      handleQueryAddress,
    }));

    const handleAdd = useCallback(() => {
      const { domesticForeignRelation } = basicInfo;
      const { countryId, countryName, countryCode, quickIndex } = defaultCountryInfo;
      const currentRow = dataSet.current || {};
      if (domesticForeignRelation === 1) {
        currentRow.set({
          countryObj: {
            countryId,
            countryName,
            countryCode,
            quickIndex,
          },
        });
      }
    }, [queryFlag]);

    const columns = [
      {
        name: 'countryObj',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'regionPathName',
        width: 240,
        className: styles['region-td'],
        renderer: ({ record }) => <RegionCascade record={record} editable={isEdit} />,
      },
      {
        name: 'addressDetail',
        editor: isEdit,
      },
      {
        name: 'postCode',
        width: 150,
        editor: isEdit && <TextField />,
        // editor: isEdit && <TextField restrict="0-9" maxLength={6} />,
      },
      {
        name: 'description',
        width: 200,
        editor: isEdit,
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
          [
            'add',
            {
              afterClick: handleAdd,
            },
          ],
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
        <div className={styles['certification-title']} id="spfm_company_address">
          {intl.get(`spfm.enterprise.view.message.page.addressInfo`).d('地址信息')}
          {showTips && (
            <span className={styles['certification-title-tips']}>
              {intl
                .get('spfm.enterpriseCertification.view.register.addressAtLast', {
                  atLeast,
                })
                .d(`请至少填写${atLeast}条地址信息`)}
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

export default AddressInfo;
