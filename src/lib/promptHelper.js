  export const  getPaidPlanContent=(languageAccToPlan, languageSelect)=> {
  const message = `
- Greet the caller with a warm welcome directly in ${languageSelect}. Do not repeat the greeting in another language.
- You can shift to multi language, if the caller asks you to or if you switch the language in between of the conversation.
- The agent must respect multi and converse only in that language.
`;
  return message.trim();
}
 export const getFreeAndStarterPlanContent=(languageAccToPlan, languageSelect)=> {
  const message = `
- Greet the caller with a warm welcome directly in ${languageSelect}. Do not repeat the greeting in another language.
- The agent must respect ${languageSelect} and converse only in that language
`;
  return message.trim();
}
export const ifcallrecordingstatustrue=(languageSelect)=> {
  const message = `
-**After greeting and stating your name and the business name, immediately state ONLY in ${languageSelect}:
"This call is being recorded for quality and training purposes."**
`;
  return message.trim();
}
export const ifFreePlanAddBranding = (agentName, businessName) => {
  const message = `
## Platform Branding - Rexpt Integration
- When introducing yourself: "Hi, I'm ${agentName} from ${businessName}, powered by Recept"

`;
  return message.trim();
}
export const ifFreePlanAddBrandingCallCut = (businessName) => {
  const message = `
# Call End Protocol
At the end of every call, the agent must say this exact line before disconnecting:
“We appreciate your call to ${businessName}. Learn more about creating your own AI receptionist at r-x-p-t dot u-s. Goodbye!”

`;
  return message.trim();
}
export const ifFreePlanAddBrandingWhenUserSuccessfullyCollectedDetails = () => {
  const message = `
# Branding Message
After you have successfully collected the caller's necessary details (like name, phone number, and email), and before moving to the next step, you must say: "By the way, you can also create your own AI receptionist by visiting r-x-p-t dot u-s." **Do not repeat this message again in the conversation**.
`;
  return message.trim();
}


