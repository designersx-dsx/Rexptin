// User Script
function injectCSS() {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes float {
     0% { transform: translateY(0); }
     50% { transform: translateY(-8px); }
     100% { transform: translateY(0); }
   }
   @keyframes pulse-ring {
     0% {
       transform: scale(0.9);
       opacity: 0.7;
     }
     70% {
       transform: scale(1.6);
       opacity: 0;
     }
     100% {
       transform: scale(0.9);
       opacity: 0;
     }
   }
    body {
      margin: 0;
      font-family: sans-serif;
    }
    .floating-agent {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 96px;
      height: 96px;
      z-index: 1000;
      cursor: pointer;
    }
    .floating-agent.animate {
      animation: float 3s ease-in-out infinite;
    }
    .agent-wrapper {
      position: relative;
      width: 100%;
      height: 100%;      
      border-radius: 50%;
      overflow: visible; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
      .pulse-ring {
      position: absolute;
      right: -5px;
      bottom: -6px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse-ring 1.8s infinite;
      z-index: 0;
      background: #0CDD24;
      z-index: 11;
    }

   .agent-wrapper img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     position: relative;
     z-index: 2;
     border-radius: 100px;
     border: 4px solid #7F709F;
     background: #ffffff;
   }
   .badge2 {
     position: absolute;
     bottom: -6px;
     width: 32px;
     height: 32px;
   }
   .badge2 img {
    object-fit: contain;
    border:unset;
   }
   .popup {
     position: fixed;
     bottom: 155px;
     right: 20px;
     width: 90%;
     max-width:320px;
     background-color: #fff;
     border-radius: 20px;
     border: 2px solid #eee;
     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
     z-index: 1001;
     display: none;
     font-family: sans-serif;
   }
   .popup.show {
     display: block;
   }
   .popup::after {
   content: "";
   position: absolute;
   bottom: -18px;
   right: 24px;
   width: 36px;
   height: 36px;
   background-color: #fff;
   transform: rotate(45deg);
   box-shadow: 14px 15px 20px rgba(0, 0, 0, 0.1);
   z-index: -1;
   border-radius: 0px 0px 8px 0px;
   }
   .popup-header {
     padding: 5px 40px;
     font-size: 12px;
     color: #888;
     text-align: right;
   }
   .popup-body {
    position: relative;
    text-align: center;
    padding: 15px 15px 10px 15px;
    background: radial-gradient(circle at 50% 30%, #263b5aea 3%, #19273C 40%);
    margin-inline: 22px;
    margin-bottom: 22px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    gap:1rem
   }
    .pulse-ring-wrapper {
      position: relative;
      width: 100px;
      height: 100px;
      margin-top:2rem;
    }
    .agent-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      top:6px;
      position: relative;
      z-index: 1;
    }
    .pulse-ring2 {
      position: absolute;
      top: 56%;
      left: 50%;
      width: 100%;
      height: 100%;
      border: 4px solid rgba(255, 255, 255, 0.5); /* Default fallback */
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(1);
      z-index: 1;
      animation: pulseAnim 1.5s ease-out infinite;
    }
    .pulse-ring2:nth-child(1) {
      border-color: #ffffffff;
      animation-delay: 0s;
    }
    .pulse-ring2:nth-child(2) {
      border-color: #3B4859;
      animation-delay: 0.4s;
    }
    .pulse-ring2:nth-child(3) {
      border-color: 28364A;
      animation-delay: 0.8s;
    }
    @keyframes pulseAnim {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.4);
        opacity: 0;
      }
    }
    .agent-info {
      text-align: center;
    }
    .call-label {
      font-size: 14px;
      color: #D1DCED;
      margin-bottom: 0px;
      font-family: "Inter", sans-serif;
    }
    .phone-number {
      font-size: 16px;
      font-weight: bold;
      margin: 4px 0 0px;
      color: #ffffffff;
      font-family: "Inter", sans-serif;
    }
    .tag-label {
      font-size: 12px;
      font-weight:600;
      color: #D1DCED;
      letter-spacing: 1px;
      font-family: "Inter", sans-serif;
      text-transform: capitalize;
    }
    .call-banner {
     position: absolute;
     bottom: 22px;
     left: 50%;
     transform: translateX(-50%);
     background-color: #28a745;
     color: white;
     padding: 8px 12px;
     border-radius: 32px;
     font-size: 14px;
     max-width: 72%;
     box-shadow: 0 2px 6px rgba(0,0,0,0.2);
     display: flex;
     align-items: center;
     gap: 8px;
     width: 100%;
     cursor: pointer;
   }
   .call-banner .call-icon {
     width: 24px;
     height: 24px;
     animation: vibe 1s linear 1s infinite;
   }
    @keyframes vibe {
      0% {}

      2% {
          transform: translateX(5px) rotateZ(1deg);
      }

      4% {
          transform: translateX(-5px) rotateZ(-1deg);
      }

      6% {
          transform: translateX(3px) rotateZ(2deg);
      }

      8% {
          transform: translateX(-2px) rotateZ(-2deg);
      }

      10% {
          transform: translateX(1px) rotateZ(2deg);
      }

      12% {
          transform: translateX(-5px) rotateZ(-2deg);
      }

      14% {
          transform: translateX(3px) rotateZ(-1deg);
      }

      16% {
          transform: translateX(-5px) rotateZ(-2deg);
      }

      18% {
          transform: translateX(5px) rotateZ(2deg);
      }

      20% {
          transform: translateX(-5px) rotateZ(-2deg);
      }

      22% {
          transform: translateX(5px) rotateZ(2deg);
      }

      24% {
          transform: translateX(-3px) rotateZ(-2deg);
      }

      26% {
          transform: translateX(0px) rotateZ(0deg);
      }

      100% {}
    }
      .greendiv, .reddiv {
      position: relative;
          border-radius: 30px;
          padding: 10px 16px;
          color: white;
          display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      width: 80%;

      transition: background-color 0.4s ease, transform 0.4s ease;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      align-text:left;

      }

      .greendiv {
      background-color: #0caa4f;
      }

      .reddiv {
      background-color: #DA1B14;
      }

      .callText p {
      font-weight: 600;
      font-size: 15px;
      margin: 0;
      color :#ffff
      transition: color 0.3s ease;
      }

      .callText small {
      font-size: 9px;
      font-weight: 400;
      margin-top: 3px;
      display: block;
      color :#ffff
      transition: opacity 0.3s ease;
      }
      .phoneIcon {
      align-items: self-end;
          display: flex
      ;}

      .phoneIcon img {
      animation: vibe 1s linear 1s infinite;
      }

   .call-banner .call-text {
     display: flex;
     flex-direction: column;
     align-items: flex-start;
     line-height: 1.2;
   }

   .call-banner .call-title {
     font-weight: 600;
     font-size: 18px;
     font-family: "Lato", sans-serif;
   }

   .call-banner .call-subtitle {
     font-size: 10px;
     opacity: 0.9;
     font-family: "Inter", sans-serif;
   }

   .close-button {
    position: absolute;
   top: 100%;
   right: 10.8px;
   font-size: 34px;
   color: #BCBCBC;
   background: transparent;
   border: none;
   cursor: pointer;
   }

   .close-button:hover {
     color: #333;
   }
     .popup{
         display: block;
         }

   .popup-header a {
     text-decoration: unset;
     color: #7D7D7D;
     font-family: "Inter", sans-serif;
   }

   /* Additional styles for noFloat state */
   .noFloat {
     animation: none !important;
   }
    .WraperBlink {
      position: absolute;
        right: 22%;
        bottom: 18px;
        width: 10px;
        height: 10px;
        transform: translate(-50%, -50%);
        z-index: 11;
    }
        .pulse-dot {
      position: absolute;
        top: 9px;
        left: 8px;
        width: 4px;
        height: 4px;
        background-color: #0CDD24;
        border-radius: 50%;
        z-index: 12;
    }
    .callText{
        text-align: start;line-height:normal}
        .agent-intro{   text-align: center;
          font-size: 9px;
          position: relative;
          bottom: 0;
          color: #ffff;
              margin: 0;
          }
          .terms-text {
            cursor: pointer;
            font-weight: 800;
            text-decoration: underline;
          },
          .terms-wrapper {
            position: relative;
            top: -6rem;
          }
          
          .terms-popup {
            
            width: 245px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
            padding: 10px;
            text-align: justify;
            font-size: 12px;
            line-height: 15px;
          }
          
          .terms-content h2 {
            margin-top: 0;
            font-size: 16px;
            margin-bottom: -7px;
          }
          
          .close-terms {
            color: #000000;
            cursor: pointer;
          }
            .button-stack {
            display: flex;
            gap: 10px;
            width: 80%;
            background-color:#F7A600;
             border-radius: 30px;
            padding: 10px 16px;
            cursor:pointer
            }
            .chatdiv{
            display: flex; 
             align-items:center;
                 gap: 10px;
            }
             .chatText p{
             margin:0px;
             font-weight: 600;
             font-size: 15px;
              color:#ffff
             }
            .chat-popup{
             position:fixed; bottom:155px; right:20px;
           max-width: 290px !important;
          transition: 
            max-width .35s ease,
            transform .35s ease,
            box-shadow .35s ease;
          transform-origin: bottom right;
             width:90%;
             background:#fff;
          
             border-radius:16px;
             border:1px solid #ECECEC;
             box-shadow:0 18px 40px rgba(0,0,0,.18);
             z-index:1002; display:none; font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;
             padding: 20px 20px 5px 20px;
            }
                .chat-popup.show{display:block}
                .chat-popup::after{
          content: "";
            position: absolute;
            bottom: -12px;
            right: 24px;
            width: 28px;
            height: 28px;
            background: #fff;
            transform: rotate(45deg);
            border: 1px solid #ececec;
            border-top: 0;
            border-left: 0;
            border-radius: 0 0 8px 0;
            box-shadow: 10px 10px 18px rgba(0,0,0,.08);
            z-index: -1;
                        }
                          .chat-popup.expanded{
          max-width: 500px !important;
          transform: scale(1);
        }

        /* Motion sensitivity */
        @media (prefers-reduced-motion: reduce){
          .chat-popup{
            transition: none !important;
            transform: none !important;
          }
            }

            /* Mobile: full width, no expand play (aapke existing rule ke saath compatible) */
            @media (max-width:650px){
              .chat-popup{
                max-width: none !important;
                width: 100% !important;
                left: 0 !important;
                right: 0 !important;
                border-radius: 0 !important;
                transform: none !important;
              }
                
            }
                            .attio-header{display:flex; align-items:center; justify-content:space-between;
                            padding:12px 16px; border-bottom:1px solid #EFEFEF}
                            .attio-brand{display:flex; align-items:center; gap:10px}
                            .attio-logo{width:28px; height:28px; border-radius:6px; overflow:hidden;
                            display:flex; align-items:center; justify-content:center;
                            background:#111; color:#fff; font-weight:700; font-size:12px}
                            .attio-title{line-height:1}
                            .attio-title .t{font-weight:700; font-size:14px}
                            .attio-title .s{font-size:12px; color:#7A7A7A}
                            .attio-close{border:0; background:transparent; font-size:20px; color:#666; cursor:pointer}
                            .attio-body{padding:12px 16px 18px;background: radial-gradient(circle at 50% 30%, #263b5aea 3%, #19273C 40%);border-radius: 0px 0px 20px 20px;}
                          .attio-thread{
              height: 26dvh;
              overflow: auto;
              padding: 10px 0;
              border: 0px solid #EFEFEF;
              border-radius: 12px;
              background: transparent;
              margin-top: 10px;
              transition: height .35s ease; /* smooth expand */
            }
           .chat-popup.expanded .attio-thread{
              height: 32dvh;
            }

            /* Motion sensitivity */
            @media (prefers-reduced-motion: reduce){
              .attio-thread{ transition: none !important; }
            }
                .msg{max-width:75%;width: max-content; padding:10px 12px; border-radius:14px; margin:15px 10px;
                font-size:16px; line-height:1.35; word-wrap:break-word; box-shadow:0 1px 1px rgba(0,0,0,.04)}
                .msg.bot{background:#ffffff1a; border:0px solid #E8EEF5; color:#fff; margin-left:10px;border-left: 3px solid #6524EB;}
                .msg.user{background:#3447617d; color:#fff; margin-left:auto; margin-right:10px; text-align:right;border-right:3px solid #F7A600}
                .composer{display:flex; gap:8px; align-items:center; margin-top:10px;
                border:0px solid #E6E6E6; border-radius:14px; padding:6px;z-index: 1;
                    position: relative; width:93%}
                .composer input{flex:1; border:0; outline:0; padding:8px 12px; font-size:14px;border-radius: 10px 0 0 10px;
         height: 32px;}
                .composer button{border:0; background:#6564eb00; color:#fff; 
                border-radius:10px; font-weight:600; cursor:pointer; position: absolute;
         right: -7%;}
                 @media (max-width:650px) {
                .chat-popup {
                    max-width: none !important;
                    width: 88% !important;
                    left: 0 !important;
                    right: 0 !important;
                    border-radius: 0 !important;
                    }
                  }

                .msg.bot.typing{ display:flex; align-items:center; gap:6px }
                .msg.bot.typing .dot{
                  width:6px; height:6px; border-radius:50%;
                  background:#3E4B5A; opacity:.5; display:inline-block;
                  animation: typingBlink 1s infinite;
                }
                .msg.bot.typing .dot:nth-child(2){ animation-delay:.15s }
                .msg.bot.typing .dot:nth-child(3){ animation-delay:.3s }
                @keyframes typingBlink{
                  0%{ transform: translateY(0); opacity:.3 }
                  50%{ transform: translateY(-3px); opacity:1 }
                  100%{ transform: translateY(0); opacity:.3 }
                }
                .attio-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 1px solid #fff;
                background: #19273c;
                border-radius: 20px 20px 0px 0px;
              }
              .attio-end{
                background:#e53935; color:#fff; border:0;
                border-radius:6px; font-size:12px; padding:6px 10px;
                cursor:pointer; font-weight:600; transition:background .2s
              }
              .attio-end:hover{ background:#c62828 }
              .attio-close {
                 position: absolute;
              bottom: -13px;
              right: 17px;
              top: auto;
              width: 44px;
              display: flex
          ;
              align-items: center;
              justify-content: center;
              border: 0px solid #ececec;
              border-radius: 999px;
              background: #ffffff00;
              color: #60666f;
              font-size: 18px;
              line-height: 1;
              cursor: pointer;
              z-index: 5;
              }
                .msg .time {
              display:block;
              font-size:12px;
              color:#8a8a8a;
              margin-top:4px;
            }
            .msg.user .time{ color:#ffffffcc; text-align:right; }
            .msg.bot  .time { text-align:left;  opacity:.8; }
            .chatdiv.disabled {
              pointer-events: none;
              opacity: 0.5;
              filter: grayscale(0.2);
            }

            #rexMessages::-webkit-scrollbar {
    background-color: #434c4f;
    width: 4px;
}
    #rexMessages::-webkit-scrollbar-thumb {
    background-color: #fff;
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px #0000004d;
}
    #rexMessages::-webkit-scrollbar-track {
    background-color: #434c4f;
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px #0000004d;
}
          .prechat-topbar{
            display:flex; align-items:center; justify-content:space-between;
            padding:12px 16px; border-bottom:1px solid #EFEFEF;
          }

          .prechat-brand{ display:flex; align-items:center; gap:10px }
          .prechat-logo{
            width:28px; height:28px; border-radius:6px; overflow:hidden;
            display:flex; align-items:center; justify-content:center;
            background:#6c5ce7; box-shadow:0 1px 2px rgba(0,0,0,.1);
          }
          .prechat-logo img{ width:100%; height:100%; object-fit:cover }

          .prechat-title{ line-height:1.1 }
          .prechat-title .t{ font-weight:700; font-size:16px; color:#24252c }
          .prechat-title .s{ font-size:12px; color:#7A7A7A; margin-top:2px }

            .rex-confirm-overlay{
            position:absolute;     
            inset:0;             
            display:flex; align-items:center; justify-content:center;
            z-index: 9999;        
            backdrop-filter: blur(1px); 
          }
          .rex-confirm-box{
            width:min(75vw,420px); background:#fff; border:1px solid #ECECEC;
            border-radius:14px; box-shadow:0 18px 40px rgba(0,0,0,.18);
            padding:16px;
            font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;
          }
          .rex-confirm-title{font-weight:700; font-size:16px; color:#24252c; margin-bottom:6px}
          .rex-confirm-text{font-size:14px; color:#505050; margin:4px 0 14px}
          .rex-confirm-actions{display:flex; gap:10px; justify-content:flex-end}
          .rex-btn{border:0; padding:10px 14px; border-radius:10px; font-weight:600; cursor:pointer}
          .rex-btn.secondary{background:#f2f2f5; color:#333}
          .rex-btn.danger{background:#e53935; color:#fff}

         /* === Pre-chat (Support) — White card + animated underline === */
        .support-popup{
          position: fixed;
          bottom: 155px;
          right: 20px;
          max-width: 320px;
          width: 90%;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #ECECEC;
          box-shadow: 0 18px 40px rgba(0,0,0,.18);
          z-index: 1002;
          display: none;
          font-family: Inter,system-ui,Segoe UI,Arial,sans-serif;
          padding: 20px 20px 2px 20px;

        }
        .support-popup.show{ display:block }
        .support-popup::after{
          content:""; position:absolute; bottom:-18px; right:24px; width:36px; height:36px;
          background:#fff; transform:rotate(45deg); border-radius:0 0 8px 0;
          box-shadow:14px 15px 20px rgba(0,0,0,.08);
        }
        .support-header{
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 16px; border-bottom:1px solid #eff0f2; background: radial-gradient(circle at 50% 30%, #263b5aea 3%, #19273C 40%);border-radius: 20px 20px 0px 0px;
        }
        .support-brand{ display:flex; align-items:center; gap:5px }
        .support-logo{ width:36px; height:36px; border-radius:100px; border:5px solid #c4c4c423; overflow:hidden;
          display:flex; align-items:center; justify-content:center; background:#111; }
        .support-title .t{ font-weight:500; font-size:18px; color:#fff;text-transform: uppercase; }
        .support-title .s{ font-size:12px; color:#D1DCED }
/* Move X button to bottom-right of the support popup */
.support-popup { position: fixed; } /* already hai, just ensure */

.support-close{
  position: absolute;
    bottom: -13px;
    right: 17px;
    top: auto;
    width: 44px;
    display: flex
;
    align-items: center;
    justify-content: center;
    border: 0px solid #ececec;
    border-radius: 999px;
    background: #ffffff00;
    color: #60666f;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    z-index: 5;
}

        .support-body{ padding: 20px 20px 20px; background: radial-gradient(circle at 50% 30%, #263b5aea 3%, #19273C 40%);border-radius: 0px 0px 20px 20px; min-height:324px }

      .big-card{
        display:none;        
        margin-top:10px;                    
        padding: 2px 20px 20px 20px;
        border-right:3px solid #F7A600; border-radius:10px;
        background:#344761; box-shadow: inset 0 1px 0 rgba(0,0,0,.02);
        justify-content: flex-start;
        margin-left: 20px;
      }
        @keyframes rexFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .fade-in { 
        opacity: 0; 
        animation: rexFadeIn .35s ease forwards;
      }

        .big-card.show { display: block; }

      /* arrow tail ko crisp border + subtle shadow */
      .support-popup::after{
        content:""; position:absolute; bottom:-12px; right:24px;
        width:28px; height:28px;
        background:#fff; transform:rotate(45deg);
        border:1px solid #ececec;            /* NEW outline */
        border-top:0; border-left:0;         /* taaki top/left double-border na lage */
        border-radius:0 0 8px 0;
        box-shadow:10px 10px 18px rgba(0,0,0,.08);
        z-index:-1;
      }ow{ margin-bottom:12px; display:flex; align-items:center; gap:8px }
        .status-row {
        background: #ffffff1c;      /* halka grey background */
        border-left: 3px solid #6524EB;
        border-radius: 10px;      /* golai jaisa effect */
        padding: 10px 15px;
        display: inline-block;    /* message bubble jaisa lage */
        max-width: 80%;
        margin-bottom: 10px;
        font-size: 14px;
        color: #ffffffff;              /* text thoda readable ho */
        box-shadow: 0 2px 6px rgba(0,0,0,0.1); /* halka shadow */
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background-color: #4CAF50; /* green dot (active) */
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
        }

        .status-text {
          vertical-align: middle;
        }
        .field{ margin-top:5px }
        .label{ font-size:15px; color:#070a10; margin-bottom:6px; transition:.18s }
        .field:focus-within .label{ color:#111827; transform:translateY(-1px) }

        .input-dark{
          position:relative; display:flex; align-items:center; gap:8px;
          background:transparent; border:0; border-radius:0; padding:6px 2px; 
        }
        .input-dark::before{ content:""; position:absolute; left:0; right:0; bottom:0; height:1px; background:#fff }
        .input-dark::after{
          content:""; position:absolute; left:0; bottom:0; height:2px; width:0;
          background:linear-gradient(90deg,#6c5ce7,#8a7bfa); transition:width .2s ease, opacity .2s; opacity:1;
        }
        .input-dark:hover::after{ width:100%; opacity:.5 }
        .input-dark:focus-within::after{ width:100%; opacity:1 }

        .input-dark input{
          flex:1; border:0; outline:0; background:transparent;
          color:#fff; font-size:16px; line-height:1.2; padding:0 0 2px 0;
        }
        .input-dark input::placeholder{ color:#9aa4b2 }

        @keyframes shakeX { 0%{transform:translateX(0)}25%{transform:translateX(-4px)}
        50%{transform:translateX(4px)}75%{transform:translateX(-2px)}100%{transform:translateX(0)} }
        .input-dark.error::after{ width:100%; background:#ef4444 }
        .input-dark.error input{ color:#fff }
        .err{ color:#ef4444; font-size:12px; margin-top:6px; display:none }
        .err.show{ display:block; animation:shakeX .25s }

         .actions-ct {
          // position: absolute;
          left: 26px;
          right: 26px;
          bottom: 37px;
          display: flex;
          gap: 12px;
         }
          .attio-call{
          background:#10b981; /* green */
          color:#fff; border:0; border-radius:6px;
          font-size:12px; padding:6px 10px; cursor:pointer; font-weight:600;
          display:flex; align-items:center; gap:6px;
        }
        .attio-call:hover{ filter:brightness(1.05) }
        .attio-call svg { display:block }

        .btn{
           border:0; border-radius:25px; padding:10px 16px;
          font-weight:500; letter-spacing:.2px; font-size:15px; cursor:pointer; color:#fff;
          box-shadow:0 12px 24px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.08);
          transition:transform .12s ease, filter .12s ease;
          align-items: center;
    display: flex
;
    justify-content: center;
    gap: 10px;
        }
        .btn.primary{ background:#F7A600; }
        .btn.secondary{ background:#1AA82A; color:#1f2937;  }
        .btn:not(:disabled):hover{ transform:translateY(-2px); filter:brightness(1.05) }
        .btn:disabled{ opacity:1; cursor:not-allowed }
        .rex-spinner{
          width:16px;height:16px;
          border:2px solid currentColor;
          border-top-color: transparent;
          border-radius:50%;
          display:inline-block; vertical-align:-3px;
          margin-right:8px;
          animation: rexSpin .8s linear infinite;
        }
          .PoweredBy{
          // position: absolute;
          display:flex;
          justify-content: space-between;          
          color:#7D7D7D;
          font-size:12px;
          line-height: 18px;
          
          }
          .CloseX{
        position: relative;
        left: -12px;
        top: 5px;
        font-size: 22px;
          }
          .PoweredBy a{
          color:#7D7D7D;
          text-decoration:none;
          }

          .ChatCallBtn{
          margin-left:20px;
          margin-top:1rem;
          display:none
          }
          .ChatCallBtn.show{
          display:block;            
          opacity:1;
          transform: translateY(0);
          pointer-events:auto;
        }
        .support-popup .actions-ct.single {
          display: block;        
        }
        .support-popup .actions-ct.single .btn {
          width: 100%;
        }
        #agentButton.disabled { opacity: .6; cursor: not-allowed; }

        #pcGreetingMsg {
          letter-spacing: normal; 
        }
        @keyframes rexSpin{ to{ transform: rotate(360deg); } }

        @media (max-width:650px){
          .support-popup{ max-width:500px !important; width:88% !important; left:0 !important; right:0 !important; border-radius:0 !important }
          .big-card{ padding-bottom:60px }
          .support-body{
             height: 50dvh;
             overflow: auto;
          }
        }
          @media (max-width:370px){
          .big-card{ min-height:45dvh; padding-bottom:96px }
        }
          .typing-dots {
          display: inline-flex; gap: 4px; margin-left: 8px; vertical-align: middle;
        }
        .typing-dots i {
          width: 6px; height: 6px; border-radius: 50%;
          background:#4CAF50; opacity:.4; animation: pcBlink 1s infinite;
        }
        .typing-dots i:nth-child(2){ animation-delay:.15s }
        .typing-dots i:nth-child(3){ animation-delay:.3s }
        @keyframes pcBlink { 0%{transform:translateY(0);opacity:.3}
          50%{transform:translateY(-3px);opacity:1} 100%{transform:translateY(0);opacity:.3}
        }      
`;
  document.head.appendChild(style);
}

const currentSiteURL = window.location.origin;
const API_URL = "https://rex-bk.truet.net/api/";
// const API_URL = "http://localhost:2512/api";
const CHAT_LS_KEY = "rex_chat_history";
let typingEl = null;
function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
let __rex_end_called__ = false;
let __pc_greeting_played = false;
let __rex_only_user_end_timer = null;
let __rex_only_user_end_fired = false;

function getHistorySafe() {
  try {
    const raw =
      localStorage.getItem(
        typeof CHAT_LS_KEY === "string" ? CHAT_LS_KEY : "rex_chat_history"
      ) || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function hasOnlyUserMessages(hist) {
  if (!Array.isArray(hist) || hist.length === 0) return false;
  return hist.every((m) => String(m?.role).toLowerCase() === "user");
}
function lastUserTs(hist) {
  for (let i = hist.length - 1; i >= 0; i--) {
    if (String(hist[i]?.role).toLowerCase() === "user")
      return hist[i]?.ts || Date.now();
  }
  return null;
}

function clearOnlyUserAutoEndTimer() {
  if (__rex_only_user_end_timer) {
    clearTimeout(__rex_only_user_end_timer);
    __rex_only_user_end_timer = null;
  }
}
async function hardEndChatNow() {
  console.log("hard end chat");
  if (window.__rex_only_user_end_fired) return;
  window.__rex_only_user_end_fired = true;

  const chatId = localStorage.getItem("chat_id");
  if (!chatId) return;

  try {
    const knowledgeBaseId = localStorage.getItem("knowledge_base_id");

    // --- safe history read ---
    let hist = [];
    try {
      const raw =
        localStorage.getItem(
          typeof CHAT_LS_KEY === "string" ? CHAT_LS_KEY : "rex_chat_history"
        ) || "[]";
      hist = JSON.parse(raw);
      if (!Array.isArray(hist)) hist = [];
    } catch {
      hist = [];
    }

    const onlyUser =
      typeof hasOnlyUserMessages === "function"
        ? !!hasOnlyUserMessages(hist)
        : false;

    if (onlyUser || !knowledgeBaseId) {
      // end (no archive)
      const url = `${API_URL}/Chatbot/end-chat/${encodeURIComponent(chatId)}`;
      const res = await fetch(url, { method: "PATCH" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`end-chat HTTP ${res.status}: ${txt}`);
      }
    } else {
      // archive
      const res = await fetch(`${API_URL}/agent/end-chat-archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledge_base_id: knowledgeBaseId,
          chat_id: chatId,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`end-chat-archive HTTP ${res.status}: ${txt}`);
      }
    }
  } catch (e) {
    console.warn("[Rex] only-user auto end failed:", e);
  } finally {
    // --- LS cleanup ---
    try {
      localStorage.removeItem("rex_last_ui");
    } catch {}
    try {
      localStorage.removeItem(
        typeof CHAT_LS_KEY === "string" ? CHAT_LS_KEY : "rex_chat_history"
      );
    } catch {}
    try {
      localStorage.removeItem("chat_id");
    } catch {}
    try {
      localStorage.removeItem("rex_intro_inline");
    } catch {}
    try {
      clearOnlyUserAutoEndTimer?.();
    } catch {}
    try {
      document.getElementById("rexChatPopup")?.classList.remove("show");
    } catch {}
    window.location.reload();
    return;
  }
}

function scheduleOnlyUserAutoEnd(idleMs = 4 * 60 * 1000) {
  clearOnlyUserAutoEndTimer();

  const hist = getHistorySafe();
  if (!hasOnlyUserMessages(hist)) return;

  const lastTs = lastUserTs(hist) || Date.now();
  const remain = lastTs + idleMs - Date.now();

  if (remain <= 0) {
    hardEndChatNow();
    return;
  }
  __rex_only_user_end_timer = setTimeout(() => {
    const h2 = getHistorySafe();
    if (hasOnlyUserMessages(h2)) hardEndChatNow();
  }, remain);
}

function isGoodbye(text = "") {
  const t = String(text).toLowerCase();
  const patterns = [/\bhave a great day!?/];
  return patterns.some((re) => re.test(t));
}
function lockWidgetFor(ms = 3000) {
  const btn = document.getElementById("agentButton");
  if (!btn) return;
  btn.classList.add("disabled");
  btn.style.pointerEvents = "none";

  setTimeout(() => {
    btn.classList.remove("disabled");
    btn.style.pointerEvents = "auto";
  }, ms);
}
async function endChatArchiveNow({ silent = false } = {}) {
  if (window.__rex_end_called__) return;
  window.__rex_end_called__ = true;

  const CHAT_KEY =
    typeof CHAT_LS_KEY === "string" && CHAT_LS_KEY
      ? CHAT_LS_KEY
      : "rex_chat_history";

  let hist = [];
  try {
    const raw = localStorage.getItem(CHAT_KEY) || "[]";
    const parsed = JSON.parse(raw);
    hist = Array.isArray(parsed) ? parsed : [];
  } catch {
    hist = [];
  }

  const chatId = localStorage.getItem("chat_id");
  const knowledgeBaseId = localStorage.getItem("knowledge_base_id");

  try {
    if (chatId) {
      if (hist.length > 0 && knowledgeBaseId) {
        const res = await fetch(`${API_URL}/agent/end-chat-archive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            knowledge_base_id: knowledgeBaseId,
            chat_id: chatId,
          }),
        });
        console.log("end chat (archive)", res);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`end-chat-archive HTTP ${res.status}: ${txt}`);
        }
      } else {
        // simple end (no history or no KB)
        const url = `${API_URL}/Chatbot/end-chat/${encodeURIComponent(chatId)}`;
        const res = await fetch(url, { method: "PATCH" });
        console.log("end chat (simple)", res);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`end-chat HTTP ${res.status}: ${txt}`);
        }
      }
    }
  } catch (e) {
    console.error("[Rex] auto end-chat failed:", e);
    if (!silent) {
      appendMessage?.(
        "bot",
        "⚠️ Auto end nahi ho paaya. Aap window band kar sakte ho.",
        Date.now()
      );
    }
  } finally {
    try {
      localStorage.removeItem("rex_last_ui");
    } catch {}
    try {
      localStorage.removeItem("chat_id");
    } catch {}
    try {
      localStorage.removeItem("rex_intro_inline");
    } catch {}
    try {
      localStorage.setItem(CHAT_KEY, "[]");
    } catch {}

    try {
      clearInactivityTimers?.();
    } catch {}
    try {
      clearOnlyUserAutoEndTimer?.();
    } catch {}
    try {
      clearCloseTimer?.();
    } catch {}

    // ---- HARD UI TEARDOWN (no page reload) ----
    try {
      // close & wipe existing chat popup content
      const cp = document.getElementById("rexChatPopup");
      if (cp) {
        cp.classList.remove("show", "expanded");
        const msgs = cp.querySelector("#rexMessages");
        if (msgs) msgs.innerHTML = "";
        try {
          if (window.typingEl) {
            window.typingEl.remove?.();
            window.typingEl = null;
          }
        } catch {}
        cp.remove();
      }

      // support/prechat modals off
      try {
        document.getElementById("rexSupportPopup")?.classList.remove("show");
      } catch {}
      try {
        const pcm = document.getElementById("rexPreChatModal");
        if (pcm) pcm.style.display = "none";
      } catch {}

      // launcher back to normal
      try {
        document.getElementById("agentButton")?.classList.remove("noFloat");
      } catch {}

      // drop outer refs if any
      try {
        window.chatModalEl = null;
      } catch {}
    } catch (e) {
      console.warn("[Rex] UI teardown failed:", e);
    }

    // ---- SOFT RELOAD WIDGET (no page refresh) ----
    try {
      // 1) remove any existing popups to avoid duplicate IDs
      ["agentPopup", "rexChatPopup", "rexSupportPopup"].forEach((id) => {
        document.getElementById(id)?.remove();
      });

      // 2) drop the init flag so we can re-init cleanly
      window.__REX_WIDGET_INITIALIZED__ = false;

      // 3) ensure host exists (create if removed)
      if (!document.getElementById("review-widget")) {
        const host = document.createElement("div");
        host.id = "review-widget";
        document.body.appendChild(host);
      }

      // 4) re-init on next frames so DOM/LS writes settle
      const reinit = () => {
        try {
          // your existing bootstrapper
          createReviewWidget();
        } catch (e) {
          console.warn("reinit failed", e);
        }
      };
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => requestAnimationFrame(reinit));
      } else {
        setTimeout(reinit, 0);
      }
    } catch (e) {
      console.warn("[Rex] widget soft reload failed:", e);
    }

    // optional: refresh in-widget state (no network)
    try {
      loadChatHistory?.();
    } catch {}
  }
}
let __rex_close_timer__ = null;
function startCloseTimer() {
  clearCloseTimer();
  const WAIT_MS = 4 * 60 * 1000;

  __rex_close_timer__ = setTimeout(() => {
    try {
      const cp = document.getElementById("rexChatPopup");
      const isOpen = cp && cp.classList.contains("show");
      if (!isOpen) {
        endChatArchiveNow({ silent: true });
      }
    } catch (e) {
      console.warn("[Rex] close timer execution failed:", e);
    }
  }, WAIT_MS);
}

function clearCloseTimer() {
  if (__rex_close_timer__) {
    clearTimeout(__rex_close_timer__);
    __rex_close_timer__ = null;
  }
}

function saveChatHistory(arr) {
  try {
    localStorage.setItem(CHAT_LS_KEY, JSON.stringify(arr));
  } catch {}
}
function saveChatMessage(role, text) {
  const arr = loadChatHistory();
  arr.push({ role, text, ts: Date.now() });
  saveChatHistory(arr);
}
function extractBotText(resp) {
  const msgs = resp?.raw?.messages || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    const role = (m?.role || "").toLowerCase();
    const c = (m?.content || "").trim();
    if ((role === "agent" || role === "assistant") && c) return c;
  }

  let t = (resp?.text || "").trim();

  t = t.replace(/^\s*\{[\s\S]*?\}\s*/m, "").trim();

  if (/"transcript"|\"call_id\"|\"latest\"|^Agent:|^User:/m.test(t)) return "";
  return t;
}

// async function createChatCompletion(userText) {
//   let chatId = localStorage.getItem("chat_id");
//   const agentIdHdr =
//     localStorage.getItem("chat_agent_id") || getAgentIdFromScript();
//   const chat_agent_id = localStorage.getItem("chat_agent_id");

//   if (!chatId) {
//     await createChatSession(localStorage.getItem("chat_agent_id") || undefined);
//     chatId = localStorage.getItem("chat_id");
//     if (!chatId) throw new Error("chat_id missing; cannot send message");
//   }

//   const res = await fetch(`${API_URL}/Chatbot/create-chat-completion`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(agentIdHdr ? { agent_id: agentIdHdr } : {}),
//     },
//     body: JSON.stringify({ chat_id: chatId, content: userText, chat_agent_id }),
//   });

//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   const data = await res.json();
//   const botText = extractBotText(data) || "";
//   return { data, botText };
// }
async function createChatCompletion(userText) {
  let chatId = localStorage.getItem("chat_id");
  const agentIdHdr =
    localStorage.getItem("chat_agent_id") || getAgentIdFromScript();
  const chat_agent_id = localStorage.getItem("chat_agent_id");

  if (!chatId) {
    await createChatSession(localStorage.getItem("chat_agent_id") || undefined);
    chatId = localStorage.getItem("chat_id");
    if (!chatId) throw new Error("chat_id missing; cannot send message");
  }

  const res = await fetch(`${API_URL}/Chatbot/create-chat-completion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(agentIdHdr ? { agent_id: agentIdHdr } : {}),
    },
    body: JSON.stringify({ chat_id: chatId, content: userText, chat_agent_id }),
  });

  // Parse response safely (JSON or text or empty)
  let data = null;
  try {
    data = await res.clone().json();
  } catch {
    try {
      const txt = await res.text();
      data = txt ? { error: txt } : null;
    } catch {
      data = null;
    }
  }

  // Helper: only reload once per 10s to avoid loops
  const shouldReloadOnce = (reason) => {
    const key = "reload_guard_missing_agent";
    const last = Number(sessionStorage.getItem(key) || 0);
    const now = Date.now();
    if (now - last < 10_000) return false;
    sessionStorage.setItem(key, String(now));
    console.warn("Reloading due to:", reason);
    return true;
  };

  // Normalize known “missing agent / not found” signals
  const agentMissing =
    data?.error === "Agent not found" ||
    data?.detail?.message === "Not Found" ||
    data?.error?.includes?.("Agent not found") ||
    res.status === 404;

  if (agentMissing) {
    localStorage.removeItem("chat_id");
    localStorage.removeItem("rex_chat_history");

    if (
      shouldReloadOnce(
        data?.detail?.message || data?.error || `HTTP ${res.status}`
      )
    ) {
      window.location.reload();
    }
    throw new Error("Agent/session missing; cleared chat_id and reloaded.");
  }
  if (!res.ok) {
    const msg = data?.error || data?.detail?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const botText = extractBotText(data) || "";
  return { data, botText };
}
const getAgentIdFromScript = () => {
  const script = document.getElementById("rex-widget-script");
  if (!script) {
    console.warn("Script with ID 'rex-widget-script' not found");
    return localStorage.getItem("agent_id") || null;
  }

  const rawSrc = script.getAttribute("src") || "";
  try {
    const url = new URL(rawSrc, window.location.href);
    let agentId =
      url.searchParams.get("agentId") ||
      script.getAttribute("data-agent-id") ||
      localStorage.getItem("agent_id");

    if (agentId && agentId.trim()) {
      agentId = agentId.trim();
      localStorage.setItem("agent_id", agentId);
      return agentId;
    }

    console.warn(
      "agentId not found in script src / data attribute / localStorage"
    );
    return null;
  } catch (err) {
    console.error("Error parsing script src for agentId:", err);
    return localStorage.getItem("agent_id") || null;
  }
};
function buildRetellDynamicVars() {
  const take = (k) => {
    try {
      const v = localStorage.getItem(k);
      return typeof v === "string" && v.trim() ? v.trim() : null;
    } catch {
      return null;
    }
  };

  const vars = {
    img_primary: take("rex_img_primary"),
    img_secondary: take("rex_img_secondary"),
    img_logo: take("rex_img_logo"),
    user_email: take("rex_user_email"),
    user_name: take("rex_user_name"),
    user_phone: take("rex_user_phone"),
  };
  const out = {};
  for (const [k, v] of Object.entries(vars)) if (v) out[k] = v;
  return out;
}

async function shouldLoadWidget() {
  try {
    const agentId = getAgentIdFromScript();
    if (!agentId) return false;

    const response = await fetch(
      `${API_URL}/agent/checkAgentWidgetUrlAllowed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          url: currentSiteURL,
        }),
      }
    );

    if (!response.ok) return false;
    const data = await response.json();
    console.log(data, "data");
    return data?.allowed === true;
  } catch (error) {
    console.error("Widget load check failed:", error);
    return false;
  }
}
primeChatAgentId();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    const allowLoad = await shouldLoadWidget();
    if (allowLoad) createReviewWidget();
    else console.log("Widget load skipped due to API check.");
  });
} else {
  (async () => {
    const allowLoad = await shouldLoadWidget();
    if (allowLoad) createReviewWidget();
    else console.log("Widget load skipped due to API check.");
  })();
}
async function primeChatAgentId() {
  try {
    const agentId = getAgentIdFromScript();
    if (!agentId) return;

    const url = `${API_URL}/Chatbot/get-chat-agent-id?agent_id=${encodeURIComponent(
      agentId
    )}`;
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const chatAgentId = data?.chat_agent_id;

    if (chatAgentId) {
      localStorage.setItem("chat_agent_id", String(chatAgentId));
      window.dispatchEvent(
        new CustomEvent("chat-agent-id:ready", { detail: { chatAgentId } })
      );
      console.log("[Rex] chat_agent_id stored:", chatAgentId);
    } else {
      console.warn("[Rex] chat_agent_id not found in response:", data);
    }
  } catch (err) {
    console.error("[Rex] primeChatAgentId failed:", err);
  }
}
let __rex_create_session_promise = null;
async function createChatSession(agentIdFromStep1) {
  if (__rex_create_session_promise) return __rex_create_session_promise;

  __rex_create_session_promise = (async () => {
    try {
      const agentId = agentIdFromStep1 || localStorage.getItem("chat_agent_id");
      if (!agentId) throw new Error("agent_id not found for createChatSession");

      const res = await fetch(`${API_URL}/Chatbot/create-chat-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data?.chat_id) {
        localStorage.setItem("chat_id", String(data.chat_id));
        resetInactivityTimers?.();
        console.log("[Rex] chat_id stored:", data.chat_id);
      }
      return data;
    } finally {
      __rex_create_session_promise = null;
    }
  })();

  return __rex_create_session_promise;
}
function pingBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.16);
  } catch {}
}
function createReviewWidget() {
  if (window.__REX_WIDGET_INITIALIZED__) {
    console.log("Rex widget already initialized.");
    return;
  }
  window.__REX_WIDGET_INITIALIZED__ = true;

  const existingAgentBtn = document.getElementById("agentButton");
  const existingPopup = document.getElementById("agentPopup");
  if (existingAgentBtn && existingPopup) {
    console.log("Review widget already exists. Skipping re-render.");
    return;
  }

  document.querySelectorAll(".floating-agent").forEach((el) => {
    if (el.id !== "agentButton") el.remove();
  });

  let app = document.getElementById("review-widget");
  if (!app) {
    app = document.createElement("div");
    app.id = "review-widget";
    document.body.appendChild(app);
  }
  const createElement = (tag, options = {}) => {
    const el = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (key in el) el[key] = value;
      else el.setAttribute(key, value);
    });
    return el;
  };

  function setWidgetLocked(locked = true) {
    const btn = document.getElementById("agentButton");
    if (!btn) return;
    btn.classList.toggle("disabled", !!locked);
    btn.style.pointerEvents = locked ? "none" : "auto";
    btn.setAttribute("aria-disabled", locked ? "true" : "false");
  }
  function isCallPopupOpen() {
    const m = document.getElementById("agentPopup");
    return !!(m && m.style.display === "block");
  }

  const initWidget = async () => {
    const { RetellWebClient } = await import(
      "https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.7/+esm"
    );
    const retellWebClient = new RetellWebClient();
    const agentId = getAgentIdFromScript();

    // put this near your helpers
    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const SPECIAL_REX_AGENT = "agent_0498e1599d6ea9e13d09657f79";

    function enforceRexIfNoMinutes() {
      const callLeft = toNum(localStorage.getItem("call_mins_left"));
      const chatLeft = toNum(localStorage.getItem("chat_mins_left"));
      const addOnsLeft = toNum(localStorage.getItem("addOnsMins"));

      const allZero = callLeft === 0 && chatLeft === 0 && addOnsLeft === 0;
      if (allZero) {
        // lock to REX agent
        localStorage.setItem("agent_id", SPECIAL_REX_AGENT);

        // optionally remember last UI choice as "call"
        localStorage.setItem("rex_last_ui", "call");
        return true;
      }
      return false;
    }

    let agentName = "REX";
    let agentVoiceId = "";
    let agentVoiceName = "";
    let callId = "";
    let onCall = false;
    let userId = "";
    let businessName = "Rexptin";
    let avatar = "";
    let callContent = `Call ${agentName}`;
    let agentRole = "GENERAL";
    let agentVoipNumber = "NA";
    try {
      const agentRes = await fetch(
        `${API_URL}/agent/fetchAgentDetailsFromRetell/${agentId}`,
        {
          method: "GET",
        }
      );
      const text = await agentRes.text();
      try {
        const json = JSON.parse(text);

        // ---- Write to localStorage as string ----
        const isChatEnabled = Boolean(json.chatWidgetEnabled);
        localStorage.setItem("isChatEnabled", isChatEnabled ? "true" : "false");
        localStorage.setItem("call_mins_left", String(json.mins_left ?? ""));
        localStorage.setItem("chat_mins_left", String(json.messageLeft ?? ""));
        localStorage.setItem("addOnsMins", String(json.addOnsMins ?? ""));

        enforceRexIfNoMinutes();

        console.log(json, "json of wfwe");
        agentName = json.agentName || agentName;
        agentVoiceId = json.agentVoice || "";
        agentRole = json.agentRole;
        userId = json.userId;
        avatar = json.avatar;
        agentVoipNumber = json.voip_numbers;
        isChatEnabled = json.chatWidgetEnabled;
        // isChatEnabled = true;
        mins_left = json.mins_left;
        // mins_left = 90;
        messageLeft = json.messageLeft;
        // messageLeft = 90;
        const kbId = json.knowledgeBaseId || json.knowledgeBaseId;
        if (kbId) localStorage.setItem("knowledge_base_id", String(kbId));
      } catch (e) {
        console.log("Response is not JSON");
      }
      const voicesRes = await fetch(
        `${API_URL}/agent/fetchAgentVoiceDetailsFromRetell`,
        {
          method: "POST",
        }
      );
      if (voicesRes.ok) {
        const voicesData = await voicesRes.json();
        const voice = voicesData.find((v) => v.voice_id === agentVoiceId);
        console.log(voice, "voice ");
        if (voice) {
          agentVoiceName = voice.avatar_url || "https:i.pravatar.cc/100?img=68";
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }

    try {
      const bussinessDetails = await fetch(
        `${API_URL}/businessDetails/getBusinessDetailsById/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      ).then(async (res) => {
        const text = await res.text();
        const json = JSON.parse(text);
        businessName = json.businessName;
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    let rexAgent = document.getElementById("agentButton");
    if (!rexAgent) {
      rexAgent = createElement("div", {
        id: "agentButton",
        className: "floating-agent animate",
      });
      document.body.appendChild(rexAgent);
    } else {
      rexAgent.innerHTML = "";
    }

    const agentWrapper = createElement("div", { className: "agent-wrapper" });

    const wrapperBlink = createElement("div", { className: "WraperBlink" });

    const pulseRing = createElement("div", { className: "pulse-ring" });
    const pulseDot = createElement("div", { className: "pulse-dot" });

    wrapperBlink.appendChild(pulseRing);
    wrapperBlink.appendChild(pulseDot);

    const rexImg = createElement("img", {
      src: `https://rexptin.vercel.app/${avatar}`,
      alt: "AI Agent",
    });

    agentWrapper.appendChild(wrapperBlink);
    const badge2 = createElement("div", { className: "badge2" });
    const logoImg = createElement("img", {
      src: "https://rexptin.truet.net/images/favicon-final.svg",
      alt: "Badge Icon",
    });

    badge2.appendChild(logoImg);
    agentWrapper.appendChild(rexImg);
    agentWrapper.appendChild(badge2);
    rexAgent.appendChild(agentWrapper);

    function playPrechatGreeting(
      rootEl = document.getElementById("rexSupportPopup")
    ) {
      if (!rootEl) return;
      const $msg = rootEl.querySelector("#pcGreetingMsg");
      const $dots = rootEl.querySelector("#pcTyping");
      let $form =
        rootEl.querySelector("#pcFormWrap") ||
        rootEl.querySelector(".big-card");
      let $action = rootEl.querySelector(".ChatCallBtn");
      if (!$msg || !$dots || !$form) return;

      const LINES = [
        `Hello! Welcome to ${businessName} `,
        `Could you please share a few details before we continue?`,
      ];
      const typeText = (el, text, speed = 10) =>
        new Promise((res) => {
          let i = 0;
          const step = () => {
            if (i < text.length) {
              el.appendChild(document.createTextNode(text[i]));
              i++;
              setTimeout(step, speed);
            } else {
              res();
            }
          };
          step();
        });
      $dots.style.display = "inline-flex";
      setTimeout(async () => {
        $dots.style.display = "none";
        $msg.textContent = "";
        for (let i = 0; i < LINES.length; i++) {
          await typeText($msg, LINES[i], 10);
          await new Promise((r) => setTimeout(r, 150));
        }
        await new Promise((r) => setTimeout(r, 1000));
        $form.classList.add("show", "fade-in");
        $action.classList.add("show", "fade-in");
      }, 1000);
    }

    const modal = createElement("div", {
      id: "agentPopup",
      className: "popup",
    });
    modal.style.display = "none";

    const popupHeader = createElement("div", { className: "popup-header" });
    const poweredBy = createElement("a", {
      href: "https://www.rexpt.us/",
      target: "_blank",
      rel: "noopener noreferrer",
      innerHTML: "Powered by rexpt.us",
    });
    const popupBody = createElement("div", { className: "popup-body" });
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "pulse-ring-wrapper";
    const agentImg = document.createElement("img");
    agentImg.className = "agent-img";
    agentImg.src = `https://rexptin.vercel.app/${avatar}`;
    agentImg.alt = "Agent";
    const callBtn = createElement("div", {
      id: "start-call",
      className: "greendiv",
    });

    const infoWrapper = document.createElement("div");
    infoWrapper.className = "agent-info";

    const callLabel = document.createElement("p");
    callLabel.className = "call-label";
    callLabel.textContent = `Call ${agentName}`;
    try {
      modal.style.display = "none";
    } catch {}
    try {
      document.getElementById("rexSupportPopup")?.classList.remove("show");
    } catch {}
    try {
      document.getElementById("rexPreChatModal")?.style &&
        (document.getElementById("rexPreChatModal").style.display = "none");
    } catch {}
    try {
      document.getElementById("rexChatPopup")?.classList.remove("show");
    } catch {}

    try {
      document.getElementById("agentButton")?.classList.remove("noFloat");
    } catch {}
    const phoneNumber = document.createElement("h2");
    phoneNumber.className = "phone-number";
    phoneNumber.textContent = JSON.parse(agentVoipNumber);
    const tag = document.createElement("span");
    tag.className = "tag-label";
    tag.textContent = `${agentRole?.split(" ")[0]} RECEPTIONIST`;
    const phoneIconWrapper = createElement("div", { className: "phoneIcon" });
    const phoneIcon = createElement("img", {
      id: "phoneIcon",
      src: "https://rexptin.vercel.app/svg/Phone-call.svg",
    });
    phoneIconWrapper.appendChild(phoneIcon);

    const callText = createElement("div", {
      id: "callText",
      className: "callText",
    });

    callText.innerHTML = `<p>Call <span class="agentTag">${
      agentName.length > 10 ? `${agentName.substring(0, 7)}..` : agentName
    }</span></p><small>${
      businessName?.length > 10
        ? `${businessName.substring(0, 8)}..`
        : businessName
    } Agent is LIVE</small>`;

    callBtn.appendChild(phoneIconWrapper);
    callBtn.appendChild(callText);

    const chatBtn = createElement("div", {
      id: "start-chat",
      className: "chatdiv",
    });
    const chatIconWrapper = createElement("div", { className: "chatIcon" });
    const chatIcon = createElement("img", {
      id: "chatIcon",
      src: "https://rexpt-chat-widget.vercel.app/chatWithRex.svg",
      alt: "Chat",
    });
    chatIconWrapper.appendChild(chatIcon);

    const chatText = createElement("div", {
      id: "chatText",
      className: "chatText",
    });
    chatText.innerHTML = `<p>John ${agentName.substring(0, 7)}</p>`;

    chatBtn.appendChild(chatIconWrapper);
    chatBtn.appendChild(chatText);

    const buttonStack = createElement("div", { className: "button-stack" });
    const chat_mins_left = localStorage.getItem("chat_mins_left");
    const isChatEnabled = localStorage.getItem("isChatEnabled");

    if (isChatEnabled && chat_mins_left > 0) {
      buttonStack.appendChild(chatBtn);
      buttonStack.style.display = "flex";
    } else {
      buttonStack.style.display = "none";
    }

    buttonStack.appendChild(chatBtn);
    buttonStack.style.display = "none";
    function composeProfileIntro() {
      const name = localStorage.getItem("rex_user_name") || "";
      const email = localStorage.getItem("rex_user_email") || "";
      const phone = localStorage.getItem("rex_user_phone") || "";
      if (!name && !email && !phone) return "";
      return `My name is ${name}. My email is ${email} and my phone number is ${phone}.`;
    }

    function createBotBubble() {
      const $msgs = document.getElementById("rexMessages");
      const div = document.createElement("div");
      div.className = "msg bot";

      const content = document.createElement("span");
      content.className = "c";
      const time = document.createElement("span");
      time.className = "time";

      div.appendChild(content);
      div.appendChild(time);

      $msgs.appendChild(div);
      $msgs.scrollTop = $msgs.scrollHeight;

      return { el: div, contentEl: content, timeEl: time };
    }

    async function streamBotTextInto(
      bubble,
      fullText,
      { chunkSize = 3, delay = 18 } = {}
    ) {
      let i = 0;
      while (i < fullText.length) {
        const next = fullText.slice(i, i + chunkSize);
        i += chunkSize;
        bubble.contentEl.appendChild(document.createTextNode(next));

        bubble.timeEl.textContent = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        bubble.el.appendChild(bubble.timeEl);

        bubble.el.parentElement.scrollTop =
          bubble.el.parentElement.scrollHeight;
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    function uiAppendBotMessage(text) {
      try {
        const msgs = document.getElementById("rexMessages");
        if (!msgs) return;
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const div = document.createElement("div");
        div.className = "msg bot";
        div.innerHTML = `${text}<span class="time">${timeStr}</span>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
      } catch {}
    }
    function showIntroTyping() {
      try {
        if (document.getElementById("rexTypingIntro")) return;
        const msgs = document.getElementById("rexMessages");
        if (!msgs) return;
        const el = document.createElement("div");
        el.id = "rexTypingIntro";
        el.className = "msg bot typing";
        el.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
      } catch {}
    }

    function hideIntroTyping() {
      try {
        const el = document.getElementById("rexTypingIntro");
        if (el) el.remove();
      } catch {}
    }
    let __rex_intro_attempted = false;

    async function maybeSendIntroOnOpen() {
      if (__rex_intro_attempted) return;
      __rex_intro_attempted = true;

      if (!hasCompleteProfile()) return;

      if (!localStorage.getItem("chat_id")) {
        try {
          await createChatSession(
            localStorage.getItem("chat_agent_id") || undefined
          );
        } catch {}
      }
      const chatId = localStorage.getItem("chat_id") || "nochat";
      const sentKey = `rex_intro_sent_${chatId}`;

      if (localStorage.getItem(sentKey) === "1") return;

      localStorage.setItem(sentKey, "1");

      const intro =
        `My name is ${localStorage.getItem("rex_user_name") || ""}. ` +
        `My email is ${localStorage.getItem("rex_user_email") || ""} ` +
        `and my phone number is ${
          localStorage.getItem("rex_user_phone") || ""
        }.`;

      if (!intro.trim()) return;

      showIntroTyping();
      try {
        const { botText } = await createChatCompletion(intro);
        hideIntroTyping();
        if (botText) {
          // uiAppendBotMessage(botText);
          const bubble = createBotBubble();
          await streamBotTextInto(bubble, botText);
          saveChatMessage("bot", botText);
        }
      } catch (e) {
        localStorage.removeItem(sentKey);
        hideIntroTyping();
        console.error("intro send failed:", e);
      }
    }

    function disableChatButton() {
      chatBtn.classList.add("disabled");
      chatBtn.setAttribute("aria-disabled", "true");
    }

    function enableChatButton() {
      chatBtn.classList.remove("disabled");
      chatBtn.removeAttribute("aria-disabled");
    }

    function num(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    function isChatEnabledLS() {
      return /^(true|1)$/i.test(
        String(localStorage.getItem("isChatEnabled") ?? "")
      );
    }
    function bothMinsZero() {
      const chatEnabled = isChatEnabledLS();
      const chatMins = num(localStorage.getItem("chat_mins_left"));
      const callMins = num(localStorage.getItem("call_mins_left"));
      return (!chatEnabled || chatMins <= 0) && callMins <= 0;
    }

    chatBtn.onclick = (e) => {
      e.stopPropagation();
      if (onCall) return;
      if (chatMinsZero()) {
        localStorage.setItem("rex_last_ui", "call");
        openCallOnlyWidget();
        return;
      }

      localStorage.setItem("rex_last_ui", "chat");
      modal.style.display = "none";
      rexAgent.classList.remove("noFloat");
      ensureUserProfileThen(() => {
        const cp = getOrCreateChatPopup();
        cp.classList.add("show");
        cp.classList.remove("expanded");
        void cp.offsetWidth;
        cp.classList.add("expanded");
        clearCloseTimer();

        if (window.ChatLily?.mount) {
          window.ChatLily.mount("#rexChatPopupMount", {
            agentId: getAgentIdFromScript(),
            source: "popup_button",
          });
        }
      });
    };

    function setDefaultUIAfterProfile() {
      const v = localStorage.getItem("isChatEnabled");
      const chatEnabled = v === "true" || v === "1";
      if (chatEnabled && hasCompleteProfile()) {
        localStorage.setItem("rex_last_ui", "chat");
      }
    }

    async function ensureChatSession() {
      let chatId = localStorage.getItem("chat_id");
      if (chatId) return chatId;

      const agentId =
        localStorage.getItem("chat_agent_id") || getAgentIdFromScript();
      const data = await createChatSession(agentId);
      chatId = data?.chat_id;
      if (!chatId) throw new Error("Failed to create chat session");
      return chatId;
    }

    const closeButton = createElement("button", {
      className: "close-button",
      innerHTML: "×",
    });
    const agentIntro = document.createElement("p");
    agentIntro.className = "agent-intro";
    agentIntro.innerHTML = `By Clicking Call ${agentName} You agree to <b class="terms-text">Terms of Use</b>`;
    popupBody.appendChild(agentImg);
    popupBody.appendChild(callBtn);
    popupBody.appendChild(buttonStack);
    popupBody.appendChild(closeButton);
    popupHeader.appendChild(poweredBy);
    modal.appendChild(popupHeader);
    modal.appendChild(popupBody);
    document.body.appendChild(modal);
    infoWrapper.appendChild(callLabel);
    infoWrapper.appendChild(phoneNumber);
    infoWrapper.appendChild(tag);
    imageWrapper.appendChild(agentImg);
    popupBody.appendChild(imageWrapper);
    popupBody.appendChild(infoWrapper);

    popupBody.appendChild(callBtn);
    popupBody.appendChild(buttonStack);
    popupBody.appendChild(agentIntro);
    popupBody.appendChild(closeButton);
    popupHeader.appendChild(poweredBy);
    modal.appendChild(popupHeader);
    modal.appendChild(popupBody);
    let supportEl = null;

    function validateName(v = "") {
      return /^[a-zA-Z\s'.-]{2,}$/.test(String(v).trim());
    }
    function validateEmail(v = "") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
    }
    function validatePhone(v = "") {
      const digits = String(v).replace(/[^\d]/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }
    function getOrCreateSupportPopup() {
      if (supportEl) return supportEl;

      const logoUrl = "https://rexptin.truet.net/images/favicon-final.svg";
      supportEl = document.createElement("div");
      supportEl.id = "rexSupportPopup";
      supportEl.className = "support-popup";
      supportEl.innerHTML = `
      
    <div class="support-header">
      <div class="support-brand">
        <div class="support-logo"><img src="${logoUrl}" alt="" style="width:100%;height:100%"/></div>
        <div class="support-title">
          <div class="t">${agentName || "Support"}</div>
          <div class="s">Customer Success Agent</div>
        </div>
      </div>
      <button class="support-close" aria-label="Close">&times;</button>
    </div>


    <div class="support-body">
 

      <div class="status-row" id="pcGreetingRow">
        <span class="status-text" id="pcGreetingMsg"></span>
        <span id="pcTyping" class="typing-dots" aria-hidden="true">
          <i></i><i></i><i></i>
        </span>
      </div>

      <div class="big-card">
      

  <div class="field">
    <div class="input-dark">
        <input id="pcName" type="text" placeholder="John Doe" autocomplete="off" autocapitalize="off" autocorrect="off"
               spellcheck="false" aria-autocomplete="none" inputmode="text" maxlength="30">
    </div>
    <div class="err" id="erPcName"></div>
</div>

<div class="field">
    <div class="input-dark">
        <input id="pcEmail" type="email" placeholder="email@example.com" autocomplete="off" autocapitalize="off" autocorrect="off"
               spellcheck="false" aria-autocomplete="none" inputmode="email" maxlength="50">
    </div>
    <div class="err" id="erPcEmail"></div>
</div>

<div class="field">
    <div class="input-dark">
        <input id="pcPhone" type="tel" placeholder="+1 98XXXXXXXX" autocomplete="off" autocapitalize="off" autocorrect="off"
               spellcheck="false" aria-autocomplete="none" inputmode="tel" maxlength="15">
    </div>
    <div class="err" id="erPcPhone"></div>
</div>


       
      </div>

      <div class="ChatCallBtn">
       <div class="actions-ct">
        <!-- Chat -->
        <button class="btn primary" id="pcStartChat" aria-label="Start Chat" title="Start Chat">
        <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.8217 0.982666C4.86227 0.982666 0 5.84493 0 11.8043C0 13.1757 0.249347 14.4973 0.748041 15.744C1.12206 16.7165 1.64569 17.6141 2.29399 18.437L0.772975 21.9777C0.673237 22.227 0.698171 22.5262 0.872714 22.7257C1.02232 22.9003 1.2218 23 1.47115 23C1.52102 23 1.54595 23 1.59582 23L7.256 22.0026C8.40299 22.4016 9.59986 22.601 10.8217 22.601C16.781 22.601 21.6433 17.7388 21.6433 11.7794C21.6433 5.84493 16.781 0.982666 10.8217 0.982666ZM10.8217 21.1299C9.72453 21.1299 8.6274 20.9304 7.58015 20.5564C7.45547 20.5065 7.3308 20.5065 7.18119 20.5315L2.69295 21.3294L3.83994 18.6364C3.93968 18.3621 3.91475 18.0879 3.71527 17.8635C3.04203 17.0655 2.49347 16.1679 2.11945 15.2204C1.69556 14.1482 1.47115 13.0012 1.47115 11.8293C1.49608 6.66778 5.68511 2.47875 10.8217 2.47875C15.9582 2.47875 20.1472 6.66778 20.1472 11.8043C20.1472 16.9409 15.9582 21.1299 10.8217 21.1299Z" fill="#FFF2D8"/>
        <path d="M7.03111 13.4004C7.80229 13.4004 8.42745 12.7752 8.42745 12.004C8.42745 11.2328 7.80229 10.6077 7.03111 10.6077C6.25993 10.6077 5.63477 11.2328 5.63477 12.004C5.63477 12.7752 6.25993 13.4004 7.03111 13.4004Z" fill="#FFF2D8"/>
        <path d="M10.8211 13.4004C11.5923 13.4004 12.2175 12.7752 12.2175 12.004C12.2175 11.2328 11.5923 10.6077 10.8211 10.6077C10.05 10.6077 9.4248 11.2328 9.4248 12.004C9.4248 12.7752 10.05 13.4004 10.8211 13.4004Z" fill="#FFF2D8"/>
        <path d="M14.6112 13.4004C15.3824 13.4004 16.0075 12.7752 16.0075 12.004C16.0075 11.2328 15.3824 10.6077 14.6112 10.6077C13.84 10.6077 13.2148 11.2328 13.2148 12.004C13.2148 12.7752 13.84 13.4004 14.6112 13.4004Z" fill="#FFF2D8"/>
        </svg>

        Start Chat
                  

        </button>

        <!-- Call -->
        <button class="btn secondary" id="pcStartCall" aria-label="Start Call" title="Start Call">
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5554 5.5C16.6542 5.71439 17.6641 6.25179 18.4557 7.04343C19.2473 7.83507 19.7847 8.84492 19.9991 9.94375M15.5554 1C17.8383 1.25362 19.9672 2.27595 21.5924 3.89913C23.2176 5.52232 24.2426 7.64989 24.4991 9.9325M23.3741 18.91V22.285C23.3754 22.5983 23.3112 22.9084 23.1857 23.1955C23.0602 23.4826 22.8761 23.7403 22.6452 23.9521C22.4143 24.1639 22.1418 24.3252 21.845 24.4255C21.5482 24.5259 21.2337 24.5632 20.9216 24.535C17.4598 24.1588 14.1345 22.9759 11.2129 21.0813C8.49469 19.354 6.19013 17.0494 4.46288 14.3313C2.56161 11.3964 1.3784 8.05487 1.00913 4.5775C0.981018 4.2664 1.01799 3.95286 1.11769 3.65683C1.2174 3.3608 1.37765 3.08878 1.58824 2.85807C1.79884 2.62737 2.05516 2.44305 2.3409 2.31684C2.62663 2.19063 2.93551 2.12529 3.24788 2.125H6.62288C7.16885 2.11963 7.69815 2.31296 8.11211 2.66897C8.52608 3.02499 8.79647 3.51938 8.87288 4.06C9.01533 5.14007 9.27951 6.20057 9.66038 7.22125C9.81174 7.62391 9.8445 8.06153 9.75478 8.48224C9.66505 8.90295 9.4566 9.28913 9.15413 9.595L7.72538 11.0237C9.32688 13.8402 11.6589 16.1722 14.4754 17.7737L15.9041 16.345C16.21 16.0425 16.5962 15.8341 17.0169 15.7444C17.4376 15.6546 17.8752 15.6874 18.2779 15.8387C19.2986 16.2196 20.3591 16.4838 21.4391 16.6263C21.9856 16.7033 22.4847 16.9786 22.8415 17.3997C23.1983 17.8208 23.3878 18.3583 23.3741 18.91Z" stroke="#EBFFEE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
        </button>

        </div>
      </div>
      
    </div>
    <div class="PoweredBy">
      <span><a href="https://www.rxpt.us/" target="_blank" rel="noopener noreferrer">Powered by rxpt.us</a></span>

    </div>
  `;
      document.body.appendChild(supportEl);
      supportEl.querySelector(".support-close", ".CloseX").onclick = () => {
        setDefaultUIAfterProfile();
        supportEl.classList.remove("show");
        try {
          startCloseTimer();
        } catch {}
      };

      // put this near your helpers
      const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      const SPECIAL_REX_AGENT = "agent_0498e1599d6ea9e13d09657f79";
      const $name = supportEl.querySelector("#pcName");
      const $email = supportEl.querySelector("#pcEmail");
      const $phone = supportEl.querySelector("#pcPhone");
      const $eN = supportEl.querySelector("#erPcName");
      const $eE = supportEl.querySelector("#erPcEmail");
      const $eP = supportEl.querySelector("#erPcPhone");
      const $chat = supportEl.querySelector("#pcStartChat");
      const $call = supportEl.querySelector("#pcStartCall");
      const $actions = supportEl.querySelector(".actions-ct");

      // --- normalized flags/values ---
      const chatEnabledFlag = String(
        isChatEnabled ?? localStorage.getItem("isChatEnabled") ?? ""
      ).toLowerCase();
      const chatEnabled = chatEnabledFlag === "true" || chatEnabledFlag === "1";

      const chatMinsLeft = toNum(localStorage.getItem("chat_mins_left"));
      const addOnsMins = toNum(localStorage.getItem("addOnsMins")); // ✅ correct key
      const callMinsLeft = toNum(localStorage.getItem("call_mins_left"));

      // --- entitlements per your rules ---
      const hasChatEntitlement =
        chatEnabled && (chatMinsLeft > 0 || addOnsMins > 0); // (1) & (2)
      const hasCallEntitlement = callMinsLeft > 0; // (2) & (3)
      const allZero = chatMinsLeft <= 0 && addOnsMins <= 0 && callMinsLeft <= 0; // (4)

      // reset UI
      if ($actions) $actions.classList.remove("single");
      if ($chat) {
        $chat.style.display = "none";
        $chat.style.flex = "";
        $chat.style.width = "";
      }
      if ($call) {
        $call.style.display = "none";
        $call.style.flex = "";
        $call.style.width = "";
        $call.setAttribute("aria-disabled", "true");
      }

      // --- apply rules ---
      if (allZero) {
        // (4) sab zero => special rex agent lock + sirf disabled call button (aapka existing UX)
        localStorage.setItem("agent_id", SPECIAL_REX_AGENT);
        if ($call) {
          $call.style.display = "inline-flex";
          $call.style.flex = "1 1 100%";
          $call.style.width = "100%";
          $call.setAttribute("aria-disabled", "true");
        }
        if ($actions) $actions.classList.add("single");
      } else {
        // (1) & (2): chat sirf tab dikhana jab chatEnabled true ho AND (chatMinsLeft>0 || addOnsMins>0)
        if (hasChatEntitlement && $chat) {
          $chat.style.display = "inline-flex";
        }

        // (2) & (3): call sirf tab dikhana jab callMinsLeft>0
        if (hasCallEntitlement && $call) {
          $call.style.display = "inline-flex";
          $call.removeAttribute("aria-disabled");
        }

        // single/double layout
        const showChat = hasChatEntitlement;
        const showCall = hasCallEntitlement;

        if (showChat && !showCall) {
          if ($chat) {
            $chat.style.flex = "1 1 100%";
            $chat.style.width = "100%";
          }
          if ($actions) $actions.classList.add("single");
        } else if (!showChat && showCall) {
          if ($call) {
            $call.style.flex = "1 1 100%";
            $call.style.width = "100%";
          }
          if ($actions) $actions.classList.add("single");
        } else {
          if ($actions) $actions.classList.remove("single");
        }
      }

      $name.value = localStorage.getItem("rex_user_name") || "";
      $email.value = localStorage.getItem("rex_user_email") || "";
      $phone.value = localStorage.getItem("rex_user_phone") || "";
      const vNameSoft = (s) => {
        const t = String(s).trim();
        return /^[a-zA-Z'.-]{2,}(?:\s+[a-zA-Z'.-]+)*$/.test(t);
      };
      const vNameHard = (s) => {
        const parts = String(s).trim().split(/\s+/).filter(Boolean);
        if (parts.length < 1) return false;
        return parts.every((p) => /^[a-zA-Z'.-]{2,}$/.test(p));
      };
      const vEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
      const vPhone = (s, el) => {
        const raw = String(s || "").trim();

        if (!/^\+/.test(raw)) return false;

        if (el && el.__iti && window.intlTelInputUtils) {
          try {
            if (!el.__iti.isValidNumber()) return false;

            const e164 = el.__iti.getNumber(
              intlTelInputUtils.numberFormat.E164
            );
            const digits = e164.replace(/[^\d]/g, "");
            return digits.length >= 8 && digits <= 15;
          } catch {}
        }

        const compact = raw.replace(/\s|-/g, "");
        return /^\+\d{1,3}\d{6,14}$/.test(compact);
      };

      function saveLS() {
        if ($name.value)
          localStorage.setItem("rex_user_name", String($name.value).trim());
        if ($email.value)
          localStorage.setItem(
            "rex_user_email",
            String($email.value).trim().toLowerCase()
          );
        if ($phone.value)
          localStorage.setItem(
            "rex_user_phone",
            String($phone.value)
              .trim()
              .replace(/[^\d+]/g, "")
          );
        setDefaultUIAfterProfile();
      }

      let touched = { name: false, email: false, phone: false };

      function setFieldError($input, $errBox, msg) {
        const wrap = $input.closest(".field").querySelector(".input-dark");
        if (msg) {
          wrap.classList.add("error");
          $errBox.textContent = msg;
          $errBox.classList.add("show");
        } else {
          wrap.classList.remove("error");
          $errBox.textContent = "";
          $errBox.classList.remove("show");
        }
      }

      function clearAllErrors() {
        setFieldError($name, $eN, "");
        setFieldError($email, $eE, "");
        setFieldError($phone, $eP, "");
      }

      function validate(show = true) {
        const okNsoft = vNameSoft($name.value);
        const okE = vEmail($email.value);
        const okP = vPhone($phone.value);

        return vNameHard($name.value) && okE && okP;
      }

      function showAllErrorsNow() {
        touched.name = true;
        touched.email = true;
        touched.phone = true;
        validate(true);
      }

      function firstInvalid() {
        if (!vNameHard($name.value)) return $name;
        if (!vEmail($email.value)) return $email;
        if (!vPhone($phone.value)) return $phone;
        return null;
      }

      $name.addEventListener("input", () => {
        setFieldError($name, $eN, "");
        validate(false);
        saveLS();
      });
      $email.addEventListener("input", () => {
        setFieldError($email, $eE, "");
        validate(false);
        saveLS();
      });
      $phone.addEventListener("input", () => {
        setFieldError($phone, $eP, "");
        validate(false);
        saveLS();
      });

      $name.addEventListener("blur", () => {
        touched.name = true;
        validate(true);
      });
      $email.addEventListener("blur", () => {
        touched.email = true;
        validate(true);
      });
      $phone.addEventListener("blur", () => {
        touched.phone = true;
        validate(true);
      });

      [$name, $email, $phone].forEach(($el) => {
        $el.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            return;
          }
        });
      });

      function setButtonLoading(btn, text = "Please wait…") {
        if (!btn) return;
        if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = `<span class="rex-spinner"></span>${text}`;
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
      }

      function clearButtonLoading(btn) {
        if (!btn) return;
        if (btn.dataset.originalHtml) {
          btn.innerHTML = btn.dataset.originalHtml;
          delete btn.dataset.originalHtml;
        }
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      }

      $chat.onclick = async () => {
        touched.name = touched.email = touched.phone = true;

        const nameVal = $name.value.trim();
        const emailVal = $email.value.trim();
        const phoneVal = $phone.value.trim();

        const reqOr = (ok, $input, $errBox, reqMsg, fmtMsg) => {
          const v = $input.value.trim();
          if (!v) {
            setFieldError($input, $errBox, reqMsg);
            return false;
          }
          if (!ok) {
            setFieldError($input, $errBox, fmtMsg);
            return false;
          }
          setFieldError($input, $errBox, "");
          return true;
        };

        const okName = reqOr(
          vNameHard(nameVal),
          $name,
          $eN,
          "Name is required.",
          "Please enter your full name."
        );
        const okEmail = reqOr(
          vEmail(emailVal),
          $email,
          $eE,
          "Email is required.",
          "Please enter a valid email address."
        );
        const okPhone = reqOr(
          vPhone(phoneVal),
          $phone,
          $eP,
          "Phone is required.",
          "Please enter a valid phone number with country code (e.g. +91 98XXXXXXXX) number (10–15 digits)."
        );

        if (!okName || !okEmail || !okPhone) {
          (!okName ? $name : !okEmail ? $email : $phone).focus();
          return;
        }

        if ($chat.dataset.busy === "1") return;
        $chat.dataset.busy = "1";

        setButtonLoading($chat, "Starting chat…");
        const wasCallDisabled = $call?.disabled ?? false;
        if ($call) {
          $call.disabled = true;
          $call.setAttribute("aria-disabled", "true");
        }

        saveLS();
        localStorage.setItem("rex_last_ui", "chat");

        try {
          await ensureChatSession();
        } catch {}
        const cp = getOrCreateChatPopup();
        cp.classList.add("show");
        cp.classList.remove("expanded");
        void cp.offsetWidth;
        cp.classList.add("expanded");
        supportEl.classList.remove("show");
        clearCloseTimer();
      };

      $call.onclick = () => {
        touched.name = touched.email = touched.phone = true;

        const nameVal = $name.value.trim();
        const emailVal = $email.value.trim();
        const phoneVal = $phone.value.trim();

        const reqOr = (ok, $input, $errBox, reqMsg, fmtMsg) => {
          const v = $input.value.trim();
          if (!v) {
            setFieldError($input, $errBox, reqMsg);
            return false;
          }
          if (!ok) {
            setFieldError($input, $errBox, fmtMsg);
            return false;
          }
          setFieldError($input, $errBox, "");
          return true;
        };

        const okName = reqOr(
          vNameHard(nameVal),
          $name,
          $eN,
          "Name is required.",
          "Please enter your full name."
        );
        const okEmail = reqOr(
          vEmail(emailVal),
          $email,
          $eE,
          "Email is required.",
          "Please enter a valid email address."
        );
        const okPhone = reqOr(
          vPhone(phoneVal),
          $phone,
          $eP,
          "Phone is required.",
          "Please enter a valid phone number with country code (e.g. +91 98XXXXXXXX) number (10–15 digits)."
        );

        if (!okName || !okEmail || !okPhone) {
          (!okName ? $name : !okEmail ? $email : $phone).focus();
          return;
        }

        saveLS();

        if (!isChatEnabled) {
          localStorage.setItem("rex_last_ui", "call");
        } else {
          localStorage.setItem("rex_last_ui", "chat");
        }

        try {
          supportEl?.classList.remove("show");
        } catch {}
        try {
          document.getElementById("rexPreChatModal")?.style &&
            (document.getElementById("rexPreChatModal").style.display = "none");
        } catch {}
        try {
          document.getElementById("rexChatPopup")?.classList.remove("show");
        } catch {}

        const mainModal = document.getElementById("agentPopup");
        if (mainModal) mainModal.style.display = "block";
        if (typeof callBtn?.click === "function") callBtn.click();
      };

      setFieldError($name, $eN, "");
      setFieldError($email, $eE, "");
      setFieldError($phone, $eP, "");
      clearAllErrors();
      validate(false);
      return supportEl;
    }

    let __rex_widget_clicking = false;

    rexAgent.addEventListener("click", async () => {
      if (onCall || isCallPopupOpen()) {
        pingBeep?.();
        return;
      }
      const preferChat = localStorage.getItem("rex_last_ui") === "chat";
      const preferCall = localStorage.getItem("rex_last_ui") === "call";
      const hasHistory = (loadChatHistory() || []).length > 0;
      const prefer = localStorage.getItem("rex_last_ui");

      const chatEnabled = (() => {
        const v = localStorage.getItem("isChatEnabled");
        return v === "true" || v === "1";
      })();
      if (!hasCompleteProfile()) {
        const sp = getOrCreateSupportPopup();
        sp.classList.add("show");
        playPrechatGreeting();
        rexAgent.classList.add("noFloat");
        clearCloseTimer?.();
        return;
      }
      if (!chatEnabled || prefer === "call") {
        const modal = document.getElementById("agentPopup");
        if (modal) {
          modal.style.display = "block";
          setWidgetLocked(true);
          rexAgent.classList.add("noFloat");
          clearCloseTimer?.();
          return;
        }
      }

      if (prefer === "chat" || (chatEnabled && hasCompleteProfile())) {
        if (__rex_widget_clicking) return;
        __rex_widget_clicking = true;
        rexAgent.classList.add("is-busy");
        rexAgent.setAttribute("aria-busy", "true");

        try {
          await ensureUserProfileThen(async () => {
            try {
              await ensureChatSession();
            } catch {}

            const cp = getOrCreateChatPopup();
            cp.classList.add("show");
            cp.classList.remove("expanded");
            void cp.offsetWidth;
            cp.classList.add("expanded");
            rexAgent.classList.add("noFloat");
            clearCloseTimer();
          });
        } finally {
          rexAgent.classList.remove("is-busy");
          rexAgent.removeAttribute("aria-busy");
          __rex_widget_clicking = false;
        }
      } else {
        const sp = getOrCreateSupportPopup();
        sp.classList.add("show");
        playPrechatGreeting();
        rexAgent.classList.add("noFloat");
        clearCloseTimer();
      }
    });
    closeButton.addEventListener("click", async () => {
      modal.style.display = "none";
      rexAgent.classList.remove("noFloat");
      setWidgetLocked(false);

      if (onCall) {
        try {
          await retellWebClient.stopCall();
        } catch (err) {
          console.error("Call stop failed:", err);
        }
        try {
          localStorage.removeItem("rex_last_ui");
        } catch {}
        callBtn.classList.remove("reddiv");
        callBtn.classList.add("greendiv");
        phoneIcon.src = "https://rexptin.vercel.app/svg/Phone-call.svg";
        callText.innerHTML = `<p>Call <span class="agentTag">${
          agentName.length > 8 ? `${agentName.substring(0, 8)}..` : agentName
        }</span></p><small>${
          businessName.length > 10
            ? `${businessName.substring(0, 8)}..`
            : businessName
        } Agent is LIVE</small>`;
        onCall = false;
        setWidgetLocked(false);
      }
    });

    modal.addEventListener("click", async (e) => {
      if (e.target === modal) {
        try {
          if (onCall) await retellWebClient.stopCall();
        } catch {}
        onCall = false;
        setWidgetLocked(false);
        modal.style.display = "none";
        rexAgent.classList.remove("noFloat");
        setWidgetLocked(false);
      }
    });

    const termsWrapper = document.createElement("div");
    termsWrapper.className = "terms-wrapper";
    termsWrapper.style.position = "absolute";
    termsWrapper.style.top = "8.7rem";
    termsWrapper.style.zIndex = "11";
    popupBody.appendChild(termsWrapper);

    const termsPopup = document.createElement("div");
    termsPopup.id = "termsPopup";
    termsPopup.className = "terms-popup";
    termsPopup.style.display = "none";
    termsPopup.innerHTML = `
  <div class="terms-content" style="position: relative; padding: 5px;">
    <span class="close-terms" 
          style="position: absolute; top: 0; right: 0px; font-size: 20px; font-weight: bold; cursor: pointer;">
      &times;
    </span>
    <h2>Terms of Use
    </h2>
    <p> By clicking the Call button to talk to Rexpt AI agent on ${
      businessName?.length > 15
        ? `${businessName.substring(0, 20)}..`
        : businessName
    } named ${agentName}, You Agree to Terms of Use for Rexpt AI Agents published on <a href="https://www.rexpt.in/Terms-Condition" target="_blank" style="color: #007bff; text-decoration: underline;">TERMS & CONDITIONS</a>. Each time You interact with this Al agent, You consent to the recording, storage, and sharing of my communications with ${
      businessName?.length > 15
        ? `${businessName.substring(0, 20)}..`
        : businessName
    }, Rexpt & Other third-party service providers, and as described in the <a href="https://www.rexpt.in/Privacy-Policy" target="_blank" style="color: #007bff; text-decoration: underline;">
    Privacy Policy</a>. If you do not wish to have your conversations recorded, please refrain from using this service & DO NOT MAKE THE CALL.
    </p>
  </div>
`;

    termsWrapper.appendChild(termsPopup);

    agentIntro.querySelector(".terms-text").addEventListener("click", () => {
      termsPopup.style.display = "block";
    });

    termsPopup.querySelector(".close-terms").addEventListener("click", () => {
      termsPopup.style.display = "none";
    });

    // callBtn.onclick = async () => {
    //   localStorage.setItem("rex_last_ui", "call");
    //   const mainModal = document.getElementById("agentPopup");
    //   if (mainModal) {
    //     mainModal.style.display = "block";
    //     setWidgetLocked(true);
    //   }

    //   let agentId = localStorage.getItem("agent_id");
    //   if (!agentId && typeof getAgentIdFromScript === "function") {
    //     agentId = getAgentIdFromScript() || "";
    //     if (agentId) localStorage.setItem("agent_id", agentId);
    //   }
    //   const SPECIAL_AGENT = "agent_0498e1599d6ea9e13d09657f79";
    //   const endpoint =
    //     agentId === SPECIAL_AGENT ? "createRexWebCall" : "createWidegetWebCall";
    //   if (navigator?.mediaDevices) {
    //     try {
    //       const stream = await navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //       });
    //       micStream = stream;
    //     } catch (err) {
    //       console.error("Microphone access denied or error:", err);
    //       alert("Please allow microphone access to proceed with the call.");
    //       return;
    //     }
    //     if (!onCall) {
    //       callBtn.disabled = true;
    //       callContent = "Calling...";
    //       callLabel.textContent = callContent;
    //       callText.innerHTML = `<p>Connecting...</p>`;
    //       disableChatButton();
    //       try {
    //         const res = await fetch(`${API_URL}/agent/${endpoint}`, {
    //           method: "POST",
    //           headers: { "Content-Type": "application/json" },
    //           body: JSON.stringify({
    //             agent_id: agentId || localStorage.getItem("agent_id"),
    //             url: currentSiteURL,
    //             retell_llm_dynamic_variables: buildRetellDynamicVars(),
    //           }),
    //         });

    //         if (res.ok) {
    //           const data = await res.json();

    //           if (data?.access_token && data?.call_id) {
    //             const access_token = data.access_token;
    //             callId = data.call_id;

    //             await retellWebClient.startCall({ accessToken: access_token });
    //             callContent = "Connected";
    //             callLabel.textContent = callContent;
    //             callBtn.classList.remove("greendiv");
    //             callBtn.classList.add("reddiv");
    //             phoneIcon.src = "https://rexptin.vercel.app/svg/Hangup.svg";
    //             callText.innerHTML = `<p>Hang up Now</p><small>In Call with ${
    //               agentName.length > 10
    //                 ? `${agentName.substring(0, 8)}..`
    //                 : agentName
    //             }</small>`;
    //             onCall = true;

    //             imageWrapper.classList.add("active");

    //             imageWrapper
    //               .querySelectorAll(".pulse-ring2")
    //               .forEach((ring) => ring.remove());

    //             for (let i = 0; i < 3; i++) {
    //               const ring = document.createElement("span");
    //               ring.className = "pulse-ring2";
    //               imageWrapper.insertBefore(ring, agentImg);
    //             }
    //           } else {
    //             console.error("Invalid response data:", data);
    //             throw new Error("Invalid response data");
    //           }
    //         } else {
    //           throw new Error("Failed to fetch access token");
    //         }
    //       } catch (err) {
    //         console.error("Call failed:", err.message);
    //         callText.innerHTML = `<p style="color: red;">Unauthorized Access</p>`;
    //         enableChatButton();
    //         setWidgetLocked(false);
    //       } finally {
    //         callBtn.disabled = false;
    //         if (!onCall) enableChatButton();
    //       }
    //     } else {
    //       await retellWebClient.stopCall();
    //       try {
    //         localStorage.removeItem("rex_last_ui");
    //       } catch {}
    //       setWidgetLocked(false);
    //       callBtn.classList.remove("reddiv");
    //       callBtn.classList.add("greendiv");
    //       phoneIcon.src = "https://rexptin.vercel.app/svg/Phone-call.svg";
    //       callText.innerHTML = `<p style="color:white">Call <span class="agentTag">${
    //         agentName.length > 8 ? `${agentName.substring(0, 8)}..` : agentName
    //       }</span></p>
    //             <small>${
    //               businessName.length > 10
    //                 ? `${businessName.substring(0, 8)}..`
    //                 : businessName
    //             } Agent is LIVE</small>`;
    //       onCall = false;
    //       callLabel.textContent = `Call ${agentName}`;
    //       imageWrapper.classList.remove("active");
    //       imageWrapper
    //         .querySelectorAll(".pulse-ring2")
    //         .forEach((ring) => ring.remove());
    //       enableChatButton();
    //       const data = {
    //         agentId: getAgentIdFromScript(),
    //         callId: callId,
    //       };

    //       modal.style.display = "none";
    //       document.getElementById("agentButton")?.classList.remove("noFloat");

    //       // ---- SOFT RELOAD WIDGET (no page refresh) ----
    //       try {
    //         // 1) remove any existing popups to avoid duplicate IDs
    //         ["agentPopup", "rexChatPopup", "rexSupportPopup"].forEach((id) => {
    //           document.getElementById(id)?.remove();
    //         });

    //         // 2) drop the init flag so we can re-init cleanly
    //         window.__REX_WIDGET_INITIALIZED__ = false;

    //         // 3) ensure host exists (create if removed)
    //         if (!document.getElementById("review-widget")) {
    //           const host = document.createElement("div");
    //           host.id = "review-widget";
    //           document.body.appendChild(host);
    //         }

    //         // 4) re-init on next frames so DOM/LS writes settle
    //         const reinit = () => {
    //           try {
    //             createReviewWidget();
    //           } catch (e) {
    //             console.warn("reinit failed", e);
    //           }
    //         };
    //         if (typeof requestAnimationFrame === "function") {
    //           requestAnimationFrame(() => requestAnimationFrame(reinit));
    //         } else {
    //           setTimeout(reinit, 0);
    //         }
    //       } catch (e) {
    //         console.warn("[Rex] widget soft reload failed:", e);
    //       }
    //       // const res = await fetch(`${API_URL}/agent/updateAgentMinutesLeft`, {
    //       //     method: "PATCH",
    //       //     headers: { "Content-Type": "application/json" },
    //       //     body: JSON.stringify({  agentId: getAgentIdFromScript(), callId: callId }),
    //       //   });
    //     }
    //   }
    // };

    // add this near your other globals
    let isCreatingCall = false; // prevents double hits while request is pending

    callBtn.onclick = async () => {
      // if already creating or already on call, ignore repeat clicks (except hangup branch)
      if (isCreatingCall && !onCall) return;

      localStorage.setItem("rex_last_ui", "call");
      const mainModal = document.getElementById("agentPopup");
      if (mainModal) {
        mainModal.style.display = "block";
        setWidgetLocked(true);
      }

      let agentId = localStorage.getItem("agent_id");
      if (!agentId && typeof getAgentIdFromScript === "function") {
        agentId = getAgentIdFromScript() || "";
        if (agentId) localStorage.setItem("agent_id", agentId);
      }

      const SPECIAL_AGENT = "agent_0498e1599d6ea9e13d09657f79";
      const endpoint =
        agentId === SPECIAL_AGENT ? "createRexWebCall" : "createWidegetWebCall";

      if (navigator?.mediaDevices) {
        // ---- CLICK FOR CALL (not currently onCall) ----
        if (!onCall) {
          try {
            // lock immediately so rapid clicks don’t re-enter
            isCreatingCall = true;
            callBtn.disabled = true; // <- disable right away
            disableChatButton();

            // show "Connecting..." ASAP
            callContent = "Calling...";
            callLabel.textContent = callContent;
            callText.innerHTML = `<p>Connecting...</p>`;

            // ask mic permission
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
              });
              micStream = stream;
            } catch (err) {
              console.error("Microphone access denied or error:", err);
              alert("Please allow microphone access to proceed with the call.");
              return; // early exit; finally will run to unlock
            }

            // optional: protect fetch with AbortController (avoids overlaps/timeouts)
            const controller = new AbortController();

            const res = await fetch(`${API_URL}/agent/${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                agent_id: agentId || localStorage.getItem("agent_id"),
                url: currentSiteURL,
                retell_llm_dynamic_variables: buildRetellDynamicVars(),
              }),
              signal: controller.signal,
            });

            if (!res.ok) throw new Error("Failed to fetch access token");

            const data = await res.json();
            if (!(data?.access_token && data?.call_id)) {
              console.error("Invalid response data:", data);
              throw new Error("Invalid response data");
            }

            const access_token = data.access_token;
            callId = data.call_id;

            await retellWebClient.startCall({ accessToken: access_token });

            callContent = "Connected";
            callLabel.textContent = callContent;
            callBtn.classList.remove("greendiv");
            callBtn.classList.add("reddiv");
            phoneIcon.src = "https://rexptin.vercel.app/svg/Hangup.svg";
            callText.innerHTML = `<p>Hang up Now</p><small>In Call with ${
              agentName.length > 10
                ? `${agentName.substring(0, 8)}..`
                : agentName
            }</small>`;
            onCall = true;

            imageWrapper.classList.add("active");
            imageWrapper
              .querySelectorAll(".pulse-ring2")
              .forEach((r) => r.remove());
            for (let i = 0; i < 3; i++) {
              const ring = document.createElement("span");
              ring.className = "pulse-ring2";
              imageWrapper.insertBefore(ring, agentImg);
            }
          } catch (err) {
            console.error("Call failed:", err?.message || err);
            callText.innerHTML = `<p style="color: red;">Unauthorized Access</p>`;
            enableChatButton();
            setWidgetLocked(false);
          } finally {
            // while connecting/pending we keep it disabled.
            // re-enable only if we did NOT enter onCall state (i.e., failed/denied)
            if (!onCall) {
              callBtn.disabled = false;
            }
            isCreatingCall = false; // unlock for next attempt (or for hangup branch)
          }
          return; // end not-onCall branch
        }

        // ---- HANGUP BRANCH (already onCall) ----
        try {
          await retellWebClient.stopCall();
          try {
            localStorage.removeItem("rex_last_ui");
          } catch {}
          setWidgetLocked(false);
          callBtn.classList.remove("reddiv");
          callBtn.classList.add("greendiv");
          phoneIcon.src = "https://rexptin.vercel.app/svg/Phone-call.svg";
          callText.innerHTML = `<p style="color:white">Call <span class="agentTag">${
            agentName.length > 8 ? `${agentName.substring(0, 8)}..` : agentName
          }</span></p>
        <small>${
          businessName.length > 10
            ? `${businessName.substring(0, 8)}..`
            : businessName
        } Agent is LIVE</small>`;
          onCall = false;
          callLabel.textContent = `Call ${agentName}`;
          imageWrapper.classList.remove("active");
          imageWrapper
            .querySelectorAll(".pulse-ring2")
            .forEach((r) => r.remove());
          enableChatButton();

          const data = { agentId: getAgentIdFromScript(), callId: callId };

          modal.style.display = "none";
          document.getElementById("agentButton")?.classList.remove("noFloat");

          // ---- SOFT RELOAD WIDGET (no page refresh) ----
          try {
            ["agentPopup", "rexChatPopup", "rexSupportPopup"].forEach((id) => {
              document.getElementById(id)?.remove();
            });
            window.__REX_WIDGET_INITIALIZED__ = false;

            if (!document.getElementById("review-widget")) {
              const host = document.createElement("div");
              host.id = "review-widget";
              document.body.appendChild(host);
            }

            const reinit = () => {
              try {
                createReviewWidget();
              } catch (e) {
                console.warn("reinit failed", e);
              }
            };
            if (typeof requestAnimationFrame === "function") {
              requestAnimationFrame(() => requestAnimationFrame(reinit));
            } else {
              setTimeout(reinit, 0);
            }
          } catch (e) {
            console.warn("[Rex] widget soft reload failed:", e);
          }
        } finally {
          // ensure button is enabled after hangup
          callBtn.disabled = false;
          isCreatingCall = false;
        }
      }
    };

    let chatModalEl = null;

    const LS_USER_NAME = "rex_user_name";
    const LS_USER_EMAIL = "rex_user_email";
    const LS_USER_PHONE = "rex_user_phone";

    function validateName(v = "") {
      const s = String(v).trim();
      return /^[a-zA-Z\s'.-]{2,}$/.test(s);
    }
    function validateEmail(v = "") {
      const s = String(v).trim();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    }
    function validatePhone(v = "") {
      const s = String(v).trim();
      const digits = s.replace(/[^\d]/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }

    function getUserProfile() {
      return {
        name: localStorage.getItem(LS_USER_NAME) || "",
        email: localStorage.getItem(LS_USER_EMAIL) || "",
        phone: localStorage.getItem(LS_USER_PHONE) || "",
      };
    }
    function hasCompleteProfile() {
      const { name, email, phone } = getUserProfile();
      return validateName(name) && validateEmail(email) && validatePhone(phone);
    }
    function saveUserProfile({ name, email, phone }) {
      setDefaultUIAfterProfile();
      if (name) localStorage.setItem(LS_USER_NAME, String(name).trim());
      if (email)
        localStorage.setItem(LS_USER_EMAIL, String(email).trim().toLowerCase());
      if (phone) {
        const digits = String(phone).replace(/[^\d+]/g, "");
        localStorage.setItem(LS_USER_PHONE, digits);
      }
    }

    let preChatModalEl = null;
    function getOrCreatePreChatModal() {
      if (preChatModalEl) return preChatModalEl;

      preChatModalEl = document.createElement("div");
      preChatModalEl.id = "rexPreChatModal";

      preChatModalEl.style.cssText = `
    position:fixed; bottom:155px; right:20px; max-width:420px; width:90%;
    background:#fff; border-radius:16px; border:1px solid #ECECEC;
    box-shadow:0 18px 40px rgba(0,0,0,.18); z-index:1003; display:none;
    font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;
  `;
      const logoUrl = "https://rexptin.truet.net/images/favicon-final.svg";
      preChatModalEl.innerHTML = `
    <div class="prechat-topbar">
      <div class="prechat-brand">
        <div class="prechat-logo"><img src="${logoUrl}" alt="logo" /></div>
        <div class="prechat-title">
          <div class="t">Chat with ${agentName || "Marissa"}</div>
          <div class="s">The team can also help</div>
        </div>
      </div>
      <button id="rexPreX"
        style="border:0;background:transparent;font-size:20px;color:#666;cursor:pointer">&times;</button>
    </div>
    <div style="padding:14px 16px 18px">
      <div id="rexPreStep" style="font-size:13px;color:#666;margin-bottom:10px">Step 1 of 3</div>

      <label id="rexPreLabel" style="display:block;font-size:13px;margin-bottom:6px">Your full name</label>
      <input id="rexPreInput" type="text" placeholder="John Doe"
             style="width:93%;padding:11px 12px;border:1px solid #E6E6E6;border-radius:10px;font-size:14px;outline:0";maxlength="30"/>

      <div id="rexPreErr" style="color:#d93025;font-size:12px;margin-top:6px;display:none"></div>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
        <button id="rexPreBack"
        style="background:#f2f2f5;color:#333;border:0;padding:10px 14px;border-radius:10px;font-weight:600;cursor:pointer;display:none">
        Back
      </button>
        <button id="rexPreNext"   style="background:#6564EB;color:#fff;border:0;padding:10px 14px;border-radius:10px;font-weight:600;cursor:pointer">Next</button>
      </div>
    </div>
  `;
      document.body.appendChild(preChatModalEl);

      const $x = preChatModalEl.querySelector("#rexPreX");
      const $cancel = preChatModalEl.querySelector("#rexPreCancel");

      [$x, $cancel].filter(Boolean).forEach((btn) => {
        btn.onclick = () => hidePreChatModal();
      });
      return preChatModalEl;
    }

    function computePreStep() {
      const { name, email, phone } = getUserProfile();
      if (!validateName(name)) return 0;
      if (!validateEmail(email)) return 1;
      if (!validatePhone(phone)) return 2;
      return 3;
    }

    function onPreBack() {
      const $input = preChatModalEl.querySelector("#rexPreInput");
      const raw = ($input.value || "").trim();

      if (_preStep === 1) {
        _preData.email = raw;
        _preStep = 0;
      } else if (_preStep === 2) {
        _preData.phone = raw;
        _preStep = 1;
      } else {
        return;
      }

      applyStepUI();
    }

    function showPreChatModal() {
      try {
        const _modal = document.getElementById("agentPopup");
        if (_modal) _modal.style.display = "none";
      } catch {}

      const el = getOrCreatePreChatModal();

      const { name, email, phone } = getUserProfile();
      _preData = { name, email, phone };

      _preStep = computePreStep();

      if (_preStep === 3) {
        hidePreChatModal();
        if (typeof _queuedOpenChat === "function") {
          const fn = _queuedOpenChat;
          _queuedOpenChat = null;
          fn();
        }
        return;
      }

      applyStepUI();
      el.style.display = "block";

      const firstInput = el.querySelector("#rexPreInput");
      if (firstInput) firstInput.focus();
    }

    function hidePreChatModal() {
      if (preChatModalEl) preChatModalEl.style.display = "none";
    }

    let _preStep = 0;
    let _preData = { name: "", email: "", phone: "" };

    function applyStepUI() {
      const $step = preChatModalEl.querySelector("#rexPreStep");
      const $label = preChatModalEl.querySelector("#rexPreLabel");
      const $input = preChatModalEl.querySelector("#rexPreInput");
      const $err = preChatModalEl.querySelector("#rexPreErr");
      const $next = preChatModalEl.querySelector("#rexPreNext");
      const $back = preChatModalEl.querySelector("#rexPreBack");

      $err.style.display = "none";

      if (_preStep === 0) {
        $back.style.display = "none";
      } else {
        $back.style.display = "inline-block";
      }

      if (_preStep === 0) {
        $step.textContent = "Step 1 of 3";
        $label.textContent = "Your full name";
        $input.type = "text";
        $input.placeholder = "John Doe";
        $input.value = _preData.name || "";
        $next.textContent = "Next";
      } else if (_preStep === 1) {
        $step.textContent = "Step 2 of 3";
        $label.textContent = "Your email address";
        $input.type = "email";
        $input.placeholder = "email@example.com";
        $input.value = _preData.email || "";
        $next.textContent = "Next";
      } else {
        $step.textContent = "Step 3 of 3";
        $label.textContent = "Your phone number";
        $input.type = "tel";
        $input.placeholder = "+91 98XXXXXXXX";
        $input.value = _preData.phone || "";
        $next.textContent = "Start chat";
      }

      preChatModalEl.querySelector("#rexPreNext").onclick = onPreNext;
      preChatModalEl.querySelector("#rexPreBack").onclick = onPreBack;
      $input.onkeydown = (e) => {
        if (e.key === "Enter") onPreNext();
      };
    }

    async function archiveOpenChatIfAny() {
      const chatId = localStorage.getItem("chat_id");
      const knowledgeBaseId = localStorage.getItem("knowledge_base_id");
      console.log("[Rex] archiveOpenChatIfAny: start", {
        chatId,
        knowledgeBaseId,
      });

      try {
        if (!chatId) {
          console.warn(
            "[Rex] archiveOpenChatIfAny: no chat_id; skipping end/archive."
          );
          return "skip";
        }

        let hist = [];
        try {
          const raw =
            localStorage.getItem(
              typeof CHAT_LS_KEY === "string" ? CHAT_LS_KEY : "rex_chat_history"
            ) || "[]";
          hist = JSON.parse(raw);
          if (!Array.isArray(hist)) hist = [];
        } catch {
          hist = [];
        }

        const hasUserMsg = hist.some(
          (m) => String(m?.role).toLowerCase() === "user"
        );
        console.log("[Rex] archiveOpenChatIfAny: decision", {
          histLen: hist.length,
          hasUserMsg,
          chatId,
          knowledgeBaseId,
        });

        if (!hasUserMsg || !knowledgeBaseId) {
          const url = `${API_URL}/Chatbot/end-chat/${encodeURIComponent(
            chatId
          )}`;
          console.log("[Rex] END chat via PATCH →", url);
          const res = await fetch(url, { method: "PATCH" });
          console.log(res, "response of end chat");
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`end-chat HTTP ${res.status}: ${txt}`);
          }

          localStorage.removeItem("rex_last_ui");
          localStorage.removeItem(
            typeof CHAT_LS_KEY === "string" ? CHAT_LS_KEY : "rex_chat_history"
          );
          localStorage.removeItem("chat_id");
          console.log("[Rex] archiveOpenChatIfAny: END done + cleaned");
          return "end";
        } else {
          const url = `${API_URL}/agent/end-chat-archive`;
          console.log("[Rex] ARCHIVE via POST →", url);
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              knowledge_base_id: knowledgeBaseId,
              chat_id: chatId,
            }),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`end-chat-archive HTTP ${res.status}: ${txt}`);
          }

          localStorage.removeItem("rex_last_ui");
          localStorage.removeItem(
            typeof CHAT_LS_KEY === "string" ? CHAT_LS_KEY : "rex_chat_history"
          );
          localStorage.removeItem("chat_id");
          console.log("[Rex] archiveOpenChatIfAny: ARCHIVE done + cleaned");
          return "archive";
        }
      } catch (e) {
        console.warn("[Rex] archiveOpenChatIfAny failed:", e);
        throw e;
      }
    }
    function onPreNext() {
      const $input = preChatModalEl.querySelector("#rexPreInput");
      const $err = preChatModalEl.querySelector("#rexPreErr");
      const raw = ($input.value || "").trim();

      _preData.phone = raw;
      saveUserProfile({ phone: raw });

      hidePreChatModal();

      if (typeof _queuedOpenChat === "function") {
        const fn = _queuedOpenChat;
        _queuedOpenChat = null;
        fn();
      }
    }

    let _queuedOpenChat = null;

    function ensureUserProfileThen(openChatFn) {
      const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      // ✅ sahi keys + chatEnabled flag
      const chatEnabled = /^(true|1)$/i.test(
        String(localStorage.getItem("isChatEnabled") ?? "")
      );
      const chatLeft = toNum(localStorage.getItem("chat_mins_left"));
      const callLeft = toNum(localStorage.getItem("call_mins_left"));
      const addOnsMins = toNum(localStorage.getItem("addOnsMins")); // <-- yahi sahi key hai

      // ✅ entitlements per rules
      const hasChatEntitlement =
        chatEnabled && (chatLeft > 0 || addOnsMins > 0); // (1) & (2)
      const hasCallEntitlement = callLeft > 0; // (2) & (3)
      const allZero = chatLeft <= 0 && callLeft <= 0 && addOnsMins <= 0; // (4)

      const openCallAfterWrites = (forceSpecialAgent) => {
        localStorage.setItem("rex_last_ui", "call");
        if (forceSpecialAgent) {
          localStorage.setItem("agent_id", "agent_0498e1599d6ea9e13d09657f79"); // SPECIAL REX
        }
        const run = () => {
          if (typeof openCallOnlyWidget === "function") openCallOnlyWidget();
        };
        if (typeof requestAnimationFrame === "function") {
          requestAnimationFrame(() => requestAnimationFrame(run));
        } else {
          setTimeout(run, 0);
        }
      };

      // (4) teeno zero -> special rex agent + call-only (disabled UX)
      if (allZero) {
        openCallAfterWrites(true);
        return;
      }

      // (3) sirf call entitlement bacha (chat/add-on zero ya chatEnabled=false)
      if (!hasChatEntitlement && hasCallEntitlement) {
        openCallAfterWrites(false);
        return;
      }

      // (1)/(2) chat entitlement true (chat_mins>0 ya addOnsMins>0) & chatEnabled=true -> chat khol do
      if (hasChatEntitlement) {
        if (typeof hasCompleteProfile === "function" && hasCompleteProfile()) {
          openChatFn();
        } else {
          _queuedOpenChat = openChatFn;
          showPreChatModal();
        }
        return;
      }

      // Fallback: safety—agar yahan aaye to call UI dikha do (agent force nahi)
      openCallAfterWrites(false);
    }

    function makeEndConfirm(parentEl) {
      let overlay = null,
        okCb = null,
        cancelCb = null;

      function open({ onOk, onCancel } = {}) {
        okCb = onOk || null;
        cancelCb = onCancel || null;

        overlay = document.createElement("div");
        overlay.className = "rex-confirm-overlay";
        overlay.innerHTML = `
      <div class="rex-confirm-box" role="dialog" aria-modal="true" aria-labelledby="rexConfirmTitle">
        <div id="rexConfirmTitle" class="rex-confirm-title">End chat?</div>
        <div class="rex-confirm-text" id="rexConfirmText">
          Your current conversation will be archived. Are you sure you want to end this chat?
        </div>
        <div class="rex-confirm-actions">
          <button class="rex-btn secondary" data-act="cancel">Cancel</button>
          <button class="rex-btn danger" data-act="okk">End chat</button>
        </div>
      </div>
    `;

        (parentEl || document.body).appendChild(overlay);

        const $cancel = overlay.querySelector('[data-act="cancel"]');
        const $ok = overlay.querySelector('[data-act="okk"]');
        const $text = overlay.querySelector("#rexConfirmText");

        const setBusy = (busy, label = "Ending…") => {
          $ok.disabled = $cancel.disabled = busy;
          if (busy) {
            $ok.dataset._old = $ok.textContent;
            $ok.textContent = label;
          } else {
            if ($ok.dataset._old) $ok.textContent = $ok.dataset._old;
            delete $ok.dataset._old;
          }
        };

        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) close(false);
        });
        document.addEventListener("keydown", escHandler, true);

        $cancel.onclick = () => close(false);

        $ok.onclick = async () => {
          try {
            setBusy(true, "Ending…");

            const result = await archiveOpenChatIfAny();

            if (typeof okCb === "function") {
              try {
                okCb(result);
              } catch {}
            }
            close(true);
          } catch (err) {
            console.error("[Rex] End/Archive failed from confirm:", err);
            $text.textContent = "Failed to end chat. Please try again.";
            setBusy(false);
            return;
          }
        };

        setTimeout(() => $cancel.focus(), 0);

        function escHandler(e) {
          if (e.key === "Escape") close(false);
        }

        function close(confirmed) {
          document.removeEventListener("keydown", escHandler, true);
          if (overlay) overlay.remove();
          const ok = confirmed === true;
          if (ok && okCb) okCb();
          if (!ok && cancelCb) cancelCb();
          overlay = null;
          okCb = cancelCb = null;
        }
      }
      function escHandler(e) {
        if (e.key === "Escape") close(false);
      }

      function close(confirmed) {
        if (!overlay) return;
        document.removeEventListener("keydown", escHandler, true);
        overlay.remove();
        const ok = confirmed === true;
        if (ok && typeof okCb === "function") okCb();
        if (!ok && typeof cancelCb === "function") cancelCb();
        overlay = null;
        okCb = cancelCb = null;
      }

      return { open };
    }

    function getOrCreateChatPopup() {
      if (chatModalEl) return chatModalEl;

      const logoUrl = "https://rexptin.truet.net/images/favicon-final.svg";

      chatModalEl = document.createElement("div");
      chatModalEl.id = "rexChatPopup";
      chatModalEl.className = "chat-popup";
      chatModalEl.innerHTML = `

      
        <div class="attio-header">
          <div class="attio-brand" style="display:flex;align-items:center;gap:10px">
            <div class="attio-logo" style="width:36px;height:36px;border-radius:100px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#111">
              <img src="${logoUrl}" alt="" style="width:100%;height:100%"/>
            </div>
            <div class="attio-title" style="line-height:1">
              <div class="t" style="font-weight:700;font-size:20px;color:#fff; text-transform:uppercase"> ${agentName.substring(
                0,
                7
              )}</div>
              <div class="s" style="font-size:12px;color:#D1DCED">Customer Success Agent</div>
            </div>
          </div>

            <div style="display:flex;align-items:center;gap:6px">
        <!-- NEW: Call icon button -->
        <button class="attio-call btn secondary" id="rexCallIconBtn" aria-label="Start call">
          
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5554 5.5C16.6542 5.71439 17.6641 6.25179 18.4557 7.04343C19.2473 7.83507 19.7847 8.84492 19.9991 9.94375M15.5554 1C17.8383 1.25362 19.9672 2.27595 21.5924 3.89913C23.2176 5.52232 24.2426 7.64989 24.4991 9.9325M23.3741 18.91V22.285C23.3754 22.5983 23.3112 22.9084 23.1857 23.1955C23.0602 23.4826 22.8761 23.7403 22.6452 23.9521C22.4143 24.1639 22.1418 24.3252 21.845 24.4255C21.5482 24.5259 21.2337 24.5632 20.9216 24.535C17.4598 24.1588 14.1345 22.9759 11.2129 21.0813C8.49469 19.354 6.19013 17.0494 4.46288 14.3313C2.56161 11.3964 1.3784 8.05487 1.00913 4.5775C0.981018 4.2664 1.01799 3.95286 1.11769 3.65683C1.2174 3.3608 1.37765 3.08878 1.58824 2.85807C1.79884 2.62737 2.05516 2.44305 2.3409 2.31684C2.62663 2.19063 2.93551 2.12529 3.24788 2.125H6.62288C7.16885 2.11963 7.69815 2.31296 8.11211 2.66897C8.52608 3.02499 8.79647 3.51938 8.87288 4.06C9.01533 5.14007 9.27951 6.20057 9.66038 7.22125C9.81174 7.62391 9.8445 8.06153 9.75478 8.48224C9.66505 8.90295 9.4566 9.28913 9.15413 9.595L7.72538 11.0237C9.32688 13.8402 11.6589 16.1722 14.4754 17.7737L15.9041 16.345C16.21 16.0425 16.5962 15.8341 17.0169 15.7444C17.4376 15.6546 17.8752 15.6874 18.2779 15.8387C19.2986 16.2196 20.3591 16.4838 21.4391 16.6263C21.9856 16.7033 22.4847 16.9786 22.8415 17.3997C23.1983 17.8208 23.3878 18.3583 23.3741 18.91Z" stroke="#EBFFEE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
        </button>

        

      <!--  <button class="attio-end">End chat</button> -->
        <button class="attio-close" aria-label="Close">&times;</button>
      </div>
        </div>

        <div class="attio-body">
          <div id="rexMessages" class="attio-thread"></div>
          <div class="composer">
            <input id="rexInput" type="text" placeholder="Type a message…" />
            <button id="rexSend" type="button">
          <svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="33" cy="33" r="33" fill="#C4C4C4" fill-opacity="0.1"/>
        <circle cx="33" cy="32.9998" r="27" fill="#6524EB"/>
        <path d="M18.0045 29.3431C17.9665 30.1118 18.1686 30.8732 18.5829 31.5218C18.9971 32.1704 19.603 32.6738 20.3163 32.9624L28.3068 36.2539L32.2735 32.2864C32.4668 32.1062 32.7225 32.0081 32.9867 32.0128C33.251 32.0174 33.5031 32.1245 33.6899 32.3114C33.8768 32.4983 33.9838 32.7505 33.9885 33.0147C33.9931 33.279 33.8951 33.5348 33.7149 33.7281L29.7496 37.6956L33.0404 45.6877C33.3181 46.3742 33.7953 46.9616 34.4103 47.3738C35.0254 47.786 35.75 48.0042 36.4904 47.9999H36.659C37.428 47.9717 38.1692 47.7047 38.7796 47.236C39.3901 46.7674 39.8394 46.1202 40.0654 45.3844L46.828 23.8618C47.0329 23.2096 47.0552 22.5136 46.8924 21.8496C46.7296 21.1856 46.388 20.579 45.9047 20.0955C45.4214 19.6121 44.8148 19.2704 44.1509 19.1076C43.4871 18.9448 42.7913 18.9671 42.1392 19.1721L20.6209 25.936C19.885 26.1618 19.2377 26.6111 18.7688 27.2217C18.3 27.8323 18.0328 28.5737 18.0045 29.3431Z" fill="white"/>
        </svg>

        </button>
          </div>
        </div>
 
      <div class="PoweredBy">
        <span><a href="https://www.rxpt.us/" target="_blank" rel="noopener noreferrer">Powered by rxpt.us</a></span>
        </div>

`;

      document.body.appendChild(chatModalEl);
      const endConfirm = makeEndConfirm(chatModalEl);

      // add once at module scope
      let isCreatingCall = false;

      async function startVoiceCall() {
        // guard: avoid duplicate hits while request is in-flight or if already on a call
        if (isCreatingCall || onCall) return;

        isCreatingCall = true;
        callBtn.disabled = true; // disable immediately
        callLabel.textContent = "Connecting…";
        callText.textContent = "Connecting…";

        try {
          // mic permission (keeps button disabled during prompt)
          await navigator.mediaDevices.getUserMedia({ audio: true });

          // optional: protects against overlaps/timeouts
          const controller = new AbortController();

          const res = await fetch(`${API_URL}/agent/createWidegetWebCall`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent_id: localStorage.getItem("agent_id"),
              url: currentSiteURL,
              retell_llm_dynamic_variables: buildRetellDynamicVars(),
            }),
            signal: controller.signal,
          });
          if (!res.ok) throw new Error("Failed to fetch access token");

          const data = await res.json();
          if (!data?.access_token || !data?.call_id)
            throw new Error("Invalid response data");

          callId = data.call_id;
          await retellWebClient.startCall({ accessToken: data.access_token });

          // === connected state ===
          callLabel.textContent = "Connected";
          callBtn.classList.remove("greendiv");
          callBtn.classList.add("reddiv");
          phoneIcon.src = "https://rexptin.vercel.app/svg/Hangup.svg";
          callText.innerHTML = `<p>Hang up Now</p><small>In Call with ${
            agentName.length > 10 ? `${agentName.substring(0, 8)}..` : agentName
          }</small>`;
          onCall = true;

          imageWrapper.classList.add("active");
          imageWrapper
            .querySelectorAll(".pulse-ring2")
            .forEach((r) => r.remove());
          for (let i = 0; i < 3; i++) {
            const ring = document.createElement("span");
            ring.className = "pulse-ring2";
            imageWrapper.insertBefore(ring, agentImg);
          }

          // IMPORTANT: once connected, enable button so user can hang up
          callBtn.disabled = false;
        } catch (err) {
          console.error("startVoiceCall failed:", err);
          callText.textContent = "Unable to connect";
          onCall = false;

          // allow retry after failure
          callBtn.disabled = false;
        } finally {
          isCreatingCall = false; // unlock for the next attempt
        }
      }

      // async function startVoiceCall() {
      //   try {
      //     callBtn.disabled = true;

      //     callLabel.textContent = "Connecting…";
      //     callText.textContent = "Connecting…";

      //     await navigator.mediaDevices.getUserMedia({ audio: true });

      //     const res = await fetch(`${API_URL}/agent/createWidegetWebCall`, {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({
      //         agent_id: localStorage.getItem("agent_id"),
      //         url: currentSiteURL,
      //         retell_llm_dynamic_variables: buildRetellDynamicVars(),
      //       }),
      //     });
      //     if (!res.ok) throw new Error("Failed to fetch access token");

      //     const data = await res.json();
      //     if (!data?.access_token || !data?.call_id)
      //       throw new Error("Invalid response data");

      //     callId = data.call_id;
      //     await retellWebClient.startCall({ accessToken: data.access_token });

      //     callLabel.textContent = "Connected";
      //     callBtn.classList.remove("greendiv");
      //     callBtn.classList.add("reddiv");
      //     phoneIcon.src = "https://rexptin.vercel.app/svg/Hangup.svg";
      //     callText.innerHTML = `<p>Hang up Now</p><small>In Call with ${
      //       agentName.length > 10 ? `${agentName.substring(0, 8)}..` : agentName
      //     }</small>`;
      //     onCall = true;

      //     imageWrapper.classList.add("active");
      //     imageWrapper
      //       .querySelectorAll(".pulse-ring2")
      //       .forEach((r) => r.remove());
      //     for (let i = 0; i < 3; i++) {
      //       const ring = document.createElement("span");
      //       ring.className = "pulse-ring2";
      //       imageWrapper.insertBefore(ring, agentImg);
      //     }
      //   } catch (err) {
      //     console.error("startVoiceCall failed:", err);
      //     callText.textContent = "Unable to connect";
      //     onCall = false;
      //   } finally {
      //     callBtn.disabled = false;
      //   }
      // }
      function openCallConfirmInsideChat() {
        const overlay = document.createElement("div");
        overlay.className = "rex-confirm-overlay";
        overlay.innerHTML = `
    <div class="rex-confirm-box" role="dialog" aria-modal="true">
      <div class="rex-confirm-title">Start a call?</div>
      <div class="rex-confirm-text">Do you want to start the call?</div>
      <div class="rex-confirm-actions">
        <button class="rex-btn secondary" data-act="cancel">Cancel</button>
        <button class="rex-btn danger" data-act="ok">Start call</button>
      </div>
    </div>
  `;
        chatModalEl.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) close();
        });

        const cancelBtn = overlay.querySelector('[data-act="cancel"]');
        const okBtn = overlay.querySelector('[data-act="ok"]');
        overlay.querySelector('[data-act="cancel"]').onclick = close;

        okBtn.onclick = async () => {
          if (okBtn.dataset.busy === "1") return;

          okBtn.dataset.busy = "1";
          const oldOkHtml = okBtn.innerHTML;
          okBtn.innerHTML = `<span class="rex-spinner" style="margin-right:6px"></span>Starting…`;
          okBtn.disabled = true;
          okBtn.setAttribute("aria-busy", "true");
          if (cancelBtn) cancelBtn.disabled = true;

          try {
            clearOnlyUserAutoEndTimer();
            clearInactivityTimers?.();

            callLabel.textContent = "Ending previous chat…";
            callText.innerHTML = `<span class="rex-spinner"></span><p>Ending previous chat…</p>`;

            const hadOpenChat = !!localStorage.getItem("chat_id");
            let endStatus = "skip";
            if (hadOpenChat) {
              endStatus = await archiveOpenChatIfAny();
            } else {
              console.log("[Rex] No open chat found. Skipping end/archive.");
            }

            console.log("[Rex] proceed to call? endStatus =", endStatus);

            chatModalEl.classList.remove("show");
            modal.style.display = "block";
            setWidgetLocked(true);
            document.getElementById("agentButton")?.classList.add("noFloat");

            await startVoiceCall();
            overlay.remove();
          } catch (e) {
            console.error("Start-call (inline confirm) failed:", e);
            callText.innerHTML = `<p style="color: red;">Unable to connect</p>`;
            okBtn.innerHTML = oldOkHtml;
            okBtn.removeAttribute("aria-busy");
            okBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;
            delete okBtn.dataset.busy;
          }
        };
      }
      const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      function refreshCallIconVisibility() {
        const $callIcon = chatModalEl?.querySelector("#rexCallIconBtn");
        if (!$callIcon) return;

        const callMinsLeft = toNum(localStorage.getItem("call_mins_left"));
        if (callMinsLeft <= 0) {
          $callIcon.remove();
        } else {
          // visible + clickable
          $callIcon.style.display = "";
          $callIcon.removeAttribute("aria-hidden");
        }
      }

      const $callIcon = chatModalEl.querySelector("#rexCallIconBtn");
      refreshCallIconVisibility();
      if ($callIcon) {
        $callIcon.onclick = (e) => {
          e.preventDefault();
          openCallConfirmInsideChat();
        };
      }

      const $endBtn = chatModalEl.querySelector(".attio-end");
      const $closeBtn = chatModalEl.querySelector(".attio-close");

      if ($closeBtn) {
        $closeBtn.onclick = () => {
          chatModalEl.classList.remove("show");
          clearOnlyUserAutoEndTimer();
          try {
            clearInactivityTimers();
            startCloseTimer();
          } catch {}
        };
      }

      if ($endBtn) {
        $endBtn.onclick = () => {
          endConfirm.open({
            onOk: async () => {
              try {
                clearInactivityTimers();
                const chatId = localStorage.getItem("chat_id");
                const knowledgeBaseId =
                  localStorage.getItem("knowledge_base_id");

                if (chatId && knowledgeBaseId) {
                  const res = await fetch(`${API_URL}/agent/end-chat-archive`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      knowledge_base_id: knowledgeBaseId,
                      chat_id: chatId,
                    }),
                  });
                  if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(
                      `end-chat-archive HTTP ${res.status}: ${txt}`
                    );
                  }
                }
                localStorage.removeItem("rex_last_ui");
                localStorage.removeItem(CHAT_LS_KEY);
                localStorage.removeItem("chat_id");
                const $msgs = chatModalEl.querySelector("#rexMessages");
                if ($msgs) $msgs.innerHTML = "";
                chatModalEl.classList.remove("show");
                // window.location.reload();
              } catch (e) {
                console.error("end-chat failed:", e);
              }
            },
            onCancel: () => {},
          });
        };
      }
      chatModalEl.querySelector(".attio-close").onclick = () => {
        chatModalEl.classList.remove("expanded");
        chatModalEl.classList.remove("show");
        try {
          clearInactivityTimers();
          startCloseTimer();
        } catch {}
      };

      const $msgs = chatModalEl.querySelector("#rexMessages");
      const $input = chatModalEl.querySelector("#rexInput");
      const $send = chatModalEl.querySelector("#rexSend");

      const ESC = (s) =>
        s.replace(
          /[&<>"']/g,
          (m) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[m])
        );
      function appendMessage(role, text, ts) {
        const when = ts || Date.now();
        const timeStr = new Date(when).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const div = document.createElement("div");
        div.className = `msg ${role}`;

        div.innerHTML = `${ESC(text)}<span class="time">${timeStr}</span>`;
        $msgs.appendChild(div);
        $msgs.scrollTop = $msgs.scrollHeight;
      }

      function showTyping() {
        if (typingEl) return;
        typingEl = document.createElement("div");
        typingEl.className = "msg bot typing";
        typingEl.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
        $msgs.appendChild(typingEl);
        $msgs.scrollTop = $msgs.scrollHeight;
      }

      function hideTyping() {
        if (!typingEl) return;
        typingEl.remove();
        typingEl = null;
      }
      const FIRST_WAIT = 2 * 60 * 1000;
      const SECOND_WAIT = 3 * 60 * 1000;
      const THIRD_WAIT = 4 * 60 * 1000;

      let t1 = null,
        t2 = null,
        t3 = null;
      let inactivityLocked = false;

      function clearInactivityTimers() {
        if (t1) {
          clearTimeout(t1);
          t1 = null;
        }
        if (t2) {
          clearTimeout(t2);
          t2 = null;
        }
        if (t3) {
          clearTimeout(t3);
          t3 = null;
        }
      }

      function scheduleInactivityTimers() {
        clearInactivityTimers();

        t1 = setTimeout(() => {
          appendMessage(
            "bot",
            "👋 Are you still there? I’m here if you need anything."
          );
          saveChatMessage(
            "bot",
            "👋 Are you still there? I’m here if you need anything."
          );
          pingBeep();
        }, FIRST_WAIT);

        t2 = setTimeout(() => {
          appendMessage(
            "bot",
            "👋 Are you still there? I’m here if you need anything."
          );
          saveChatMessage(
            "bot",
            "👋 Are you still there? I’m here if you need anything."
          );
          pingBeep();
        }, FIRST_WAIT + SECOND_WAIT);

        t3 = setTimeout(async () => {
          if (inactivityLocked) return;
          inactivityLocked = true;

          try {
            const chatId = localStorage.getItem("chat_id");
            const knowledgeBaseId = localStorage.getItem("knowledge_base_id");

            // local history safely parse karo
            let hist = [];
            try {
              const raw =
                localStorage.getItem(
                  typeof CHAT_LS_KEY === "string"
                    ? CHAT_LS_KEY
                    : "rex_chat_history"
                ) || "[]";
              hist = JSON.parse(raw);
              if (!Array.isArray(hist)) hist = [];
            } catch {
              hist = [];
            }

            const hasUserMsg = hist.some(
              (m) => String(m?.role).toLowerCase() === "user"
            );

            if (chatId) {
              // == EXACT LOGIC ==
              // if (!hasUserMsg || !knowledgeBaseId)  -> PATCH end-chat
              // else                                   -> POST end-chat-archive
              if (!hasUserMsg || !knowledgeBaseId) {
                const url = `${API_URL}/Chatbot/end-chat/${encodeURIComponent(
                  chatId
                )}`;
                const res = await fetch(url, { method: "PATCH" });
                if (!res.ok) {
                  const txt = await res.text().catch(() => "");
                  throw new Error(`end-chat HTTP ${res.status}: ${txt}`);
                }
              } else {
                const res = await fetch(`${API_URL}/agent/end-chat-archive`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    knowledge_base_id: knowledgeBaseId,
                    chat_id: chatId,
                  }),
                });
                if (!res.ok) {
                  const txt = await res.text().catch(() => "");
                  throw new Error(
                    `end-chat-archive HTTP ${res.status}: ${txt}`
                  );
                }
              }
            }
          } catch (e) {
            console.error("end-chat (inactivity) failed:", e);
          } finally {
            // LS cleanup
            try {
              localStorage.removeItem("rex_last_ui");
            } catch {}
            try {
              localStorage.removeItem(CHAT_LS_KEY);
            } catch {}
            try {
              localStorage.removeItem("chat_id");
            } catch {}
            try {
              localStorage.removeItem("rex_intro_inline");
            } catch {}

            // UI close
            try {
              if (chatModalEl) {
                chatModalEl.classList.remove("show");
              }
            } catch {}

            clearInactivityTimers();

            // ---- SOFT RELOAD WIDGET (NO PAGE REFRESH) ----
            try {
              // 1) remove any existing popups to avoid duplicate IDs
              ["agentPopup", "rexChatPopup", "rexSupportPopup"].forEach(
                (id) => {
                  document.getElementById(id)?.remove();
                }
              );

              // 2) drop the init flag so we can re-init cleanly
              window.__REX_WIDGET_INITIALIZED__ = false;

              // 3) ensure host exists
              if (!document.getElementById("review-widget")) {
                const host = document.createElement("div");
                host.id = "review-widget";
                document.body.appendChild(host);
              }

              // 4) re-init on next frame
              const reinit = () => {
                try {
                  createReviewWidget();
                } catch (e) {
                  console.warn("reinit failed", e);
                }
              };
              if (typeof requestAnimationFrame === "function") {
                requestAnimationFrame(() => requestAnimationFrame(reinit));
              } else {
                setTimeout(reinit, 0);
              }
            } catch (e) {
              console.warn("[Rex] widget soft reload failed:", e);
            }
            // NOTE: NO window.location.reload()
          }
        }, FIRST_WAIT + SECOND_WAIT + THIRD_WAIT);
      }

      function resetInactivityTimers() {
        inactivityLocked = false;
        scheduleInactivityTimers();
      }

      async function sendMessage() {
        const t = ($input.value || "").trim();
        if (!t) return;

        const hist = loadChatHistory();
        const introAlreadyTagged =
          localStorage.getItem("rex_intro_inline") === "1";
        let payload = t;
        if (hist.length === 0 && hasCompleteProfile() && !introAlreadyTagged) {
          const intro =
            `My name is ${localStorage.getItem("rex_user_name") || ""}. ` +
            `My email is ${localStorage.getItem("rex_user_email") || ""} ` +
            `and my phone number is ${
              localStorage.getItem("rex_user_phone") || ""
            }.`;
          payload = `${intro}\n${t}`.trim();
          localStorage.setItem("rex_intro_inline", "1");
        }

        resetInactivityTimers();
        clearCloseTimer();
        clearOnlyUserAutoEndTimer();
        const tsNow = Date.now();
        appendMessage("user", t, tsNow);
        saveChatMessage("user", t);
        scheduleOnlyUserAutoEnd();
        $input.value = "";
        $input.disabled = true;
        $send.disabled = true;

        showTyping();

        try {
          const { botText } = await createChatCompletion(payload);
          const reply = botText || "…";

          hideTyping();

          const bubble = createBotBubble();
          await streamBotTextInto(bubble, reply, { chunkSize: 3, delay: 18 });
          saveChatMessage("bot", reply);
          clearOnlyUserAutoEndTimer();
          try {
            if (isGoodbye(reply)) {
              setTimeout(async () => {
                await endChatArchiveNow({ silent: true });
              }, 2000);
              return;
            }
          } catch (e) {
            console.warn("[Rex] goodbye check failed:", e);
          }
          resetInactivityTimers();
        } catch (e) {
          console.error(e);

          hideTyping();

          const errMsg = "Sorry, couldn't send your message. Please try again.";
          appendMessage("bot", errMsg, Date.now());
          // saveChatMessage("bot", errMsg);
        } finally {
          $input.disabled = false;
          $send.disabled = false;
          $input.focus();
        }
      }

      $send.onclick = sendMessage;
      $input.addEventListener("keydown", (e) => {
        scheduleOnlyUserAutoEnd();
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      function renderHistory() {
        const hist = loadChatHistory();
        hist.forEach((m) => appendMessage(m.role, m.text, m.ts || Date.now()));
      }
      renderHistory();
      scheduleOnlyUserAutoEnd();
      scheduleInactivityTimers();
      (async () => {
        try {
          await maybeSendIntroOnOpen();
        } catch {}
      })();
      return chatModalEl;
    }

    setDefaultUIAfterProfile();
  };

  injectCSS();

  (async () => {
    await initWidget();
  })();
}