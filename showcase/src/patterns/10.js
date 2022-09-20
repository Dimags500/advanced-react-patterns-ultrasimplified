import React, {
  Component,
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
} from "react";
import mojs from "mo-js";
import Styles from "./index.css";
import userCustomStyles from "./usage.css";

const INIT_CLAP_STATE = {
  count: 0,
  countTotal: 506,
  isClicked: false,
};

// Reusable Style
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

    const triangleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      children: {
        shape: "polygon",
        redius: { 6: 0 },
        stroke: "rgba(211,54,0,0.5)",
        strokeWidth: 2,
        angle: 210,
        delay: 30,
        speed: 0.2,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: tlDuration,
      },
    });

    const circleBurst = new mojs.Burst({
      parent: clapEl,
      radius: { 50: 75 },
      angle: 25,
      buration: tlDuration,
      children: {
        shape: "circle",
        fill: "rgb(149,165,166,0.5)",
        delay: 0.2,
        radius: { 3: 0 },
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
      },
    });

    if (typeof clapEl === "string") {
      const clap = document.getElementById("clap");
      clap.style.transform = "scale(1,1)";
    } else {
      clapEl.style.transform = "scale(1,1)";
    }

    const newAnimationTimeLine = animattionTimeLine.add([
      scaleButton,
      countTotalAnimation,
      countAnimation,
      triangleBurst,
      circleBurst,
    ]);
    setAnimattionTimeLine(newAnimationTimeLine);
  }, [clapEl, countEl, clapTotalEl]);

  return animattionTimeLine;
};

// useDOMrefHook
const useDomRef = () => {
  const [DOMRef, setRefState] = useState({});

  const setRef = useCallback((node) => {
    setRefState((prevRefState) => ({
      ...prevRefState,
      [node.dataset.refkey]: node,
    }));
  }, []);

  return [DOMRef, setRef];
};

// custom hook for getting previous props/sate

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const callFnsInSequence =
  (...fns) =>
  (...args) => {
    fns.forEach((fn) => fn && fn(...args));
  };

// use ClapState with useReducer

const MAX_USER_CLAP = 15;

const reducer = ({ count, countTotal }, { type, payload }) => {
  switch (type) {
    case "clap":
      return {
        isClicked: true,
        count: Math.min(count + 1, MAX_USER_CLAP),
        countTotal: count < MAX_USER_CLAP ? countTotal + 1 : countTotal,
      };
    case "reset":
      return payload;

    default:
      break;
  }
};
const useClapState = (initalState = INIT_CLAP_STATE) => {
  const constUserInitState = React.useRef(initalState);

  const [clapState, decpatch] = useReducer(reducer, initalState);
  const { count, countTotal } = clapState;

  const updateClapState = React.useCallback(() => {
    decpatch({ type: "clap" });
  }, []);

  // prop collection from 'click'
  const getTogglerProps = ({ onClick, ...otherProps } = {}) => ({
    onClick: callFnsInSequence(updateClapState, onClick),
    "aria-pressed": clapState.isClicked,
    ...otherProps,
  });

  // prop collection from 'count'
  const getCounterProps = ({ ...otherProps }) => ({
    count,
    "aria-valuemax": MAX_USER_CLAP,
    "aria-valuemin": 0,
    "aria-valuenow": count,
    ...otherProps,
  });

  const resetRef = React.useRef(0);
  const prevCount = usePrevious(count);
  const reset = React.useCallback(() => {
    if (prevCount !== count) {
      decpatch({ type: "reset", payload: constUserInitState.current });
      resetRef.current++;
    }
  }, [count, prevCount]);

  return {
    clapState,
    updateClapState,
    getTogglerProps,
    getCounterProps,
    reset,
    resetDep: resetRef.current,
  };
};

//useEffectAferMount
const useEffectAferMount = (cb, deps) => {
  const componentJustMounted = React.useRef(true);
  useEffect(() => {
    if (!componentJustMounted.current) {
      return cb();
    }
    componentJustMounted.current = false;
  }, deps);
};

//sub components
const ClapContainer = ({ children, setRef, handleClick, ...restProps }) => {
  const classNames = [Styles.clap].join(" ").trim();

  return (
    <>
      <button
        ref={setRef}
        onClick={handleClick}
        className={classNames}
        {...restProps}
      >
        {children}
      </button>
      ;
    </>
  );
};

const ClapIcon = ({
  style: userStyles = {},
  className,
  isClicked,
  setRef,
  ...restProps
}) => {
  const classNames = [Styles.icon, isClicked ? Styles.checked : "", className]
    .join(" ")
    .trim();
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-549 338 100.1 125"
        className={classNames} //`${Styles.icon} ${isClicked && Styles.checked} `}
        style={userStyles}
      >
        <path d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z" />
        <path d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9" />
      </svg>
    </span>
  );
};

const ClapCount = ({
  style: userStyles = {},
  className,
  count,
  setRef,
  ...restProps
}) => {
  const classNames = [Styles.count, className].join(" ").trim();
  return (
    <span ref={setRef} className={classNames} style={userStyles} {...restProps}>
      +{count}
    </span>
  );
};

const CountTotal = ({
  style: userStyles = {},
  className,
  countTotal,
  setRef,
  ...restProps
}) => {
  const classNames = [Styles.total, className].join(" ").trim();

  return (
    <span ref={setRef} className={classNames} style={userStyles} {...restProps}>
      {countTotal}
    </span>
  );
};

const userInitState = {
  count: 0,
  countTotal: 506,
  isClicked: false,
};

const Usage = () => {
  const {
    clapState,
    updateClapState,
    getTogglerProps,
    getCounterProps,
    reset,
    resetDep,
  } = useClapState(userInitState);
  const { count, countTotal, isClicked } = clapState;
  const [{ clapRef, clapCountRef, clapCountTotalRef }, setRef] = useDomRef();

  const animattionTimeLine = useClapAnimation({
    clapEl: clapRef,
    countEl: clapCountRef,
    clapTotalEl: clapCountTotalRef,
  });

  const handleClick = () => {
    console.log("---- click  --- ");
  };

  useEffectAferMount(() => {
    animattionTimeLine.replay();
  }, [count]);

  const [uploadingReset, setUpladingReset] = useState(false);
  useEffectAferMount(() => {
    setUpladingReset(true);

    const id = setTimeout(() => {
      setUpladingReset(false);
    }, 300);

    return () => clearTimeout(id);
  }, [resetDep]);

  return (
    <div>
      <ClapContainer
        setRef={setRef}
        data-refkey="clapRef"
        {...getTogglerProps({ onClick: handleClick })}
      >
        <ClapIcon isClicked={isClicked} />
        <ClapCount
          setRef={setRef}
          data-refkey="clapCountRef"
          {...getCounterProps()}
        />
        <CountTotal
          countTotal={countTotal}
          setRef={setRef}
          data-refkey="clapCountTotalRef"
        />
      </ClapContainer>

      <section>
        <button className={userCustomStyles.resetBtn} onClick={() => reset()}>
          Reset
        </button>
        <pre> {JSON.stringify({ count, countTotal, isClicked })}</pre>
        <pre>{uploadingReset ? `uploading reset ${resetDep}` : "...."}</pre>
      </section>
    </div>
  );
};

export default Usage;
