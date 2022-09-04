import React, {
  Component,
  useState,
  useEffect,
  useCallback,
  Children,
} from "react";
import mojs from "mo-js";
import Styles from "./index.css";

const initalState = {
  count: 0,
  countTotal: 506,
  isClicked: false,
};

// Custom Hook for Animation

const useClapAnimation = ({ clapEl, countEl, clapTotalEl }) => {
  const [animattionTimeLine, setAnimattionTimeLine] = useState(
    () => new mojs.Timeline()
  );

  React.useLayoutEffect(() => {
    if (!clapEl || !countEl || !clapTotalEl) {
      return;
    }
    const tlDuration = 300;
    const scaleButton = new mojs.Html({
      el: clapEl,
      duration: 300,
      scale: { 1.3: 1 },
      easing: mojs.easing.ease.out,
    });

    const countTotalAnimation = new mojs.Html({
      el: clapTotalEl,
      opacity: { 0: 1 },
      delay: (3 * tlDuration) / 2,
      duration: tlDuration,
      y: { 0: -3 },
    });

    const countAnimation = new mojs.Html({
      el: countEl,
      opacity: { 0: 1 },
      y: { 0: -30 },
      duration: tlDuration,
    }).then({
      opacity: { 1: 0 },
      y: -80,
      delay: tlDuration / 2,
    });

    if (typeof clapEl === "string") {
      const clap = document.getElementById("clap");
      clap.style.transform = "scale(1,1)";
    } else {
      clap.style.transform = "scale(1,1)";
    }

    const newAnimationTimeLine = animattionTimeLine.add([
      scaleButton,
      countTotalAnimation,
      countAnimation,
    ]);
    setAnimattionTimeLine(newAnimationTimeLine);
  }, [clapEl, countEl, clapTotalEl]);

  return animattionTimeLine;
};
const MediumClapContex = React.createContext();
const { Provider } = MediumClapContex;

const MediumClap = ({ children }) => {
  const MAX_USER_CLAP = 15;
  const [clapState, setClapState] = useState(initalState);
  const { count, countTotal, isClicked } = clapState;
  const animattionTimeLine = useClapAnimation({
    clapEl: clapRef,
    countEl: clapCountRef,
    clapTotal: clapCountTotalRef,
  });

  const [{ clapRef, clapCountRef, clapCountTotalRef }, setRefState] = useState(
    {}
  );
  const setRef = useCallback((node) => {
    setRefState((prevRefState) => ({
      ...prevRefState,
      [node.dataset.refkey]: node,
    }));
  }, []);

  const hendlerClapClick = () => {
    animattionTimeLine.replay();
    setClapState((prevState) => ({
      isClicked: true,
      count: Math.min(count + 1, MAX_USER_CLAP),
      countTotal:
        count < MAX_USER_CLAP ? prevState.countTotal + 1 : prevState.countTotal,
    }));
  };
  const memoizedValue = React.useMemo(
    () => ({
      ...clapState,
      setRef,
    }),
    [clapState, setRef]
  );
  return (
    <Provider value={memoizedValue}>
      <button
        ref={setRef}
        data-refkey="clapRef"
        className={Styles.clap}
        onClick={hendlerClapClick}
      ></button>
      {children}
    </Provider>
  );
};

//sub components
const ClapIcon = () => {
  const { isClicked } = React.useContext(MediumClapContex);
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-549 338 100.1 125"
        className={`${Styles.icon} ${isClicked && Styles.checked} `}
      >
        <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
        <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
      </svg>
    </span>
  );
};

const ClapCount = () => {
  const { count, setRef } = React.useContext(MediumClapContex);
  return (
    <span ref={setRef} data-refkey="clapCountRef" className={Styles.count}>
      +{count}
    </span>
  );
};

const CountTotal = () => {
  const { countTotal, setRef } = React.useContext(MediumClapContex);

  return (
    <span ref={setRef} data-refkey="clapCountTotalRef" className={Styles.total}>
      {countTotal}
    </span>
  );
};

// Usage
const Usage = () => {
  return (
    <MediumClap>
      <ClapIcon />
      <ClapCount />
      <CountTotal />
    </MediumClap>
  );
};

export default Usage;