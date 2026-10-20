/**
 * index.js - 签署节点信息
 * @date: 2025-06-26
 * @author: CDJ
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment, useEffect, useCallback, useState } from 'react';
import { isEmpty } from 'lodash';

import { Form, Table, Select } from 'choerodon-ui/pro';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { dsDeleteData } from '@/utils/util';
import { fetPartnerInfoByPcHeaderId } from '@/services/workspaceService';

import ConstructForm from '../ContractHeader/ConstructForm';

const { Option } = Select;

const Index = ({ headerDs, signNodeDs, isEdit = false, customizeTable, partnerDs }) => {
  const pcHeaderId = headerDs?.current?.get('pcHeaderId');
  // 伙伴类型值列表
  const [partnerTypeValueList, setPartnerTypeValueList] = useState([]);
  const [spinProps, setSpinProps] = useState({});

  useEffect(() => {
    handlePartnerInfoLoad();
    // 伙伴信息ds绑定签署节点ds
    partnerDs.setState('signNodeDs', signNodeDs);
    signNodeDs.setState('headerDs', headerDs);
    // partnerDs.addEventListener('update', handlePartnerInfoUpdate);
    partnerDs.addEventListener('load', handlePartnerInfoLoad);
    return () => {
      // partnerDs.removeEventListener('update', handlePartnerInfoUpdate);
      partnerDs.removeEventListener('load', handlePartnerInfoLoad);
    };
  }, []);

  // 监听伙伴信息的伙伴类型名称字段变化
  // const handlePartnerInfoUpdate = ({ name }) => {
  //   if(name === "partnerTypeName"){
  //     // 这里不直接使用setPartnerTypeChangeFlag(!partnerTypeChangeFlag)原因是partnerTypeChangeFlag这个值只取第一次的，之后不会改变因为useEffect没有依赖项
  //     // 使用更新ds的state来达到相同的效果
  //     const fieldUpdateFlag = signNodeDs.getState('fieldUpdateFlag');
  //     setPartnerTypeChangeFlag(!fieldUpdateFlag);
  //     signNodeDs.setState('fieldUpdateFlag', !fieldUpdateFlag);
  //   }
  // };

  // 获取伙伴信息表格数据，用作值集
  const handlePartnerInfoLoad = () => {
    setSpinProps({ spinning: true });
    fetPartnerInfoByPcHeaderId({ pcHeaderId })
      .then((res) => {
        if (getResponse(res)) {
          setPartnerTypeValueList(res);
        }
      })
      .finally(() => setSpinProps({}));
  };

  // 切换伙伴类型重新赋值
  const handleSelectChange = (value, record) => {
    const setNullObj = {
      partnerTypeName: null,
      partnerTypeCode: null,
      pcPartnerId: null,
      companyId: null,
      organizationId: null,
    };
    if (!value) {
      record.set(setNullObj);
    } else {
      const firstPartnerInfo = (partnerTypeValueList || []).find(
        (i) => i.partnerTypeCode === value
      );
      if (firstPartnerInfo) {
        const {
          partnerTypeCode,
          partnerTypeName,
          partnerId,
          companyId,
          organizationId,
          tenantId,
        } = firstPartnerInfo;
        record.set({
          partnerTypeName,
          partnerTypeCode,
          pcPartnerId: partnerId,
          companyId,
          organizationId,
          tenantId,
        });
      } else {
        record.set(setNullObj);
      }
    }
  };

  /**
   * 处理新建
   */
  const handleCreate = async () => {
    // 先保存伙伴信息
    const partnerValidateFlag = await partnerDs.validate();
    if (!partnerValidateFlag || partnerDs.dirty) {
      notification.error({
        description: intl
          .get('spcm.common.model.common.careteSignInfoMsg')
          .d('请先保存伙伴信息，在维护签署节点信息。'),
      });
      return;
    }
    signNodeDs.create(
      {
        tenantId: getCurrentOrganizationId(),
        pcHeaderId,
      },
      0
    );
  };

  const getColumns = () => {
    const columns = [
      {
        name: 'signOrder',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'partnerTypeName',
        width: 150,
        editor: (record) =>
          isEdit && (
            <Select onChange={(value) => handleSelectChange(value, record)}>
              {/* {partnerList
              .filter((item) => item.enabledFlag === 1 && partnerIdList.includes(item.partnerTypeId))
              .map((i) => (
                <Option
                  key={i.partnerTypeId}
                  value={i.partnerTypeId}
                >
                  {i.partnerTypeName}
                </Option>
              ))} */}
              {partnerTypeValueList.map((i) => (
                <Option key={i.partnerTypeCode} value={i.partnerTypeCode}>
                  {i.partnerTypeName}
                </Option>
              ))}
            </Select>
          ),
      },
      {
        name: 'partnerTypeCode',
        width: 180,
      },
      {
        name: 'accountType',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'userId',
        width: 300,
        editor: isEdit,
      },
      {
        name: 'userName',
        width: 300,
        editor: isEdit,
      },
      {
        name: 'email',
        width: 250,
        editor: isEdit,
      },
      {
        name: 'sealType',
        width: 160,
        editor: isEdit,
      },
      {
        name: 'keyWord',
        width: 120,
        editor: isEdit,
      },
      {
        name: 'statusCode',
        width: 80,
      },
      {
        name: 'transferRemark',
        width: 100,
      },
    ];
    return columns;
  };

  const getButtons = useCallback(() => {
    return isEdit
      ? [
          ['add', { onClick: handleCreate }],
          [
            'delete',
            {
              onClick: () => {
                // 过滤出已保存的数据
                const isSavedData = signNodeDs.selected.filter((record) => record.get('id'));
                if (isEmpty(isSavedData)) {
                  signNodeDs.delete(signNodeDs.selected, false);
                } else {
                  dsDeleteData({ dataSet: signNodeDs });
                }
              },
            },
          ],
          [
            'save',
            {
              onClick: () => {
                signNodeDs.submit().then((res) => {
                  if (res) {
                    signNodeDs.query();
                  }
                });
              },
            },
          ],
        ]
      : [];
  }, [isEdit, signNodeDs]);

  return (
    <Fragment>
      <Form
        useWidthPercent
        dataSet={headerDs}
        columns={3}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        style={{ marginBlock: 16 }}
      >
        <ConstructForm
          // formType="Select"
          isEdit={isEdit}
          name="electricSignOrder"
        />
      </Form>
      {customizeTable(
        {
          code: '',
        },
        <Table
          dataSet={signNodeDs}
          columns={getColumns()}
          buttons={getButtons()}
          // custLoading={custLoading}
          style={{ maxHeight: '400px' }}
          selectionMode={isEdit ? 'rowbox' : 'none'}
          spin={spinProps}
        />
      )}
    </Fragment>
  );
};

export default Index;
