/* eslint-disable no-shadow */
import React, { Fragment, useState, memo, useEffect } from 'react';

import { Tabs } from 'choerodon-ui';
import { DataSet, Form, Modal, TextField, IntlField, Select } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { Button } from 'components/Permission';

import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';

import intl from 'utils/intl';
import withRemote from 'utils/remote';
import withProps from 'utils/withProps';
import { SRM_MDM } from '_utils/config';
import NewImport from 'components/Import';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { saveAttribute, saveAttributeValue } from '@/services/categoryAttributeService';
import { attributeListDS, attributeValueListDS, attributeTemplateListDS } from './stores/listDs';
import Attribute from './Attribute';
import AttributeValue from './AttributeValue';
import Template from './Template';

import styles from './index.less';

const { TabPane } = Tabs;
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const btnPermissionPrefix = 'srm.bg.manager.mdm.category-attr.button';

const permissionCodeMap = {
  attrDefineImport: `${btnPermissionPrefix}.attr-define-import`,
  attrValueDefineImport: `${btnPermissionPrefix}.attr-value-define-import`,
  attrTempManageImport: `${btnPermissionPrefix}.attr-temp-manage-import`,
};

const importTempCodeMap = {
  attrDefineImport: 'SRM_C_SMDM_CATEGORY_ATTRIBUTE_IMPORT',
  attrValueDefineImport: 'SRM_C_SMDM_CATEGORY_ATTRIBUTE_VALUE_IMPORT',
  attrTempManageImport: 'SRM_C_SMDM_CATEGORY_ATTR_TEMPLATE_IMPORT',
};

