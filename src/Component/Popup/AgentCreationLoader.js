import React from 'react';
import Lottie from 'lottie-react';
import agentAnimation from "./agent-creatio-loader.json"; // Replace with your Lottie JSON path

const AgentCreationLoader = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    width: '100%',
    textAlign: 'center',
    padding: '40px',
    marginTop:"5rem"
  };

  const textStyle = {
    fontSize: '18px',
    color: '#555',
    marginTop: '40px'
  };

  return (
    <div style={containerStyle}>
      <Lottie
        animationData={agentAnimation}
        loop
        autoplay
        style={{ height: 450, width: 450 }}
      />
      <p style={textStyle}>Creating your AI Agent...</p>
    </div>
  );
};

export default AgentCreationLoader;
