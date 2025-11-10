import axios from "axios";
// Centralized API base URL here
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:2512/api";
console.log(API_BASE_URL);
export const token = localStorage.getItem("token") || "";
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
const userId = sessionStorage.getItem("userId");

// ========== Auth APIs ==========

// Get all knowledge bases
export const LoginWithEmailOTP = async (email,environmentInfo) => {
  const res = await api.post("/auth/LoginWithEmailOTP", { email,environmentInfo });
  return res;
};

export const verifyEmailOTP = async (email, otp, customer_id) => {
  const customerRes = await fetch(`${API_BASE_URL}/customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const customerData = await customerRes.json();
  let customerId = customerData.customerId;
  const res = await api.post("/auth/verifyEmailOTP", {
    email,
    otp,
    customerId,
  });
  return res;
};

export const verifyOrCreateUser = async (email, otp) => {

  const res1 = await api.post("/auth/LoginWithEmailOTP", {
    email,
    fullOtp: otp,
  });


  const customerRes = await fetch(`${API_BASE_URL}/customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const customerData = await customerRes.json();
  let customerId = customerData.customerId;
  const res = await api.post("/auth/verifyEmailOTP", {
    email,
    otp,
    customerId,
  });
  return { res1, res };
};

export const getRetellVoices = async () => {
  const res = await axios.get("https://api.retellai.com/list-voices", {
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
    },
  });
  return res;
};

