import React, { useCallback, useState } from 'react';

interface IProps {
  target: any;
  defaultValue?: number;
  max?: number;
  min?: number;
}

export default function useResizeWidth(props: IProps) {
  const { target, defaultValue, max, min } = props;
  const [resizeFlag, setResizeFlag] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(defaultValue || 0);

  const handleMoveLineMouseDown = useCallback((event) => {
    if (target.current && target.current.getBoundingClientRect) {
      const { left, width } = target.current.getBoundingClientRect();
      if (left <= event.pageX && event.pageX <= left + width) {
        setResizeFlag(true);
      }
    }
  }, [target.current]);

  const handleMoveLineMouseMove = useCallback((event) => {
    if (resizeFlag && target.current && target.current.getBoundingClientRect) {
      let width = event.pageX;
      if (max && width > max) {
        width = max;
      } else if (min && width < min) {
        width = min;
      }
      setResizeWidth(width);
    }
  }, [resizeFlag, target.current, max, min]);

  const handleMoveLineMouseUp = useCallback((event) => {
    setResizeFlag(false);
  }, []);
 
  const resizeEvents = {
    onMouseUp: handleMoveLineMouseUp,
    onMouseDown: handleMoveLineMouseDown,
    onMouseMove: handleMoveLineMouseMove,
  };

  return { resizeWidth, resizeFlag, resizeEvents };
}