/**
 * 授权人员模拟穿梭框
 */
import React, { useEffect, useState } from 'react';
import { Transfer, Spin } from 'choerodon-ui/pro';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import {
  fetchMemberList,
  getAddedMember,
  fetchAddAuthMember,
  fetchRemoveAuthMember,
} from '@/services/supplierElecSignWorkplaceService';
import styles from './PeopleTransfer.less';

const { Option } = Transfer;

let powerMap = {};
let defaultAddList = [];

export default function PeopleTransfer(props) {
  const { authType, companyId, sealId, sealCode, tenantId } = props;

  const [optionList, setOption] = useState([]);
  const [defaultVal, setDefault] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initList();

    return () => {
      powerMap = {};
      defaultAddList = [];
    };
  }, []);

  const initList = async () => {
    powerMap = {};
    // defMap = {};

    setLoading(true);
    fetchMemberList({
      companyId,
      impowerType: authType,
      page: -1,
    }).then((res) => {
      setLoading(false);
      if (getResponse(res) && res.content && res.content.length) {
        res.content.forEach((rcd) => {
          // 存储所有数据的 impowerId
          powerMap[rcd.userId] = rcd.impowerId;
        });
        setOption(res.content);
      }
    });

    const result = await getAddedMember({ sealId, companyId, impowerType: authType });
    if (getResponse(result)) {
      const defaultList = result?.content ?? [];
      defaultAddList = [...defaultList];

      const ids = defaultList.map((item) => item.userId);
      const newSet = new Set([...ids]);
      setDefault(Array.from(newSet));
    }
  };

  const handleChange = (value = [], oldValue = []) => {
    if (
      (value && oldValue && value.length > oldValue.length) ||
      (value && value.length && !oldValue)
    ) {
      // 新增数据
      const addList = [];
      value.forEach((item) => {
        if (!oldValue || oldValue.indexOf(item) === -1) {
          addList.push({
            impowerType: authType,
            impowerId: powerMap[item],
            sealCode,
            sealId,
            userId: item,
            tenantId,
          });
        }
      });

      if (addList.length) {
        setLoading(true);
        fetchAddAuthMember({
          list: addList,
          tenantId,
        }).then((res) => {
          setLoading(false);
          if (getResponse(res)) {
            initList();
          }
        });
      }
    }

    if (
      (value && oldValue && value.length < oldValue.length) ||
      (!value && oldValue && oldValue.length)
    ) {
      // 移除数据
      const rmList = [];
      oldValue.forEach((item) => {
        if (!value || value.indexOf(item) === -1) {
          const cached = defaultAddList.filter((rcd) => rcd.userId === item);
          const obj = cached.length ? cached[0] : {};

          rmList.push({
            impowerType: authType,
            impowerId: powerMap[item],
            sealCode,
            sealId,
            userId: item,
            tenantId,
            ...obj,
          });
        }
      });

      if (rmList.length) {
        setLoading(true);
        fetchRemoveAuthMember({
          list: rmList,
          tenantId,
        }).then((res) => {
          setLoading(false);
          if (getResponse(res)) {
            initList();
          }
        });
      }
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['operation-record-transfer']}>
        <Transfer
          name="textName"
          searchable
          value={defaultVal}
          onChange={handleChange}
          style={{
            width: '320px',
            height: '550px',
          }}
        >
          {optionList.map((item) => {
            return (
              <Option key={item.userId} value={item.userId}>
                {`${item.loginName} (${item.authName})`}
              </Option>
            );
          })}
        </Transfer>
      </div>
    </Spin>
  );
}
