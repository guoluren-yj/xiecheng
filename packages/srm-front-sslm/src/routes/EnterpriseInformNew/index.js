/**
 * index.js - 企业信息变更
 * @date: 2023-08-24
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { isEmpty, compose } from 'lodash';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useState } from 'react';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';

import MultipleTextField from '@/routes/components/MultipleTextField';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { dsDeleteData } from '@/routes/components/utils/utils';
import { saveApplication } from '@/services/enterpriseInformService';

import { getIndexDS } from './stores/getListTableDS';
import CreateForm from './Create';
import { getCreateFormDS } from './Create/stores/indexDS';
import styles from './styles.less';

const Index = ({ dispatch, tableDs, customizeTable, custLoading, customizeForm }) => {
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  // 跳转详情页
  const handleJumpDetail = useCallback((record = {}, type = 'view') => {
    const { changeReqId, partnerTenantId, partnerTenantNum } = record;
    // 清空选择的记录
    tableDs.unSelectAll();
    tableDs.clearCachedSelected();
    dispatch(
      routerRedux.push({
        pathname: `/sslm/enterprise-inform-change-new/detail/${type}`,
        search: querystring.stringify({
          changeReqId,
          partnerTenantId,
          partnerTenantNum,
          tenantId: partnerTenantId, // 个性化字段配置参数
        }),
      })
    );
  }, []);

  const columns = [
    {
      name: 'reqStatusMeaning',
      width: 120,
      lock: true,
      renderer: renderStatus,
    },
    {
      name: 'action',
      width: 60,
      renderer: ({ record }) => {
        const reqStatus = record.get('reqStatus');
        const showBtn = ['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(reqStatus);
        return showBtn ? (
          <Button
            funcType="link"
            onClick={() => {
              const rowDate = record.toData();
              handleJumpDetail(rowDate, 'edit');
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>
        ) : null;
      },
    },
    {
      name: 'changeReqNumber',
      width: 130,
      renderer: ({ value, record }) => {
        const rowDate = record.toData();
        return <a onClick={() => handleJumpDetail(rowDate, 'view')}>{value}</a>;
      },
    },
    {
      name: 'changeLevelMeaning',
      width: 100,
    },
    {
      name: 'companyNum',
      width: 120,
    },
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'partnerCompanyName',
      width: 180,
    },
    {
      name: 'createUserName',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 100,
    },
    {
      name: 'webUrl',
      width: 200,
    },
  ];

  // 新建回调
  const handleCreate = useCallback(() => {
    const createFormDs = new DataSet(getCreateFormDS());
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      title: intl
        .get('sslm.enterpriseInform.view.title.createApplication')
        .d('新建企业信息变更申请单'),
      children: (
        <CreateForm
          dataSet={createFormDs}
          custLoading={custLoading}
          customizeForm={customizeForm}
          code="SSLM.ENTERPRISE_INFORM_CHANGE_NEW.CREATE_FORM"
        />
      ),
      className: styles['enterprise-info-list-create-modal'],
      onOk: () => {
        return new Promise(async resolve => {
          const validateFlag = await createFormDs.current.validate(true);
          if (validateFlag) {
            const data = createFormDs.current.toJSONData();
            const { changeLevel, partnerCompanyId } = data;
            const formData = {
              ...data,
              customizeUnitCode: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW.CREATE_FORM',
              partnerCompanyId: changeLevel === 'GROUP' ? undefined : partnerCompanyId,
              newFirmChangeFlag: 1,
            };
            saveApplication(formData).then(res => {
              if (getResponse(res)) {
                resolve(true);
                handleJumpDetail(res, 'edit');
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        });
      },
    });
  }, [custLoading]);

  // 删除
  const batchDelete = useCallback(() => {
    dsDeleteData({ dataSet: tableDs });
  }, []);

  // 操作按钮集合
  const OperationButtons = observer(props => {
    const isDisabled = isEmpty(props.dataSet.selected);
    const buttons = [
      {
        btnComp: Button,
        btnProps: {
          icon: 'add',
          color: 'primary',
          onClick: () => handleCreate(),
        },
        child: intl.get('hzero.common.button.create').d('新建'),
      },
      {
        btnComp: Button,
        btnProps: {
          icon: 'delete_sweep',
          disabled: isDisabled,
          funcType: 'flat',
          onClick: () => batchDelete(),
          wait: 200,
          waitType: 'throttle',
        },
        child: intl.get('sslm.common.button.batchDelete').d('批量删除'),
      },
    ];
    return <DynamicButtons buttons={buttons} />;
  });

  const handleQuery = (queryProps = {}) => {
    const { params } = queryProps;
    if (tableDs.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = tableDs.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['changeReqNumber'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.changeReqNumber;
      clearParams.changeReqNumber = isEmpty(reqList) ? null : reqList.join(',');
      tableDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        tableDs.query(tableDs.currentPage);
      } else {
        tableDs.query();
      }
    } else {
      tableDs.query(tableDs.currentPage);
    }
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(queryDataSet => {
    return (
      <MultipleTextField
        name="changeReqNumber"
        dataSet={queryDataSet}
        placeholder={intl.get('sslm.common.modal.sample.multiSelectReqNums').d('请输入申请单号')}
      />
    );
  }, []);

  // 清空、重置回调
  const clearValues = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current.reset();
  }, []);

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.enterpriseInform.view.title.changeApplication').d('企业信息变更')}
      >
        <OperationButtons dataSet={tableDs} />
      </Header>
      <Content>
        <div style={{ height: tableHeight.fixedHeight }}>
          {customizeTable(
            {
              code: 'SSLM.ENTERPRISE_INFORM_CHANGE_NEW.LIST.TABLE',
            },
            <SearchBarTable
              cacheState
              dataSet={tableDs}
              columns={columns}
              style={{ maxHeight: tableMaxHeight.fixedHeight }}
              searchCode="SSLM.ENTERPRISE_INFORM_CHANGE_NEW.LIST.SEARCH_BAR"
              searchBarConfig={{
                editorProps: {
                  reqStatus: {
                    optionsFilter: record =>
                      !['SUBMIT_APPROVE', 'CANCEL_SUBMIT'].includes(record.get('value')),
                  },
                },
                left: {
                  render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
                },
                onQuery: queryProps => handleQuery(queryProps),
                onReset: clearValues,
                onClear: clearValues,
                onFieldChange: () => {
                  setPageChacheFlag(false);
                },
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.enterpriseInform', 'sslm.common'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.ENTERPRISE_INFORM_CHANGE_NEW.LIST.TABLE',
      'SSLM.ENTERPRISE_INFORM_CHANGE_NEW.CREATE_FORM',
    ],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(getIndexDS());
      return { tableDs };
    },
    { cacheState: true }
  )
)(Index);
