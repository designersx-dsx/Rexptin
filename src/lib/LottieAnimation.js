import React from "react";
import Lottie from "lottie-react";
import HeaderBar from "../Component/HeaderBar/HeaderBar";

const LottieAnimation = ({ animationData, loop = true, width = 200, height = 200 }) => {
  return (
    <>
 
    <div style={{ width, height }}>
      <Lottie autoplay animationData={animationData} loop={loop} />
    </div>
    </>
  );
};
// ds
export default LottieAnimation;