import React from 'react'
import styles from '../BillingInvoices/BillingInvoices.module.css'

const BillingInvoices = ({ invoices }) => {
  //     const data = [
  //   {
  //     id: 1,
  //     time: '12:06pm',
  //     date: '28 May 2025',
  //     amount: '$119',
  //   },
  //   {
  //     id: 2,
  //     time: '11:06 am',
  //     date: '05 Apr 2025',
  //     amount: '$299',
  //   },
  //   {
  //     id: 3,
  //     time: '01:15 pm',
  //     date: '01 May 2025',
  //     amount: '$119',
  //   },
  // ];

// fd
  if (!invoices || invoices.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Billing & Invoices</h3>
        <p className={styles.noData}>No invoices found.</p>
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

  const data = invoices
    .filter((invoice) => invoice.status !== "canceled")
    .map((invoice) => ({
      id: invoice.id,
      time: new Date(invoice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(invoice.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }),
      amount: invoice?.plan_unit_amount != null && invoice?.plan_unit_amount >=1
        ? `${invoice?.plan_currency?.toUpperCase()} ${invoice?.plan_unit_amount}`
        : "PAYG",
      invoice_url: invoice.invoice_url,
    }));

  // const handleDownload = async (url, fileName) => {
  //   try {
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         // Add any necessary headers, e.g., Authorization if required
  //       },
  //     });
  //     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  //     const blob = await response.blob();
  //     const link = document.createElement("a");
  //     link.href = window.URL.createObjectURL(blob);
  //     link.download = fileName;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(link.href);
  //   } catch (err) {
  //     console.error("Download failed:", err);
  //     alert("Failed to download invoice. Please try again.");
  //   }
  // };

  //  console.log('invoices', data)
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Billing & Invoices</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>S.no</th>
            <th>Invoice Date</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((invoice, index) => (
            <tr key={index}>
              <td>{String(index + 1).padStart(2, '0')}</td>
              <td>
                <div className={styles.dateCell}>
                  <span className={styles.time}>{invoice.time}</span>
                  <br />
                  <span className={styles.date}>{invoice.date}</span>
                </div>
              </td>
              <td>
                <span className={styles.amount}>{invoice.amount}</span>
              </td>
              <td>
                <div className={styles.actionIcon}>
                  <a
                    href={invoice.invoice_url}
                    download={`${invoice.id}.pdf`} // ✅ Custom filename
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionIcon}
                  >
                    <img src='/svg/download-invoice.svg' alt='download-invoice'
                    // onClick={() => handleDownload(invoice.invoice_url, `invoice-${invoice.id}.pdf`)}
                    />
                    {/* <img
                    src='/svg/download-invoice.svg'
                    alt='download-invoice'
                    onClick={() => handleDownload(invoice.invoice_url, `invoice-${invoice.id}.pdf`)}
                    style={{ cursor: 'pointer' }}
                  /> */}
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BillingInvoices
