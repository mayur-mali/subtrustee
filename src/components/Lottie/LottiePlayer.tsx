import React from "react";
import Lottie from "lottie-react";
export default function LottiePlayer({
  animationData,
  loop = true,
  autoplay = true,
  height = 300,
  width = 300,
  style = {},
  lottieRef,
  ...rest
}: {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  height?: number | string;
  width?: number | string;
  style?: React.CSSProperties;
  lottieRef?: React.RefObject<any>;
  [key: string]: any;
}) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      lottieRef={lottieRef}
      autoplay={autoplay}
      style={{ height, width, ...style }}
      {...rest}
    />
  );
}
