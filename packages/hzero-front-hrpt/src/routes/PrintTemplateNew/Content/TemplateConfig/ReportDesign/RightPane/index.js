import React, { useCallback, useContext, useMemo } from 'react';

import Store from '../store';
import ConditionFormat from './ConditionFormat';
import QrCodeSetting from './QrCodeSetting';
import BarCodeSetting from './BarCodeSetting';
import WaterMask from './WaterMask';

const RightPane = () => {
  const { sheetPartRef, rightPaneKey, setRightPaneVisible, setRightPaneKey, treeDs } = useContext(
    Store
  ).store;

  const hidePaneContent = useCallback(() => {
    setRightPaneVisible(false);
    setRightPaneKey(undefined);
    if (
      sheetPartRef.current &&
      sheetPartRef.current.sheetRef &&
      sheetPartRef.current.sheetRef &&
      sheetPartRef.current.sheetRef.resize
    ) {
      setTimeout(() => {
        sheetPartRef.current.sheetRef.resize();
      }, 0);
    }
  }, []);

  const paneContent = useMemo(() => {
    const commonProps = {
      hidePaneContent,
      sheet: sheetPartRef.current && sheetPartRef.current.sheetRef,
      treeDs,
    };
    switch (rightPaneKey) {
      case 'conditionFormat':
        return <ConditionFormat {...commonProps} />;
      case 'qrCode':
        return <QrCodeSetting {...commonProps} />;
      case 'barCode':
        return <BarCodeSetting {...commonProps} />;
      case 'waterMask':
        return <WaterMask {...commonProps} />;
      default: return <div />;
    }
  }, [rightPaneKey, treeDs]);

  return paneContent;
};

RightPane.displayName = 'RightPane';
export default RightPane;
