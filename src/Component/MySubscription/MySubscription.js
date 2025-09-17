import React, { useEffect, useState } from 'react'
import styles from '../MySubscription/MySubscription.module.css'
import { API_BASE_URL } from '../../Store/apiStore'
import axios from 'axios'

const MySubscription = ({ agents }) => {

    const [agentPaygDetails, setagentPaygDetails] = useState()
    // console.log("agentPaygDetails", agentPaygDetails)
    useEffect(() => {
        const getPaygDetails = async (agentId) => {
            try {
                const res = await axios.post(`${API_BASE_URL}/agent-payg-details`, { agent_id: agentId });
                // console.log("PayG details:", res.data);
                setagentPaygDetails(res.data?.data)
                return res.data;
            } catch (error) {
                console.error("Error checking assign number:", error);
                return false;
            }
        };

        // Example: if you already have agents state/prop
        if (agents && agents.length > 0) {
            agents.forEach((agent) => {
                const isPaygPlan = agent?.agentPlan === "Pay-As-You-Go";
                if (isPaygPlan) {
                    getPaygDetails(agent.agent_id);  // ✅ send only if Pay-As-You-Go
                }
            });
        }
    }, [agents]);



    if (!agents || agents.length === 0) {
        return (
            <div className={styles.cardWrapper}>
                <h3 className={styles.heading}>My Subscriptions</h3>
                <p className={styles.noData}>No subscriptions found.</p>
            </div>
        );
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

    const currencyMap = {
        USD: "$",
        INR: "₹",
        EUR: "€",
        GBP: "£",
        AUD: "A$",
        CAD: "C$",
    };

    function formatCurrency(amount, currency) {
        const currencyMap = {
            USD: "$",
            INR: "₹",
            EUR: "€",
            GBP: "£",
            AUD: "A$",
            CAD: "C$",
        };

        const symbol = currencyMap[currency?.toUpperCase()] || "";
        const formattedAmount = Number(amount).toLocaleString();

        return `${currency?.toUpperCase() || "USD"} ${symbol}${formattedAmount}`;
    }

    function parseMetadata(metadata) {
        try {
            return typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        } catch (e) {
            console.error("Failed to parse metadata:", e);
            return {};
        }
    }

    // helper (place near your other utils)
    function addDays(date, days) {
        const d = new Date(date);
        if (isNaN(d)) return null;
        d.setDate(d.getDate() + Number(days || 0));
        return d;
    }


    // console.log("agents", agents)





    return (

        <div className={styles.cardWrapper}>
            <h3 className={styles.heading}>My Subscriptions</h3>
            {agents?.map((agent) => {
                const sub = agent?.latestSubscription;
                const meta = parseMetadata(sub?.metadata);
                const deferDays = Number(meta?.defer_days) || 0;



                // ✅ Deferred plan condition
                const isDeferredPlan =
                    sub?.status?.toLowerCase() === 'active' && sub?.subscription_id === 'byAdmin' && agent?.agentPlan !== "Pay-As-You-Go" &&agent?.agentPlan !== "free";

                const isPaygPlan = agent?.agentPlan === "Pay-As-You-Go"
                // && agent?.latestSubscription?.status ==="inactive"
                const isFreePlan = agent?.agentPlan === "free"


                const deferredStartDate = sub?.current_period_start ? new Date(sub.current_period_start) : null;


                const deferredEndDate = deferredStartDate ? addDays(deferredStartDate, deferDays) : null;

                return (
                    <div className={styles.MySubscriptionInfo}>
                        <div className={styles.row}>
                            <div className={styles.idDiv}>
                                <p className={styles.label1}>Agent Code:</p>
                                <p className={styles.valueBold}>{agent.agentCode ? agent.agentCode : "Na"}</p>
                            </div>
                            {/* <div className={styles.statusDiv}>
                        <div className={styles.Dot}></div>
                        <div className={styles.status}>{agent.isDeactivated === 0 ? "Active" : "Deactivated"}</div>
                    </div> */}
                            <div className={styles.statusDiv}>
                                <div
                                    className={`${styles.Dot} ${agent.isDeactivated === 0 ? styles.activeDot : styles.deactivatedDot
                                        }`}
                                ></div>
                                <div
                                    className={`${styles.status} ${agent.isDeactivated === 0 ? styles.activeStatus : styles.deactivatedStatus
                                        }`}
                                >
                                    {agent.isDeactivated === 0 ? "Active" : "Inactive"}
                                </div>
                            </div>

                        </div>

                        <div className={styles.row2}>
                            <span className={styles.label}>Agent Name</span>
                            <span className={styles.value}>{agent?.agentName ? agent.agentName : "NA"}</span>
                        </div>
                        <div className={styles.row2}>
                            <span className={styles.label}>Business Name</span>
                            <span className={styles.value}>{agent?.business?.businessName ? agent?.business?.businessName : "NA"}</span>
                        </div>
                        <div className={styles.row2}>
                            <span className={styles.label}>Plan Activated</span>
                            <span className={styles.plan}>
                                {isFreePlan
                                    ? "Free"
                                    : isPaygPlan
                                        ? "Pay-As-You-Go"
                                        : isDeferredPlan
                                            ? "Deferred"
                                            : agent?.latestSubscription?.plan_name || "Free"}
                            </span>
                        </div>
                        <div className={styles.row2}>
                            <span className={styles.label}>
                                {isPaygPlan ? "Minutes Used" : "Minutes Remaining"}
                            </span>
                            <span className={styles.value}>
                                {isPaygPlan
                                    ? agentPaygDetails?.total_mins ?? "NA"
                                    : agent?.mins_left
                                        ? Math.floor(agent.mins_left / 60)
                                        : "NA"}
                            </span>
                        </div>

                        {isDeferredPlan ? (
                            <>
                                <div className={styles.row2}>
                                    <span className={styles.label}>Deferred Start Date</span>
                                    <span className={styles.value}>
                                        {agent?.latestSubscription?.current_period_start
                                            ? formatDate(agent.latestSubscription.current_period_start)
                                            : "NA"}
                                    </span>
                                </div>

                                <div className={styles.row2}>
                                    <span className={styles.label}>Deferred End Date</span>
                                    <span className={styles.value}>
                                        {deferredEndDate ? formatDate(deferredEndDate) : "NA"}
                                    </span>
                                </div>
                            </>
                        ) : isPaygPlan ? (<>
                            <div className={styles.row2}>
                                <span className={styles.label}>Initial Purchase Date</span>
                                <span className={styles.value}>{agentPaygDetails?.period_start ? formatDate(agentPaygDetails?.period_start) : "Na"}</span>
                            </div>
                            <div className={styles.row2}>
                                <span className={styles.label}>Next Billing Date</span>
                                <span className={styles.valuebilling}>{agentPaygDetails?.period_end ? formatDate(agentPaygDetails?.period_end) : "Na"}</span>
                            </div>
                        </>
                        ) : isFreePlan ? (<></>) :
                            (
                                <>
                                    <div className={styles.row2}>
                                        <span className={styles.label}>Initial Purchase Date</span>
                                        <span className={styles.value}>{agent?.latestSubscription?.current_period_start ? formatDate(agent?.latestSubscription?.current_period_start) : "Na"}</span>
                                    </div>
                                    <div className={styles.row2}>
                                        <span className={styles.label}>Next Billing Date</span>
                                        <span className={styles.valuebilling}>{agent?.latestSubscription?.next_renewal_date ? formatDate(agent?.latestSubscription?.next_renewal_date) : "Na"}</span>
                                    </div>

                                    <div className={styles.row2}>
                                        <span className={styles.label}>Frequency & Price</span>

                                        {agent?.latestSubscription && (
                                            <span className={styles.frequencyprice}>
                                                {formatCurrency(
                                                    parseMetadata(agent.latestSubscription.metadata)?.original_plan_amount,
                                                    agent.latestSubscription.plan_currency
                                                )}{" "}
                                                / {agent.latestSubscription.interval}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.row2}>
                                        <span className={styles.label}>Billed Date & Price:</span>

                                        {agent?.latestSubscription && (
                                            <span className={styles.frequencyprice}>
                                                {formatCurrency(
                                                    agent.latestSubscription.plan_unit_amount,
                                                    agent.latestSubscription.plan_currency
                                                )}{" "}
                                                on {formatDate(agent.latestSubscription.current_period_start)}
                                            </span>
                                        )}
                                    </div>

                                </>
                            )}



                        {/* ✅ New row for Deferred Plan */}
                        {isDeferredPlan && (
                            <div className={styles.deferredNote}>
                                <span>
                                    📅 Plan is <strong>deferred</strong>
                                    {typeof meta?.defer_days === "number" && meta.defer_days > 0
                                        ? ` and ends in ${meta.defer_days} days`
                                        : ""}
                                    .
                                </span>
                            </div>
                        )}
                        {isPaygPlan && (
                            <div className={styles.deferredNote}>
                                <span>📅 Your plan is <strong>Pay-As-You-Go</strong>.</span>
                            </div>
                        )}


                    </div>
                )
            })}

        </div>

    )
}

export default MySubscription
