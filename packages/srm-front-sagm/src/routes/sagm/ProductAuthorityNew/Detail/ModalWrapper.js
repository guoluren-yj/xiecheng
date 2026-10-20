import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import Detail from './Detail';

export default function ModalWrapper({
  modal,
  isCreate,
  authorityListId,
  init = {},
  ...otherProps
}) {
  const { readOnly, onFetchList = (e) => e } = otherProps;
  const childRef = useRef();

  const [currentStep, setCurrentStep] = useState(0);
  const [_authorityListId, setId] = useState(authorityListId);
  const [sateInit, setData] = useState(init);

  useEffect(() => {
    const canUpdate =
      _authorityListId && !readOnly && (!isCreate || (isCreate && currentStep === 2)); // 编辑 || 新建第三步
    const cancelProps = readOnly ? { color: 'primary' } : {};
    modal.update({
      cancelText: readOnly
        ? intl.get('hzero.common.button.close').d('关闭')
        : intl.get('hzero.common.button.cancel').d('取消'),
      cancelProps,
      footer: (okBtn, cancelBtn) => (
        <>
          {!_authorityListId && currentStep === 0 && (
            <Button color="primary" onClick={() => handleOperate('saveAndNext')}>
              {intl.get('sagm.common.button.saveAndNext').d('保存并下一步')}
            </Button>
          )}
          {/* 编辑、新建最后一步  已发布的不能编辑，无需控制 */}
          {canUpdate && (
            <Button color="primary" onClick={() => handleOperate('publish')}>
              {intl.get('sagm.common.model.publish').d('发布')}
            </Button>
          )}
          {canUpdate && (
            <Button onClick={() => handleOperate('save')}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
          {isCreate && _authorityListId && currentStep <= 1 && (
            <Button color="primary" onClick={() => handleOperate('next')}>
              {intl.get('hzero.common.button.next').d('下一步')}
            </Button>
          )}
          {isCreate && _authorityListId && currentStep > 0 && (
            <Button onClick={() => handleOperate('pre')}>
              {intl.get('hzero.common.button.previous').d('上一步')}
            </Button>
          )}
          {cancelBtn}
        </>
      ),
      onCancel: () => {
        if (_authorityListId) {
          onFetchList();
        }
      },
    });
  }, [_authorityListId, currentStep]);

  const stepChange = (step) => {
    setCurrentStep(step);
  };

  const handleStep = (operateStep) => {
    // 保存并下一步
    setCurrentStep((pre) => pre + operateStep);
  };

  const handleOperate = (type) => {
    switch (type) {
      case 'publish':
        if (childRef.current.handleSave) {
          return childRef.current.handleSave(
            false,
            () => {
              if (_authorityListId) {
                onFetchList();
              }
              modal.close();
            },
            'publish'
          );
        }
        break;
      case 'save':
        if (childRef.current.handleSave) {
          return childRef.current.handleSave(false);
        }
        break;
      case 'saveAndNext':
        if (childRef.current.handleSave) {
          return childRef.current.handleSave(true, (res) => {
            const {
              channel,
              controlRange,
              agreementType,
              agreementHeaderId,
              agreementHeaderNum,
              authorityListId,
            } = res;
            const _init = {
              channel,
              controlRange,
              agreementType,
              agreementHeaderId,
              agreementHeaderNum,
            };
            handleStep(+1);
            setId(authorityListId);
            setData(_init);
            // eslint-disable-next-line no-unused-expressions
            // childRef.current?.refreshData({ sateInit: _init });
          });
        }
        break;
      case 'next':
        if (currentStep === 0) {
          handleStep(+1);
          return;
        }
        if (childRef.current.handleSave) {
          return childRef.current.handleSave(
            false,
            () => {
              handleStep(+1);
            },
            'next'
          );
        }
        break;
      case 'pre':
        handleStep(-1);
        break;
      default:
        break;
    }
  };

  return (
    <Detail
      {...otherProps}
      authorityListId={_authorityListId}
      init={sateInit}
      currentStep={currentStep}
      stepChange={stepChange}
      onRef={(ref) => {
        childRef.current = ref;
      }}
      type={isCreate ? 'create' : 'other'}
    />
  );
}
