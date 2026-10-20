import React, { useCallback, useEffect, useState } from 'react';
import { SelectBox } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import { Content } from 'components/Page';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import {
  getOperateTitleConfig,
  getAllPartnerOptionList,
  getCoordinationOptionList,
  getCooperateCompanyOptionList,
} from './utils';
import styles from './index.less';

const { Step } = Steps;
const { Option } = SelectBox;

const ModalChildren = observer(props => {
  const {
    childrenProps: {
      partnerType,
      urlRegisterBeforeFlag,
      privateFlag,
      companyName,
      companyCount,
      operateGuide = {},
    } = {},
    operateTypeDs,
  } = props;
  const { oneStep = [], secondStep = [], supplierRelation = '' } = operateGuide;
  const [stepList, setStepList] = useState([]);
  useEffect(() => {
    handleModalChildren();
  }, [operateTypeDs, operateTypeDs?.current?.get('firstType')]);

  const handleModalChildren = useCallback(() => {
    // partnerType 0 完全合作  1 部分合作  2 完全未合作
    const allPartnerShipFlag = partnerType === 0;
    // 协同标识
    const coordinationFlag = urlRegisterBeforeFlag === 1 || privateFlag === 0;
    // 操作提示标题
    const tipsTitleObj = getOperateTitleConfig({
      allPartnerShipFlag,
      coordinationFlag,
      companyName,
      companyCount,
    });
    const { tipsTitle: firstTipsTitle } = tipsTitleObj;
    let secondTipsTitle = '';
    let secondOptionList = [];
    // 部分合作有协同
    const partAndcoordinationFlag = supplierRelation === 'PartPartnerAndCoordination';

    // 获取选择的操作类型
    const selectBoxValue = operateTypeDs?.current?.get('firstType');
    // 部分合作切有协同，展示步骤条
    const moreOneStep = partAndcoordinationFlag && selectBoxValue === 'continueEntry';
    let firstOptionList = [];
    if (supplierRelation === 'AllPartner') {
      firstOptionList = getAllPartnerOptionList({ step: oneStep });
    } else if (supplierRelation === 'PartPartnerAndNoCoordination') {
      firstOptionList = getCooperateCompanyOptionList({ step: oneStep });
    } else if (supplierRelation === 'NoPartnerAndCoordination') {
      firstOptionList = getCoordinationOptionList({ step: oneStep });
    } else if (partAndcoordinationFlag) {
      firstOptionList = getCoordinationOptionList({ step: oneStep });
      if (moreOneStep) {
        secondTipsTitle = (
          getOperateTitleConfig({ companyName, companyCount, showStep: true }) || {}
        ).tipsTitle;
        secondOptionList = getCooperateCompanyOptionList({ step: secondStep });
      }
    }
    const arr = [];
    arr.push({
      title: firstTipsTitle,
      render: () => (
        <SelectBox dataSet={operateTypeDs} name="firstType" vertical>
          {firstOptionList.map(item => (
            <Option value={item.value}>{item.title}</Option>
          ))}
        </SelectBox>
      ),
    });
    if (moreOneStep) {
      arr.push({
        title: secondTipsTitle,
        render: () => (
          <SelectBox dataSet={operateTypeDs} name="secondType" vertical>
            {secondOptionList.map(item => (
              <Option value={item.value}>{item.title}</Option>
            ))}
          </SelectBox>
        ),
      });
    }
    setStepList(arr);
  }, []);

  return !isEmpty(stepList) ? (
    <Content className={styles.createErrorContent}>
      <Steps direction="vertical" size="small" current={stepList.length === 1 ? 0 : 1}>
        {stepList.map(item => {
          const { render, title } = item;
          return <Step title={title} description={render ? render() : ''} />;
        })}
      </Steps>
    </Content>
  ) : null;
});

export default ModalChildren;
