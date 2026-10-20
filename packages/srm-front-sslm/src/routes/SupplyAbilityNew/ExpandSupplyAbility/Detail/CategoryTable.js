/*
 * @Date: 2022-02-18 10:13:48
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { dsDeleteData } from '@/routes/components/utils/utils';

import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { renderC7NAttachmentText } from '@/routes/components/utils';
import Attachment from './Attachment';

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
export default class CategoryTable extends Component {
  // 查看附件
  @Bind()
  handleAttachment(record) {
    const {
      data: { abilityExpandLineId },
    } = record;
    Modal.open({
      drawer: true,
      okCancel: false,
      key: Modal.key(),
      destroyOnClose: true,
      style: { width: 850 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('hzero.common.upload.viewOnlyText').d('查看附件'),
      children: <Attachment supplyAbilityExpandLineId={abilityExpandLineId} />,
    });
  }

  render() {
    const {
      dataSet,
      customizeTable,
      customizeUnitCode,
      custLoading,
      isEdit,
      linkColor,
    } = this.props;
    const columns = [
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'itemCategoryCode',
        width: 100,
      },
      {
        name: 'itemCategoryName',
        width: 100,
      },
      {
        width: 100,
        name: 'supplyFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'adapterProducts',
        width: 100,
      },
      {
        width: 100,
        name: 'countryIdMeaning',
      },
      {
        width: 100,
        name: 'regionIdMeaning',
      },
      {
        width: 100,
        name: 'cityIdMeaning',
      },
      {
        name: 'dateFrom',
        width: 120,
      },
      {
        name: 'dateTo',
        width: 120,
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'quotaRatio',
        width: 200,
      },
      {
        name: 'inventoryOrganizationIdMeaning',
        width: 100,
      },
      {
        name: 'purchaseOrganizationName',
        width: 150,
      },
      {
        name: 'manufacturer',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'attachment',
        width: 90,
        renderer: ({ record }) => (
          <a onClick={() => this.handleAttachment(record)}>
            {renderC7NAttachmentText({
              editable: false,
              fileCount: record.get('fileCount'),
              linkColor,
            })}
          </a>
        ),
      },
    ];

    const buttons = isEdit
      ? [
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet }),
            },
          ],
        ]
      : [];
    return customizeTable(
      {
        code: customizeUnitCode,
      },
      <Table
        dataSet={dataSet}
        custLoading={custLoading}
        columns={columns}
        selectionMode={isEdit ? 'rowbox' : 'none'}
        buttons={buttons}
        style={{ maxHeight: 390 }}
      />
    );
  }
}
