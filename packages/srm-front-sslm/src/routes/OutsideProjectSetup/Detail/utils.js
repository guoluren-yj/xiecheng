/*
 * @Description: 外部寻源-utils
 * @Date: 2025-05-22 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import classNames from 'classnames';
import React, { useState } from 'react';
import { Collapse } from 'choerodon-ui';
import {
  Table,
  // Cascader,
} from 'choerodon-ui/pro';
// import { isArray } from 'lodash';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';

import { renderStatus } from '@/routes/components/utils';
import GeneralForm from '@/routes/components/GeneralForm';
import FlexLayout from '../components/CustCard';
import styles from './index.less';

const { Panel } = Collapse;

// 需要单独处理的模块
const modules = ['itemInfo', 'quotationInfo', 'supplierRequired'];

// 明细行按钮组
export const buttons = ['add', 'delete'];

/**
 * Component,明细组件
 * @delivery {*} props
 * @returns []
 */
export const Component = props => {
  const {
    editor,
    columns,
    reqStatus,
    responseRef,
    lineDataSet,
    extSourceReqId,
    customizeForm,
  } = props;

  const isEdit = editor && ['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus);

  const [activeTab, setActiveTab] = useState('supplier'); // 默认选中供应商维度

  // 切换供应商/物料
  const onBtnClick = e => {
    setActiveTab(e);
  };

  const detailItem = detailParams();
  const finallyItem = ['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus)
    ? detailItem.filter(i => i.cmpType !== 'cards')
    : detailItem;

  const ComponentList = finallyItem.reduce((acc, tab) => {
    const formProps = {
      isEdit,
      fields: columns[tab.key],
      dataSet: lineDataSet[tab.key],
    };

    const Cmp = (
      <Content
        style={{ margin: '8px 8px 0', padding: tab.cmpType === 'cards' && '0px' }}
        key={tab.key}
      >
        {tab.cmpType !== 'cards' && <div>{tab.title}</div>}

        {tab.cmpType === 'cards' && (
          <div className={styles['page-content-card-wrap']}>
            <div className={styles['page-content-title']}>{tab.title}</div>
            <div className={styles['page-content-btn']}>
              <div
                key="supplier"
                onClick={() => onBtnClick('supplier')}
                className={classNames(styles['page-content-btn-supplier'], {
                  [styles['supplier-item']]: activeTab === 'supplier',
                })}
              >
                {intl.get('sslm.outsideProjectSetup.modal.supplierLatitude').d('供应商维度')}
              </div>
              <div
                key="item"
                onClick={() => onBtnClick('item')}
                className={classNames(styles['page-content-btn-item'], {
                  [styles['supplier-item']]: activeTab === 'item',
                })}
              >
                {intl.get('sslm.outsideProjectSetup.modal.itemLatitude').d('物料维度')}
              </div>
            </div>
          </div>
        )}

        {tab.cmpType === 'form' && <GeneralForm key={tab.key} {...formProps} />}

        {tab.cmpType === 'table' && (
          <Table
            virtual
            virtualCell
            key={tab.key}
            dataSet={lineDataSet[tab.key]}
            selectionMode={isEdit ? 'rowbox' : 'none'}
            buttons={isEdit && buttons}
            columns={columns[tab.key]}
          />
        )}

        {tab.cmpType === 'cards' && (
          <FlexLayout
            editor={editor}
            ref={responseRef}
            activeTab={activeTab}
            reqStatus={reqStatus}
            basicDs={lineDataSet.basicInfo}
            customizeForm={customizeForm}
            extSourceReqId={extSourceReqId}
            lastReqStatus={lineDataSet.basicInfo.current?.get('lastReqStatus') || ''}
          />
        )}
      </Content>
    );

    const CollapseCmp = (
      <Panel forceRender key={tab.key} header={tab.title}>
        {tab.cmpType === 'form' && <GeneralForm key={tab.key} {...formProps} />}
        {tab.cmpType === 'table' && (
          <Table
            virtual
            virtualCell
            key={tab.key}
            dataSet={lineDataSet[tab.key]}
            selectionMode={isEdit ? 'rowbox' : 'none'}
            buttons={isEdit && buttons}
            columns={columns[tab.key]}
          />
        )}
      </Panel>
    );

    // 根据reqStatus和组件类型决定渲染Cmp/CollapseCmp
    if (['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus)) {
      acc[tab.key] = Cmp;
    } else {
      acc[tab.key] = modules.includes(tab.key) ? CollapseCmp : Cmp;
    }
    return acc;
  }, {});

  return (
    <>
      {(Object.keys(ComponentList) || []).map(key => {
        if (!['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus)) {
          if (!modules.includes(key)) {
            return ComponentList[key];
          }
          if (modules.includes(key)) {
            return (
              <Collapse
                ghost
                key={key}
                trigger="text-icon"
                expandIconPosition="text-right"
                style={{ margin: '8px 8px 0' }}
              >
                {ComponentList[key]}
              </Collapse>
            );
          }
        }
        return ComponentList[key];
      })}
    </>
  );
};

// 明细title
export const getTitle = () => ({
  read: intl.get(`hzero.common.button.look`).d('查看'),
  create: intl.get(`hzero.common.button.creat`).d('新建'),
  detail: intl.get('hzero.common.button.edit').d('编辑'),
});

/**
 * 创建标签数组（自动生成国际化键）
 * @object {string} unitCode - 个性化单元编码, cmpType - 组件类型, key - 唯一标识, title - 标题
 * @returns {Array} - 标签数组
 * @description 所有属性都不可删除
 */
export const detailParams = () => [
  {
    cmpType: 'form',
    key: 'basicInfo',
    title: intl.get(`hzero.common.view.baseInfo`).d('基本信息'),
  },
  {
    cmpType: 'cards',
    key: 'supplierResInfo',
    title: intl.get('sslm.outsideProjectSetup.view.title.supplierResInfo').d('供应商响应'),
  },
  {
    cmpType: 'table',
    key: 'itemInfo',
    title: intl.get('sslm.outsideProjectSetup.view.title.itemInfo').d('需求物料信息'),
  },
  {
    cmpType: 'form',
    key: 'quotationInfo',
    title: intl.get('sslm.outsideProjectSetup.view.title.quotationInfo').d('报价要求'),
  },
  {
    cmpType: 'form',
    key: 'supplierRequired',
    title: intl.get('sslm.outsideProjectSetup.view.title.supplierInfo').d('供应商要求'),
  },
];

export function detailColumns({ reqStatus, isEdit, quotaDs }) {
  // 基础信息
  const basicInfo = [
    {
      name: 'reqNumber',
    },
    {
      name: 'reqTitle',
    },
    {
      name: 'reqStatus',
      componentType: 'SELECT',
      renderer: renderStatus,
    },
    {
      name: 'companyId',
      componentType: 'LOV',
    },
    {
      name: 'endDate',
      componentType: 'DATEPICKER',
    },
    {
      name: 'sourceContactUserId',
      componentType: 'LOV',
    },
    {
      name: 'remark',
      componentType: 'TEXTAREA',
      newLine: true,
      rows: 3,
      colSpan: 2,
      resize: 'vertical',
    },
    {
      name: 'rejectRemark',
      componentType: 'TEXTAREA',
      newLine: true,
      rows: 3,
      colSpan: 2,
      resize: 'vertical',
      hidden: !['CONFIRM_EXT_REJECTED'].includes(reqStatus),
    },
  ];

  // 需求物料信息
  const itemInfo = [
    {
      width: 140,
      name: 'itemName',
      editor: isEdit,
    },
    {
      width: 120,
      name: 'quotaQuantity',
      editor: isEdit,
    },
    {
      width: 120,
      name: 'quotaUom',
      editor: isEdit,
    },
    {
      width: 120,
      name: 'targetPrice',
      editor: isEdit,
    },
    {
      width: 150,
      name: 'pricePublicFlag',
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value) || '-',
    },
    {
      width: 150,
      name: 'itemDesc',
      editor: isEdit,
    },
    // {
    //   name: 'craft',
    //   width: 170,
    //   editor: record =>
    //     isEdit && (
    //       <Cascader
    //         onChange={data => {
    //           if (data && isArray(data)) {
    //             record.set('mainProcess', data[0]);
    //             record.set('subProcess', data[1]);
    //           } else {
    //             record.set('mainProcess', null);
    //             record.set('subProcess', null);
    //           }
    //         }}
    //       />
    //     ),
    // },
    // {
    //   name: 'materialGrade',
    //   width: 150,
    //   editor: isEdit,
    // },
    {
      width: 120,
      name: 'pictureUuid',
      editor: isEdit,
    },
  ];

  // 报价要求
  const quotationInfo = [
    {
      name: 'paymentTerm',
      componentType: 'SELECT',
    },
    {
      name: 'freightTerm',
      componentType: 'SELECT',
    },
    {
      name: 'confidentAgreement',
      componentType: 'SELECT',
    },
    {
      name: 'currency',
      componentType: 'SELECT',
    },
    {
      name: 'regionPathName',
      componentType: 'REGIONCASCADE',
      record: quotaDs.current,
    },
    {
      name: 'deliveryAddress',
    },
  ];

  // 供应商要求
  const supplierRequired = [
    {
      name: 'companyType',
      componentType: 'SELECT',
    },
    {
      name: 'authCertification',
      componentType: 'SELECT',
    },
    {
      name: 'annualOutput',
      componentType: 'SELECT',
    },
    {
      name: 'employeeNumber',
      componentType: 'SELECT',
    },
    {
      name: 'regionIds',
      componentType: 'LOV',
    },
  ];

  return { basicInfo, itemInfo, quotationInfo, supplierRequired };
}
