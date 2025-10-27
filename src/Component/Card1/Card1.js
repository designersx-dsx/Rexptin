import React from 'react'
import styles from '../Card1/Card1.module.css'

const Card1 = ({ data }) => {
    // console.log(data, "data")
 const formatServices = (services) => {
  if (typeof services === 'string') {
    try {
      return JSON.parse(services); // will return array if it's JSON string
    } catch (e) {
      return services; // fallback to string if not JSON
    }
  }
  return services;
};

    return (
        <div className={styles.CardMain}>
            <h2 className={styles.title}>Business Details</h2>
            <div className={styles.MoreDetails}>

                <h3>More Details</h3>

                {/* <div className={styles.details}>
                    <p className={styles.Ptext}>Company</p>
                    <div className={styles.rightpart}>
                        <strong>Gym</strong>
                    </div>
                </div> */}
                <div className={styles.details}>
                    <p className={styles.Ptext}>Employees</p>
                    <div className={styles.rightpart}>
                        <strong>{data?.businessSize} </strong>
                    </div>
                </div>
                <div className={styles.details}>
                    <p className={styles.Ptext}>Categories</p>
                    <div className={styles.rightpart}>
                        <strong>{data?.businessType
                        }</strong>
                    </div>
                </div>

                {/* <div className={styles.details}>
                    <p className={styles.Ptext}>Phone</p>
                    <div className={styles.rightpart}>
                        <strong>+91 9874XXXX88</strong>
                    </div>
                </div> */}
                <div className={styles.details}>
                    <p className={styles.Ptext}>Services</p>
                    <div className={styles.rightpart}>
                        <div className={styles.rightpart}>
                            {Array.isArray(formatServices(data?.buisnessService))
                                ? formatServices(data?.buisnessService).map((service, index) => (
                                    <strong key={index} className={styles.capsul}>
                                        {service}
                                    </strong>
                                ))
                                : 
                                <strong className={styles.capsul}>{formatServices(data?.buisnessService)}</strong>
                                
                                }
                        </div>
                    </div>
                </div>
                {/* <div className={styles.About}>
                    <h3>About My business</h3>
                    <p>Customer inquired about product availability and pricing. Agent provided detailed information and offered a discount.</p>
                </div> */}
            </div>
        </div>
    )
}

export default Card1