export const createAgent = async (data) => {
  const res = await api.post("/agent/createAgent", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};

export const fetchDashboardDetails = async (userId, token) => {
  let t = token
  const res = await api.get(`${API_BASE_URL}/agent/getUserAgentsDetails/${userId}`, {

    headers: {
      Authorization: `Bearer ${t}`,
    },
  });
  return res.data;
};

export const fetchAgentDetailById = async (data) => {
  const res = await api.post("/agent/fetchAgentDetailsById", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const getAgentById = async (id) => {
  const res = await api.get(`/agent/getAgentById/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const EndWebCallUpdateAgentMinutesLeft = async (data) => {
  const res = await api.patch(`/agent/updateAgentMinutesLeft`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};
export const SendScriptToDeveloper = async (data) => {
  const res = await api.post(`/agent/sendScriptToEmail`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};
export const listAgents = async () => {
  const res = await api.get(`${API_BASE_URL}/agent/listAgents`, {});
  return res.data;
};

export const countAgentsbyUserId = async (userId) => {
  try {
    const res = await api.get(
      `${API_BASE_URL}/agent/listAgents?userId=${userId}`
    );
    return res.data.length || 0;
  } catch (error) {
    console.error("Error fetching agent count:", error);
    return 0;
  }
};

export const updateProfilePicture = async (userId, data) => {
  const res = await api.patch(
    `${API_BASE_URL}/endusers/user/update_profile_picture/${userId}`,
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};
export const updateAgent = async (agentId, updateData) => {
  const res = await api.put(`/agent/updateAgent/${agentId}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
export const updateAgentWidgetDomain = async (id, url) => {
  const data = { url: url };
  const res = await axios.put(
    `${API_BASE_URL}/agent/updateAgentWidgetDomain/${id}`,
    data
  );
  return res.data;
};
export const deleteDomain = async (agentId, domain) => {
  try {
    const res = await fetch(`${API_BASE_URL}/agent/${agentId}/deleteDomain`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Updated domain list:", data.agentWidgetDomain);
    } else {
      console.error("Delete failed:", data.error);
    }
  } catch (err) {
    console.error("Error deleting domain:", err);
  }
};

export const validateWebsite = async (websiteUrl) => {
  try {
    const res = await api.post("/validate-website", { website: websiteUrl });
    return res.data;
  } catch (error) {
    console.error("Error validating website:", error);
    return { valid: false, reason: "Error validating website" };
  }
};
export const deleteAgent = async (agentId) => {
  try {
    const res = await api.delete(`/agent/deleteAgent/${agentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
      },
    });
    await axios.delete(`https://api.retellai.com/delete-agent/${agentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error deleting agent:",
      error.response?.data || error.message
    );
    throw new Error("Failed to delete agent from one or both systems.");
  }
};

export const validateEmail = async (email) => {
  try {
    const res = await api.get(`/validate-email?email=${email}`);
    return res.data;
  } catch (error) {
    console.error("Error validating email:", error);
    return { valid: false, reason: "Error validating email" };
  }
};

export const getUserAgentMergedDataForAgentUpdate = async (
  agentId,
  businessId
) => {
  try {
    const res = await api.get(
      `/agent/getUserAgentMergedDataForAgentUpdate/${agentId}?businessId=${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error validating email:", error);
    return { valid: false, reason: "Error validating email" };
  }
};

export const getAllAgentCalls = async (userId) => {
  try {
    // const res = await api.get(`/agent/user/${userId}/agent/calls`, {
    const res = await api.get(
      `callHistory/agent-call-history/last3months/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching agent calls:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch agent calls");
  }
};

export const getAgentCallById = async (agentId, callId, start_timestamp) => {
  try {
    // const res = await api.get(`/agent/user/${userId}/agent/calls`, {
    const res = await api.get(
      `callHistory/getSpecificCallData/call/${agentId}/${callId}?start_timestamp=${start_timestamp}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching agent calls:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch agent calls");
  }
};

export const getAgentCalls = async (agentId) => {
  try {
    // const res = await api.get(`/agent/user/${userId}/agent/calls`, {
    const res = await api.get(
      `/callHistory/agentCalLHistory/${agentId}/last3months`,
      {
        headers: {
          Authorization: `Bearer $${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching agent calls:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch agent calls");
  }
};
export async function getUserCallsByMonth(userId, month, year) {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/callHistory/user/${userId}/calls-by-month`,
      {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching agent calls:",
      error.response?.data || error.message
    );
    // throw new Error("Failed to fetch agent calls");
    return error?.response?.data;
  }
}

// Specific agent ka month-wise
export async function getAgentCallsByMonth(agentId, month, year) {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/callHistory/agent/${agentId}/calls-by-month`,
      {
        params: { month, year },
        headers: {
          Authorization: `Bearer $${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching agent calls:",
      error.response?.data || error.message
    );
    return error?.response?.data;
    // throw new Error("Failed to fetch agent calls");
  }
}

export const fetchUserDetails = async (id) => {
  const userId = id;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/endusers/users/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const toggleAgentActivation = async (agentId, deactivate = true) => {
  try {
    const res = await api.patch(`/agent/toggle-activation/${agentId}`, {
      deactivate,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error toggling agent activation:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update agent activation status");
  }
};

export const getUserDetails = async (userId, token) => {
  let t = token;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/endusers/users/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
      }
    );
    // console.log(response, "response")
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
};

export const updateUserDetails = async (userId, updateData) => {
  try {
    const response = await api.put(`/endusers/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw new Error("Failed to update user details");
  }
};
export const getUserAgentLimitStatus = async (userId) => {
  try {
    const res = await api.get(
      `/endusers/user-agent-limit-status?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error toggling agent activation:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update agent activation status");
  }
};

export const updateLlm = async (llmId, payload) => {
  try {
    const response = await axios.patch(
      `https://api.retellai.com/update-retell-llm/${llmId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
        },
      }
    );
  } catch (error) {
    console.error(
      " Error updating LLM:",
      error.response?.data || error.message
    );
    alert(
      `Failed to update LLM: ${JSON.stringify(
        error.response?.data || error.message
      )}`
    );
  }
};
export const fetchLlmDetails = async (llm_id) => {
  const data = { llmId: llm_id };

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/agent/getLlmDetails`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};
export const addGeneralTools = async (llmId, transfers) => {
  console.log(transfers);
  try {
    const response = await axios.post(
      `${API_BASE_URL}/agent/addGeneralTools`,
      {
        llmId,
        transfers,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {}
};
export const getBusinessDetailsByBusinessId = async (businessId) => {
  try {
    const res = await api.get(`/businessDetails/by-business-id/${businessId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching business details by business ID:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch business details");
  }
};

export const updateAgentKnowledgeBaseId = async (agentId, knowledgeBaseId) => {
  try {
    const res = await api.patch(`/agent/${agentId}/knowledge-base`, {
      knowledgeBaseId,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating agent knowledge base ID:", error);
    throw new Error("Failed to update knowledge base ID for agent");
  }
};

export const updateEmailSendOtp = async (email, userId) => {
  const res = await api.post("/endusers/updateEmailSendOtp", { email, userId });
  return res;
};

export const updateShowReferralFloatingStatus = async (userId, status) => {
  try {
    const response = await api.patch(
      `/endusers/updateShowReferralFloatingStatus?userId=${userId}`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw new Error("Failed to update user details");
  }
};

export const getUserReferralCodeForDashboard = async (userId) => {
  try {
    const response = await api.get(
      `/endusers/getUserReferralCodeForDashboard?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw new Error("Failed to update user details");
  }
};

export const updateAgentEventId = async (agentId, eventId) => {
  try {
    const res = await api.patch(
      `agent/${agentId}/event-id`,
      {
        eventId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error updating agent eventId:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update eventId for agent");
  }
};

export const refundAndCancelSubscriptionAgnetApi = async (
  agentId,
  minutesLeft
) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/refund`,
      {
        agentId,
        minutesLeft,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error refunding user",
      error.response?.data || error.message
    );
    throw new Error("Failed to refund user for agent");
  }
};
export const getEndUserSubscriptions_Billings = async (userId) => {
  try {
    const response = await api.get(
      `/endusers/fetchEndUserSubscriptions_Billings/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw new Error("Failed to update user details");
  }
};
export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`/agent/delete-user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error deleting user:",
      error.response?.data || error.message
    );
    throw new Error("Failed to delete user");
  }
};
export const saveAgentSchedule = async (scheduleData) => {
  try {
    const res = await api.post("/agent/schedule-agent", scheduleData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error saving agent schedule:",
      error.response?.data || error.message
    );
    throw new Error("Failed to save agent schedule");
  }
};
export const getAgentScheduleByUserId = async (userId) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/agent/agent-schedule/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching agent schedule:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch agent schedule");
  }
};
export const fetchAvailablePhoneNumberByCountry = async (
  token,
  country_code,
  locality,
  administrative_area,
  startsWith,
  endsWith
) => {
  let t = token;
  try {
    const res = await axios.get(`${API_BASE_URL}/telnyx/available-numbers`, {
      params: {
        country_code,
        locality,
        administrative_area,
        starts_with: startsWith,
        ends_with: endsWith,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
    });

    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};
export const createNumberOrder = async (phoneNumbers, agent_id) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/telnyx/create-number-order`,
      { phoneNumbers: phoneNumbers, agent_id: agent_id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
export const createEvent = async (apiKey, eventName, slug, eventLength) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/agent/createCalEvent`, {
      apiKey: apiKey,
      eventName: eventName,
      slug: slug,
      eventLength: eventLength,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const sendUserAgentCallsByMonth = async (userId, month, year) => {
  try {
    const res = await api.get(
      `/callHistory/user/${userId}/calls-by-month/send-email`,
      {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error sending user agent calls by month:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send user agent calls by month");
  }
};

export const sendAgentCallsByMonth = async (agentId, month, year) => {
  try {
    const res = await api.get(
      `/callHistory/agent/${agentId}/calls-by-month/send-email`,
      {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error sending agent calls by month:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send agent calls by month");
  }
};
export const uploadAgentFiles = async (agentId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("additional_file", file);
  });

  try {
    const response = await api.post(
      `/agent/upload-agent-files/${agentId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw new Error("Error uploading files");
  }
};

export async function getUserNotifications(userId) {
  console.log(userId);
  try {
    const res = await axios.get(
      `${API_BASE_URL}/notifications/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      " Error fetching notifications:",
      error.response?.data || error.message
    );
    return (
      error?.response?.data || {
        success: false,
        message: "Failed to fetch notifications",
      }
    );
  }
}

export const markNotificationAsSeen = async (id, type) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/${id}/read`,
      { type },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const getAgentFiles = async (agentId) => {
  try {
    const response = await api.get(`/agent/get-agent-files/${agentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching agent files:", error);
    throw new Error("Error fetching agent files");
  }
};

export const deleteAgentFile = async (agentId, filename) => {
  try {
    const response = await api.delete(
      `/agent/delete-file/${agentId}/${filename}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting agent file:",
      error.response?.data || error.message
    );
    throw new Error("Error deleting agent file");
  }
};

export const listSiteMap = async (url) => {
  try {
    const response = await api.post(
      `/map/list-sitemap`,
      { url },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting agent file:",
      error.response?.data || error.message
    );
    throw new Error("Error deleting agent file");
  }
};

export const sendEmailToOwner = async (email, name, phone) => {
  try {
    const response = await api.post(
      `/endusers/sendEmailToOwner`,
      { email: email, name: name, phone: phone },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting agent file:",
      error.response?.data || error.message
    );
    throw new Error("Error deleting agent file");
  }
};
export const customPlanCheck = async (userId) => {
  try {
    let res = axios.get(`${API_BASE_URL}/tier/${userId}`);
    return res;
  } catch (error) {
    console.log(error, "Error");
    return error;
  }
};

export const getDashboardTourStatus = async (userId) => {
  try {
    const res = await api.get(`/agent/status/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching tour status:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch tour status");
  }
};

export const markDashboardTourSeen = async (userId) => {
  try {
    const res = await api.post(
      `/agent/seen/${userId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error marking tour as seen:",
      error.response?.data || error.message
    );
    throw new Error("Failed to mark tour as seen");
  }
};

export const createChatAgent = async (payload, token) => {
  try {
    const res = await api.post(`/agent/createChatAgent`, { payload }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error marking tour as seen:", error.response);
    
  }
}
export const updateAgentChatEnabled = async (agent_id, newState, token) => {
  try {
    const res = await api.post(`/agent/updateAgentChatEnabled`, {
      agent_id: agent_id,
      newState: newState
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error marking tour as seen:", error.response);


  }
}
export const updateChatAgent = async (payload, token) => {
  try {
    const res = await api.put(`/agent/updateChatAgent`, { payload }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error marking tour as seen:", error.response);
      }
}


export const getAppointments = async (userId = null, agentId = null) => {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (agentId) params.agentId = agentId;

    const res = await api.get('/appointments', { params });
    return res.data; 
  } catch (error) {
    console.error("Error fetching appointments:", error.response?.data || error.message);
    return { success: false, data: [] };
  }
};

export default api;
