/**
 * SrmOperationRecord
 * 操作记录组件
 * @date: 2022-03-02
 * @author: zxy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Icon } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import { Header } from 'components/Page';

import './index.less';
// import { operation } from 'retry';
import ModalContent from './ModalContent';

enum OperationRecordBtnTypes {
  button = 'button',
  aTag = 'aTag'
}

interface OperationRecordProps {
  btnText?: string;
  btnType?: OperationRecordBtnTypes;
  icon?: string;
  businessKey?: string;
  funcType?: FuncType;
  color?: ButtonColor;
  loading?: boolean;
  url?: string;
  operationParams?: any;
  commentRecordFlag?: boolean;
  commentStartFlag?: boolean;
  templateCode?: string;
  lovParams?: object | null | undefined;
  exportUrl?: string | null | undefined;
  exportParams?: object | null | undefined;
  lookupCode?: string | null| undefined;

}

const modalKey = Modal.key();

/**
   * SrmOperationRecord - Element
   * url - string 操作记录url
   * operationParams - object 操作记录接口所需参数
   * businessKey - string 审批记录参数
   * exportUrl - string 导出url
   * exportParams - object 导出参数
   * templateCode - string 模板编码
  */

function SrmOperationRecord (props: OperationRecordProps) {
  const {
    btnText = intl.get('component.operationRecord.view.button.btnText').d('操作记录'),
    btnType = OperationRecordBtnTypes.aTag,
    icon = '',
    operationParams = {},
    funcType = FuncType.raised,
    color = ButtonColor.default,
    loading = false,
    commentRecordFlag = false,
    commentStartFlag = false,
    url = '',
    businessKey,
    lookupCode,
    lovParams = {},
    exportUrl,
    exportParams = {},
    templateCode,
  } = props;

  const openModal = () => {
    const modalProps = {
      businessKey,
      lovParams,
      lookupCode,
      operationParams,
      operationUrl: url,
      commentRecordFlag,
      commentStartFlag,
      exportUrl,
      exportParams,
      templateCode,
    };
    Modal.open({
      key: modalKey,
      className: 'operation-record-modal',
      title: intl.get('component.operationRecord.view.button.btnText').d('操作记录'),
      children: <ModalContent {...modalProps} />,
      okCancel: false,
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      drawer: true,
      style: {
        width: 742,
      },
      bodyStyle: {
        padding: '20px',
      },
    });
  };

  if(btnType === OperationRecordBtnTypes.aTag) {
    return (
      <a onClick={openModal}>
        {icon && <Icon type={icon} />}
        {btnText}
      </a>
    );
  } else {
    return <Button funcType={funcType} color={color} icon={icon} loading={loading} onClick={openModal}>{btnText}</Button>;
  }
}

// const Index = () => {
//   return (
//     <Header>
//       <SrmOperationRecord
//         url="/slod/v1/30/delivery/ASN/delivery-record"
//         operationParams={{
//           deliveryHeaderId: '__-UilJqSn68mK29vtZ5PLeLQ-__',
//         }}
//       />
//     </Header>
//   );
// };

export default formatterCollections({ code: ['component.operationRecord', 'hzero.hzeroUI'] })(SrmOperationRecord);
