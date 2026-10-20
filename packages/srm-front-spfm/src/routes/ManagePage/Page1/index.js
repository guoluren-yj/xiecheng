import React, { useState, useEffect, useCallback } from 'react';
import { DataSet, Form, TextField, TextArea, CheckBox, Lov, Button, Tabs } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import { compose, omit } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import request from 'hzero-front/lib/utils/request';
import axios from 'axios';

import { formDs, roleTplAddMenuDs as _RoleTplAddMenuDs, roleTplDelMenuDs as _RoleTplDelMenuDs } from '@/stores/managePageDs';

import styles from './index.less';

const { TabPane } = Tabs;

const ManagePage = (props) => {
  const { manageFormDs, roleTplAddMenuDs, roleTplDelMenuDs } = props;
  const [loading, setLoading] = useState(false);
  const [roleLoading1, setRoleLoading1] = useState(false);
  const [roleLoading2, setRoleLoading2] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async () => {
    const validateResult = await manageFormDs.validate();
    const tenantIds = manageFormDs.current.get('tenantIds');
    const tenantIdsLength = tenantIds ? tenantIds.length : 0;
    const values = omit(manageFormDs.current.toData(), ['tenantLov', '__dirty']);
    if (!validateResult || tenantIdsLength > 10) {
      setLoading(false);
      return;
    }
    // 勾选状态的检验
    const checkValidate = values.onlyAdmin && values.filterFlag && tenantIdsLength;
    if(checkValidate) {
      notification.error({
        description: intl.get('spfm.managePage.validation.tip1').d('仅刷核企+指定租户管理员角色、指定租户+指定租户管理员角色'),
      });
      setLoading(false);
      return;
    }
    let queryStr = '?';
    Object.keys(values).forEach((key, index, arr) => {
      queryStr += `${key}=${values[key]}`;
      if (index < arr.length - 1) {
        queryStr += '&';
      }
    });
    request(`/iam/v1/fix-permission/addBtnPermission${queryStr}`, {
      method: 'GET',
    })
      .then((res) => {
        if (res && !res.failed && res === 'OK') {
          notification.success();
        }
        if (res && res.failed) {
          notification.error({ message: res.message });
        }
      })
      .finally(() => setLoading(false));
  };

  const handleCommit = () => {
    setLoading(true);
    handleSubmit();
  };

  // 监听值集选择
  useEffect(() => {
    // 获取角色维度是否显示
    axios
      .get(`${HZERO_PLATFORM}/v1/profile-value?profileName=SPFM_MANAGE_PAGE1`)
      .then((res) => {
        const currentName = getCurrentUser().loginName;
        if (res && res.indexOf(currentName) > -1) {
          setShow(true);
        }
      })
      .catch((err) => {
        console.log('get profile value error:', err);
      });
    manageFormDs.addEventListener('update', handleLovSelect);
  }, []);

  const handleLovSelect = useCallback(({ name, value }) => {
    if (name === 'tenantLov') {
      const lovElement = document
        .getElementById('managePage')
        .getElementsByClassName('c7n-pro-field-wrapper')[3];
      if (value && value.length > 10) {
        if (lovElement) {
          const addElement = document.createElement('span');
          addElement.style.color = 'red';
          addElement.id = 'lov-validate-info';
          addElement.innerHTML = `${intl
            .get('spfm.managePage.model.label.max.tenants')
            .d('最多选择10位')}`;
          lovElement.appendChild(addElement);
        }
      } else {
        const validateElement = document.getElementById('lov-validate-info');
        if (lovElement && validateElement) {
          lovElement.removeChild(validateElement);
        }
      }
    }
  }, []);

  const roleTplAddMenuCommit = useCallback(async () => {
    setRoleLoading2(true);
    axios.post(`/iam/v1/fix-permission/single-role/assign-permission`, roleTplAddMenuDs.current.toJSONData()).finally(()=>{setRoleLoading2(false);});
  }, []);

  const roleTplDelMenuCommit = useCallback(async () => {
    setRoleLoading1(true);
    axios.post(`/iam/v1/fix-permission/single-role/revert-permission`, roleTplDelMenuDs.current.toJSONData()).finally(()=>{setRoleLoading1(false);});
  }, []);
  return (
    <>
      <Header title={intl.get('spfm.managePage.header.title.configPage').d('内部配置页面')} />
      <Content>
        {show && (
        <Tabs defaultActiveKey="rolePermission" tabPosition="left" style={{ minHeight: 320 }}>
          <TabPane tab={intl.get('spfm.managePage.title.rolePermission').d('角色新增权限刷入')} key="rolePermission">
            <Form
              className={styles['manage-page']}
              dataSet={manageFormDs}
              labelLayout="horizontal"
              id="managePage"
            >
              <TextField name="sourcePermission" />
              <TextArea name="addPermission" resize="vertical" />
              <CheckBox name="onlyAdmin" />
              <CheckBox name="filterFlag" />
              <Lov name="tenantLov" />
              <Button
                color="primary"
                style={{ width: '60px' }}
                onClick={handleCommit}
                loading={loading}
              >
                {intl.get('hzero.common.model.submit').d('提交')}
              </Button>
            </Form>
          </TabPane>
          <TabPane tab={intl.get('spfm.managePage.title.roleTplDelMenu').d('角色模版删除菜单')} key="roleTplDelMenu">
            <Form
              className={styles['manage-page']}
              dataSet={roleTplDelMenuDs}
              labelLayout="horizontal"
            >
              <TextField name="roleLevelPath" />
              <TextArea name="revertMenus" resize="vertical" />
              <TextArea name="revertPermissions" resize="vertical" />
              <Button
                color="primary"
                style={{ width: '60px' }}
                onClick={roleTplDelMenuCommit}
                loading={roleLoading1}
              >
                {intl.get('hzero.common.model.submit').d('提交')}
              </Button>
            </Form>
          </TabPane>
          <TabPane tab={intl.get('spfm.managePage.title.roleTplAddMenu').d('角色模版增加菜单')} key="roleTplAddMenu">
            <Form
              className={styles['manage-page']}
              dataSet={roleTplAddMenuDs}
              labelLayout="horizontal"
            >
              <TextField name="roleLevelPath" />
              <TextArea name="assignMenus" resize="vertical" />
              <TextArea name="assignPermissions" resize="vertical" />
              <Button
                color="primary"
                style={{ width: '60px' }}
                onClick={roleTplAddMenuCommit}
                loading={roleLoading2}
              >
                {intl.get('hzero.common.model.submit').d('提交')}
              </Button>
            </Form>
          </TabPane>
        </Tabs>
        )}
      </Content>
    </>
  );
};
export default compose(
  formatterCollections({ code: ['spfm.managePage', 'hzero.common'] }),
  withProps(() => {
    const manageFormDs = new DataSet(formDs());
    const roleTplDelMenuDs = new DataSet(_RoleTplDelMenuDs());
    const roleTplAddMenuDs = new DataSet(_RoleTplAddMenuDs());
    return {
      manageFormDs,
      roleTplDelMenuDs,
      roleTplAddMenuDs,
    };
  }, {})
)(ManagePage);
