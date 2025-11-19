import React, { useState, useRef, useEffect } from 'react'
import EditHeader from '../EditHeader/EditHeader';
import AnimatedButton from '../AnimatedButton/AnimatedButton';
import styles from '../EditServicesOffered/EditServicesOffered.module.css'
import { useAgentCreator } from '../../hooks/useAgentCreator';
import { useNavigate } from 'react-router-dom';
import PopUp from '../Popup/Popup';
import { useDashboardStore } from '../../Store/agentZustandStore';
import { businessServices } from "../../lib/businessServices"

const EditServicesOffered = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [newService, setNewService] = useState('');
    const [isAddMoreChecked, setIsAddMoreChecked] = useState(false)
    const lastServiceRef = useRef(null);
    // Parse sessionStorage safely
    const fetchBusinessType = JSON.parse(sessionStorage.getItem("businessDetails") || "{}");
    const fetchServices = JSON.parse(sessionStorage.getItem("businesServices") || "{}");
    const services = fetchServices.selectedService
    const [selectedService, setSelectedServices] = useState(services || []);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState(null);
    const [popupMessage, setPopupMessage] = useState("");
    const [Loading, setLoading] = useState(null);
    const [customServices, setCustomServices] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEmptyListError, setEmptyListError] = useState('')
    const navigate = useNavigate();
    const agentnm = sessionStorage.getItem("agentName");
    const { setHasFetched } = useDashboardStore()
    const listRef = useRef(null);
    const { handleCreateAgent } = useAgentCreator({
        stepValidator: () => "EditServicesOffered",
        setLoading,
        setPopupMessage,
        setPopupType,
        setShowPopup,
        navigate,
        setHasFetched,
    });

    const [initialServices, setInitialServices] = useState([]);
    const [isChanged, setIsChanged] = useState(false);
    useEffect(() => {
        try {
            if (services) {
                setInitialServices(services || []);
            } else {
                setInitialServices([]); // no previous data
            }
        } catch (err) {
            console.error("Failed to parse businesServices:", err);
            setInitialServices([]);
        }
    }, [services]);

    useEffect(() => {
        if (!initialServices) return;

        // Sort both arrays for comparison (ignores order difference)
        const initial = [...initialServices].sort();
        const current = [...selectedService].sort();

        const sameLength = initial.length === current.length;
        const isSame = sameLength && initial.every((val, idx) => val === current[idx]);

        setIsChanged(!isSame);
    }, [selectedService, initialServices]);

    const businessType = fetchBusinessType.businessType || "";
    // Find business object by type
    const filteredBusinessType = businessServices?.find(
        (item) =>
            item?.type?.toLowerCase()?.includes(businessType?.toLowerCase())
    );
    const uniqueServices = Array.from(
        new Set([
            ...filteredBusinessType?.services?.filter((s) => s !== "Other") || [],
            ...services || [],
            ...customServices || [],
        ])
    );
    const handleAddService = () => {


        const trimmedService = newService.trim();

        if (!trimmedService) return;
        // Prevent duplicates (case insensitive)
        const isAlreadyPresent = selectedService.some(
            (service) => service.toLowerCase() === trimmedService.toLowerCase()
        );

        if (!isAlreadyPresent) {
            setSelectedServices([...selectedService, trimmedService]);
            setCustomServices(prev => [...prev, trimmedService]);
            setNewService('');
            setTimeout(() => {
                lastServiceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100); // small delay for DOM update
        }
    };


    const defaultServices = filteredBusinessType?.services?.filter((s) => s !== "Other") || [];

    const extraServices = selectedService?.filter(service => !defaultServices.includes(service))
    // const isAddMoreChecked = extraServices.length > 0;

    const icon = filteredBusinessType.icon
    const handleContinue = async () => {
        if (Loading) return; // Prevent double call
        if (selectedService?.length == 0) {
            setEmptyListError('Service List Can not be empty')
            return;
        } else {
            setEmptyListError('')
        }
        const raw = sessionStorage.getItem("businesServices");
        let previous = {};
        try {
            previous = raw ? JSON.parse(raw) : {};
        } catch (err) {
            console.error("Failed to parse businesServices:", err);
        }
        const updatedBusinessServices = {
            ...previous,
            selectedService,
        };
        sessionStorage.setItem("businesServices", JSON.stringify(updatedBusinessServices));
        const businessDetailsRaw = sessionStorage.getItem("businessDetails");
        const businessDetails = businessDetailsRaw
            ? JSON.parse(businessDetailsRaw)
            : {};

        const finalBusinessDetails = {
            ...businessDetails,
            selectedService,
        };

        sessionStorage.setItem("businessDetails", JSON.stringify(finalBusinessDetails));
        sessionStorage.setItem("selectedServices", JSON.stringify(selectedService));
        try {
            handleCreateAgent();

        } catch (error) {
            console.log('Agent Updation Hook failed', error)
        }

    }
    const scrollListIntoView = () => {
        if (listRef.current) {
            listRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    return (
        <>
            <EditHeader title='Edit Agent ' agentName={agentnm} />
            <div className={styles.Maindiv}>
                <div className={styles.headerWrapper}>
                    <h2 className={styles.heading}>Services Offered</h2>
                    <p className={styles.subheading}>Select the “Services You Offer” based on the Business Category</p>
                </div>
                <div className={styles.section}   >
                    <div className={styles.searchBox} ref={listRef}>
                        <span className={styles.searchIcon}>
                            <img src='svg/Search-Icon.svg' alt='Search icon' />
                        </span>
                        <input
                            type='text'
                            placeholder='Quick find Business type'
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={((e) => {
                                setTimeout(scrollListIntoView, 300);
                            })
                            }
                            onClick={() => {
                                setTimeout(scrollListIntoView, 300);
                            }}
                        />
                    </div>

                    <div className={styles.ListDiv}>
                        <div className={styles.optionList}>
                            {uniqueServices?.length > 0 ? (
                                uniqueServices?.filter((service) => service !== "Other").map((item, index) => (
                                    <label className={styles.option} key={index} ref={index === uniqueServices.length - 1 ? lastServiceRef : null}>
                                        <div className={styles.forflex}>
                                            <div className={styles.icon}>
                                                <img src={icon} alt={`${item} icon`} className={styles.iconImg} />
                                            </div>
                                            <div className={styles.strongDiv}>
                                                <strong>{item}</strong>
                                                {/* <p className={styles.subType}>{item}</p> */}
                                            </div>
                                        </div>

                                        <div>
                                            <input
                                                type='checkbox'
                                                name='businessType'
                                                checked={selectedService.includes(item)}
                                                // checked={
                                                //     selectedService?.includes(item) &&
                                                //     fetchBusinessType.businessType.toLowerCase() === filteredBusinessType?.type.toLowerCase()
                                                // }
                                                onChange={() => {
                                                    if (selectedService?.length >= 0) {
                                                        setEmptyListError('')
                                                    }
                                                    if (selectedService.includes(item)) {
                                                        setSelectedServices(selectedService.filter(s => s !== item));
                                                    } else {
                                                        setSelectedServices([...selectedService, item]);
                                                    }
                                                }}
                                                className={styles.purpleCheckbox}
                                            />
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <div className={styles.noResult}>No results found</div>
                            )}

                        </div>
                    </div>
                    {isEmptyListError && <span style={{ color: 'Red' }}>{isEmptyListError}</span>}

                    <div className={styles.addMore}>
                        <input
                            type='checkbox'
                            name='businessType'
                            id='businessType'
                            checked={isAddMoreChecked}
                            className={styles.purpleCheckbox}
                            onChange={() => setIsAddMoreChecked((prev) => !prev)}
                        />
                        <label htmlFor='businessType'> <p>Add More Services(Not on Above List)</p></label>
                    </div>
                    {isAddMoreChecked &&
                        <div className={styles.wrapper}>
                            <label className={styles.label}>Service Name</label>
                            <div className={styles.inputContainer}>
                                <input
                                    type="text"
                                    placeholder="Enter your service name"
                                    className={styles.input}
                                    value={newService}
                                    onChange={(e) => setNewService(e.target.value)}

                                />
                                <button className={styles.addButton}>
                                    <img src='/svg/addMore-icon.svg' alt='addMore-icon' onClick={handleAddService} />
                                </button>
                            </div>
                        </div>
                    }
                    <div className={styles.stickyWrapper}
                        // onClick={handleContinue}
                        style={{
                            position: "sticky",
                            bottom: 0,
                            backgroundColor: "white",
                            padding: "8px",
                            opacity: isChanged ? 1 : 0.5,
                            cursor: isChanged ? "pointer" : "not-allowed"
                        }}
                        onClick={isChanged ? handleContinue : undefined}>

                        <AnimatedButton label="Save" isLoading={Loading} position={{ position: "relative" }} disabled={!isChanged} />
                    </div>
                </div>
                {showPopup && (
                    <PopUp
                        type={popupType}
                        onClose={() => { setShowPopup(false); navigate(-1) }}
                        message={popupMessage}
                        onConfirm={() => navigate('/edit-services-offered')}
                    />
                )}
            </div>
        </>
    )
}

export default EditServicesOffered
