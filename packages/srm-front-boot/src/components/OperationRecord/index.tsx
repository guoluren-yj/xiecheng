/**
 * OperationRecord
 * 操作记录组件
 * @date: 2022-03-22
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Icon } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { getEnvConfig } from 'utils/iocUtils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header } from 'components/Page';

import './index.less';

import ModalContent from './ModalContent';

enum OperationRecordBtnTypes {
  button = 'button',
  aTag = 'aTag'
}

interface OperationRecordProps {
  url?: string | null;
  method?: string;
  btnText?: string;
  btnType?: OperationRecordBtnTypes;
  icon?:string;
  tablePk: string;
  tableName: string;
  businessKey?: string;
  funcType?: FuncType;
  color?: ButtonColor;
  loading?: boolean;
  needMerge?: boolean;
  commentRecordFlag?: boolean;
  commentStartFlag?: boolean;
  templateCode?: string;
  lovParams?: object | null | undefined;
  exportUrl?: string | null | undefined;
  lookupCode?: string | null | undefined;
  exportParams?: object | null | undefined;
}

const modalKey = Modal.key();
const { DOCFLOW_FLAG }:any = getEnvConfig() || {};

function OperationRecord (props: OperationRecordProps) {
  const {
    btnText = intl.get('component.operationRecord.view.button.btnText').d('操作记录'),
    btnType = OperationRecordBtnTypes.aTag,
    icon = '',
    tableName,
    tablePk,
    businessKey,
    funcType = FuncType.flat,
    color = ButtonColor.default,
    loading = false,
    needMerge= false,
    commentRecordFlag = false,
    commentStartFlag = false,
    url = null,
    method = "POST",
    lookupCode = null,
    lovParams = {},
    exportUrl = null,
    exportParams = {},
    templateCode = null,
  } = props;
  const openModal = () => {
   Modal.open({
      key: modalKey,
      className: 'operation-record-modal',
      title: intl.get('component.operationRecord.view.button.btnText').d('操作记录'),
      children: <ModalContent
        url={url}
        method={method}
        tableName={tableName}
        tablePk={tablePk}
        lovParams={lovParams}
        needMerge={needMerge}
        lookupCode={lookupCode}
        businessKey={businessKey}
        commentRecordFlag={commentRecordFlag}
        commentStartFlag={commentStartFlag}
        exportUrl={exportUrl}
        exportParams={exportParams}
        templateCode={templateCode}
      />,
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

  if(btnType === OperationRecordBtnTypes.aTag && DOCFLOW_FLAG === '1') {
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
//       <OperationRecord
//         loading={false}
//         tableName='slod_asn_header'
//         tablePk="__-gVTdThgGG_2tVQDt5wZc7w-__"
//         businessKey="SOLD.DELIVERY_ASN_54971"
//         btnType={OperationRecordBtnTypes.button}
//         funcType={FuncType.raised}
//         icon='assignment'
//         color={ButtonColor.default}
//       />
//     </Header>
//   );
// };

export default formatterCollections({ code: ['component.operationRecord', 'hzero.hzeroUI', 'sinv.common'] })(OperationRecord);
