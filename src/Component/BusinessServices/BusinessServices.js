import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "../BusinessServices/BusinessServices.module.css";
import { useNavigate } from "react-router-dom";
import { validateEmail as validateEmailAPI } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import axios from "axios";
import { API_BASE_URL } from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import Loader from "../Loader/Loader";
const BusinessServices = forwardRef(
  (
    {
      onNext,
      onBack,
      onValidationError,
      onSuccess,
      onFailed,
      setLoading,
      onStepChange,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const [businessType, setBusinessType] = useState("Restaurant");
    const [selectedService, setSelectedService] = useState([]);
    const [email, setEmail] = useState("");
    // Error states
    const [serviceError, setServiceError] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("");
    //Add More Custom Services
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [customServices, setCustomServices] = useState(() => {
      const saved = sessionStorage.getItem("customServices");
      return saved ? JSON.parse(saved) : [];
    });
    const [showPopup, setShowPopup] = useState(false);
    const EditingMode = localStorage.getItem("UpdationMode");
    const [customServiceSelected, setCustomServiceSelected] = useState(false);
    const checkIfBusinessIdExist = Boolean(sessionStorage.getItem("bId"));
    const token = localStorage.getItem("token");
    const decodeTokenData = decodeToken(token);
    const userId = decodeTokenData?.id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollToBottomRef = useRef(null);

    const businessServices = [
      {
        type: "Restaurant",
        subtype: "Food Service Establishment",
        icon: "svg/Restaurant-icon.svg",
        services: [
          "Dine-in Service",
          "Takeaway Orders",
          "Home Delivery",
          "Event Catering",
          "Online Ordering",
          "Other",
        ],
      },
      {
        type: "Real Estate Broker",
        subtype: "Property Transaction Facilitator",
        icon: "svg/Estate-icon.svg",
        services: [
          "Property Sales",
          "Property Rentals",
          "Property Viewings",
          "Price Valuation",
          "Legal Help",
          "Other",
        ],
      },
      {
        type: "Salon",
        subtype: "Hair Styling & Grooming",
        icon: "svg/Saloon-icon.svg",
        services: [
          "Haircuts",
          "Hair Spa Treatments",
          "Hair Straightening",
          "Nail Extensions",
          "Facials",
          "Other",
        ],
      },
      {
        type: "Doctor's Clinic",
        subtype: "Medical Consultation & Treatment",
        icon: "svg/Doctor-clinic-icon.svg",
        services: [
          "General Checkups",
          "Specialist Consultations",
          "Vaccinations",
          "Blood Tests",
          "Health Screenings",
          "Other",
        ],
      },
      {
        type: "Dry Cleaner",
        subtype: "Garment Cleaning & Care",
        icon: "svg/Dry -Cleaner-icon.svg",
        services: [
          "Garment Cleaning",
          "Stain Removal",
          "Clothing Alterations",
          "Leather & Suede Cleaning",
          "Other",
        ],
      },
      {
        type: "Web Design Agency",
        subtype: "Website Creation & Development",
        icon: "svg/Web-Design-Agency-icon.svg",
        services: [
          "Website Creation",
          "Responsive Design",
          "SEO Services",
          "Website Maintenance",
          "E-commerce Setup",
          "Other",
        ],
      },
      {
        type: "Gym & Fitness Center",
        subtype: "Exercise Facility & Training",
        icon: "svg/Gym-icon.svg",
        services: [
          "Group Fitness Classes",
          "Weight Training Equipment",
          "Cardio Workouts",
          "Personal Training Sessions",
          "Other",
        ],
      },
      {
        type: "Marketing Agency",
        subtype: "Business Promotion Strategies",
        icon: "svg/Marketing Agency.svg",
        services: [
          "Social Media Advertising",
          "Content Creation",
          "Email Marketing",
          "PPC Ads",
          "Branding Strategy",
          "Other",
        ],
      },
      {
        type: "Digital Marketing Agency",
        subtype: "Business Promotion Strategies",
        icon: "svg/Digital-marketing-Agency.svg",
        services: [
          "Search Engine Optimization (SEO)",
          "Pay-Per-Click (PPC) Advertising",
          "Social Media Marketing",
          "Content Marketing",
          "Email Marketing",
          "Influencer Marketing",
          "Video Marketing",
          "Conversion Rate Optimization (CRO)",
          "Web Design & Development",
          "Branding & Strategy",
          "Analytics & Reporting",
          "Other",
        ],
      },
      {
        type: "Personal Trainer",
        subtype: "Individual Fitness Coaching",
        icon: "images/other.png",
        services: [
          "Personalized Workout Plans",
          "One-on-One Training",
          "Nutrition Guidance",
          "Fitness Assessments",
          "Other",
        ],
      },
      {
        type: "Architect",
        subtype: "Building Design Expert",
        icon: "svg/Architect-icon.svg",
        services: [
          "Residential Building Design",
          "Commercial Building Plans",
          "Renovation Planning",
          "Permit Drawings",
          "Site Planning",
          "Project Management",
          "Other",
        ],
      },
      {
        type: "Interior Designer",
        subtype: "Indoor Space Beautifier",
        icon: "images/other.png",
        services: [
          "Space Planning",
          "Furniture Selection",
          "Color Consultation",
          "Lighting Design",
          "Home Makeovers",
          "Other",
        ],
      },
      {
        type: "Construction Services",
        subtype: "Building Construction & Repair",
        icon: "svg/Construction Services.svg",
        services: [
          "New Building Construction",
          "Home Renovations",
          "Project Supervision",
          "Structural Repairs",
          "Other",
        ],
      },
      {
        type: "Cleaning and Janitorial Services",
        subtype: "Building Construction & Repair",
        icon: "images/other.png",
        services: [
          "Office Cleaning",
          "Deep Carpet Cleaning",
          "Window Washing",
          "Floor Polishing",
          "Regular Maintenance",
          "Other",
        ],
      },
      {
        type: "Transport Company",
        subtype: "Freight Transportation Services",
        icon: "images/other.png",
        services: [
          "Freight Shipping",
          "Passenger Transport",
          "Courier Services",
          "Vehicle Rentals",
          "Logistics Management",
          "Other",
        ],
      },
      {
        type: "Landscaping Company",
        subtype: "Outdoor Space Beautification",
        icon: "images/other.png",
        services: [
          "Lawn Mowing & Maintenance",
          "Garden Design",
          "Tree Pruning & Removal",
          "Irrigation Installation",
          "Other",
        ],
      },
      {
        type: "Insurance Agency",
        subtype: "Risk Protection Provider",
        icon: "svg/Insurance Agency.svg",
        services: [
          "Life Insurance",
          "Health Insurance",
          "Car Insurance",
          "Home Insurance",
          "Business Insurance",
          "Other",
        ],
      },
      {
        type: "Financial Services",
        subtype: "Wealth Management Advice",
        icon: "images/other.png",
        services: [
          "Investment Planning",
          "Tax Preparation",
          "Retirement Planning",
          "Wealth Management",
          "Loan Consulting",
          "Other",
        ],
      },
      {
        type: "Accounting Services",
        subtype: "Financial Record Management",
        icon: "svg/Accounting Services.svg",
        services: [
          "Bookkeeping",
          "Tax Filing",
          "Payroll Services",
          "Financial Auditing",
          "Business Financial Reports",
          "Other",
        ],
      },
      {
        type: "Boat Repair & Maintenance",
        subtype: "Watercraft Upkeep & Repair",
        icon: "images/other.png",
        services: [
          "Hull Repair",
          "Engine Maintenance",
          "Electrical System Repairs",
          "Boat Cleaning",
          "Winterizing Services",
          "Other",
        ],
      },
      {
        type: "Dentist",
        subtype: "Dental Care Provider",
        icon: "images/other.png",
        services: [
          "Teeth",
          "Cleaning",
          "Teeth Whitening",
          "Braces & Aligners",
          "Root Canal",
          "Tooth Extraction",
          "Other",
        ],
      },
      {
        type: "Property Rental & Leasing Service",
        subtype: "Property Rental Management",
        icon: "svg/Property Rental & Leasing Service.svg",
        services: [
          "Tenant Screening",
          "Lease Agreement Preparation",
          "Rent Collection",
          "Property Maintenance Coordination",
          "Other",
        ],
      },
      {
        type: "Old Age Home",
        subtype: "Senior Living Facility",
        icon: "svg/Old Age Home.svg",
        services: [
          "Assisted Living",
          "Meal Services",
          "Housekeeping & Laundry",
          "Recreational Activities",
          "Physiotherapy",
          "Emergency Support",
          "Other",
        ],
      },
      {
        type: "Travel Agency",
        subtype: "Trip Planning & Booking",
        icon: "svg/Travel Agency.svg",
        services: [
          "Flight Booking",
          "Hotel Reservations",
          "Holiday Packages",
          "Visa Assistance",
          "Travel Insurance",
          "Customized Itineraries",
          "Cruise Bookings",
          "Local Tours & Sightseeing",
          "Car Rentals",
          "Other",
        ],
      },
      {
        type: "Ticket Booking",
        subtype: "Travel Ticket Provider",
        icon: "svg/Ticket Booking.svg",
        services: [
          "Flight Tickets",
          "Train Tickets",
          "Bus Tickets",
          "Movie Tickets",
          "Event Tickets",
          "Amusement Park Tickets",
          "Concert & Show Tickets",
          "Sports Tickets",
          "Other",
        ],
      },
      {
        type: "Financial Planners",
        subtype: "Wealth Management Advice",
        icon: "svg/Financial Planners.svg",
        services: [
          "Retirement Planning",
          "Investment Portfolio Management",
          "Tax Planning",
          "Budgeting & Expense Management",
          "Estate Planning",
          "Insurance Planning",
          "Education Planning",
          "Debt Management",
          "Other",
        ],
      },
      {
        type: "Beauty Parlour",
        subtype: "Cosmetic Beauty Services",
        icon: "svg/Beauty Parlour.svg",
        services: [
          "Hair Cutting & Styling",
          "Facials & Cleanups",
          "Manicure & Pedicure",
          "Bridal Makeup",
          "Hair Coloring & Highlights",
          "Waxing & Threading",
          "Skin Treatments",
          "Makeup for Events",
          "Spa & Massage Services",
          "Other",
        ],
      },
      {
        type: "Nail Salon",
        subtype: "Manicure/Pedicure Services",
        icon: "svg/Nail Saloon.svg",
        services: [
          "Manicure",
          "Pedicure",
          "Nail Art",
          "Gel Nails",
          "Acrylic Nails",
          "Nail Extensions",
          "Cuticle Care",
          "Nail Repair & Removal",
          "Hand & Foot Spa",
          "Other",
        ],
      },
      {
        type: "Barber Studio/Shop",
        subtype: "Men's Hair Grooming",
        icon: "svg/Barber.svg",
        services: [
          "Haircut",
          "Beard Trimming & Styling",
          "Shaving & Grooming",
          "Hair Coloring",
          "Head Massage",
          "Facial for Men",
          "Scalp Treatment",
          "Hair Wash & Styling",
          "Kids Haircut",
          "Other",
        ],
      },
      {
        type: "Hair Stylist",
        subtype: "Professional Hair Care",
        icon: "svg/Hair Stylist.svg",
        services: [
          "Hair Cutting & Trimming",
          "Hair Styling",
          "Blow Dry & Ironing",
          "Hair Coloring & Highlights",
          "Hair Spa",
          "Keratin & Smoothening Treatments",
          "Hair Extensions",
          "Scalp Treatments",
          "Bridal & Occasion Hairstyles",
          "Other",
        ],
      },
      {
        type: "Bakery",
        subtype: "Baked Goods Producer",
        icon: "svg/Bakery.svg",
        services: [
          "Custom Cakes",
          "Birthday & Wedding Cakes",
          "Pastries & Cupcakes",
          "Cookies & Biscuits",
          "Bread & Buns",
          "Chocolates & Desserts",
          "Eggless & Sugar-Free Items",
          "Bulk & Party Orders",
          "Online Ordering & Delivery",
          "Other",
        ],
      },
      {
        type: "Cleaning Janitorial Service",
        subtype: "Professional Cleaning Solutions",
        icon: "svg/Cleaning Janitorial Service.svg",
        services: [
          "Residential Cleaning",
          "Commercial Office Cleaning",
          "Deep Cleaning Services",
          "Move-In/Move-Out Cleaning",
          "Carpet & Upholstery Cleaning",
          "Window Cleaning",
          "Disinfection & Sanitization",
          "Post-Construction Cleaning",
          "Restroom Cleaning & Maintenance",
          "Other",
        ],
      },
      {
        type: "Tour Guides",
        subtype: "Travel Experience Curator",
        icon: "svg/Tour-Guides.svg",
        services: [
          "Guided City Tours",
          "Historical Site Tours",
          "Adventure and Nature Tours",
          "Cultural & Art Tours",
          "Food & Culinary Tours",
          "Wildlife & Eco Tours",
          "Photography Tours",
          "Private Custom Tours",
          "Other",
        ],
      },
      {
        type: "Deli Shop",
        subtype: "Fresh Meats & Gourmet Foods",
        icon: "svg/Deli Shop.svg",
        services: [
          "Fresh Cut Meats",
          "Artisanal Cheeses",
          "Gourmet Sandwiches",
          "Prepared Salads & Sides",
          "Imported & Local Delicacies",
          "Cured Meats & Cold Cuts",
          "Ready-to-Eat Meals",
          "Bakery Items",
          "Specialty Beverages",
          "Custom Deli Platters",
          "Other",
        ],
      },
      {
        type: "Dry Cleaners",
        subtype: "Garment Cleaning & Care",
        icon: "svg/Dry Cleaner.svg",
        services: [
          "Regular Garment Dry Cleaning",
          "Suit & Blazer Cleaning",
          "Wedding Dress Cleaning",
          "Delicate Fabric Care (Silk, Wool, etc.)",
          "Stain Removal Services",
          "Curtains & Drapes Cleaning",
          "Carpet & Rug Cleaning",
          "Blankets & Quilts Cleaning",
          "Steam Ironing & Pressing",
          "Leather & Suede Cleaning",
          "Pickup & Delivery Service",
          "Express / Same-Day Cleaning",
          "Eco-Friendly Cleaning",
          "Other",
        ],
      },
      {
        type: "Car Repair & Garage",
        subtype: "Quality Repairs, Every Time",
        icon: "svg/Car Repair & Garage.svg",
        services: [
          "General Car Servicing",
          "Engine Diagnostics & Repair",
          "Brake Inspection & Repair",
          "Oil Change & Filter Replacement",
          "Battery Check & Replacement",
          "AC Repair & Gas Refill",
          "Suspension & Steering Repair",
          "Wheel Alignment & Balancing",
          "Tire Rotation & Replacement",
          "Clutch & Transmission Services",
          "Car Washing & Detailing",
          "Bodywork & Painting",
          "Accidental Repair Services",
          "Windshield & Glass Repair",
          "Pickup & Drop-off Service",
          "24/7 Emergency Roadside Assistance",
          "Pre-Purchase Car Inspection",
          "Insurance Claim Assistance",
          "Other",
        ],
      },
      {
        type: "Boat Repair",
        subtype: "Marine Care & Repair Experts",
        icon: "svg/Boat Repair & Maintenance.svg",
        services: [
          "Engine Diagnostics & Repairs",
          "Hull Cleaning & Polishing",
          "Fiberglass & Gelcoat Repair",
          "Electrical System Inspection",
          "Boat Painting & Detailing",
          "Propeller & Shaft Repair",
          "Bilge Pump Service",
          "Navigation System Maintenance",
          "Fuel System Inspection",
          "Winterizing & De-winterizing",
          "Trailer Repair & Maintenance",
          "Custom Modifications",
          "On-Site Repair Services",
          "Other",
        ],
      },
      {
        type: "Car & Bus Services",
        subtype: "Quality Repairs, Every Time",
        icon: "svg/Car Repair & Garage.svg",
        services: [
          "Engine Diagnostics & Repairs",
          "Brake Inspection & Replacement",
          "Oil Change & Filter Replacement",
          "Battery Check & Replacement",
          "Transmission Service & Repair",
          "Suspension & Steering Services",
          "AC & Heating System Repair",
          "Electrical System Troubleshooting",
          "Tire Rotation & Wheel Alignment",
          "Exhaust System Repair",
          "Fuel Injection Cleaning",
          "Coolant System Flush & Repair",
          "Bus Fleet Maintenance",
          "Roadside Assistance & Towing",
          "Preventive Maintenance Plans",
          "Other",
        ],
      },
      {
        type: "Taxi, Cab & Limo Booking",
        subtype: "Reliable Rides, Anytime, Anywhere",
        icon: "svg/Taxi.svg",
        services: [
          "Local Taxi Booking",
          "Outstation Cab Services",
          "Airport Pickup & Drop",
          "Corporate Cab Services",
          "Hourly Limo Rentals",
          "Luxury Car Chauffeur",
          "Event Transportation",
          "24/7 Cab Availability",
          "One-Way & Round Trips",
          "Shared Ride Services",
          "Other",
        ],
      },
      {
        type: "Movers and Packers",
        subtype: "Safe & Hassle-Free Relocation Services",
        icon: "svg/Movers and Packers.svg",
        services: [
          "Home Shifting",
          "Office Relocation",
          "Local & Domestic Moving",
          "Packing & Unpacking Services",
          "Loading & Unloading",
          "Furniture Dismantling & Assembly",
          "Vehicle Transportation",
          "Storage & Warehousing",
          "International Relocation",
          "Fragile Item Handling",
          "Other",
        ],
      },
      {
        type: "Trucking Company",
        subtype: "Efficient Freight & Logistics Solutions",
        icon: "svg/Trucking Company.svg",
        services: [
          "Long-Haul Trucking",
          "Local & Regional Deliveries",
          "Refrigerated Trucking",
          "Flatbed Trucking",
          "Heavy Equipment Transportation",
          "Interstate Cargo Transport",
          "Logistics & Freight Management",
          "24/7 Shipment Tracking",
          "Other",
        ],
      },
      {
        type: "Spa & Wellness Center",
        subtype: "Relaxation & Health Services",
        icon: "svg/Hair Stylist.svg",
        services: [
          "Swedish Massage",
          "Deep Tissue Massage",
          "Hot Stone Massage",
          "Aromatherapy Massage",
          "Couples Massage",
          "Classic/Custom Facial",
          "Deep-Cleansing (Acne) Facial",
          "Body Scrub / Exfoliation",
          "Detox or Hydrating Body Wrap",
          "Waxing (Face/Body)",
          "Other",
        ],
      },
       {
      type: "Print Shop",
      subtype: "Your Printing Solutions Partner",
      icon: "svg/Hair Stylist.svg",
      services: [
        "Business Cards",
        "Flyers & Brochures",
        "Posters & Banners",
        "Custom T-Shirts",
        "Photo Printing",
        "Booklets & Catalogs",
        "Invitations & Greeting Cards",
        "Stickers & Labels",
        "Large Format Printing",
        "Other",
      ],
    },
     {
      type: "School",
      subtype: "Education for a Brighter Future",
      icon: "svg/Hair Stylist.svg",
      services: [
        "Primary Education",
        "Secondary Education",
        "STEM Programs",
        "Arts & Humanities",
        "Sports & Extracurriculars",
        "Special Education",
        "Language Courses",
        "Online Learning",
        "After-School Programs",
        "Other",
      ],
    },
     {
      type: "Colleges & Universities",
      subtype: "Higher Learning Institution",
      icon: "svg/Hair Stylist.svg",
      services: [
        "Undergraduate Programs",
        "Graduate Programs",
        "Professional Degrees",
        "Online Courses",
        "Research Opportunities",
        "Internships & Co-ops",
        "Study Abroad Programs",
        "Student Support Services",
        "Extracurricular Activities",
        "Other",
      ],
    },
     {
      type: "Training Center",
      subtype: "Skill Development Hub",
      icon: "svg/Hair Stylist.svg",
      services: [
        "Technical Skills Training",
        "Soft Skills Development",
        "Certification Programs",
        "Workshops & Seminars",
        "Online Learning Modules",
        "Corporate Training Solutions",
        "Career Counseling",
        "Internship Placement",
        "Other",
      ],
    },
     {
      type: "Educational Institute",
      subtype: "Knowledge Empowerment Center",
      icon: "svg/Hair Stylist.svg",
      services: [
        "Academic Programs",
        "Vocational Training",
        "Research & Development",
        "Community Education",
        "Online Learning Platforms",
        "Student Support Services",
        "Extracurricular Activities",
        "Other",
      ],
    }
    ];
    const [searchTerm, setSearchTerm] = useState("");
    // const selectedBusiness = businessServices?.find(
    //   (biz) => biz?.type === businessType
    // );
    const selectedBusiness =
      businessServices.find((biz) => biz?.type === businessType) ||
      (businessType === "Other" &&
        businessServices?.find((biz) => biz?.type === "Other Local Business"));
    const defaultServices = selectedBusiness?.services || [];
    const allServices = [...defaultServices, ...customServices];
    const flatServices = allServices.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (typeof item === "object" && Array.isArray(item.services)) {
        return item.services;
      }
      return []; // skip invalid entries
    });

    const filteredServices = flatServices.filter(
      (service) =>
        typeof service === "string" &&
        service.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContinue = async () => {
      if (isSubmitting) return; // Prevent double call
      setIsSubmitting(true);
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
        email,
      };
      sessionStorage.setItem(
        "businesServices",
        JSON.stringify(updatedBusinessServices)
      );
      const businessDetailsRaw = sessionStorage.getItem("businessDetails");
      const businessDetails = businessDetailsRaw
        ? JSON.parse(businessDetailsRaw)
        : {};

      const finalBusinessDetails = {
        ...businessDetails,
        selectedService,
        email,
      };

      sessionStorage.setItem(
        "businessDetails",
        JSON.stringify(finalBusinessDetails)
      );
      sessionStorage.setItem(
        "selectedServices",
        JSON.stringify(selectedService)
      );
      try {
        setLoading(true);
        const API_URL = checkIfBusinessIdExist
          ? `${API_BASE_URL}/businessDetails/updateBusinessDetailsByUserIDandBuisnessID/${
              decodeToken(localStorage.getItem("token")).id
            }?businessId=${sessionStorage.getItem("bId")}`
          : `${API_BASE_URL}/businessDetails/create`;
        const response = await axios({
          method: checkIfBusinessIdExist ? "PATCH" : "POST",
          url: API_URL,
          data: {
            userId: decodeToken(localStorage.getItem("token")).id,
            businessName: finalBusinessDetails.businessName,
            businessSize: finalBusinessDetails.businessSize,
            businessType: finalBusinessDetails.businessType,
            customBuisness: finalBusinessDetails.customBuisness || "",
            buisnessEmail: email,
            buisnessService: selectedService,
            customServices: [],
          },
        });

        const id = response?.data?.record?.businessId;
        if (!checkIfBusinessIdExist) {
          sessionStorage.setItem("AgentCode", response?.data?.agentCode);
        }
        if (id) {
          sessionStorage.setItem("bId", id);
          sessionStorage.setItem(
            "businessId",
            JSON.stringify({ businessId: id })
          );
        }
        if (onSuccess && !checkIfBusinessIdExist) {
          onSuccess({
            message: "Business details saved successfully",
          });
        }
        setTimeout(() => {
          onStepChange?.(3);
        }, 1000);
      } catch (error) {
        console.error("❌ Error saving business details:", error);
        if (onFailed) {
          onFailed({
            message: "Failed to save business details.",
          });
        }
      } finally {
        setLoading(false);
        setIsSubmitting(false); // Allow retry
      }
    };
    const handleServiceToggle = (service) => {
      const updated = selectedService.includes(service)
        ? selectedService.filter((s) => s !== service)
        : [...selectedService, service];

      setSelectedService(updated);
      setServiceError("");
      setCustomServiceSelected(updated.includes("Other"));

      //  Always store it under `selectedService` key
      const previous = JSON.parse(
        sessionStorage.getItem("businesServices") || "{}"
      );
      sessionStorage.setItem(
        "businesServices",
        JSON.stringify({
          ...previous,
          selectedService: updated,
          email,
        })
      );
    };
    //Using Error Handling
    useImperativeHandle(ref, () => ({
      validate: async () => {
        let hasError = false;
        if (!selectedService || selectedService.length === 0) {
          onValidationError?.({
            type: "failed",
            message: "Please select at least one service.",
          });
          hasError = true;
        }
        return !hasError;
      },
      save: async () => {
        await handleContinue();
      },
    }));
    //Add More Services Functionlaity ;
    const businessDetails = JSON.parse(
      sessionStorage.getItem("businessDetails")
    );
    const businesServices = JSON.parse(
      sessionStorage.getItem("businesServices")
    );

    const servicesType = Object?.values(businesServices)?.filter(
      (val) => typeof val === "string" && val !== "" && val !== "email"
    );
    console.log("Test",businesServices)
    const handleAddService = () => {
      if (inputValue.trim()) {
        const newServiceName = inputValue.trim();

        const newService = {
          type: "Other Local Business",
          subtype: "Your Journey Begins Here",
          icon: "images/other.png",
          services: [newServiceName],
        };

        const updatedCustomServices = [...customServices, newService];
        const updatedSelectedServices = [...selectedService, newServiceName];

        setCustomServices(updatedCustomServices);
        setSelectedService(updatedSelectedServices);

        sessionStorage.setItem(
          "customServices",
          JSON.stringify(updatedCustomServices)
        );
        sessionStorage.setItem(
          "businesServices",
          JSON.stringify({
            selectedService: updatedSelectedServices,
            email,
          })
        );

        setInputValue("");
        scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };
    useEffect(() => {
      sessionStorage.setItem("customServices", JSON.stringify(customServices));
    }, [customServices]);
    useEffect(() => {
      const savedCustom = sessionStorage.getItem("customServices");
      const savedSelected = sessionStorage.getItem("businesServices");

      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        setCustomServices(parsed);

        const newCustomServiceStrings = parsed.flatMap((item) => item.services);

        setSelectedService((prev) => {
          const combined = [...new Set([...prev, ...newCustomServiceStrings])];
          return combined;
        });
      }

      if (savedSelected) {
        try {
          const parsed = JSON.parse(savedSelected);
          if (Array.isArray(parsed)) {
            // Fix malformed format
            sessionStorage.setItem(
              "businesServices",
              JSON.stringify({ selectedService: parsed })
            );
            setSelectedService(parsed);
          } else if (parsed?.selectedService) {
            setSelectedService(parsed.selectedService);
          }
        } catch (e) {
          console.error("Error restoring selected services:", e);
        }
      }
    }, []);
    useEffect(() => {
      const savedShowInput = sessionStorage.getItem("showInput");
      if (savedShowInput !== null) {
        setShowInput(JSON.parse(savedShowInput));
      }
    }, []);
    useEffect(() => {
      if (businessDetails?.businessType === "Other") {
        sessionStorage.setItem("showInput", JSON.stringify(true));
      }
    }, [businessDetails]);
    useEffect(() => {
      const businessDetails = JSON.parse(
        sessionStorage.getItem("businessDetails")
      );
      setBusinessType(businessDetails?.businessType);
    }, []);
    useEffect(() => {
      if (showInput && scrollToBottomRef?.current) {
        setTimeout(() => {
          scrollToBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }, [customServices]);
    //check is this webview or not
    const isAndroidApp = () =>
      /Android/i.test(navigator.userAgent) && window.ReactNativeWebView;
    const isIOSApp = () =>
      /iPhone|iPad|iPod/i.test(navigator.userAgent) && window.webkit;
    const handleFocus = (e) => {
      if (isAndroidApp() || isIOSApp()) {
        setTimeout(() => {
          // Method 1: Smooth scroll to element
          e.target.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    };
    return (
      <div className={styles.container} id="servies">
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <img src="svg/Search-Icon.svg" alt="Search icon" />
          </span>
          <input
            type="text"
            placeholder="Quick find Business services"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.ListDiv}>
          <div className={styles.optionList}>
            {filteredServices.length > 0 ? (
              filteredServices
                ?.filter((service) => service !== "Other")
                ?.map((service, index) => (
                  <label className={styles.option} key={index}>
                    <div className={styles.forflex}>
                      <div className={styles.icon}>
                        <img
                          src={selectedBusiness?.icon || "images/other.png"}
                          alt="service-icon"
                          className={styles.iconImg}
                        />
                      </div>
                      <div className={styles.strongDiv}>
                        <strong>{service}</strong>
                        <p className={styles.subType}>
                          {selectedBusiness?.subtype ||
                            "Your Journey Begins Here"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <input
                        type="checkbox"
                        name="service"
                        value={service}
                        checked={selectedService.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                      />
                    </div>
                  </label>
                ))
            ) : (
              <></>
            )}
            <div ref={scrollToBottomRef} style={{ height: 1 }} />
          </div>
          {filteredServices.length == 0 && (
            <p className={styles.notitem}>No item found</p>
          )}
        </div>
        {serviceError && (
          <p style={{ color: "red", marginTop: "5px" }}>{serviceError}</p>
        )}
        {/* Add More Custom Services */}
        <div className={styles.CallTransferMain1}>
          {/* Checkbox to toggle service input */}
          <div className={styles.headrPart}>
            <input
              type="checkbox"
              checked={showInput}
              id="add-more-services"
              onChange={(e) => {
                const checked = e.target.checked;
                setShowInput(checked);
                sessionStorage.setItem("showInput", JSON.stringify(checked));
              }}
            />
            <label htmlFor="add-more-services">Add More Services</label>
          </div>

          {/* Input + Add button (only when checkbox is checked) */}
          {showInput && (
            <div className={styles.card}>
              <label className={styles.label}>Service Name</label>
              <div className={styles.phoneInput}>
                <input
                  type="text"
                  className={styles.phoneNumberInput}
                  placeholder="Enter Your Service Name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleFocus}
                />
                <button
                  type="button"
                  className={styles.addIcon}
                  onClick={handleAddService}
                >
                  <img src="/svg/addMore-icon.svg" alt="addMore-icon" />
                </button>
              </div>
            </div>
          )}

          {/* Optional display of added services */}
          {/* {customServices.length > 0 && (
          <div className={styles.card}>
            <h4>Added Custom Services:</h4>
            <ul>
              {customServices.map((item, index) => (
                <li key={index}>
                  {item.services[0]} <small>({item.type})</small>
                </li>
              ))}
            </ul>
          </div>
        )} */}
        </div>

        {/* Show PopUp */}
        <PopUp
          type={popupType}
          message={popupMessage}
          onClose={() => setPopupMessage("")}
        />
      </div>
    );
  }
);

export default BusinessServices;
const cleanServiceArray = () => {
  try {
    let raw;
    if (localStorage.getItem("UpdationMode") != "ON") {
      raw = sessionStorage.getItem("businessDetails");
    } else {
      raw = raw = sessionStorage.getItem("businessDetails");
    }
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.selectedService)) {
      return parsed.selectedService;
    } else if (
      typeof parsed?.selectedService === "object" &&
      Array.isArray(parsed.selectedService.selectedService)
    ) {
      return parsed.selectedService.selectedService;
    }
    return [];
  } catch {
    return [];
  }
};
