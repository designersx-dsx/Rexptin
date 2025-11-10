import { countAgentsbyUserId } from "../Store/apiStore";

const getKnowledgeBaseName = async (
  business,
  userId,
  packageValue,
  agentCode
  //   fetchAgentCount // this should call your backend API and return just the count
) => {
  const sanitize = (str) =>
    String(str || "")
      .trim()
      .replace(/\s+/g, "_");
  const businessTypes = [
    { name: "Restaurant", code: "rest" },
    { name: "Bakery", code: "bake" },
    { name: "Deli shop", code: "deli" },
    { name: "Real Estate Broker", code: "rea_est_bro" },
    { name: "Property Rental & Leasing Service", code: "prop_ren_lea" },
    { name: "Architect", code: "arch" },
    { name: "Interior Designer", code: "int_des" },
    { name: "Construction Services", code: "con_ser" },
    { name: "Landscaping Company", code: "land_com" },
    { name: "Doctor's Clinic", code: "doct_cli" },
    { name: "Dentist", code: "dent_off" },
    { name: "Old Age Home", code: "old_age" },
    { name: "Gym & Fitness Center", code: "gym_fit" },
    { name: "Personal Trainer", code: "per_tra" },
    { name: "Insurance Agency", code: "ins_age" },
    { name: "Accounting Services", code: "acc_ser" },
    { name: "Financial Planners", code: "fin_pla" },
    { name: "Travel Agency", code: "trav_age" },
    { name: "Ticket Booking", code: "tick_boo" },
    { name: "Tour Guides", code: "tour_gui" },
    { name: "Beauty Parlour", code: "bea_par" },
    { name: "Nail Saloon", code: "nai_sal" },
    { name: "Saloon", code: "sal" },
    { name: "Barber Studio/Shop", code: "barb" },
    { name: "Hair Stylist", code: "hai_sty" },
    { name: "Dry Cleaner", code: "dry_cle" },
    { name: "Cleaning/Janitorial Service", code: "clea_jan_ser" },
    { name: "Web Design Agency", code: "web_des_age" },
    { name: "Marketing Agency", code: "mkt_age" },
    { name: "Digital Marketing Agency", code: "dgi_mkt_ag" },
    { name: "Car & Bus Services", code: "car_bus_ser" },
    { name: "Taxi, Cab & Limo Booking", code: "tax_cab_limo" },
    { name: "Movers & Packers", code: "mov_pac" },
    { name: "Trucking Company", code: "truc_com" },
    { name: "Car Repair & Garage", code: "car_rep" },
    { name: "Boat Repair & Maintenance", code: "boa_rep" },
    { name: "Spa & Wellness Center", code: "spa_wel" },
    { name: "Print Shop", code: "pri_sho" },
    { name: "School", code: "scho" },
    { name: "Colleges & Universities", code: "coll" },
    { name: "Training Center", code: "tra_ce" },
    { name: "Educational Institute", code: "edu_ins" },
    { name: "Other", code: "Other" }
  ];
  let agentCount = 0;
  try {
    // 1. Fetch agent count from server
    agentCount = await countAgentsbyUserId(userId);

  } catch (error) {
    console.error("Error generating knowledgeBaseName:", error);
    return null;
  }

  // 2. Match business type
  const matchedBusiness = businessTypes.find(
    (item) => item?.name === business?.businessType
  );

  const businessCode = matchedBusiness
    ? matchedBusiness.code
    : sanitize(business?.customBuisness || "oth");

  // 3. Prepare name parts



  return `${businessCode}_${userId}_${agentCode}_#${(agentCount + 1)}`;

};

export default getKnowledgeBaseName;
