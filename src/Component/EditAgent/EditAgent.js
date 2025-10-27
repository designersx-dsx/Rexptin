import React, { useEffect, useState } from "react";
import styles from '../EditAgent/EditAgent.module.css'
import { getUserAgentMergedDataForAgentUpdate } from "../../Store/apiStore";
import { useNavigate } from "react-router-dom";

const options = [
    {
        id: "details",
        title: "Business Details",
        description: "Edit name, size, and type.",
        path: "/business-details"
    },
    {
        id: "services",
        title: "Business Services",
        description: "Edit Services List, Email Address.",
        path: "/business-services"
    },
    // {
    //     id: "location",
    //     title: "Business Location",
    //     description: "Edit Country, State and City.",
    //     path: "/business-locations"
    // },
    {
        id: "about",
        title: "About Your Business",
        description: "Edit URL, Google Listing.",
        path: "/about-business"
    },
    {
        id: "avatar",
        title: "Agent (Avatar)",
        description: "Edit Language, Gender, etc.",
        path: "/steps"
    },
];

const EditOptions = ({agentDetails}) => {
    const [selected, setSelected] = useState(localStorage.getItem('selectedStepEditMode')||"details");
    const businessDetails = JSON.parse(sessionStorage.getItem("businessDetails"));
    const navigate = useNavigate(); 
    const handleOptionClick = (option) => {
        setSelected(option.id);
        localStorage.setItem('selectedStepEditMode',option.id)
             if(option.id == "services" && businessDetails?.businessType=='Other'){
                navigate('/about-business-next'); 
            }else{
              navigate(option.path); 
            }
    };
  function formatName(name) {
    if (!name) return "";

    if (name.includes(" ")) {
      const firstName = name.split(" ")[0];
      if (firstName.length <= 7) {
        return firstName;
      } else {
        return firstName.substring(0, 10) + "...";
      }
    } else {
      if (name.length > 7) {
        return name.substring(0, 10) + "...";
      }
      return name;
    }
  }
const agentName=sessionStorage.getItem('agentName')
    return (
        <div className={styles.container}>
            <div className={styles.TitleBar}>
             <h3>Edit Agent:</h3><p>{formatName(agentName)}</p>
            </div>
            {options.map((option) => (
                <label
                    key={option.id}
                    className={`${styles.card} ${selected === option.id ? styles.active : ""
                        }`}
                    onClick={() => handleOptionClick(option)} // handle click on entire label

                >
                    <div className={styles.leftSection}>
                        <input
                            type="radio"
                            name="editOption"
                            value={option.id}
                            checked={selected === option.id}
                            // onChange={() => setSelected(option.id)}
                            onChange={() => handleOptionClick(option)}
                        />
                        <div className={styles.textContainer}>
                            <span className={styles.title}>{option.title}</span>
                            <span className={styles.description}>{option.description}</span>
                        </div>
                    </div>
                    <span className={styles.arrow}>›</span>
                </label>
            ))}
            <div >   
                   
            </div>
        </div>
    );
};

export default EditOptions;
