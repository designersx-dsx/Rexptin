// import React, { useRef } from 'react';
// import styles from "../AnimatedButton/AnimatedButton.module.css";
// import Loader from '../Loader/Loader';

// const AnimatedButton = ({ isLoading, label = 'Save',position={} }) => {
//   const imgRef = useRef(null);
//   const textRef = useRef(null);

//   const handleZoomAnimation = () => {
//     const img = imgRef.current;
//     const text = textRef.current;

//     if (!img || !text) return;

//     // Remove & re-add class to re-trigger animation
//     [img, text].forEach((el) => {
//       el.classList.remove(styles.zoomAnimate);
//       void el.offsetWidth;
//       el.classList.add(styles.zoomAnimate);
//     });
//   };
// dsdsds
//   return (
//     <div className={styles.btnFix} style={position}>
//       <div
//         className={styles.btnTheme}
//         onMouseEnter={handleZoomAnimation}
//         onTouchStart={handleZoomAnimation}
//              style={{
//           pointerEvents: isLoading ? 'none' : 'auto', // 👈 Disable clicks
//           opacity: isLoading ? 0.6 : 1,              // 👈 Dim button
//           cursor: isLoading ? 'not-allowed' : 'pointer' // 👈 Show disabled cursor
//         }}
//       >
//         <img
//           src="svg/svg-theme2.svg"
//           alt="button-bg"
//           ref={imgRef}
//         />
//         <p ref={textRef}>
//           {isLoading ? <Loader size={17} /> : label}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AnimatedButton;
import React, { useRef } from 'react';
import styles from "../AnimatedButton/AnimatedButton.module.css";
import Loader from '../Loader/Loader';

const AnimatedButton = ({
  isLoading,
  size  , 
  label = 'Save',
  position = {},
  bottom ={},
  onClick = () => {},
  disabled = false
}) => {
  const imgRef = useRef(null);
  const textRef = useRef(null);

  const handleZoomAnimation = () => {
    const img = imgRef.current;
    const text = textRef.current;

    if (!img || !text) return;

    [img, text].forEach((el) => {
      el.classList.remove(styles.zoomAnimate);
      void el.offsetWidth;
      el.classList.add(styles.zoomAnimate);
    });
  };

  return (
    <div className={styles.btnFix}  style={{
    ...position,
    bottom: bottom ? bottom : '10px' 
  }}>
      <div
        className={styles.btnTheme}
        onMouseEnter={handleZoomAnimation}
        onTouchStart={handleZoomAnimation}
        onClick={disabled ? null : onClick}
        style={{
          pointerEvents: isLoading || disabled ? 'none' : 'auto',
          opacity: isLoading || disabled ? 0.6 : 1,
          cursor: isLoading || disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <img src="svg/svg-theme2.svg" alt="button-bg" ref={imgRef} />
        <p style={{fontSize: size ? size : null}} ref={textRef}>
          {isLoading ? <Loader size={17} /> : label}
        </p>
      </div>
    </div>
  );
};

export default AnimatedButton;