const Index = ({
  remote,
  dispatch,
  categoryAttribute,
  attributeListDs,
  attributeValueListDs,
  attributeTemplateListDs,
}) => {
  useEffect(() => {
    attributeTemplateListDs.query();
  }, [attributeTemplateListDs]);

  const [currentTab, setCurrentTab] = useState(categoryAttribute.tabType || 'attributeDefined');

  const handleAttributeOpenModal = (record) => {
    const dataSet = new DataSet(attributeListDS({}));

    let title = intl.get(`${commonPrompt}.attributeCreate`).d('新增属性');

    if (record) {
      title = intl.get(`${commonPrompt}.attributeEdit`).d('编辑属性');
      dataSet.loadData([
        {
          ...record.toData(),
        },
      ]);
    } else {
      dataSet.create({}, 0);
    }

    Modal.open({
      title,
      style: {
        width: 450,
      },
      closable: true,
      drawer: true,
      children: (
        <div>
          <Form dataSet={dataSet} columns={1} labelLayout="float" useColon={false}>
            <TextField name="attributeCode" />
            <IntlField name="attributeName" />
            <Select name="enabledFlag" />
          </Form>
        </div>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const flag = await dataSet.validate();
          if (flag) {
            saveAttribute({
              ...dataSet.current?.toData(),
            })
              .then((res) => {
                if (getResponse(res)) {
                  notification.success();
                  attributeListDs.query();
                }
              })
              .finally(() => {
                resolve();
              });
          } else {
            resolve(false);
          }
        });
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
    });
  };

  const handleAttributeValueOpenModal = (record) => {
    const dataSet = new DataSet(attributeValueListDS({}));

    let title = intl.get(`${commonPrompt}.attributeValueCreate`).d('新增属性值');

    if (record) {
      title = intl.get(`${commonPrompt}.attributeValueEdit`).d('编辑属性值');
      dataSet.loadData([
        {
          ...record.toData(),
        },
      ]);
    } else {
      dataSet.create({}, 0);
    }

    Modal.open({
      title,
      style: {
        width: 450,
      },
      closable: true,
      drawer: true,
      children: (
        <div>
          <Form dataSet={dataSet} columns={1} labelLayout="float" useColon={false}>
            <TextField name="valueCode" />
            <IntlField name="valueName" />
            <Select name="enabledFlag" />
          </Form>
        </div>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const flag = await dataSet.validate();
          if (flag) {
            saveAttributeValue({
              ...dataSet.current?.toData(),
            })
              .then((res) => {
                if (getResponse(res)) {
                  notification.success();
                  attributeValueListDs.query();
                }
              })
              .finally(() => {
                resolve();
              });
          } else {
            resolve(false);
          }
        });
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
    });
  };

  const handleTempPlateToDetail = (record) => {
    if (record) {
      dispatch(
        routerRedux.push({
          pathname: `/smdm/category-attribute/detail/${record.get('templateId')}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/smdm/category-attribute/detail/new`,
        })
      );
    }
  };

  const HeaderBtn = observer(() => {
    return (
      <>
        {currentTab === 'attributeDefined' && (
          <Button
            icon="add"
            type="c7n-pro"
            color="primary"
            funcType="raised"
            onClick={() => {
              handleAttributeOpenModal();
            }}
          >
            {intl.get(`${commonPrompt}.attributeCreate`).d('新增属性')}
          </Button>
        )}
        {currentTab === 'attributeValueDefined' && (
          <Button
            icon="add"
            type="c7n-pro"
            color="primary"
            funcType="raised"
            onClick={() => {
              handleAttributeValueOpenModal();
            }}
          >
            {intl.get(`${commonPrompt}.attributeValueCreate`).d('新增属性值')}
          </Button>
        )}
        {currentTab === 'attributeTempPlateManage' && (
          <Button
            icon="add"
            type="c7n-pro"
            color="primary"
            funcType="raised"
            onClick={() => {
              handleTempPlateToDetail();
            }}
          >
            {intl.get(`${commonPrompt}.tempPlateCreate`).d('新增模版')}
          </Button>
        )}
        {currentTab === 'attributeDefined' && (
          <NewImport
            name="attrDefineImport"
            prefixPatch={SRM_MDM}
            businessObjectTemplateCode={importTempCodeMap.attrDefineImport}
            args={{ templateCode: importTempCodeMap.attrDefineImport }}
            buttonProps={{
              funcType: 'flat',
              permissionList: [{ code: permissionCodeMap.attrDefineImport, type: 'button' }],
            }}
            successCallBack={() => {
              attributeListDs.query();
            }}
          />
        )}
        {currentTab === 'attributeValueDefined' && (
          <NewImport
            name="attrValueDefineImport"
            prefixPatch={SRM_MDM}
            businessObjectTemplateCode={importTempCodeMap.attrValueDefineImport}
            args={{ templateCode: importTempCodeMap.attrValueDefineImport }}
            buttonProps={{
              funcType: 'flat',
              permissionList: [{ code: permissionCodeMap.attrValueDefineImport, type: 'button' }],
            }}
            successCallBack={() => {
              attributeValueListDs.query();
            }}
          />
        )}
        {currentTab === 'attributeTempPlateManage' && (
          <NewImport
            name="attrTempManageImport"
            prefixPatch={SRM_MDM}
            businessObjectTemplateCode={importTempCodeMap.attrTempManageImport}
            args={{ templateCode: importTempCodeMap.attrTempManageImport }}
            buttonProps={{
              funcType: 'flat',
              permissionList: [{ code: permissionCodeMap.attrTempManageImport, type: 'button' }],
            }}
            successCallBack={() => {
              attributeTemplateListDs.query();
            }}
          />
        )}
      </>
    );
  });

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.categoryAttributeTitle`).d('品类属性与模板管理')}>
        <HeaderBtn />
      </Header>
      <Content>
        <Tabs
          className={styles.tabs}
          defaultActiveKey={currentTab}
          activeKey={currentTab}
          onChange={(value) => {
            setCurrentTab(value);
            dispatch({
              type: 'categoryAttribute/updateState',
              payload: { tabType: value },
            });
          }}
        >
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.attributeDefined`).d('属性定义')}</>}
            key="attributeDefined"
          >
            <Attribute dataSet={attributeListDs} handleEdit={handleAttributeOpenModal} />
          </TabPane>
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.attributeValueDefined`).d('属性值定义')}</>}
            key="attributeValueDefined"
          >
            <AttributeValue
              dataSet={attributeValueListDs}
              handleEdit={handleAttributeValueOpenModal}
            />
          </TabPane>
          <TabPane
            tab={<>{intl.get(`${commonPrompt}.attributeTempPlateManage`).d('属性模版管理')}</>}
            key="attributeTempPlateManage"
          >
            <Template
              remote={remote}
              dataSet={attributeTemplateListDs}
              handleEdit={handleTempPlateToDetail}
            />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ categoryAttribute }) => ({
    categoryAttribute,
  })),
  formatterCollections({
    code: ['smdm.common', 'smdm.bank'],
  }),
  withRemote({
    code: 'SMDM.CATEGORY_ATTRIBUTE_LIST_CUX',
    name: 'remote',
  }),
  withProps(
    () => {
      const attributeListDs = new DataSet(attributeListDS({ autoQuery: true }));
      const attributeValueListDs = new DataSet(attributeValueListDS({ autoQuery: true }));
      const attributeTemplateListDs = new DataSet(attributeTemplateListDS({ autoQuery: false }));

      return {
        attributeListDs,
        attributeValueListDs,
        attributeTemplateListDs,
      };
    },
    { cacheState: true }
  )
)(memo(Index));
