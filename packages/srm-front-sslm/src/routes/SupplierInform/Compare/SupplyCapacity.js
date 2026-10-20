/**
 * SupplyCapacity - 供货能力清单
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { formatYesOrNo, renderAttachmentText } from '@/routes/components/utils';
import styles from '@/routes/index.less';

import AttachmentDetailsModal from './AttachmentDetailsModal';

@connect(({ user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    return {
      primaryColor: colorCode,
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {};
})
export default class SupplyCapacity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false, // 附件上传模态框
      abilityLineId: null, // 供货能力清单行id
    };
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttamentModal(record = {}) {
    const { modalVisible } = this.state;
    const { abilityLineId } = record;
    this.setState({ modalVisible: !modalVisible, abilityLineId });
  }

  render() {
    const { dataSource, attachment, customizeTable = () => {}, linkColor } = this.props;
    const { modalVisible, abilityLineId } = this.state;

    const attachmentModalProps = {
      isVisible: modalVisible,
      abilityLineId,
      attachment,
      onCancel: this.handleAttamentModal,
    };

    const columns = [
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.itemName').d('物料描述'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.itemCategoryCode').d('品类代码'),
        dataIndex: 'categoryCode',
        width: 100,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.itemCategoryDesc').d('品类描述'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.supplyFlag').d('是否可供'),
        dataIndex: 'supplyFlag',
        width: 100,
        render: val => formatYesOrNo(val),
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.oneTimeFlag`).d('是否一次性供货'),
        width: 120,
        dataIndex: 'oneTimeFlag',
        render: val => formatYesOrNo(val),
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
        dataIndex: 'adapterProducts',
        width: 120,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
        width: 150,
        dataIndex: 'countryIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
        width: 150,
        dataIndex: 'regionIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
        width: 150,
        dataIndex: 'cityIdMeaning',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
        width: 150,
        dataIndex: 'dateFrom',
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
        width: 150,
        dataIndex: 'dateTo',
        render: dateRender,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`)
          .d('库存组织'),
        width: 100,
        dataIndex: 'inventoryOrganizationId',
        render: (val, record) => {
          return (
            <LovMulti
              code="SSLM.INV_ORGANIZATION"
              value={record.inventoryOrganizationId}
              viewOnly
            />
          );
        },
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        dataIndex: 'attachment',
        width: 110,
        render: (_, record) => {
          const redFlag =
            ['update', 'insert', 'delete'].includes(record.attachmentStateFlag) ||
            ['insert', 'delete'].includes(record.supChangeBeanStateFlag);
          return (
            <div
              className={classnames({
                [styles['sslm-compare-info-style']]: redFlag,
              })}
            >
              <a
                onClick={() => this.handleAttamentModal(record)}
                disabled={record._status === 'create'}
              >
                {renderAttachmentText({ editable: false, fileCount: record.fileCount, linkColor })}
              </a>
            </div>
          );
        },
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
          .d('采购组织'),
        dataIndex: 'purchaseOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
        dataIndex: 'manufacturer',
        width: 150,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
      },
    ].map(n => ({
      ...n,
      render: (val, record) => {
        return (
          <div
            style={{
              color:
                (['update', 'insert', 'delete'].includes(record[`${n.dataIndex}StateFlag`]) ||
                  ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                'red',
            }}
          >
            {n.render ? n.render(val, record) : val}
          </div>
        );
      },
    }));

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COMPARE_SUPPLY_ABILITY', // 单元编码，必传
          },
          <Table
            bordered
            rowKey="abilityLineId"
            pagination={false}
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: scrollX }}
          />
        )}
        {/* 上传附件模态框 */}
        {modalVisible && <AttachmentDetailsModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
