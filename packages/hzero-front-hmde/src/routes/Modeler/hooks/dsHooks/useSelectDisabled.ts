import { useEffect, useState } from 'react';
import { reaction } from 'mobx';

export default (dataSet) => {
  const [disabled, setDisabled] = useState(true);
  const [currentReaction, setCurrentReaction] = useState({
    dispose: () => {},
  });
  const isDisabled = () => {
    if (dataSet.selected.length === 0) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };
  useEffect(() => {
    isDisabled();
    reaction(
      () => dataSet.selected.length,
      // eslint-disable-next-line no-unused-vars
      (_, _Reaction) => {
        setCurrentReaction(_Reaction);
        isDisabled();
      }
    );
    return () => {
      currentReaction.dispose();
    };
  }, [dataSet]);
  return disabled;
};
