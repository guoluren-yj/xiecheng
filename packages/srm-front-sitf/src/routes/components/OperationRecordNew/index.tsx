/**
 * OperationRecordNew
 * 操作记录组件
 */

import React from 'react';
import { Icon } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import ModalContent from './ModalContent';
import { OperationRecordProps } from './interfaceAll';

const modalKey = Modal.key();

/**
 * @param btnText: 弹窗标题 string
 * @param btnType：【'button' | 'aTag'】设置按钮的展现模式, 默认['aTag'] string
 * @param btnIcon：链接icon string
 * @param modalDrawer: 弹窗类型，默认抽屉[true] boolean
 * @param modalWidth: 弹窗宽度 number
 * @param modalContentType: 【'notabs' | 'tabs'】弹窗内容显示方式,默认['notabs']，页签形式-时间轴，非页签形式-表格 string
 * @param tableOtherParams: 操作记录接口查询额外参数 object
 * @param statusIconTypes: 时间轴标题显示icon样式 array 举例：[{"value": "RENEW","description": "更新","icon": "update"}]
 * @param tablePk: 接口必传参数 string
 * @param tableUrl: 接口地址 string
 * @param recordName: 操作记录行操纵处理内容 string
 */

function OperationRecordNew(props: OperationRecordProps) {
  const {
    btnText = intl.get('scux.operationRecordNew.view.title.operation.record').d('操作记录'),
    btnType = 'aTag',
    btnIcon = '',
    modalDrawer = true,
    modalWidth = 742,
    modalContentType = 'notabs',
    tableOtherParams = {},
    statusIconTypes = [],
    tablePk,
    tableUrl,
    recordName,
  } = props;

  const openOperationRecord = () => {
    Modal.open({
      key: modalKey,
      title: btnText,
      closable: true,
      drawer: modalDrawer,
      okCancel: false,
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      style: {
        width: modalWidth,
      },
      children: (
        // eslint-disable-next-line react/jsx-filename-extension
        <ModalContent tablePk={tablePk} recordName={recordName} statusIconTypes={statusIconTypes} tableOtherParams={tableOtherParams} tableUrl={tableUrl} modalContentType={modalContentType} />
      ),
    });
  };

  if (btnType === 'aTag') {
    return (
      <a onClick={openOperationRecord}>
        {btnIcon && <Icon type={btnIcon} />}
        {btnText}
      </a>
    );
  } else {
    return <Button onClick={openOperationRecord} />;
  }
}

export default formatterCollections({ code: ['scux.operationRecordNew', 'hzero.hzeroUI'] })(
  OperationRecordNew
);
