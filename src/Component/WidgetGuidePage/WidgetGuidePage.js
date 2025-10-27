import React, { useState } from 'react';
import styles from './WidgetGuidePage.module.css';

const agentSettingsImage = '/images/integrate.png';
const urlEntryImage = '/images/generate-code.png';
const scriptCopyImage = '/images/copy-script.png';

const WidgetGuidePage = () => {
  const [copied, setCopied] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false); 
  const scriptText = `<script id="rex-widget-script" src="https://dazzling-raindrop-43edfa.netlify.app/index.js?agentId=agent_34370040056db21e757552XXXX"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoom = (imageSrc) => setZoomedImage(imageSrc);
  const closeZoom = () => setZoomedImage(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div className={styles.pageWrapper}>

      {/* Steps Section */}
      <div className={styles.stepsContainer}>
        <div className={styles.step}>
        <header className={styles.header}>
        {/* <h1 className={styles.title}>How to Install the AI Receptionist Widget</h1> */}
        <p className={styles.subtitle}>
          Follow these steps to seamlessly integrate our AI Receptionist Widget into your website.
        </p>
      </header>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>1</span>
            <h3 className={styles.stepTitle}>Generate and Copy the Widget Script</h3>
          </div>

          <div className={styles.subStep}>
            <div className={styles.subStepHeader}>
              <img
                src={agentSettingsImage}
                alt="Agent settings with Integrate option"
                className={styles.subStepImage}
                onClick={() => handleZoom(agentSettingsImage)}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleZoom(agentSettingsImage)}
                aria-label="Zoom in on agent settings screenshot"
              />
              <h4 className={styles.subStepTitle}>1.1 Select the Integrate Option</h4>
            </div>
            <p>
              In your agent dashboard, locate the agent you want to integrate (e.g., VIK or WICK). Click the three-dot menu and select <strong>Integrate</strong>.
            </p>
          </div>

          <div className={styles.subStep}>
            <div className={styles.subStepHeader}>
              <img
                src={urlEntryImage}
                alt="Enter website URL and generate code"
                className={styles.subStepImage}
                onClick={() => handleZoom(urlEntryImage)}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleZoom(urlEntryImage)}
                aria-label="Zoom in on URL entry screenshot"
              />
              <h4 className={styles.subStepTitle}>1.2 Enter Website URL and Generate Code</h4>
            </div>
            <p>
              Add your website URLs/Domains (e.g., https://www.designersx.us) in the field—you can include multiple ones for the AI Receptionist Widget. Then, click <strong>Generate Code</strong> to create the script.
            </p>
          </div>

          <div className={styles.subStep}>
            <div className={styles.subStepHeader}>
              <img
                src={scriptCopyImage}
                alt="Copy widget script"
                className={styles.subStepImage}
                onClick={() => handleZoom(scriptCopyImage)}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleZoom(scriptCopyImage)}
                aria-label="Zoom in on script copy screenshot"
              />
              <h4 className={styles.subStepTitle}>1.3 Copy the Script</h4>
            </div>
            <p>
              Once the script is generated, click the <strong>Copy</strong> button to copy the script tag to your clipboard or send the script to your developer via email.
                
            </p>
          </div>
        </div>

        <div className={styles.step}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>2</span>
            <h3 className={styles.stepTitle}>Add the Script to Your Website</h3>
          </div>
          <p>
            Paste the copied script tag into the <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> section of your website’s HTML. We recommend placing it in the <code>&lt;head&gt;</code> for faster loading.
          </p>
<pre className={styles.codeExample}>
{`<html>
<head>
<title>Your Website</title>
`}
<span className={styles.boldScript} style={{fontWeight:'bold'}}>{scriptText}</span>
{`
</head>
<body>
<!-- Your content here -->
</body>
</html>`}
  </pre>
        </div>

        <div className={styles.step}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>3</span>
            <h3 className={styles.stepTitle}>Verify the Widget</h3>
          </div>
          <p>
            After adding the script, visit your website and look for the AI Receptionist Widget (typically a chat bubble in the bottom-right corner). Interact with it to confirm it’s functioning.
          </p>
          <p>
            <strong>Note:</strong> The widget will only work with registered domains. If it doesn’t appear, ensure the domain is added in your account settings or contact support.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqItem}>
          <button
            className={styles.faqQuestion}
            onClick={() => toggleFaq(0)}
            aria-expanded={openFaq === 0}
            aria-controls="faq-answer-0"
          >
            <span>Why isn’t the widget appearing on my website?</span>
            <span className={`${styles.faqIcon} ${openFaq === 0 ? styles.faqIconOpen : ''}`} />
          </button>
          <div
            id="faq-answer-0"
            className={`${styles.faqAnswer} ${openFaq === 0 ? styles.faqAnswerOpen : ''}`}
          >
            <p>
              Ensure the script tag is correctly added to your website’s HTML and that the domain is registered in your account. Try clearing your browser cache and refreshing the page.
            </p>
          </div>
        </div>

        <div className={styles.faqItem}>
          <button
            className={styles.faqQuestion}
            onClick={() => toggleFaq(1)}
            aria-expanded={openFaq === 1}
            aria-controls="faq-answer-1"
          >
            <span>Can I use the widget on multiple websites?</span>
            <span className={`${styles.faqIcon} ${openFaq === 1 ? styles.faqIconOpen : ''}`} />
          </button>
          <div
            id="faq-answer-1"
            className={`${styles.faqAnswer} ${openFaq === 1 ? styles.faqAnswerOpen : ''}`}
          >
            <p>
              Yes, you can use the widget on multiple websites. However, each domain must be added to your account. Navigate to the widget settings in your portal to manage domains.
            </p>
          </div>
        </div>

        <div className={styles.faqItem}>
          <button
            className={styles.faqQuestion}
            onClick={() => toggleFaq(2)}
            aria-expanded={openFaq === 2}
            aria-controls="faq-answer-2"
          >
            <span>How can I get support if I encounter issues?</span>
            <span className={`${styles.faqIcon} ${openFaq === 2 ? styles.faqIconOpen : ''}`} />
          </button>
          <div
            id="faq-answer-2"
            className={`${styles.faqAnswer} ${openFaq === 2 ? styles.faqAnswerOpen : ''}`}
          >
            <p>
              Our support team is here to help. Contact us via the portal, email us at{' '}
              <a href="mailto:rexport@rexpt.in" className={styles.supportLink}>
                rexport@rexpt.in
              </a>{' '}
              , or call us at <a href="tel:+17722717966" className={styles.supportLink}>+1 772-271-7966</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>
          &copy; {new Date().getFullYear()} Rexpt. All rights reserved. |{' '}
          <a href="mailto:rexport@rexpt.in" className={styles.footerLink}>
            Contact Support
          </a>
        </p>
      </footer>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className={styles.zoomModal} onClick={closeZoom} aria-label="Close zoomed image">
          <img src={zoomedImage} alt="Zoomed step image" className={styles.zoomedImage} />
          <button className={styles.closeButton} onClick={closeZoom} aria-label="Close">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default WidgetGuidePage;